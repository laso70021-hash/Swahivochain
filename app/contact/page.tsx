'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrackingModal from '@/components/TrackingModal';
import QuoteModal from '@/components/QuoteModal';
import GoogleMapsSection, { OfficeLocation } from '@/components/GoogleMapsSection';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Building2,
  MessageSquare,
  Globe2,
  ArrowRight,
  PhoneCall,
  Search,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  ChevronDown,
} from 'lucide-react';

export default function ContactPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Form State
  const [department, setDepartment] = useState('Ocean Freight Booking (FCL / LCL)');
  const [urgency, setUrgency] = useState('Standard Inquiry');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingRef, setTrackingRef] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Active FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const offices: OfficeLocation[] = [
    {
      id: 'dar',
      city: 'Dar es Salaam, Tanzania',
      country: 'Tanzania',
      type: 'East & Central Africa Gateway',
      address: 'Harbour View Commercial Towers, 7th Floor, Samora Avenue, Dar es Salaam',
      phone: '+255 773 306 684',
      email: 'dar.operations@logisticschain.global',
      hours: 'Mon – Fri: 08:00 – 18:00 EAT (24/7 Vessel Dispatch)',
      lat: -6.8163,
      lng: 39.2888,
    },
    {
      id: 'rotterdam',
      city: 'Rotterdam, Netherlands',
      country: 'Netherlands',
      type: 'European Maritime Headquarters',
      address: 'Willemswerf 45, Boompjes 40, 3011 XB Rotterdam',
      phone: '+31 10 892 4100',
      email: 'rotterdam@logisticschain.global',
      hours: 'Mon – Fri: 08:30 – 17:30 CET (24/7 Port Berth Desk)',
      lat: 51.9174,
      lng: 4.4899,
    },
    {
      id: 'singapore',
      city: 'Singapore',
      country: 'Singapore',
      type: 'Asia-Pacific Transshipment Hub',
      address: '78 Shenton Way, #18-01, Singapore 079120',
      phone: '+65 6718 9200',
      email: 'singapore@logisticschain.global',
      hours: 'Mon – Fri: 09:00 – 18:00 SGT (24/7 Air Cargo Control)',
      lat: 1.2758,
      lng: 103.8475,
    },
    {
      id: 'chicago',
      city: 'Chicago, IL, USA',
      country: 'USA',
      type: 'North American Intermodal & Railhead',
      address: '222 S Riverside Plaza, Suite 1900, Chicago, IL 60606',
      phone: '+1 (800) 542-4460',
      email: 'chicago@logisticschain.global',
      hours: 'Mon – Fri: 08:00 – 17:00 CST (24/7 Rail & Drayage Desk)',
      lat: 41.8787,
      lng: -87.6394,
    },
    {
      id: 'dubai',
      city: 'Dubai, UAE',
      country: 'UAE',
      type: 'Middle East & Air Cargo Cross-Trade Hub',
      address: 'Dubai South Aviation & Logistics City, Building B3, Suite 402, Dubai',
      phone: '+971 4 887 9120',
      email: 'dubai@logisticschain.global',
      hours: 'Mon – Fri: 08:30 – 17:30 GST (24/7 Charter Operations)',
      lat: 24.8967,
      lng: 55.1614,
    },
  ];

  const [selectedOffice, setSelectedOffice] = useState<OfficeLocation>(offices[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedId);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleResetForm = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setTrackingRef('');
    setMessage('');
    setSubmitted(false);
  };

  const faqs = [
    {
      q: 'How fast will a dispatch specialist respond to my inquiry?',
      a: 'Routine commercial and booking inquiries are acknowledged and quoted within 30 minutes during standard regional operating hours. Emergency vessel rollover or customs inspection holds routed through the 24/7 emergency hotline receive immediate intervention within 5 to 15 minutes.',
    },
    {
      q: 'How do I request emergency diversion or change of destination (COD) for cargo in transit?',
      a: 'For live shipments already sailing or airborne, contact our 24/7 Maritime & Air Dispatch Desk immediately via phone (+255 773 306 684) or submit a ticket marked "Urgent Cargo In-Transit" with your Bill of Lading or tracking reference. Our vessel coordinators liaise directly with port authorities and shipping alliances to reroute cargo before scheduled transshipment.',
    },
    {
      q: 'Can I submit customs documentation and commercial invoices directly?',
      a: 'Yes. Our licensed customs brokerage operates direct electronic data interchange (EDI) connections. You can upload digital packing lists, certificates of origin, and invoices through our customer portal, or email customs@logisticschain.global for pre-arrival clearance processing.',
    },
    {
      q: 'What cargo liability and insurance protections are included?',
      a: 'All bookings adhere to standard international carriage treaties (Hague-Visby, Montreal Convention). Additionally, Logistics Chain offers comprehensive all-risk marine cargo underwriting through leading Lloyd’s syndicates, covering up to $50M per consignment against loss, water damage, and general average claims.',
    },
  ];

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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#081829] border border-[#00e5c9]/40 text-xs font-semibold text-[#00e5c9]">
              <Globe2 className="w-3.5 h-3.5" />
              <span>24/7 Global Dispatch & Central Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.1]">
              Connect with Our <span className="text-[#00e5c9]">Logistics</span> Desks
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Direct access to licensed customs brokers, ocean liner coordinators, and emergency
              charter dispatchers. Our global operational control towers operate 24 hours a day,
              365 days a year.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="tel:+255773306684"
                className="px-5 py-2.5 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <Phone className="w-4 h-4 stroke-[2.5]" />
                <span>Call +255 773 306 684</span>
              </a>

              <a
                href="https://wa.me/255773306684"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#0a182b] hover:bg-[#0f243f] text-emerald-400 font-semibold text-xs sm:text-sm rounded-lg border border-slate-700/80 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Operations Desk</span>
              </a>
            </div>
          </div>
        </section>

        {/* Global Key Contact Cards Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#051020]/95 border border-slate-800 backdrop-blur-md shadow-xl space-y-1">
              <div className="flex items-center gap-2 text-[#00e5c9] mb-2">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Emergency Hotline</span>
              </div>
              <a
                href="tel:+255773306684"
                className="text-base font-bold text-white hover:text-[#00e5c9] block font-mono"
              >
                +255 773 306 684
              </a>
              <span className="text-[11px] text-slate-400 block">24/7/365 Non-Stop Dispatch</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#051020]/95 border border-slate-800 backdrop-blur-md shadow-xl space-y-1">
              <div className="flex items-center gap-2 text-[#00e5c9] mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Cargo Operations</span>
              </div>
              <a
                href="mailto:operations@logisticschain.global"
                className="text-sm font-bold text-white hover:text-[#00e5c9] block truncate"
              >
                operations@logisticschain.global
              </a>
              <span className="text-[11px] text-slate-400 block">30-Min SLA Response</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#051020]/95 border border-slate-800 backdrop-blur-md shadow-xl space-y-1">
              <div className="flex items-center gap-2 text-[#00e5c9] mb-2">
                <FileCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Customs & Brokerage</span>
              </div>
              <a
                href="mailto:customs@logisticschain.global"
                className="text-sm font-bold text-white hover:text-[#00e5c9] block truncate"
              >
                customs@logisticschain.global
              </a>
              <span className="text-[11px] text-slate-400 block">Tariff & EDI Manifest Filings</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#051020]/95 border border-slate-800 backdrop-blur-md shadow-xl space-y-1">
              <div className="flex items-center gap-2 text-[#00e5c9] mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Operational Hours</span>
              </div>
              <span className="text-sm font-bold text-white block">Central Tower: 24/7</span>
              <span className="text-[11px] text-slate-400 block">Regional Desks: 08:00 – 18:00</span>
            </div>
          </div>
        </section>

        {/* Contact Form & 24/7 Desk Overview */}
        <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 bg-[#051020] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
              {submitted ? (
                <div className="text-center py-10 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[#00e5c9]/15 border border-[#00e5c9] text-[#00e5c9] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-[#00e5c9] uppercase tracking-wider">
                      Reference Ticket #{ticketId}
                    </span>
                    <h3 className="text-2xl font-bold text-white">Inquiry Successfully Routed</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-white">{name}</strong>. Your dispatch
                      ticket has been assigned to our <strong className="text-[#00e5c9]">{department}</strong> desk.
                      A logistics specialist will follow up shortly at <strong className="text-white">{email}</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#081426] border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="text-white font-medium">{department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Urgency Level:</span>
                      <span className="text-emerald-400 font-medium">{urgency}</span>
                    </div>
                    {trackingRef && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cargo Reference:</span>
                        <span className="text-white font-mono">{trackingRef}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={handleResetForm}
                      className="px-6 py-2.5 bg-[#00e5c9] text-[#070d18] font-bold text-xs rounded-xl hover:bg-[#15f7dc] transition-colors"
                    >
                      Submit Another Ticket
                    </button>
                    <a
                      href={`https://wa.me/255773306684?text=Hello%20Logistics%20Chain%20Desk,%20inquiring%20about%20ticket%20${ticketId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-[#0a182b] text-emerald-400 hover:text-emerald-300 border border-slate-700/80 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Follow Up on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-extrabold text-white tracking-tight">
                        Submit a Dispatch Request
                      </h3>
                      <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                        Live Desk Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Fill out the form below to connect directly with specialized ocean, air, or
                      customs coordinators.
                    </p>
                  </div>

                  {/* Department & Urgency Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Routing Department *
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9] transition-colors"
                      >
                        <option>Ocean Freight Booking (FCL / LCL)</option>
                        <option>Air Cargo & Emergency Charters</option>
                        <option>Customs Clearance & HS-Code Verification</option>
                        <option>Warehousing, 3PL & Distribution</option>
                        <option>Cold-Chain & Pharmaceutical Transport</option>
                        <option>Trade Finance, Escrow & Invoicing</option>
                        <option>General Corporate & Partnership</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Urgency Level *
                      </label>
                      <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e5c9] transition-colors"
                      >
                        <option>Standard Inquiry (Within 2 Hours)</option>
                        <option>Urgent Cargo In-Transit (15-30 Mins)</option>
                        <option>Emergency Port Demurrage Hold (Immediate)</option>
                      </select>
                    </div>
                  </div>

                  {/* Name and Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. David Jansen"
                        className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c9] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Apex Industrial Global"
                        className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c9] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="david@company.com"
                        className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c9] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Phone / WhatsApp (with country code) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+255 773 306 684 or +31 ..."
                        className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c9] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Optional Tracking Ref */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Tracking / Bill of Lading Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={trackingRef}
                      onChange={(e) => setTrackingRef(e.target.value)}
                      placeholder="e.g. SWX-12245678 or MSCU9821445"
                      className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c9] transition-colors"
                    />
                  </div>

                  {/* Message / Details */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Shipment Details / Operational Request *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please specify origin port/terminal, destination, commodity type, volume/weight, and preferred timeline..."
                      className="w-full bg-[#081426] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c9] transition-colors"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-[#070d18] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[2.2]" />
                        <span>Dispatch Ticket to Operations Desk</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Protected under international freight confidentiality standards and FIATA guidelines.
                  </p>
                </form>
              )}
            </div>

            {/* Right Information & Protocols Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Emergency Cargo Support Box */}
              <div className="bg-[#051020] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                      Priority Line
                    </span>
                    <h4 className="text-base font-bold text-white">Emergency Cargo Escalation</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Experiencing vessel rollovers, port demurrage penalties, or customs detention?
                  Call our emergency command tower directly for real-time intervention.
                </p>

                <div className="p-4 rounded-xl bg-[#081426] border border-slate-800/80 space-y-3">
                  <a
                    href="tel:+255773306684"
                    className="flex items-center gap-3 text-sm font-bold text-[#00e5c9] hover:underline"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="font-mono">+255 773 306 684</span>
                  </a>
                  <a
                    href="https://wa.me/255773306684"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>WhatsApp Live Control Tower</span>
                  </a>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Clock className="w-4 h-4 shrink-0 text-[#00e5c9]" />
                    <span>Continuous Coverage · 365 Days a Year</span>
                  </div>
                </div>
              </div>

              {/* Certified Standards Box */}
              <div className="bg-[#051020] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00e5c9]" />
                  <span>Licensed Carrier Standards</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Logistics Chain operates under standard FIATA, BIMCO, and IATA carriage rules. All
                  cargo movements are backed by comprehensive marine cargo liability insurance and
                  authorized economic operator (AEO) status.
                </p>
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5c9]" />
                    <span>ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5c9]" />
                    <span>IATA Accredited</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5c9]" />
                    <span>FIATA Member</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5c9]" />
                    <span>AEO-F Certified</span>
                  </div>
                </div>
              </div>

              {/* Quick Quote CTA Box */}
              <div className="bg-[#081829] border border-[#00e5c9]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <h4 className="text-sm font-bold text-white">Need a Deterministic Freight Rate?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculate all-inclusive FCL/LCL ocean, air charter, or overland trucking rates in
                  under 60 seconds with our instant pricing engine.
                </p>
                <button
                  onClick={() => setIsQuoteOpen(true)}
                  className="w-full py-2.5 px-4 bg-[#00e5c9] hover:bg-[#15f7dc] text-[#070d18] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open Freight Rate Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Google Maps Section */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00e5c9]">
              Google Maps Platform Integration
            </span>
            <h2 className="text-3xl font-extrabold text-white">Global Command Hubs Map</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Interactive geographic tracking of our regional operations centers, port gates, and
              air transshipment hubs.
            </p>
          </div>

          <GoogleMapsSection
            offices={offices}
            selectedOffice={selectedOffice}
            onSelectOffice={(office) => setSelectedOffice(office)}
          />
        </section>

        {/* Detailed Regional Offices Directory */}
        <section className="py-16 bg-[#040a16] border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00e5c9]">
                Worldwide Stations
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Regional Commercial & Port Desks
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Direct physical representation across key continental logistics junctions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offices.map((office) => {
                const isSelected = office.id === selectedOffice.id;
                return (
                  <div
                    key={office.id}
                    onClick={() => setSelectedOffice(office)}
                    className={`p-6 rounded-2xl bg-[#06101f] border transition-all cursor-pointer space-y-3.5 ${
                      isSelected
                        ? 'border-[#00e5c9] shadow-lg shadow-teal-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#00e5c9] font-bold block">
                        {office.type}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-[#00e5c9]/15 text-[#00e5c9] px-2 py-0.5 rounded-full font-semibold">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white">{office.city}</h3>

                    <div className="space-y-2 text-xs text-slate-300">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{office.address}</span>
                      </p>
                      <p className="flex items-center gap-2 pt-1">
                        <Phone className="w-4 h-4 text-[#00e5c9] shrink-0" />
                        <a
                          href={`tel:${office.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#00e5c9] font-mono text-[11.5px]"
                        >
                          {office.phone}
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#00e5c9] shrink-0" />
                        <a
                          href={`mailto:${office.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#00e5c9] text-[11.5px] truncate"
                        >
                          {office.email}
                        </a>
                      </p>
                      <p className="flex items-center gap-2 text-slate-400 pt-1 border-t border-slate-800/80">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px]">{office.hours}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Frequently Asked Support Questions */}
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00e5c9]">
              Support & Protocol FAQs
            </span>
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#051020] border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-[#00e5c9] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#00e5c9]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Global Conversion Banner */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#00b49e] via-[#00e5c9] to-[#15f7dc] p-8 sm:p-12 lg:p-16 text-[#050c18] overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#050c18_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#050c18]/15 border border-[#050c18]/25 text-[#050c18]">
                24/7 Global Freight Access
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#040a16] leading-tight">
                Ready to Ship or Need Urgent Cargo Assistance?
              </h2>

              <p className="text-sm sm:text-base font-medium text-[#07162b] leading-relaxed">
                Connect directly with our global dispatch towers for guaranteed liner space,
                immediate customs clearances, or turn-by-turn cargo tracking updates.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsQuoteOpen(true)}
                  className="px-6 py-3.5 bg-[#050c18] hover:bg-[#091526] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl flex items-center gap-2"
                >
                  <span>Request All-Inclusive Rate</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="px-6 py-3.5 bg-white/30 hover:bg-white/40 text-[#050c18] font-bold text-xs sm:text-sm rounded-xl transition-colors border border-[#050c18]/20 flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-[#050c18]" />
                  <span>Track Active Shipment</span>
                </button>
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
