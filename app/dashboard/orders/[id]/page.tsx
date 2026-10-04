'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Building,
  Package,
  Calendar,
  Clock,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  Plus,
  MapPin,
  FileText,
  Truck,
  Ship,
  Plane,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth, OrderRecord, OrderStatus, ClientRecord, ShipmentRecord } from '@/lib/auth-context';
import {
  getOrderById,
  updateOrder,
  deleteOrder,
  OrderFormData,
} from '@/lib/order-service';
import { getClientById } from '@/lib/client-service';
import { getUserShipments, createShipment, ShipmentFormData } from '@/lib/shipment-service';
import OrderModal from '@/components/OrderModal';
import ShipmentModal from '@/components/ShipmentModal';
import UpgradeModal from '@/components/UpgradeModal';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { user, loading: authLoading, demoLogin, signInWithGoogle } = useAuth();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [associatedShipment, setAssociatedShipment] = useState<ShipmentRecord | null>(null);
  const [allShipments, setAllShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (!user || !orderId) return;
    let isMounted = true;

    getUserSubscription(user.uid).then((sub) => {
      if (isMounted) setSubscription(sub);
    });

    getOrderById(user.uid, orderId)
      .then(async (orderData) => {
        if (!isMounted) return;
        if (!orderData) {
          setError('Order record not found in your private manifest database.');
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // Fetch client and shipments
        const [clientData, shipmentsList] = await Promise.all([
          getClientById(user.uid, orderData.clientId),
          getUserShipments(user.uid),
        ]);

        if (!isMounted) return;
        setClient(clientData);
        setAllShipments(shipmentsList);

        if (orderData.shipmentId) {
          const matchedShp = shipmentsList.find((s) => s.id === orderData.shipmentId);
          setAssociatedShipment(matchedShp || null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching order details:', err);
        if (isMounted) {
          setError('Failed to retrieve order details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user, orderId]);

  // Handle Edit Save
  const handleSaveEdit = async (formData: OrderFormData) => {
    if (!user || !order) return;
    await updateOrder(user.uid, order.id, formData);
    setOrder((prev) => (prev ? { ...prev, ...formData } : null));

    // If shipment was attached or updated, update local reference
    if (formData.shipmentId) {
      const match = allShipments.find((s) => s.id === formData.shipmentId);
      setAssociatedShipment(match || null);
    } else {
      setAssociatedShipment(null);
    }
    showToast(`Order "${formData.orderNumber || order.orderNumber}" updated.`);
  };

  // Handle Delete
  const handleDeleteOrder = async () => {
    if (!user || !order) return;
    setIsDeleting(true);
    try {
      await deleteOrder(user.uid, order.id);
      router.push('/dashboard/orders');
    } catch (err) {
      console.error('Error deleting order:', err);
      showToast('Failed to delete order.');
      setIsDeleting(false);
    }
  };

  // Handle Create Shipment for this Order
  const handleCreateShipmentForOrder = async (shipmentData: ShipmentFormData) => {
    if (!user || !order) return;
    const newShp = await createShipment(user.uid, {
      ...shipmentData,
      clientId: order.clientId,
      customer: order.clientName,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    // Link back to order
    await updateOrder(user.uid, order.id, {
      shipmentId: newShp.id,
      shipmentReference: newShp.referenceNumber,
      status: 'In Fulfillment',
    });

    setOrder((prev) =>
      prev
        ? {
            ...prev,
            shipmentId: newShp.id,
            shipmentReference: newShp.referenceNumber,
            status: 'In Fulfillment',
          }
        : null
    );
    setAssociatedShipment(newShp);
    showToast(`Shipment ${newShp.referenceNumber} linked to Order ${order.orderNumber}!`);
  };

  // Status Badge Helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Fulfillment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Verifying Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center p-4">
        <div className="bg-[#091322] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#00e5c9]/10 border border-[#00e5c9]/20 text-[#00e5c9] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">Sign In Required</h2>
            <p className="text-xs text-slate-400">
              Commercial order specifications are isolated within authenticated enterprise tenant partitions.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Continue with Google</span>
            </button>
            <Link
              href="/login"
              className="block w-full py-2.5 bg-[#0a182b] hover:bg-[#0f243f] text-[#00e5c9] border border-slate-700 font-bold text-xs rounded-xl shadow-lg transition-colors text-center"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Retrieving Order Dossier &amp; Relationships...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500">
            {error || 'Unable to locate this commercial order record.'}
          </p>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Order Reference
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {order.orderNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!order.shipmentId && (
            <button
              type="button"
              onClick={() => {
                const check = checkPlanLimit(subscription.tier, 'shipments', allShipments.length);
                if (!check.allowed) {
                  setLimitErrorMessage(check.message || 'Shipment capacity limit reached.');
                  setUpgradeModalOpen(true);
                  return;
                }
                setIsShipmentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Create Shipment</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Order</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            title="Delete Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Relationships Cross-Reference Header Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Associated Client Relationship */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Associated Client
                </span>
                <Link
                  href={`/dashboard/clients/${order.clientId}`}
                  className="font-extrabold text-slate-900 text-base hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <span>{order.clientName}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </Link>
                {client && (
                  <p className="text-xs text-slate-500">
                    Contact: {client.contactPerson} &bull; {client.phone}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={`/dashboard/clients/${order.clientId}`}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              View Client
            </Link>
          </div>

          {/* Associated Shipment Relationship */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Associated Shipment &amp; Waybill
                </span>
                {order.shipmentId ? (
                  <>
                    <Link
                      href={`/dashboard/shipments/${order.shipmentId}`}
                      className="font-mono font-extrabold text-slate-900 text-base hover:text-purple-600 transition-colors flex items-center gap-1"
                    >
                      <span>{order.shipmentReference || order.shipmentId}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                    </Link>
                    {associatedShipment && (
                      <p className="text-xs text-slate-500">
                        Status: <strong className="text-slate-800">{associatedShipment.status}</strong> &bull; {associatedShipment.mode} Freight
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 text-sm">No Shipment Dispatched Yet</p>
                    <p className="text-xs text-slate-400">Order is pending waybill dispatch.</p>
                  </div>
                )}
              </div>
            </div>

            {order.shipmentId ? (
              <Link
                href={`/dashboard/shipments/${order.shipmentId}`}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Track Shipment
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsShipmentModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Dispatch
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Order Specs & Line Items */}
          <div className="lg:col-span-8 space-y-6">
            {/* Order Description & Valuation Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Commodity &amp; Commercial Scope
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{order.title}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Total Valuation
                  </span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {order.currency} ${order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Routing & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Origin Hub / Departure
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{order.origin}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Destination Gateway
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{order.destination}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Order Booking Date
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.orderDate}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Delivery Deadline
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{order.deliveryDeadline || 'Open Schedule'}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-blue-700 uppercase tracking-wider font-bold block">
                    Commercial Terms &amp; Handling Instructions
                  </span>
                  <p className="text-slate-700 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Line Items Table Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Itemized Cargo Manifest ({order.items?.length || 0} line items)</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Valuation: ${order.totalAmount.toLocaleString()}
                </span>
              </div>

              {(!order.items || order.items.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  No line items detailed on this order.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f8fafc] text-slate-500 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider">
                        <th className="py-3 px-3 font-bold">Item Description</th>
                        <th className="py-3 px-3 font-bold text-center">Quantity</th>
                        <th className="py-3 px-3 font-bold text-right">Unit Price</th>
                        <th className="py-3 px-3 font-bold text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => {
                        const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-900 block">{item.description}</span>
                              {item.weight && (
                                <span className="text-[10px] text-slate-400 font-mono">Weight: {item.weight}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">
                              ${item.unitPrice?.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                              ${lineTotal.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Tracking & Status Snapshot */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Shipment Telematics Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Consignment Telematics</span>
              </h3>

              {associatedShipment ? (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-purple-700 uppercase tracking-wider block">
                      Waybill Number
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-sm">
                      {associatedShipment.referenceNumber}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Current Telematics Location
                    </span>
                    <p className="font-bold text-slate-800">
                      {associatedShipment.currentLocation || associatedShipment.origin}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Expected Arrival
                    </span>
                    <p className="font-bold text-slate-800">
                      {associatedShipment.expectedDeliveryDate || 'Scheduled in Transit'}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/shipments/${associatedShipment.id}`}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Open Live Tracking Timeline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-xs">Shipment Not Yet Dispatched</p>
                    <p className="text-[11px] text-slate-500">
                      Create and attach a shipment waybill to activate real-time telematics.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShipmentModalOpen(true)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Create &amp; Link Shipment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Order Modal */}
      {isEditModalOpen && (
        <OrderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
          initialData={order}
          clients={client ? [client] : []}
          shipments={allShipments}
        />
      )}

      {/* Create Shipment for Order Modal */}
      {isShipmentModalOpen && (
        <ShipmentModal
          isOpen={isShipmentModalOpen}
          onClose={() => setIsShipmentModalOpen(false)}
          onSave={handleCreateShipmentForOrder}
          clients={client ? [client] : []}
          defaultClientId={order.clientId}
          defaultCustomer={order.clientName}
          defaultHub={order.origin}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Delete Order Record?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete order <strong>{order.orderNumber}</strong>?
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                disabled={isDeleting}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Limit Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Shipment Capacity Limit Reached"
        message={limitErrorMessage}
        currentTier={subscription.tier}
      />
    </div>
  );
}
