'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useMounted } from '@/hooks/useMounted';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const emptySubscribe = () => () => {};

// Global singleton reference so prompt is preserved across all page transitions and components
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((fn) => fn());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((fn) => fn());
  });
}

export function usePwaInstall() {
  const isMounted = useMounted();
  const [, setPromptTick] = useState(0);
  const [isManualDismissed, setIsManualDismissed] = useState(false);
  const [isInstalledEvent, setIsInstalledEvent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const onPromptChange = () => setPromptTick((t) => t + 1);
    promptListeners.add(onPromptChange);
    return () => {
      promptListeners.delete(onPromptChange);
    };
  }, []);

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
  const isInstallable = Boolean(globalDeferredPrompt);

  const install = useCallback(async () => {
    // 1. Direct native 1-click install prompt on Android, Chrome, Edge, Windows, Mac
    if (globalDeferredPrompt) {
      try {
        const promptEvent = globalDeferredPrompt;
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalledEvent(true);
        }
        globalDeferredPrompt = null;
        promptListeners.forEach((fn) => fn());
        return choice;
      } catch (err) {
        console.debug('[PWA] Native prompt invocation:', err);
      }
    }

    // 2. iOS Safari handling without tabbed dialogs
    if (isIos) {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: 'Campus Life',
            text: 'Install Campus Life app',
            url: window.location.href,
          });
          return { outcome: 'shared' };
        } catch {
          // User dismissed or share sheet closed
        }
      }
      setToastMessage("In Safari, tap Share (⎋) and select 'Add to Home Screen' (+)");
      setTimeout(() => setToastMessage(null), 5000);
      return { outcome: 'ios_hint' };
    }

    // 3. Desktop / Chrome fallback if browser already has install icon in address bar
    setToastMessage("Click the Install icon (⬇) in your browser address bar to install.");
    setTimeout(() => setToastMessage(null), 5000);
    return { outcome: 'browser_hint' };
  }, [isIos]);

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
    toastMessage,
    setToastMessage,
    install,
    dismissBanner,
    resetDismissal,
    clearAppCacheOnly,
  };
}
