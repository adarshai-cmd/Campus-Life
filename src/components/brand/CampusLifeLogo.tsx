'use client';

import React from 'react';
import Image from 'next/image';

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
    sm: { container: 'w-8 h-8 rounded-lg', imgSize: 32, text: 'text-sm' },
    md: { container: 'w-10 h-10 rounded-xl', imgSize: 40, text: 'text-base' },
    lg: { container: 'w-12 h-12 rounded-xl', imgSize: 48, text: 'text-lg' },
    xl: { container: 'w-20 h-20 rounded-2xl', imgSize: 80, text: 'text-2xl' },
  };

  const { container, imgSize, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand 3D Logo Emblem */}
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 shrink-0 ${container} ${badgeClassName}`}
      >
        <Image
          src="/brand/campus-life-logo.png"
          alt="Campus Life Logo"
          width={imgSize}
          height={imgSize}
          priority
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
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
