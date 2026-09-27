import { ProfileMetaState, UserProfile } from './profile';

export interface StorageExportData {
  app?: string;
  version?: number | string;
  appName: string;
  exportVersion: string | number;
  exportedAt: string;
  profile: UserProfile;
  settings?: {
    currency?: string;
    theme?: string;
    residenceLabel?: string;
  };
  college?: {
    timetable?: unknown[];
    attendance?: unknown[];
    attendanceLogs?: unknown[];
    assignments?: unknown[];
    exams?: unknown[];
    projects?: unknown[];
  };
  money?: {
    expenses?: unknown[];
    budgetConfig?: unknown;
    customCategories?: unknown[];
  };
  travel?: {
    trips?: unknown[];
  };
  skills?: {
    skills?: unknown[];
  } | unknown[];
  data?: {
    college?: {
      timetable?: unknown[];
      attendance?: unknown[];
      attendanceLogs?: unknown[];
      assignments?: unknown[];
      exams?: unknown[];
      projects?: unknown[];
    };
    attendance?: unknown[];
    attendanceLogs?: unknown[];
    assignments?: unknown[];
    exams?: unknown[];
    projects?: unknown[];
    timetable?: unknown[];
    expenses?: unknown[];
    budgetConfig?: unknown;
    customCategories?: unknown[];
    trips?: unknown[];
    skills?: unknown[];
    settings?: {
      currency?: string;
      theme?: string;
      residenceLabel?: string;
    };
  };
  scopedData: Record<string, unknown>;
}

export interface ImportValidationResult {
  isValid: boolean;
  error?: string;
  profileName?: string;
  username?: string;
  version?: string | number;
  exportedAt?: string;
  itemCounts?: {
    expenses: number;
    trips: number;
    attendance: number;
    assignments: number;
    skills: number;
    timetable: number;
  };
  parsedData?: StorageExportData;
}

export interface IStorageService {
  // Profiles Meta operations
  getProfileMeta(): ProfileMetaState;
  saveProfileMeta(meta: ProfileMetaState): void;
  isUsernameAvailable(username: string, excludeProfileId?: string): boolean;
  createProfileRecord(data: { name: string; username: string; residenceLabel?: string; avatarColor?: string }): UserProfile;
  updateProfileRecord(profileId: string, updates: Partial<UserProfile>): UserProfile;

  // Profile Scoped Operations (Guarantees isolation between profiles)
  getItem<T>(profileId: string, key: string, defaultValue?: T): T | null;
  setItem<T>(profileId: string, key: string, value: T): void;
  removeItem(profileId: string, key: string): void;
  clearProfileData(profileId: string): void;

  // Export / Import
  exportProfileData(profileId: string): StorageExportData | null;
  validateImportContent(jsonString: string): ImportValidationResult;
  importProfileData(data: StorageExportData): { success: boolean; error?: string };

  // Full reset
  resetAllData(): void;
}
