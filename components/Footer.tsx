'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
} from 'lucide-react';
import SwahivoLogo from './SwahivoLogo';

interface FooterProps {
  onOpenTrackingModal?: () => void;
  onOpenQuoteModal?: () => void;
}

export default function Footer({ onOpenTrackingModal, onOpenQuoteModal }: FooterProps) {
  return (
    <footer className="relative bg-[#020710] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Swahivo Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-3">
            <Link href="/" className="inline-block">
              <SwahivoLogo size="md" showTagline={true} />
            </Link>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-[12px] text-slate-400">
              <li>
                <Link href="/" className="hover:text-[#00e5c9] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#00e5c9] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/dashboard/shipments" className="hover:text-[#00e5c9] transition-colors">
                  Shipments
                </Link>
              </li>
              <li>
                <Link href="/dashboard/clients" className="hover:text-[#00e5c9] transition-colors">
                  Clients Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard/orders" className="hover:text-[#00e5c9] transition-colors">
                  Orders &amp; Cargo
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#00e5c9] transition-colors">
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-[#00e5c9] transition-colors">
                  Tracking
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#00e5c9] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#00e5c9] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wide">Services</h4>
            <ul className="space-y-2 text-[12px] text-slate-400">
              <li>
                <Link href="/services" className="hover:text-[#00e5c9] transition-colors">
                  Warehouse + Shipping
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#00e5c9] transition-colors">
                  Shipping Only
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#00e5c9] transition-colors">
                  Air Freight
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#00e5c9] transition-colors">
                  Ocean Freight
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#00e5c9] transition-colors">
                  Road Freight
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wide">Support</h4>
            <ul className="space-y-2 text-[12px] text-slate-400">
              <li>
                <Link href="/contact" className="hover:text-[#00e5c9] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTrackingModal}
                  className="hover:text-[#00e5c9] transition-colors text-left"
                >
                  Track Shipment
                </button>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#00e5c9] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#00e5c9] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Follow Us + WhatsApp */}
          <div className="space-y-3 col-span-2 md:col-span-1 lg:col-span-1">
            <h4 className="text-xs font-bold text-white tracking-wide">Follow Us</h4>
            <div className="flex items-center gap-2.5 text-slate-300">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-full bg-[#0a1424] border border-slate-700/80 flex items-center justify-center hover:text-[#00e5c9] hover:border-[#00e5c9] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-7 h-7 rounded-full bg-[#0a1424] border border-slate-700/80 flex items-center justify-center hover:text-[#00e5c9] hover:border-[#00e5c9] transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 rounded-full bg-[#0a1424] border border-slate-700/80 flex items-center justify-center hover:text-[#00e5c9] hover:border-[#00e5c9] transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-7 h-7 rounded-full bg-[#0a1424] border border-slate-700/80 flex items-center justify-center hover:text-[#00e5c9] hover:border-[#00e5c9] transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="pt-1">
              <a
                href="https://wa.me/255773306684"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 stroke-none" />
                <span className="font-mono text-[11.5px]">+255 773 306 684</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p suppressHydrationWarning>© 2025 Swahivo. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span>|</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Action Button in Bottom Right as seen in reference image */}
      <a
        href="https://wa.me/255773306684"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Swahivo on WhatsApp"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#00e5c9] hover:bg-[#14f3d7] active:bg-[#00c2a8] text-[#070d18] shadow-2xl shadow-teal-500/30 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#00e5c9]/40"
      >
        <MessageCircle className="w-6 h-6 fill-current stroke-none" />
      </a>
    </footer>
  );
}
