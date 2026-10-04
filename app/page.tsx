'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import ShippingOptionsSection from '@/components/ShippingOptionsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FinalCtaSection from '@/components/FinalCtaSection';
import Footer from '@/components/Footer';
import TrackingModal from '@/components/TrackingModal';
import QuoteModal from '@/components/QuoteModal';

export default function HomePage() {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('SWX-12245678');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteInitialMode, setQuoteInitialMode] = useState('Ocean FCL (Full Container)');
  const [quoteOrigin, setQuoteOrigin] = useState('Shanghai (Yangshan)');
  const [quoteDest, setQuoteDest] = useState('Rotterdam');

  const handleOpenTracking = (code?: string) => {
    if (code) setTrackingCode(code);
    setIsTrackingOpen(true);
  };

  const handleOpenQuote = (mode?: string, origin?: string, dest?: string) => {
    if (mode) setQuoteInitialMode(mode);
    if (origin) setQuoteOrigin(origin);
    if (dest) setQuoteDest(dest);
    setIsQuoteOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d18] text-slate-100">
      {/* Top Header */}
      <Header
        onOpenQuoteModal={() => handleOpenQuote()}
        onOpenTrackingModal={(code) => handleOpenTracking(code)}
      />

      {/* Main Page Flow matching screenshot order exactly */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection
          onOpenQuoteModal={() => handleOpenQuote()}
          onOpenTrackingModal={(code) => handleOpenTracking(code)}
        />

        {/* 2. Key Services Section (Warehouse + Shipping & Shipping Only) */}
        <ServicesSection onOpenQuoteModal={() => handleOpenQuote()} />

        {/* 3. Shipping Options & Trusted Partners (Carriers & Marine Assets) */}
        <ShippingOptionsSection onOpenQuoteModal={(mode) => handleOpenQuote(mode)} />

        {/* 4. How It Works (4 Simple Steps) */}
        <HowItWorksSection />

        {/* 5. Why Choose Swahivo (Built for Your Success) */}
        <WhyChooseUsSection />

        {/* 6. What Our Customers Say (Testimonials) */}
        <TestimonialsSection />

        {/* 7. Ready to Ship? (Final CTA Banner) */}
        <FinalCtaSection onOpenQuoteModal={() => handleOpenQuote()} />
      </main>

      {/* Footer */}
      <Footer
        onOpenTrackingModal={() => handleOpenTracking()}
        onOpenQuoteModal={() => handleOpenQuote()}
      />

      {/* Interactive Shipment Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialTrackingCode={trackingCode}
      />

      {/* Interactive Freight Quote Booking Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialMode={quoteInitialMode}
        initialOrigin={quoteOrigin}
        initialDestination={quoteDest}
      />
    </div>
  );
}
