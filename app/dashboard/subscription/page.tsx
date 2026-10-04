'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Users,
  ShoppingBag,
  Truck,
  FileText,
  Calendar,
  ChevronRight,
  Building,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  SUBSCRIPTION_PLANS,
  SubscriptionPlan,
  SubscriptionTier,
  BillingCycle,
  SubscriptionInfo,
  DEFAULT_FREE_SUBSCRIPTION,
} from '@/lib/subscription-plans';
import {
  getUserSubscription,
  cancelUserSubscription,
} from '@/lib/subscription-service';
import { getUserShipments } from '@/lib/shipment-service';
import { getUserClients } from '@/lib/client-service';
import { getUserOrders } from '@/lib/order-service';
import CheckoutModal from '@/components/CheckoutModal';

export default function SubscriptionBillingPage() {
  const { user, userProfile, loading: authLoading, signInWithGoogle, demoLogin } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState(true);

  // Current resource counts
  const [shipmentCount, setShipmentCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Modals state
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        const [sub, shps, cls, ords] = await Promise.all([
          getUserSubscription(user.uid, userProfile),
          getUserShipments(user.uid),
          getUserClients(user.uid),
          getUserOrders(user.uid),
        ]);
        if (isMounted) {
          setSubscription(sub);
          setCycle(sub.cycle || 'monthly');
          setShipmentCount(shps.length);
          setClientCount(cls.length);
          setOrderCount(ords.length);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error loading subscription data:', e);
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    const handleSubUpdated = () => {
      fetchData();
    };
    window.addEventListener('logistics_subscription_updated', handleSubUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('logistics_subscription_updated', handleSubUpdated);
    };
  }, [user, userProfile]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [sub, shps, cls, ords] = await Promise.all([
        getUserSubscription(user.uid, userProfile),
        getUserShipments(user.uid),
        getUserClients(user.uid),
        getUserOrders(user.uid),
      ]);
      setSubscription(sub);
      setCycle(sub.cycle || 'monthly');
      setShipmentCount(shps.length);
      setClientCount(cls.length);
      setOrderCount(ords.length);
    } catch (e) {
      console.error('Error refreshing subscription data:', e);
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS[subscription.tier] || SUBSCRIPTION_PLANS.free;

  const handleCancelSubscription = async () => {
    if (!user) return;
    setIsCanceling(true);
    try {
      const updated = await cancelUserSubscription(user.uid, false);
      setSubscription(updated);
      showToast('Subscription set to cancel at the end of the billing period.');
    } catch {
      showToast('Failed to update subscription status.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleImmediateDowngrade = async () => {
    if (!user) return;
    setIsCanceling(true);
    try {
      const updated = await cancelUserSubscription(user.uid, true);
      setSubscription(updated);
      showToast('Downgraded to Free Basic plan.');
    } catch {
      showToast('Failed to downgrade.');
    } finally {
      setIsCanceling(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Loading Billing Registry...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center p-4">
        <div className="bg-[#091322] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#00e5c9]/10 border border-[#00e5c9]/20 text-[#00e5c9] mx-auto flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">Subscription &amp; Billing Access</h2>
            <p className="text-xs text-slate-400">
              Sign in to manage your account subscription, view usage limits, and update billing methods.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Continue with Google</span>
            </button>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => demoLogin('Customer')}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00e5c9]" />
                <span>Shipper Demo</span>
              </button>
              <button
                type="button"
                onClick={() => demoLogin('Dealer Operations')}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00e5c9]" />
                <span>Ops Demo</span>
              </button>
            </div>
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
              Account &amp; Infrastructure
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Tier: {currentPlan.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Subscription &amp; Billing Management</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            prefetch={false}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            prefetch={false}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compare All Plans</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* CURRENT SUBSCRIPTION STATUS CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Active Subscription Tier
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">{currentPlan.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentPlan.tagline}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Billing Rate
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {currentPlan.id === 'free' ? '$0' : `$${subscription.cycle === 'annually' ? currentPlan.annualPrice : currentPlan.monthlyPrice}`}
                <span className="text-xs text-slate-400 font-normal font-sans">
                  /{subscription.cycle === 'annually' ? 'mo (billed annually)' : 'mo'}
                </span>
              </span>
            </div>
          </div>

          {/* Usage Quota Meter Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Current Resource Consumption vs Plan Limits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Shipments Quota */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Waybills &amp; Shipments</span>
                  </span>
                  <span className="font-mono text-slate-900">
                    {shipmentCount} / {currentPlan.limits.maxShipments === -1 ? 'Unlimited' : currentPlan.limits.maxShipments}
                  </span>
                </div>
                {currentPlan.limits.maxShipments !== -1 && (
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        shipmentCount >= currentPlan.limits.maxShipments
                          ? 'bg-rose-500'
                          : shipmentCount >= currentPlan.limits.maxShipments * 0.8
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (shipmentCount / currentPlan.limits.maxShipments) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block">
                  {currentPlan.limits.maxShipments === -1
                    ? 'Unlimited volume enabled'
                    : `${Math.max(0, currentPlan.limits.maxShipments - shipmentCount)} shipments remaining`}
                </span>
              </div>

              {/* Clients Quota */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Address Book Clients</span>
                  </span>
                  <span className="font-mono text-slate-900">
                    {clientCount} / {currentPlan.limits.maxClients === -1 ? 'Unlimited' : currentPlan.limits.maxClients}
                  </span>
                </div>
                {currentPlan.limits.maxClients !== -1 && (
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        clientCount >= currentPlan.limits.maxClients
                          ? 'bg-rose-500'
                          : clientCount >= currentPlan.limits.maxClients * 0.8
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (clientCount / currentPlan.limits.maxClients) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block">
                  {currentPlan.limits.maxClients === -1
                    ? 'Unlimited accounts'
                    : `${Math.max(0, currentPlan.limits.maxClients - clientCount)} client slots free`}
                </span>
              </div>

              {/* Orders Quota */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Commercial Orders</span>
                  </span>
                  <span className="font-mono text-slate-900">
                    {orderCount} / {currentPlan.limits.maxOrders === -1 ? 'Unlimited' : currentPlan.limits.maxOrders}
                  </span>
                </div>
                {currentPlan.limits.maxOrders !== -1 && (
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        orderCount >= currentPlan.limits.maxOrders
                          ? 'bg-rose-500'
                          : orderCount >= currentPlan.limits.maxOrders * 0.8
                          ? 'bg-amber-500'
                          : 'bg-purple-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (orderCount / currentPlan.limits.maxOrders) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block">
                  {currentPlan.limits.maxOrders === -1
                    ? 'Unlimited orders'
                    : `${Math.max(0, currentPlan.limits.maxOrders - orderCount)} order slots available`}
                </span>
              </div>
            </div>
          </div>

          {/* Account Billing Information Details */}
          <div className="p-4 rounded-2xl bg-[#091322] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-[#00e5c9] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Payment Instrument</span>
                <p className="font-bold text-white font-mono">
                  {subscription.paymentMethodBrand || 'Visa'} ending in •••• {subscription.paymentMethodLast4 || '4242'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Renewal Date</span>
                <p className="font-bold text-[#00e5c9] font-mono">
                  {subscription.nextBillingDate || subscription.currentPeriodEnd?.split('T')[0] || 'Continuous'}
                </p>
              </div>

              {subscription.tier !== 'free' && (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling || subscription.cancelAtPeriodEnd}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {subscription.cancelAtPeriodEnd ? 'Canceling at Period End' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SUBSCRIPTION PLAN SELECTION & UPGRADE MATRIX */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Select Your Logistics Subscription Plan
              </h2>
              <p className="text-xs text-slate-500">
                Switch plans anytime. Upgrades take effect immediately with prorated billing.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  cycle === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setCycle('annually')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  cycle === 'annually' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black">
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map((tierKey) => {
              const plan = SUBSCRIPTION_PLANS[tierKey];
              const isCurrent = subscription.tier === plan.id;
              const price = cycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                    plan.recommended
                      ? 'bg-gradient-to-b from-slate-900 to-[#0c1626] text-white shadow-xl border-2 border-blue-500'
                      : isCurrent
                      ? 'bg-white border-2 border-emerald-500 shadow-md'
                      : 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          plan.recommended
                            ? 'bg-gradient-to-r from-blue-500 to-[#00e5c9] text-slate-950 shadow-md'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
                    <div>
                      <h3
                        className={`text-lg font-black ${
                          plan.recommended ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          plan.recommended ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    {/* Price Tag */}
                    <div className="py-2 border-y border-slate-100/20">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-3xl font-black font-mono ${
                            plan.recommended ? 'text-[#00e5c9]' : 'text-slate-900'
                          }`}
                        >
                          ${price}
                        </span>
                        <span
                          className={`text-xs ${
                            plan.recommended ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {plan.id === 'free' ? 'forever' : '/month'}
                        </span>
                      </div>
                      {cycle === 'annually' && plan.monthlyPrice > 0 && (
                        <span className="text-[10px] text-emerald-400 block font-semibold">
                          Billed ${plan.annualPrice * 12}/yr (save 20%)
                        </span>
                      )}
                    </div>

                    {/* Feature bullets */}
                    <div className="space-y-2.5 text-xs">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${
                          plan.recommended ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        Included Quotas &amp; Tools
                      </span>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                              plan.recommended ? 'text-[#00e5c9]' : 'text-emerald-600'
                            }`}
                          />
                          <span
                            className={plan.recommended ? 'text-slate-200' : 'text-slate-700'}
                          >
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-6">
                    {isCurrent ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-bold text-xs rounded-xl cursor-default text-center"
                      >
                        Current Active Plan
                      </button>
                    ) : plan.id === 'free' ? (
                      <button
                        type="button"
                        onClick={handleImmediateDowngrade}
                        disabled={isCanceling}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Downgrade to Free
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCheckoutPlan(plan)}
                        className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          plan.recommended
                            ? 'bg-[#00e5c9] hover:bg-[#15f7dc] text-slate-950 font-black shadow-teal-500/25'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        }`}
                      >
                        <span>Upgrade to {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {checkoutPlan && (
        <CheckoutModal
          isOpen={Boolean(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          selectedPlan={checkoutPlan}
          cycle={cycle}
          userId={user.uid}
          userEmail={user.email || ''}
          onSuccess={() => {
            showToast(`Upgraded to ${checkoutPlan.name}!`);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
