'use client';

import React from 'react';
import {
  CreditCard,
  Compass,
  Globe2,
  Headphones,
  BadgePercent,
  Layers,
} from 'lucide-react';

export default function WhyChooseUsSection() {
  const benefits = [
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Multiple payment options with bank-level security.',
    },
    {
      icon: Compass,
      title: 'Real-Time Tracking',
      description: 'Know where your shipment is, always.',
    },
    {
      icon: Globe2,
      title: 'Global Network',
      description: 'Trusted partners in 220+ countries.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Our team is here 24/7 to help.',
    },
    {
      icon: BadgePercent,
      title: 'Transparent Pricing',
      description: 'No hidden fees, just clear rates.',
    },
    {
      icon: Layers,
      title: 'Enterprise Ready',
      description: 'Built for businesses of all sizes.',
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-[#030914] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
            WHY CHOOSE SWAHIVO
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Built for Your Success
          </h2>
        </div>

        {/* 6 Compact Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-start">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="space-y-2.5">
                {/* Icon box */}
                <div className="w-10 h-10 rounded-xl bg-[#061020] border border-slate-800 flex items-center justify-center text-[#00e5c9]">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {b.title}
                </h3>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
