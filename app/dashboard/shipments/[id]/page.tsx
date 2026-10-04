'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  Ship,
  Plane,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Edit3,
  Trash2,
  Printer,
  Copy,
  ShieldCheck,
  Building,
  User,
  FileText,
  Plus,
  X,
  Check,
  AlertCircle,
  Share2,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAuth, ShipmentRecord, ShipmentStatus, ClientRecord } from '@/lib/auth-context';
import {
  getShipmentById,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  ShipmentFormData,
} from '@/lib/shipment-service';
import { getUserClients } from '@/lib/client-service';
import ShipmentModal from '@/components/ShipmentModal';
import ShipmentTrackingTimeline from '@/components/ShipmentTrackingTimeline';
import UpgradeModal from '@/components/UpgradeModal';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';

export default function DetailedShipmentPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params?.id as string;
  const { user, loading: authLoading, demoLogin, signInWithGoogle } = useAuth();

  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & confirmation
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load shipment from Firestore
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    getUserSubscription(user.uid).then((sub) => {
      if (isMounted) setSubscription(sub);
    });
    getUserClients(user.uid)
      .then((cList) => {
        if (isMounted) setClients(cList);
      })
      .catch((err) => console.error('Error fetching clients:', err));

    getShipmentById(user.uid, shipmentId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setShipment(data);
        } else {
          setError('Shipment record not found or has been removed.');
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Error fetching shipment details.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, shipmentId]);

  // Handle Edit Save
  const handleSaveEdit = async (formData: ShipmentFormData) => {
    if (!user || !shipment) return;
    await updateShipment(user.uid, shipment.id, formData);
    setShipment((prev) => (prev ? { ...prev, ...formData } : null));
    showToast('Shipment details updated successfully!');
  };

  // Handle Quick Status Change
  const handleStatusChange = async (newStatus: ShipmentStatus) => {
    if (!user || !shipment) return;
    try {
      await updateShipmentStatus(user.uid, shipment.id, newStatus, shipment.events);
      const newEvent = {
        time: 'Just Now',
        title: `Status changed to ${newStatus}`,
        location: shipment.currentLocation || shipment.origin,
        completed: true,
      };
      setShipment((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              events: prev.events ? [...prev.events, newEvent] : [newEvent],
            }
          : null
      );
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error changing status:', err);
      showToast('Failed to update status.');
    }
  };

  // Handle Delete Shipment
  const handleDeleteShipment = async () => {
    if (!user || !shipment) return;
    try {
      await deleteShipment(user.uid, shipment.id);
      router.push('/dashboard/shipments');
    } catch (err) {
      console.error('Error deleting shipment:', err);
      showToast('Failed to delete shipment.');
    }
  };

  // Handle Add Timeline Event
  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shipment || !newEventTitle.trim()) return;

    const newEvent = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: newEventTitle.trim(),
      location: newEventLocation.trim() || shipment.currentLocation || 'Checkpoint Terminal',
      completed: true,
    };

    const updatedEvents = shipment.events ? [...shipment.events, newEvent] : [newEvent];

    try {
      await updateShipment(user.uid, shipment.id, {
        currentLocation: newEvent.location,
      });
      // also update events
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await updateDoc(doc(db, 'users', user.uid, 'shipments', shipment.id), {
        events: updatedEvents,
        currentLocation: newEvent.location,
      });

      setShipment((prev) => (prev ? { ...prev, events: updatedEvents, currentLocation: newEvent.location } : null));
      setIsAddEventOpen(false);
      setNewEventTitle('');
      setNewEventLocation('');
      showToast('Milestone checkpoint logged successfully!');
    } catch (err) {
      console.error('Error adding milestone:', err);
      showToast('Failed to add milestone.');
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
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
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">Sign In Required</h2>
            <p className="text-xs text-slate-400">
              This waybill is stored in a private tenant partition. Please sign in or use one-click demo access to inspect details.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <Link
              href="/login"
              className="block w-full py-2.5 bg-[#0a182b] hover:bg-[#0f243f] text-[#00e5c9] border border-slate-700 font-bold text-xs rounded-xl shadow-lg transition-colors text-center"
            >
              Sign In to Account
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

            <Link
              href="/dashboard/shipments"
              className="block text-xs text-slate-400 hover:text-white transition-colors pt-2"
            >
              &larr; View All Shipments
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
        <p className="text-xs font-semibold text-slate-600">Retrieving Shipment Record...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Shipment Not Found</h2>
          <p className="text-xs text-slate-500">
            {error || 'Unable to locate this shipment in your private logistics database.'}
          </p>
          <Link
            href="/dashboard/shipments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shipments List</span>
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
            href="/dashboard/shipments"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Shipments"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Waybill Detail
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(shipment.status)}`}>
                {shipment.status}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
              {shipment.referenceNumber || shipment.trackingNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const check = checkPlanLimit(subscription.tier, 'reports');
              if (!check.allowed) {
                setLimitErrorMessage(check.message || 'Exporting formal waybill manifests requires a Starter, Business, or Enterprise subscription.');
                setUpgradeModalOpen(true);
                return;
              }
              window.print();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Waybill</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Shipment</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            title="Delete Shipment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column (8 cols): Interactive Tracking Timeline & Progress */}
          <div className="lg:col-span-8 space-y-6">
            <ShipmentTrackingTimeline
              shipment={shipment}
              userId={user.uid}
              isAuthorized={true}
              onShipmentUpdated={(updated) => setShipment(updated)}
            />

            {/* Cargo Information & Specifications */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Cargo Specifications &amp; Quantity</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Cargo Description / Commodity
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{shipment.cargoInfo}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Quantity
                  </span>
                  <p className="font-bold text-slate-900 text-base">
                    {shipment.quantity} <span className="text-xs font-normal text-slate-500">pieces / pkgs</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Gross Weight
                  </span>
                  <p className="font-bold text-slate-900 text-base">{shipment.weight}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Transport Mode
                  </span>
                  <p className="font-bold text-slate-900 text-base">{shipment.mode} Freight</p>
                </div>
              </div>
            </div>

            {/* Notes & Special Handling Instructions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Handling Notes &amp; Customs Instructions</span>
              </h2>
              {shipment.notes ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-mono">
                  {shipment.notes}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No special handling instructions or customs notes attached to this waybill.
                </p>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Route, Customer Details & Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Route & Schedule Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    {shipment.mode === 'Air' && <Plane className="w-4 h-4" />}
                    {shipment.mode === 'Ocean' && <Ship className="w-4 h-4" />}
                    {shipment.mode === 'Road' && <Truck className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-sm">Multimodal Route</h2>
                    <p className="text-[11px] text-slate-500">{shipment.carrier || 'Assigned Logistics Carrier'}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {shipment.mode} Freight
                </span>
              </div>

              {/* Origin -> Destination Visual */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Origin Terminal
                  </span>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{shipment.origin}</p>
                      <p className="text-xs text-slate-500">
                        Dispatched: <strong>{shipment.shipmentDate || 'Today'}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-4 border-l-2 border-dashed border-slate-200 ml-2" />

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Destination Hub
                  </span>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{shipment.destination}</p>
                      <p className="text-xs text-slate-500">
                        Expected Delivery: <strong>{shipment.expectedDeliveryDate || 'TBD'}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Consignee / Customer Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Customer / Consignee</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Client Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm block">{shipment.customer}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Contact Phone
                  </span>
                  <span className="font-mono text-slate-700 block">{shipment.recipientPhone || 'Not specified'}</span>
                </div>

                {shipment.clientId ? (
                  <div className="pt-2 border-t border-slate-200/60">
                    <Link
                      href={`/dashboard/clients/${shipment.clientId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>View Client Profile &amp; History &rarr;</span>
                    </Link>
                  </div>
                ) : (
                  (() => {
                    const matchedClient = clients.find(
                      (c) =>
                        c.company.toLowerCase() === shipment.customer.toLowerCase() ||
                        c.contactPerson.toLowerCase() === shipment.customer.toLowerCase()
                    );
                    if (matchedClient) {
                      return (
                        <div className="pt-2 border-t border-slate-200/60">
                          <Link
                            href={`/dashboard/clients/${matchedClient.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <Building className="w-3.5 h-3.5" />
                            <span>View Client Profile &amp; History &rarr;</span>
                          </Link>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </div>
            </div>

            {/* Associated Commercial Order Card */}
            {(shipment.orderId || shipment.orderNumber) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Associated Commercial Order</span>
                </h3>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-bold">
                      Order Reference
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm block">
                      {shipment.orderNumber || shipment.orderId}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60">
                    <Link
                      href={`/dashboard/orders/${shipment.orderId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>View Order Specifications &amp; Invoices &rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Security & Verification Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security &amp; Compliance</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">AEO Customs Fast-Track</span>
                    <span className="text-[11px] text-slate-500">Manifest registered under digital customs verification.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Lloyd&apos;s Cargo Underwriting</span>
                    <span className="text-[11px] text-slate-500">All-risk comprehensive transit protection active.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Private Tenant Isolation</span>
                    <span className="text-[11px] text-slate-500">Partitioned exclusively to your authenticated organization.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm">Quick Actions</h3>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit All Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shipment.referenceNumber);
                  showToast('Reference number copied to clipboard!');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Reference Code</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Shipment</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Shipment Modal */}
      <ShipmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={shipment}
        clients={clients}
        defaultClientId={shipment.clientId}
      />

      {/* Add Milestone Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Milestone Checkpoint</h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTimelineEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Milestone Description *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Customs Pre-Clearance Verified"
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Checkpoint Location</label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g. Namanga Border Post or Dar Outer Port"
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Append Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Shipment Record?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete waybill{' '}
                <strong className="text-slate-800">{shipment.referenceNumber}</strong>? This action will remove the record from your private logistics database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteShipment}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Delete Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Limit Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Report Export Restricted"
        message={limitErrorMessage}
        currentTier={subscription.tier}
      />
    </div>
  );
}
