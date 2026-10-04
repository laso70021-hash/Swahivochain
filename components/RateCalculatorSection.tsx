'use client';

import React, { useState } from 'react';
import { Calculator, ArrowRight, Ship, Plane, Truck, Clock, DollarSign, Leaf, ShieldAlert } from 'lucide-react';
import { GLOBAL_PORTS } from '@/lib/logistics-data';

interface RateCalculatorSectionProps {
  onOpenQuoteModal: (mode?: string, origin?: string, dest?: string) => void;
}

export default function RateCalculatorSection({ onOpenQuoteModal }: RateCalculatorSectionProps) {
  const [origin, setOrigin] = useState('Shanghai (Yangshan)');
  const [destination, setDestination] = useState('Rotterdam');
  const [mode, setMode] = useState<'Ocean FCL' | 'Ocean LCL' | 'Air Freight' | 'Overland Road'>('Ocean FCL');
  const [weightKg, setWeightKg] = useState('18000');
  const [volumeCbm, setVolumeCbm] = useState('35');

  const calculateEstimate = () => {
    const w = parseFloat(weightKg) || 1000;
    const v = parseFloat(volumeCbm) || 10;
    let base = 2100;
    let days = '18 – 24 Days';
    let co2 = '1.2 Tonnes CO2';

    if (mode === 'Air Freight') {
      base = w * 4.3 + 800;
      days = '2 – 4 Days';
      co2 = '4.8 Tonnes CO2';
    } else if (mode === 'Ocean FCL') {
      base = Math.max(1850, (v / 30) * 2300);
      days = '18 – 25 Days';
      co2 = '0.9 Tonnes CO2';
    } else if (mode === 'Ocean LCL') {
      base = Math.max(450, v * 120 + (w / 1000) * 75);
      days = '22 – 30 Days';
      co2 = '0.7 Tonnes CO2';
    } else {
      base = 1100 + (w / 1000) * 85;
      days = '3 – 6 Days';
      co2 = '2.1 Tonnes CO2';
    }

    const min = Math.round(base * 0.95);
    const max = Math.round(base * 1.12);

    return { min, max, days, co2 };
  };

  const est = calculateEstimate();

  return (
    <section id="calculator" className="py-20 lg:py-24 bg-[#070d18] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Explanation Column */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
              Instant Freight Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Calculate Spot Rates & Transit Windows in Seconds
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              No more waiting days for broker quotes. Our algorithm indexes daily port carrier
              tariffs, bunker adjustment factors (BAF), and currency fluctuations to give you
              reliable landed cost estimates.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#00e5c9]/10 text-[#00e5c9] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Guaranteed Space & Sailing Timetables</h4>
                  <p className="text-xs text-slate-400">Direct carrier allocations mean your cargo never rolls over.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#00e5c9]/10 text-[#00e5c9] flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">All-Inclusive Port Terminal Handling</h4>
                  <p className="text-xs text-slate-400">No surprise destination gate charges or demurrage fees.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Calculator Box */}
          <div className="lg:col-span-7 bg-[#091322] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#00e5c9]/15 text-[#00e5c9]">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Quick Rate Estimator</h3>
              </div>
              <span className="text-xs text-[#00e5c9] font-mono">Live Spot Index: Q3 2026</span>
            </div>

            {/* Mode selection buttons */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Transportation Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Ocean FCL' as const, label: 'Ocean FCL', icon: Ship },
                  { id: 'Ocean LCL' as const, label: 'Ocean LCL', icon: Ship },
                  { id: 'Air Freight' as const, label: 'Air Freight', icon: Plane },
                  { id: 'Overland Road' as const, label: 'Overland Road', icon: Truck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        isSelected
                          ? 'border-[#00e5c9] bg-[#00e5c9]/15 text-white'
                          : 'border-slate-800 bg-[#070d18] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ports selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Origin Hub
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                >
                  {GLOBAL_PORTS.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name} ({p.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Destination Gateway
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                >
                  {GLOBAL_PORTS.map((p) => (
                    <option key={`c-dest-${p.code}`} value={p.name}>
                      {p.name} ({p.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weight and CBM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Cargo Gross Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                  min="50"
                  max="100000"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Estimated Volume (CBM)
                </label>
                <input
                  type="number"
                  value={volumeCbm}
                  onChange={(e) => setVolumeCbm(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                  min="1"
                  max="500"
                />
              </div>
            </div>

            {/* Result Display Box */}
            <div className="bg-[#070d18] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
                    Estimated Spot Rate Range
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#00e5c9] mt-0.5">
                    ${est.min.toLocaleString()} – ${est.max.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
                    Estimated Transit Window
                  </span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {est.days}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Leaf className="w-3.5 h-3.5" />
                  Carbon Benchmark: {est.co2}
                </span>
                <span className="text-[11px]">Includes Ocean Bunker & B/L</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => onOpenQuoteModal(mode, origin, destination)}
              className="w-full py-3.5 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <span>Lock In Rate & Request Booking</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
