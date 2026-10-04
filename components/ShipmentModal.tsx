'use client';

import React, { useState } from 'react';
import { X, Package, Check, RefreshCw, Calendar, MapPin, AlertCircle, Building, UserCheck } from 'lucide-react';
import { ShipmentRecord, ShipmentStatus, ClientRecord } from '@/lib/auth-context';
import { ShipmentFormData, generateReferenceNumber } from '@/lib/shipment-service';

interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShipmentFormData) => Promise<void>;
  initialData?: ShipmentRecord | null;
  defaultCustomer?: string;
  defaultHub?: string;
  clients?: ClientRecord[];
  defaultClientId?: string;
}

interface InnerFormProps {
  onClose: () => void;
  onSave: (data: ShipmentFormData) => Promise<void>;
  initialData?: ShipmentRecord | null;
  defaultCustomer?: string;
  defaultHub?: string;
  clients?: ClientRecord[];
  defaultClientId?: string;
}

export default function ShipmentModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultCustomer,
  defaultHub,
  clients,
  defaultClientId,
}: ShipmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <ShipmentModalFormContent
          key={initialData ? initialData.id : `new-shipment-${defaultClientId || 'default'}`}
          onClose={onClose}
          onSave={onSave}
          initialData={initialData}
          defaultCustomer={defaultCustomer}
          defaultHub={defaultHub}
          clients={clients}
          defaultClientId={defaultClientId}
        />
      </div>
    </div>
  );
}

function ShipmentModalFormContent({
  onClose,
  onSave,
  initialData,
  defaultCustomer = '',
  defaultHub = 'Dar es Salaam Central Gateway',
  clients = [],
  defaultClientId = '',
}: InnerFormProps) {
  const isEditing = Boolean(initialData);

  const [selectedClientId, setSelectedClientId] = useState<string>(() => initialData?.clientId || defaultClientId || '');

  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    if (initialData?.referenceNumber || initialData?.trackingNumber) {
      return initialData.referenceNumber || initialData.trackingNumber;
    }
    return generateReferenceNumber();
  });

  const [customer, setCustomer] = useState<string>(() => {
    if (initialData?.customer) return initialData.customer;
    if (defaultClientId && clients.length > 0) {
      const match = clients.find((c) => c.id === defaultClientId);
      if (match) return match.company;
    }
    return defaultCustomer || '';
  });
  const [origin, setOrigin] = useState<string>(() => initialData?.origin || defaultHub || 'Dar es Salaam Central Gateway');
  const [destination, setDestination] = useState<string>(() => initialData?.destination || 'Zanzibar Port (Malindi Wharf)');
  const [shipmentDate, setShipmentDate] = useState<string>(() => initialData?.shipmentDate || new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(() => {
    if (initialData?.expectedDeliveryDate) return initialData.expectedDeliveryDate;
    return new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<ShipmentStatus>(() => initialData?.status || 'Pending');
  const [cargoInfo, setCargoInfo] = useState<string>(() => initialData?.cargoInfo || '');
  const [quantity, setQuantity] = useState<string>(() => String(initialData?.quantity || 1));
  const [weight, setWeight] = useState<string>(() => initialData?.weight || '10.0 kg');
  const [notes, setNotes] = useState<string>(() => initialData?.notes || '');
  const [mode, setMode] = useState<'Ocean' | 'Air' | 'Road'>(() => initialData?.mode || 'Air');
  const [carrier, setCarrier] = useState<string>(() => initialData?.carrier || (initialData?.mode === 'Air' ? 'Auric Air Express' : 'Azam Marine Fast Cargo'));
  const [recipientPhone, setRecipientPhone] = useState<string>(() => initialData?.recipientPhone || '+255 773 000 000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNewRef = () => {
    setReferenceNumber(generateReferenceNumber());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) {
      setError('Customer/client name is required.');
      return;
    }
    if (!origin.trim() || !destination.trim()) {
      setError('Origin and destination are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        referenceNumber: referenceNumber.trim() || generateReferenceNumber(),
        customer: customer.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        shipmentDate,
        expectedDeliveryDate,
        status,
        cargoInfo: cargoInfo.trim() || 'General Freight',
        quantity: parseInt(quantity, 10) || 1,
        weight: weight.trim() || '1.0 kg',
        notes: notes.trim(),
        mode,
        carrier: carrier.trim() || (mode === 'Air' ? 'Auric Air Express' : mode === 'Ocean' ? 'Azam Marine Fast Cargo' : 'Logistics Chain Trucking'),
        recipientPhone: recipientPhone.trim(),
        clientId: selectedClientId || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save shipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
      {/* Modal Header */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-[#00e5c9] flex items-center justify-center border border-blue-500/30">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? `Edit Shipment (${initialData?.referenceNumber})` : 'Create New Shipment'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isEditing
                ? 'Update manifest parameters, dates, cargo, and workflow status'
                : 'Register a new consignment to your private account'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Reference, Customer & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Shipment Reference # *
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="REF-2026-000000"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:outline-none pr-8"
              />
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleGenerateNewRef}
                  title="Generate new reference number"
                  className="absolute right-2 text-slate-400 hover:text-blue-600 p-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {clients && clients.length > 0 && (
            <div className="sm:col-span-3 p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Associate with Client (Address Book)</span>
                </label>
                <span className="text-[10px] text-blue-600 font-semibold">Auto-fills consignee &amp; phone</span>
              </div>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedClientId(id);
                  if (id) {
                    const match = clients.find((c) => c.id === id);
                    if (match) {
                      setCustomer(match.company);
                      if (match.phone) setRecipientPhone(match.phone);
                      if (match.address) setDestination(match.address);
                    }
                  }
                }}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none font-medium"
              >
                <option value="">-- No linked client / Custom Consignor --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.contactPerson}) · {c.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Customer / Consignee Name *
            </label>
            <input
              type="text"
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Zanzibar Maritime Ltd"
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Shipment Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-semibold"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Section 2: Routing & Schedule */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Routing &amp; Schedule
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-600 block mb-1">Origin *</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Shanghai Deepwater Port"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Destination *</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Dar es Salaam Central Port"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-medium text-slate-600 block mb-1">Shipment Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={shipmentDate}
                  onChange={(e) => setShipmentDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Expected Delivery Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Cargo Information, Quantity & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">
              Cargo Information *
            </label>
            <input
              type="text"
              required
              value={cargoInfo}
              onChange={(e) => setCargoInfo(e.target.value)}
              placeholder="e.g. Commercial Electronics, Server Racks & Cabling"
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Quantity (Pieces / Pallets)</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Gross Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 24.5 kg or 1.2 Tons"
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Freight Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'Ocean' | 'Air' | 'Road')}
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              <option value="Air">Air Cargo</option>
              <option value="Ocean">Ocean Freight</option>
              <option value="Road">Overland Trucking</option>
            </select>
          </div>
        </div>

        {/* Section 4: Carrier & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Assigned Carrier</label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. Auric Air Express / Maersk"
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Recipient Phone / WhatsApp</label>
            <input
              type="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="+255 773 000 000"
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 5: Notes */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Handling Notes &amp; Customs Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Handle with care; fragile instruments; pre-cleared with TIRA customs clearance code #TIR-9921."
            className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-slate-800 focus:outline-none resize-none"
          />
        </div>

        {/* Footer buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Create Shipment'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
