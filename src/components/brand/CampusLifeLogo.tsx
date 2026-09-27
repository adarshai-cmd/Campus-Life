'use client';

import React from 'react';

interface CampusLifeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  badgeClassName?: string;
}

export function CampusLifeLogo({
  size = 'md',
  showWordmark = false,
  className = '',
  badgeClassName = '',
}: CampusLifeLogoProps) {
  const sizeMap = {
    sm: {
      container: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-0.5',
      text: 'text-sm sm:text-base',
      tagline: 'text-[9px] sm:text-[10px]',
    },
    md: {
      container: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-1',
      text: 'text-base sm:text-lg',
      tagline: 'text-[10px] sm:text-[11px]',
    },
    lg: {
      container: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1.5 shadow-md',
      text: 'text-lg sm:text-xl',
      tagline: 'text-[11px] sm:text-xs',
    },
    xl: {
      container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-2 shadow-lg',
      text: 'text-2xl sm:text-3xl',
      tagline: 'text-xs sm:text-sm',
    },
  };

  const { container, text, tagline } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 3D Brand Logo Badge */}
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border border-slate-200/90 dark:border-slate-800/90 shrink-0 transition-transform duration-200 group-hover:scale-105 ${container} ${badgeClassName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/campus-life-logo.png"
          alt="Campus Life Logo"
          className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </div>

      {/* Brand Wordmark & Tagline */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className={`font-extrabold tracking-tight text-slate-900 dark:text-slate-100 ${text}`}>
              Campus<span className="text-amber-500 dark:text-amber-400 font-bold ml-0.5">Life</span>
            </span>
          </div>
          <span className={`${tagline} text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 whitespace-nowrap`}>
            Learn • Connect • Grow
          </span>
        </div>
      )}
    </div>
  );
}
