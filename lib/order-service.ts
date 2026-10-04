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
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { OrderRecord, OrderStatus, OrderItem, ShipmentRecord } from './auth-context';

export interface OrderFormData {
  orderNumber?: string;
  clientId: string;
  clientName: string;
  clientContact?: string;
  shipmentId?: string;
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
}

export const generateOrderNumber = (): string => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `ORD-2026-${num}`;
};

export const INITIAL_DEMO_ORDERS: Omit<OrderRecord, 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'ord_demo_1',
    orderNumber: 'ORD-2026-884102',
    clientId: 'cli_demo_1', // Acme Heavy Industries
    clientName: 'Acme Heavy Industries',
    clientContact: 'Sarah Chen',
    shipmentId: 'shp_demo_1',
    shipmentReference: 'REF-2026-884102',
    title: 'Hydraulic Excavator Spare Assemblies & Turbines',
    status: 'In Fulfillment',
    orderDate: '2026-09-24',
    deliveryDeadline: '2026-09-30',
    totalAmount: 48500,
    currency: 'USD',
    origin: 'Dar es Salaam Central Gateway',
    destination: 'Arusha Logistics Depot Block 4',
    notes: 'Fragile precision hydraulics. AEO expedited customs clearance requested.',
    items: [
      { id: 'item_1', description: 'Heavy Duty Hydraulic Piston Valve Assembly', quantity: 4, unitPrice: 8500, weight: '1,200 kg' },
      { id: 'item_2', description: 'Caterpillar Engine Gasket Seal Set', quantity: 12, unitPrice: 450, weight: '180 kg' },
      { id: 'item_3', description: 'Rotary Actuator Drive Motor', quantity: 2, unitPrice: 4550, weight: '470 kg' },
    ],
  },
  {
    id: 'ord_demo_2',
    orderNumber: 'ORD-2026-739184',
    clientId: 'cli_demo_2', // Safari Commodities Ltd
    clientName: 'Safari Commodities Ltd',
    clientContact: 'Juma Rashid',
    shipmentId: 'shp_demo_2',
    shipmentReference: 'REF-2026-739184',
    title: 'Export AA Grade Arabica Green Coffee Lot #44',
    status: 'Shipped',
    orderDate: '2026-09-22',
    deliveryDeadline: '2026-10-04',
    totalAmount: 72000,
    currency: 'USD',
    origin: 'Moshi Coffee Curing Mill',
    destination: 'Rotterdam Europort Terminal, Netherlands',
    notes: 'Reefer container set at 14°C continuous ventilation. GrainPro hermetic inner liners.',
    items: [
      { id: 'item_4', description: 'Kilimanjaro AA Peaberry Raw Green Coffee (60kg bags)', quantity: 300, unitPrice: 240, weight: '18,000 kg' },
    ],
  },
  {
    id: 'ord_demo_3',
    orderNumber: 'ORD-2026-552019',
    clientId: 'cli_demo_3', // Nile Tech Distribution
    clientName: 'Nile Tech Distribution',
    clientContact: 'David Okonjo',
    shipmentId: 'shp_demo_3',
    shipmentReference: 'REF-2026-552019',
    title: 'Sub-Saharan Fiber Optic Transceivers & Routers',
    status: 'Confirmed',
    orderDate: '2026-09-25',
    deliveryDeadline: '2026-10-02',
    totalAmount: 114000,
    currency: 'USD',
    origin: 'Nairobi Tech Valley Warehouse 8',
    destination: 'Kigali Free Trade Zone, Rwanda',
    notes: 'High-value avionics cargo. Tamper-evident GPS telematics seal required.',
    items: [
      { id: 'item_5', description: '100G QSFP28 Enterprise Fiber Transceivers', quantity: 80, unitPrice: 650, weight: '85 kg' },
      { id: 'item_6', description: 'Edge Core Aggregation Routers 24-Port', quantity: 12, unitPrice: 5166, weight: '240 kg' },
    ],
  },
  {
    id: 'ord_demo_4',
    orderNumber: 'ORD-2026-319940',
    clientId: 'cli_demo_4', // Zanzibar Spice Merchants
    clientName: 'Zanzibar Spice Merchants',
    clientContact: 'Amina Khatib',
    title: 'Hand-picked Zanzibar Whole Cloves & Cinnamon Bales',
    status: 'Draft',
    orderDate: '2026-09-26',
    deliveryDeadline: '2026-10-10',
    totalAmount: 26800,
    currency: 'USD',
    origin: 'Stone Town Harbor Quayside',
    destination: 'Mombasa Old Port, Kenya',
    notes: 'Awaiting export Phytosanitary inspection report before vessel loading.',
    items: [
      { id: 'item_7', description: 'Grade 1 Premium Sun-Dried Cloves', quantity: 50, unitPrice: 380, weight: '2,500 kg' },
      { id: 'item_8', description: 'Ceylon Type Cinnamon Bales (50kg)', quantity: 20, unitPrice: 390, weight: '1,000 kg' },
    ],
  },
];

const DEMO_ORDERS_KEY = 'logistics_demo_orders_';

const getDemoOrders = (userId: string): OrderRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${DEMO_ORDERS_KEY}${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  const now = new Date().toISOString();
  const initial: OrderRecord[] = INITIAL_DEMO_ORDERS.map((demo) => ({
    ...demo,
    userId,
    createdAt: now,
    updatedAt: now,
  }));
  saveDemoOrders(userId, initial);
  return initial;
};

const saveDemoOrders = (userId: string, orders: OrderRecord[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${DEMO_ORDERS_KEY}${userId}`, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('logistics_orders_updated', { detail: { userId } }));
};

/**
 * Fetch all orders belonging to the specified user
 */
export const getUserOrders = async (userId: string): Promise<OrderRecord[]> => {
  if (!userId) return [];
  if (userId.startsWith('demo_')) {
    return getDemoOrders(userId);
  }

  try {
    const ordersRef = collection(db, 'users', userId, 'orders');
    const snap = await getDocs(ordersRef);

    // If empty fresh account, seed initial demo orders
    if (snap.empty) {
      await seedDemoOrders(userId);
      const freshSnap = await getDocs(ordersRef);
      return freshSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, 'id'>),
      }));
    }

    const orders: OrderRecord[] = [];
    snap.forEach((d) => {
      orders.push({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, 'id'>),
      });
    });

    // Sort by orderDate or createdAt descending
    return orders.sort((a, b) => {
      const dateA = a.orderDate || a.createdAt || '';
      const dateB = b.orderDate || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  } catch (err) {
    console.warn('Error fetching user orders from Firestore, fallback to demo:', err);
    return getDemoOrders(userId);
  }
};

/**
 * Seed initial demo orders for onboarding
 */
export const seedDemoOrders = async (userId: string): Promise<void> => {
  if (!userId) return;
  const now = new Date().toISOString();
  try {
    for (let i = 0; i < INITIAL_DEMO_ORDERS.length; i++) {
      const demo = INITIAL_DEMO_ORDERS[i];
      const docRef = doc(db, 'users', userId, 'orders', demo.id);
      await setDoc(docRef, {
        ...demo,
        userId,
        createdAt: now,
        updatedAt: now,
      });

      // If linked to a shipment, sync back to the shipment record as well
      if (demo.shipmentId) {
        try {
          const shpRef = doc(db, 'users', userId, 'shipments', demo.shipmentId);
          await updateDoc(shpRef, {
            orderId: demo.id,
            orderNumber: demo.orderNumber,
            clientId: demo.clientId,
          });
        } catch {
          // If shipment doesn't exist yet, ignore
        }
      }
    }
  } catch (err) {
    console.warn('Error seeding demo orders in Firestore:', err);
  }
};

/**
 * Fetch a single order by ID
 */
export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<OrderRecord | null> => {
  if (!userId || !orderId) return null;
  if (userId.startsWith('demo_')) {
    const list = getDemoOrders(userId);
    return list.find((o) => o.id === orderId) || null;
  }

  try {
    const docRef = doc(db, 'users', userId, 'orders', orderId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const list = getDemoOrders(userId);
      return list.find((o) => o.id === orderId) || null;
    }
    return {
      id: snap.id,
      ...(snap.data() as Omit<OrderRecord, 'id'>),
    };
  } catch (err) {
    console.warn('Error fetching order by id, fallback to demo:', err);
    const list = getDemoOrders(userId);
    return list.find((o) => o.id === orderId) || null;
  }
};

/**
 * Create a new order record
 */
export const createOrder = async (
  userId: string,
  formData: OrderFormData
): Promise<OrderRecord> => {
  const docId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = formData.orderNumber?.trim() || generateOrderNumber();
  const now = new Date().toISOString();

  const newOrder: OrderRecord = {
    id: docId,
    userId,
    orderNumber,
    clientId: formData.clientId,
    clientName: formData.clientName.trim(),
    clientContact: formData.clientContact?.trim(),
    shipmentId: formData.shipmentId || undefined,
    shipmentReference: formData.shipmentReference || undefined,
    title: formData.title.trim(),
    status: formData.status || 'Draft',
    orderDate: formData.orderDate || new Date().toISOString().split('T')[0],
    deliveryDeadline: formData.deliveryDeadline || '',
    totalAmount: Number(formData.totalAmount) || 0,
    currency: formData.currency || 'USD',
    origin: formData.origin.trim(),
    destination: formData.destination.trim(),
    notes: formData.notes?.trim() || '',
    items: formData.items || [],
    createdAt: now,
    updatedAt: now,
  };

  if (userId.startsWith('demo_')) {
    const list = getDemoOrders(userId);
    saveDemoOrders(userId, [newOrder, ...list]);
    return newOrder;
  }

  try {
    const docRef = doc(db, 'users', userId, 'orders', docId);
    await setDoc(docRef, newOrder);

    // If a shipment was linked upon order creation, sync the orderId to the shipment
    if (formData.shipmentId) {
      try {
        const shpRef = doc(db, 'users', userId, 'shipments', formData.shipmentId);
        await updateDoc(shpRef, {
          orderId: docId,
          orderNumber: orderNumber,
          clientId: formData.clientId,
          customer: formData.clientName,
        });
      } catch (e) {
        console.warn('Could not sync order to shipment:', e);
      }
    }

    return newOrder;
  } catch (err) {
    console.warn('Firestore createOrder fallback to demo storage:', err);
    const list = getDemoOrders(userId);
    saveDemoOrders(userId, [newOrder, ...list]);
    return newOrder;
  }
};

/**
 * Update an existing order
 */
export const updateOrder = async (
  userId: string,
  orderId: string,
  updates: Partial<OrderFormData>
): Promise<void> => {
  if (userId.startsWith('demo_')) {
    const list = getDemoOrders(userId);
    const updated = list.map((o) => (o.id === orderId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o));
    saveDemoOrders(userId, updated);
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'orders', orderId);
    const payload: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, payload);

    // Sync to linked shipment if provided
    if (updates.shipmentId) {
      try {
        const shpRef = doc(db, 'users', userId, 'shipments', updates.shipmentId);
        const patch: Record<string, unknown> = {
          orderId,
          updatedAt: new Date().toISOString(),
        };
        if (updates.orderNumber) patch.orderNumber = updates.orderNumber;
        if (updates.clientId) patch.clientId = updates.clientId;
        if (updates.clientName) patch.customer = updates.clientName;
        await updateDoc(shpRef, patch);
      } catch (e) {
        console.warn('Could not sync shipment on order update:', e);
      }
    }
  } catch (err) {
    console.warn('Firestore updateOrder fallback to demo storage:', err);
    const list = getDemoOrders(userId);
    const updated = list.map((o) => (o.id === orderId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o));
    saveDemoOrders(userId, updated);
  }
};

/**
 * Delete an order record
 */
export const deleteOrder = async (
  userId: string,
  orderId: string
): Promise<void> => {
  if (userId.startsWith('demo_')) {
    const list = getDemoOrders(userId);
    saveDemoOrders(userId, list.filter((o) => o.id !== orderId));
    return;
  }

  // First clear reference on any linked shipment
  try {
    const order = await getOrderById(userId, orderId);
    if (order?.shipmentId) {
      const shpRef = doc(db, 'users', userId, 'shipments', order.shipmentId);
      await updateDoc(shpRef, {
        orderId: null,
        orderNumber: null,
      });
    }
  } catch (e) {
    console.warn('Could not unlink shipment before order deletion:', e);
  }

  try {
    const docRef = doc(db, 'users', userId, 'orders', orderId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore deleteOrder fallback to demo storage:', err);
    const list = getDemoOrders(userId);
    saveDemoOrders(userId, list.filter((o) => o.id !== orderId));
  }
};

/**
 * Fetch all orders associated with a specific client ID
 */
export const getClientOrders = async (
  userId: string,
  clientId: string
): Promise<OrderRecord[]> => {
  if (!userId || !clientId) return [];
  try {
    const allOrders = await getUserOrders(userId);
    return allOrders.filter((ord) => ord.clientId === clientId);
  } catch (err) {
    console.error('Error fetching client orders:', err);
    return [];
  }
};

/**
 * Link an order to an existing or new shipment
 */
export const linkOrderWithShipment = async (
  userId: string,
  orderId: string,
  shipment: ShipmentRecord
): Promise<void> => {
  // 1. Update order
  const orderRef = doc(db, 'users', userId, 'orders', orderId);
  await updateDoc(orderRef, {
    shipmentId: shipment.id,
    shipmentReference: shipment.referenceNumber || shipment.trackingNumber,
    status: 'In Fulfillment',
    updatedAt: new Date().toISOString(),
  });

  // 2. Update shipment
  const shpRef = doc(db, 'users', userId, 'shipments', shipment.id);
  const orderSnap = await getDoc(orderRef);
  const orderData = orderSnap.data() as OrderRecord;
  await updateDoc(shpRef, {
    orderId: orderId,
    orderNumber: orderData?.orderNumber || '',
    clientId: orderData?.clientId || shipment.clientId,
    customer: orderData?.clientName || shipment.customer,
    updatedAt: new Date().toISOString(),
  });
};
