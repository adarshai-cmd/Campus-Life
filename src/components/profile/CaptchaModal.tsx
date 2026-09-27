'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ShieldCheck, RotateCw, AlertCircle } from 'lucide-react';

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  userName: string;
}

// Unambiguous, high-contrast character pool (strictly excludes confusing characters like 0/O, 1/I)
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

interface CaptchaCharInfo {
  char: string;
  rotation: number;
  colorClass: string;
}

const COLOR_CLASSES_LIGHT = [
  'text-emerald-800 dark:text-emerald-300',
  'text-slate-900 dark:text-slate-100',
  'text-teal-800 dark:text-teal-300',
  'text-indigo-900 dark:text-indigo-300',
  'text-emerald-900 dark:text-emerald-200',
];

function generateCaptchaData(length = 5): { code: string; chars: CaptchaCharInfo[] } {
  let code = '';
  const chars: CaptchaCharInfo[] = [];

  for (let i = 0; i < length; i++) {
    const char = CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
    code += char;
    // Mild angle for security without degrading readability
    const rotation = (Math.random() * 8 - 4); // -4deg to +4deg
    const colorClass = COLOR_CLASSES_LIGHT[i % COLOR_CLASSES_LIGHT.length];
    chars.push({ char, rotation, colorClass });
  }

  return { code, chars };
}

function CaptchaChallengeForm({
  onClose,
  onVerified,
}: {
  onClose: () => void;
  onVerified: () => void;
}) {
  const [captchaData, setCaptchaData] = useState<{ code: string; chars: CaptchaCharInfo[] }>(() =>
    generateCaptchaData(5)
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setIsRefreshing(true);
    setCaptchaData(generateCaptchaData(5));
    setUserAnswer('');
    setError('');
    setTimeout(() => setIsRefreshing(false), 200);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = userAnswer.trim().toUpperCase();

    if (!cleanInput) {
      setError('Please enter the characters shown above.');
      return;
    }

    if (cleanInput !== captchaData.code) {
      setError('Incorrect CAPTCHA. Please try again.');
      // Auto-generate fresh challenge on failure for security and ease of retry
      setCaptchaData(generateCaptchaData(5));
      setUserAnswer('');
      return;
    }

    setError('');
    onVerified();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* CAPTCHA Visual Display Container */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-inner">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Security Verification
            </span>
          </div>

          <button
            type="button"
            onClick={refreshCaptcha}
            aria-label="Refresh CAPTCHA"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60 active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>↻ Refresh CAPTCHA</span>
          </button>
        </div>

        {/* High-Contrast Character Badges Container (Guaranteed non-clipping across 320px - 430px) */}
        <div
          role="img"
          aria-label={`CAPTCHA code containing ${captchaData.code.length} characters`}
          className="flex items-center justify-center gap-2 sm:gap-3 py-3 px-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-750 shadow-xs select-none overflow-hidden"
        >
          {captchaData.chars.map((item, idx) => (
            <div
              key={idx}
              style={{
                transform: `rotate(${item.rotation}deg)`,
              }}
              className={`w-10 sm:w-12 h-12 sm:h-14 rounded-lg bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700/80 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl tracking-normal shadow-2xs transition-transform ${item.colorClass}`}
            >
              {item.char}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
          Case-insensitive. Type the 5 characters exactly as displayed.
        </p>
      </div>

      {/* Input Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="captcha-input"
          className="block text-xs font-bold text-slate-800 dark:text-slate-200"
        >
          Enter the characters shown above
        </label>
        <div className="relative">
          <input
            id="captcha-input"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck="false"
            maxLength={5}
            placeholder="e.g. A7K9P"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              if (error) setError('');
            }}
            autoFocus
            className={`w-full h-12 px-4 rounded-xl text-base sm:text-lg font-mono tracking-widest uppercase font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-2 transition-all outline-hidden ${
              error
                ? 'border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                : 'border-slate-300 dark:border-slate-700 focus:border-[#0D5C46] dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
            }`}
          />
        </div>

        {/* Error Message with Icon & High Contrast */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="md" onClick={onClose}>
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!userAnswer.trim()}
          className="font-bold min-w-[140px]"
        >
          Verify & Continue
        </Button>
      </div>
    </form>
  );
}

export function CaptchaModal({
  isOpen,
  onClose,
  onVerified,
  userName,
}: CaptchaModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Security Verification"
      description={`Quick human check before creating local profile for ${userName || 'you'}.`}
      maxWidth="sm"
    >
      <CaptchaChallengeForm onClose={onClose} onVerified={onVerified} />
    </Modal>
  );
}
