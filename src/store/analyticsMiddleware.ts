import { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { track } from '../utils/monitoring';

/**
 * Centralized behavior tracking: user-intent actions flowing through Redux
 * become Sentry breadcrumbs, so no screen needs its own analytics calls.
 * Payloads are reduced to non-PII identifiers/flags before tracking.
 */
const TRACKED: Record<string, (payload: unknown) => Record<string, unknown> | undefined> = {
  'favorites/toggleFavorite': (payload) => ({ talentId: payload as string }),
  'jobs/toggleSaveJob': (payload) => ({ jobId: payload as string }),
  'jobs/applyToJob/pending': () => undefined,
  'jobs/applyToJob/fulfilled': (payload) => ({
    jobId: (payload as { jobId?: string })?.jobId,
  }),
  'inbox/sendMessage/pending': () => undefined,
  'talents/setRoleFilter': (payload) => ({ role: payload as string }),
  'jobs/setTypeFilter': (payload) => ({ type: payload as string }),
  'search/addRecent': () => undefined,
  'notifications/markAllRead': () => undefined,
  'profile/updateProfile': () => undefined,
};

export const analyticsMiddleware: Middleware = () => (next) => (action) => {
  const { type, payload } = action as PayloadAction<unknown>;
  const toData = TRACKED[type];
  if (toData) track(type, toData(payload));
  return next(action);
};
