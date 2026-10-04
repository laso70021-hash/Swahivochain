'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuoteModal from '@/components/QuoteModal';
import CheckoutModal from '@/components/CheckoutModal';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Truck,
  Building,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  SUBSCRIPTION_PLANS,
  SubscriptionPlan,
  SubscriptionTier,
  BillingCycle,
} from '@/lib/subscription-plans';

export default function PricingPage() {
  const { user, userProfile } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);

  const activeTier = userProfile?.subscription?.tier || 'free';

  return (
    <div className="min-h-screen bg-[#040914] text-slate-100 flex flex-col font-sans selection:bg-[#00e5c9] selection:text-slate-900">
      <Header onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00e5c9]/10 border border-[#00e5c9]/30 text-[#00e5c9] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Scalable Freight Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Flexible Logistics Plans for Every Scale of Fleet
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            From free individual parcel tracking to enterprise multimodal supply chain orchestration. Upgrade or downgrade anytime with no lock-in.
          </p>

          {/* Billing Cycle Switch */}
          <div className="pt-4 flex items-center justify-center">
            <div className="flex items-center p-1.5 bg-[#091322] border border-slate-800 rounded-2xl shadow-xl">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  cycle === 'monthly' ? 'bg-[#00e5c9] text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setCycle('annually')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  cycle === 'annually' ? 'bg-[#00e5c9] text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 text-[10px] font-black">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map((tierKey) => {
              const plan = SUBSCRIPTION_PLANS[tierKey];
              const isCurrent = user && activeTier === plan.id;
              const price = cycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                    plan.recommended
                      ? 'bg-gradient-to-b from-[#0b1d38] via-[#09172c] to-[#050e1c] border-2 border-[#00e5c9] shadow-2xl shadow-teal-500/10'
                      : 'bg-[#091322] border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          plan.recommended
                            ? 'bg-[#00e5c9] text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-5 pt-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="py-3 border-y border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                          ${price}
                        </span>
                        <span className="text-xs text-slate-400">
                          {plan.id === 'free' ? 'forever' : '/month'}
                        </span>
                      </div>
                      {cycle === 'annually' && plan.monthlyPrice > 0 && (
                        <span className="text-[11px] text-[#00e5c9] font-semibold block mt-1">
                          Billed ${plan.annualPrice * 12} per year
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                        Included Features
                      </span>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#00e5c9] shrink-0 mt-0.5" />
                          <span className="text-slate-300">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    {user ? (
                      isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/30 font-bold text-xs rounded-xl cursor-default text-center"
                        >
                          Current Active Plan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCheckoutPlan(plan)}
                          className={`w-full py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            plan.recommended
                              ? 'bg-[#00e5c9] hover:bg-[#15f7dc] text-slate-950 shadow-lg shadow-teal-500/25'
                              : 'bg-white hover:bg-slate-100 text-slate-950'
                          }`}
                        >
                          <span>{plan.id === 'free' ? 'Switch to Free' : `Upgrade to ${plan.name}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <Link
                        href="/login"
                        className={`w-full py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 text-center ${
                          plan.recommended
                            ? 'bg-[#00e5c9] hover:bg-[#15f7dc] text-slate-950 shadow-lg shadow-teal-500/25'
                            : 'bg-white hover:bg-slate-100 text-slate-950'
                        }`}
                      >
                        <span>Get Started with {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enterprise Contact Bar */}
          <div className="mt-12 bg-[#091322] border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <Building className="w-5 h-5 text-[#00e5c9]" />
                <span>Need a custom multimodal enterprise SLA?</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                We design custom logistics gateways, ERP connectors, and dedicated telematics setups for shipping lines and governments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsQuoteOpen(true)}
              className="px-6 py-3 bg-[#0a1b33] hover:bg-[#0f284d] text-[#00e5c9] border border-[#00e5c9]/30 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Request Custom Freight Quote
            </button>
          </div>
        </section>
      </main>

      <Footer onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {isQuoteOpen && <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />}

      {checkoutPlan && user && (
        <CheckoutModal
          isOpen={Boolean(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          selectedPlan={checkoutPlan}
          cycle={cycle}
          userId={user.uid}
          userEmail={user.email || ''}
          onSuccess={() => {
            window.location.href = '/dashboard/subscription';
          }}
        />
      )}
    </div>
  );
}
