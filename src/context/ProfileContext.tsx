'use client';

import React, { createContext, useContext, useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { UserProfile, ProfileMetaState } from '@/types/profile';
import { StorageExportData, ImportValidationResult } from '@/types/storage';
import { storageService } from '@/services/storage/storageService';
import { useTheme } from './ThemeContext';
import { useMounted } from '@/hooks/useMounted';
import { getLocalDateString } from '@/utils/dateUtils';

interface CreateProfileInput {
  name: string;
  username: string;
  residenceLabel?: string;
}

interface ProfileContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  isLoading: boolean;
  isUsernameAvailable: (username: string, excludeProfileId?: string) => boolean;
  createProfile: (data: CreateProfileInput) => { success: boolean; error?: string; profile?: UserProfile };
  switchProfile: (profileId: string) => void;
  updateActiveProfile: (updates: Partial<UserProfile>) => { success: boolean; error?: string };
  deleteProfile: (profileId: string) => boolean;
  resetAllData: () => void;
  exportCurrentProfileData: () => void;
  validateImportContent: (jsonString: string) => ImportValidationResult;
  importProfileBackup: (data: StorageExportData) => { success: boolean; error?: string };
  importProfileData: (jsonString: string) => { success: boolean; error?: string };
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const SERVER_META: ProfileMetaState = {
  version: 1,
  profiles: [],
  activeProfileId: null,
};

const getClientProfileMeta = (): ProfileMetaState => storageService.getProfileMeta();
const getServerProfileMeta = (): ProfileMetaState => SERVER_META;

function subscribeProfileMeta(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('campus_life_profile_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('campus_life_profile_change', callback);
  };
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const { setTheme } = useTheme();

  // useSyncExternalStore guarantees zero hydration mismatch and reactive multi-tab/event sync
  const meta = useSyncExternalStore(
    subscribeProfileMeta,
    getClientProfileMeta,
    getServerProfileMeta
  );

  const profiles = meta.profiles;

  const activeProfile = useMemo(() => {
    if (!mounted) return null;
    if (meta.activeProfileId) {
      const found = meta.profiles.find((p) => p.id === meta.activeProfileId);
      if (found) return found;
    }
    return meta.profiles.length > 0 ? meta.profiles[0] : null;
  }, [meta, mounted]);

  const isLoading = !mounted;

  // Apply initial theme from active profile if present
  useEffect(() => {
    if (activeProfile?.theme) {
      setTheme(activeProfile.theme);
    }
  }, [activeProfile?.theme, setTheme]);

  const isUsernameAvailable = useCallback(
    (username: string, excludeProfileId?: string): boolean => {
      return storageService.isUsernameAvailable(username, excludeProfileId);
    },
    []
  );

  const createProfile = useCallback(
    (data: CreateProfileInput): { success: boolean; error?: string; profile?: UserProfile } => {
      try {
        const newProfile = storageService.createProfileRecord(data);
        if (newProfile.theme) {
          setTheme(newProfile.theme);
        }
        return { success: true, profile: newProfile };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create profile.',
        };
      }
    },
    [setTheme]
  );

  const switchProfile = useCallback(
    (profileId: string) => {
      const currentMeta = storageService.getProfileMeta();
      const target = currentMeta.profiles.find((p) => p.id === profileId);
      if (!target) return;

      const updated = {
        ...target,
        lastActiveAt: new Date().toISOString(),
      };

      const updatedProfiles = currentMeta.profiles.map((p) => (p.id === profileId ? updated : p));
      const newMeta: ProfileMetaState = {
        activeProfileId: profileId,
        profiles: updatedProfiles,
        version: 1,
      };

      storageService.saveProfileMeta(newMeta);
      if (updated.theme) {
        setTheme(updated.theme);
      }
    },
    [setTheme]
  );

  const updateActiveProfile = useCallback(
    (updates: Partial<UserProfile>): { success: boolean; error?: string } => {
      if (!activeProfile) return { success: false, error: 'No active profile.' };

      try {
        storageService.updateProfileRecord(activeProfile.id, updates);
        if (updates.theme) {
          setTheme(updates.theme);
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update profile.',
        };
      }
    },
    [activeProfile, setTheme]
  );

  const deleteProfile = useCallback((profileId: string): boolean => {
    return storageService.deleteProfile(profileId);
  }, []);

  const resetAllData = useCallback(() => {
    storageService.resetAllData();
  }, []);

  const exportCurrentProfileData = useCallback(() => {
    if (!activeProfile) return;
    const data = storageService.exportProfileData(activeProfile.id);
    if (!data) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeUsername = (activeProfile.username || activeProfile.name).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dateStr = getLocalDateString();
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `campus_life_${safeUsername}_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [activeProfile]);

  const validateImportContent = useCallback((jsonString: string): ImportValidationResult => {
    return storageService.validateImportContent(jsonString);
  }, []);

  const importProfileBackup = useCallback(
    (data: StorageExportData): { success: boolean; error?: string } => {
      return storageService.importProfileData(data);
    },
    []
  );

  const importProfileData = useCallback(
    (jsonString: string): { success: boolean; error?: string } => {
      const validation = storageService.validateImportContent(jsonString);
      if (!validation.isValid || !validation.parsedData) {
        return {
          success: false,
          error: validation.error || 'Invalid backup structure',
        };
      }
      return importProfileBackup(validation.parsedData);
    },
    [importProfileBackup]
  );

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        isLoading,
        isUsernameAvailable,
        createProfile,
        switchProfile,
        updateActiveProfile,
        deleteProfile,
        resetAllData,
        exportCurrentProfileData,
        validateImportContent,
        importProfileBackup,
        importProfileData,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
