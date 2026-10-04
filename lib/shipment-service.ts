import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { ShipmentRecord, ShipmentStatus, TrackingEvent } from './auth-context';

export interface ShipmentFormData {
  referenceNumber: string;
  clientId?: string;
  orderId?: string;
  orderNumber?: string;
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
}

export const generateReferenceNumber = (): string => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `REF-2026-${num}`;
};

export const formatTrackingTimestamp = (dateInput?: string | Date): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    return (
      fallback.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      fallback.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  }
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
};

export interface DeliveryWorkflowStage {
  name: string;
  label: string;
  description: string;
  state: 'completed' | 'current' | 'upcoming' | 'cancelled';
}

export interface DeliveryProgressInfo {
  percentage: number;
  currentStageName: string;
  stages: DeliveryWorkflowStage[];
  statusSummary: string;
  phasesRemainingCount: number;
  phasesRemainingLabels: string[];
  currentPhaseIndex: number;
  totalPhasesCount: number;
  isCompleted: boolean;
}

export const calculateDeliveryProgress = (status: ShipmentStatus): DeliveryProgressInfo => {
  if (status === 'Cancelled') {
    return {
      percentage: 0,
      currentStageName: 'Cancelled',
      statusSummary: 'Consignment marked cancelled. Transit operations are halted.',
      phasesRemainingCount: 0,
      phasesRemainingLabels: [],
      currentPhaseIndex: -1,
      totalPhasesCount: 2,
      isCompleted: false,
      stages: [
        {
          name: 'Pending',
          label: 'Order Registered',
          description: 'Waybill created and booking confirmed',
          state: 'completed',
        },
        {
          name: 'Cancelled',
          label: 'Shipment Cancelled',
          description: 'Consignment halted and voided',
          state: 'cancelled',
        },
      ],
    };
  }

  const stageKeys: ShipmentStatus[] = ['Pending', 'Processing', 'In Transit', 'Delivered'];
  const currentIndex = stageKeys.indexOf(status);

  const percentageMap: Record<ShipmentStatus, number> = {
    Pending: 25,
    Processing: 50,
    'In Transit': 75,
    Delivered: 100,
    Cancelled: 0,
  };

  const stages: DeliveryWorkflowStage[] = [
    {
      name: 'Pending',
      label: 'Order Registered',
      description: 'Waybill created and booking confirmed',
      state: currentIndex > 0 ? 'completed' : currentIndex === 0 ? 'current' : 'upcoming',
    },
    {
      name: 'Processing',
      label: 'Processing & Customs',
      description: 'Consolidation dock & export inspection',
      state: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'current' : 'upcoming',
    },
    {
      name: 'In Transit',
      label: 'In Transit',
      description: 'Underway via multimodal transport corridor',
      state: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'current' : 'upcoming',
    },
    {
      name: 'Delivered',
      label: 'Delivered',
      description: 'Arrived at destination & signature verified',
      state: currentIndex >= 3 ? 'completed' : 'upcoming',
    },
  ];

  const summaryMap: Record<ShipmentStatus, string> = {
    Pending: 'Booking registered. Cargo scheduled for receipt at origin terminal.',
    Processing: 'Cargo received at origin gateway and undergoing customs clearance.',
    'In Transit': 'Cargo en route aboard carrier transport corridor toward destination terminal.',
    Delivered: 'Consignment successfully delivered to consignee with proof of delivery verified.',
    Cancelled: 'Shipment is cancelled.',
  };

  // Remaining upcoming phases
  const remainingStages = stages.filter((st) => st.state === 'upcoming');
  const phasesRemainingCount = remainingStages.length;
  const phasesRemainingLabels = remainingStages.map((st) => st.label);

  return {
    percentage: percentageMap[status] ?? 25,
    currentStageName: status,
    stages,
    statusSummary: summaryMap[status] || 'Monitoring shipment telematics.',
    phasesRemainingCount,
    phasesRemainingLabels,
    currentPhaseIndex: Math.max(0, currentIndex),
    totalPhasesCount: stages.length,
    isCompleted: status === 'Delivered',
  };
};

const DEMO_SHIPMENTS_KEY = 'logistics_demo_shipments_';

const getDemoShipments = (userId: string): ShipmentRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${DEMO_SHIPMENTS_KEY}${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  const defaultSeeds: ShipmentRecord[] = [
    {
      id: `shp_demo_1`,
      userId,
      referenceNumber: 'REF-2026-00412',
      trackingNumber: 'REF-2026-00412',
      customer: 'Acme Heavy Industries',
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
        { time: 'Pending', title: 'Dispatched to Delivery Courier', location: 'Acme Cargo Warehouse', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: `shp_demo_2`,
      userId,
      referenceNumber: 'REF-2026-00411',
      trackingNumber: 'REF-2026-00411',
      customer: 'Safari Commodities Ltd',
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
      id: `shp_demo_3`,
      userId,
      referenceNumber: 'REF-2026-00410',
      trackingNumber: 'REF-2026-00410',
      customer: 'Nile Tech Distribution',
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
      id: `shp_demo_4`,
      userId,
      referenceNumber: 'REF-2026-00409',
      trackingNumber: 'REF-2026-00409',
      customer: 'Zanzibar Spice Merchants',
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
  saveDemoShipments(userId, defaultSeeds);
  return defaultSeeds;
};

const saveDemoShipments = (userId: string, shipments: ShipmentRecord[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${DEMO_SHIPMENTS_KEY}${userId}`, JSON.stringify(shipments));
  window.dispatchEvent(new CustomEvent('logistics_shipments_updated', { detail: { userId } }));
};

export const createShipment = async (
  userId: string,
  formData: ShipmentFormData
): Promise<ShipmentRecord> => {
  const docId = `shp_${Date.now()}`;
  const refNum = formData.referenceNumber?.trim() || generateReferenceNumber();
  const createdTimestamp = formatTrackingTimestamp();

  const initialEvents: TrackingEvent[] = [
    {
      id: `ev_init_${Date.now()}`,
      time: createdTimestamp,
      title: `Shipment Manifest Created (${formData.status})`,
      status: formData.status,
      location: formData.origin,
      completed: true,
      type: 'milestone',
      note: `Consignment waybill ${refNum} registered to customer ${formData.customer}.`,
      author: 'Logistics Chain Dispatcher',
    },
  ];

  if (formData.status === 'In Transit' || formData.status === 'Processing') {
    initialEvents.push({
      id: `ev_transit_${Date.now()}`,
      time: 'In Progress',
      title: 'Dispatched to Transport Corridor',
      status: formData.status,
      location: `${formData.origin} Sorting Facility`,
      completed: true,
      type: 'status_change',
      note: 'Customs cleared for multimodal transit.',
      author: 'Logistics Control Tower',
    });
  }

  if (formData.status === 'Delivered') {
    initialEvents.push({
      id: `ev_deliv_${Date.now()}`,
      time: createdTimestamp,
      title: 'Delivered to Consignee',
      status: 'Delivered',
      location: formData.destination,
      completed: true,
      type: 'status_change',
      note: 'Proof of Delivery signed and verified.',
      author: 'Final Mile Delivery Courier',
    });
  } else {
    initialEvents.push({
      id: `ev_sched_${Date.now()}`,
      time: formData.expectedDeliveryDate ? `Target: ${formData.expectedDeliveryDate}` : 'Scheduled',
      title: 'Expected Destination Arrival',
      location: formData.destination,
      completed: false,
      type: 'checkpoint',
      note: 'Berthing and customs release at destination hub.',
    });
  }

  const newShipment: ShipmentRecord = {
    id: docId,
    userId,
    clientId: formData.clientId || undefined,
    orderId: formData.orderId || undefined,
    orderNumber: formData.orderNumber || undefined,
    referenceNumber: refNum,
    trackingNumber: refNum,
    customer: formData.customer.trim(),
    origin: formData.origin.trim(),
    destination: formData.destination.trim(),
    shipmentDate: formData.shipmentDate || new Date().toISOString().split('T')[0],
    expectedDeliveryDate: formData.expectedDeliveryDate || '',
    status: formData.status || 'Pending',
    cargoInfo: formData.cargoInfo?.trim() || 'General Cargo',
    quantity: Number(formData.quantity) || 1,
    weight: formData.weight?.trim() || '1.0 kg',
    notes: formData.notes?.trim() || '',
    mode: formData.mode || 'Air',
    carrier:
      formData.carrier?.trim() ||
      (formData.mode === 'Air'
        ? 'Auric Air Express'
        : formData.mode === 'Ocean'
        ? 'Azam Marine Fast Cargo'
        : 'Logistics Chain Inland Fleet'),
    currentLocation: formData.currentLocation?.trim() || `${formData.origin} Sorting Facility`,
    recipientPhone: formData.recipientPhone?.trim() || '+255 770 000 000',
    events: initialEvents,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (userId.startsWith('demo_')) {
    const list = getDemoShipments(userId);
    saveDemoShipments(userId, [newShipment, ...list]);
    return newShipment;
  }

  try {
    const docRef = doc(db, 'users', userId, 'shipments', docId);
    await setDoc(docRef, newShipment);
    return newShipment;
  } catch (err) {
    console.warn('Firestore write fallback to local cache:', err);
    const list = getDemoShipments(userId);
    saveDemoShipments(userId, [newShipment, ...list]);
    return newShipment;
  }
};

export const updateShipment = async (
  userId: string,
  shipmentId: string,
  updates: Partial<ShipmentFormData & { currentLocation?: string; status?: ShipmentStatus }>
): Promise<void> => {
  if (userId.startsWith('demo_')) {
    const list = getDemoShipments(userId);
    const updatedList = list.map((s) => {
      if (s.id === shipmentId) {
        return {
          ...s,
          ...updates,
          trackingNumber: updates.referenceNumber || s.trackingNumber,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    saveDemoShipments(userId, updatedList);
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'shipments', shipmentId);
    const payload: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.referenceNumber) {
      payload.trackingNumber = updates.referenceNumber;
    }
    await updateDoc(docRef, payload);
  } catch (err) {
    console.warn('Firestore update fallback to local cache:', err);
    const list = getDemoShipments(userId);
    const updatedList = list.map((s) => (s.id === shipmentId ? { ...s, ...updates } : s));
    saveDemoShipments(userId, updatedList);
  }
};

export const updateShipmentStatus = async (
  userId: string,
  shipmentId: string,
  newStatus: ShipmentStatus,
  currentEvents: TrackingEvent[] = [],
  location?: string,
  note?: string,
  author?: string
): Promise<TrackingEvent[]> => {
  const now = new Date();
  const timeStr = formatTrackingTimestamp(now);

  const newEvent: TrackingEvent = {
    id: `ev_stat_${Date.now()}`,
    time: timeStr,
    title: `Status changed to ${newStatus}`,
    status: newStatus,
    location: location?.trim() || 'Logistics Control Tower',
    completed: true,
    type: 'status_change',
    note: note?.trim() || undefined,
    author: author?.trim() || 'Authorized Dispatch Operator',
  };

  const updatedEvents = currentEvents ? [...currentEvents, newEvent] : [newEvent];

  if (userId.startsWith('demo_')) {
    const list = getDemoShipments(userId);
    const updatedList = list.map((s) => {
      if (s.id === shipmentId) {
        return {
          ...s,
          status: newStatus,
          events: updatedEvents,
          currentLocation: location?.trim() || s.currentLocation,
          updatedAt: now.toISOString(),
        };
      }
      return s;
    });
    saveDemoShipments(userId, updatedList);
    return updatedEvents;
  }

  try {
    const docRef = doc(db, 'users', userId, 'shipments', shipmentId);
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      events: updatedEvents,
      updatedAt: now.toISOString(),
    };

    if (location?.trim()) {
      updatePayload.currentLocation = location.trim();
    }

    await updateDoc(docRef, updatePayload);
  } catch (err) {
    console.warn('Firestore updateShipmentStatus fallback to local cache:', err);
    const list = getDemoShipments(userId);
    const updatedList = list.map((s) => (s.id === shipmentId ? { ...s, status: newStatus, events: updatedEvents } : s));
    saveDemoShipments(userId, updatedList);
  }

  return updatedEvents;
};

export const recordTrackingEvent = async (
  userId: string,
  shipmentId: string,
  eventData: {
    title: string;
    location: string;
    time?: string;
    note?: string;
    completed?: boolean;
    status?: ShipmentStatus;
    author?: string;
  },
  currentEvents: TrackingEvent[] = []
): Promise<TrackingEvent[]> => {
  const timeStr = eventData.time?.trim() || formatTrackingTimestamp();

  const newEvent: TrackingEvent = {
    id: `ev_rec_${Date.now()}`,
    time: timeStr,
    title: eventData.title.trim(),
    location: eventData.location.trim() || 'Corridor Checkpoint',
    completed: eventData.completed !== undefined ? eventData.completed : true,
    status: eventData.status,
    note: eventData.note?.trim() || undefined,
    type: eventData.status ? 'status_change' : 'milestone',
    author: eventData.author?.trim() || 'Authorized Operations Specialist',
  };

  const updatedEvents = currentEvents ? [...currentEvents, newEvent] : [newEvent];

  if (userId.startsWith('demo_')) {
    const list = getDemoShipments(userId);
    const updatedList = list.map((s) => {
      if (s.id === shipmentId) {
        return {
          ...s,
          events: updatedEvents,
          currentLocation: eventData.location.trim(),
          status: eventData.status || s.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    saveDemoShipments(userId, updatedList);
    return updatedEvents;
  }

  try {
    const docRef = doc(db, 'users', userId, 'shipments', shipmentId);
    const payload: Record<string, unknown> = {
      events: updatedEvents,
      currentLocation: eventData.location.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (eventData.status) {
      payload.status = eventData.status;
    }

    await updateDoc(docRef, payload);
  } catch (err) {
    console.warn('recordTrackingEvent fallback to local cache:', err);
  }
  return updatedEvents;
};

export const deleteShipment = async (
  userId: string,
  shipmentId: string
): Promise<void> => {
  if (userId.startsWith('demo_')) {
    const list = getDemoShipments(userId);
    saveDemoShipments(userId, list.filter((s) => s.id !== shipmentId));
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'shipments', shipmentId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('deleteShipment fallback to local cache:', err);
    const list = getDemoShipments(userId);
    saveDemoShipments(userId, list.filter((s) => s.id !== shipmentId));
  }
};

export const getUserShipments = async (userId: string): Promise<ShipmentRecord[]> => {
  if (!userId) return [];
  if (userId.startsWith('demo_')) {
    return getDemoShipments(userId);
  }

  try {
    const colRef = collection(db, 'users', userId, 'shipments');
    const snap = await getDocs(colRef);
    const shipments: ShipmentRecord[] = [];
    snap.forEach((d) => {
      shipments.push({ ...(d.data() as ShipmentRecord), id: d.id });
    });
    return shipments;
  } catch (err) {
    console.warn('Error fetching user shipments from Firestore, using demo fallback:', err);
    return getDemoShipments(userId);
  }
};

export const getShipmentById = async (
  userId: string,
  shipmentId: string
): Promise<ShipmentRecord | null> => {
  if (!userId || !shipmentId) return null;
  if (userId.startsWith('demo_')) {
    const list = getDemoShipments(userId);
    return list.find((s) => s.id === shipmentId) || null;
  }

  try {
    const docRef = doc(db, 'users', userId, 'shipments', shipmentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const list = getDemoShipments(userId);
      return list.find((s) => s.id === shipmentId) || null;
    }
    return { ...(snap.data() as ShipmentRecord), id: snap.id };
  } catch (err) {
    console.warn('getShipmentById fallback to local demo:', err);
    const list = getDemoShipments(userId);
    return list.find((s) => s.id === shipmentId) || null;
  }
};

export const findShipmentByTracking = async (
  userId: string,
  queryCode: string
): Promise<ShipmentRecord | null> => {
  const clean = queryCode.trim().toLowerCase();
  if (!clean) return null;

  if (userId.startsWith('demo_')) {
    const list = getDemoShipments(userId);
    return (
      list.find(
        (s) =>
          (s.referenceNumber || '').toLowerCase() === clean ||
          (s.trackingNumber || '').toLowerCase() === clean ||
          s.id.toLowerCase() === clean
      ) || null
    );
  }

  try {
    const colRef = collection(db, 'users', userId, 'shipments');
    const snap = await getDocs(colRef);
    let match: ShipmentRecord | null = null;

    snap.forEach((d) => {
      const data = d.data() as ShipmentRecord;
      const ref = (data.referenceNumber || '').toLowerCase();
      const trk = (data.trackingNumber || '').toLowerCase();
      const docId = d.id.toLowerCase();
      if (ref === clean || trk === clean || docId === clean) {
        match = { ...data, id: d.id };
      }
    });

    if (!match) {
      const list = getDemoShipments(userId);
      match =
        list.find(
          (s) =>
            (s.referenceNumber || '').toLowerCase() === clean ||
            (s.trackingNumber || '').toLowerCase() === clean ||
            s.id.toLowerCase() === clean
        ) || null;
    }

    return match;
  } catch (err) {
    console.error('Error finding shipment by tracking code:', err);
    const list = getDemoShipments(userId);
    return (
      list.find(
        (s) =>
          (s.referenceNumber || '').toLowerCase() === clean ||
          (s.trackingNumber || '').toLowerCase() === clean ||
          s.id.toLowerCase() === clean
      ) || null
    );
  }
};
