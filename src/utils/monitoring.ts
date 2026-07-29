import * as Sentry from '@sentry/react-native';

/**
 * Crash reporting + performance tracing + behavior breadcrumbs.
 *
 * Fully inert until a DSN is provided: set EXPO_PUBLIC_SENTRY_DSN in .env
 * (or your shell) and restart the dev server. In Expo Go only JS errors are
 * reported; a dev build adds native crash reporting.
 */
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const monitoringEnabled = Boolean(DSN);

/** Ties React Navigation transitions into Sentry performance tracing. */
export const navigationIntegration = Sentry.reactNavigationIntegration();

export function initMonitoring(): void {
  Sentry.init({
    dsn: DSN,
    enabled: monitoringEnabled,
    integrations: [navigationIntegration],
    // Mock app: trace everything so the showcase dashboard has data.
    tracesSampleRate: 1.0,
    sendDefaultPii: false,
  });
}

export const wrapRoot = Sentry.wrap;

/**
 * Record a user-behavior event. Events become Sentry breadcrumbs, so every
 * error report arrives with the trail of actions that led to it.
 */
export function track(event: string, data?: Record<string, unknown>): void {
  if (!monitoringEnabled) return;
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: event,
    data,
    level: 'info',
  });
}

/** Report a handled error without crashing the flow it happened in. */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (!monitoringEnabled) return;
  Sentry.captureException(error, { extra: context });
}
