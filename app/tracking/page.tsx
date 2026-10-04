'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuoteModal from '@/components/QuoteModal';
import {
  Search,
  Compass,
  Ship,
  Plane,
  Truck,
  MapPin,
  Clock,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Anchor,
  Download,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_SHIPMENTS, ShipmentData } from '@/lib/logistics-data';

export default function TrackingPage() {
  const [searchInput, setSearchInput] = useState('LCX-12245678');
  const [activeCode, setActiveCode] = useState('LCX-12245678');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const getShipment = (code: string): ShipmentData => {
    const clean = code.trim().toUpperCase();
    if (SAMPLE_SHIPMENTS[clean]) return SAMPLE_SHIPMENTS[clean];

    return {
      id: clean || 'LCX-CUSTOM',
      type: clean.startsWith('AWB') ? 'Air Cargo' : clean.startsWith('TRK') ? 'Road Transport' : 'Ocean Freight',
      status: 'In Transit',
      origin: {
        city: 'Singapore',
        port: 'Port of Singapore Terminal (SGSIN)',
        country: 'Singapore',
        date: 'Sept 22, 2026',
      },
      destination: {
        city: 'Dubai',
        port: 'Jebel Ali Gateway (AEJEA)',
        country: 'United Arab Emirates',
        eta: 'Oct 02, 2026',
      },
      carrier: 'Logistics Chain Alliance Ocean Line',
      vesselOrFlight: 'MV Global Carrier IX',
      containerId: 'LCXU-9844210',
      weight: '21,400 kg',
      temperature: 'Ambient (21.4°C)',
      humidity: '52% RH',
      shock: '0.01 G Nominal',
      progressPercent: 62,
      timeline: [
        {
          stage: 'Electronic Waybill Accepted & Loaded',
          location: 'Singapore Central Terminal',
          timestamp: 'Sept 21, 2026 · 14:00 SGT',
          completed: true,
        },
        {
          stage: 'Vessel Departed Port of Singapore',
          location: 'Strait of Malacca Transit',
          timestamp: 'Sept 22, 2026 · 02:30 SGT',
          completed: true,
        },
        {
          stage: 'In Transit — Indian Ocean',
          location: 'Lat 7.24°N, Lon 76.12°E (Off Sri Lanka)',
          timestamp: 'Live Position · Speed 18.6 knots',
          completed: false,
          current: true,
          note: 'Telemetry normal; vessel en route without delay.',
        },
        {
          stage: 'Scheduled Berth & Customs Clearance',
          location: 'Jebel Ali Gateway Terminal',
          timestamp: 'Oct 02, 2026 · 06:00 GST (Expected)',
          completed: false,
        },
      ],
    };
  };

  const shipment = getShipment(activeCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveCode(searchInput.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d18] text-slate-100">
      <Header onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
              Global Visibility Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Shipment Telemetry & Tracking
            </h1>
            <p className="text-sm text-slate-300">
              Query real-time vessel AIS coordinates, aircraft flight progress, container internal
              temperatures, and verified customs milestones.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto bg-[#091322] border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Tracking #, B/L, or Container ID..."
                  className="w-full bg-[#060c16] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5c9]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-sm rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 shadow-md shadow-teal-500/15 cursor-pointer"
              >
                <span>Track Shipment</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Sample Active Tracks:</span>
              {Object.keys(SAMPLE_SHIPMENTS).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setSearchInput(code);
                    setActiveCode(code);
                  }}
                  className={`px-3 py-1 rounded-md font-mono transition-colors border ${
                    activeCode.toUpperCase() === code
                      ? 'bg-[#00e5c9]/15 border-[#00e5c9] text-[#00e5c9]'
                      : 'bg-[#070d18] border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Active Shipment Full Dashboard */}
          <div className="max-w-5xl mx-auto bg-[#091322] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold font-mono text-white">
                    {shipment.id}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00e5c9] animate-pulse"></span>
                    {shipment.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {shipment.carrier} · {shipment.vesselOrFlight}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs uppercase font-medium text-slate-400 block">
                  Guaranteed ETA
                </span>
                <span className="text-lg font-bold font-mono text-[#00e5c9]">
                  {shipment.destination.eta}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{shipment.origin.city}</span>
                <span className="text-[#00e5c9] font-bold font-mono">
                  {shipment.progressPercent}% Transit Completed
                </span>
                <span>{shipment.destination.city}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0d9488] via-[#00e5c9] to-[#38bdf8] rounded-full transition-all duration-700"
                  style={{ width: `${shipment.progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Ports Origin / Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#070d18] border border-slate-800 p-5 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-[#00e5c9] mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-400 font-semibold">Origin Hub</span>
                  <h3 className="text-base font-bold text-white">
                    {shipment.origin.city}, {shipment.origin.country}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{shipment.origin.port}</p>
                  <span className="text-xs text-slate-400 block mt-1">
                    Departed: {shipment.origin.date}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#00e5c9]/15 text-[#00e5c9] mt-0.5">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-400 font-semibold">
                    Destination Terminal
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {shipment.destination.city}, {shipment.destination.country}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {shipment.destination.port}
                  </p>
                  <span className="text-xs text-[#00e5c9] font-medium block mt-1">
                    Scheduled Arrival: {shipment.destination.eta}
                  </span>
                </div>
              </div>
            </div>

            {/* IoT Telemetry Data Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#070d18] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block">Container Unit</span>
                <span className="text-sm font-semibold text-white font-mono mt-1 block truncate">
                  {shipment.containerId}
                </span>
              </div>
              <div className="bg-[#070d18] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block">Gross Weight</span>
                <span className="text-sm font-semibold text-white font-mono mt-1 block">
                  {shipment.weight}
                </span>
              </div>
              <div className="bg-[#070d18] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block">Internal Temp</span>
                <span className="text-sm font-semibold text-[#00e5c9] font-mono mt-1 block">
                  {shipment.temperature || 'Ambient (20°C)'}
                </span>
              </div>
              <div className="bg-[#070d18] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block">Vibration / Shock</span>
                <span className="text-sm font-semibold text-emerald-400 font-mono mt-1 block">
                  {shipment.shock || '0.01 G Nominal'}
                </span>
              </div>
            </div>

            {/* Milestone Timeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Milestone Audit Trail
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {shipment.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-[#00e5c9] text-[#070d18]'
                          : step.current
                          ? 'bg-[#38bdf8] text-[#070d18] ring-4 ring-[#38bdf8]/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4
                          className={`text-sm font-bold ${
                            step.current
                              ? 'text-[#00e5c9]'
                              : step.completed
                              ? 'text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.stage}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{step.location}</p>
                      {step.note && (
                        <p className="text-xs text-slate-300 mt-1 bg-[#070d18] p-2.5 rounded-lg border border-slate-800">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Waybill and alerts */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDownloadSuccess(true);
                    setTimeout(() => setDownloadSuccess(false), 3000);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>{downloadSuccess ? 'Waybill Downloaded!' : 'Download e-Waybill (PDF)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAlertSuccess(true);
                    setTimeout(() => setAlertSuccess(false), 3000);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>{alertSuccess ? 'SMS Alerts Enabled!' : 'SMS / Email Alerts'}</span>
                </button>
              </div>

              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00e5c9]" />
                EDI 214 Carrier Event Standard
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer
        onOpenTrackingModal={() => {}}
        onOpenQuoteModal={() => setIsQuoteOpen(true)}
      />

      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
