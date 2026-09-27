import { IStorageService, StorageExportData, ImportValidationResult } from '@/types/storage';
import { ProfileMetaState, UserProfile, CurrencyCode } from '@/types/profile';
import {
  PROFILES_META_KEY,
  ACTIVE_PROFILE_KEY,
  getProfileScopedKey,
  isKeyBelongingToProfile,
  STORAGE_PREFIX,
} from './storageKeys';

const DEFAULT_AVATARS = [
  '#0D5C46', // Academic Pine
  '#1E3A8A', // Oxford Navy
  '#7C2D12', // Terracotta
  '#047857', // Forest
  '#4338CA', // Indigo
  '#B45309', // Amber
  '#334155', // Slate
];

class LocalStorageService implements IStorageService {
  private memoryStore: Map<string, string> = new Map();
  private lastRawMeta: string | null = null;
  private cachedMeta: ProfileMetaState = {
    activeProfileId: null,
    profiles: [],
    version: 1,
  };

  private isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__campus_life_storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getRaw(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      try {
        return window.localStorage.getItem(key);
      } catch (err) {
        console.warn(`[StorageService] Failed to read key: ${key}`, err);
        return this.memoryStore.get(key) || null;
      }
    }
    return this.memoryStore.get(key) || null;
  }

  private setRaw(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
      } catch (err) {
        console.warn(`[StorageService] Failed to write key: ${key}`, err);
      }
    }
    this.memoryStore.set(key, value);
  }

  private removeRaw(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[StorageService] Failed to remove key: ${key}`, err);
      }
    }
    this.memoryStore.delete(key);
  }

  // --- Profiles Metadata Management ---

  getProfileMeta(): ProfileMetaState {
    const raw = this.getRaw(PROFILES_META_KEY);
    if (!raw) {
      if (this.lastRawMeta === null) {
        return this.cachedMeta;
      }
      this.lastRawMeta = null;
      this.cachedMeta = {
        activeProfileId: null,
        profiles: [],
        version: 1,
      };
      return this.cachedMeta;
    }

    if (raw === this.lastRawMeta) {
      return this.cachedMeta;
    }

    try {
      const parsed = JSON.parse(raw) as ProfileMetaState;
      if (!parsed || !Array.isArray(parsed.profiles)) {
        this.lastRawMeta = raw;
        this.cachedMeta = { activeProfileId: null, profiles: [], version: 1 };
        return this.cachedMeta;
      }

      // Safe backfill of username for existing profiles without crashing
      let modified = false;
      const seenUsernames = new Set<string>();

      const sanitizedProfiles = parsed.profiles.map((p, idx) => {
        let username = (p.username || '').trim().toLowerCase();
        if (!username) {
          const baseName = (p.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
          username = idx === 0 ? baseName : `${baseName}${idx + 1}`;
          modified = true;
        }

        // Guarantee uniqueness among existing records
        let finalUsername = username;
        let counter = 1;
        while (seenUsernames.has(finalUsername)) {
          finalUsername = `${username}${counter}`;
          counter++;
          modified = true;
        }
        seenUsernames.add(finalUsername);

        return {
          ...p,
          username: finalUsername,
        };
      });

      if (modified) {
        parsed.profiles = sanitizedProfiles;
        const serialized = JSON.stringify(parsed);
        this.setRaw(PROFILES_META_KEY, serialized);
        this.lastRawMeta = serialized;
      } else {
        this.lastRawMeta = raw;
      }

      this.cachedMeta = parsed;
      return this.cachedMeta;
    } catch (err) {
      console.error('[StorageService] Error parsing profiles metadata', err);
      this.lastRawMeta = raw;
      this.cachedMeta = {
        activeProfileId: null,
        profiles: [],
        version: 1,
      };
      return this.cachedMeta;
    }
  }

  saveProfileMeta(meta: ProfileMetaState): void {
    const serialized = JSON.stringify(meta);
    this.lastRawMeta = serialized;
    this.cachedMeta = meta;
    this.setRaw(PROFILES_META_KEY, serialized);
    if (meta.activeProfileId) {
      this.setRaw(ACTIVE_PROFILE_KEY, meta.activeProfileId);
    } else {
      this.removeRaw(ACTIVE_PROFILE_KEY);
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('campus_life_profile_change'));
    }
  }

  isUsernameAvailable(username: string, excludeProfileId?: string): boolean {
    const norm = (username || '').trim().toLowerCase();
    if (!norm) return false;

    const meta = this.getProfileMeta();
    return !meta.profiles.some(
      (p) => p.username.toLowerCase() === norm && p.id !== excludeProfileId
    );
  }

  createProfileRecord(data: {
    name: string;
    username: string;
    residenceLabel?: string;
    avatarColor?: string;
  }): UserProfile {
    const trimmedName = data.name.trim();
    const normUsername = data.username.trim().toLowerCase();

    if (!trimmedName) {
      throw new Error('Please enter a display name.');
    }
    if (!normUsername) {
      throw new Error('Please enter a username.');
    }

    // Enforce username uniqueness at data-save layer
    if (!this.isUsernameAvailable(normUsername)) {
      throw new Error('This username already exists. Please choose another username.');
    }

    const meta = this.getProfileMeta();
    const colorIndex = meta.profiles.length % DEFAULT_AVATARS.length;
    const avatarColor = data.avatarColor || DEFAULT_AVATARS[colorIndex];

    // Generate unique internal profileId independently from username
    const profileId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newProfile: UserProfile = {
      id: profileId,
      username: normUsername,
      name: trimmedName,
      avatarColor,
      currency: 'INR',
      theme: 'light',
      residenceLabel: data.residenceLabel?.trim() || 'Hostel / Campus',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    const updatedProfiles = [...meta.profiles, newProfile];
    const newMeta: ProfileMetaState = {
      activeProfileId: newProfile.id,
      profiles: updatedProfiles,
      version: 1,
    };

    this.saveProfileMeta(newMeta);
    return newProfile;
  }

  updateProfileRecord(profileId: string, updates: Partial<UserProfile>): UserProfile {
    const meta = this.getProfileMeta();
    const existingIndex = meta.profiles.findIndex((p) => p.id === profileId);
    if (existingIndex < 0) {
      throw new Error('Profile not found.');
    }

    const existing = meta.profiles[existingIndex];

    // Check username uniqueness if updating username
    if (updates.username !== undefined) {
      const normUsername = updates.username.trim().toLowerCase();
      if (!normUsername) {
        throw new Error('Username cannot be empty.');
      }
      if (!this.isUsernameAvailable(normUsername, profileId)) {
        throw new Error('This username already exists. Please choose another username.');
      }
      updates.username = normUsername;
    }

    const updatedProfile: UserProfile = {
      ...existing,
      ...updates,
      lastActiveAt: new Date().toISOString(),
    };

    meta.profiles[existingIndex] = updatedProfile;
    this.saveProfileMeta(meta);
    return updatedProfile;
  }

  createProfile(data: {
    name: string;
    username: string;
    residenceLabel?: string;
    avatarColor?: string;
    currency?: CurrencyCode;
    theme?: 'light' | 'dark' | 'system';
  }): UserProfile {
    const prof = this.createProfileRecord(data);
    if (data.currency || data.theme) {
      return this.updateProfileRecord(prof.id, {
        ...(data.currency ? { currency: data.currency } : {}),
        ...(data.theme ? { theme: data.theme } : {}),
      });
    }
    return prof;
  }

  getProfile(profileId: string): UserProfile | null {
    const meta = this.getProfileMeta();
    return meta.profiles.find((p) => p.id === profileId) || null;
  }

  deleteProfile(profileId: string): boolean {
    const currentMeta = this.getProfileMeta();
    const remaining = currentMeta.profiles.filter((p) => p.id !== profileId);
    this.clearProfileData(profileId);
    let nextActiveId: string | null = null;
    if (remaining.length > 0) {
      nextActiveId = remaining[0].id;
    }
    const newMeta: ProfileMetaState = {
      activeProfileId: nextActiveId,
      profiles: remaining,
      version: 1,
    };
    this.saveProfileMeta(newMeta);
    return true;
  }

  // --- Scoped Storage Operations ---

  getItem<T>(profileId: string, subKey: string, defaultValue: T): T;
  getItem<T>(profileId: string, subKey: string, defaultValue?: T): T | null;
  getItem<T>(profileId: string, subKey: string, defaultValue?: T): T | null {
    const fallback = defaultValue !== undefined ? defaultValue : null;
    if (!profileId) return fallback;
    const scopedKey = getProfileScopedKey(profileId, subKey);
    const raw = this.getRaw(scopedKey);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[StorageService] Failed to parse scoped item ${scopedKey}`, err);
      return fallback;
    }
  }

  setItem<T>(profileId: string, subKey: string, value: T): void {
    if (!profileId) {
      console.warn('[StorageService] Cannot set item without active profileId');
      return;
    }
    const scopedKey = getProfileScopedKey(profileId, subKey);
    try {
      this.setRaw(scopedKey, JSON.stringify(value));
    } catch (err) {
      console.error(`[StorageService] Failed to serialize scoped item ${scopedKey}`, err);
    }
  }

  removeItem(profileId: string, subKey: string): void {
    if (!profileId) return;
    const scopedKey = getProfileScopedKey(profileId, subKey);
    this.removeRaw(scopedKey);
  }

  clearProfileData(profileId: string): void {
    if (!profileId) return;
    if (this.isLocalStorageAvailable()) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && isKeyBelongingToProfile(key, profileId)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      } catch (err) {
        console.warn('[StorageService] Failed while clearing profile data in localStorage', err);
      }
    }

    // Also clear memory store
    for (const key of Array.from(this.memoryStore.keys())) {
      if (isKeyBelongingToProfile(key, profileId)) {
        this.memoryStore.delete(key);
      }
    }
  }

  // --- Export and Import ---

  exportProfileData(profileId: string): StorageExportData | null {
    const meta = this.getProfileMeta();
    const profile = meta.profiles.find((p) => p.id === profileId);
    if (!profile) return null;

    const scopedData: Record<string, unknown> = {};
    const prefix = `${STORAGE_PREFIX}p_${profileId}_`;

    if (this.isLocalStorageAvailable()) {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            const subKey = key.slice(prefix.length);
            const val = window.localStorage.getItem(key);
            if (val) {
              try {
                scopedData[subKey] = JSON.parse(val);
              } catch {
                scopedData[subKey] = val;
              }
            }
          }
        }
      } catch (err) {
        console.warn('[StorageService] Error reading localStorage during export', err);
      }
    }

    // Include memory store entries
    for (const [key, val] of this.memoryStore.entries()) {
      if (key.startsWith(prefix)) {
        const subKey = key.slice(prefix.length);
        if (!scopedData[subKey]) {
          try {
            scopedData[subKey] = JSON.parse(val);
          } catch {
            scopedData[subKey] = val;
          }
        }
      }
    }

    const timetable = Array.isArray(scopedData['college_timetable_v2'])
      ? (scopedData['college_timetable_v2'] as unknown[])
      : [];
    const attendance = Array.isArray(scopedData['college_attendance_v2'])
      ? (scopedData['college_attendance_v2'] as unknown[])
      : [];
    const attendanceLogs = Array.isArray(scopedData['college_attendance_logs_v2'])
      ? (scopedData['college_attendance_logs_v2'] as unknown[])
      : [];
    const assignments = Array.isArray(scopedData['college_assignments_v2'])
      ? (scopedData['college_assignments_v2'] as unknown[])
      : [];
    const exams = Array.isArray(scopedData['college_exams_v2'])
      ? (scopedData['college_exams_v2'] as unknown[])
      : [];
    const projects = Array.isArray(scopedData['college_projects_v2'])
      ? (scopedData['college_projects_v2'] as unknown[])
      : [];
    const expenses = Array.isArray(scopedData['expenses_v2'])
      ? (scopedData['expenses_v2'] as unknown[])
      : [];
    const budgetConfig = scopedData['budget_config_v2'] || null;
    const customCategories = Array.isArray(scopedData['custom_categories_v2'])
      ? (scopedData['custom_categories_v2'] as unknown[])
      : [];
    const trips = Array.isArray(scopedData['trips_v2'])
      ? (scopedData['trips_v2'] as unknown[])
      : [];
    const skills = Array.isArray(scopedData['skills_v3'])
      ? (scopedData['skills_v3'] as unknown[])
      : [];

    return {
      app: 'Campus Life',
      version: 1,
      appName: 'Campus Life',
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      profile,
      settings: {
        currency: profile.currency,
        theme: profile.theme,
        residenceLabel: profile.residenceLabel,
      },
      college: {
        timetable,
        attendance,
        attendanceLogs,
        assignments,
        exams,
        projects,
      },
      money: {
        expenses,
        budgetConfig,
        customCategories,
      },
      travel: {
        trips,
      },
      skills: {
        skills,
      },
      data: {
        college: {
          timetable,
          attendance,
          attendanceLogs,
          assignments,
          exams,
          projects,
        },
        timetable,
        attendance,
        attendanceLogs,
        assignments,
        exams,
        projects,
        expenses,
        budgetConfig,
        customCategories,
        trips,
        skills,
        settings: {
          currency: profile.currency,
          theme: profile.theme,
          residenceLabel: profile.residenceLabel,
        },
      },
      scopedData,
    };
  }

  validateImportContent(jsonString: string): ImportValidationResult {
    if (!jsonString || typeof jsonString !== 'string') {
      return { isValid: false, error: 'Empty or invalid file content.' };
    }

    let rawParsed: unknown;
    try {
      rawParsed = JSON.parse(jsonString);
    } catch {
      return {
        isValid: false,
        error: 'Malformed JSON: The file is not a valid JSON document.',
      };
    }

    if (!rawParsed || typeof rawParsed !== 'object') {
      return { isValid: false, error: 'JSON does not contain a valid backup object.' };
    }

    const parsed = rawParsed as Record<string, unknown>;

    // Validate application identifier first
    const appIdentifier = (parsed.app as string) || (parsed.appName as string);
    if (appIdentifier && !['Campus Life', 'Student Life OS'].includes(appIdentifier)) {
      return {
        isValid: false,
        error: `Unrecognized application: "${appIdentifier}". This backup is not compatible with Campus Life.`,
      };
    }

    // Check required fields
    const profile = parsed.profile as UserProfile | undefined;
    if (!profile || typeof profile !== 'object' || !profile.name) {
      return {
        isValid: false,
        error: 'Invalid backup structure: Missing student profile information.',
      };
    }

    const scoped = (parsed.scopedData as Record<string, unknown>) || {};
    const structured = (parsed.data as Record<string, unknown>) || {};

    const rootCollege = (parsed.college as Record<string, unknown>) || {};
    const rootMoney = (parsed.money as Record<string, unknown>) || {};
    const rootTravel = (parsed.travel as Record<string, unknown>) || {};
    const rootSkills = (parsed.skills as Record<string, unknown>) || {};

    const expensesCount = Array.isArray(rootMoney.expenses)
      ? rootMoney.expenses.length
      : Array.isArray(structured.expenses)
      ? structured.expenses.length
      : Array.isArray(scoped.expenses_v2)
      ? scoped.expenses_v2.length
      : 0;

    const tripsCount = Array.isArray(rootTravel.trips)
      ? rootTravel.trips.length
      : Array.isArray(structured.trips)
      ? structured.trips.length
      : Array.isArray(scoped.trips_v2)
      ? scoped.trips_v2.length
      : 0;

    const attendanceCount = Array.isArray(rootCollege.attendance)
      ? rootCollege.attendance.length
      : Array.isArray(structured.attendance)
      ? structured.attendance.length
      : Array.isArray(scoped.college_attendance_v2)
      ? scoped.college_attendance_v2.length
      : 0;

    const assignmentsCount = Array.isArray(rootCollege.assignments)
      ? rootCollege.assignments.length
      : Array.isArray(structured.assignments)
      ? structured.assignments.length
      : Array.isArray(scoped.college_assignments_v2)
      ? scoped.college_assignments_v2.length
      : 0;

    const skillsCount = Array.isArray(rootSkills.skills)
      ? rootSkills.skills.length
      : Array.isArray(parsed.skills)
      ? (parsed.skills as unknown[]).length
      : Array.isArray(structured.skills)
      ? structured.skills.length
      : Array.isArray(scoped.skills_v3)
      ? scoped.skills_v3.length
      : 0;

    const timetableCount = Array.isArray(rootCollege.timetable)
      ? rootCollege.timetable.length
      : Array.isArray(structured.timetable)
      ? structured.timetable.length
      : Array.isArray(scoped.college_timetable_v2)
      ? scoped.college_timetable_v2.length
      : 0;

    return {
      isValid: true,
      profileName: profile.name,
      username: profile.username || profile.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      version: (parsed.version as number) || (parsed.exportVersion as string | number) || 1,
      exportedAt: parsed.exportedAt as string | undefined,
      itemCounts: {
        expenses: expensesCount,
        trips: tripsCount,
        attendance: attendanceCount,
        assignments: assignmentsCount,
        skills: skillsCount,
        timetable: timetableCount,
      },
      parsedData: parsed as unknown as StorageExportData,
    };
  }

  importProfileData(data: StorageExportData): { success: boolean; error?: string } {
    if (!data || !data.profile || !data.profile.id || !data.profile.name) {
      return { success: false, error: 'Invalid profile data format.' };
    }

    try {
      const meta = this.getProfileMeta();
      const profileToSave = { ...data.profile };

      // Ensure username is present
      if (!profileToSave.username) {
        profileToSave.username = profileToSave.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      }

      // Check if username collides with a DIFFERENT existing profile
      const usernameNorm = profileToSave.username.toLowerCase();
      const colliding = meta.profiles.find(
        (p) => p.username.toLowerCase() === usernameNorm && p.id !== profileToSave.id
      );

      if (colliding) {
        profileToSave.username = `${usernameNorm}_${Math.random().toString(36).substring(2, 5)}`;
      }

      const existingIdx = meta.profiles.findIndex((p) => p.id === profileToSave.id);
      if (existingIdx >= 0) {
        meta.profiles[existingIdx] = profileToSave;
      } else {
        meta.profiles.push(profileToSave);
      }
      meta.activeProfileId = profileToSave.id;
      this.saveProfileMeta(meta);

      // Restore scoped data
      const scoped = data.scopedData || {};
      const structured = (data.data || {}) as Record<string, unknown>;
      const raw = data as unknown as Record<string, unknown>;
      const rootCollege = (raw.college as Record<string, unknown>) || {};
      const rootMoney = (raw.money as Record<string, unknown>) || {};
      const rootTravel = (raw.travel as Record<string, unknown>) || {};
      const rootSkills = (raw.skills as Record<string, unknown>) || {};

      const keysToRestore: Record<string, unknown> = {
        ...scoped,
      };

      if (!keysToRestore['college_timetable_v2']) {
        const val = rootCollege.timetable || structured.timetable;
        if (val) keysToRestore['college_timetable_v2'] = val;
      }
      if (!keysToRestore['college_attendance_v2']) {
        const val = rootCollege.attendance || structured.attendance;
        if (val) keysToRestore['college_attendance_v2'] = val;
      }
      if (!keysToRestore['college_attendance_logs_v2']) {
        const val = rootCollege.attendanceLogs || structured.attendanceLogs;
        if (val) keysToRestore['college_attendance_logs_v2'] = val;
      }
      if (!keysToRestore['college_assignments_v2']) {
        const val = rootCollege.assignments || structured.assignments;
        if (val) keysToRestore['college_assignments_v2'] = val;
      }
      if (!keysToRestore['college_exams_v2']) {
        const val = rootCollege.exams || structured.exams;
        if (val) keysToRestore['college_exams_v2'] = val;
      }
      if (!keysToRestore['college_projects_v2']) {
        const val = rootCollege.projects || structured.projects;
        if (val) keysToRestore['college_projects_v2'] = val;
      }

      if (!keysToRestore['expenses_v2']) {
        const val = rootMoney.expenses || structured.expenses;
        if (val) keysToRestore['expenses_v2'] = val;
      }
      if (!keysToRestore['budget_config_v2']) {
        const val = rootMoney.budgetConfig || structured.budgetConfig;
        if (val) keysToRestore['budget_config_v2'] = val;
      }
      if (!keysToRestore['custom_categories_v2']) {
        const val = rootMoney.customCategories || structured.customCategories;
        if (val) keysToRestore['custom_categories_v2'] = val;
      }

      if (!keysToRestore['trips_v2']) {
        const val = rootTravel.trips || structured.trips;
        if (val) keysToRestore['trips_v2'] = val;
      }

      if (!keysToRestore['skills_v3']) {
        const val = rootSkills.skills || (Array.isArray(raw.skills) ? raw.skills : null) || structured.skills;
        if (val) keysToRestore['skills_v3'] = val;
      }

      for (const [subKey, val] of Object.entries(keysToRestore)) {
        this.setItem(profileToSave.id, subKey, val);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown import failure',
      };
    }
  }

  // --- Reset All Data ---

  resetAllData(): void {
    if (this.isLocalStorageAvailable()) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      } catch (err) {
        console.warn('[StorageService] Error during full reset', err);
      }
    }
    this.memoryStore.clear();
    this.lastRawMeta = null;
    this.cachedMeta = {
      activeProfileId: null,
      profiles: [],
      version: 1,
    };
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('campus_life_profile_change'));
    }
  }
}

export const storageService = new LocalStorageService();
