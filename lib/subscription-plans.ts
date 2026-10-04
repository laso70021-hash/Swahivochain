export type SubscriptionTier = 'free' | 'starter' | 'business' | 'enterprise';
export type BillingCycle = 'monthly' | 'annually';

export interface PlanLimits {
  maxShipments: number; // -1 for unlimited
  maxClients: number; // -1 for unlimited
  maxOrders: number; // -1 for unlimited
  canExportReports: boolean;
  canManageTimelineEvents: boolean;
  canCreatePickups: boolean;
  hasPrioritySupport: boolean;
  hasCustomCarriers: boolean;
  hasApiAccess: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number; // per month billed annually
  limits: PlanLimits;
  features: string[];
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free Basic',
    badge: 'Standard Access',
    tagline: 'Essential tracking and entry-level cargo management',
    description: 'Perfect for small local traders and individual consignees testing the freight tracking chain.',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: {
      maxShipments: 5,
      maxClients: 3,
      maxOrders: 3,
      canExportReports: false,
      canManageTimelineEvents: false,
      canCreatePickups: false,
      hasPrioritySupport: false,
      hasCustomCarriers: false,
      hasApiAccess: false,
    },
    features: [
      'Up to 5 active shipments',
      'Up to 3 client contacts',
      'Up to 3 commercial orders',
      'Real-time status updates',
      'Public waybill tracking portal',
      'Standard community support',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Logistics Starter',
    badge: 'Growing Fleets',
    tagline: 'Expanded capacity for growing regional freight shippers',
    description: 'Designed for regional shippers and transport agencies managing ongoing multi-route deliveries.',
    monthlyPrice: 49,
    annualPrice: 39,
    recommended: false,
    limits: {
      maxShipments: 35,
      maxClients: 25,
      maxOrders: 30,
      canExportReports: true,
      canManageTimelineEvents: true,
      canCreatePickups: true,
      hasPrioritySupport: false,
      hasCustomCarriers: true,
      hasApiAccess: false,
    },
    features: [
      'Up to 35 active shipments',
      'Up to 25 address book clients',
      'Up to 30 commercial orders',
      'Custom milestone event logging',
      'Scheduled warehouse pickups',
      'Export shipment manifests & reports',
      'Dedicated regional freight hubs',
    ],
  },
  business: {
    id: 'business',
    name: 'Operations Business',
    badge: 'Most Popular',
    tagline: 'Full-featured logistics infrastructure with high volume limits',
    description: 'For commercial freight forwarders, clearing agents, and enterprise consignors requiring comprehensive control.',
    monthlyPrice: 149,
    annualPrice: 119,
    recommended: true,
    limits: {
      maxShipments: 200,
      maxClients: 150,
      maxOrders: 200,
      canExportReports: true,
      canManageTimelineEvents: true,
      canCreatePickups: true,
      hasPrioritySupport: true,
      hasCustomCarriers: true,
      hasApiAccess: true,
    },
    features: [
      'Up to 200 active shipments',
      'Up to 150 client contacts',
      'Up to 200 commercial orders',
      'Priority customs fast-track handling',
      'Complete milestone audit trail logs',
      'Scheduled automated pickup routing',
      'Export detailed CSV & PDF waybills',
      'REST & Webhook logistics API access',
      'Priority 24/7 operations desk support',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Global Enterprise',
    badge: 'Unlimited Fleet',
    tagline: 'Custom multimodal networks with unlimited freight throughput',
    description: 'Tailored for shipping lines, multinational distribution networks, and industrial supply chains.',
    monthlyPrice: 399,
    annualPrice: 319,
    limits: {
      maxShipments: -1, // Unlimited
      maxClients: -1, // Unlimited
      maxOrders: -1, // Unlimited
      canExportReports: true,
      canManageTimelineEvents: true,
      canCreatePickups: true,
      hasPrioritySupport: true,
      hasCustomCarriers: true,
      hasApiAccess: true,
    },
    features: [
      'Unlimited active shipments & waybills',
      'Unlimited client accounts & address book',
      'Unlimited commercial orders & items',
      'Dedicated account & operations manager',
      'Custom telematics & IoT sensors',
      'Custom SLA guarantees (99.99%)',
      'Multi-tenant branch gateway permissions',
      'Bespoke ERP & SAP carrier integration',
    ],
  },
};

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  cycle: BillingCycle;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  nextBillingDate?: string;
  cancelAtPeriodEnd?: boolean;
}

export const DEFAULT_FREE_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'free',
  cycle: 'monthly',
  status: 'active',
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
  cancelAtPeriodEnd: false,
};
