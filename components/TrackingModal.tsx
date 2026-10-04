'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Ship,
  Plane,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Thermometer,
  Shield,
  Download,
  Bell,
  ArrowRight,
  Anchor,
  Compass,
} from 'lucide-react';
import { SAMPLE_SHIPMENTS, ShipmentData } from '@/lib/logistics-data';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackingCode?: string;
}

function resolveShipmentData(code: string): ShipmentData {
  const cleanCode = (code || 'SWX-12245678').trim().toUpperCase();
  if (SAMPLE_SHIPMENTS[cleanCode]) {
    return SAMPLE_SHIPMENTS[cleanCode];
  }
  return {
    id: cleanCode || 'SWX-12245678',
    type: cleanCode.startsWith('AWB') ? 'Air Cargo' : cleanCode.startsWith('TRK') ? 'Road Transport' : 'Ocean Freight',
    status: 'In Transit',
    origin: {
      city: 'Singapore',
      port: 'Port of Singapore Terminal 2',
      country: 'Singapore',
      date: 'Sept 22, 2026',
    },
    destination: {
      city: 'Dubai',
      port: 'Jebel Ali Gateway (AEJEA)',
      country: 'United Arab Emirates',
      eta: 'Oct 02, 2026',
    },
    carrier: 'Swahivo Global Marine & Air Alliance',
    vesselOrFlight: 'MV Kilimanjaro VII',
    containerId: 'SWXU-8849102',
    weight: '19,450 kg',
    temperature: 'Ambient (22.1°C)',
    humidity: '54% RH',
    shock: '0.02 G',
    progressPercent: 55,
    timeline: [
      {
        stage: 'Electronic Manifest Received & Booking Confirmed',
        location: 'Singapore Central Dispatch',
        timestamp: 'Sept 21, 2026 · 10:00 SGT',
        completed: true,
      },
      {
        stage: 'Container Gated In & Customs Clearance Approved',
        location: 'Singapore Port Terminal',
        timestamp: 'Sept 22, 2026 · 16:30 SGT',
        completed: true,
      },
      {
        stage: 'In Transit via Indian Ocean Corridor',
        location: 'Indian Ocean · Lat 6.12°N, Lon 78.45°E',
        timestamp: 'En Route · Normal Cruising Speed',
        completed: false,
        current: true,
        note: 'Monitored continuously by 24/7 Swahivo Global Control Tower.',
      },
      {
        stage: 'Arrival & Berth Allocation',
        location: 'Jebel Ali Gateway Terminal',
        timestamp: 'Oct 02, 2026 · 06:00 GST (Expected)',
        completed: false,
      },
    ],
  };
}

export default function TrackingModal({
  isOpen,
  onClose,
  initialTrackingCode = 'SWX-12245678',
}: TrackingModalProps) {
  const [searchInput, setSearchInput] = useState(initialTrackingCode || 'SWX-12245678');
  const [activeCode, setActiveCode] = useState(initialTrackingCode || 'SWX-12245678');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Directly derive current shipment from state
  const currentShipment = resolveShipmentData(activeCode || initialTrackingCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveCode(searchInput.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0a1222] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070d18]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Live Shipment Telemetry & Tracking
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end IoT sensor status and global port milestone audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close Tracking Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Quick Demo Chips */}
        <div className="p-6 border-b border-slate-800/80 bg-[#0d1729]/60">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Tracking #, Bill of Lading (B/L), or Container ID..."
                className="w-full bg-[#070d18] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5c9] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] text-sm font-bold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 shadow-md shadow-teal-500/15 cursor-pointer"
            >
              <span>Track Shipment</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Sample live tracks:</span>
            {Object.keys(SAMPLE_SHIPMENTS).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSearchInput(code);
                  setActiveCode(code);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
                  searchInput.toUpperCase() === code
                    ? 'bg-[#00e5c9]/15 border-[#00e5c9] text-[#00e5c9]'
                    : 'bg-[#0a1222] border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        {currentShipment && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Shipment Status Overview Card */}
            <div className="bg-[#070d18] border border-slate-800 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-bold font-mono tracking-tight text-white">
                      {currentShipment.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c9] animate-pulse"></span>
                      {currentShipment.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentShipment.carrier} · {currentShipment.vesselOrFlight}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Estimated Arrival (ETA)
                  </span>
                  <span className="text-base font-semibold text-[#00e5c9] font-mono">
                    {currentShipment.destination.eta}
                  </span>
                </div>
              </div>

              {/* Progress bar & Phases Remained Indicator */}
              <div className="mt-5 space-y-2">
                {(() => {
                  const remainingMilestones = currentShipment.timeline.filter(t => !t.completed);
                  const remainingCount = remainingMilestones.length;
                  return (
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <span>Departure: {currentShipment.origin.city}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">
                          {currentShipment.progressPercent}% Transit Completed
                        </span>
                        {remainingCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {remainingCount} {remainingCount === 1 ? 'phase' : 'phases'} remained
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            All phases completed
                          </span>
                        )}
                      </div>
                      <span>Arrival: {currentShipment.destination.city}</span>
                    </div>
                  );
                })()}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0d9488] via-[#00e5c9] to-[#38bdf8] rounded-full transition-all duration-700"
                    style={{ width: `${currentShipment.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Origin to Destination Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-800/60">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#00e5c9]" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">Origin Port</span>
                    <h4 className="text-sm font-semibold text-white">
                      {currentShipment.origin.city}, {currentShipment.origin.country}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {currentShipment.origin.port}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Departed: {currentShipment.origin.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#00e5c9]/10 text-[#00e5c9] mt-0.5">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Destination Gateway
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {currentShipment.destination.city}, {currentShipment.destination.country}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {currentShipment.destination.port}
                    </p>
                    <span className="text-[11px] text-[#00e5c9] block mt-1 font-medium">
                      Target ETA: {currentShipment.destination.eta}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* IoT Telemetry Data Grid */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-[#00e5c9]" />
                Live Container Telemetry & Specs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#070d18] border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Container Unit</span>
                  <span className="text-xs font-semibold text-white font-mono mt-1 block truncate">
                    {currentShipment.containerId}
                  </span>
                </div>
                <div className="bg-[#070d18] border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Cargo Gross Weight</span>
                  <span className="text-xs font-semibold text-white font-mono mt-1 block">
                    {currentShipment.weight}
                  </span>
                </div>
                <div className="bg-[#070d18] border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Internal Temp</span>
                  <span className="text-xs font-semibold text-[#00e5c9] font-mono mt-1 block">
                    {currentShipment.temperature || 'Ambient'}
                  </span>
                </div>
                <div className="bg-[#070d18] border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Vibration & Shock</span>
                  <span className="text-xs font-semibold text-emerald-400 font-mono mt-1 block">
                    {currentShipment.shock || '0.01 G Nominal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Milestone Timeline */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#00e5c9]" />
                Milestone Audit Trail
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {currentShipment.timeline.map((step, idx) => (
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
                          className={`text-sm font-semibold ${
                            step.current ? 'text-[#00e5c9]' : step.completed ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {step.stage}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{step.location}</p>
                      {step.note && (
                        <p className="text-xs text-slate-300 mt-1 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDownloadSuccess(true);
                    setTimeout(() => setDownloadSuccess(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>{downloadSuccess ? 'Waybill Generated!' : 'Download Waybill (PDF)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAlertSuccess(true);
                    setTimeout(() => setAlertSuccess(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>{alertSuccess ? 'Alerts Activated!' : 'Subscribe to Alerts'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-[#00e5c9]" />
                <span>Encrypted EDI & Cargo Blockchain Ledger</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
