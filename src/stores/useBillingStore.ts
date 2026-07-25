import { create } from 'zustand';
import type {
    BillingEntitlementCode,
    BillingFeatureCode,
    BillingPlanCode,
    SubscriptionAccessState,
} from '../types/billing.types';
import type {
    EntitlementRecord,
    FeatureUsageRecord,
    PaymentOrderRecord,
    SubscriptionRecord,
} from '../types/database.types';
import {
    createCheckoutSession,
    fetchBillingOverview,
    getFeatureUsageCount,
    hasEntitlement,
    type CheckoutSessionResult,
} from '../lib/billing';
import { DEMO_USER_ID } from '../lib/demo';

interface BillingState {
    ownerUserId: string | null;
    subscription: SubscriptionRecord | null;
    entitlements: EntitlementRecord[];
    featureUsage: FeatureUsageRecord[];
    paymentOrders: PaymentOrderRecord[];
    access: SubscriptionAccessState;
    isLoading: boolean;
    isStartingCheckout: boolean;
    error: string | null;
    hydrate: (userId: string) => Promise<void>;
    clear: () => void;
    startCheckout: (
        planCode: Exclude<BillingPlanCode, 'free'>,
        options?: {
            successPath?: string;
            cancelPath?: string;
        }
    ) => Promise<CheckoutSessionResult | null>;
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
    paymentOrders: [],
    access: initialAccessState,
    isLoading: false,
    isStartingCheckout: false,
    error: null,

    hydrate: async (userId) => {
        if (userId === DEMO_USER_ID) {
            set({
                ownerUserId: DEMO_USER_ID,
                subscription: null,
                entitlements: [],
                featureUsage: [],
                paymentOrders: [],
                access: initialAccessState,
                isLoading: false,
                error: null,
            });
            return;
        }

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
                paymentOrders: overview.paymentOrders,
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
            paymentOrders: [],
            access: initialAccessState,
            isLoading: false,
            isStartingCheckout: false,
            error: null,
        });
    },

    startCheckout: async (planCode, options) => {
        if (get().ownerUserId === DEMO_USER_ID) {
            set({ error: 'В демо-режиме оплата отключена. Создайте аккаунт, чтобы выбрать тариф.' });
            return null;
        }

        set({ isStartingCheckout: true, error: null });

        try {
            const session = await createCheckoutSession(planCode, options);
            set({ isStartingCheckout: false });
            return session;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to start Binance Pay checkout.';
            set({ isStartingCheckout: false, error: message });
            return null;
        }
    },

    hasEntitlement: (entitlementCode) => {
        return hasEntitlement(get().entitlements, entitlementCode);
    },

    getFeatureUsage: (featureCode) => {
        return getFeatureUsageCount(get().featureUsage, featureCode);
    },
}));
