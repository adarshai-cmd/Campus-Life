'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { MoneyProvider } from '@/context/MoneyContext';
import { TravelProvider } from '@/context/TravelContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { SkillsProvider } from '@/context/SkillsContext';
import { AppShell } from '@/components/layout/AppShell';

function ProfileScopedProviders({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfile();
  const profileKey = activeProfile?.id || 'none';

  return (
    <MoneyProvider key={`money_${profileKey}`}>
      <TravelProvider key={`travel_${profileKey}`}>
        <CollegeProvider key={`college_${profileKey}`}>
          <SkillsProvider key={`skills_${profileKey}`}>
            <AppShell>{children}</AppShell>
          </SkillsProvider>
        </CollegeProvider>
      </TravelProvider>
    </MoneyProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <ProfileScopedProviders>{children}</ProfileScopedProviders>
      </ProfileProvider>
    </ThemeProvider>
  );
}
