'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Briefcase,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Package,
  Plus,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Ship,
  Plane,
  Eye,
  Calendar,
  AlertTriangle,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Share2,
  ShoppingBag,
} from 'lucide-react';
import { useAuth, ClientRecord, ShipmentRecord, ShipmentStatus, OrderRecord, OrderStatus } from '@/lib/auth-context';
import {
  getClientById,
  updateClient,
  deleteClient,
  getClientShipments,
  ClientFormData,
} from '@/lib/client-service';
import { createShipment, ShipmentFormData } from '@/lib/shipment-service';
import { getClientOrders, createOrder, OrderFormData } from '@/lib/order-service';
import ClientModal from '@/components/ClientModal';
import ShipmentModal from '@/components/ShipmentModal';
import OrderModal from '@/components/OrderModal';
import UpgradeModal from '@/components/UpgradeModal';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const { user, loading: authLoading, demoLogin, signInWithGoogle } = useAuth();

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load client, orders, subscription, and relevant shipment history
  useEffect(() => {
    if (!user || !clientId) return;

    let isMounted = true;
    getUserSubscription(user.uid).then((sub) => {
      if (isMounted) setSubscription(sub);
    });
    getClientById(user.uid, clientId)
      .then(async (clientData) => {
        if (!isMounted) return;
        if (!clientData) {
          setError('Client record not found in your private address book.');
          setLoading(false);
          return;
        }

        setClient(clientData);
        const [clientShps, clientOrds] = await Promise.all([
          getClientShipments(user.uid, clientData),
          getClientOrders(user.uid, clientData.id),
        ]);

        if (isMounted) {
          setShipments(clientShps);
          setOrders(clientOrds);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching client details:', err);
        if (isMounted) {
          setError('Failed to retrieve client profile.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user, clientId]);

  // Handle Edit Save
  const handleSaveEdit = async (formData: ClientFormData) => {
    if (!user || !client) return;
    await updateClient(user.uid, client.id, formData);
    setClient((prev) => (prev ? { ...prev, ...formData } : null));
    showToast(`Client "${formData.company}" updated successfully.`);
  };

  // Handle Create Order for this Client
  const handleCreateOrderForClient = async (orderData: OrderFormData) => {
    if (!user || !client) return;
    const newOrd = await createOrder(user.uid, {
      ...orderData,
      clientId: client.id,
      clientName: client.company,
      clientContact: client.contactPerson,
    });
    setOrders((prev) => [newOrd, ...prev]);
    showToast(`Order ${newOrd.orderNumber} created for ${client.company}!`);
  };

  // Handle Delete
  const handleDeleteClient = async () => {
    if (!user || !client) return;
    setIsDeleting(true);
    try {
      await deleteClient(user.uid, client.id);
      router.push('/dashboard/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      showToast('Failed to delete client.');
      setIsDeleting(false);
    }
  };

  // Handle Create New Shipment for this Client
  const handleCreateShipmentForClient = async (shipmentData: ShipmentFormData) => {
    if (!user || !client) return;
    const newShp = await createShipment(user.uid, {
      ...shipmentData,
      clientId: client.id,
      customer: shipmentData.customer || client.company,
    });
    setShipments((prev) => [newShp, ...prev]);
    showToast(`Shipment ${newShp.referenceNumber} created for ${client.company}!`);
  };

  // Status Badge Helper
  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending':
        return 'bg-rose-50 text-rose-700 border-rose-200';
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
              Client profile and historical waybills are protected under private enterprise partition.
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
              href="/dashboard/clients"
              className="block text-xs text-slate-400 hover:text-white transition-colors pt-2"
            >
              &larr; View All Clients
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
        <p className="text-xs font-semibold text-slate-600">Retrieving Client Profile &amp; History...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Client Not Found</h2>
          <p className="text-xs text-slate-500">
            {error || 'Unable to locate this client record in your directory.'}
          </p>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Clients Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeShipmentsCount = shipments.filter(
    (s) => s.status === 'In Transit' || s.status === 'Processing'
  ).length;
  const deliveredShipmentsCount = shipments.filter((s) => s.status === 'Delivered').length;

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
            href="/dashboard/clients"
            prefetch={false}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Clients"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Client Profile
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Verified Account
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {client.company}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const check = checkPlanLimit(subscription.tier, 'shipments', shipments.length);
              if (!check.allowed) {
                setLimitErrorMessage(check.message || 'Shipment capacity limit reached.');
                setUpgradeModalOpen(true);
                return;
              }
              setIsShipmentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create Shipment</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Client</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            title="Delete Client"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Top 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Primary Contact Card & Specifications */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Details Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-extrabold text-xl">
                    {client.company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{client.company}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Primary Contact: <strong>{client.contactPerson}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${client.email}`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Consignor</span>
                  </a>
                  <a
                    href={`tel:${client.phone}`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Corporate Email
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{client.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Direct Phone Number
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{client.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Physical Registered Address / Delivery Gateway
                  </span>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">{client.address}</p>
                  </div>
                </div>
              </div>

              {/* Notes & Special Terms */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider font-bold block flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Customs Notes &amp; Handling Instructions</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {client.notes || 'No special customs instructions or handling terms recorded for this client.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Shipment Metrics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Consignment Performance</span>
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Total Waybills</span>
                  <span className="text-lg font-black text-slate-900">{shipments.length}</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Commercial Orders</span>
                  <span className="text-lg font-black text-emerald-700">{orders.length}</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800">In Transit &amp; Active</span>
                  <span className="text-lg font-black text-blue-700">{activeShipmentsCount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Successfully Delivered</span>
                  <span className="text-lg font-black text-slate-800">{deliveredShipmentsCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsShipmentModalOpen(true)}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ship Cargo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RELEVANT SHIPMENT HISTORY SECTION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Relevant Shipment History</span>
              </h2>
              <p className="text-xs text-slate-500">
                All consignments and active waybills associated with {client.company}.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                {shipments.length} Waybill{shipments.length === 1 ? '' : 's'} Logged
              </span>
              <button
                type="button"
                onClick={() => setIsShipmentModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Consignment</span>
              </button>
            </div>
          </div>

          {/* Shipment Table / Cards */}
          {shipments.length === 0 ? (
            <div className="py-14 text-center space-y-3 p-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Shipments Associated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first consignment for <strong>{client.company}</strong> to start logging waybill tracking telemetry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShipmentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create First Shipment</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-500 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3 px-3 font-bold">Reference #</th>
                    <th className="py-3 px-3 font-bold">Route (Origin &rarr; Destination)</th>
                    <th className="py-3 px-3 font-bold">Dispatched / ETA</th>
                    <th className="py-3 px-3 font-bold">Cargo &amp; Weight</th>
                    <th className="py-3 px-3 font-bold text-center">Status</th>
                    <th className="py-3 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => router.push(`/dashboard/shipments/${s.id}`)}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                          {s.referenceNumber || s.trackingNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {s.mode === 'Air' && <Plane className="w-3 h-3 text-sky-500" />}
                          {s.mode === 'Ocean' && <Ship className="w-3 h-3 text-blue-600" />}
                          {s.mode === 'Road' && <Truck className="w-3 h-3 text-amber-600" />}
                          <span>{s.carrier || `${s.mode} Freight`}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 truncate max-w-[200px]">
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
                        <span className="text-[11px] text-slate-400 block font-mono">
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

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            s.status
                          )}`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/dashboard/shipments/${s.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <span>Track</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CLIENT ORDERS RELATIONSHIP SECTION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>Commercial Orders &amp; Fulfillment ({orders.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Purchase and freight cargo orders placed by {client.company}, linked to consignments.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                {orders.length} Order{orders.length === 1 ? '' : 's'} Logged
              </span>
              <button
                type="button"
                onClick={() => {
                  const check = checkPlanLimit(subscription.tier, 'orders', orders.length);
                  if (!check.allowed) {
                    setLimitErrorMessage(check.message || 'Commercial orders limit reached for your plan.');
                    setUpgradeModalOpen(true);
                    return;
                  }
                  setIsOrderModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Order</span>
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3 p-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Orders Logged Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create a commercial order for <strong>{client.company}</strong> to manage line items, valuation, and dispatch waybills.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Client Order</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-500 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3 px-3 font-bold">Order # &amp; Date</th>
                    <th className="py-3 px-3 font-bold">Commodity &amp; Valuation</th>
                    <th className="py-3 px-3 font-bold">Route</th>
                    <th className="py-3 px-3 font-bold">Linked Shipment</th>
                    <th className="py-3 px-3 font-bold text-center">Status</th>
                    <th className="py-3 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => router.push(`/dashboard/orders/${ord.id}`)}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Date: {ord.orderDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 truncate block max-w-[200px]">
                          {ord.title}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold font-mono">
                          ${ord.totalAmount.toLocaleString()} &bull; {ord.items?.length || 0} items
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 truncate block max-w-[180px]">
                          {ord.origin} &rarr; {ord.destination}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Due: {ord.deliveryDeadline || 'TBD'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {ord.shipmentId ? (
                          <Link
                            href={`/dashboard/shipments/${ord.shipmentId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-mono font-bold transition-colors"
                          >
                            <Package className="w-3 h-3 text-purple-600" />
                            <span>{ord.shipmentReference || 'Track Waybill'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Awaiting dispatch</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                          {ord.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/dashboard/orders/${ord.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <span>View Order</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Client Modal */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={client}
      />

      {/* Create Order for Client Modal */}
      {isOrderModalOpen && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          onSave={handleCreateOrderForClient}
          clients={[client]}
          shipments={shipments}
          defaultClientId={client.id}
        />
      )}

      {/* Create Shipment for Client Modal */}
      {isShipmentModalOpen && (
        <ShipmentModal
          isOpen={isShipmentModalOpen}
          onClose={() => setIsShipmentModalOpen(false)}
          onSave={handleCreateShipmentForClient}
          clients={[client]}
          defaultClientId={client.id}
          defaultCustomer={client.company}
          defaultHub={client.address.split(',')[0]}
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
              <h3 className="text-base font-bold text-slate-900">Delete Client Record?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong>{client.company}</strong>?
                The {shipments.length} associated shipment{shipments.length === 1 ? '' : 's'} will be retained in your manifest logs.
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
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete Client</span>
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
        title="Plan Limit Reached"
        message={limitErrorMessage}
        currentTier={subscription.tier}
      />
    </div>
  );
}
