import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  SubscriptionTier,
  BillingCycle,
  SubscriptionInfo,
  SUBSCRIPTION_PLANS,
  DEFAULT_FREE_SUBSCRIPTION,
} from './subscription-plans';
import { UserProfile } from './auth-context';

const LOCAL_STORAGE_SUB_KEY = 'logistics_chain_user_subscription_';

/**
 * Get active subscription details for a user
 */
export const getUserSubscription = async (userId: string, currentProfile?: UserProfile | null): Promise<SubscriptionInfo> => {
  if (!userId) return DEFAULT_FREE_SUBSCRIPTION;

  // 1. Check current profile if provided
  if (currentProfile?.subscription) {
    return currentProfile.subscription;
  }

  // 2. Check localStorage (for instant demo sessions and cached state)
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_SUB_KEY}${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
  }

  // 3. Check Firestore
  if (!userId.startsWith('demo_')) {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        if (data.subscription) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${LOCAL_STORAGE_SUB_KEY}${userId}`, JSON.stringify(data.subscription));
          }
          return data.subscription;
        }
      }
    } catch (e) {
      console.warn('Could not load subscription from Firestore:', e);
    }
  }

  return DEFAULT_FREE_SUBSCRIPTION;
};

/**
 * Update/upgrade/downgrade subscription for a user
 */
export const updateSubscriptionPlan = async (
  userId: string,
  newTier: SubscriptionTier,
  cycle: BillingCycle = 'monthly',
  paymentMethodLast4: string = '4242',
  paymentMethodBrand: string = 'Visa'
): Promise<SubscriptionInfo> => {
  const now = new Date();
  const nextPeriod = new Date(now);
  if (cycle === 'monthly') {
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
  } else {
    nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
  }

  const subInfo: SubscriptionInfo = {
    tier: newTier,
    cycle,
    status: 'active',
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: nextPeriod.toISOString(),
    nextBillingDate: nextPeriod.toISOString().split('T')[0],
    paymentMethodLast4,
    paymentMethodBrand,
    cancelAtPeriodEnd: false,
  };

  // Save to localStorage for instant reactivity across all client views
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_SUB_KEY}${userId}`, JSON.stringify(subInfo));
    window.dispatchEvent(new CustomEvent('logistics_subscription_updated', { detail: { userId, subInfo } }));
  }

  // Save to Firestore if real user
  if (!userId.startsWith('demo_')) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: subInfo,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not update subscription in Firestore:', e);
    }
  }

  return subInfo;
};

/**
 * Cancel subscription (downgrade to Free at period end or immediately)
 */
export const cancelUserSubscription = async (
  userId: string,
  immediately: boolean = false
): Promise<SubscriptionInfo> => {
  const current = await getUserSubscription(userId);

  let updated: SubscriptionInfo;
  if (immediately) {
    updated = {
      ...DEFAULT_FREE_SUBSCRIPTION,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
    };
  } else {
    updated = {
      ...current,
      cancelAtPeriodEnd: true,
    };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_SUB_KEY}${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('logistics_subscription_updated', { detail: { userId, subInfo: updated } }));
  }

  if (!userId.startsWith('demo_')) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not cancel subscription in Firestore:', e);
    }
  }

  return updated;
};

/**
 * Check if an operation exceeds plan limits
 */
export interface LimitCheckResult {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  planName: string;
  tier: SubscriptionTier;
  message?: string;
  upgradeRequired: boolean;
}

export const checkPlanLimit = (
  tier: SubscriptionTier = 'free',
  resource: 'shipments' | 'clients' | 'orders' | 'pickups' | 'reports' | 'events',
  currentCount: number = 0
): LimitCheckResult => {
  const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.free;
  const limits = plan.limits;

  switch (resource) {
    case 'shipments': {
      if (limits.maxShipments === -1) {
        return { allowed: true, currentCount, maxAllowed: -1, planName: plan.name, tier, upgradeRequired: false };
      }
      const allowed = currentCount < limits.maxShipments;
      return {
        allowed,
        currentCount,
        maxAllowed: limits.maxShipments,
        planName: plan.name,
        tier,
        upgradeRequired: !allowed,
        message: !allowed
          ? `You have reached the limit of ${limits.maxShipments} shipments on your ${plan.name} plan. Upgrade to Starter or Business for higher volume capacity.`
          : undefined,
      };
    }
    case 'clients': {
      if (limits.maxClients === -1) {
        return { allowed: true, currentCount, maxAllowed: -1, planName: plan.name, tier, upgradeRequired: false };
      }
      const allowed = currentCount < limits.maxClients;
      return {
        allowed,
        currentCount,
        maxAllowed: limits.maxClients,
        planName: plan.name,
        tier,
        upgradeRequired: !allowed,
        message: !allowed
          ? `You have reached the address book limit of ${limits.maxClients} clients on your ${plan.name} plan. Upgrade to expand your customer directory.`
          : undefined,
      };
    }
    case 'orders': {
      if (limits.maxOrders === -1) {
        return { allowed: true, currentCount, maxAllowed: -1, planName: plan.name, tier, upgradeRequired: false };
      }
      const allowed = currentCount < limits.maxOrders;
      return {
        allowed,
        currentCount,
        maxAllowed: limits.maxOrders,
        planName: plan.name,
        tier,
        upgradeRequired: !allowed,
        message: !allowed
          ? `You have reached the limit of ${limits.maxOrders} commercial orders on your ${plan.name} plan. Upgrade for expanded order processing.`
          : undefined,
      };
    }
    case 'pickups': {
      const allowed = limits.canCreatePickups;
      return {
        allowed,
        currentCount,
        maxAllowed: allowed ? 100 : 0,
        planName: plan.name,
        tier,
        upgradeRequired: !allowed,
        message: !allowed
          ? `Scheduled warehouse pickup requests are not available on the ${plan.name} plan. Upgrade to Starter or Business to schedule automated pickups.`
          : undefined,
      };
    }
    case 'reports': {
      const allowed = limits.canExportReports;
      return {
        allowed,
        currentCount,
        maxAllowed: allowed ? 100 : 0,
        planName: plan.name,
        tier,
        upgradeRequired: !allowed,
        message: !allowed
          ? `Exporting CSV manifests and shipment audit reports requires a Starter, Business, or Enterprise subscription.`
          : undefined,
      };
    }
    case 'events': {
      const allowed = limits.canManageTimelineEvents;
      return {
        allowed,
        currentCount,
        maxAllowed: allowed ? 100 : 0,
        planName: plan.name,
        tier,
        upgradeRequired: !allowed,
        message: !allowed
          ? `Logging custom checkpoint milestones directly to waybills requires an active paid subscription tier.`
          : undefined,
      };
    }
    default:
      return { allowed: true, currentCount, maxAllowed: -1, planName: plan.name, tier, upgradeRequired: false };
  }
};
