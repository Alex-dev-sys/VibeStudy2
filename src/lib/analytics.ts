export type AnalyticsEventName =
  | 'auth_viewed'
  | 'demo_started'
  | 'magic_link_requested'
  | 'oauth_google_started'
  | 'signup_completed'
  | 'onboarding_completed'
  | 'first_lesson_started'
  | 'task_completed'
  | 'paywall_viewed'
  | 'checkout_started'
  | 'subscription_started';

type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    __VIBESTUDY_ANALYTICS_DEBUG__?: boolean;
  }
}

let identifiedUserId: string | null = null;

function canUseWindow() {
  return typeof window !== 'undefined';
}

function isDebugEnabled() {
  return Boolean(import.meta.env.DEV || window.__VIBESTUDY_ANALYTICS_DEBUG__);
}

export function trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  const record = {
    event,
    timestamp: new Date().toISOString(),
    userId: identifiedUserId,
    ...payload,
  };

  if (canUseWindow()) {
    window.dataLayer?.push(record);
    window.dispatchEvent(new CustomEvent('vibestudy:analytics', { detail: record }));

    if (isDebugEnabled()) {
      console.info('[analytics]', record);
    }
  }

  return record;
}

export function identifyAnalyticsUser(userId: string, traits: AnalyticsPayload = {}) {
  identifiedUserId = userId;

  if (canUseWindow() && isDebugEnabled()) {
    console.info('[analytics:identify]', {
      userId,
      traits,
    });
  }
}

export function resetAnalyticsUser() {
  identifiedUserId = null;
}
