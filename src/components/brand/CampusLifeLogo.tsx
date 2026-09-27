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
    sm: { container: 'w-8 h-8 rounded-lg', text: 'text-sm' },
    md: { container: 'w-10 h-10 rounded-xl', text: 'text-base' },
    lg: { container: 'w-12 h-12 rounded-xl', text: 'text-lg' },
    xl: { container: 'w-20 h-20 rounded-2xl', text: 'text-2xl' },
  };

  const { container, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Brand Logo Badge */}
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 shrink-0 ${container} ${badgeClassName}`}
      >
        <img
          src="/brand/campus-life-logo.png"
          alt="Campus Life Logo"
          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Brand Wordmark & Tagline */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-extrabold tracking-tight text-slate-900 dark:text-slate-100 ${text}`}>
              Campus<span className="text-amber-500 dark:text-amber-400 font-bold ml-0.5">Life</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
            Learn • Connect • Grow
          </span>
        </div>
      )}
    </div>
  );
}
