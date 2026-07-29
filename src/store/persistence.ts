import AsyncStorage from '@react-native-async-storage/async-storage';
import { Application, MyProfile } from '../types';
import type { AppStore, RootState } from './index';

const KEYS = {
  favorites: '@talentmatch/favorites',
  savedJobs: '@talentmatch/savedJobs',
  applications: '@talentmatch/applications',
  profile: '@talentmatch/profile-v2',
  readNotifications: '@talentmatch/readNotifications',
} as const;

export interface PersistedState {
  favoriteIds?: string[];
  savedJobIds?: string[];
  applications?: Record<string, Application>;
  profile?: MyProfile;
  readNotificationIds?: string[];
}

function parse<T>(raw: string | null): T | undefined {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/** Read everything we persist in one round-trip; called once before first render. */
export async function loadPersistedState(): Promise<PersistedState> {
  try {
    const entries = await AsyncStorage.multiGet(Object.values(KEYS));
    const byKey = Object.fromEntries(entries);
    return {
      favoriteIds: parse<string[]>(byKey[KEYS.favorites]),
      savedJobIds: parse<string[]>(byKey[KEYS.savedJobs]),
      applications: parse<Record<string, Application>>(byKey[KEYS.applications]),
      profile: parse<MyProfile>(byKey[KEYS.profile]),
      readNotificationIds: parse<string[]>(byKey[KEYS.readNotifications]),
    };
  } catch {
    return {};
  }
}

/** Debounced write-behind: only slices that changed by reference are written. */
export function attachPersistence(store: AppStore): () => void {
  let last: Partial<Record<keyof typeof KEYS, unknown>> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;

  const flush = (state: RootState) => {
    const writes: Array<[string, string]> = [];
    const snapshot = {
      favorites: state.favorites.ids,
      savedJobs: state.jobs.savedIds,
      applications: state.jobs.applications,
      profile: state.profile.profile,
      readNotifications: state.notifications.readIds,
    };
    for (const [name, value] of Object.entries(snapshot) as Array<[keyof typeof KEYS, unknown]>) {
      if (last[name] !== value) {
        writes.push([KEYS[name], JSON.stringify(value)]);
        last[name] = value;
      }
    }
    if (writes.length > 0) {
      AsyncStorage.multiSet(writes).catch(() => {
        // A failed persist should never crash a mock app.
      });
    }
  };

  return store.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => flush(store.getState()), 400);
  });
}
