'use client';

import React, { useState } from 'react';
import {
  Package,
  Truck,
  Ship,
  Plane,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  X,
  Check,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Navigation,
  Sparkles,
  ArrowRight,
  Radio,
  Building,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { ShipmentRecord, ShipmentStatus, TrackingEvent } from '@/lib/auth-context';
import {
  calculateDeliveryProgress,
  formatTrackingTimestamp,
  updateShipmentStatus,
  recordTrackingEvent,
} from '@/lib/shipment-service';
import UpgradeModal from './UpgradeModal';
import { checkPlanLimit, getUserSubscription } from '@/lib/subscription-service';
import { SubscriptionInfo, DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-plans';

interface ShipmentTrackingTimelineProps {
  shipment: ShipmentRecord;
  userId?: string;
  isAuthorized?: boolean;
  onShipmentUpdated?: (updated: ShipmentRecord) => void;
  showAdminControls?: boolean;
}

export default function ShipmentTrackingTimeline({
  shipment,
  userId,
  isAuthorized = true,
  onShipmentUpdated,
  showAdminControls = true,
}: ShipmentTrackingTimelineProps) {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventNote, setEventNote] = useState('');
  const [eventStatusChange, setEventStatusChange] = useState<ShipmentStatus | ''>('');
  const [eventTime, setEventTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_FREE_SUBSCRIPTION);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  React.useEffect(() => {
    if (!userId) return;
    getUserSubscription(userId).then((sub) => setSubscription(sub));
  }, [userId]);

  const progress = calculateDeliveryProgress(shipment.status);

  // Status badge styling
  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Quick status update handler
  const handleQuickStatusChange = async (newStatus: ShipmentStatus) => {
    if (!userId || !isAuthorized) {
      showToast('Authentication required to modify tracking status.');
      return;
    }
    if (newStatus === shipment.status) return;

    setIsSubmitting(true);
    try {
      const updatedEvents = await updateShipmentStatus(
        userId,
        shipment.id,
        newStatus,
        shipment.events || [],
        shipment.currentLocation || shipment.origin,
        `Status transitioned by operator to ${newStatus}.`,
        'Authorized Operations Dispatch'
      );

      const updatedShipment: ShipmentRecord = {
        ...shipment,
        status: newStatus,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      onShipmentUpdated?.(updatedShipment);
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update shipment status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record tracking event handler
  const handleRecordEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !isAuthorized) {
      showToast('Authentication required to record tracking events.');
      return;
    }
    if (!eventTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const newStatus = eventStatusChange || undefined;
      const targetLocation = eventLocation.trim() || shipment.currentLocation || shipment.origin;

      const updatedEvents = await recordTrackingEvent(
        userId,
        shipment.id,
        {
          title: eventTitle.trim(),
          location: targetLocation,
          time: eventTime.trim() || formatTrackingTimestamp(),
          note: eventNote.trim() || undefined,
          status: newStatus,
          completed: true,
          author: 'Authorized Logistics Specialist',
        },
        shipment.events || []
      );

      const updatedShipment: ShipmentRecord = {
        ...shipment,
        status: newStatus || shipment.status,
        currentLocation: targetLocation,
        events: updatedEvents,
        updatedAt: new Date().toISOString(),
      };

      onShipmentUpdated?.(updatedShipment);
      setIsRecordModalOpen(false);
      setEventTitle('');
      setEventLocation('');
      setEventNote('');
      setEventStatusChange('');
      setEventTime('');
      showToast('Tracking event recorded successfully!');
    } catch (err) {
      console.error('Error logging event:', err);
      showToast('Failed to log tracking event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort events chronologically (latest first or standard)
  const sortedEvents = [...(shipment.events || [])].reverse();

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. DELIVERY PROGRESS & STATUS CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        {/* Header Strip: Status, Expected Delivery, Last Location */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Current Shipment Status
            </span>
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(
                  shipment.status
                )}`}
              >
                {shipment.status}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                &bull; {progress.statusSummary}
              </span>
            </div>
          </div>

          {/* Expected Delivery Date Callout */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block">
                Expected Delivery Date
              </span>
              <p className="text-xs font-extrabold text-slate-900">
                {shipment.expectedDeliveryDate || 'Scheduled in Transit'}
              </p>
            </div>
          </div>
        </div>

        {/* Associated Client & Order Cross-Reference Banner */}
        {(shipment.clientId || shipment.customer || shipment.orderId || shipment.orderNumber) && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-teal-50/50 border border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Client Relationship */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                <Building className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Associated Client</span>
                {shipment.clientId ? (
                  <Link
                    href={`/dashboard/clients/${shipment.clientId}`}
                    className="font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>{shipment.customer}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="font-bold text-slate-800">{shipment.customer}</span>
                )}
              </div>
            </div>

            {/* Order Relationship */}
            {(shipment.orderId || shipment.orderNumber) && (
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-blue-200/60 pt-2 sm:pt-0 sm:pl-4">
                <div className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Associated Order</span>
                  {shipment.orderId ? (
                    <Link
                      href={`/dashboard/orders/${shipment.orderId}`}
                      className="font-bold font-mono text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>{shipment.orderNumber || shipment.orderId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="font-bold font-mono text-slate-800">{shipment.orderNumber}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visual Workflow Progress Bar & Phases Remained Banner */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span className="text-slate-800 flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Transit Progress ({progress.percentage}%)</span>
            </span>

            {/* Remaining Phases Pill */}
            <div className="flex items-center gap-2">
              {progress.isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>All 4 Phases Completed</span>
                </span>
              ) : shipment.status === 'Cancelled' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <span>Shipment Cancelled</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    <strong>{progress.phasesRemainingCount}</strong> {progress.phasesRemainingCount === 1 ? 'phase' : 'phases'} remained
                  </span>
                  <span className="text-amber-600/80 font-normal hidden sm:inline">
                    ({progress.phasesRemainingLabels.join(' &bull; ')})
                  </span>
                </span>
              )}

              <span className="text-slate-500 font-normal text-[11px]">
                {progress.currentStageName === 'Delivered'
                  ? 'Delivery Completed'
                  : `Next: ${shipment.destination}`}
              </span>
            </div>
          </div>

          {/* Continuous progress track */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                shipment.status === 'Cancelled'
                  ? 'bg-rose-500'
                  : shipment.status === 'Delivered'
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-[#00e5c9]'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* 4 Multi-step Workflow Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {progress.stages.map((stage, idx) => {
              const isCompleted = stage.state === 'completed';
              const isCurrent = stage.state === 'current';
              const isCancelled = stage.state === 'cancelled';

              return (
                <div
                  key={stage.name}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900'
                      : isCancelled
                      ? 'bg-rose-50/50 border-rose-200 text-rose-800'
                      : 'bg-slate-50/60 border-slate-100 text-slate-400 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white animate-pulse'
                          : isCancelled
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {stage.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Telematics & Coordinates Strip */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500">Last Telematics Checkpoint:</span>
            <span className="font-bold text-slate-800">
              {shipment.currentLocation || shipment.origin}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Carrier: {shipment.carrier || `${shipment.mode} Freight`} &bull; {shipment.mode}
          </div>
        </div>
      </div>

      {/* 2. AUTHORIZED OPERATOR CONTROLS */}
      {showAdminControls && isAuthorized && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Authorized Status &amp; Tracking Controls</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Update operational shipment status and record chain-of-custody milestones.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const check = checkPlanLimit(subscription.tier, 'events');
                if (!check.allowed) {
                  setLimitErrorMessage(check.message || 'Custom milestone event logging requires a paid subscription.');
                  setUpgradeModalOpen(true);
                  return;
                }
                setEventTitle('');
                setEventLocation(shipment.currentLocation || shipment.origin);
                setEventNote('');
                setEventStatusChange('');
                setEventTime(formatTrackingTimestamp());
                setIsRecordModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Tracking Event</span>
            </button>
          </div>

          {/* Quick Status Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Quick Status Transition (Records to Timeline):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {(['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'] as ShipmentStatus[]).map(
                (st) => {
                  const isActive = shipment.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={isActive || isSubmitting}
                      onClick={() => handleQuickStatusChange(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white cursor-default shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/60'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 inline mr-1" />}
                      <span>{st}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. TRACKING TIMELINE (PREVIOUS STATUS CHANGES & MILESTONES) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Live Tracking Timeline</span>
            </h3>
            <p className="text-xs text-slate-500">
              Full chain-of-custody log, previous status changes, dates &amp; times, and checkpoint locations.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 font-mono">
            {sortedEvents.length} Recorded Milestones
          </span>
        </div>

        {/* Timeline List */}
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-7 py-2 text-xs">
          {sortedEvents.length === 0 ? (
            <div className="py-6 text-slate-400 italic">
              No tracking events have been logged for this waybill yet.
            </div>
          ) : (
            sortedEvents.map((ev, idx) => {
              const isLatest = idx === 0;
              const isStatusChange = ev.type === 'status_change' || ev.title.toLowerCase().includes('status');

              return (
                <div key={ev.id || idx} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div
                    className={`absolute -left-[35px] top-0 w-5 h-5 rounded-full ring-4 ring-white flex items-center justify-center transition-all ${
                      isLatest
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : ev.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {isLatest ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    ) : ev.completed ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>

                  {/* Event Content Box */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isLatest
                        ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {ev.title}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
                            Latest Update
                          </span>
                        )}
                        {ev.status && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              ev.status
                            )}`}
                          >
                            {ev.status}
                          </span>
                        )}
                      </div>

                      {/* Date & Time */}
                      <span className="font-mono text-slate-500 text-[11px] font-semibold shrink-0">
                        {ev.time}
                      </span>
                    </div>

                    {/* Location with Icon */}
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{ev.location}</span>
                    </div>

                    {/* Optional Note / Audit details */}
                    {ev.note && (
                      <p className="text-slate-600 text-xs mt-1.5 pl-5 border-l-2 border-slate-300/80 italic">
                        &ldquo;{ev.note}&rdquo;
                      </p>
                    )}

                    {/* Author Stamp */}
                    {ev.author && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Verified by: {ev.author}</span>
                        <span className="font-mono">Tamper-Proof Audit</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RECORD TRACKING EVENT MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Tracking Event</h3>
                  <p className="text-[11px] text-slate-500">
                    Log checkpoint for waybill {shipment.referenceNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordEventSubmit} className="space-y-4 text-xs">
              {/* Event Title */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Milestone Description / Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Customs Pre-Clearance Verified, Vessel Departed, Out for Final Delivery"
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none font-medium"
                />
              </div>

              {/* Location */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Checkpoint Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Dar es Salaam Central Port Terminal 2"
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Change Selection (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Update Shipment Status (Optional)
                  </label>
                  <select
                    value={eventStatusChange}
                    onChange={(e) => setEventStatusChange(e.target.value as ShipmentStatus)}
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-semibold"
                  >
                    <option value="">Keep as {shipment.status}</option>
                    <option value="Pending">Change to Pending</option>
                    <option value="Processing">Change to Processing</option>
                    <option value="In Transit">Change to In Transit</option>
                    <option value="Delivered">Change to Delivered</option>
                    <option value="Cancelled">Change to Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Date &amp; Time
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. Sep 27, 2026 · 10:15 AM"
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Operator Inspection Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  placeholder="e.g. Container seal #8991 verified intact. Ambient temperature logged at 21.2°C."
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-slate-800 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Log Tracking Event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Limit Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Event Logging Restricted"
        message={limitErrorMessage}
        currentTier={subscription.tier}
      />
    </div>
  );
}
