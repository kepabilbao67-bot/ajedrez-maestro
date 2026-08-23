import AsyncStorage from '@react-native-async-storage/async-storage';

import { PROFILE_STORAGE_KEY } from '@/profile/profile-storage-core';
import { VISUAL_PREFERENCES_KEY } from '@/theme/visual-preferences-core';

const ASYNC_STORAGE_KEYS = ['@ajedrezpro_chess_stats', '@ajedrezpro_onboarding'] as const;

/** Elimina únicamente la información local creada por AjedrezPro. */
export async function clearAjedrezProLocalData(): Promise<void> {
  await Promise.all(ASYNC_STORAGE_KEYS.map((key) => AsyncStorage.removeItem(key)));
  globalThis.localStorage?.removeItem(PROFILE_STORAGE_KEY);
  globalThis.localStorage?.removeItem(VISUAL_PREFERENCES_KEY);
}
