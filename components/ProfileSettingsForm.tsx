'use client';

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '@/lib/auth-context';
import { ShieldCheck, KeyRound, CheckCircle2, Check } from 'lucide-react';

interface ProfileSettingsFormProps {
  user: User;
  userProfile: UserProfile | null;
  initials: string;
  onSaveProfile: (data: Partial<UserProfile>) => Promise<void>;
  onTriggerReset: () => Promise<void>;
  sendingReset: boolean;
  passwordResetSent: boolean;
}

export default function ProfileSettingsForm({
  user,
  userProfile,
  initials,
  onSaveProfile,
  onTriggerReset,
  sendingReset,
  passwordResetSent,
}: ProfileSettingsFormProps) {
  const [name, setName] = useState(userProfile?.displayName || user.displayName || '');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(userProfile?.address || 'Port Access Road, Gateway Tower 4');
  const [defaultHub, setDefaultHub] = useState(userProfile?.defaultHub || 'Dar es Salaam Central Gateway');
  const [role, setRole] = useState<'Customer' | 'Dealer Operations'>(userProfile?.role || 'Customer');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile({
        displayName: name,
        company,
        phone,
        address,
        defaultHub,
        role,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Profile &amp; Account Settings
        </h1>
        <p className="text-xs text-slate-500">
          Update your enterprise identity, corporate contact details, dispatch hub preferences, and security credentials.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-[#0a1628] text-white flex items-center justify-center font-extrabold text-xl shadow-lg ring-4 ring-blue-500/10">
            {initials}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {userProfile?.displayName || user.displayName || 'Authorized Shipper'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Corporate Shipper
              </span>
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
              <span>Account UID: {user.uid}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company / Organization</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Direct Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255 773 000 000"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Operating Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'Customer' | 'Dealer Operations')}
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none"
              >
                <option value="Customer">Enterprise Shipper / Client</option>
                <option value="Dealer Operations">Dealer Operations &amp; Dispatcher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Preferred Origin Terminal / Gateway</label>
            <select
              value={defaultHub}
              onChange={(e) => setDefaultHub(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none"
            >
              <option value="Dar es Salaam Central Gateway">Dar es Salaam Central Air Freight Hub (Tanzania)</option>
              <option value="Zanzibar Port (Malindi)">Zanzibar Sea Ferry Terminal / Malindi Wharf</option>
              <option value="Rotterdam Port Gateway">Port of Rotterdam Deepwater Gateway (Netherlands)</option>
              <option value="Dubai Logistics City">Dubai Logistics City / Al Maktoum Airport (UAE)</option>
              <option value="Singapore Cargo Terminal">Port of Singapore Automated Terminal (PSA)</option>
              <option value="Chicago Intermodal Hub">Chicago Intermodal Railhead (USA)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Headquarters / Billing Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Samora Avenue, Plot 14, 4th Floor"
              className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile &amp; Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Credentials Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Security &amp; Tenant Isolation</span>
          </h3>
          <p className="text-xs text-slate-500">
            Your account is hardened with Zero-Trust Firebase ABAC security rules and encrypted data partitioning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Account Password</span>
              <KeyRound className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-slate-500 text-[11px]">
              Send an official secure reset link to <strong className="text-slate-700">{user.email}</strong>.
            </p>
            {passwordResetSent ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reset email dispatched!
              </span>
            ) : (
              <button
                type="button"
                onClick={onTriggerReset}
                disabled={sendingReset}
                className="py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {sendingReset ? 'Sending...' : 'Send Password Reset Link'}
              </button>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Data Isolation Scope</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-slate-500 text-[11px]">
              All shipments, orders, clients, and telematics are strictly stored under your Firebase UID path. Zero cross-tenant data leak is permitted.
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              Partition: /users/{user.uid.substring(0, 10)}.../
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Enterprise Certifications Active</p>
            <p className="text-[11px] text-blue-700">
              ISO 9001:2015 Quality Standard &bull; Authorized Economic Operator (AEO Certified) &bull; 256-bit TLS Encrypted Channel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
