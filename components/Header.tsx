'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageCircle, Package, User, Users, ShoppingBag } from 'lucide-react';
import SwahivoLogo from './SwahivoLogo';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  onOpenQuoteModal?: () => void;
  onOpenTrackingModal?: (code?: string) => void;
}

const emptySubscribe = () => () => {};

export default function Header({ onOpenQuoteModal, onOpenTrackingModal }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const pathname = usePathname();
  const { user, userProfile } = useAuth();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shipments', href: '/dashboard/shipments' },
    { name: 'Clients', href: '/dashboard/clients' },
    { name: 'Orders', href: '/dashboard/orders' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Services', href: '/services' },
    { name: 'Tracking', href: '/tracking' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isCurrent = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#040914]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Swahivo Brand & Wordmark */}
          <Link
            href="/"
            className="group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e5c9] rounded-lg"
          >
            <SwahivoLogo size="md" showTagline={true} />
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium">
            {navLinks.map((link) => {
              const active = isCurrent(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={false}
                  className={`relative py-1 transition-colors flex flex-col items-center ${
                    active ? 'text-white font-semibold' : 'text-slate-300 hover:text-[#00e5c9]'
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span className="absolute -bottom-2.5 w-6 h-[2.5px] bg-[#00e5c9] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: WhatsApp phone + Login + Sign Up */}
          <div className="hidden lg:flex items-center gap-4">
            {/* WhatsApp Contact Indicator */}
            <a
              href="https://wa.me/255773306684"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1"
              title="Chat with Swahivo on WhatsApp"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 fill-current stroke-none" />
              </div>
              <span className="font-mono text-emerald-400">+255 773 306 684</span>
            </a>

            {/* User Account / Auth Buttons */}
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/shipments"
                  prefetch={false}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0a1424] hover:bg-[#0f1f38] border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>Shipments</span>
                </Link>
                <Link
                  href="/dashboard/clients"
                  prefetch={false}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0a1424] hover:bg-[#0f1f38] border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-[#00e5c9]" />
                  <span>Clients</span>
                </Link>
                <Link
                  href="/dashboard/orders"
                  prefetch={false}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0a1424] hover:bg-[#0f1f38] border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Orders</span>
                </Link>
                <Link
                  href="/dashboard"
                  prefetch={false}
                  className="px-3 py-1.5 text-xs font-bold text-[#070d18] bg-[#00e5c9] hover:bg-[#15f7dc] rounded-lg transition-colors shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{userProfile?.company || user.displayName || 'Dashboard'}</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0a1424] hover:bg-[#0f1f38] border border-slate-700/80 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-xs font-bold text-[#070d18] bg-[#00e5c9] hover:bg-[#15f7dc] active:bg-[#00c2a8] rounded-lg transition-colors shadow-md shadow-teal-500/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Bar */}
          <div className="flex lg:hidden items-center gap-2.5">
            {mounted && user ? (
              <Link
                href="/dashboard/shipments"
                className="px-3 py-1.5 text-xs font-bold text-[#070d18] bg-[#00e5c9] rounded-lg flex items-center gap-1"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Shipments</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0a1424] border border-slate-700 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-xs font-bold text-[#070d18] bg-[#00e5c9] rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00e5c9]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#060d1a] px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isCurrent(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#00e5c9]/10 text-[#00e5c9] font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <a
              href="https://wa.me/255773306684"
              className="flex items-center gap-2 text-emerald-400 font-mono"
            >
              <MessageCircle className="w-4 h-4 fill-current stroke-none" />
              <span>+255 773 306 684</span>
            </a>
            <button
              onClick={() => {
              setMobileMenuOpen(false);
              onOpenTrackingModal?.();
            }}
              className="text-[#00e5c9] font-medium"
            >
              Quick Track Cargo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
