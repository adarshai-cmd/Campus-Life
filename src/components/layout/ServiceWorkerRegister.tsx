'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker immediately to enable Chrome/Edge PWA installability prompt
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.debug('[SW] Registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.debug('[SW] Registration notice:', err);
        });
    }
  }, []);

  return null;
}
