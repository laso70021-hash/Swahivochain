'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/subscription-plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  currentTier?: SubscriptionTier;
  targetFeature?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title = 'Plan Limit Reached',
  message,
  currentTier = 'free',
  targetFeature,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const currentPlan = SUBSCRIPTION_PLANS[currentTier] || SUBSCRIPTION_PLANS.free;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 text-center my-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 mx-auto flex items-center justify-center">
          <Zap className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <span>Current: {currentPlan.name}</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Benefits preview */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Upgraded Capabilities
          </span>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5c9] shrink-0" />
            <span>High-volume waybills (Up to Unlimited)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5c9] shrink-0" />
            <span>Multi-client address book CRM</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5c9] shrink-0" />
            <span>Export manifests &amp; customs reports</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Not Now
          </button>
          <Link
            href="/dashboard/subscription"
            prefetch={false}
            onClick={onClose}
            className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
