'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Calculator, ArrowRight, ShieldCheck, Ship, Plane, Truck, Layers } from 'lucide-react';
import { GLOBAL_PORTS } from '@/lib/logistics-data';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: string;
  initialOrigin?: string;
  initialDestination?: string;
}

export default function QuoteModal({
  isOpen,
  onClose,
  initialMode = 'Ocean FCL (Full Container)',
  initialOrigin = 'Shanghai (Yangshan)',
  initialDestination = 'Rotterdam',
}: QuoteModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [cargoType, setCargoType] = useState('General Commercial Goods');
  const [weightKg, setWeightKg] = useState('15000');
  const [volumeCbm, setVolumeCbm] = useState('32');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState('');

  const calculateEstimate = () => {
    const w = parseFloat(weightKg) || 1000;
    const v = parseFloat(volumeCbm) || 10;
    let baseRate = 1800;

    if (mode.includes('Air')) {
      baseRate = w * 4.2 + 650;
    } else if (mode.includes('Ocean FCL')) {
      baseRate = Math.max(1650, (v / 30) * 2200);
    } else if (mode.includes('Ocean LCL')) {
      baseRate = Math.max(450, v * 115 + (w / 1000) * 85);
    } else if (mode.includes('Road')) {
      baseRate = 950 + (w / 1000) * 60;
    } else {
      baseRate = 2400 + (w / 1000) * 45;
    }

    const min = Math.round(baseRate * 0.95);
    const max = Math.round(baseRate * 1.15);
    return { min, max };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `QT-${Math.floor(100000 + Math.random() * 900000)}`;
    setQuoteId(generatedId);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  const estimate = calculateEstimate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a1222] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070d18]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Instant Freight Rate Quote</h2>
              <p className="text-xs text-slate-400">
                Transparent spot rates & contractual volume tariff estimates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#00e5c9]/10 border border-[#00e5c9] flex items-center justify-center mx-auto text-[#00e5c9]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#00e5c9]">
                Booking Request Dispatched
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">Quote Reference: {quoteId}</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mt-2">
                Thank you, <strong className="text-white">{name || 'Customer'}</strong>. Our specialized trade lane desk has reserved your indicative rate bracket:
              </p>
            </div>

            <div className="bg-[#070d18] border border-slate-800 p-4 rounded-xl max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Route:</span>
                <span className="text-white font-medium">{origin} → {destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Freight Mode:</span>
                <span className="text-white font-medium">{mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Rate Bracket:</span>
                <span className="text-[#00e5c9] font-mono font-bold text-sm">
                  ${estimate.min.toLocaleString()} – ${estimate.max.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confirmation Sent To:</span>
                <span className="text-white font-medium">{email || 'your email'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              A dedicated trade lane manager will contact you within 30 minutes with official customs documentation checklist and booking allocation.
            </p>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#00e5c9] hover:bg-[#14f3d7] text-[#070d18] font-bold text-sm rounded-xl transition-colors"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {/* Mode selection buttons */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Select Freight Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Ocean FCL', label: 'Ocean FCL', icon: Ship },
                  { id: 'Ocean LCL', label: 'Ocean LCL', icon: Layers },
                  { id: 'Air Freight', label: 'Air Cargo', icon: Plane },
                  { id: 'Overland Road', label: 'Overland Road', icon: Truck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-[#00e5c9] bg-[#00e5c9]/10 text-white'
                          : 'border-slate-800 bg-[#070d18] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#00e5c9]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Origin Port or City
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
                  Destination Port or City
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                >
                  {GLOBAL_PORTS.map((p) => (
                    <option key={`dest-${p.code}`} value={p.name}>
                      {p.name} ({p.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cargo Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Cargo Category
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                >
                  <option>General Commercial Goods</option>
                  <option>High-Tech & Electronics</option>
                  <option>Pharmaceuticals & Cold Chain</option>
                  <option>Automotive & Machinery</option>
                  <option>Perishables & Agricultural</option>
                  <option>Hazardous / IMO Classified</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Est. Gross Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                  placeholder="e.g. 15000"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Est. Volume (CBM / m³)
                </label>
                <input
                  type="number"
                  value={volumeCbm}
                  onChange={(e) => setVolumeCbm(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                  placeholder="e.g. 32"
                  required
                />
              </div>
            </div>

            {/* Dynamic Estimated Bracket Callout */}
            <div className="bg-[#070d18] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                  Indicative Market Spot Rate
                </span>
                <span className="text-lg font-bold font-mono text-[#00e5c9]">
                  ${estimate.min.toLocaleString()} – ${estimate.max.toLocaleString()} USD
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Includes port terminal fees, standard fuel bunker surcharge & bill of lading.
                </span>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-slate-400 block">Est. Transit Time</span>
                <span className="text-xs font-semibold text-white">
                  {mode.includes('Air') ? '2 – 4 Days' : mode.includes('Road') ? '3 – 5 Days' : '18 – 24 Days'}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Shipper Contact Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                  required
                />
                <input
                  type="email"
                  placeholder="Business Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                  required
                />
                <input
                  type="text"
                  placeholder="Company / Organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                />
                <input
                  type="tel"
                  placeholder="Phone / WhatsApp Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9]"
                  required
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#00e5c9]" />
                <span>Price guaranteed for 14 days</span>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00e5c9] hover:bg-[#14f3d7] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-colors"
              >
                <span>Request Official Rate Quote</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
