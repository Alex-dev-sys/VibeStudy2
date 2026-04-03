import { supabase } from './supabase';
import type {
    BillingEntitlementCode,
    BillingFeatureCode,
    BillingPlanCode,
    BillingSubscriptionStatus,
    SubscriptionAccessState,
} from '../types/billing.types';
import type {
    EntitlementRecord,
    FeatureUsageRecord,
    PaymentOrderRecord,
    SubscriptionRecord,
} from '../types/database.types';

export interface BillingOverview {
    subscription: SubscriptionRecord | null;
    entitlements: EntitlementRecord[];
    featureUsage: FeatureUsageRecord[];
    paymentOrders: PaymentOrderRecord[];
    access: SubscriptionAccessState;
}

export interface CheckoutSessionResult {
    sessionId: string;
    url: string;
    checkoutUrl: string | null;
    universalUrl: string | null;
    deeplink: string | null;
    expiresAt: string | null;
}

export interface CryptoPlanDefinition {
    planCode: Exclude<BillingPlanCode, 'free'>;
    title: string;
    price: string;
    cadence: string;
    badge?: string;
    subtitle: string;
    features: string[];
    checkoutLabel: string;
}

export const FREE_TRACK_DAY_LIMIT = 3;
export const FREE_DAILY_HINT_LIMIT = 3;

export const CRYPTO_PLAN_DEFINITIONS: CryptoPlanDefinition[] = [
    {
        planCode: 'pro_monthly',
        title: '30 Days',
        price: '29 USDT',
        cadence: 'one-time',
        subtitle: 'Hosted Binance Pay checkout for the full product, with no auto-renew attached to the purchase.',
        features: [
            'All tracks and all lesson days',
            'Unlimited AI hints and review summaries',
            'Cinematic hosted checkout through Binance Pay',
        ],
        checkoutLabel: 'Continue to secure Binance Pay',
    },
    {
        planCode: 'pro_three_month',
        title: '90 Days',
        price: '79 USDT',
        cadence: 'one-time',
        badge: 'Best value',
        subtitle: 'Longer premium access at the best effective monthly price, still as a one-time Binance Pay purchase.',
        features: [
            'Everything from 30 Days',
            'Lower effective monthly cost',
            'Best-value hosted Binance Pay option',
        ],
        checkoutLabel: 'Continue to secure Binance Pay',
    },
];

const PAID_ACCESS_STATUSES: BillingSubscriptionStatus[] = ['active', 'trialing', 'past_due'];

function isMissingBillingTableError(error: { message?: string } | null) {
    const message = error?.message?.toLowerCase() ?? '';
    return (
        message.includes('subscriptions') ||
        message.includes('entitlements') ||
        message.includes('feature_usage') ||
        message.includes('payment_orders') ||
        message.includes('schema cache')
    );
}

function hasUnexpiredWindow(currentPeriodEnd: string | null) {
    if (!currentPeriodEnd) {
        return true;
    }

    return new Date(currentPeriodEnd).getTime() > Date.now();
}

export function deriveAccessState(subscription: SubscriptionRecord | null): SubscriptionAccessState {
    if (!subscription) {
        return {
            planCode: 'free',
            status: 'incomplete',
            canAccessPaidFeatures: false,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
        };
    }

    const effectiveStatus =
        PAID_ACCESS_STATUSES.includes(subscription.status) && !hasUnexpiredWindow(subscription.current_period_end)
            ? 'expired'
            : subscription.status;

    return {
        planCode: effectiveStatus === 'expired' ? 'free' : subscription.plan_code,
        status: effectiveStatus,
        canAccessPaidFeatures: PAID_ACCESS_STATUSES.includes(subscription.status) && hasUnexpiredWindow(subscription.current_period_end),
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
}

export async function fetchBillingOverview(userId: string): Promise<BillingOverview> {
    const [subscriptionResult, entitlementsResult, usageResult, paymentOrdersResult] = await Promise.all([
        supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1),
        supabase
            .from('entitlements')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        supabase
            .from('feature_usage')
            .select('*')
            .eq('user_id', userId)
            .order('usage_date', { ascending: false })
            .limit(30),
        supabase
            .from('payment_orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    if (subscriptionResult.error || entitlementsResult.error || usageResult.error || paymentOrdersResult.error) {
        const firstError =
            subscriptionResult.error ?? entitlementsResult.error ?? usageResult.error ?? paymentOrdersResult.error;

        if (isMissingBillingTableError(firstError)) {
            return {
                subscription: null,
                entitlements: [],
                featureUsage: [],
                paymentOrders: [],
                access: deriveAccessState(null),
            };
        }

        throw firstError;
    }

    const subscription = (subscriptionResult.data?.[0] as SubscriptionRecord | undefined) ?? null;
    const entitlements = (entitlementsResult.data ?? []) as EntitlementRecord[];
    const featureUsage = (usageResult.data ?? []) as FeatureUsageRecord[];
    const paymentOrders = (paymentOrdersResult.data ?? []) as PaymentOrderRecord[];

    return {
        subscription,
        entitlements,
        featureUsage,
        paymentOrders,
        access: deriveAccessState(subscription),
    };
}

export async function createCheckoutSession(
    planCode: Exclude<BillingPlanCode, 'free'>,
    options?: {
        successPath?: string;
        cancelPath?: string;
    }
): Promise<CheckoutSessionResult> {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
            planCode,
            successPath: options?.successPath,
            cancelPath: options?.cancelPath,
        },
    });

    if (error) {
        throw error;
    }

    if (!data?.url || !data?.sessionId) {
        throw new Error('Binance checkout was created without a redirect URL.');
    }

    return {
        sessionId: data.sessionId as string,
        url: data.url as string,
        checkoutUrl: (data.checkoutUrl as string | null | undefined) ?? null,
        universalUrl: (data.universalUrl as string | null | undefined) ?? null,
        deeplink: (data.deeplink as string | null | undefined) ?? null,
        expiresAt: (data.expiresAt as string | null | undefined) ?? null,
    };
}

export function hasEntitlement(
    entitlements: EntitlementRecord[],
    entitlementCode: BillingEntitlementCode
) {
    return entitlements.some((entitlement) => entitlement.entitlement_code === entitlementCode && entitlement.active);
}

export function getFeatureUsageCount(
    featureUsage: FeatureUsageRecord[],
    featureCode: BillingFeatureCode
) {
    return featureUsage
        .filter((usage) => usage.feature_code === featureCode)
        .reduce((total, usage) => total + usage.usage_count, 0);
}

export function canAccessTrack(
    access: SubscriptionAccessState,
    selectedTrackId: string | null,
    trackId: string
) {
    if (access.canAccessPaidFeatures || !selectedTrackId) {
        return true;
    }

    return selectedTrackId === trackId;
}

export function canAccessLessonDay(access: SubscriptionAccessState, day: number) {
    if (access.canAccessPaidFeatures) {
        return true;
    }

    return day <= FREE_TRACK_DAY_LIMIT;
}
