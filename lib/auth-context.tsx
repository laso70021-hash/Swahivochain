'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from './subscription-plans';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  company: string;
  phone?: string;
  role: 'Customer' | 'Dealer Operations';
  organization?: string;
  address?: string;
  defaultHub?: string;
  subscription?: SubscriptionInfo;
  createdAt?: string;
  updatedAt?: string;
}

export type ShipmentStatus = 'Pending' | 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface TrackingEvent {
  id?: string;
  time: string;
  title: string;
  location: string;
  completed: boolean;
  status?: ShipmentStatus;
  note?: string;
  type?: 'status_change' | 'milestone' | 'checkpoint';
  author?: string;
}

export interface ClientRecord {
  id: string;
  userId: string;
  company: string; // Company or client name
  contactPerson: string; // Contact person
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'Draft'
  | 'Confirmed'
  | 'In Fulfillment'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  weight?: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  orderNumber: string;
  clientId: string; // Associated with Client
  clientName: string;
  clientContact?: string;
  shipmentId?: string; // Associated with Shipment
  shipmentReference?: string;
  title: string;
  status: OrderStatus;
  orderDate: string;
  deliveryDeadline?: string;
  totalAmount: number;
  currency: string;
  origin: string;
  destination: string;
  notes?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

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

export interface ShipmentRecord {
  id: string;
  userId: string;
  clientId?: string; // Associated with Client
  orderId?: string; // Associated with Order
  orderNumber?: string;
  referenceNumber: string;
  trackingNumber: string;
  customer: string;
  origin: string;
  destination: string;
  shipmentDate: string;
  expectedDeliveryDate: string;
  status: ShipmentStatus;
  cargoInfo: string;
  quantity: number;
  weight: string;
  notes?: string;
  mode: 'Ocean' | 'Air' | 'Road';
  carrier?: string;
  currentLocation?: string;
  recipientPhone?: string;
  pieces?: number;
  date?: string;
  estimatedDelivery?: string;
  events?: TrackingEvent[]; // Multiple tracking events
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, company: string, role?: 'Customer' | 'Dealer Operations', phone?: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  demoLogin: (role: 'Customer' | 'Dealer Operations') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to construct a lightweight mock Firebase User object for instant client-side demo sessions
const createDemoUser = (role: 'Customer' | 'Dealer Operations'): User => {
  const isCust = role === 'Customer';
  const uid = isCust ? 'demo_shipper_001' : 'demo_ops_001';
  const email = isCust ? 'demo.shipper@logisticschain.io' : 'demo.ops@logisticschain.io';
  const displayName = isCust ? 'David Kimaro' : 'Captain Hassan M.';
  return {
    uid,
    email,
    displayName,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: 'demo',
        uid,
        displayName,
        email,
        phoneNumber: null,
        photoURL: null,
      },
    ],
    refreshToken: 'demo-token',
    tenantId: null,
    phoneNumber: '+255 773 889 012',
    photoURL: null,
    providerId: 'demo',
    delete: async () => {},
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () =>
      ({
        token: 'demo-token',
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 86400000).toISOString(),
        signInProvider: 'demo',
        signInSecondFactor: null,
        claims: {},
      } as unknown),
    reload: async () => {},
    toJSON: () => ({ uid, email, displayName }),
  } as unknown as User;
};

// Initial seed shipments for fresh user accounts
const getSeedShipments = (userId: string, userName: string, company: string): ShipmentRecord[] => [
  {
    id: `shp_${Date.now()}_1`,
    userId,
    referenceNumber: 'REF-2026-00412',
    trackingNumber: 'REF-2026-00412',
    customer: userName || 'Acme Cargo Ltd',
    recipientPhone: '+255 712 345 678',
    destination: 'Dar es Salaam Central Port',
    origin: 'Shanghai Deepwater Gateway',
    shipmentDate: '2026-09-24',
    expectedDeliveryDate: '2026-09-28',
    weight: '3.8 kg',
    quantity: 2,
    cargoInfo: 'High-Precision Electronic Sensors & Avionics',
    notes: 'Handle with care; maintain upright orientation; fragile sensors.',
    status: 'In Transit',
    mode: 'Air',
    carrier: 'Auric Air Express',
    currentLocation: 'Dar es Salaam Central Air Freight Hub',
    events: [
      { time: 'Sep 24, 08:30 AM', title: 'Manifest Created & Customs Cleared', location: 'Shanghai PVG', completed: true },
      { time: 'Sep 25, 03:15 PM', title: 'Departed Transit Waypoint', location: 'Dubai DWC Hub', completed: true },
      { time: 'Sep 26, 09:20 AM', title: 'Arrived at Sorting Gateway', location: 'Dar es Salaam Air Hub', completed: true },
      { time: 'Pending', title: 'Dispatched to Delivery Courier', location: (userName || 'Acme Cargo') + ' Warehouse', completed: false },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: `shp_${Date.now()}_2`,
    userId,
    referenceNumber: 'REF-2026-00411',
    trackingNumber: 'REF-2026-00411',
    customer: company ? `${company} Operations` : userName,
    recipientPhone: '+255 773 889 012',
    destination: 'Zanzibar Port (Malindi Wharf)',
    origin: 'Rotterdam Sea Terminal',
    shipmentDate: '2026-09-20',
    expectedDeliveryDate: '2026-10-02',
    weight: '124.0 kg',
    quantity: 4,
    cargoInfo: 'Industrial Marine Hardware & Pump Spares',
    notes: 'Requires forklift discharge at Malindi Berth 2.',
    status: 'Processing',
    mode: 'Ocean',
    carrier: 'Azam Marine Fast Cargo',
    currentLocation: 'Rotterdam Sea Terminal Consolidation Dock',
    events: [
      { time: 'Sep 20, 09:00 AM', title: 'Consignment Received at Origin Dock', location: 'Rotterdam Port', completed: true },
      { time: 'Sep 22, 02:40 PM', title: 'Customs Pre-Clearance Verification', location: 'Europort Terminal', completed: true },
      { time: 'Pending', title: 'Vessel Berthing & Discharge', location: 'Zanzibar Malindi', completed: false },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: `shp_${Date.now()}_3`,
    userId,
    referenceNumber: 'REF-2026-00410',
    trackingNumber: 'REF-2026-00410',
    customer: userName,
    recipientPhone: '+255 784 556 778',
    destination: 'Arusha Logistics Center',
    origin: 'Dubai Logistics City',
    shipmentDate: '2026-09-25',
    expectedDeliveryDate: '2026-09-29',
    weight: '18.5 kg',
    quantity: 3,
    cargoInfo: 'Commercial Textiles & Garments',
    notes: 'Scheduled for bonded inland transport via Namanga border corridor.',
    status: 'Pending',
    mode: 'Road',
    carrier: 'Logistics Chain Inland Fleet',
    currentLocation: 'Regional Sorting Facility - Arusha',
    events: [
      { time: 'Sep 25, 11:20 AM', title: 'Shipment Created by Consignor', location: 'Dubai DWC Hub', completed: true },
      { time: 'Pending', title: 'Awaiting Transshipment Departure', location: 'Namanga Border Corridor', completed: false },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: `shp_${Date.now()}_4`,
    userId,
    referenceNumber: 'REF-2026-00409',
    trackingNumber: 'REF-2026-00409',
    customer: userName,
    recipientPhone: '+255 754 112 233',
    destination: 'Mwanza Lake Freight Terminal',
    origin: 'Nairobi Cargo Terminal',
    shipmentDate: '2026-09-18',
    expectedDeliveryDate: '2026-09-20',
    weight: '2.1 kg',
    quantity: 1,
    cargoInfo: 'Medical Testing Supplies & Reagents',
    notes: 'Temperature-monitored ambient cargo. Delivered with signed Proof of Delivery.',
    status: 'Delivered',
    mode: 'Air',
    carrier: 'Air Tanzania Cargo',
    currentLocation: 'Delivered to Consignee (Signature Verified)',
    events: [
      { time: 'Sep 18, 02:00 PM', title: 'Package Dispatched from JKIA', location: 'Nairobi Airport', completed: true },
      { time: 'Sep 19, 09:15 AM', title: 'Courier Out for Delivery', location: 'Mwanza Center', completed: true },
      { time: 'Sep 20, 02:45 PM', title: 'Delivered and Signed by Consignee', location: 'Mwanza CBD', completed: true },
    ],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const seedUserShipmentsIfEmpty = async (userId: string, userName: string, company: string) => {
    try {
      const shipmentsCol = collection(db, 'users', userId, 'shipments');
      const snap = await getDocs(shipmentsCol);
      if (snap.empty) {
        const seeds = getSeedShipments(userId, userName, company);
        for (const item of seeds) {
          await setDoc(doc(db, 'users', userId, 'shipments', item.id), item);
        }
      }
    } catch (err) {
      console.warn('Initial shipment seeding note:', err);
    }
  };

  // Sync profile from Firestore whenever user auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Authenticated with Firebase: clear demo session
        if (typeof window !== 'undefined') {
          localStorage.removeItem('logistics_chain_demo_session');
        }
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            // Document doesn't exist yet, create a fallback profile
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Authorized Shipper',
              company: 'Logistics Chain Client',
              role: 'Customer',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newProfile);
              await seedUserShipmentsIfEmpty(currentUser.uid, newProfile.displayName, newProfile.company);
            } catch (writeErr) {
              console.warn('Initial profile doc creation note:', writeErr);
            }
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Profile read note from Firestore (using session profile):', err);
          // Construct in-memory profile from authenticated Firebase user so app remains functional
          setUserProfile((prev) => prev || {
            userId: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Authorized Shipper',
            company: 'Logistics Chain Client',
            role: 'Customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        setLoading(false);
      } else {
        // Check if there is an active demo user
        const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('logistics_chain_demo_session') : null;
        if (!storedDemo) {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const currentUser = cred.user;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('logistics_chain_demo_session');
      }
      setUser(currentUser);

      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            userId: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Authorized Shipper',
            company: 'Logistics Chain Client',
            role: 'Customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDocRef, newProfile);
            await seedUserShipmentsIfEmpty(currentUser.uid, newProfile.displayName, newProfile.company);
          } catch (writeErr) {
            console.warn('Google sign-in profile creation note:', writeErr);
          }
          setUserProfile(newProfile);
        }
      } catch (readErr) {
        console.warn('Google sign-in profile fetch note:', readErr);
        setUserProfile({
          userId: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Authorized Shipper',
          company: 'Logistics Chain Client',
          role: 'Customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      console.error('Google Sign-In error:', err);
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    company: string,
    role: 'Customer' | 'Dealer Operations' = 'Customer',
    phone: string = ''
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('logistics_chain_demo_session');
      }

      const newProfile: UserProfile = {
        userId: cred.user.uid,
        email,
        displayName,
        company: company || 'Logistics Chain Client',
        phone: phone || '',
        role,
        organization: company || 'Enterprise Logistics',
        address: 'East Africa Corridors',
        defaultHub: 'Dar es Salaam Central Gateway',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);

      // Seed default private shipments for immediate rich experience
      await seedUserShipmentsIfEmpty(cred.user.uid, displayName, company);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
        throw new Error(
          'Email/Password sign-in is disabled in this Firebase project. Please click "Continue with Google" or enable Email/Password provider in the Firebase Console under Authentication > Sign-in method.'
        );
      }
      throw err;
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logistics_chain_demo_session');
      }
      const userDocRef = doc(db, 'users', cred.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data() as UserProfile);
      } else {
        const fallback: UserProfile = {
          userId: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || 'Authorized Shipper',
          company: 'Logistics Chain Client',
          role: 'Customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, fallback);
        setUserProfile(fallback);
        await seedUserShipmentsIfEmpty(cred.user.uid, fallback.displayName, fallback.company);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
        throw new Error(
          'Email/Password sign-in is disabled in this Firebase project. Please click "Continue with Google" or enable Email/Password provider in the Firebase Console under Authentication > Sign-in method.'
        );
      }
      throw err;
    }
  };

  const logOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('logistics_chain_demo_session');
    }
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
        throw new Error(
          'Email password reset is not supported when Email/Password provider is disabled in Firebase Console. Please sign in with Google.'
        );
      }
      throw err;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');

    const updated = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (user.uid.startsWith('demo_')) {
      setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, updated);

    if (data.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }

    setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const demoLogin = async (role: 'Customer' | 'Dealer Operations') => {
    const demoEmail = role === 'Customer' ? 'demo.shipper@logisticschain.io' : 'demo.ops@logisticschain.io';
    const demoPass = 'LogisticsChain2026!';
    const demoName = role === 'Customer' ? 'David Kimaro' : 'Captain Hassan M.';
    const demoCompany = role === 'Customer' ? 'Zanzibar Spice & Maritime Co.' : 'SwiftLogix Command Ops';

    try {
      // Try Firebase auth if email/password is enabled in this project
      try {
        await logIn(demoEmail, demoPass);
        return;
      } catch (firstErr: unknown) {
        const firstMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
        if (firstMsg.includes('operation-not-allowed')) {
          throw firstErr; // Don't try signUp if operation is not allowed
        }
        await signUp(demoEmail, demoPass, demoName, demoCompany, role, '+255 773 889 012');
        return;
      }
    } catch (err: unknown) {
      // If Firebase Email/Password provider is disabled (operation-not-allowed) or throttled,
      // activate instant client-side demo mode so the user can test all features without hindrance!
      console.info('Activating instant guest demo session:', err);
      const demoUser = createDemoUser(role);
      const demoProfile: UserProfile = {
        userId: demoUser.uid,
        email: demoEmail,
        displayName: demoName,
        company: demoCompany,
        role,
        phone: '+255 773 889 012',
        organization: demoCompany,
        address: 'East Africa Corridors',
        defaultHub: 'Dar es Salaam Central Gateway',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'logistics_chain_demo_session',
          JSON.stringify({ uid: demoUser.uid, role })
        );
      }
      setUser(demoUser);
      setUserProfile(demoProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        logIn,
        signInWithGoogle,
        logOut,
        resetPassword,
        updateUserProfile,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

