'use client';

import React from 'react';
import Image from 'next/image';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '1',
      title: 'Choose Service',
      description: 'Select the right service for your needs.',
    },
    {
      num: '2',
      title: 'Get a Quote',
      description: 'See real-time pricing and delivery estimates.',
    },
    {
      num: '3',
      title: 'Make Payment',
      description: 'Secure and flexible payment options.',
    },
    {
      num: '4',
      title: 'Track & Receive',
      description: 'Get updates until your shipment arrives.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 bg-[#030914] overflow-hidden border-t border-slate-800/80">
      {/* Background panoramic shipping watermark matching screenshot */}
      <div className="absolute inset-0 z-0 opacity-15">
        <Image
          src="/images/ocean.jpg"
          alt="Ocean Port Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030914] via-[#030914]/80 to-[#030914]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030914] via-transparent to-[#030914]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00e5c9]">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Get Started in 4 Simple Steps
          </h2>
        </div>

        {/* 4 Steps Row with Connecting Arrows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-start space-y-3">
              {/* Step Number Circle */}
              <div className="w-10 h-10 rounded-full bg-[#00e5c9] text-[#070d18] font-extrabold text-sm flex items-center justify-center shadow-lg shadow-teal-500/20">
                {step.num}
              </div>

              {/* Title & Description */}
              <div className="space-y-1 pr-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting Right Arrow on Desktop */}
              {idx < 3 && (
                <div className="hidden lg:block absolute -right-3 top-2.5 text-slate-500 text-base">
                  ➔
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
