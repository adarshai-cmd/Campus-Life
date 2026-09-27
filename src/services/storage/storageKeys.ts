export const STORAGE_PREFIX = 'student_os_';
export const PROFILES_META_KEY = `${STORAGE_PREFIX}profiles_meta_v1`;
export const ACTIVE_PROFILE_KEY = `${STORAGE_PREFIX}active_profile_id_v1`;

export function getProfileScopedKey(profileId: string, subKey: string): string {
  return `${STORAGE_PREFIX}p_${profileId}_${subKey}`;
}

export function isKeyBelongingToProfile(key: string, profileId: string): boolean {
  return key.startsWith(`${STORAGE_PREFIX}p_${profileId}_`);
}
