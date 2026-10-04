import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { ClientRecord, ShipmentRecord } from './auth-context';

export interface ClientFormData {
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

export const INITIAL_DEMO_CLIENTS: Omit<ClientRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    company: 'Acme Heavy Industries',
    contactPerson: 'Sarah Chen',
    email: 'sarah.chen@acmeheavy.com',
    phone: '+255 744 123 456',
    address: 'Port Logistics Park Block 4B, Dar es Salaam, Tanzania',
    notes: 'Preferred air freight carrier. Requires AEO digital customs fast-track documentation 24h prior to gate-in.',
  },
  {
    company: 'Safari Commodities Ltd',
    contactPerson: 'Juma Rashid',
    email: 'juma.r@safaricommodities.tz',
    phone: '+255 788 987 654',
    address: 'Industrial Area Plot 12, Arusha, Tanzania',
    notes: 'Specializes in high-grade agricultural exports. Ocean reefer containers with continuous cold-chain monitoring required.',
  },
  {
    company: 'Nile Tech Distribution',
    contactPerson: 'David Okonjo',
    email: 'd.okonjo@niletech.co',
    phone: '+254 722 555 888',
    address: 'Tech Valley Tower Suite 600, Nairobi, Kenya',
    notes: 'High-value telecom avionics and micro-components. Mandatory tamper-evident GPS satellite seals.',
  },
  {
    company: 'Zanzibar Spice Merchants',
    contactPerson: 'Amina Khatib',
    email: 'amina@zanzibarspicemerchants.com',
    phone: '+255 777 334 221',
    address: 'Stone Town Harbor Quayside, Zanzibar',
    notes: 'Express marine cargo dispatch. Humidity-sensitive commodities requiring silica gel moisture packs.',
  },
];

const DEMO_CLIENTS_KEY = 'logistics_demo_clients_';

const getDemoClients = (userId: string): ClientRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${DEMO_CLIENTS_KEY}${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  const now = new Date().toISOString();
  const initial = INITIAL_DEMO_CLIENTS.map((demo, i) => ({
    ...demo,
    id: `cli_demo_${i + 1}`,
    userId,
    createdAt: now,
    updatedAt: now,
  }));
  saveDemoClients(userId, initial);
  return initial;
};

const saveDemoClients = (userId: string, clients: ClientRecord[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${DEMO_CLIENTS_KEY}${userId}`, JSON.stringify(clients));
  window.dispatchEvent(new CustomEvent('logistics_clients_updated', { detail: { userId } }));
};

/**
 * Fetch all clients belonging to the specified user
 */
export const getUserClients = async (userId: string): Promise<ClientRecord[]> => {
  if (!userId) return [];
  if (userId.startsWith('demo_')) {
    return getDemoClients(userId);
  }

  try {
    const clientsRef = collection(db, 'users', userId, 'clients');
    const snap = await getDocs(clientsRef);

    // If fresh account with no clients, auto-seed demo clients
    if (snap.empty) {
      await seedDemoClients(userId);
      const freshSnap = await getDocs(clientsRef);
      return freshSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ClientRecord, 'id'>),
      }));
    }

    const clients: ClientRecord[] = [];
    snap.forEach((d) => {
      clients.push({
        id: d.id,
        ...(d.data() as Omit<ClientRecord, 'id'>),
      });
    });

    // Sort by company name
    return clients.sort((a, b) => a.company.localeCompare(b.company));
  } catch (err) {
    console.warn('Error fetching user clients from Firestore, using demo fallback:', err);
    return getDemoClients(userId);
  }
};

/**
 * Seed initial demo clients for interactive onboarding
 */
export const seedDemoClients = async (userId: string): Promise<void> => {
  if (!userId) return;
  const now = new Date().toISOString();
  try {
    for (let i = 0; i < INITIAL_DEMO_CLIENTS.length; i++) {
      const demo = INITIAL_DEMO_CLIENTS[i];
      const docId = `cli_demo_${i + 1}`;
      const docRef = doc(db, 'users', userId, 'clients', docId);
      await setDoc(docRef, {
        ...demo,
        id: docId,
        userId,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (err) {
    console.warn('Error seeding demo clients in Firestore:', err);
  }
};

/**
 * Fetch a single client by ID
 */
export const getClientById = async (
  userId: string,
  clientId: string
): Promise<ClientRecord | null> => {
  if (!userId || !clientId) return null;
  if (userId.startsWith('demo_')) {
    const list = getDemoClients(userId);
    return list.find((c) => c.id === clientId) || null;
  }

  try {
    const docRef = doc(db, 'users', userId, 'clients', clientId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const list = getDemoClients(userId);
      return list.find((c) => c.id === clientId) || null;
    }
    return {
      id: snap.id,
      ...(snap.data() as Omit<ClientRecord, 'id'>),
    };
  } catch (err) {
    console.warn('Error fetching client by id, fallback to demo:', err);
    const list = getDemoClients(userId);
    return list.find((c) => c.id === clientId) || null;
  }
};

/**
 * Create a new client record
 */
export const createClient = async (
  userId: string,
  formData: ClientFormData
): Promise<ClientRecord> => {
  const docId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newClient: ClientRecord = {
    id: docId,
    userId,
    company: formData.company.trim(),
    contactPerson: formData.contactPerson.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    address: formData.address.trim(),
    notes: formData.notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  if (userId.startsWith('demo_')) {
    const list = getDemoClients(userId);
    saveDemoClients(userId, [newClient, ...list]);
    return newClient;
  }

  try {
    const docRef = doc(db, 'users', userId, 'clients', docId);
    await setDoc(docRef, newClient);
    return newClient;
  } catch (err) {
    console.warn('Firestore createClient fallback to demo storage:', err);
    const list = getDemoClients(userId);
    saveDemoClients(userId, [newClient, ...list]);
    return newClient;
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (
  userId: string,
  clientId: string,
  updates: Partial<ClientFormData>
): Promise<void> => {
  if (userId.startsWith('demo_')) {
    const list = getDemoClients(userId);
    const updated = list.map((c) => (c.id === clientId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    saveDemoClients(userId, updated);
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'clients', clientId);
    const payload: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, payload);
  } catch (err) {
    console.warn('Firestore updateClient fallback to demo storage:', err);
    const list = getDemoClients(userId);
    const updated = list.map((c) => (c.id === clientId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    saveDemoClients(userId, updated);
  }
};

/**
 * Delete a client record
 */
export const deleteClient = async (
  userId: string,
  clientId: string
): Promise<void> => {
  if (userId.startsWith('demo_')) {
    const list = getDemoClients(userId);
    saveDemoClients(userId, list.filter((c) => c.id !== clientId));
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'clients', clientId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore deleteClient fallback to demo storage:', err);
    const list = getDemoClients(userId);
    saveDemoClients(userId, list.filter((c) => c.id !== clientId));
  }
};

/**
 * Fetch all shipments associated with a specific client:
 * Checks either by direct clientId link, or by customer matching company or contact name
 */
export const getClientShipments = async (
  userId: string,
  client: ClientRecord
): Promise<ShipmentRecord[]> => {
  if (!userId || !client) return [];
  try {
    const shipmentsRef = collection(db, 'users', userId, 'shipments');
    const snap = await getDocs(shipmentsRef);

    const clientShipments: ShipmentRecord[] = [];
    const clientCompanyLower = client.company.toLowerCase().trim();
    const clientContactLower = client.contactPerson.toLowerCase().trim();

    snap.forEach((d) => {
      const data = d.data() as ShipmentRecord;
      const shp: ShipmentRecord = { ...data, id: d.id };

      // Match by explicit clientId
      if (shp.clientId && shp.clientId === client.id) {
        clientShipments.push(shp);
        return;
      }

      // Match by customer name matching company or contact
      if (shp.customer) {
        const custLower = shp.customer.toLowerCase().trim();
        if (
          custLower === clientCompanyLower ||
          custLower === clientContactLower ||
          clientCompanyLower.includes(custLower) ||
          custLower.includes(clientCompanyLower)
        ) {
          clientShipments.push(shp);
        }
      }
    });

    // Sort by shipmentDate or createdAt descending
    return clientShipments.sort((a, b) => {
      const dateA = a.shipmentDate || a.createdAt || '';
      const dateB = b.shipmentDate || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  } catch (err) {
    console.error('Error fetching client shipments:', err);
    return [];
  }
};
