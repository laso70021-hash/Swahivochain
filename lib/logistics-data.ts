export interface ShipmentData {
  id: string;
  type: 'Ocean Freight' | 'Air Cargo' | 'Road Transport' | 'Multimodal';
  status: 'In Transit' | 'Customs Cleared' | 'Departed Port' | 'Out for Delivery' | 'Delivered';
  origin: {
    city: string;
    port: string;
    country: string;
    date: string;
  };
  destination: {
    city: string;
    port: string;
    country: string;
    eta: string;
  };
  carrier: string;
  vesselOrFlight: string;
  containerId: string;
  weight: string;
  temperature?: string;
  humidity?: string;
  shock?: string;
  progressPercent: number;
  timeline: {
    stage: string;
    location: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
    note?: string;
  }[];
}

export const SAMPLE_SHIPMENTS: Record<string, ShipmentData> = {
  'SWX-12245678': {
    id: 'SWX-12245678',
    type: 'Ocean Freight',
    status: 'In Transit',
    origin: {
      city: 'Shanghai',
      port: 'Yangshan Deepwater Port (CNSHA)',
      country: 'China',
      date: 'Sept 18, 2026',
    },
    destination: {
      city: 'Rotterdam',
      port: 'Port of Rotterdam (NLRTM)',
      country: 'Netherlands',
      eta: 'Oct 04, 2026',
    },
    carrier: 'Maersk Line / Swahivo Global Alliance',
    vesselOrFlight: 'MV Kilimanjaro VII (IMO 9845217)',
    containerId: 'MSKU-8829104 (40ft High-Cube)',
    weight: '24,800 kg',
    temperature: 'Ambient (19.4°C)',
    humidity: '58% RH',
    shock: '0.02 G (Normal)',
    progressPercent: 68,
    timeline: [
      {
        stage: 'Order Booked & Cargo Inspected',
        location: 'Shanghai Logistics Facility',
        timestamp: 'Sept 16, 2026 · 09:30 CST',
        completed: true,
        note: 'Export license validated; electronic bill of lading issued.',
      },
      {
        stage: 'Loaded on Vessel & Departed Port',
        location: 'Yangshan Deepwater Port, Berth 4',
        timestamp: 'Sept 18, 2026 · 14:15 CST',
        completed: true,
        note: 'Vessel sailed via South China Sea transit corridor.',
      },
      {
        stage: 'Suez Canal Convoy Transit',
        location: 'Port Said Gateway, Egypt',
        timestamp: 'Sept 24, 2026 · 04:00 EET',
        completed: true,
        note: 'Northbound convoy clearance approved without delay.',
      },
      {
        stage: 'In Transit — Mediterranean Sea',
        location: 'Lat 36.24°N, Lon 14.18°E (Off Malta)',
        timestamp: 'Current Position · Speed 19.2 knots',
        completed: false,
        current: true,
        note: 'Optimum weather routing active; ETA on schedule.',
      },
      {
        stage: 'Estimated Arrival & Customs Discharge',
        location: 'Port of Rotterdam, Gateway Terminal',
        timestamp: 'Oct 04, 2026 · 08:00 CEST (Expected)',
        completed: false,
        note: 'Pre-customs declaration documents electronically submitted.',
      },
    ],
  },
  'LCX-12245678': {
    id: 'LCX-12245678',
    type: 'Ocean Freight',
    status: 'In Transit',
    origin: {
      city: 'Shanghai',
      port: 'Yangshan Deepwater Port (CNSHA)',
      country: 'China',
      date: 'Sept 18, 2026',
    },
    destination: {
      city: 'Rotterdam',
      port: 'Port of Rotterdam (NLRTM)',
      country: 'Netherlands',
      eta: 'Oct 04, 2026',
    },
    carrier: 'Maersk Line / Swahivo Global Alliance',
    vesselOrFlight: 'MV Kilimanjaro VII (IMO 9845217)',
    containerId: 'MSKU-8829104 (40ft High-Cube)',
    weight: '24,800 kg',
    temperature: 'Ambient (19.4°C)',
    humidity: '58% RH',
    shock: '0.02 G (Normal)',
    progressPercent: 68,
    timeline: [
      {
        stage: 'Order Booked & Cargo Inspected',
        location: 'Shanghai Logistics Facility',
        timestamp: 'Sept 16, 2026 · 09:30 CST',
        completed: true,
        note: 'Export license validated; electronic bill of lading issued.',
      },
      {
        stage: 'Loaded on Vessel & Departed Port',
        location: 'Yangshan Deepwater Port, Berth 4',
        timestamp: 'Sept 18, 2026 · 14:15 CST',
        completed: true,
        note: 'Vessel sailed via South China Sea transit corridor.',
      },
      {
        stage: 'Suez Canal Convoy Transit',
        location: 'Port Said Gateway, Egypt',
        timestamp: 'Sept 24, 2026 · 04:00 EET',
        completed: true,
        note: 'Northbound convoy clearance approved without delay.',
      },
      {
        stage: 'In Transit — Mediterranean Sea',
        location: 'Lat 36.24°N, Lon 14.18°E (Off Malta)',
        timestamp: 'Current Position · Speed 19.2 knots',
        completed: false,
        current: true,
        note: 'Optimum weather routing active; ETA on schedule.',
      },
      {
        stage: 'Estimated Arrival & Customs Discharge',
        location: 'Port of Rotterdam, Gateway Terminal',
        timestamp: 'Oct 04, 2026 · 08:00 CEST (Expected)',
        completed: false,
        note: 'Pre-customs declaration documents electronically submitted.',
      },
    ],
  },
  'AWB-7749102': {
    id: 'AWB-7749102',
    type: 'Air Cargo',
    status: 'Customs Cleared',
    origin: {
      city: 'Frankfurt',
      port: 'Frankfurt Main Airport (FRA)',
      country: 'Germany',
      date: 'Sept 25, 2026',
    },
    destination: {
      city: 'Dar es Salaam',
      port: 'Julius Nyerere Intl (DAR)',
      country: 'Tanzania',
      eta: 'Sept 26, 2026 · 17:30 EAT',
    },
    carrier: 'Emirates SkyCargo / Logistics Chain Express',
    vesselOrFlight: 'Boeing 777-F (EK-9821)',
    containerId: 'PAG-55192-EK (Aircraft ULD)',
    weight: '3,450 kg (Medical Cold-Chain)',
    temperature: '4.1°C (Safe Range: 2°C - 8°C)',
    humidity: '42% RH',
    shock: '0.01 G (Stable)',
    progressPercent: 90,
    timeline: [
      {
        stage: 'Pharmaceutical Cold-Chain Acceptance',
        location: 'Frankfurt GDP Cargo Hub',
        timestamp: 'Sept 24, 2026 · 22:00 CEST',
        completed: true,
        note: 'Validated active cooling container active.',
      },
      {
        stage: 'Flight Departure FRA',
        location: 'Frankfurt Main Cargo Runway 18',
        timestamp: 'Sept 25, 2026 · 03:45 CEST',
        completed: true,
      },
      {
        stage: 'Transit Hub Transfer',
        location: 'Dubai World Central (DWC)',
        timestamp: 'Sept 25, 2026 · 12:30 GST',
        completed: true,
      },
      {
        stage: 'Arrival & Fast-Track Customs Clearance',
        location: 'Dar es Salaam JNIA Cargo Terminal',
        timestamp: 'Sept 26, 2026 · 06:15 EAT',
        completed: true,
        current: true,
        note: 'Customs green channel approved; released for final mile.',
      },
      {
        stage: 'Final Mile Delivery to Hospital Depot',
        location: 'Oysterbay Health Logistics Center',
        timestamp: 'Sept 26, 2026 · 17:30 EAT (Expected)',
        completed: false,
      },
    ],
  },
  'TRK-552190': {
    id: 'TRK-552190',
    type: 'Road Transport',
    status: 'Out for Delivery',
    origin: {
      city: 'Chicago, IL',
      port: 'Midwest Intermodal Terminal',
      country: 'USA',
      date: 'Sept 25, 2026',
    },
    destination: {
      city: 'Detroit, MI',
      port: 'Automotive Logistics Hub',
      country: 'USA',
      eta: 'Today · 14:00 EDT',
    },
    carrier: 'Logistics Chain North American Express',
    vesselOrFlight: 'Freightliner Cascadia #LC-402',
    containerId: 'TRL-99410 (53ft Dry Van)',
    weight: '18,200 kg (Tier-1 Auto Castings)',
    temperature: 'Ambient',
    progressPercent: 92,
    timeline: [
      {
        stage: 'Cross-Dock Dispatched',
        location: 'Chicago Distribution Hub',
        timestamp: 'Sept 25, 2026 · 20:00 CDT',
        completed: true,
      },
      {
        stage: 'Interstate Transit (I-94 Corridor)',
        location: 'Kalamazoo, MI Waypoint',
        timestamp: 'Sept 26, 2026 · 02:45 EDT',
        completed: true,
      },
      {
        stage: 'Out for Final Delivery',
        location: 'Metro Detroit Area',
        timestamp: 'Sept 26, 2026 · 08:30 EDT',
        completed: false,
        current: true,
        note: 'Driver on schedule; loading dock reserved for 14:00.',
      },
    ],
  },
};

export const GLOBAL_PORTS = [
  { code: 'SHA', name: 'Shanghai (Yangshan)', country: 'China', type: 'Sea' },
  { code: 'RTM', name: 'Rotterdam', country: 'Netherlands', type: 'Sea' },
  { code: 'SIN', name: 'Singapore', country: 'Singapore', type: 'Sea' },
  { code: 'DAR', name: 'Dar es Salaam', country: 'Tanzania', type: 'Sea' },
  { code: 'LAX', name: 'Los Angeles / Long Beach', country: 'USA', type: 'Sea' },
  { code: 'DXB', name: 'Dubai (Jebel Ali / DWC)', country: 'UAE', type: 'Sea/Air' },
  { code: 'HAM', name: 'Hamburg', country: 'Germany', type: 'Sea' },
  { code: 'MBA', name: 'Mombasa', country: 'Kenya', type: 'Sea' },
  { code: 'NYC', name: 'New York / New Jersey', country: 'USA', type: 'Sea' },
  { code: 'FRA', name: 'Frankfurt Main', country: 'Germany', type: 'Air' },
  { code: 'ORD', name: 'Chicago O’Hare', country: 'USA', type: 'Air' },
  { code: 'NBO', name: 'Nairobi (JKIA)', country: 'Kenya', type: 'Air' },
  { code: 'HND', name: 'Tokyo Haneda/Narita', country: 'Japan', type: 'Air' },
];

export const FLEET_ASSETS = [
  { name: 'Kilimanjaro VII', type: 'High-Speed Cargo Feeder', capacity: '1,200 TEU', status: 'Active · Indian Ocean Lane' },
  { name: 'Kilimanjaro VI', type: 'Coastal Feeder Vessel', capacity: '850 TEU', status: 'In Port · Dar es Salaam' },
  { name: 'Pacific Pioneer V', type: 'Ultra Large Container Vessel', capacity: '14,500 TEU', status: 'Underway · Transpacific' },
  { name: 'Atlantic Horizon IV', type: 'Container Vessel', capacity: '9,800 TEU', status: 'En Route · Rotterdam' },
  { name: 'Azam Sea Link 1', type: 'Ro-Ro Freight Ferry', capacity: '120 Trailers', status: 'Active · Coastal Run' },
  { name: 'Azam Sea Link 2', type: 'Ro-Ro Freight Ferry', capacity: '140 Trailers', status: 'Docked · Zanzibar Hub' },
];

export const CARRIER_PARTNERS = [
  { name: 'Auric Air', category: 'Air Freight Cargo' },
  { name: 'Assalam Air', category: 'Regional Aviation' },
  { name: 'Air Tanzania Cargo', category: 'Continental Air Lines' },
  { name: 'Azam Marine Logistics', category: 'Maritime & Ferry Cargo' },
  { name: 'Maersk Alliance', category: 'Global Ocean Liner' },
  { name: 'MSC Mediterranean', category: 'Global Shipping' },
  { name: 'Cargolux Express', category: 'Heavy Air Charter' },
];

export const TESTIMONIALS = [
  {
    quote: 'Swahivo made international shipping so easy. The tracking is accurate and the support team is always responsive.',
    author: 'Sarah Johnson',
    role: 'Business Owner',
    company: 'USA',
    country: 'USA',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
    verified: 'Verified Enterprise Shipper',
  },
  {
    quote: 'Reliable, fast and professional. We have been using Swahivo for our business shipments for over a year now.',
    author: 'David Mwangi',
    role: 'Import/Export Manager',
    company: 'Kenya',
    country: 'Kenya',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    verified: 'Verified Cold-Chain Shipper',
  },
  {
    quote: 'The best logistics platform we’ve used. Great rates, excellent service and real-time updates.',
    author: 'Fatima Hassan',
    role: 'E-commerce Seller',
    company: 'Tanzania',
    country: 'Tanzania',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
    verified: 'Verified Omnichannel Shipper',
  },
];
