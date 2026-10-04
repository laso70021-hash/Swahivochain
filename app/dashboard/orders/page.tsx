'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Building,
  Package,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Filter,
  FileText,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuth, OrderRecord, OrderStatus, ClientRecord, ShipmentRecord } from '@/lib/auth-context';
import {
  getUserOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  OrderFormData,
} from '@/lib/order-service';
import { getUserClients } from '@/lib/client-service';
import { getUserShipments } from '@/lib/shipment-service';
import OrderModal from '@/components/OrderModal';
import UpgradeModal from '@/components/UpgradeModal';
import { LogisticsInsightsModal } from '@/components/LogisticsInsightsModal';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';

export default function OrdersPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, demoLogin, signInWithGoogle } = useAuth();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load orders, clients, shipments, and subscription
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    Promise.all([
      getUserOrders(user.uid),
      getUserClients(user.uid),
      getUserShipments(user.uid),
      getUserSubscription(user.uid),
    ])
      .then(([ordersList, clientsList, shipmentsList, sub]) => {
        if (!isMounted) return;
        setOrders(ordersList);
        setClients(clientsList);
        setShipments(shipmentsList);
        setSubscription(sub);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching orders data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Order status badge styling
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

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        (o.shipmentReference && o.shipmentReference.toLowerCase().includes(q)) ||
        o.origin.toLowerCase().includes(q) ||
        o.destination.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, searchQuery]);

  // Order valuation summary
  const totalValuation = useMemo(() => {
    return orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  }, [orders]);

  // Handle Save Order (Create or Update)
  const handleSaveOrder = async (formData: OrderFormData) => {
    if (!user) return;
    if (editingOrder) {
      await updateOrder(user.uid, editingOrder.id, formData);
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? { ...o, ...formData } : o))
      );
      showToast(`Order ${formData.orderNumber || editingOrder.orderNumber} updated.`);
    } else {
      const newOrder = await createOrder(user.uid, formData);
      setOrders((prev) => [newOrder, ...prev]);
      showToast(`Order ${newOrder.orderNumber} created successfully!`);
    }
  };

  // Handle Delete Order
  const handleDeleteConfirm = async () => {
    if (!user || !deletingOrder) return;
    setIsDeleting(true);
    try {
      await deleteOrder(user.uid, deletingOrder.id);
      setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
      showToast(`Order ${deletingOrder.orderNumber} deleted.`);
      setDeletingOrder(null);
    } catch (err) {
      console.error('Error deleting order:', err);
      showToast('Failed to delete order.');
    } finally {
      setIsDeleting(false);
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
            <h2 className="text-lg font-bold text-white">Logistics Orders Access</h2>
            <p className="text-xs text-slate-400">
              Orders and commercial client manifests are accessible within your authenticated organization.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <Link
              href="/login"
              className="block w-full py-2.5 bg-[#0a182b] hover:bg-[#0f243f] text-[#00e5c9] border border-slate-700 font-bold text-xs rounded-xl shadow-lg transition-colors text-center"
            >
              Sign In to Access Orders
            </Link>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Instant One-Click Demo
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => demoLogin('Customer')}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>Shipper Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => demoLogin('Dealer Operations')}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>Operations Demo</span>
                </button>
              </div>
            </div>
          </div>
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
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Commercial Fulfillment
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {orders.length} Orders
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Orders Management</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/clients"
            prefetch={false}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Clients ({clients.length})</span>
          </Link>

          <Link
            href="/dashboard/shipments"
            prefetch={false}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>Shipments ({shipments.length})</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsInsightsModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-[#00e5c9] via-teal-500 to-[#1d64ec] text-[#070d18] rounded-xl text-xs font-extrabold shadow-md shadow-teal-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#070d18]" />
            <span>Analyze Logistics</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const check = checkPlanLimit(subscription.tier, 'orders', orders.length);
              if (!check.allowed) {
                setLimitErrorMessage(check.message || 'Commercial orders limit reached for your plan.');
                setUpgradeModalOpen(true);
                return;
              }
              setEditingOrder(null);
              setIsOrderModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Order</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Total Orders
              </span>
              <p className="text-2xl font-extrabold text-slate-900">{orders.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                In Fulfillment
              </span>
              <p className="text-2xl font-extrabold text-slate-900">
                {orders.filter((o) => o.status === 'In Fulfillment' || o.status === 'Confirmed').length}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Linked to Shipments
              </span>
              <p className="text-2xl font-extrabold text-slate-900">
                {orders.filter((o) => Boolean(o.shipmentId)).length}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Total Order Value
              </span>
              <p className="text-2xl font-extrabold text-slate-900">
                ${totalValuation.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, client, title, waybill, origin, or destination..."
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['All', 'Draft', 'Confirmed', 'In Fulfillment', 'Shipped', 'Delivered', 'Cancelled'].map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Loading Orders Registry...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3 p-4">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Orders Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No orders match your filter criteria.'
                    : 'Create your first commercial freight order associated with a client.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setEditingOrder(null);
                  setIsOrderModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Order</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-500 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Order # &amp; Date</th>
                    <th className="py-3.5 px-4 font-bold">Associated Client</th>
                    <th className="py-3.5 px-4 font-bold">Commodity &amp; Valuation</th>
                    <th className="py-3.5 px-4 font-bold">Associated Shipment</th>
                    <th className="py-3.5 px-4 font-bold text-center">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    >
                      {/* Order Number & Date */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-slate-900 text-sm block group-hover:text-blue-600 transition-colors">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Date: {order.orderDate}
                        </span>
                      </td>

                      {/* Associated Client */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/dashboard/clients/${order.clientId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                        >
                          <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{order.clientName}</span>
                        </Link>
                        {order.clientContact && (
                          <span className="text-[11px] text-slate-400 block">
                            Contact: {order.clientContact}
                          </span>
                        )}
                      </td>

                      {/* Title & Valuation */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-900 block max-w-[220px] truncate">
                          {order.title}
                        </span>
                        <span className="text-[11px] font-extrabold text-emerald-700 font-mono">
                          {order.currency} ${order.totalAmount.toLocaleString()} &bull;{' '}
                          <span className="text-slate-500 font-normal">
                            {order.items?.length || 0} line items
                          </span>
                        </span>
                      </td>

                      {/* Associated Shipment */}
                      <td className="py-4 px-4">
                        {order.shipmentId ? (
                          <Link
                            href={`/dashboard/shipments/${order.shipmentId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-mono text-[11px] font-bold transition-colors"
                          >
                            <Package className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>{order.shipmentReference || 'Track Waybill'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Unassigned &bull; Awaiting Dispatch
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Order"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Order Create / Edit Modal */}
      {isOrderModalOpen && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          onSave={handleSaveOrder}
          initialData={editingOrder}
          clients={clients}
          shipments={shipments}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Delete Order Record?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete order <strong>{deletingOrder.orderNumber}</strong>?
                This action will unlink any associated shipments.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                disabled={isDeleting}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
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

      {/* AI Logistics Insights On-Demand Modal */}
      {user && (
        <LogisticsInsightsModal
          isOpen={isInsightsModalOpen}
          onClose={() => setIsInsightsModalOpen(false)}
          userId={user.uid}
          userRole={userProfile?.role || 'Customer'}
          company={userProfile?.company || 'Your Organization'}
          shipments={shipments}
          orders={orders}
          pickups={[]}
          onNavigateTab={() => {
            setIsInsightsModalOpen(false);
          }}
        />
      )}

      {/* Upgrade Limit Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Commercial Order Limit Reached"
        message={limitErrorMessage}
        currentTier={subscription.tier}
      />
    </div>
  );
}
