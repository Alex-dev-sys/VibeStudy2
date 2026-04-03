import { createClient } from 'npm:@supabase/supabase-js@2.90.1';
import {
    calculatePaidAccessEnd,
    mapBinanceOrderStatusToSubscriptionStatus,
    parseBinancePassThroughInfo,
    queryBinanceOrder,
    type BinanceOrderStatus,
    type BinancePaidPlanCode,
    type LocalSubscriptionStatus,
    verifyBinanceWebhook,
} from '../_shared/binance-pay.ts';

type SubscriptionEntitlementCode =
    | 'core_access'
    | 'all_tracks'
    | 'unlimited_lessons'
    | 'unlimited_ai_hints'
    | 'unlimited_ai_reviews'
    | 'analytics_access'
    | 'streak_recovery';

interface ExistingPaymentOrderRow {
    id: string;
    user_id: string;
    plan_code: BinancePaidPlanCode;
    status: string;
    checkout_url: string | null;
    deeplink: string | null;
    universal_url: string | null;
    qr_code_link: string | null;
    paid_at: string | null;
    metadata: Record<string, unknown> | null;
}

interface ExistingSubscriptionRow {
    id: string;
    user_id: string;
    current_period_start: string | null;
    current_period_end: string | null;
    metadata: Record<string, unknown> | null;
}

function createAdminClient() {
    return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function safeParseObject(value: unknown) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value) as Record<string, unknown>;
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            return null;
        }
    }

    if (typeof value === 'object') {
        return value as Record<string, unknown>;
    }

    return null;
}

function readString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function mapBinanceOrderStatusToPaymentOrderStatus(status: BinanceOrderStatus) {
    switch (status) {
        case 'PAID':
            return 'paid';
        case 'CANCELED':
            return 'canceled';
        case 'ERROR':
            return 'error';
        case 'EXPIRED':
            return 'expired';
        case 'REFUNDED':
        case 'FULL_REFUNDED':
            return 'refunded';
        case 'REFUNDING':
            return 'refunding';
        case 'INITIAL':
        case 'PENDING':
        default:
            return 'pending';
    }
}

function getEntitlementsForPlan(): SubscriptionEntitlementCode[] {
    return [
        'core_access',
        'all_tracks',
        'unlimited_lessons',
        'unlimited_ai_hints',
        'unlimited_ai_reviews',
        'analytics_access',
        'streak_recovery',
    ];
}

function isEntitledStatus(status: LocalSubscriptionStatus) {
    return status === 'active' || status === 'trialing' || status === 'past_due';
}

function extractWebhookContext(payload: Record<string, unknown>) {
    const nested = safeParseObject(payload.data);
    const merchantTradeNo = readString(nested?.merchantTradeNo) ?? readString(payload.merchantTradeNo);
    const prepayId =
        readString(nested?.prepayId) ??
        readString(payload.prepayId) ??
        (typeof payload.bizId === 'number' ? String(payload.bizId) : readString(payload.bizId));
    const transactionId = readString(nested?.transactionId) ?? readString(payload.transactionId);
    const status =
        (readString(nested?.status) ??
            readString(payload.bizStatus) ??
            readString(payload.status) ??
            'PENDING') as BinanceOrderStatus;
    const bizType = readString(payload.bizType) ?? 'webhook';

    return {
        nested,
        merchantTradeNo,
        prepayId,
        transactionId,
        status,
        eventType: `binancepay.${bizType.toLowerCase()}.${status.toLowerCase()}`,
        eventId: [merchantTradeNo ?? 'unknown', prepayId ?? 'unknown', transactionId ?? 'none', status].join(':'),
    };
}

async function registerBillingEvent(
    admin: ReturnType<typeof createAdminClient>,
    eventId: string,
    eventType: string,
    payload: Record<string, unknown>
) {
    const { data: existing, error: existingError } = await admin
        .from('billing_events')
        .select('id, processed_at')
        .eq('provider', 'binance')
        .eq('provider_event_id', eventId)
        .maybeSingle();

    if (existingError) {
        throw existingError;
    }

    if (existing?.processed_at) {
        return { id: existing.id as string, alreadyProcessed: true };
    }

    if (existing) {
        return { id: existing.id as string, alreadyProcessed: false };
    }

    const { data: created, error: insertError } = await admin
        .from('billing_events')
        .insert({
            provider: 'binance',
            provider_event_id: eventId,
            event_type: eventType,
            payload,
        })
        .select('id')
        .single();

    if (insertError) {
        throw insertError;
    }

    return { id: created.id as string, alreadyProcessed: false };
}

async function findExistingPaymentOrder(
    admin: ReturnType<typeof createAdminClient>,
    lookup: {
        merchantTradeNo?: string | null;
        prepayId?: string | null;
    }
) {
    if (lookup.prepayId) {
        const { data, error } = await admin
            .from('payment_orders')
            .select(
                'id, user_id, plan_code, status, checkout_url, deeplink, universal_url, qr_code_link, paid_at, metadata'
            )
            .eq('provider', 'binance')
            .eq('provider_order_id', lookup.prepayId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (data) {
            return data as ExistingPaymentOrderRow;
        }
    }

    if (lookup.merchantTradeNo) {
        const { data, error } = await admin
            .from('payment_orders')
            .select(
                'id, user_id, plan_code, status, checkout_url, deeplink, universal_url, qr_code_link, paid_at, metadata'
            )
            .eq('provider', 'binance')
            .eq('merchant_trade_no', lookup.merchantTradeNo)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (data) {
            return data as ExistingPaymentOrderRow;
        }
    }

    return null;
}

async function findExistingSubscription(
    admin: ReturnType<typeof createAdminClient>,
    providerOrderId: string
) {
    const { data, error } = await admin
        .from('subscriptions')
        .select('id, user_id, current_period_start, current_period_end, metadata')
        .eq('provider', 'binance')
        .eq('provider_subscription_id', providerOrderId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return (data as ExistingSubscriptionRow | null) ?? null;
}

async function syncEntitlements(
    admin: ReturnType<typeof createAdminClient>,
    userId: string,
    subscriptionId: string,
    planCode: BinancePaidPlanCode,
    status: LocalSubscriptionStatus,
    startsAt: string | null,
    endsAt: string | null
) {
    const { error: deleteError } = await admin
        .from('entitlements')
        .delete()
        .eq('source', 'subscription')
        .eq('source_id', subscriptionId);

    if (deleteError) {
        throw deleteError;
    }

    if (!isEntitledStatus(status)) {
        return;
    }

    const entitlements = getEntitlementsForPlan().map((entitlementCode) => ({
        user_id: userId,
        entitlement_code: entitlementCode,
        source: 'subscription' as const,
        source_id: subscriptionId,
        active: true,
        starts_at: startsAt ?? new Date().toISOString(),
        ends_at: endsAt,
        metadata: {
            plan_code: planCode,
            provider: 'binance',
        },
    }));

    const { error: insertError } = await admin.from('entitlements').insert(entitlements);
    if (insertError) {
        throw insertError;
    }
}

async function upsertPaymentOrder(
    admin: ReturnType<typeof createAdminClient>,
    order: Awaited<ReturnType<typeof queryBinanceOrder>>,
    context: Awaited<ReturnType<typeof findExistingPaymentOrder>>,
    planCode: BinancePaidPlanCode,
    userId: string
) {
    const paidAt = order.transactTime
        ? new Date(order.transactTime).toISOString()
        : context?.paid_at ?? null;
    const paymentStatus = mapBinanceOrderStatusToPaymentOrderStatus(order.status);
    const orderMetadata = {
        ...(context?.metadata ?? {}),
        order_status: order.status,
        payment_info: order.paymentInfo ?? null,
        pass_through_info: order.passThroughInfo ?? null,
    };

    const { data, error } = await admin
        .from('payment_orders')
        .upsert(
            {
                user_id: userId,
                provider: 'binance',
                plan_code: planCode,
                status: paymentStatus,
                merchant_trade_no: order.merchantTradeNo,
                provider_order_id: order.prepayId,
                provider_transaction_id: order.transactionId ?? null,
                amount: order.orderAmount,
                currency: order.currency,
                checkout_url: context?.checkout_url ?? null,
                deeplink: context?.deeplink ?? null,
                universal_url: context?.universal_url ?? null,
                qr_code_link: context?.qr_code_link ?? null,
                order_expires_at: new Date(order.createTime + 60 * 60 * 1000).toISOString(),
                paid_at: paidAt,
                last_checked_at: new Date().toISOString(),
                metadata: orderMetadata,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider,merchant_trade_no' }
        )
        .select('id, user_id')
        .single();

    if (error) {
        throw error;
    }

    return data as { id: string; user_id: string };
}

async function upsertSubscriptionFromOrder(
    admin: ReturnType<typeof createAdminClient>,
    order: Awaited<ReturnType<typeof queryBinanceOrder>>,
    planCode: BinancePaidPlanCode,
    userId: string
) {
    const status = mapBinanceOrderStatusToSubscriptionStatus(order.status);
    const existingSubscription = await findExistingSubscription(admin, order.prepayId);
    const paidAt =
        order.transactTime != null ? new Date(order.transactTime).toISOString() : existingSubscription?.current_period_start;

    if (status === 'incomplete' && !existingSubscription) {
        return null;
    }

    if (status === 'canceled' && !existingSubscription) {
        return null;
    }

    const currentPeriodStart = paidAt ?? existingSubscription?.current_period_start ?? null;
    let currentPeriodEnd =
        currentPeriodStart != null ? calculatePaidAccessEnd(currentPeriodStart, planCode) : existingSubscription?.current_period_end;

    if (status === 'expired') {
        currentPeriodEnd = new Date().toISOString();
    }

    const { data: subscription, error: upsertError } = await admin
        .from('subscriptions')
        .upsert(
            {
                user_id: userId,
                provider: 'binance',
                provider_customer_id: null,
                provider_subscription_id: order.prepayId,
                plan_code: planCode,
                status,
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd ?? null,
                cancel_at_period_end: false,
                canceled_at: status === 'canceled' ? new Date().toISOString() : null,
                trial_ends_at: null,
                metadata: {
                    provider_order_status: order.status,
                    merchant_trade_no: order.merchantTradeNo,
                    transaction_id: order.transactionId ?? null,
                    pass_through_info: order.passThroughInfo ?? null,
                },
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider,provider_subscription_id' }
        )
        .select('id, user_id, plan_code, status, current_period_start, current_period_end')
        .single();

    if (upsertError) {
        throw upsertError;
    }

    await syncEntitlements(
        admin,
        subscription.user_id as string,
        subscription.id as string,
        subscription.plan_code as BinancePaidPlanCode,
        subscription.status as LocalSubscriptionStatus,
        (subscription.current_period_start as string | null) ?? null,
        (subscription.current_period_end as string | null) ?? null
    );

    return subscription as {
        id: string;
        user_id: string;
        plan_code: BinancePaidPlanCode;
        status: LocalSubscriptionStatus;
        current_period_start: string | null;
        current_period_end: string | null;
    };
}

async function markBillingEventProcessed(
    admin: ReturnType<typeof createAdminClient>,
    billingEventId: string,
    subscription: {
        id?: string | null;
        user_id?: string | null;
    } | null,
    payload: Record<string, unknown>
) {
    const { error } = await admin
        .from('billing_events')
        .update({
            user_id: subscription?.user_id ?? null,
            subscription_id: subscription?.id ?? null,
            payload,
            processed_at: new Date().toISOString(),
        })
        .eq('id', billingEventId);

    if (error) {
        throw error;
    }
}

Deno.serve(async (request) => {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const rawBody = await request.text();
        const payload = await verifyBinanceWebhook(rawBody, request.headers);
        const webhookContext = extractWebhookContext(payload);
        const admin = createAdminClient();
        const billingEvent = await registerBillingEvent(admin, webhookContext.eventId, webhookContext.eventType, payload);

        if (billingEvent.alreadyProcessed) {
            return Response.json({ ok: true, duplicate: true });
        }

        const order = await queryBinanceOrder({
            prepayId: webhookContext.prepayId ?? undefined,
            merchantTradeNo: webhookContext.merchantTradeNo ?? undefined,
        });
        const existingOrder = await findExistingPaymentOrder(admin, {
            merchantTradeNo: order.merchantTradeNo,
            prepayId: order.prepayId,
        });
        const passThroughInfo = parseBinancePassThroughInfo(order.passThroughInfo);
        const userId = existingOrder?.user_id ?? readString(passThroughInfo?.userId);
        const planCode = (existingOrder?.plan_code ??
            readString(passThroughInfo?.planCode)) as BinancePaidPlanCode | null;

        if (!userId || (planCode !== 'pro_monthly' && planCode !== 'pro_three_month')) {
            throw new Error('Unable to map Binance Pay order to a user and plan.');
        }

        await upsertPaymentOrder(admin, order, existingOrder, planCode, userId);
        const subscription = await upsertSubscriptionFromOrder(admin, order, planCode, userId);

        await markBillingEventProcessed(admin, billingEvent.id, subscription, payload);

        return Response.json({
            ok: true,
            provider: 'binance',
            orderStatus: order.status,
            subscriptionId: subscription?.id ?? null,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 400 });
    }
});
