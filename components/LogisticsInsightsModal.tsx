'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  X,
  ShieldCheck,
  Package,
  Layers,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { ShipmentRecord, PickupRecord } from '@/lib/auth-context';
import { OrderRecord } from '@/lib/auth-context';

export interface LogisticsInsightResponse {
  health: {
    score: number;
    status: 'Optimal' | 'Good' | 'Caution' | 'Critical';
    summary: string;
  };
  delaysAndRisks: Array<{
    title: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
    relatedEntity?: string;
  }>;
  operationalIssues: Array<{
    category: string;
    description: string;
    impact: string;
  }>;
  upcomingAttentionItems: Array<{
    deadlineOrEta?: string;
    subject: string;
    urgency: 'Normal' | 'Urgent' | 'Immediate';
    details: string;
  }>;
  recommendedActions: string[];
  analyzedAt: string;
  shipmentsCount: number;
  ordersCount: number;
  pickupsCount: number;
}

interface LogisticsInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole?: string;
  company?: string;
  shipments: ShipmentRecord[];
  orders: OrderRecord[];
  pickups: PickupRecord[];
  onSelectShipment?: (shipment: ShipmentRecord) => void;
  onNavigateTab?: (tab: string) => void;
}

export const LogisticsInsightsModal: React.FC<LogisticsInsightsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userRole = 'Customer',
  company = 'Your Organization',
  shipments,
  orders,
  pickups,
  onSelectShipment,
  onNavigateTab,
}) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<LogisticsInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        userId,
        userRole,
        company,
        shipments: shipments.map((s) => ({
          id: s.id,
          trackingNumber: s.trackingNumber,
          customer: s.customer,
          origin: s.origin,
          destination: s.destination,
          status: s.status,
          mode: s.mode,
          carrier: s.carrier,
          shipmentDate: s.shipmentDate,
          expectedDeliveryDate: s.expectedDeliveryDate,
          cargoInfo: s.cargoInfo,
          quantity: s.quantity,
          weight: s.weight,
          currentLocation: s.currentLocation,
          events: s.events,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          clientName: o.clientName,
          title: o.title,
          status: o.status,
          orderDate: o.orderDate,
          deliveryDeadline: o.deliveryDeadline,
          totalAmount: o.totalAmount,
          currency: o.currency,
          origin: o.origin,
          destination: o.destination,
        })),
        pickups: pickups.map((p) => ({
          id: p.id,
          pickupAddress: p.pickupAddress,
          pickupDate: p.pickupDate,
          timeSlot: p.timeSlot,
          packageCount: p.packageCount,
          cargoType: p.cargoType,
          status: p.status,
        })),
      };

      const res = await fetch('/api/logistics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis request failed (${res.status})`);
      }

      const data: LogisticsInsightResponse = await res.json();
      setInsight(data);
    } catch (err) {
      console.error('AI logistics insights failed:', err);
      setError(err instanceof Error ? err.message : 'Could not complete logistics analysis');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Caution':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Strip */}
        <div className="px-6 py-5 bg-[#070d18] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00e5c9] to-[#1d64ec] p-0.5 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-[#070d18] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00e5c9]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  AI Logistics Intelligence
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-[#00e5c9]/10 text-[#00e5c9] border border-[#00e5c9]/30">
                  On-Demand
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized operational analysis for <span className="text-slate-200 font-semibold">{company}</span> ({shipments.length} shipments, {orders.length} orders)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Initial State / Prompt to Run Analysis */}
          {!insight && !loading && (
            <div className="text-center py-10 px-4 max-w-xl mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 mx-auto flex items-center justify-center text-blue-600 shadow-inner">
                <Sparkles className="w-8 h-8 stroke-[1.8]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Run Operational Logistics Analysis
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Logistics Chain AI synthesizes your private telemetry, shipment statuses, delivery deadlines, upcoming pickups, and commercial order fulfillment to generate executive recommendations.
                </p>
              </div>

              {/* Data Scope Preview Cards */}
              <div className="grid grid-cols-3 gap-3 text-left pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>Shipments</span>
                  </div>
                  <span className="text-lg font-extrabold text-slate-900">{shipments.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Private records</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Orders</span>
                  </div>
                  <span className="text-lg font-extrabold text-slate-900">{orders.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Linked manifests</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pickups</span>
                  </div>
                  <span className="text-lg font-extrabold text-slate-900">{pickups.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Scheduled slots</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={runAnalysis}
                  className="px-6 py-3 bg-[#1d64ec] hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#00e5c9]" />
                  <span>Analyze Authorized Logistics Data</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Strictly isolated to your authenticated tenant data</span>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Analyzing Multimodal Logistics Data...
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesizing transit corridors, ETA variances, telemetry checkpoints, and order deadlines
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Logistics Analysis Failed</h4>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={runAnalysis}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* Results Display */}
          {insight && !loading && (
            <div className="space-y-6">
              {/* 1. Operation Health Executive Summary */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-extrabold text-lg text-slate-900 shadow-sm">
                      {insight.health.score}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                          Operation Health Index
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getHealthBadge(
                            insight.health.status
                          )}`}
                        >
                          {insight.health.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Assessed from {insight.shipmentsCount} shipments &bull; {insight.ordersCount} orders
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={runAnalysis}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Re-analyze</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {insight.health.summary}
                  </p>
                </div>
              </div>

              {/* 2-Column Grid: Delays & Risks + Potential Operational Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 2. Delays and Risks */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Important Delays or Risks</span>
                  </h4>

                  {insight.delaysAndRisks.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-800 text-xs">
                      No critical delays or route risks detected across active corridors.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {insight.delaysAndRisks.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-bold text-xs text-slate-900">{item.title}</h5>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(
                                item.severity
                              )}`}
                            >
                              {item.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                          {item.relatedEntity && (
                            <div className="text-[11px] font-mono text-slate-500 pt-1 flex items-center gap-1">
                              <span className="font-semibold text-slate-700">Entity:</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                {item.relatedEntity}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Potential Operational Issues */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Potential Operational Issues</span>
                  </h4>

                  {insight.operationalIssues.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-blue-800 text-xs">
                      All customs clearances and fulfillment lines operating within normal variance.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {insight.operationalIssues.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {item.description}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">Impact:</span> {item.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Upcoming Items Requiring Attention */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Upcoming Items Requiring Attention (Next 24-72h)</span>
                </h4>

                {insight.upcomingAttentionItems.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                    No urgent upcoming deadlines or pending carrier handoffs.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insight.upcomingAttentionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {item.subject}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.urgency === 'Immediate'
                                ? 'bg-rose-100 text-rose-800'
                                : item.urgency === 'Urgent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.details}
                        </p>
                        {item.deadlineOrEta && (
                          <span className="text-[11px] font-mono text-teal-700 block font-semibold">
                            Target: {item.deadlineOrEta}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Specific Recommended Actions */}
              <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-3">
                <h4 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <span>Recommended Operational Actions</span>
                </h4>

                <div className="space-y-2">
                  {insight.recommendedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white border border-blue-200/80 shadow-xs flex items-start gap-2.5 text-xs text-slate-800"
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="flex-1 font-medium leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Authorized AI Assistant &bull; On-demand Execution</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
