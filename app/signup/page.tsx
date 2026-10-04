'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Building, ArrowRight, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';
import SwahivoLogo from '@/components/SwahivoLogo';
import { useAuth } from '@/lib/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Customer' | 'Dealer Operations'>('Customer');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Google Sign-Up error:', err);
      const msg = err instanceof Error ? err.message : 'Google sign-up could not be completed.';
      if (msg.includes('popup-closed-by-user')) {
        setError('Sign-up popup was closed before completing.');
      } else {
        setError(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, company, role, phone);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to create account.';
      if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
        setError('Email/Password registration is disabled in this Firebase project. Please click "Continue with Google" above to create your account instantly.');
      } else if (msg.includes('email-already-in-use')) {
        setError('This email address is already registered. Please sign in instead.');
      } else if (msg.includes('invalid-email')) {
        setError('Please enter a valid corporate email address.');
      } else if (msg.includes('weak-password')) {
        setError('Password is too weak. Please include letters and numbers.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#070d18] px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00e5c9]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <SwahivoLogo size="lg" showTagline={true} />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Create Shipper Account
          </h1>
          <p className="text-xs text-slate-400">
            Join the digital logistics chain with secure, private data isolation.
          </p>
        </div>

        <div className="bg-[#091322] border border-slate-800 rounded-3xl p-7 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
              {(error.includes('Google') || error.includes('disabled')) && (
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  className="w-full py-2 bg-[#00e5c9] hover:bg-[#15f7dc] text-[#070d18] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Continue with Google</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          )}

          {/* Primary Action: Google Registration */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#091322] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider shrink-0">
              Or register with email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Kimaro"
                  className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Company / Organization</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Zanzibar Maritime Ltd"
                  className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+255 773 000 000"
                    className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Customer' | 'Dealer Operations')}
                  className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl px-3 py-2.5 text-white focus:outline-none transition-colors"
                >
                  <option value="Customer">Shipper / Client</option>
                  <option value="Dealer Operations">Operations Manager</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Private Encrypted Tenant</span>
              </div>
              <p>Your shipments, bills of lading, and pickup orders are securely segregated and accessible only by your authenticated account.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] text-[#070d18] font-bold text-xs rounded-xl transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#070d18] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account &amp; Enter Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-[#00e5c9] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Return to public home
          </Link>
        </div>
      </div>
    </div>
  );
}
