import { create } from 'zustand';
import type { BillingEntitlementCode, BillingFeatureCode, BillingPlanCode, SubscriptionAccessState } from '../types/billing.types';
import type {
    EntitlementRecord,
    FeatureUsageRecord,
    ManualPaymentRequestRecord,
    SubscriptionRecord,
} from '../types/database.types';
import {
    cancelCryptoSubscription,
    fetchBillingOverview,
    getFeatureUsageCount,
    hasEntitlement,
    submitManualPaymentRequest,
} from '../lib/billing';

interface BillingState {
    ownerUserId: string | null;
    subscription: SubscriptionRecord | null;
    entitlements: EntitlementRecord[];
    featureUsage: FeatureUsageRecord[];
    paymentRequests: ManualPaymentRequestRecord[];
    access: SubscriptionAccessState;
    isLoading: boolean;
    isSubmittingPayment: boolean;
    isCancelingSubscription: boolean;
    error: string | null;
    hydrate: (userId: string) => Promise<void>;
    clear: () => void;
    submitPayment: (
        planCode: Exclude<BillingPlanCode, 'free'>,
        txHash: string
    ) => Promise<ManualPaymentRequestRecord | null>;
    cancelSubscription: () => Promise<boolean>;
    hasEntitlement: (entitlementCode: BillingEntitlementCode) => boolean;
    getFeatureUsage: (featureCode: BillingFeatureCode) => number;
}

const initialAccessState: SubscriptionAccessState = {
    planCode: 'free',
    status: 'incomplete',
    canAccessPaidFeatures: false,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
};

export const useBillingStore = create<BillingState>((set, get) => ({
    ownerUserId: null,
    subscription: null,
    entitlements: [],
    featureUsage: [],
    paymentRequests: [],
    access: initialAccessState,
    isLoading: false,
    isSubmittingPayment: false,
    isCancelingSubscription: false,
    error: null,

    hydrate: async (userId) => {
        if (!userId) {
            get().clear();
            return;
        }

        set({ isLoading: true, error: null, ownerUserId: userId });

        try {
            const overview = await fetchBillingOverview(userId);
            set({
                subscription: overview.subscription,
                entitlements: overview.entitlements,
                featureUsage: overview.featureUsage,
                paymentRequests: overview.paymentRequests,
                access: overview.access,
                isLoading: false,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load billing state.';
            set({ isLoading: false, error: message });
        }
    },

    clear: () => {
        set({
            ownerUserId: null,
            subscription: null,
            entitlements: [],
            featureUsage: [],
            paymentRequests: [],
            access: initialAccessState,
            isLoading: false,
            isSubmittingPayment: false,
            isCancelingSubscription: false,
            error: null,
        });
    },

    submitPayment: async (planCode, txHash) => {
        set({ isSubmittingPayment: true, error: null });

        try {
            const request = await submitManualPaymentRequest({ planCode, txHash });
            set((state) => ({
                isSubmittingPayment: false,
                paymentRequests: [request, ...state.paymentRequests.filter((item) => item.id !== request.id)],
            }));

            return request;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit the payment hash.';
            set({ isSubmittingPayment: false, error: message });
            return null;
        }
    },

    cancelSubscription: async () => {
        set({ isCancelingSubscription: true, error: null });

        try {
            await cancelCryptoSubscription();

            const userId = get().ownerUserId;
            if (userId) {
                await get().hydrate(userId);
            } else {
                set({ isCancelingSubscription: false });
            }

            set({ isCancelingSubscription: false });
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to cancel crypto subscription.';
            set({ isCancelingSubscription: false, error: message });
            return false;
        }
    },

    hasEntitlement: (entitlementCode) => {
        return hasEntitlement(get().entitlements, entitlementCode);
    },

    getFeatureUsage: (featureCode) => {
        return getFeatureUsageCount(get().featureUsage, featureCode);
    },
}));
