'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  Ship,
  Plane,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ArrowLeft,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  ChevronDown,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth, ShipmentRecord, ShipmentStatus, ClientRecord } from '@/lib/auth-context';
import {
  getUserShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
  ShipmentFormData,
} from '@/lib/shipment-service';
import { getUserClients } from '@/lib/client-service';
import { getUserOrders } from '@/lib/order-service';
import ShipmentModal from '@/components/ShipmentModal';
import UpgradeModal from '@/components/UpgradeModal';
import { LogisticsInsightsModal } from '@/components/LogisticsInsightsModal';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrderRecord } from '@/lib/auth-context';

export default function ShipmentsListPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, demoLogin, signInWithGoogle } = useAuth();

  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [shipmentsLoaded, setShipmentsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals & drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<ShipmentRecord | null>(null);
  const [deletingShipment, setDeletingShipment] = useState<ShipmentRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real-time listener for user shipments and subscription
  useEffect(() => {
    if (!user) return;

    getUserSubscription(user.uid, userProfile).then((sub) => setSubscription(sub));

    // Fetch clients for association
    getUserClients(user.uid)
      .then((cList) => setClients(cList))
      .catch((err) => console.error('Error fetching clients:', err));

    // Fetch orders for AI logistics context
    getUserOrders(user.uid)
      .then((oList) => setOrders(oList))
      .catch((err) => console.error('Error fetching orders:', err));

    if (user.uid.startsWith('demo_')) {
      const loadDemoShipments = async () => {
        const list = await getUserShipments(user.uid);
        setShipments(list);
        setShipmentsLoaded(true);
      };
      loadDemoShipments();

      const handleUpdate = () => {
        loadDemoShipments();
      };
      window.addEventListener('logistics_shipments_updated', handleUpdate);
      return () => {
        window.removeEventListener('logistics_shipments_updated', handleUpdate);
      };
    }

    const colRef = collection(db, 'users', user.uid, 'shipments');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: ShipmentRecord[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as ShipmentRecord), id: docSnap.id });
        });
        setShipments(items);
        setShipmentsLoaded(true);
      },
      (error) => {
        console.warn('Error listening to shipments from Firestore, using fallback:', error);
        getUserShipments(user.uid).then((list) => {
          setShipments(list);
          setShipmentsLoaded(true);
        });
      }
    );

    return () => unsub();
  }, [user, userProfile]);

  const loading = authLoading || (Boolean(user) && !shipmentsLoaded);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const refMatch = (s.referenceNumber || s.trackingNumber || '').toLowerCase().includes(q);
      const custMatch = (s.customer || '').toLowerCase().includes(q);
      const origMatch = (s.origin || '').toLowerCase().includes(q);
      const destMatch = (s.destination || '').toLowerCase().includes(q);
      const cargoMatch = (s.cargoInfo || '').toLowerCase().includes(q);

      const matchesSearch = !q || refMatch || custMatch || origMatch || destMatch || cargoMatch;
      const matchesStatus =
        selectedStatus === 'All' ? true : s.status?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchQuery, selectedStatus]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: shipments.length,
      pending: shipments.filter((s) => s.status === 'Pending').length,
      processing: shipments.filter((s) => s.status === 'Processing').length,
      inTransit: shipments.filter((s) => s.status === 'In Transit').length,
      delivered: shipments.filter((s) => s.status === 'Delivered').length,
      cancelled: shipments.filter((s) => s.status === 'Cancelled').length,
    };
  }, [shipments]);

  // Handle Save (Create or Update)
  const handleSaveShipment = async (formData: ShipmentFormData) => {
    if (!user) return;
    if (editingShipment) {
      await updateShipment(user.uid, editingShipment.id, formData);
      showToast(`Shipment ${formData.referenceNumber} updated!`);
    } else {
      const created = await createShipment(user.uid, formData);
      showToast(`Shipment ${created.referenceNumber} created successfully!`);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!user || !deletingShipment) return;
    try {
      await deleteShipment(user.uid, deletingShipment.id);
      showToast(`Shipment ${deletingShipment.referenceNumber} removed.`);
      setDeletingShipment(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete shipment.');
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
        <p className="text-xs font-semibold text-slate-600">Loading Logistics Database...</p>
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
            <h2 className="text-lg font-bold text-white">Authentication Required</h2>
            <p className="text-xs text-slate-400">
              Shipment records and waybills are partitioned to authenticated accounts to ensure enterprise data isolation.
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
              Sign In with Email
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
              href="/"
              className="block text-xs text-slate-400 hover:text-white transition-colors pt-2"
            >
              &larr; Return to Home
            </Link>
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

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Return to Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Shipment Management</span>
            </h1>
            <p className="text-xs text-slate-500">
              Private records for {userProfile?.company || user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsInsightsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-[#00e5c9] via-teal-500 to-[#1d64ec] text-[#070d18] rounded-xl text-xs font-extrabold shadow-md shadow-teal-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#070d18]" />
            <span>Analyze Logistics</span>
          </button>

          <Link
            href="/dashboard/clients"
            prefetch={false}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Clients Directory</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              const check = checkPlanLimit(subscription.tier, 'shipments', shipments.length);
              if (!check.allowed) {
                setLimitErrorMessage(check.message || 'Shipment limit reached for your plan.');
                setUpgradeModalOpen(true);
                return;
              }
              setEditingShipment(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Shipment</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Status Pill Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'All', count: counts.all, filter: 'All', color: 'text-slate-900 bg-white' },
            { label: 'Pending', count: counts.pending, filter: 'Pending', color: 'text-rose-700 bg-rose-50/70 border-rose-200' },
            { label: 'Processing', count: counts.processing, filter: 'Processing', color: 'text-amber-700 bg-amber-50/70 border-amber-200' },
            { label: 'In Transit', count: counts.inTransit, filter: 'In Transit', color: 'text-blue-700 bg-blue-50/70 border-blue-200' },
            { label: 'Delivered', count: counts.delivered, filter: 'Delivered', color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200' },
            { label: 'Cancelled', count: counts.cancelled, filter: 'Cancelled', color: 'text-slate-600 bg-slate-100 border-slate-200' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setSelectedStatus(item.filter)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedStatus === item.filter
                  ? 'ring-2 ring-blue-600 shadow-md bg-white border-blue-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 block">{item.label}</span>
              <span className="text-xl font-extrabold text-slate-900 block mt-0.5">{item.count}</span>
            </button>
          ))}
        </div>

        {/* Clean Shipments Table Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          {/* Controls Bar: Search & Status Filter Dropdown/Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference #, customer, origin, destination, cargo..."
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {['All', 'Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-white text-blue-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Reference #</th>
                  <th className="py-3 px-3">Customer / Client</th>
                  <th className="py-3 px-3">Origin &rarr; Destination</th>
                  <th className="py-3 px-3">Dates (Ship / ETA)</th>
                  <th className="py-3 px-3">Cargo Info</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No shipments found</p>
                      <p className="text-[11px] text-slate-400">
                        {searchQuery || selectedStatus !== 'All'
                          ? 'Try resetting the search query or filter.'
                          : 'Click "Create Shipment" to register your first cargo waybill.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/dashboard/shipments/${s.id}`)}
                    >
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-slate-900 block group-hover:text-blue-600">
                          {s.referenceNumber || s.trackingNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {s.mode === 'Air' && <Plane className="w-3 h-3 text-sky-500" />}
                          {s.mode === 'Ocean' && <Ship className="w-3 h-3 text-blue-600" />}
                          {s.mode === 'Road' && <Truck className="w-3 h-3 text-amber-600" />}
                          <span>{s.carrier || s.mode}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {s.clientId ? (
                          <Link
                            href={`/dashboard/clients/${s.clientId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline block flex items-center gap-1.5"
                            title="View Client Details & History"
                          >
                            <span>{s.customer}</span>
                            <span className="p-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-bold">Client</span>
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-800 block">{s.customer}</span>
                        )}
                        <span className="text-[11px] text-slate-400">{s.recipientPhone}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-700 truncate max-w-[200px]">
                          {s.origin} &rarr; {s.destination}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[200px]">
                          At: {s.currentLocation || s.origin}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 block font-medium">
                          Dep: {s.shipmentDate || 'Today'}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          ETA: {s.expectedDeliveryDate || 'TBD'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800 truncate block max-w-[180px]">
                          {s.cargoInfo}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {s.quantity} pkgs &bull; {s.weight}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            s.status
                          )}`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/shipments/${s.id}`)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Detailed Shipment Page"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingShipment(s);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Shipment"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingShipment(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Shipment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {filteredShipments.length} of {shipments.length} total shipments
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Zero-Trust Tenant Isolated
            </span>
          </div>
        </div>
      </main>

      {/* Create / Edit Shipment Modal */}
      <ShipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShipment(null);
        }}
        onSave={handleSaveShipment}
        initialData={editingShipment}
        defaultCustomer={userProfile?.company || userProfile?.displayName || ''}
        defaultHub={userProfile?.defaultHub}
        clients={clients}
      />

      {/* Delete Confirmation Modal */}
      {deletingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Shipment Record?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete waybill{' '}
                <strong className="text-slate-800">{deletingShipment.referenceNumber}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingShipment(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Delete Shipment
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
          onSelectShipment={(s) => {
            setEditingShipment(s);
            setIsInsightsModalOpen(false);
          }}
          onNavigateTab={() => {
            setIsInsightsModalOpen(false);
          }}
        />
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
