'use client';

import React from 'react';

interface SwahivoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function SwahivoLogo({
  className = '',
  size = 'md',
  showTagline = true,
}: SwahivoLogoProps) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const tagSize = size === 'sm' ? 'text-[8px]' : 'text-[9.5px]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision SVG Swahivo Hexagonal Emblem */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        {/* Hexagonal Outer Contour */}
        <polygon
          points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5"
          fill="none"
          stroke="#00e5c9"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Inner Geometric Folded Ribbon / Link Motif */}
        <path
          d="M17 19.5L24 15.5L31 19.5V28.5L24 32.5L17 28.5V22"
          stroke="#00e5c9"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 15.5V32.5"
          stroke="#00e5c9"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="2 3"
          className="opacity-70"
        />
        <circle cx="24" cy="24" r="2.8" fill="#00e5c9" />
      </svg>

      <div className="flex flex-col justify-center leading-none">
        <span className={`font-extrabold tracking-tight text-white ${textSize}`}>
          Swahivo
        </span>
        {showTagline && (
          <span
            className={`tracking-wider text-slate-300 font-medium mt-1 ${tagSize}`}
          >
            Logistics • Finance • Global
          </span>
        )}
      </div>
    </div>
  );
}
