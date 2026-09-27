'use client';

import React, { useState } from 'react';
import { Share, PlusSquare, MoreVertical, Laptop, Smartphone, Check } from 'lucide-react';
import { Modal } from '@/components/common/Modal';

interface IosInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: 'ios' | 'android' | 'desktop';
}

export const IosInstallGuideModal: React.FC<IosInstallGuideModalProps> = ({
  isOpen,
  onClose,
  defaultPlatform,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(() => {
    if (defaultPlatform) return defaultPlatform;
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      if (/android/.test(ua)) return 'android';
    }
    return 'ios';
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install Campus Life"
      description="Add Campus Life to your device for 1-tap launch, full screen view & offline safety."
      maxWidth="md"
    >
      <div className="space-y-4 py-1 text-slate-700 dark:text-slate-300 text-sm">
        {/* Device Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>iPhone / iPad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Android / Chrome</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Laptop / Mac</span>
          </button>
        </div>

        {/* Tab 1: iOS */}
        {activeTab === 'ios' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In Safari on your iPhone or iPad:
            </p>
            <ol className="space-y-2.5">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    Tap the Share icon <Share className="w-3.5 h-3.5 text-sky-500 inline" />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Located in Safari&apos;s bottom toolbar (or top right on iPad).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    Select &apos;Add to Home Screen&apos; <PlusSquare className="w-3.5 h-3.5 text-emerald-500 inline" />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Scroll down the options list and tap &ldquo;Add to Home Screen&rdquo;.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Tap &apos;Add&apos; in top-right
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    The Campus Life app icon will appear directly on your home screen.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Tab 2: Android */}
        {activeTab === 'android' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In Chrome or Firefox on your Android phone:
            </p>
            <ol className="space-y-2.5">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    Tap Browser Menu <MoreVertical className="w-3.5 h-3.5 text-slate-500 inline" />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap the 3 vertical dots at the top right of Chrome.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Tap &apos;Install app&apos; or &apos;Add to Home screen&apos;
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Confirm by tapping &ldquo;Install&rdquo;.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Tab 3: Desktop */}
        {activeTab === 'desktop' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In Chrome, Edge, or Brave on your computer:
            </p>
            <ol className="space-y-2.5">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Look at the address bar
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click the install icon (computer with down arrow) on the right side of the address bar.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Click &apos;Install&apos;
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Campus Life will open in its own clean window and appear in your App Launcher / Dock.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D5C46] hover:bg-[#0b4e3b] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Got it, thanks!</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
