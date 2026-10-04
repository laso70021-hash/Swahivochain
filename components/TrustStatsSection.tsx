'use client';

import React from 'react';
import { Award, ShieldCheck, Globe, CheckCheck, FileText, Anchor } from 'lucide-react';

export default function TrustStatsSection() {
  const stats = [
    { number: '2.4M+', label: 'Metric Tons Transported', note: 'Global Multimodal Tonnage' },
    { number: '160+', label: 'Countries & Territories', note: 'Direct Agent Network' },
    { number: '99.4%', label: 'On-Time SLA Delivery', note: 'Audited Carrier Reliability' },
    { number: '$1.8B+', label: 'Cargo Value Protected', note: 'Fully Bonded & Insured' },
  ];

  const credentials = [
    { title: 'ISO 9001:2015 Certified', desc: 'Quality Management in Freight Forwarding' },
    { title: 'IATA Registered Cargo Agent', desc: 'Direct Scheduled Airline Allotments' },
    { title: 'FIATA International Member', desc: 'Federation of Freight Forwarders Standard' },
    { title: 'C-TPAT & AEO Authorized', desc: 'Expedited Priority Customs Clearance' },
  ];

  return (
    <section className="py-16 lg:py-20 bg-[#060c17] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#091222] border border-slate-800 text-center space-y-2"
            >
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#00e5c9] tracking-tight">
                {stat.number}
              </div>
              <h3 className="text-sm font-bold text-white">{stat.label}</h3>
              <p className="text-[11px] text-slate-400">{stat.note}</p>
            </div>
          ))}
        </div>

        {/* Global Compliance & Accreditations Row */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#091322]/60 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
                Accredited Standards
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Certified Security, Safety & Cargo Governance
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#00e5c9] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Regulatory Compliance</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {credentials.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#070d18] border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center gap-2 text-[#00e5c9]">
                  <CheckCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white">{c.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal pl-6">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
