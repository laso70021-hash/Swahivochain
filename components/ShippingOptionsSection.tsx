'use client';

import React from 'react';
import Image from 'next/image';
import {
  Plane,
  Ship,
  Truck,
  Train,
  Link as LinkIcon,
  ArrowRight,
} from 'lucide-react';

interface ShippingOptionsSectionProps {
  onOpenQuoteModal?: (mode?: string) => void;
}

export default function ShippingOptionsSection({ onOpenQuoteModal }: ShippingOptionsSectionProps) {
  const shippingMethods = [
    {
      id: 'air',
      title: 'Air Freight',
      subtext: 'Fast & global',
      icon: Plane,
    },
    {
      id: 'ocean',
      title: 'Ocean Freight',
      subtext: 'Cost-effective',
      icon: Ship,
    },
    {
      id: 'road',
      title: 'Road Freight',
      subtext: 'Reliable & flexible',
      icon: Truck,
    },
    {
      id: 'rail',
      title: 'Rail Freight',
      subtext: 'Eco-friendly',
      icon: Train,
    },
    {
      id: 'multimodal',
      title: 'Multimodal',
      subtext: 'The best of all',
      icon: LinkIcon,
    },
  ];

  const marineAssets = [
    'Kilimanjaro VII',
    'Kilimanjaro VI',
    'Kilimanjaro V',
    'Kilimanjaro IV',
    'Azam Sea Link 1',
    'Azam Sea Link 2',
  ];

  return (
    <section className="py-16 lg:py-20 bg-[#030914] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Flexible Shipping Options (col-span-7) */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
                SHIPPING METHODS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Flexible Shipping Options
              </h2>
            </div>

            {/* 5 Compact Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {shippingMethods.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.id}
                    onClick={() => onOpenQuoteModal?.(m.title)}
                    className="p-3.5 rounded-xl bg-[#061020] border border-slate-800/90 hover:border-[#00e5c9]/60 hover:bg-[#08152a] transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-center min-h-[120px] group"
                  >
                    <div className="text-[#00e5c9] mb-2.5 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#00e5c9] transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {m.subtext}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Global Carriers & Assets (col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
                TRUSTED PARTNERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Global Carriers & Assets
              </h2>
            </div>

            {/* Carrier Logos Row as shown in reference */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-slate-300">
              {/* Auric Air */}
              <div className="flex items-center gap-1.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 14L12 4L20 14L12 11L4 14Z" fill="#ffffff" />
                  <path d="M12 11V20" stroke="#00e5c9" strokeWidth="2" />
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-black text-white tracking-wider uppercase">AURIC</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">AIR</span>
                </div>
              </div>

              {/* Assalam Air */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#00e5c9] text-base">✈</span>
                <span className="text-xs font-bold text-white tracking-wide">Assalam Air</span>
              </div>

              {/* Air Tanzania */}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-blue-500/20 text-[#38bdf8] flex items-center justify-center text-[10px] font-bold">
                  AT
                </div>
                <span className="text-xs font-bold text-white tracking-wide">Air Tanzania</span>
              </div>

              {/* Azam Marine */}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-red-600/30 text-rose-400 flex items-center justify-center text-[10px] font-bold">
                  A
                </div>
                <span className="text-xs font-bold text-white tracking-wide">Azam Marine</span>
              </div>
            </div>

            {/* Vessel Visual + Roster Container */}
            <div className="rounded-2xl bg-[#061020] border border-slate-800/90 p-4 flex flex-col sm:flex-row items-center gap-4">
              {/* Ship Image */}
              <div className="relative w-full sm:w-1/2 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0">
                <Image
                  src="/images/ocean.jpg"
                  alt="Azam Marine Kilimanjaro Fleet"
                  fill
                  sizes="(max-width: 640px) 100vw, 220px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061020]/80 via-transparent to-transparent" />
              </div>

              {/* Roster of 6 vessels matching screenshot */}
              <div className="w-full sm:w-1/2 grid grid-cols-1 gap-1 text-[11px] font-medium text-slate-200">
                {marineAssets.map((ship, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-[#00e5c9] text-[10px] font-bold">➔</span>
                    <span className="hover:text-[#00e5c9] transition-colors">{ship}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
