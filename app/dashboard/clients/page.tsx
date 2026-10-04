'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ArrowRight,
  Package,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Users,
  ExternalLink,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useAuth, ClientRecord, ShipmentRecord } from '@/lib/auth-context';
import {
  getUserClients,
  createClient,
  updateClient,
  deleteClient,
  ClientFormData,
} from '@/lib/client-service';
import { getUserShipments, createShipment, ShipmentFormData } from '@/lib/shipment-service';
import ClientModal from '@/components/ClientModal';
import ShipmentModal from '@/components/ShipmentModal';
import UpgradeModal from '@/components/UpgradeModal';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';

export default function ClientsPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, demoLogin, signInWithGoogle } = useAuth();

  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Shipment for Client Modal
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [activeClientForShipment, setActiveClientForShipment] = useState<ClientRecord | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load clients, shipments, and subscription
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    Promise.all([
      getUserClients(user.uid),
      getUserShipments(user.uid),
      getUserSubscription(user.uid, userProfile),
    ])
      .then(([clientList, shipmentList, sub]) => {
        if (!isMounted) return;
        setClients(clientList);
        setShipments(shipmentList);
        setSubscription(sub);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching clients data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, userProfile]);

  // Compute shipment counts per client
  const clientShipmentCounts = useMemo(() => {
    const counts: Record<string, { total: number; active: number; delivered: number }> = {};

    clients.forEach((c) => {
      const cComp = c.company.toLowerCase().trim();
      const cCont = c.contactPerson.toLowerCase().trim();

      const matched = shipments.filter((s) => {
        if (s.clientId && s.clientId === c.id) return true;
        if (s.customer) {
          const cust = s.customer.toLowerCase().trim();
          return cust === cComp || cust === cCont || cComp.includes(cust) || cust.includes(cComp);
        }
        return false;
      });

      counts[c.id] = {
        total: matched.length,
        active: matched.filter((s) => s.status === 'In Transit' || s.status === 'Processing').length,
        delivered: matched.filter((s) => s.status === 'Delivered').length,
      };
    });

    return counts;
  }, [clients, shipments]);

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.company.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  // Handle Save Client (Create or Update)
  const handleSaveClient = async (formData: ClientFormData) => {
    if (!user) return;

    if (editingClient) {
      await updateClient(user.uid, editingClient.id, formData);
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? { ...c, ...formData } : c))
      );
      showToast(`Client "${formData.company}" updated successfully.`);
    } else {
      const newClient = await createClient(user.uid, formData);
      setClients((prev) => [newClient, ...prev]);
      showToast(`New client "${formData.company}" registered successfully.`);
    }
  };

  // Handle Delete Client
  const handleDeleteConfirm = async () => {
    if (!user || !deletingClient) return;
    setIsDeleting(true);
    try {
      await deleteClient(user.uid, deletingClient.id);
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id));
      showToast(`Client "${deletingClient.company}" removed from address book.`);
      setDeletingClient(null);
    } catch (err) {
      console.error('Error deleting client:', err);
      showToast('Failed to delete client.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Create Shipment for a specific Client
  const handleSaveShipmentForClient = async (shipmentData: ShipmentFormData) => {
    if (!user) return;
    const newShp = await createShipment(user.uid, shipmentData);
    setShipments((prev) => [newShp, ...prev]);
    showToast(`Shipment ${newShp.referenceNumber} created for ${shipmentData.customer}!`);
  };

  // 1. Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Verifying Authorization...</p>
      </div>
    );
  }

  // 2. Unauthenticated user view with instant one-click demo
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center p-4">
        <div className="bg-[#091322] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#00e5c9]/10 border border-[#00e5c9]/20 text-[#00e5c9] mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">Client Management Access</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Client records and corporate consignor directories are isolated within authenticated enterprise tenant partitions.
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
              Sign In to Access Directory
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
              &larr; Return to Home Portal
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

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Address Book &bull; CRM
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {clients.length} Clients
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Client Management</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/shipments"
            prefetch={false}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>All Shipments</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              const check = checkPlanLimit(subscription.tier, 'clients', clients.length);
              if (!check.allowed) {
                setLimitErrorMessage(check.message || 'Client address book limit reached.');
                setUpgradeModalOpen(true);
                return;
              }
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Client</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Total Clients
              </span>
              <p className="text-2xl font-extrabold text-slate-900">{clients.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Linked Shipments
              </span>
              <p className="text-2xl font-extrabold text-slate-900">{shipments.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Verified Channels
              </span>
              <p className="text-2xl font-extrabold text-slate-900">
                {clients.filter((c) => Boolean(c.email)).length}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Active Destinations
              </span>
              <p className="text-2xl font-extrabold text-slate-900">
                {new Set(clients.map((c) => c.address.split(',').pop()?.trim())).size}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, contact person, email, phone, or address..."
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

          <div className="text-xs text-slate-500 font-medium self-end sm:self-auto">
            Showing <strong>{filteredClients.length}</strong> of {clients.length} clients
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Loading Client Address Book...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-16 text-center space-y-3 p-4">
              <Building className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Clients Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No clients matched your search for "${searchQuery}".`
                    : 'Get started by registering your first corporate client or consignor.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setEditingClient(null);
                  setIsClientModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-500 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Company / Client Name</th>
                    <th className="py-3.5 px-4 font-bold">Contact Person</th>
                    <th className="py-3.5 px-4 font-bold">Email &amp; Phone</th>
                    <th className="py-3.5 px-4 font-bold">Registered Address</th>
                    <th className="py-3.5 px-4 font-bold text-center">Shipments</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client) => {
                    const stats = clientShipmentCounts[client.id] || { total: 0, active: 0, delivered: 0 };

                    return (
                      <tr
                        key={client.id}
                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      >
                        {/* Company Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors font-bold text-sm">
                              {client.company.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block group-hover:text-blue-600 transition-colors">
                                {client.company}
                              </span>
                              {client.notes && (
                                <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[220px]">
                                  {client.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact Person */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.contactPerson}</span>
                          </span>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-4 px-4 space-y-1">
                          <a
                            href={`mailto:${client.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 hover:underline"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{client.email}</span>
                          </a>
                          <a
                            href={`tel:${client.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-slate-500 hover:text-blue-600 flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{client.phone}</span>
                          </a>
                        </td>

                        {/* Address */}
                        <td className="py-4 px-4">
                          <span className="text-slate-600 flex items-start gap-1.5 max-w-[240px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{client.address}</span>
                          </span>
                        </td>

                        {/* Shipments Count Badge */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              {stats.total} Waybill{stats.total === 1 ? '' : 's'}
                            </span>
                            {stats.active > 0 && (
                              <span className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                {stats.active} in transit
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Create Shipment for Client */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveClientForShipment(client);
                                setIsShipmentModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Create Shipment for this client"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>Ship</span>
                            </button>

                            {/* View Detail */}
                            <button
                              type="button"
                              onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Client Details & Shipment History"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingClient(client);
                                setIsClientModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Client"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeletingClient(client)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        initialData={editingClient}
      />

      {/* Create Shipment for Client Modal */}
      {isShipmentModalOpen && (
        <ShipmentModal
          isOpen={isShipmentModalOpen}
          onClose={() => {
            setIsShipmentModalOpen(false);
            setActiveClientForShipment(null);
          }}
          onSave={handleSaveShipmentForClient}
          clients={clients}
          defaultClientId={activeClientForShipment?.id}
          defaultCustomer={activeClientForShipment?.company}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Delete Client Record?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{deletingClient.company}</strong> from your address book?
                Associated shipments will remain preserved with historical waybill logs.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
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
        title="Client Address Book Limit Reached"
        message={limitErrorMessage}
        currentTier={subscription.tier}
      />
    </div>
  );
}
