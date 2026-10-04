'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrackingModal from '@/components/TrackingModal';
import QuoteModal from '@/components/QuoteModal';
import {
  Globe2,
  ShieldCheck,
  Anchor,
  Plane,
  Truck,
  Ship,
  Building,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  Cpu,
  Layers,
  FileCheck,
  DollarSign,
  Award,
  PhoneCall,
  MapPin,
  Lock,
} from 'lucide-react';

export default function AboutPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const keyMetrics = [
    { value: '2.4M+', label: 'Metric Tons Moved', detail: 'Across high-frequency trade lanes' },
    { value: '160+', label: 'Countries Represented', detail: 'Direct agency & port representation' },
    { value: '99.4%', label: 'On-Time Dispatch Rate', detail: 'Zero rollover space commitments' },
    { value: '450+', label: 'Commercial Sea & Air Ports', detail: 'Seamless multimodal handling' },
  ];

  const problemsAndSolutions = [
    {
      problemTitle: 'Opaque Tariffs & Demurrage Spikes',
      problemDesc:
        'Legacy forwarders routinely present unexpected port detention, container demurrage, and variable fuel surcharges long after the vessel has sailed.',
      solutionTitle: 'Deterministic Upfront Pricing',
      solutionDesc:
        'All-inclusive, binding rate calculations with transparent terminal handling fees, customs tariffs, and automated demurrage protection built into every booking.',
      icon: DollarSign,
    },
    {
      problemTitle: 'Fragmented Multi-Carrier Custody',
      problemDesc:
        'Cargo typically passes through 4 to 7 disconnected brokers and sub-haulers, resulting in blind transshipment gaps and zero single-point accountability when delays occur.',
      solutionTitle: 'Unified End-to-End Custody',
      solutionDesc:
        'Single-operator contractual responsibility from origin factory gate to final inland distribution center, supported by continuous sensor monitoring.',
      icon: Layers,
    },
    {
      problemTitle: 'Customs Bottlenecks & Tariff Holds',
      problemDesc:
        'Discrepancies in harmonized tariff codes, missing phytosanitary documents, and paper-based Bills of Lading hold cargo in port yards for days or weeks.',
      solutionTitle: 'Automated Digital Customs Clearance',
      solutionDesc:
        'Licensed in-house customs brokerage with direct EDI port integration, pre-arrival digital manifest filings, and automated compliance verification.',
      icon: FileCheck,
    },
    {
      problemTitle: 'Working Capital Lockup in Transit',
      problemDesc:
        'Extended ocean voyages and bureaucratic document handoffs freeze millions in inventory cash flow while waiting for traditional bank letters of credit.',
      solutionTitle: 'Integrated Trade Finance & Escrow',
      solutionDesc:
        'Modern fintech escrow infrastructure with instant digital milestone release, flexible supplier financing, and multi-currency cross-border settlement.',
      icon: Lock,
    },
  ];

  const businessValues = [
    {
      title: 'Zero Rollover Space Commitment',
      description:
        'Direct space agreements with top shipping liners and cargo airlines guarantee your cargo sails on the scheduled voyage without port bumping or terminal rollover.',
      stat: '100% Space Assurance',
    },
    {
      title: '38% Reduction in Transit Variance',
      description:
        'Predictive route orchestration avoids congested maritime choke-points, canal backups, and labor bottlenecks before they impact your delivery schedules.',
      stat: '-38% Transit Variance',
    },
    {
      title: 'Granular IoT Sensor Telematics',
      description:
        'Monitor temperature, humidity, shock events, and door-opening integrity in real time for pharmaceuticals, perishables, and high-value industrial machinery.',
      stat: '24/7 Sensor Telemetry',
    },
    {
      title: 'Single-Pane Digital Control Tower',
      description:
        'Eliminate chaotic email threads and PDF attachments. Track status milestones, download certified bills of lading, and manage invoices from one unified portal.',
      stat: 'Real-Time Visibility',
    },
    {
      title: 'Fast-Track AEO Customs Lanes',
      description:
        'Authorized Economic Operator certification guarantees preferential customs clearance treatment, significantly reducing physical inspection frequency.',
      stat: 'Expedited Port Discharge',
    },
    {
      title: 'Comprehensive Cargo Protection',
      description:
        'All-risk cargo coverage underwritten by leading Lloyd’s syndicates, providing complete financial security up to $50M per single consignment.',
      stat: '$50M Underwritten Value',
    },
  ];

  const operationalPillars = [
    {
      step: '01',
      title: 'Multimodal Capacity Orchestration',
      description:
        'Dynamic integration across Ocean (FCL/LCL), Scheduled Air Cargo, Regional Charter Desks, Bonded Rail Corridors, and Cross-Border Heavy Trucking.',
      icon: Anchor,
    },
    {
      step: '02',
      title: 'Predictive Scheduling & Route Engineering',
      description:
        'Real-time vessel position algorithms and port congestion indexes evaluate optimal transshipment hubs to ensure minimum dwell times.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Automated Document & Tariff Processing',
      description:
        'Digital Bills of Lading, Automated Manifest System (AMS) filings, and direct electronic submission to national customs authorities prior to vessel berthing.',
      icon: FileCheck,
    },
    {
      step: '04',
      title: 'Last-Mile Drayage & Proof-of-Delivery',
      description:
        'Dedicated port drayage fleets and secured inland bonded warehouses ensure immediate handover and electronic proof of delivery with instant ledger updates.',
      icon: Truck,
    },
  ];

  const controlTowers = [
    {
      city: 'Rotterdam, Netherlands',
      region: 'Europe & North Sea Gateway',
      role: 'European maritime headquarters managing deep-sea container terminals, feeder feeder networks, and Rhine intermodal barges.',
      icon: Anchor,
    },
    {
      city: 'Singapore',
      region: 'Asia-Pacific Transshipment Hub',
      role: 'Asia-Pacific control tower supervising high-frequency transshipment corridors, air freight consolidation, and East-West trade flows.',
      icon: Globe2,
    },
    {
      city: 'Dar es Salaam, Tanzania',
      region: 'East & Central Africa Gateway',
      role: 'Regional port command desk coordinating coastal maritime routes, Great Lakes transit, and cross-border trucking into Central Africa.',
      icon: Ship,
    },
    {
      city: 'Chicago, IL, USA',
      region: 'North America Intermodal Center',
      role: 'Class I railhead coordination, midwest bonded warehousing, and trans-pacific ocean freight import distribution.',
      icon: Truck,
    },
    {
      city: 'Dubai, UAE',
      region: 'Middle East & Cross-Trade Hub',
      role: 'Sea-air cross-trade hub connecting European, Asian, and African routes with rapid customs turnarounds and charter operations.',
      icon: Plane,
    },
  ];

  const accreditations = [
    { name: 'ISO 9001:2015', label: 'Quality Management Certified' },
    { name: 'IATA Cargo Agent', label: 'International Air Transport Association' },
    { name: 'FIATA Member', label: 'Federation of Freight Forwarders' },
    { name: 'AEO Certified', label: 'Authorized Economic Operator' },
    { name: 'Lloyd’s Insured', label: 'All-Risk Marine Underwriting' },
  ];

  const carrierPartners = [
    { name: 'Auric Air', role: 'Regional Air Cargo & Charter Network' },
    { name: 'Assalam Air', role: 'Aviation Freight Corridors' },
    { name: 'Air Tanzania', role: 'Commercial Cargo & Belly Freight' },
    { name: 'Azam Marine', role: 'Fast Coastal Sea & Freight Ro-Ro' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070d18] text-slate-100">
      {/* Top Header */}
      <Header
        onOpenQuoteModal={() => setIsQuoteOpen(true)}
        onOpenTrackingModal={() => setIsTrackingOpen(true)}
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative w-full overflow-hidden bg-[#030914] pt-14 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80">
          {/* Subtle background radial illumination */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00e5c9]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/40 text-xs font-semibold text-[#00e5c9]">
                <Globe2 className="w-3.5 h-3.5" />
                <span>About Logistics Chain · Global Freight & Trade Orchestration</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white leading-[1.1]">
                Moving Global Commerce with{' '}
                <span className="text-[#00e5c9]">Certainty</span>, Speed & Transparency
              </h1>

              {/* Mission Statement */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Logistics Chain unites physical freight infrastructure with intelligent telemetry
                and modern fintech settlement. We empower enterprises to move freight across 160+
                countries with guaranteed space, transparent tariffs, and end-to-end custody.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsQuoteOpen(true)}
                  className="px-6 py-3 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
                >
                  <span>Request Freight Quote</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="px-6 py-3 bg-[#0a1424] hover:bg-[#0f1f36] text-white font-semibold text-xs sm:text-sm rounded-lg border border-slate-700/80 transition-colors"
                >
                  Track an Active Shipment
                </button>
              </div>
            </div>

            {/* High-Impact Stat Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-16 pt-10 border-t border-slate-800/80">
              {keyMetrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#051020]/80 border border-slate-800/80 backdrop-blur-sm"
                >
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#00e5c9] block">
                    {m.value}
                  </span>
                  <span className="text-sm font-bold text-white mt-1 block">{m.label}</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Who Logistics Chain Is (Company Identity & Core Mission) */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/30 text-xs font-semibold text-[#00e5c9]">
                Who We Are
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                An Integrated Freight & Supply Chain Platform Built for Modern Global Trade
              </h2>

              <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                Logistics Chain was founded to overcome the structural inefficiencies that slow
                down international commerce. While modern software transformed communication,
                physical freight forwarding remained trapped in manual paperwork, fragmented
                subcontractors, and opaque billing.
              </p>

              <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                We combined direct long-term charter agreements, ocean carrier alliances, licensed
                in-house customs brokerages, and proprietary IoT telemetry into a single unified
                platform. Today, whether moving 500 FEUs of industrial equipment across the Indian
                Ocean or chartering urgent pharmaceutical air cargo, our clients experience
                frictionless visibility and deterministic delivery.
              </p>

              {/* Value Checkpoints */}
              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00e5c9] shrink-0 mt-0.5" />
                  <span>
                    <strong>Asset-Backed Carrier Infrastructure:</strong> Direct vessel allocations
                    with major global shipping lines and regional aviation fleets.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00e5c9] shrink-0 mt-0.5" />
                  <span>
                    <strong>Integrated Fintech & Trade Escrow:</strong> Automated release mechanisms
                    and multi-currency settlement that unlock stuck working capital.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00e5c9] shrink-0 mt-0.5" />
                  <span>
                    <strong>Global Port Agency Representation:</strong> Physical boots on the ground
                    at 450+ ocean and air cargo terminals worldwide.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Media Visual */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-800 bg-[#091222] shadow-2xl">
                <Image
                  src="/images/ocean_freight_port_1790406423293.jpg"
                  alt="Logistics Chain Port Operations and Maritime Infrastructure"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-transparent to-black/20" />

                {/* Overlaid operational metric card */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#051020]/90 border border-slate-700/80 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#00e5c9] uppercase tracking-wider">
                      Guaranteed Capacity Contract
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Tier-1 Liner Tier
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Zero rollover space commitments ensure your ocean containers sail on scheduled
                    departures without port bumping or terminal detention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. The Problems Logistics Chain Is Designed to Solve */}
        <section className="py-20 bg-[#040a16] border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/30 text-xs font-semibold text-[#00e5c9]">
                Systemic Solutions
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Solving the Hardest Failures in Global Logistics
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Traditional freight forwarding relies on fragmented brokers and opaque markups. We
                engineered Logistics Chain to dismantle these legacy friction points.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {problemsAndSolutions.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 sm:p-8 rounded-2xl bg-[#071324] border border-slate-800/90 shadow-xl space-y-5 flex flex-col justify-between hover:border-[#00e5c9]/40 transition-colors"
                  >
                    <div className="space-y-4">
                      {/* Problem Block */}
                      <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 space-y-1.5">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>The Industry Problem</span>
                        </div>
                        <h3 className="text-base font-bold text-white">{item.problemTitle}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.problemDesc}</p>
                      </div>

                      {/* Solution Block */}
                      <div className="p-4 rounded-xl bg-[#00e5c9]/10 border border-[#00e5c9]/30 space-y-1.5">
                        <div className="flex items-center gap-2 text-[#00e5c9] text-xs font-bold uppercase tracking-wider">
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span>The Logistics Chain Solution</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{item.solutionTitle}</h4>
                        <p className="text-xs text-slate-200 leading-relaxed">{item.solutionDesc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. The Value Provided to Businesses */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/30 text-xs font-semibold text-[#00e5c9]">
              Enterprise Advantage
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tangible Value Delivered to Every Shipper
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              From global manufacturers to high-growth regional distributors, our clients achieve
              measurable improvements in supply chain resilience and cost efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessValues.map((val, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#081426] border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <span className="inline-block px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/25">
                    {val.stat}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">{val.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{val.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center text-xs text-[#00e5c9] font-semibold gap-1">
                  <span>Guaranteed SLA</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. The Company's Approach to Logistics Operations */}
        <section className="py-20 bg-[#030914] border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/30 text-xs font-semibold text-[#00e5c9]">
                Operational Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Our 4-Stage Multimodal Operating Model
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Precision execution engineered from initial booking to final mile release,
                coordinated through automated telematics and local port authority desks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {operationalPillars.map((pillar, idx) => {
                const PillarIcon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#06101f] border border-slate-800/90 space-y-4 relative group hover:border-[#00e5c9]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-extrabold text-[#00e5c9]">
                        {pillar.step}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-[#081a30] border border-slate-700/80 flex items-center justify-center text-[#00e5c9]">
                        <PillarIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">{pillar.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Strategic Global Control Towers */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/30 text-xs font-semibold text-[#00e5c9]">
              Physical Footprint
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Strategic Global Control Towers
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              24/7/365 command hubs maintaining active oversight of vessel schedules, air traffic
              clearances, port berthing windows, and customs releases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {controlTowers.map((tower, idx) => {
              const TowerIcon = tower.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#081426] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-[#00e5c9]">
                    <div className="w-8 h-8 rounded-lg bg-[#00e5c9]/15 border border-[#00e5c9]/30 flex items-center justify-center">
                      <TowerIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{tower.city}</h3>
                      <span className="text-[11px] text-slate-400 block">{tower.region}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{tower.role}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Trust, Accreditations & Carrier Alliances */}
        <section className="py-16 bg-[#040a16] border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Accreditations */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00e5c9]">
                  Institutional Compliance
                </span>
                <h3 className="text-xl font-bold text-white">Global Accreditations & Standards</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {accreditations.map((acc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#071324] border border-slate-800 text-center space-y-1"
                  >
                    <Award className="w-5 h-5 text-[#00e5c9] mx-auto mb-2" />
                    <span className="font-bold text-sm text-white block">{acc.name}</span>
                    <span className="text-[11px] text-slate-400 block">{acc.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrier Alliances */}
            <div className="pt-6 border-t border-slate-800/80">
              <div className="text-center max-w-2xl mx-auto mb-6 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00e5c9]">
                  Strategic Alliances
                </span>
                <h3 className="text-xl font-bold text-white">Trusted Regional & Global Carriers</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {carrierPartners.map((carrier, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#071324] border border-slate-800 text-center space-y-1"
                  >
                    <span className="font-bold text-sm text-white block">{carrier.name}</span>
                    <span className="text-[11px] text-slate-400 block">{carrier.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Conversion Banner */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#00b49e] via-[#00e5c9] to-[#15f7dc] p-8 sm:p-12 lg:p-16 text-[#050c18] overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#050c18_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#050c18]/15 border border-[#050c18]/25 text-[#050c18]">
                Get Started Today
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#040a16] leading-tight">
                Ready to Experience Predictable Global Freight?
              </h2>

              <p className="text-sm sm:text-base font-medium text-[#07162b] leading-relaxed">
                Connect with our trade desk for instant container allocations, air charter schedules,
                and transparent customs solutions tailored to your trade routes.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsQuoteOpen(true)}
                  className="px-6 py-3.5 bg-[#050c18] hover:bg-[#091526] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl flex items-center gap-2"
                >
                  <span>Request Instant Freight Quote</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <a
                  href="https://wa.me/255773306684"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-white/30 hover:bg-white/40 text-[#050c18] font-bold text-xs sm:text-sm rounded-xl transition-colors border border-[#050c18]/20 flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Talk with Dispatch Desk</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer
        onOpenTrackingModal={() => setIsTrackingOpen(true)}
        onOpenQuoteModal={() => setIsQuoteOpen(true)}
      />

      {/* Interactive Modals */}
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
      <TrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
    </div>
  );
}
