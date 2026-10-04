'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Warehouse, Plane, ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  onOpenQuoteModal?: () => void;
}

export default function ServicesSection({ onOpenQuoteModal }: ServicesSectionProps) {
  return (
    <section id="services" className="relative py-16 lg:py-24 bg-[#030914] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Intro Column */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
              OUR SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Comprehensive Logistics <br className="hidden sm:inline" />
              & Financial Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Whether you&apos;re shipping a single package or managing complex supply chains,{' '}
              <span className="text-[#00e5c9] font-medium">Swahivo</span> provides the tools,
              partners and expertise to get it there — safely, on time and at the best value.
            </p>

            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-700/80 bg-[#081324] hover:bg-[#0c1a32] text-xs font-semibold text-white hover:text-[#00e5c9] transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Cards: Warehouse + Shipping and Shipping Only */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1: Warehouse + Shipping */}
            <div className="group rounded-2xl bg-[#061020] border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                <Image
                  src="/images/warehouse.jpg"
                  alt="Warehouse + Shipping Facility"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061020] via-[#061020]/20 to-transparent" />
                <div className="absolute bottom-3 left-4 p-2.5 rounded-xl bg-[#00e5c9] text-[#070d18] shadow-md">
                  <Warehouse className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Warehouse + Shipping
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Secure storage, inventory management and global shipping — all in one solution.
                  </p>
                </div>

                <div>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00e5c9] hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Shipping Only */}
            <div className="group rounded-2xl bg-[#061020] border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                <Image
                  src="/images/air.jpg"
                  alt="Shipping Only Air & Ocean Cargo"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061020] via-[#061020]/20 to-transparent" />
                <div className="absolute bottom-3 left-4 p-2.5 rounded-xl bg-[#00e5c9] text-[#070d18] shadow-md">
                  <Plane className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Shipping Only
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Fast, reliable shipping solutions for all your cargo needs.
                  </p>
                </div>

                <div>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00e5c9] hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
