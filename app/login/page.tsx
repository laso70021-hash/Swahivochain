'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';
import SwahivoLogo from '@/components/SwahivoLogo';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { logIn, resetPassword, demoLogin, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Google login error:', err);
      const msg = err instanceof Error ? err.message : 'Google sign-in could not be completed.';
      if (msg.includes('popup-closed-by-user')) {
        setError('Sign-in popup was closed before finishing.');
      } else {
        setError(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await logIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.';
      if (message.includes('auth/operation-not-allowed') || message.includes('operation-not-allowed')) {
        setError('Email/Password sign-in is disabled in this Firebase project. Please click "Continue with Google" above (recommended) or enable Email/Password provider in Firebase Console.');
      } else if (message.includes('user-not-found') || message.includes('wrong-password') || message.includes('invalid-credential')) {
        setError('Incorrect corporate email or password. Please try again.');
      } else if (message.includes('too-many-requests')) {
        setError('Access temporarily throttled due to multiple failed attempts. Please reset your password or try later.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (role: 'Customer' | 'Dealer Operations') => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo access could not be initialized.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to send reset email.';
      if (message.includes('user-not-found')) {
        setResetError('No account found with this corporate email address.');
      } else {
        setResetError(message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#070d18] px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00e5c9]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <SwahivoLogo size="lg" showTagline={true} />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Logistics Chain Enterprise Portal
          </h1>
          <p className="text-xs text-slate-400">
            Securely sign in to access your private shipments, control towers, and dispatch operations.
          </p>
        </div>

        {/* Card */}
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
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full py-2 bg-[#00e5c9] hover:bg-[#15f7dc] text-[#070d18] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Continue with Google</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          )}

          {/* Primary Action: Google Sign-in */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
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
              Or with corporate email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSuccess(false);
                    setResetError(null);
                    setIsResetOpen(true);
                  }}
                  className="text-[11px] text-[#00e5c9] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
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
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#00e5c9]" />
              <span>One-Click Instant Demo Login</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoAccess('Customer')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-[#0e1d33] hover:bg-[#132745] text-slate-200 border border-slate-700/80 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Shipper Demo</span>
                <ArrowRight className="w-3 h-3 text-[#00e5c9]" />
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('Dealer Operations')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-[#0e1d33] hover:bg-[#132745] text-slate-200 border border-slate-700/80 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Operations Demo</span>
                <ArrowRight className="w-3 h-3 text-[#00e5c9]" />
              </button>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-[#00e5c9] hover:underline font-semibold">
              Create Shipper Account
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Return to public home
          </Link>
        </div>
      </div>

      {/* Reset Password Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#091322] border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00e5c9]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Receive an official secure reset link</p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-1">Reset Link Dispatched</p>
                    <p className="text-slate-300">
                      We have sent password recovery instructions to <strong className="text-white">{resetEmail}</strong>. Please check your inbox and follow the secure link.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Close &amp; Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-4 text-xs">
                <p className="text-slate-300 text-xs">
                  Enter the corporate email address registered to your Logistics Chain account.
                </p>

                {resetError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-[#070d18] border border-slate-700 focus:border-[#00e5c9] rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2.5 bg-[#00e5c9] hover:bg-[#15f7dc] text-[#070d18] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <div className="w-4 h-4 border-2 border-[#070d18] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
