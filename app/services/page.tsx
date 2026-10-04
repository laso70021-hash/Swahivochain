'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrackingModal from '@/components/TrackingModal';
import QuoteModal from '@/components/QuoteModal';
import {
  Ship,
  Plane,
  Truck,
  Warehouse,
  FileCheck,
  ThermometerSnowflake,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe2,
  Lock,
  Layers,
  PhoneCall,
  Search,
  ChevronRight,
  Anchor,
  Box,
} from 'lucide-react';

export default function ServicesPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('Ocean FCL (Full Container)');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'ocean', label: 'Ocean Freight' },
    { id: 'air', label: 'Air Cargo' },
    { id: 'warehousing', label: 'Warehousing & 3PL' },
    { id: 'intermodal', label: 'Overland & Rail' },
    { id: 'customs', label: 'Customs & Compliance' },
    { id: 'cold-chain', label: 'Cold-Chain Logistics' },
    { id: 'finance', label: 'Trade Finance & Escrow' },
  ];

  const services = [
    {
      id: 'ocean',
      category: 'ocean',
      title: 'Ocean Freight Forwarding (FCL & LCL)',
      tagline: 'Secured Tier-1 Vessel Capacity on Continental Maritime Corridors',
      icon: Ship,
      image: '/images/ocean_freight_port_1790406423293.jpg',
      quoteMode: 'Ocean FCL (Full Container)',
      description:
        'Direct space agreements with top ocean carrier alliances (2M, Ocean Alliance, THE Alliance) guarantee vessel space, predictable sailing schedules, and transparent port handling terms without seasonal cargo roll-offs.',
      metrics: [
        { label: 'Transit Time', val: '12 – 35 Days' },
        { label: 'Equipment', val: '20ft, 40ft, 40ft HC, Open Top, Reefer' },
        { label: 'Port Coverage', val: '450+ Global Commercial Seaports' },
        { label: 'Allocation SLA', val: 'Zero Rollover Guarantee' },
      ],
      benefits: [
        'Full Container Load (FCL) priority berth loading and dedicated feeder connections',
        'Less than Container Load (LCL) scheduled weekly consolidations across 85+ gateways',
        'Direct electronic Bills of Lading (eBL) integrated with maritime customs clearance',
        'Continuous AIS satellite tracking with automated port milestone timestamps',
        'Itemized demurrage shields preventing unexpected detention and terminal charges',
      ],
      badgeText: 'Tier-1 Liner Alliances',
    },
    {
      id: 'air',
      category: 'air',
      title: 'Air Freight Express & Cargo Charters',
      tagline: 'Priority Capacity & Dedicated Freighter Corridors Worldwide',
      icon: Plane,
      image: '/images/air_freight_cargo_1790406410966.jpg',
      quoteMode: 'Air Freight Express',
      description:
        'When speed is critical, Logistics Chain secures priority cargo allocations on commercial passenger wide-bodies and dedicated Boeing 777F & 747-8F freighters for urgent, high-value, and oversized project cargo.',
      metrics: [
        { label: 'Global Transit', val: '24 – 72 Hours' },
        { label: 'Aircraft Types', val: 'B777F, B747-8F, A330F, Regional Charters' },
        { label: 'Service Levels', val: 'Express NFO, Scheduled Consolidation, Full Charter' },
        { label: 'Accreditation', val: 'IATA Cargo Agent & DGR Certified' },
      ],
      benefits: [
        'Next-Flight-Out (NFO) priority loading with tarmac ramp transfer protocols',
        'Full and part air charter options for oversized project freight and peak demand',
        'Certified handling for hazardous goods (IATA DGR) and lithium battery shipments',
        'On-Board Courier (OBC) hand-carry services for ultra-critical industrial spares',
        'Instant air waybill generation and real-time flight telemetry monitoring',
      ],
      badgeText: 'IATA Accredited Express',
    },
    {
      id: 'warehousing',
      category: 'warehousing',
      title: 'Automated Warehousing & 3PL Distribution',
      tagline: 'Strategic Bonded Hubs at Critical Global Trade Junctions',
      icon: Warehouse,
      image: '/images/warehouse_logistics_hub_1790406395681.jpg',
      quoteMode: 'Warehouse + Distribution',
      description:
        'High-density vertical storage facilities equipped with automated conveyor systems, barcode WMS inventory synchronization, climate regulation, and rapid multi-carrier cross-docking capabilities.',
      metrics: [
        { label: 'Storage Area', val: '450,000+ m² Global Footprint' },
        { label: 'Inventory Sync', val: 'Real-time REST API & EDI Integrations' },
        { label: 'Security Standard', val: 'TAPA FSR Class A & 24/7 CCTV' },
        { label: 'Dispatch Speed', val: 'Same-Day Cross-Dock Order Fulfillment' },
      ],
      benefits: [
        'Bonded warehousing enabling deferred customs duty payment until domestic distribution',
        'Automated pick, pack, kit, and label with seamless ERP/WMS API integration',
        'Temperature and humidity controlled storage chambers for perishables and cosmetics',
        'High-velocity cross-docking minimizing storage dwell times to under 12 hours',
        'Comprehensive asset security with biometric access control and NFPA fire suppression',
      ],
      badgeText: 'Bonded 3PL Network',
    },
    {
      id: 'intermodal',
      category: 'intermodal',
      title: 'Road Freight & Continental Rail Intermodal',
      tagline: 'Reliable Overland Corridor Logistics from Factory Gates to Destination Hubs',
      icon: Truck,
      image: '/images/intermodal_freight_1790426740144.jpg',
      quoteMode: 'Road Freight (FTL / LTL)',
      description:
        'Modern GPS-monitored fleet of dry vans, flatbeds, and heavy-haul trailers combined with scheduled continental rail block trains linking deep-sea port terminals directly to inland manufacturing hubs.',
      metrics: [
        { label: 'Fleet Composition', val: 'Dry Van, Flatbed, Low-Bed Heavy Haul, Reefer' },
        { label: 'Service Types', val: 'Full Truckload (FTL), LTL, Intermodal Rail' },
        { label: 'Telematics', val: 'Continuous GPS Geo-fencing & Electronic E-Seals' },
        { label: 'Corridor Reach', val: 'North America, Europe, East & Southern Africa' },
      ],
      benefits: [
        'Scheduled Full Truckload (FTL) and Less Than Truckload (LTL) corridor departures',
        'Bonded transit corridors with electronic seal monitoring to bypass border delays',
        'Transcontinental intermodal rail bridging seaport terminals to inland dry ports',
        'Specialized permits and escort arrangements for out-of-gauge (OOG) machinery',
        'Final-mile tail-lift delivery to commercial retail, job sites, and warehouse doors',
      ],
      badgeText: 'GPS Telematics Fleet',
    },
    {
      id: 'customs',
      category: 'customs',
      title: 'Customs Brokerage & Regulatory Compliance',
      tagline: 'Accelerated Port Discharge & Complete Tariff Optimization',
      icon: FileCheck,
      image: '/images/customs_compliance_1790426755028.jpg',
      quoteMode: 'Customs Brokerage & Clearance',
      description:
        'Licensed in-house customs specialists navigate harmonized tariff schedules, free trade agreements (USMCA, AfCFTA, EU-GSP), and electronic manifest filings to guarantee rapid, audit-proof clearances.',
      metrics: [
        { label: 'Average Release', val: '< 3.5 Hours from Vessel Berthing' },
        { label: 'Certification', val: 'Authorized Economic Operator (AEO-F)' },
        { label: 'Filing Method', val: 'Direct Customs Electronic Data Interchange (EDI)' },
        { label: 'Compliance Rate', val: '99.8% First-Time Inspection Clearance' },
      ],
      benefits: [
        'Pre-arrival digital manifest filings to secure release before cargo arrives at port',
        'Accurate Harmonized System (HS) code classification and duty drawback reclamation',
        'Authorized Economic Operator (AEO) expedited green-lane clearance priority',
        'Import/export permits, phytosanitary certifications, and temporary carnets',
        'Audit-ready electronic records retention complying with international trade laws',
      ],
      badgeText: 'AEO-F Certified Brokerage',
    },
    {
      id: 'cold-chain',
      category: 'cold-chain',
      title: 'Pharmaceutical & Cold-Chain Logistics',
      tagline: 'Good Distribution Practice (GDP) Certified Thermal Cargo Protection',
      icon: ThermometerSnowflake,
      image: '/images/cold_chain_cargo_1790426766593.jpg',
      quoteMode: 'Cold-Chain & Reefer Logistics',
      description:
        'End-to-end temperature integrity for vaccines, biologic therapies, active pharmaceutical ingredients (APIs), and fresh perishables backed by calibrated wireless IoT temperature loggers and validated packaging.',
      metrics: [
        { label: 'Thermal Bands', val: 'Deep Frozen (-80°C), Frozen (-20°C), Ambient (+15°C to +25°C)' },
        { label: 'Container Types', val: 'Active Envirotainer / CSafe & Passive VIP Shippers' },
        { label: 'Monitoring', val: 'Continuous 15-Minute Sensor Uploads with Excursion Alarms' },
        { label: 'Compliance', val: 'WHO GDP / 2013/C 343/01 Certified' },
      ],
      benefits: [
        'Validated active and passive temperature-controlled container packaging solutions',
        'Real-time IoT temperature, humidity, and door-opening shock sensors with live alerts',
        'Pre-conditioned phase change materials (PCM) and dry-ice replenishment stations',
        'Dedicated 24/7 cold-chain control desk with rapid intervention response protocols',
        'Complete digital temperature excursion reports provided upon final delivery release',
      ],
      badgeText: 'GDP Certified Integrity',
    },
    {
      id: 'finance',
      category: 'finance',
      title: 'Trade Finance & Multi-Currency Escrow',
      tagline: 'Modern Fintech Settlement to Accelerate Working Capital in Transit',
      icon: DollarSign,
      image: '/images/hero_cargo_logistics_1790406382804.jpg',
      quoteMode: 'Trade Finance & Escrow',
      description:
        'Integrated fintech escrow infrastructure eliminates payment risks in international commerce. Funds are held securely in Tier-1 banking partners and disbursed automatically upon verified milestone proof-of-delivery.',
      metrics: [
        { label: 'Supported Currencies', val: 'USD, EUR, GBP, AED, TZS, KES, CNY' },
        { label: 'Disbursement Speed', val: 'Instant Release on Verified Milestone Delivery' },
        { label: 'Cargo Underwriting', val: 'Up to $50M All-Risk Lloyd’s Insurance Coverage' },
        { label: 'Capital Advance', val: 'Up to 80% Invoice Value Advance Against eBL' },
      ],
      benefits: [
        'Multi-currency digital escrow accounts eliminating overseas foreign exchange risk',
        'Automated smart contract releases triggered by verified IoT GPS and customs timestamps',
        'Pre-export and in-transit working capital financing against validated bills of lading',
        'Comprehensive marine cargo insurance backed by top-rated Lloyd’s syndicates',
        'Transparent fee structure with zero hidden bank correspondence deductions',
      ],
      badgeText: 'Fintech + Logistics Escrow',
    },
  ];

  const filteredServices =
    activeCategory === 'all'
      ? services
      : services.filter((srv) => srv.category === activeCategory);

  const handleOpenBooking = (mode: string) => {
    setSelectedService(mode);
    setIsQuoteOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d18] text-slate-100">
      {/* Top Header */}
      <Header
        onOpenQuoteModal={() => setIsQuoteOpen(true)}
        onOpenTrackingModal={() => setIsTrackingOpen(true)}
      />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="relative w-full overflow-hidden bg-[#030914] pt-14 pb-20 lg:pt-20 lg:pb-24 border-b border-slate-800/80">
          {/* Subtle background radial glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00e5c9]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-[450px] h-[300px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/40 text-xs font-semibold text-[#00e5c9]">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Services & Capabilities · Global Multimodal Freight</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.1]">
                Comprehensive Logistics &{' '}
                <span className="text-[#00e5c9]">Supply Chain</span> Solutions
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                From ocean container liner allocations and air charters to bonded warehousing,
                expedited customs clearance, and fintech escrow settlement, Logistics Chain powers
                global trade with deterministic speed and transparency.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsQuoteOpen(true)}
                  className="px-6 py-3 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
                >
                  <span>Request Custom Freight Quote</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="px-6 py-3 bg-[#0a1424] hover:bg-[#0f1f36] text-white font-semibold text-xs sm:text-sm rounded-lg border border-slate-700/80 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-[#00e5c9]" />
                  <span>Track Active Shipment</span>
                </button>
              </div>
            </div>

            {/* Service Filter Tabs (Interactive Segmented Controls) */}
            <div className="mt-14 pt-8 border-t border-slate-800/80">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeCategory === cat.id
                        ? 'bg-[#00e5c9] text-[#070d18] font-bold shadow-md shadow-teal-500/20'
                        : 'bg-[#081426] text-slate-300 hover:text-white hover:bg-[#0c1f38] border border-slate-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Structured Services Showcase Section */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {filteredServices.map((srv, idx) => {
            const Icon = srv.icon;
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={srv.id}
                id={srv.id}
                className="scroll-mt-28 rounded-3xl bg-[#051020]/90 border border-slate-800/90 overflow-hidden shadow-2xl hover:border-slate-700/80 transition-all"
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 lg:p-12`}
                >
                  {/* Left or Right Media Visual */}
                  <div
                    className={`lg:col-span-5 relative w-full h-[320px] sm:h-[380px] lg:h-[440px] rounded-2xl overflow-hidden border border-slate-800 bg-[#091222] shadow-xl ${
                      isReversed ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <Image
                      src={srv.image}
                      alt={srv.title}
                      fill
                      priority={idx < 2}
                      sizes="(max-width: 1024px) 100vw, 540px"
                      className="object-cover object-center transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-transparent to-black/30" />

                    {/* Top Corner Floating Badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#051020]/90 border border-slate-700/80 text-[11px] font-semibold text-[#00e5c9] backdrop-blur-md">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{srv.badgeText}</span>
                    </div>

                    {/* Bottom Operational Stat Capsule */}
                    <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#06101f]/95 border border-slate-700/80 backdrop-blur-md flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00e5c9]" />
                        <span className="font-semibold text-white">Full Chain-of-Custody</span>
                      </div>
                      <span className="font-mono text-[#00e5c9] text-[11px]">24/7 Active GPS</span>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div
                    className={`lg:col-span-7 space-y-6 ${
                      isReversed ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    {/* Header with Icon and Title */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#081829] border border-[#00e5c9]/30 flex items-center justify-center text-[#00e5c9]">
                          <Icon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-xs font-mono font-bold text-[#00e5c9] uppercase tracking-wider">
                          Module 0{idx + 1}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {srv.title}
                      </h2>
                      <h3 className="text-sm font-semibold text-[#00e5c9]">{srv.tagline}</h3>
                    </div>

                    {/* Short Description */}
                    <p className="text-sm text-slate-300 leading-relaxed">{srv.description}</p>

                    {/* Operational Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#071324] border border-slate-800 text-xs">
                      {srv.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="space-y-0.5">
                          <span className="text-[11px] text-slate-400 block">{m.label}</span>
                          <span className="font-semibold text-white block">{m.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key Benefits */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Key Service Benefits
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                        {srv.benefits.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#00e5c9] shrink-0 mt-0.5" />
                            <span className="leading-snug">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="pt-4 border-t border-slate-800/90 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleOpenBooking(srv.quoteMode)}
                        className="px-5 py-2.5 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-teal-500/15"
                      >
                        <span>Book / Quote This Service</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      <a
                        href="https://wa.me/255773306684"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-[#081426] hover:bg-[#0c1f38] text-slate-300 hover:text-white font-semibold text-xs sm:text-sm rounded-lg border border-slate-700/80 transition-colors flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Speak with Dispatch Desk</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Multimodal Service Comparison Matrix */}
        <section className="py-16 bg-[#040a16] border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00e5c9]">
                Quick Guidance Matrix
              </span>
              <h2 className="text-3xl font-extrabold text-white">Compare Modes at a Glance</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose the optimal balance of speed, carbon intensity, volume, and budget for your
                cargo.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#06101f]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#081528] text-slate-300 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5">Freight Mode</th>
                    <th className="py-4 px-5">Average Transit Speed</th>
                    <th className="py-4 px-5">Cost Profile</th>
                    <th className="py-4 px-5">Carbon Efficiency</th>
                    <th className="py-4 px-5">Best Suited For</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-2">
                      <Ship className="w-4 h-4 text-[#00e5c9]" />
                      <span>Ocean FCL / LCL</span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-200">12 – 35 Days</td>
                    <td className="py-4 px-5 font-semibold text-emerald-400">Most Economical</td>
                    <td className="py-4 px-5">Lowest (12-18g CO2/t-km)</td>
                    <td className="py-4 px-5">Bulk manufactured goods, raw materials, heavy cargo</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenBooking('Ocean FCL (Full Container)')}
                        className="text-[#00e5c9] hover:underline font-semibold"
                      >
                        Quote Ocean
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#00e5c9]" />
                      <span>Air Express & Charter</span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-200">24 – 72 Hours</td>
                    <td className="py-4 px-5 font-semibold text-amber-400">Premium Speed</td>
                    <td className="py-4 px-5">High Intensity (500g CO2/t-km)</td>
                    <td className="py-4 px-5">High-value tech, emergency spares, life sciences</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenBooking('Air Freight Express')}
                        className="text-[#00e5c9] hover:underline font-semibold"
                      >
                        Quote Air
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#00e5c9]" />
                      <span>Road & Rail Intermodal</span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-200">2 – 8 Days</td>
                    <td className="py-4 px-5 font-semibold text-blue-400">Balanced Regional</td>
                    <td className="py-4 px-5">Moderate (20-60g CO2/t-km)</td>
                    <td className="py-4 px-5">Cross-border continental trade & factory-to-port drayage</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenBooking('Road Freight (FTL / LTL)')}
                        className="text-[#00e5c9] hover:underline font-semibold"
                      >
                        Quote Overland
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-2">
                      <ThermometerSnowflake className="w-4 h-4 text-[#00e5c9]" />
                      <span>Cold-Chain Reefer</span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-200">Air: 1-3d / Ocean: 10-25d</td>
                    <td className="py-4 px-5 font-semibold text-cyan-400">Regulated Thermal</td>
                    <td className="py-4 px-5">Validated Packaging</td>
                    <td className="py-4 px-5">Vaccines, oncology drugs, donor organs, perishables</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenBooking('Cold-Chain & Reefer Logistics')}
                        className="text-[#00e5c9] hover:underline font-semibold"
                      >
                        Quote Cold-Chain
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Global Conversion Banner */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#00b49e] via-[#00e5c9] to-[#15f7dc] p-8 sm:p-12 lg:p-16 text-[#050c18] overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#050c18_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#050c18]/15 border border-[#050c18]/25 text-[#050c18]">
                Instant Freight Booking
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#040a16] leading-tight">
                Need a Tailored Supply Chain Solution?
              </h2>

              <p className="text-sm sm:text-base font-medium text-[#07162b] leading-relaxed">
                Our global logistics coordinators are available 24/7 to provide instant container space
                allocations, multi-stop consolidations, and priority air charters.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsQuoteOpen(true)}
                  className="px-6 py-3.5 bg-[#050c18] hover:bg-[#091526] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl flex items-center gap-2"
                >
                  <span>Request All-Inclusive Quote</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <a
                  href="https://wa.me/255773306684"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-white/30 hover:bg-white/40 text-[#050c18] font-bold text-xs sm:text-sm rounded-xl transition-colors border border-[#050c18]/20 flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Chat with Marine & Air Desk</span>
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
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialMode={selectedService}
      />
      <TrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
    </div>
  );
}
