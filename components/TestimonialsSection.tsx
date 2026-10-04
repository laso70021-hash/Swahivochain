'use client';

import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/logistics-data';

export default function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-20 bg-[#030914] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
            WHAT OUR CUSTOMERS SAY
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Trusted by Individuals & Businesses Worldwide
          </h2>
        </div>

        {/* 3 Testimonials Cards matching screenshot layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#061020] border border-slate-800/90 flex flex-col justify-between space-y-6"
            >
              {/* Quote text */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author Info & Star Rating Footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.author}
                      fill
                      sizes="36px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {item.author}
                    </h4>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      {item.role}, {item.country}
                    </p>
                  </div>
                </div>

                {/* 5 Stars */}
                <div className="flex items-center gap-0.5 text-amber-400 shrink-0 text-xs">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
