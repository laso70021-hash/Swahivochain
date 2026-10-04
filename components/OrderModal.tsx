'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Building,
  Calendar,
  DollarSign,
  Package,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  Truck,
} from 'lucide-react';
import { ClientRecord, OrderRecord, OrderStatus, OrderItem, ShipmentRecord } from '@/lib/auth-context';
import { OrderFormData, generateOrderNumber } from '@/lib/order-service';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OrderFormData) => Promise<void>;
  initialData?: OrderRecord | null;
  clients?: ClientRecord[];
  shipments?: ShipmentRecord[];
  defaultClientId?: string;
}

export default function OrderModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  clients = [],
  shipments = [],
  defaultClientId = '',
}: OrderModalProps) {
  if (!isOpen) return null;

  return (
    <OrderModalContent
      key={initialData ? initialData.id : `new-order-${defaultClientId || 'default'}`}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
      clients={clients}
      shipments={shipments}
      defaultClientId={defaultClientId}
    />
  );
}

function OrderModalContent({
  onClose,
  onSave,
  initialData,
  clients,
  shipments,
  defaultClientId,
}: {
  onClose: () => void;
  onSave: (data: OrderFormData) => Promise<void>;
  initialData?: OrderRecord | null;
  clients: ClientRecord[];
  shipments: ShipmentRecord[];
  defaultClientId: string;
}) {
  const isEditing = Boolean(initialData);

  const [orderNumber, setOrderNumber] = useState<string>(() => {
    return initialData?.orderNumber || generateOrderNumber();
  });

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (initialData?.clientId) return initialData.clientId;
    if (defaultClientId) return defaultClientId;
    return clients[0]?.id || '';
  });

  const [title, setTitle] = useState<string>(() => initialData?.title || '');
  const [status, setStatus] = useState<OrderStatus>(() => initialData?.status || 'Confirmed');
  const [orderDate, setOrderDate] = useState<string>(() => initialData?.orderDate || new Date().toISOString().split('T')[0]);
  const [deliveryDeadline, setDeliveryDeadline] = useState<string>(() => initialData?.deliveryDeadline || '');
  const [currency, setCurrency] = useState<string>(() => initialData?.currency || 'USD');
  const [origin, setOrigin] = useState<string>(() => initialData?.origin || 'Dar es Salaam Central Gateway');
  const [destination, setDestination] = useState<string>(() => {
    if (initialData?.destination) return initialData.destination;
    const client = clients.find((c) => c.id === (defaultClientId || selectedClientId));
    return client?.address || 'Arusha Industrial Depot';
  });
  const [notes, setNotes] = useState<string>(() => initialData?.notes || '');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(() => initialData?.shipmentId || '');

  // Line items state
  const [items, setItems] = useState<OrderItem[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items;
    }
    return [
      {
        id: 'item_1',
        description: 'Standard Logistics Freight Consignment Package',
        quantity: 1,
        unitPrice: 1500,
        weight: '250 kg',
      },
    ];
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto calculate total
  const calculatedTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const match = clients.find((c) => c.id === clientId);
    if (match && match.address && !destination) {
      setDestination(match.address);
    }
  };

  // Add line item
  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `item_${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      weight: '50 kg',
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Remove line item
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field
  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const clientMatch = clients.find((c) => c.id === selectedClientId);
    if (!clientMatch && !selectedClientId) {
      setFormError('Please select an associated Client from the address book.');
      return;
    }

    if (!title.trim()) {
      setFormError('Please provide an order title or description of goods.');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setFormError('Please provide a description for all line items.');
      return;
    }

    const linkedShipment = shipments.find((s) => s.id === selectedShipmentId);

    setSubmitting(true);
    try {
      await onSave({
        orderNumber: orderNumber.trim(),
        clientId: selectedClientId,
        clientName: clientMatch?.company || 'Client',
        clientContact: clientMatch?.contactPerson,
        shipmentId: selectedShipmentId || undefined,
        shipmentReference: linkedShipment ? (linkedShipment.referenceNumber || linkedShipment.trackingNumber) : undefined,
        title: title.trim(),
        status,
        orderDate,
        deliveryDeadline,
        totalAmount: calculatedTotal,
        currency,
        origin: origin.trim(),
        destination: destination.trim(),
        notes: notes.trim(),
        items,
      });
      onClose();
    } catch (err: unknown) {
      console.error('Error saving order:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isEditing ? `Edit Order #${orderNumber}` : 'Create Commercial Order'}
              </h2>
              <p className="text-xs text-slate-500">
                Establish order relationships linking Clients to Shipments and Tracking Events
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-5 text-xs">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Order Ref & Client Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                <span>Order Reference #</span>
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-884102"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Associated Client (Relationship) *</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-semibold focus:outline-none"
              >
                {clients.length === 0 ? (
                  <option value="">No clients available - create one first</option>
                ) : (
                  clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} (Contact: {c.contactPerson})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Title & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-800 block mb-1.5">
                Order Title / Goods Description *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Precision Industrial Pump Assembly Units"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Lifecycle Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Fulfillment">In Fulfillment</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Associated Shipment Dropdown */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Link to Shipment (Shipment Relationship)</span>
              </label>
              <span className="text-[10px] text-blue-600 font-semibold">
                Enables live tracking events synchronization
              </span>
            </div>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none font-medium"
            >
              <option value="">-- No linked shipment (Assign later or create separately) --</option>
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  Waybill {s.referenceNumber || s.trackingNumber} &bull; {s.origin} &rarr; {s.destination} ({s.status})
                </option>
              ))}
            </select>
          </div>

          {/* Dates & Logistics Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Order Date *</span>
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Delivery Deadline</span>
              </label>
              <input
                type="date"
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Origin Hub *</span>
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Dar es Salaam Gateway"
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Destination *</span>
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Client Warehouse"
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-teal-600" />
                  <span>Order Items &amp; Valuation</span>
                </h4>
                <p className="text-[11px] text-slate-400">Add commercial goods and specifications</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-mono font-bold text-xs"
                >
                  <option value="USD">USD ($)</option>
                  <option value="TZS">TZS</option>
                  <option value="EUR">EUR (€)</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="Item Description / SKU"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 text-center font-mono focus:outline-none"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 text-right font-mono focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Weight"
                      value={item.weight || ''}
                      onChange={(e) => handleItemChange(idx, 'weight', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 text-center font-mono focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total calculation bar */}
            <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-teal-900 text-xs">
                Total Order Valuation ({items.length} item line{items.length === 1 ? '' : 's'})
              </span>
              <div className="font-mono font-black text-sm text-teal-800">
                {currency} {calculatedTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Commercial Instructions &amp; Contract Notes</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Client requested delivery under Incoterms DDP; requires seal inspection prior to unsealing."
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none resize-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Order Changes' : 'Confirm & Register Order'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
