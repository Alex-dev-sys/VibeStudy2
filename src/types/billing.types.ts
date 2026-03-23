export const BILLING_PROVIDERS = ['cryptomus', 'stripe', 'yookassa', 'manual'] as const;
export type BillingProvider = (typeof BILLING_PROVIDERS)[number];

export const BILLING_PLAN_CODES = ['free', 'pro_monthly', 'pro_three_month'] as const;
export type BillingPlanCode = (typeof BILLING_PLAN_CODES)[number];

export const BILLING_SUBSCRIPTION_STATUSES = [
    'incomplete',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'expired',
    'paused',
] as const;
export type BillingSubscriptionStatus = (typeof BILLING_SUBSCRIPTION_STATUSES)[number];

export const BILLING_ENTITLEMENT_CODES = [
    'core_access',
    'all_tracks',
    'unlimited_lessons',
    'unlimited_ai_hints',
    'unlimited_ai_reviews',
    'analytics_access',
    'streak_recovery',
] as const;
export type BillingEntitlementCode = (typeof BILLING_ENTITLEMENT_CODES)[number];

export const BILLING_FEATURE_CODES = ['lesson_generation', 'ai_hint', 'ai_review'] as const;
export type BillingFeatureCode = (typeof BILLING_FEATURE_CODES)[number];

export const MANUAL_PAYMENT_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ManualPaymentRequestStatus = (typeof MANUAL_PAYMENT_REQUEST_STATUSES)[number];

export interface SubscriptionAccessState {
    planCode: BillingPlanCode;
    status: BillingSubscriptionStatus;
    canAccessPaidFeatures: boolean;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
}
