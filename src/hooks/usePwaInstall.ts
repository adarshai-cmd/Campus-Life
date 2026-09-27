'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useMounted } from '@/hooks/useMounted';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const emptySubscribe = () => () => {};

export function usePwaInstall() {
  const isMounted = useMounted();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isManualDismissed, setIsManualDismissed] = useState(false);
  const [isInstalledEvent, setIsInstalledEvent] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Subscribe to standalone state (Browser-native detection)
  const isStandalone = useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const mqlStandalone = window.matchMedia('(display-mode: standalone)');
      const mqlMinimal = window.matchMedia('(display-mode: minimal-ui)');
      const mqlFullscreen = window.matchMedia('(display-mode: fullscreen)');
      const mqlOverlay = window.matchMedia('(display-mode: window-controls-overlay)');

      mqlStandalone.addEventListener('change', callback);
      mqlMinimal.addEventListener('change', callback);
      mqlFullscreen.addEventListener('change', callback);
      mqlOverlay.addEventListener('change', callback);
      window.addEventListener('appinstalled', callback);

      return () => {
        mqlStandalone.removeEventListener('change', callback);
        mqlMinimal.removeEventListener('change', callback);
        mqlFullscreen.removeEventListener('change', callback);
        mqlOverlay.removeEventListener('change', callback);
        window.removeEventListener('appinstalled', callback);
      };
    },
    () => {
      if (typeof window === 'undefined') return false;
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://')
      );
    },
    () => false
  );

  // Subscribe to iOS device check
  const isIos = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === 'undefined') return false;
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    },
    () => false
  );

  // Banner-only dismissal state
  const isStoredDismissed = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === 'undefined') return false;
      try {
        return localStorage.getItem('campus_life_pwa_banner_dismissed') === 'true';
      } catch {
        return false;
      }
    },
    () => false
  );

  const isInstalled = isStandalone || isInstalledEvent;
  const isBannerDismissed = isStoredDismissed || isManualDismissed;
  const isInstallable = Boolean(deferredPrompt);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalledEvent(true);
      setDeferredPrompt(null);
      setIsGuideOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalledEvent(true);
        }
        setDeferredPrompt(null);
        return choice;
      } catch (err) {
        console.error('[PWA] Prompt error:', err);
      }
    }
    // If native prompt unavailable (iOS or browser without active deferred prompt), open guide
    setIsGuideOpen(true);
    return { outcome: 'guide_opened' };
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsManualDismissed(true);
    try {
      localStorage.setItem('campus_life_pwa_banner_dismissed', 'true');
    } catch {}
  }, []);

  const resetDismissal = useCallback(() => {
    setIsManualDismissed(false);
    try {
      localStorage.removeItem('campus_life_pwa_banner_dismissed');
    } catch {}
  }, []);

  const clearAppCacheOnly = useCallback(async () => {
    if (typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      return true;
    } catch (err) {
      console.error('[PWA] Cache clear error:', err);
      return false;
    }
  }, []);

  return {
    isMounted,
    isInstallable,
    isInstalled,
    isIos,
    isDismissed: isBannerDismissed,
    isGuideOpen,
    setIsGuideOpen,
    install,
    dismissBanner,
    resetDismissal,
    clearAppCacheOnly,
  };
}
