'use client';

import React, { useState } from 'react';
import {
  X,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Check,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { ClientRecord } from '@/lib/auth-context';
import { ClientFormData } from '@/lib/client-service';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => Promise<void>;
  initialData?: ClientRecord | null;
}

export default function ClientModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ClientModalProps) {
  if (!isOpen) return null;

  return (
    <ClientModalForm
      key={initialData ? initialData.id : 'new-client'}
      initialData={initialData}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function ClientModalForm({
  initialData,
  onClose,
  onSave,
}: {
  initialData?: ClientRecord | null;
  onClose: () => void;
  onSave: (data: ClientFormData) => Promise<void>;
}) {
  const [company, setCompany] = useState(initialData?.company || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!company.trim()) {
      setFormError('Please enter a company or client name.');
      return;
    }
    if (!contactPerson.trim()) {
      setFormError('Please enter a primary contact person.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid corporate email address.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Please enter a contact phone number.');
      return;
    }
    if (!address.trim()) {
      setFormError('Please enter the client physical or registered address.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        company: company.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: unknown) {
      console.error('Error saving client:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save client details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {initialData ? 'Edit Client Record' : 'Register New Client'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData
                  ? `Update contact and address records for ${initialData.company}`
                  : 'Add a new client or corporate consignor to your logistics address book'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-5 text-xs">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Row 1: Company Name & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Company or Client Name *</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Serengeti Global Freight Ltd"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Primary Contact Person *</span>
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mary Wanjiru"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Corporate Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. logistics@serengeti.co.tz"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Contact Phone Number *</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +255 744 890 123"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none font-medium font-mono"
              />
            </div>
          </div>

          {/* Row 3: Physical Address */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Physical or Registered Address *</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 44 Kurasini Harbor Road, Dar es Salaam, Tanzania"
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none font-medium"
            />
          </div>

          {/* Row 4: Notes & Instructions */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Client Notes &amp; Customs Instructions (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Consignee has AEO priority customs clearance; requires ocean bills of lading emailed 48h before docking."
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-slate-800 text-xs focus:outline-none resize-none leading-relaxed"
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData ? 'Save Changes' : 'Register Client'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
