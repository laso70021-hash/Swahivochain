'use client';

import React from 'react';
import Link from 'next/link';
import { Globe2, ArrowRight } from 'lucide-react';

interface FinalCtaSectionProps {
  onOpenQuoteModal?: () => void;
}

export default function FinalCtaSection({ onOpenQuoteModal }: FinalCtaSectionProps) {
  return (
    <section className="py-14 bg-[#030914] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wide Teal Bar matching reference screenshot */}
        <div className="rounded-2xl bg-gradient-to-r from-[#005f56] via-[#007065] to-[#00564d] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#00e5c9]/30 shadow-2xl">
          {/* Left: Globe Icon & Text */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#00e5c9] shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Ready to Ship?
              </h3>
              <p className="text-xs sm:text-sm text-teal-100 mt-0.5 max-w-xl">
                Join thousands of customers who trust Swahivo for their logistics and financial needs.
              </p>
            </div>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#070d18] font-bold text-xs sm:text-sm rounded-lg shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>

            <Link
              href="/contact"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:text-[#00e5c9] transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
