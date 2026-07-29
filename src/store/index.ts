import { configureStore } from '@reduxjs/toolkit';
import type { PersistedState } from './persistence';
import favoritesReducer, { favoritesInitialState } from './slices/favoritesSlice';
import inboxReducer from './slices/inboxSlice';
import jobsReducer, { jobsInitialState } from './slices/jobsSlice';
import notificationsReducer, { notificationsInitialState } from './slices/notificationsSlice';
import profileReducer, { profileInitialState } from './slices/profileSlice';
import searchReducer from './slices/searchSlice';
import talentsReducer from './slices/talentsSlice';

export function makeStore(persisted: PersistedState = {}) {
  return configureStore({
    reducer: {
      talents: talentsReducer,
      search: searchReducer,
      favorites: favoritesReducer,
      jobs: jobsReducer,
      inbox: inboxReducer,
      notifications: notificationsReducer,
      profile: profileReducer,
    },
    preloadedState: {
      favorites: {
        ...favoritesInitialState,
        ids: persisted.favoriteIds ?? favoritesInitialState.ids,
      },
      jobs: {
        ...jobsInitialState,
        savedIds: persisted.savedJobIds ?? jobsInitialState.savedIds,
        applications: persisted.applications ?? jobsInitialState.applications,
      },
      notifications: {
        ...notificationsInitialState,
        readIds: persisted.readNotificationIds ?? notificationsInitialState.readIds,
      },
      profile: {
        ...profileInitialState,
        profile: persisted.profile ?? profileInitialState.profile,
      },
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
