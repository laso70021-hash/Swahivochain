'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ArrowRight,
  AlertCircle,
  Building,
} from 'lucide-react';
import {
  SubscriptionPlan,
  BillingCycle,
  SUBSCRIPTION_PLANS,
  SubscriptionTier,
} from '@/lib/subscription-plans';
import { updateSubscriptionPlan } from '@/lib/subscription-service';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan;
  cycle: BillingCycle;
  userId: string;
  userEmail?: string;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  cycle,
  userId,
  userEmail = '',
  onSuccess,
}: CheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [billingAddress, setBillingAddress] = useState('Central Commercial Gateway, Dar es Salaam');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'checkout' | 'success'>('checkout');

  if (!isOpen) return null;

  const price = cycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
  const billedAmount = cycle === 'monthly' ? price : price * 12;

  // Format card number as 0000 0000 0000 0000
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate real gateway authorization latency
      await new Promise((res) => setTimeout(res, 900));

      const rawCard = cardNumber.replace(/\s/g, '');
      const last4 = rawCard.slice(-4) || '4242';
      const brand = rawCard.startsWith('4') ? 'Visa' : rawCard.startsWith('5') ? 'Mastercard' : 'Amex';

      await updateSubscriptionPlan(userId, selectedPlan.id, cycle, last4, brand);

      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment authorization failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-[#00e5c9] border border-blue-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Subscribe to {selectedPlan.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/30">
                  {cycle === 'annually' ? 'Annual (Save 20%)' : 'Monthly'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Unlock high-volume freight throughput and dedicated logistics tools
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'success' ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-slate-900">Subscription Activated!</h4>
              <p className="text-xs text-slate-500">
                Your account has been upgraded to <strong>{selectedPlan.name}</strong>. Expanded limits and tools are active immediately.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto">
            {/* Plan Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Plan Selected
                </span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedPlan.name}</span>
                <p className="text-[11px] text-slate-500">
                  {cycle === 'annually' ? `$${selectedPlan.annualPrice}/mo billed annually` : `$${selectedPlan.monthlyPrice}/month`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Amount Due Today
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  ${billedAmount}
                </span>
              </div>
            </div>

            {/* Live Payment Note */}
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-2.5 text-[11px] text-blue-900 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Sandbox &amp; Payment Gateway Ready</strong>. You can enter any mock card (e.g. 4242 4242 4242 4242) to test subscription transitions, limit changes, and invoice receipts instantly.
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Fields */}
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. David Kimaro or Acme Enterprises"
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Credit / Debit Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    CVC / CVV *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Corporate Billing Address *
                </label>
                <input
                  type="text"
                  required
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street, City, Country"
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Guarantee and Submit */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize &amp; Pay ${billedAmount}</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                Secure 256-bit TLS encryption. Cancel or modify anytime from your Account Billing tab.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
