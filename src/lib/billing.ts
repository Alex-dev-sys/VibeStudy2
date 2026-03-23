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
    ManualPaymentRequestInsert,
    ManualPaymentRequestRecord,
    SubscriptionRecord,
} from '../types/database.types';

export interface BillingOverview {
    subscription: SubscriptionRecord | null;
    entitlements: EntitlementRecord[];
    featureUsage: FeatureUsageRecord[];
    paymentRequests: ManualPaymentRequestRecord[];
    access: SubscriptionAccessState;
}

export interface CheckoutSessionResult {
    sessionId: string;
    url: string;
}

export interface ManualPaymentRequestSubmission {
    planCode: Exclude<BillingPlanCode, 'free'>;
    txHash: string;
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
export const MANUAL_PAYMENT_WALLET_ADDRESS = 'TWZVDV68FQxw1EPriHTzEAsw7U6kHjBzMh';
export const MANUAL_PAYMENT_NETWORK_LABEL = 'USDT (TRC20)';
export const MANUAL_PAYMENT_ASSET_SYMBOL = 'USDT';
export const MANUAL_PAYMENT_EXPLORER_BASE_URL = 'https://tronscan.org/#/transaction/';

export const CRYPTO_PLAN_DEFINITIONS: CryptoPlanDefinition[] = [
    {
        planCode: 'pro_monthly',
        title: 'Monthly',
        price: '29 USDT',
        cadence: 'month',
        subtitle: 'Send USDT to the project wallet, then submit the transaction hash for manual review.',
        features: [
            'All tracks and all lesson days',
            'AI hints and reviews without the free limit after approval',
            'Direct wallet payment without an external checkout',
        ],
        checkoutLabel: 'Submit tx hash',
    },
    {
        planCode: 'pro_three_month',
        title: '3 months',
        price: '79 USDT',
        cadence: '3 months',
        badge: 'Best value',
        subtitle: 'Pay once for a longer access window, then submit the transaction hash for review.',
        features: [
            'Everything from Monthly',
            'Longer access window after approval',
            'Best-value direct wallet plan in the current launch',
        ],
        checkoutLabel: 'Submit tx hash',
    },
];

const PAID_ACCESS_STATUSES: BillingSubscriptionStatus[] = ['active', 'trialing', 'past_due'];

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

    return {
        planCode: subscription.plan_code,
        status: subscription.status,
        canAccessPaidFeatures: PAID_ACCESS_STATUSES.includes(subscription.status),
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
}

function isMissingBillingTableError(error: { message?: string } | null) {
    const message = error?.message?.toLowerCase() ?? '';
    return (
        message.includes('subscriptions') ||
        message.includes('entitlements') ||
        message.includes('feature_usage') ||
        message.includes('manual_payment_requests') ||
        message.includes('schema cache')
    );
}

export async function fetchBillingOverview(userId: string): Promise<BillingOverview> {
    const [subscriptionResult, entitlementsResult, usageResult] = await Promise.all([
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
    ]);

    if (subscriptionResult.error || entitlementsResult.error || usageResult.error) {
        const firstError = subscriptionResult.error ?? entitlementsResult.error ?? usageResult.error;

        if (isMissingBillingTableError(firstError)) {
            return {
                subscription: null,
                entitlements: [],
                featureUsage: [],
                paymentRequests: [],
                access: deriveAccessState(null),
            };
        }

        throw firstError;
    }

    const subscription = (subscriptionResult.data?.[0] as SubscriptionRecord | undefined) ?? null;
    const entitlements = (entitlementsResult.data ?? []) as EntitlementRecord[];
    const featureUsage = (usageResult.data ?? []) as FeatureUsageRecord[];
    const paymentRequestsResult = await supabase
        .from('manual_payment_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (paymentRequestsResult.error) {
        if (isMissingBillingTableError(paymentRequestsResult.error)) {
            return {
                subscription,
                entitlements,
                featureUsage,
                paymentRequests: [],
                access: deriveAccessState(subscription),
            };
        }

        throw paymentRequestsResult.error;
    }

    const paymentRequests = (paymentRequestsResult.data ?? []) as ManualPaymentRequestRecord[];

    return {
        subscription,
        entitlements,
        featureUsage,
        paymentRequests,
        access: deriveAccessState(subscription),
    };
}

export function getPlanAmount(planCode: Exclude<BillingPlanCode, 'free'>) {
    switch (planCode) {
        case 'pro_monthly':
            return '29';
        case 'pro_three_month':
            return '79';
    }
}

export function getExplorerUrl(txHash: string) {
    return `${MANUAL_PAYMENT_EXPLORER_BASE_URL}${txHash}`;
}

export function normalizeTxHash(txHash: string) {
    return txHash.trim();
}

export async function submitManualPaymentRequest({
    planCode,
    txHash,
}: ManualPaymentRequestSubmission): Promise<ManualPaymentRequestRecord> {
    const normalizedTxHash = normalizeTxHash(txHash);

    if (normalizedTxHash.length < 16) {
        throw new Error('Transaction hash looks too short.');
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw userError ?? new Error('You need to sign in before submitting a payment hash.');
    }

    const payload: ManualPaymentRequestInsert = {
        user_id: user.id,
        plan_code: planCode,
        wallet_address: MANUAL_PAYMENT_WALLET_ADDRESS,
        network: MANUAL_PAYMENT_NETWORK_LABEL,
        asset_symbol: MANUAL_PAYMENT_ASSET_SYMBOL,
        expected_amount: getPlanAmount(planCode),
        tx_hash: normalizedTxHash,
        status: 'pending',
        reviewer_note: null,
        reviewed_at: null,
        metadata: {
            explorerUrl: getExplorerUrl(normalizedTxHash),
        },
    };

    const { data, error } = await supabase
        .from('manual_payment_requests')
        .insert(payload)
        .select('*')
        .single();

    if (error) {
        const message = error.message.toLowerCase();
        if (message.includes('duplicate') || message.includes('manual_payment_requests_tx_hash_unique')) {
            throw new Error('This transaction hash was already submitted.');
        }

        throw error;
    }

    return data as ManualPaymentRequestRecord;
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
        throw new Error('Crypto subscription was created without a redirect URL.');
    }

    return {
        sessionId: data.sessionId as string,
        url: data.url as string,
    };
}

export async function cancelCryptoSubscription() {
    const { data, error } = await supabase.functions.invoke('cancel-crypto-subscription');

    if (error) {
        throw error;
    }

    return data;
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
