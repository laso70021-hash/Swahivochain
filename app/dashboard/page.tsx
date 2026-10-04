'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Bell,
  ChevronDown,
  User,
  Plus,
  Eye,
  Calendar,
  MapPin,
  TrendingUp,
  ArrowRight,
  MessageCircle,
  X,
  Menu,
  ShieldCheck,
  Ship,
  Plane,
  Download,
  HelpCircle,
  LogOut,
  Layers,
  Settings,
  PhoneCall,
  Check,
  Building,
  RefreshCw,
  KeyRound,
  AlertCircle,
  Sparkles,
  Copy,
  Mail,
  Phone,
  Compass,
  Users,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import { useAuth, ShipmentRecord, UserProfile, OrderRecord } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import ProfileSettingsForm from '@/components/ProfileSettingsForm';
import ShipmentTrackingTimeline from '@/components/ShipmentTrackingTimeline';
import UpgradeModal from '@/components/UpgradeModal';
import { LogisticsInsightsModal } from '@/components/LogisticsInsightsModal';
import { getUserOrders } from '@/lib/order-service';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';

export interface PickupRecord {
  id: string;
  userId: string;
  trackingNumber?: string;
  pickupAddress: string;
  pickupDate: string;
  timeSlot: string;
  packageCount: number;
  cargoType: string;
  status: 'Scheduled' | 'Assigned' | 'En Route' | 'Completed' | 'Cancelled';
  assignedDriver?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, logOut, updateUserProfile, resetPassword, demoLogin, signInWithGoogle } = useAuth();
  const currentRole = userProfile?.role || 'Customer';

  // Navigation tab state: 'overview' | 'shipments' | 'pickups' | 'profile' | 'hubs' | 'tracking'
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'pickups' | 'profile' | 'hubs' | 'tracking'>('overview');

  // Shipment & Pickup State
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [pickups, setPickups] = useState<PickupRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord | null>(null);
  const [quickTrackCode, setQuickTrackCode] = useState('');

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  // New Shipment Form State
  const [newRecipient, setNewRecipient] = useState('');
  const [newOrigin, setNewOrigin] = useState('Dar es Salaam Central Air Freight Hub');
  const [newDestination, setNewDestination] = useState('Zanzibar Sea Ferry Terminal');
  const [newWeight, setNewWeight] = useState('');
  const [newPieces, setNewPieces] = useState('1');
  const [newMode, setNewMode] = useState<'Ocean' | 'Air' | 'Road'>('Air');
  const [creatingShipment, setCreatingShipment] = useState(false);

  // New Pickup Form State
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('2026-09-28');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('Morning (09:00 - 12:00)');
  const [pickupPackages, setPickupPackages] = useState('2');
  const [pickupCargoType, setPickupCargoType] = useState('Standard Palletized Freight');
  const [creatingPickup, setCreatingPickup] = useState(false);

  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Show toast notification
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  // Real-time listener for private shipments & pickups (with demo mode support)
  useEffect(() => {
    if (!user) return;

    getUserSubscription(user.uid, userProfile).then((sub) => setSubscription(sub));

    const handleSubUpdated = () => {
      getUserSubscription(user.uid, userProfile).then((sub) => setSubscription(sub));
    };
    window.addEventListener('logistics_subscription_updated', handleSubUpdated);

    if (user.uid.startsWith('demo_')) {
      // Demo mode: read from local demo storage and listen to custom updates
      const loadDemoData = async () => {
        const { getUserShipments } = await import('@/lib/shipment-service');
        const shps = await getUserShipments(user.uid);
        setShipments(shps);

        try {
          const userOrders = await getUserOrders(user.uid);
          setOrders(userOrders);
        } catch {
          // ignore
        }

        const storedPickups = localStorage.getItem(`logistics_demo_pickups_${user.uid}`);
        if (storedPickups) {
          try {
            setPickups(JSON.parse(storedPickups));
          } catch {
            // ignore
          }
        } else {
          const initialPickup: PickupRecord = {
            id: 'pck_demo_1',
            userId: user.uid,
            pickupAddress: 'Samora Avenue Commercial Tower 4, Dar es Salaam',
            pickupDate: '2026-09-29',
            timeSlot: 'Morning (09:00 - 12:00)',
            packageCount: 2,
            cargoType: 'Standard Palletized Freight',
            status: 'Scheduled',
            assignedDriver: 'Hassan M. (Van #4)',
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(`logistics_demo_pickups_${user.uid}`, JSON.stringify([initialPickup]));
          setPickups([initialPickup]);
        }
        setLoadingData(false);
      };

      loadDemoData();

      const handleShipmentsUpdate = async () => {
        const { getUserShipments } = await import('@/lib/shipment-service');
        const shps = await getUserShipments(user.uid);
        setShipments(shps);
      };

      window.addEventListener('logistics_shipments_updated', handleShipmentsUpdate);
      return () => {
        window.removeEventListener('logistics_shipments_updated', handleShipmentsUpdate);
      };
    }

    // Authenticated Firebase user: listen to private Firestore collections
    getUserOrders(user.uid).then((o) => setOrders(o)).catch(() => {});

    const shipmentsCol = collection(db, 'users', user.uid, 'shipments');
    const unsubShipments = onSnapshot(
      shipmentsCol,
      (snapshot) => {
        const items: ShipmentRecord[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as ShipmentRecord), id: docSnap.id });
        });
        setShipments(items);
        setLoadingData(false);
      },
      (error) => {
        console.warn('Private user shipments Firestore note:', error);
        setLoadingData(false);
      }
    );

    const pickupsCol = collection(db, 'users', user.uid, 'pickups');
    const unsubPickups = onSnapshot(
      pickupsCol,
      (snapshot) => {
        const items: PickupRecord[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as PickupRecord), id: docSnap.id });
        });
        setPickups(items);
      },
      (error) => {
        console.warn('Private user pickups Firestore note:', error);
      }
    );

    return () => {
      window.removeEventListener('logistics_subscription_updated', handleSubUpdated);
      unsubShipments();
      unsubPickups();
    };
  }, [user, userProfile]);

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.trackingNumber?.toLowerCase().includes(q) ||
        s.customer?.toLowerCase().includes(q) ||
        s.destination?.toLowerCase().includes(q) ||
        s.origin?.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatusFilter === 'All'
          ? true
          : selectedStatusFilter === 'Active'
          ? s.status === 'In Transit' || s.status === 'Processing'
          : s.status.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchQuery, selectedStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = shipments.length;
    const active = shipments.filter(
      (s) => s.status === 'In Transit' || s.status === 'Processing'
    ).length;
    const inTransit = shipments.filter((s) => s.status === 'In Transit').length;
    const processing = shipments.filter((s) => s.status === 'Processing').length;
    const delivered = shipments.filter((s) => s.status === 'Delivered').length;
    const pending = shipments.filter((s) => s.status === 'Pending').length;
    const cancelled = shipments.filter((s) => s.status === 'Cancelled').length;

    return { total, active, inTransit, processing, delivered, pending, cancelled };
  }, [shipments]);

  // Handle Quick Track
  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackCode.trim()) return;

    const found = shipments.find(
      (s) => s.trackingNumber.toLowerCase() === quickTrackCode.trim().toLowerCase()
    );

    if (found) {
      setSelectedShipment(found);
    } else {
      // Create preview shipment
      setSelectedShipment({
        id: 'search-result',
        userId: user?.uid || 'guest',
        referenceNumber: quickTrackCode.toUpperCase(),
        trackingNumber: quickTrackCode.toUpperCase(),
        customer: userProfile?.company || 'Authorized Account',
        recipientPhone: '+255 700 000 000',
        destination: 'Dar es Salaam Marine Terminal',
        origin: 'Global Consolidation Port',
        shipmentDate: '2026-09-26',
        expectedDeliveryDate: '2026-09-30',
        cargoInfo: 'Commercial Containerized Freight',
        quantity: 1,
        weight: '4.5 kg',
        pieces: 1,
        status: 'In Transit',
        date: 'Sep 26, 2026',
        estimatedDelivery: 'Sep 30, 2026',
        mode: 'Ocean',
        carrier: 'Alliance Maritime Line',
        currentLocation: 'Indian Ocean Maritime Corridor',
        events: [
          { time: 'Sep 24, 10:00 AM', title: 'Container Manifest Registered', location: 'Port Gateway', completed: true },
          { time: 'Sep 26, 08:30 AM', title: 'Vessel Underway to Regional Hub', location: 'Maritime Transit', completed: true },
        ],
      });
    }
  };

  // Handle Create Shipment (Persists to Firestore users/{userId}/shipments or demo storage)
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerToast('Please log in to register a shipment under your private account.', 'error');
      return;
    }

    setCreatingShipment(true);
    const newIdNum = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `SWL-2026-${newIdNum}`;
    const newDocId = `shp_${Date.now()}`;

    const newEntry: ShipmentRecord = {
      id: newDocId,
      userId: user.uid,
      referenceNumber: trackingCode,
      trackingNumber: trackingCode,
      customer: newRecipient || userProfile?.displayName || 'Authorized Shipper',
      recipientPhone: '+255 770 123 456',
      destination: newDestination,
      origin: newOrigin,
      shipmentDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      cargoInfo: 'Commercial Goods & General Freight',
      quantity: parseInt(newPieces, 10) || 1,
      weight: `${newWeight || '5.0'} kg`,
      pieces: parseInt(newPieces, 10) || 1,
      status: 'Processing',
      date: 'Sep 26, 2026',
      estimatedDelivery: 'Sep 30, 2026',
      mode: newMode,
      carrier: newMode === 'Air' ? 'Auric Air Express' : newMode === 'Ocean' ? 'Azam Marine Fast Cargo' : 'Logistics Chain Inland Fleet',
      currentLocation: `${newOrigin} Sorting Terminal`,
      events: [
        { time: 'Just Now', title: 'Shipment Created by Authorized Shipper', location: newOrigin, completed: true },
        { time: 'Scheduled', title: 'Manifest Dispatched to Carrier', location: newDestination, completed: false },
      ],
      createdAt: new Date().toISOString(),
    };

    if (user.uid.startsWith('demo_')) {
      const { createShipment } = await import('@/lib/shipment-service');
      const created = await createShipment(user.uid, {
        referenceNumber: trackingCode,
        customer: newRecipient || userProfile?.displayName || 'Authorized Shipper',
        origin: newOrigin,
        destination: newDestination,
        shipmentDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'Processing',
        cargoInfo: 'Commercial Goods & General Freight',
        quantity: parseInt(newPieces, 10) || 1,
        weight: `${newWeight || '5.0'} kg`,
        mode: newMode,
        carrier: newMode === 'Air' ? 'Auric Air Express' : newMode === 'Ocean' ? 'Azam Marine Fast Cargo' : 'Logistics Chain Inland Fleet',
      });
      setIsCreateModalOpen(false);
      setSelectedShipment(created);
      setNewRecipient('');
      setNewWeight('');
      setCreatingShipment(false);
      triggerToast(`Shipment ${trackingCode} successfully registered to your demo workspace!`);
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'shipments', newDocId), newEntry);
      setIsCreateModalOpen(false);
      setSelectedShipment(newEntry);
      setNewRecipient('');
      setNewWeight('');
      triggerToast(`Shipment ${trackingCode} successfully registered to your private tenant!`);
    } catch (err) {
      console.error('Error creating shipment in Firestore:', err);
      triggerToast('Failed to create shipment. Please try again.', 'error');
    } finally {
      setCreatingShipment(false);
    }
  };

  // Handle Pickup Request (Persists to Firestore users/{userId}/pickups or demo storage)
  const handleSchedulePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerToast('Please sign in to schedule a private cargo pickup.', 'error');
      return;
    }

    if (!pickupAddress.trim()) {
      triggerToast('Please enter a valid warehouse or facility pickup address.', 'error');
      return;
    }

    setCreatingPickup(true);
    const newDocId = `pck_${Date.now()}`;
    const newPickup: PickupRecord = {
      id: newDocId,
      userId: user.uid,
      pickupAddress,
      pickupDate,
      timeSlot: pickupTimeSlot,
      packageCount: parseInt(pickupPackages, 10) || 1,
      cargoType: pickupCargoType,
      status: 'Scheduled',
      assignedDriver: 'Hassan M. (Van #4)',
      createdAt: new Date().toISOString(),
    };

    if (user.uid.startsWith('demo_')) {
      const stored = localStorage.getItem(`logistics_demo_pickups_${user.uid}`);
      const currentList: PickupRecord[] = stored ? JSON.parse(stored) : [];
      const updatedList = [newPickup, ...currentList];
      localStorage.setItem(`logistics_demo_pickups_${user.uid}`, JSON.stringify(updatedList));
      setPickups(updatedList);
      setIsPickupModalOpen(false);
      setPickupAddress('');
      setCreatingPickup(false);
      triggerToast('Doorstep pickup scheduled in demo session! Dedicated courier assigned.');
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'pickups', newDocId), newPickup);
      setIsPickupModalOpen(false);
      setPickupAddress('');
      triggerToast('Doorstep pickup scheduled! Dedicated courier assigned.');
    } catch (err) {
      console.error('Error scheduling pickup:', err);
      triggerToast('Failed to schedule pickup. Please retry.', 'error');
    } finally {
      setCreatingPickup(false);
    }
  };

  // Handle Save Profile & Settings
  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await updateUserProfile(data);
      triggerToast('Profile & account settings saved successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      triggerToast('Failed to update profile settings.', 'error');
    }
  };

  // Handle Trigger Password Reset from Profile Area
  const handleTriggerPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await resetPassword(user.email);
      setPasswordResetSent(true);
      triggerToast(`Password reset link dispatched to ${user.email}`);
    } catch (err) {
      console.error('Error sending password reset:', err);
      triggerToast('Unable to send reset email. Please try again.', 'error');
    } finally {
      setSendingReset(false);
    }
  };

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: ShipmentRecord['status']) => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Pending':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070d18] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00e5c9] to-[#0077b6] flex items-center justify-center animate-pulse shadow-xl shadow-teal-500/20">
          <Package className="w-6 h-6 text-[#070d18] stroke-[2.5]" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-tight">Authenticating Logistics Session...</p>
          <p className="text-xs text-slate-400 font-mono">Connecting to private tenant &amp; control tower</p>
        </div>
      </div>
    );
  }

  // Not Logged In Gateway Banner (Allows direct demo login or navigation to /login)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070d18] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00e5c9]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg bg-[#091322] border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00e5c9] mx-auto flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Logistics Chain Private Tenant Access
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              To guarantee zero cross-tenant leakage, each user&apos;s cargo records, customs manifests, and tracking towers are strictly isolated under authenticated user accounts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
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

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="py-2.5 px-3 bg-[#0a182b] hover:bg-[#0f243f] text-slate-200 border border-slate-700/80 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#00e5c9]" />
                <span>Email Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="py-2.5 px-3 bg-[#0a182b] hover:bg-[#0f243f] text-slate-200 border border-slate-700/80 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Create Account</span>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Instant One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => demoLogin('Customer')}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00e5c9]" />
                <span>Shipper Demo</span>
              </button>
              <button
                type="button"
                onClick={() => demoLogin('Dealer Operations')}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00e5c9]" />
                <span>Operations Demo</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              &larr; Return to public portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User initials for avatar
  const initials = (userProfile?.displayName || user.displayName || user.email || 'SH')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] text-slate-800 font-sans">
      {/* Toast Notification */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-medium animate-in slide-in-from-bottom duration-300 ${
            feedbackToast.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : feedbackToast.type === 'info'
              ? 'bg-blue-900 text-blue-100 border-blue-700'
              : 'bg-emerald-900 text-emerald-100 border-emerald-700'
          }`}
        >
          {feedbackToast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
          <button onClick={() => setFeedbackToast(null)} className="ml-2 text-slate-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Left Sidebar Navigation matching screenshots */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a1628] text-slate-300 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00b4d8] to-[#0077b6] flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-white tracking-tight leading-none">
                  SwiftLogix
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider mt-1">
                  Your Cargo, Our Priority
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-[13px] font-medium">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1d64ec] text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setIsInsightsModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-slate-300"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 shrink-0 text-[#00e5c9]" />
                <span className="font-semibold text-white">AI Logistics Insights</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00e5c9]/15 text-[#00e5c9] border border-[#00e5c9]/30">
                Analyze
              </span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0 text-[#00e5c9]" />
              <span>Create Shipment</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('shipments');
                setSelectedStatusFilter('All');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'shipments'
                  ? 'bg-[#1d64ec] text-white font-semibold'
                  : 'hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 shrink-0" />
                <span>My Shipments</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('pickups');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'pickups'
                  ? 'bg-[#1d64ec] text-white font-semibold'
                  : 'hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 shrink-0" />
                <span>Pickup Requests</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                {pickups.length || 2}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('hubs');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'hubs'
                  ? 'bg-[#1d64ec] text-white font-semibold'
                  : 'hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Addresses &amp; Hubs</span>
            </button>

            <Link
              href="/dashboard/clients"
              prefetch={false}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-slate-300"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0 text-[#00e5c9]" />
                <span>Clients Directory</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/20">
                CRM
              </span>
            </Link>

            <Link
              href="/dashboard/orders"
              prefetch={false}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-slate-300"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Orders &amp; Cargo</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Commercial
              </span>
            </Link>

            <Link
              href="/dashboard/subscription"
              prefetch={false}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-slate-300"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Plans &amp; Billing</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Upgrade
              </span>
            </Link>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications</span>
              </div>
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile & Settings Navigation Link */}
            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#1d64ec] text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 shrink-0" />
                <span>Profile &amp; Settings</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <Link
              href="/contact"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Dispatch Support</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Sidebar Action Cards */}
        <div className="p-4 space-y-3 border-t border-slate-800/80">
          {/* Active Tenant Card */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[140px]">
                {userProfile?.company || 'Enterprise Shipper'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {userProfile?.displayName || user.displayName || 'Authorized Account'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              UID: {user.uid.substring(0, 10)}...
            </p>
          </div>

          {/* Need Help Box */}
          <div className="p-3 rounded-xl bg-[#081220] border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-white">24/7 Operations Hub</span>
            </div>
            <p className="text-[10px] text-slate-400">Live dispatch monitoring across maritime and air corridors.</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-slate-700/60 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 shadow-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search private shipments, tracking number, customer..."
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* View Switcher Pill */}
            <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => updateUserProfile({ role: 'Customer' })}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentRole === 'Customer'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shipper View
              </button>
              <button
                onClick={() => updateUserProfile({ role: 'Dealer Operations' })}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentRole === 'Dealer Operations'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Operations View
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* User Profile Pill with Interactive Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#0b2545] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-none">
                    {userProfile?.displayName || user.displayName || 'Authorized Shipper'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {currentRole === 'Customer' ? 'Enterprise Shipper' : 'Dealer Operations'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">
                      {userProfile?.displayName || user.displayName || 'Authorized User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                      {userProfile?.company || 'Logistics Chain Client'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Profile &amp; Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('shipments');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>My Shipments ({shipments.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('pickups');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span>Pickup Requests</span>
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. Dashboard Body Content */}
        <main className="p-4 sm:p-8 space-y-7">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Welcome Greeting Strip & Current Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>
                      Welcome back, {userProfile?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Shipper'}!
                    </span>
                    <span className="text-2xl">👋</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {currentRole === 'Customer'
                      ? `Managing private logistics operations for ${userProfile?.company || 'your account'}.`
                      : 'Control tower view: regional dispatch, fleet routing, and active manifests.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* AI Logistics Insights On-Demand Button */}
                  <button
                    type="button"
                    onClick={() => setIsInsightsModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00e5c9] via-teal-500 to-[#1d64ec] text-[#070d18] font-extrabold text-xs flex items-center gap-2 shadow-md shadow-teal-500/20 hover:opacity-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-[#070d18]" />
                    <span>Analyze Logistics</span>
                  </button>

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create Shipment</span>
                  </button>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Today, Sep 26, 2026</span>
                  </div>
                </div>
              </div>

              {/* Operational Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Total Shipments */}
                <div
                  onClick={() => {
                    setActiveTab('shipments');
                    setSelectedStatusFilter('All');
                  }}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Total Shipments</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total}</span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center">
                        &uarr; 12%
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">private account records</span>
                  </div>
                </div>

                {/* Active Shipments */}
                <div
                  onClick={() => {
                    setActiveTab('shipments');
                    setSelectedStatusFilter('Active');
                  }}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Active Shipments</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.active}</span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center">
                        &uarr; 25%
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">in transit or processing</span>
                  </div>
                </div>

                {/* In Transit */}
                <div
                  onClick={() => {
                    setActiveTab('shipments');
                    setSelectedStatusFilter('In Transit');
                  }}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">In Transit</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.inTransit}</span>
                      <span className="text-xs font-semibold text-blue-600">En Route</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">maritime &amp; air cargo</span>
                  </div>
                </div>

                {/* Delivered */}
                <div
                  onClick={() => {
                    setActiveTab('shipments');
                    setSelectedStatusFilter('Delivered');
                  }}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Delivered</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.delivered}</span>
                      <span className="text-xs font-semibold text-emerald-600">99.4% SLA</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">signature confirmed</span>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Operational Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
                {/* Left 8 Cols: Shipments Table */}
                <div className="xl:col-span-8 space-y-5">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                    {/* Header + Filter Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                            Recent Shipments
                          </h2>
                          <Link
                            href="/dashboard/shipments"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            <span>View All Shipments</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <p className="text-xs text-slate-500">
                          Isolated to {userProfile?.company || user.email}
                        </p>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                        {['All', 'Active', 'In Transit', 'Processing', 'Delivered', 'Pending'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setSelectedStatusFilter(filter)}
                            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              selectedStatusFilter === filter
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200/80 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                            <th className="py-3 px-3">Tracking #</th>
                            <th className="py-3 px-3">Consignee</th>
                            <th className="py-3 px-3">Origin &rarr; Destination</th>
                            <th className="py-3 px-3">Mode</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredShipments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                No shipments found matching current filters.
                              </td>
                            </tr>
                          ) : (
                            filteredShipments.slice(0, 7).map((shipment) => (
                              <tr
                                key={shipment.id}
                                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                onClick={() => setSelectedShipment(shipment)}
                              >
                                <td className="py-3.5 px-3">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                                    <span>{shipment.trackingNumber}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-400">{shipment.date}</span>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className="font-semibold text-slate-800 block">{shipment.customer}</span>
                                  <span className="text-[11px] text-slate-400">{shipment.weight}</span>
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="text-slate-700 font-medium truncate max-w-[190px]">
                                    {shipment.origin.split(' ')[0]} &rarr; {shipment.destination.split(' ')[0]}
                                  </div>
                                  <span className="text-[11px] text-slate-400 truncate block max-w-[190px]">
                                    {shipment.currentLocation}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                                    {shipment.mode === 'Air' && <Plane className="w-3 h-3 text-sky-500" />}
                                    {shipment.mode === 'Ocean' && <Ship className="w-3 h-3 text-blue-600" />}
                                    {shipment.mode === 'Road' && <Truck className="w-3 h-3 text-amber-600" />}
                                    <span>{shipment.mode}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(
                                      shipment.status
                                    )}`}
                                  >
                                    {shipment.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedShipment(shipment);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <span className="text-slate-400">
                        Showing {Math.min(filteredShipments.length, 7)} of {shipments.length} total shipments
                      </span>
                      <button
                        onClick={() => {
                          setActiveTab('shipments');
                          setSelectedStatusFilter('All');
                        }}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Full Shipments Database</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Quick Track & Status Overview */}
                <div className="xl:col-span-4 space-y-5">
                  {/* Track Your Shipment Box */}
                  <div
                    id="quick-track-box"
                    className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Quick Waybill Lookup</h3>
                    </div>

                    <form onSubmit={handleQuickTrack} className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={quickTrackCode}
                          onChange={(e) => setQuickTrackCode(e.target.value)}
                          placeholder="e.g. SWL-2026-000412"
                          className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Track Shipment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Shipment Status Donut Overview */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Shipment Status Overview</h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span>In Transit</span>
                        </span>
                        <span className="font-bold text-slate-900">{stats.inTransit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span>Processing &amp; Customs</span>
                        </span>
                        <span className="font-bold text-slate-900">{stats.active - stats.inTransit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span>Delivered</span>
                        </span>
                        <span className="font-bold text-slate-900">{stats.delivered}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span>Pending Pickup</span>
                        </span>
                        <span className="font-bold text-slate-900">{stats.pending}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Doorstep Pickup */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0a1628] to-[#12233f] text-white shadow-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#00e5c9]" />
                      <h4 className="font-bold text-sm">Schedule Facility Pickup</h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      Need a dedicated courier van or 40ft drayage chassis at your warehouse?
                    </p>
                    <button
                      onClick={() => setIsPickupModalOpen(true)}
                      className="w-full py-2.5 bg-[#00e5c9] hover:bg-[#15f7dc] text-[#070d18] font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      Request Pickup Now
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MY SHIPMENTS */}
          {activeTab === 'shipments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Private Shipments Database
                  </h1>
                  <p className="text-xs text-slate-500">
                    Live view of all multimodal waybills tied strictly to your authenticated organization.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const check = checkPlanLimit(subscription.tier, 'shipments', shipments.length);
                    if (!check.allowed) {
                      setLimitErrorMessage(check.message || 'Shipment capacity limit reached.');
                      setUpgradeModalOpen(true);
                      return;
                    }
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Shipment</span>
                </button>
              </div>

              {/* Full Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by tracking #, origin, or consignee..."
                      className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    {['All', 'Active', 'In Transit', 'Processing', 'Delivered', 'Pending'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          selectedStatusFilter === filter
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3">Tracking Code</th>
                        <th className="py-3 px-3">Consignee</th>
                        <th className="py-3 px-3">Origin Port &rarr; Destination Hub</th>
                        <th className="py-3 px-3">Mode &amp; Carrier</th>
                        <th className="py-3 px-3">ETA</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredShipments.map((shipment) => (
                        <tr
                          key={shipment.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedShipment(shipment)}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                            {shipment.trackingNumber}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-800">
                            {shipment.customer}
                            <span className="block text-[11px] text-slate-400 font-normal">
                              {shipment.weight} &bull; {shipment.pieces} pkgs
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-700">
                            <span className="font-medium">{shipment.origin}</span> &rarr; {shipment.destination}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-800 block">{shipment.carrier}</span>
                            <span className="text-[11px] text-slate-500">{shipment.mode} Freight</span>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-slate-700">
                            {shipment.estimatedDelivery}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(
                                shipment.status
                              )}`}
                            >
                              {shipment.status}
                            </span>
                            {shipment.status !== 'Delivered' && shipment.status !== 'Cancelled' && (
                              <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">
                                {shipment.status === 'Pending'
                                  ? '3 phases remained'
                                  : shipment.status === 'Processing'
                                  ? '2 phases remained'
                                  : '1 phase remained'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShipment(shipment);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PICKUP REQUESTS */}
          {activeTab === 'pickups' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Facility Pickup Requests
                  </h1>
                  <p className="text-xs text-slate-500">
                    Schedule and monitor direct courier van &amp; container chassis pickups from your warehouse.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const check = checkPlanLimit(subscription.tier, 'pickups');
                    if (!check.allowed) {
                      setLimitErrorMessage(check.message || 'Scheduled pickups are restricted on the Free plan.');
                      setUpgradeModalOpen(true);
                      return;
                    }
                    setIsPickupModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule New Pickup</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                {pickups.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No pickups scheduled yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Schedule a van or drayage truck to collect cargo directly from your factory or depot.
                    </p>
                    <button
                      onClick={() => {
                        const check = checkPlanLimit(subscription.tier, 'pickups');
                        if (!check.allowed) {
                          setLimitErrorMessage(check.message || 'Scheduled pickups are restricted on the Free plan.');
                          setUpgradeModalOpen(true);
                          return;
                        }
                        setIsPickupModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Schedule First Pickup
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pickups.map((p) => (
                      <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{p.pickupAddress}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {p.status}
                            </span>
                          </div>
                          <p className="text-slate-500">
                            Date: <strong className="text-slate-700">{p.pickupDate}</strong> &bull; Time:{' '}
                            <strong className="text-slate-700">{p.timeSlot}</strong> &bull; {p.packageCount} pkgs ({p.cargoType})
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Driver: {p.assignedDriver || 'Assigning...'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & SETTINGS (REQUESTED FEATURE) */}
          {activeTab === 'profile' && (
            <ProfileSettingsForm
              key={user.uid + (userProfile?.updatedAt || '')}
              user={user}
              userProfile={userProfile}
              initials={initials}
              onSaveProfile={handleSaveProfile}
              onTriggerReset={handleTriggerPasswordReset}
              sendingReset={sendingReset}
              passwordResetSent={passwordResetSent}
            />
          )}

          {/* TAB 5: ADDRESSES & HUBS */}
          {activeTab === 'hubs' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Regional Command Hubs &amp; Terminals
                </h1>
                <p className="text-xs text-slate-500">
                  Direct contact details, customs desks, and terminal addresses across our global corridors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    city: 'Dar es Salaam (Global HQ)',
                    address: 'Samora Avenue, Harbour View Tower, 7th Floor',
                    phone: '+255 773 306 684',
                    email: 'operations@logisticschain.io',
                    modes: 'Ocean Liner & Air Cargo Gateway',
                  },
                  {
                    city: 'Zanzibar Port (Malindi)',
                    address: 'Malindi Wharf, Marine Terminal Gate 2',
                    phone: '+255 773 889 012',
                    email: 'zanzibar@logisticschain.io',
                    modes: 'Feeder Ferry & Fast Cargo',
                  },
                  {
                    city: 'Rotterdam Gateway',
                    address: 'Maasvlakte 2, Haven 9200, 3000 AH Rotterdam',
                    phone: '+31 10 555 8920',
                    email: 'rotterdam@logisticschain.io',
                    modes: 'Deepwater Container Hub',
                  },
                  {
                    city: 'Dubai Logistics City',
                    address: 'DWC Aviation District, Building B4, Cargo Hub',
                    phone: '+971 4 888 1200',
                    email: 'dubai@logisticschain.io',
                    modes: 'Air Cargo & Middle East Crossdock',
                  },
                ].map((hub) => (
                  <div key={hub.city} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-sm">{hub.city}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {hub.modes}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{hub.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{hub.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{hub.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Shipment Details Drawer */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-teal-400 tracking-wider">
                  Waybill Manifest
                </span>
                <h3 className="text-lg font-mono font-extrabold text-white">
                  {selectedShipment.trackingNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 block">Current Status</span>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full font-bold text-xs ${getStatusBadge(selectedShipment.status)}`}>
                    {selectedShipment.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Est. Delivery</span>
                  <span className="font-bold text-slate-900 text-sm mt-1 block">
                    {selectedShipment.estimatedDelivery}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Carrier &amp; Mode</span>
                  <span className="font-bold text-slate-800 mt-1 block">{selectedShipment.carrier}</span>
                  <span className="text-[11px] text-slate-500">{selectedShipment.mode} Freight</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Consignee</span>
                  <span className="font-bold text-slate-800 mt-1 block">{selectedShipment.customer}</span>
                  <span className="text-[11px] text-slate-500">{selectedShipment.weight}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Milestone Progress</h4>
                  {selectedShipment.status !== 'Delivered' && selectedShipment.status !== 'Cancelled' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {selectedShipment.status === 'Pending'
                        ? '3 phases remained'
                        : selectedShipment.status === 'Processing'
                        ? '2 phases remained'
                        : '1 phase remained'}
                    </span>
                  )}
                </div>
                <div className="space-y-4 border-l-2 border-slate-200 pl-4 ml-2">
                  {selectedShipment.events?.map((ev, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                          ev.completed ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      />
                      <p className="font-bold text-slate-800">{ev.title}</p>
                      <p className="text-[11px] text-slate-500">{ev.location}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#00e5c9]" />
                <h3 className="text-base font-bold text-white">Create Private Shipment</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Recipient / Consignee *</label>
                <input
                  type="text"
                  required
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="e.g. Zanzibar Maritime Trading Co."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Origin Terminal</label>
                  <input
                    type="text"
                    required
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Destination Hub</label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gross Weight</label>
                  <input
                    type="text"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="e.g. 15.5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pieces / Cartons</label>
                  <input
                    type="number"
                    value={newPieces}
                    onChange={(e) => setNewPieces(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Freight Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as 'Ocean' | 'Air' | 'Road')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Air">Air Express</option>
                    <option value="Ocean">Ocean Liner</option>
                    <option value="Road">Overland Truck</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px]">
                Shipment will be stored and indexed strictly under UID <strong>{user.uid.substring(0, 12)}...</strong> in your private Firestore database.
              </div>

              <button
                type="submit"
                disabled={creatingShipment}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {creatingShipment ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Register Manifest &amp; Issue Waybill</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pickup Request Modal */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Schedule Facility Pickup</h3>
              </div>
              <button onClick={() => setIsPickupModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedulePickup} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Warehouse / Dock Address *</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Samora Ave, Plot 14, Bay 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pickup Date</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Package Count</label>
                  <input
                    type="number"
                    value={pickupPackages}
                    onChange={(e) => setPickupPackages(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preferred Time Window</label>
                <select
                  value={pickupTimeSlot}
                  onChange={(e) => setPickupTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                >
                  <option>Morning (09:00 - 12:00)</option>
                  <option>Afternoon (13:00 - 16:00)</option>
                  <option>Evening (16:00 - 19:00)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cargo Type</label>
                <input
                  type="text"
                  value={pickupCargoType}
                  onChange={(e) => setPickupCargoType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={creatingPickup}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {creatingPickup ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Confirm Pickup Schedule</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  3
                </span>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Operational Alert</span>
                <p className="font-semibold text-slate-900">Flight ET-304 Delayed in Nairobi</p>
                <p className="text-slate-600 text-[11px]">Air freight transit revised by +2.5 hours due to weather corridor.</p>
                <span className="text-[10px] text-slate-400 font-mono">15 mins ago</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Vessel Berthing</span>
                <p className="font-semibold text-slate-900">Berth Window Confirmed at Dar Port</p>
                <p className="text-slate-600 text-[11px]">Vessel MSC Maya allocated Berth 4 for fast discharge.</p>
                <span className="text-[10px] text-slate-400 font-mono">1 hour ago</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Milestone Completed</span>
                <p className="font-semibold text-slate-900">Customs Clearance Verified</p>
                <p className="text-slate-600 text-[11px]">Shipment SWL-2026-000412 approved under AEO fast-track.</p>
                <span className="text-[10px] text-slate-400 font-mono">3 hours ago</span>
              </div>
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
          userRole={currentRole}
          company={userProfile?.company || 'Your Organization'}
          shipments={shipments}
          orders={orders}
          pickups={pickups}
          onSelectShipment={(shp) => {
            setSelectedShipment(shp);
            setIsInsightsModalOpen(false);
          }}
          onNavigateTab={(tab) => {
            if (tab === 'shipments' || tab === 'pickups' || tab === 'overview') {
              setActiveTab(tab);
            }
            setIsInsightsModalOpen(false);
          }}
        />
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
