'use client';

import React, { useState } from 'react';
import {
  Car,
  ShoppingBag,
  HeartPulse,
  Cpu,
  Apple,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface IndustriesSectionProps {
  onOpenQuoteModal: (industry?: string) => void;
}

export default function IndustriesSection({ onOpenQuoteModal }: IndustriesSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  const industries = [
    {
      id: 'automotive',
      name: 'Automotive & Industrial',
      icon: Car,
      tagline: 'Just-in-time assembly logistics and tier-1 component delivery',
      points: [
        'Dedicated expediting desks for production-line-critical parts (AOG / Line-Down response in 2 hours)',
        'Sequenced container de-stuffing and direct manufacturing plant shuttle transport',
        'Custom returnable packaging and crate reverse logistics systems',
      ],
      compliance: 'ISO/TS 16949 & VDA 6.2 Certified Handling',
      stat: '99.8% On-Time Plant Dock Delivery',
    },
    {
      id: 'retail',
      name: 'Retail & E-Commerce',
      icon: ShoppingBag,
      tagline: 'High-velocity omnichannel replenishment and peak seasonal buffering',
      points: [
        'Direct-to-fulfillment-center deconsolidation for major global e-commerce marketplaces',
        'Bonded warehousing with cross-docking and barcode SKU-level scanning',
        'End-to-end container drayage with port demurrage risk mitigation',
      ],
      compliance: 'EDI 856 / 214 Automated ASN Feeds',
      stat: 'Over 850,000 Retail Parcels Moved Monthly',
    },
    {
      id: 'healthcare',
      name: 'Pharma & Healthcare',
      icon: HeartPulse,
      tagline: 'GDP-compliant active and passive cold-chain transport for vaccines and diagnostics',
      points: [
        'Validated thermal containers maintaining precise -80°C, -20°C, and +2°C to +8°C bands',
        'Calibrated real-time IoT dataloggers with automatic deviation excursion alerts',
        'Priority airport tarmac handling and expedited medical customs fast-track release',
      ],
      compliance: 'WHO Good Distribution Practice (GDP) Certified',
      stat: '0.00% Critical Thermal Excursion Rate',
    },
    {
      id: 'technology',
      name: 'High-Tech & Electronics',
      icon: Cpu,
      tagline: 'High-security transport for semiconductors, microchips, and consumer tech',
      points: [
        'TAPA-A certified secure transit with dual-driver teams and geofenced routing',
        'Anti-static ESD packaging and cleanroom handling protocols',
        'Air cargo priority charter space for global consumer product launch windows',
      ],
      compliance: 'TAPA TSR Level 1 High-Security Standard',
      stat: '$1.2B Tech Cargo Protected Annually',
    },
    {
      id: 'agriculture',
      name: 'Agri-Business & Perishables',
      icon: Apple,
      tagline: 'Atmosphere-controlled reefer shipping for fresh fruits, tea, coffee, and seafood',
      points: [
        'Controlled Atmosphere (CA) reefer containers slowing ripening for long ocean voyages',
        'Pre-cooling facilities and cold-storage hubs situated near key harvesting hubs',
        'Expedited phytosanitary inspection management and veterinary health clearance',
      ],
      compliance: 'HACCP & GlobalGAP Cold Chain Compliant',
      stat: 'Extended Shelf Life by Average +7 Days',
    },
    {
      id: 'energy',
      name: 'Energy & Heavy Machinery',
      icon: Zap,
      tagline: 'Out-of-gauge (OOG) project cargo, wind turbines, and heavy mining infrastructure',
      points: [
        'Specialized flat rack, open top, and breakbulk heavy-lift vessel chartering',
        'Route civil surveys, bridge weight stress testing, and police escort coordination',
        'Site-to-foundation turnkey delivery in remote extractive and industrial zones',
      ],
      compliance: 'Full Cargo Marine Warranty Survey Standards',
      stat: 'Safely Moved Units Exceeding 120 Tonnes',
    },
  ];

  const current = industries[activeTab];

  return (
    <section className="py-20 lg:py-24 bg-[#070d18] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
            Industries Served
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Engineered for High-Stakes Commercial Supply Chains
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Every sector has unique customs regulations, temperature boundaries, and lead time
            pressures. We provide specialized handling tailored to your industry.
          </p>
        </div>

        {/* Industry Interactive Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {industries.map((ind, index) => {
            const Icon = ind.icon;
            const isActive = activeTab === index;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isActive
                    ? 'border-[#00e5c9] bg-[#00e5c9]/15 text-white shadow-lg shadow-teal-500/10'
                    : 'border-slate-800 bg-[#091222] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00e5c9]' : 'text-slate-400'}`} />
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Industry Showcase Card */}
        <div className="bg-[#091322] border border-slate-800 rounded-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#00e5c9]/15 text-[#00e5c9]">
                  <current.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{current.name}</h3>
                  <p className="text-xs sm:text-sm text-[#00e5c9] font-medium mt-0.5">
                    {current.tagline}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {current.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00e5c9] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#00e5c9]" />
                  <span>{current.compliance}</span>
                </div>
                <div className="text-[#00e5c9] font-mono font-semibold">
                  {current.stat}
                </div>
              </div>
            </div>

            {/* Right Action Callout */}
            <div className="lg:col-span-4 bg-[#070d18] border border-slate-800/80 rounded-xl p-6 text-center space-y-4">
              <h4 className="text-base font-bold text-white">
                Consult a Trade Lane Specialist for {current.name}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with our specialized logistics engineer to audit your route corridors and optimize landed container costs.
              </p>
              <button
                onClick={() => onOpenQuoteModal(current.name)}
                className="w-full py-3 bg-[#00e5c9] hover:bg-[#15f7dc] text-[#070d18] font-bold text-xs rounded-xl transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <span>Request Industry Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
