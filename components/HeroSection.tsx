'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  ArrowRight,
  Search,
  MapPin,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenQuoteModal: () => void;
  onOpenTrackingModal: (code?: string) => void;
}

export default function HeroSection({
  onOpenQuoteModal,
  onOpenTrackingModal,
}: HeroSectionProps) {
  const [trackNumber, setTrackNumber] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackNumber.trim()) {
      onOpenTrackingModal(trackNumber.trim());
    } else {
      onOpenTrackingModal('SWX-12245678');
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#030914] pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Hero Image with atmospheric overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/SECTIONHERO.png"
          alt="Swahivo Maritime and Aviation Logistics"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center lg:object-right"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic gradient overlays for optimal text contrast and seamless canvas blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030914] via-[#030914]/90 to-[#030914]/45 sm:via-[#030914]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-transparent to-[#030914]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030914]/60 via-transparent to-[#030914]" />
      </div>

      {/* Background radial atmosphere */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00e5c9]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & Value Props */}
          <div className="lg:col-span-6 space-y-6">
            {/* Fintech + Logistics Platform Badge */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#081829]/90 border border-[#00e5c9]/40 text-xs font-semibold text-[#00e5c9] backdrop-blur-sm">
              Fintech + Logistics Platform
            </div>

            {/* Headline matching screenshot */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-md">
              Move Your World <br />
              with <span className="text-[#00e5c9]">Swahivo</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-[15px] text-slate-300 max-w-xl leading-relaxed">
              Fast, secure and reliable logistics solutions combined with modern financial
              services. From local shipments to global trade, we keep your business moving.
            </p>

            {/* 4 Feature Bullets in 2x2 grid */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 pt-1 max-w-md text-xs sm:text-[13px] font-medium text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00e5c9] fill-[#00e5c9]/20 shrink-0" />
                <span>Global Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00e5c9] fill-[#00e5c9]/20 shrink-0" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00e5c9] fill-[#00e5c9]/20 shrink-0" />
                <span>Real-Time Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00e5c9] fill-[#00e5c9]/20 shrink-0" />
                <span>Trusted Network</span>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                onClick={onOpenQuoteModal}
                className="px-6 py-3 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <a
                href="#services"
                className="px-6 py-3 bg-[#0a1424]/90 hover:bg-[#0f1f36] text-white font-semibold text-xs sm:text-sm rounded-lg border border-slate-700/80 backdrop-blur-sm transition-colors"
              >
                Explore Services
              </a>
            </div>
          </div>

          {/* Right Column: Glassmorphic Floating Tracking & Live Logistics Panel */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0 flex flex-col justify-center">
            {/* Floating "Track Your Shipment" Card */}
            <div className="w-full max-w-lg mx-auto lg:ml-auto lg:mr-0 rounded-2xl bg-[#051020]/85 border border-slate-700/80 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00e5c9]/15 border border-[#00e5c9]/30 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#00e5c9]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Track Your Shipment
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Real-time global milestone monitoring
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live GPS
                </span>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-3 pt-1">
                <div className="flex items-center gap-2 bg-[#081426]/90 border border-slate-700/80 focus-within:border-[#00e5c9] rounded-lg p-1.5 transition-colors">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 ml-2 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={trackNumber}
                      onChange={(e) => setTrackNumber(e.target.value)}
                      placeholder="e.g. SWX-12246878"
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs sm:text-sm rounded-md transition-colors flex items-center gap-1.5 shadow-md shadow-teal-500/15 shrink-0 cursor-pointer"
                  >
                    <span>Track Shipment</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Popular: <button type="button" onClick={() => onOpenTrackingModal('SWX-12245678')} className="text-teal-400 hover:underline">SWX-12245678</button>, <button type="button" onClick={() => onOpenTrackingModal('SWL-2026-00412')} className="text-teal-400 hover:underline">SWL-2026-00412</button></span>
                  <span className="text-slate-500 font-mono">Live Telematics</span>
                </div>
              </form>

              {/* Live operational indicators */}
              <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-300">
                <div className="p-2 rounded-lg bg-[#071324]/60 border border-slate-800/60">
                  <span className="block font-semibold text-white">Air & Ocean</span>
                  <span className="text-[10px] text-slate-400">Direct Vessels</span>
                </div>
                <div className="p-2 rounded-lg bg-[#071324]/60 border border-slate-800/60">
                  <span className="block font-semibold text-[#00e5c9]">Automated</span>
                  <span className="text-[10px] text-slate-400">Customs Sync</span>
                </div>
                <div className="p-2 rounded-lg bg-[#071324]/60 border border-slate-800/60">
                  <span className="block font-semibold text-white">24/7 Alerts</span>
                  <span className="text-[10px] text-slate-400">Instant SMS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
