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
    sm: { container: 'w-7 h-7 rounded-lg', icon: 18, text: 'text-sm' },
    md: { container: 'w-9 h-9 rounded-xl', icon: 22, text: 'text-base' },
    lg: { container: 'w-11 h-11 rounded-xl', icon: 28, text: 'text-lg' },
    xl: { container: 'w-14 h-14 rounded-2xl', icon: 36, text: 'text-xl' },
  };

  const { container, icon, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Emblem */}
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-[#0D5C46] via-[#0F6850] to-[#084232] dark:from-[#059669] dark:via-[#10B981] dark:to-[#047857] text-white shadow-xs border border-white/20 dark:border-emerald-400/20 shrink-0 ${container} ${badgeClassName}`}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200 group-hover:scale-105"
        >
          {/* Base: Academic Open Book Foundation */}
          <path
            d="M3 17.5C5.5 16 8.5 16 12 18C15.5 16 18.5 16 21 17.5V6.5C18.5 5 15.5 5 12 7C8.5 5 5.5 5 3 6.5V17.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Center Spine & Growth Stem */}
          <path
            d="M12 7V18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Beacon / Growth Spire rising upward from center */}
          <path
            d="M12 2.5L13.2 5L12 6L10.8 5L12 2.5Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Optional Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-slate-900 dark:text-slate-100 ${text}`}>
            Campus Life
          </span>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold mt-1">
            Student Productivity OS
          </span>
        </div>
      )}
    </div>
  );
}
