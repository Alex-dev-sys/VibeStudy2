import { createClient } from 'npm:@supabase/supabase-js@2.90.1';
import {
    cryptomusRequest,
    normalizeCryptomusDate,
    parseCryptomusAdditionalData,
    type CryptomusPaymentWebhook,
    type CryptomusRecurrence,
    verifyCryptomusWebhook,
    getCryptomusEnv,
} from '../_shared/cryptomus.ts';

type LocalPlanCode = 'free' | 'pro_monthly' | 'pro_three_month';
type LocalSubscriptionStatus =
    | 'incomplete'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'expired'
    | 'paused';

type SubscriptionEntitlementCode =
    | 'core_access'
    | 'all_tracks'
    | 'unlimited_lessons'
    | 'unlimited_ai_hints'
    | 'unlimited_ai_reviews'
    | 'analytics_access'
    | 'streak_recovery';

interface CryptomusAdditionalData {
    userId?: string;
    planCode?: LocalPlanCode;
    userEmail?: string | null;
    orderId?: string;
}

interface ExistingSubscriptionRow {
    id: string;
    user_id: string;
    current_period_start: string | null;
    current_period_end: string | null;
    metadata: Record<string, unknown> | null;
}

function createAdminClient() {
    return createClient(getCryptomusEnv('SUPABASE_URL'), getCryptomusEnv('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function addPeriod(startIso: string, planCode: LocalPlanCode) {
    const date = new Date(startIso);
    if (planCode === 'pro_monthly') {
        date.setUTCMonth(date.getUTCMonth() + 1);
    } else if (planCode === 'pro_three_month') {
        date.setUTCMonth(date.getUTCMonth() + 3);
    }
    return date.toISOString();
}

function getPlanCodeFromRecurrence(recurrence: CryptomusRecurrence, fallbackPlanCode?: LocalPlanCode | null): LocalPlanCode {
    if (recurrence.period === 'monthly') {
        return 'pro_monthly';
    }

    if (recurrence.period === 'three_month') {
        return 'pro_three_month';
    }

    if (fallbackPlanCode && fallbackPlanCode !== 'free') {
        return fallbackPlanCode;
    }

    throw new Error(`Unsupported Cryptomus recurrence period: ${recurrence.period}`);
}

function getLocalStatus(
    recurrenceStatus: CryptomusRecurrence['status'],
    paymentStatus?: string
): LocalSubscriptionStatus {
    if (recurrenceStatus === 'cancel_by_user' || recurrenceStatus === 'cancel_by_merchant') {
        return 'canceled';
    }

    if (
        paymentStatus &&
        ['fail', 'system_fail', 'cancel', 'wrong_amount', 'wrong_amount_waiting'].includes(paymentStatus)
    ) {
        return 'past_due';
    }

    if (recurrenceStatus === 'active') {
        return 'active';
    }

    return 'incomplete';
}

function isEntitledStatus(status: LocalSubscriptionStatus) {
    return status === 'active' || status === 'trialing' || status === 'past_due';
}

function getEntitlementsForPlan(planCode: LocalPlanCode): SubscriptionEntitlementCode[] {
    if (planCode === 'free') {
        return ['core_access'];
    }

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

async function getRecurringInfo(orderId: string) {
    return await cryptomusRequest<CryptomusRecurrence>('/v1/recurrence/info', {
        order_id: orderId,
    });
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
        .eq('provider', 'cryptomus')
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
            provider: 'cryptomus',
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

async function syncEntitlements(
    admin: ReturnType<typeof createAdminClient>,
    userId: string,
    subscriptionId: string,
    planCode: LocalPlanCode,
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

    const entitlements = getEntitlementsForPlan(planCode).map((entitlementCode) => ({
        user_id: userId,
        entitlement_code: entitlementCode,
        source: 'subscription' as const,
        source_id: subscriptionId,
        active: true,
        starts_at: startsAt ?? new Date().toISOString(),
        ends_at: endsAt,
        metadata: {
            plan_code: planCode,
            provider: 'cryptomus',
        },
    }));

    const { error: insertError } = await admin.from('entitlements').insert(entitlements);
    if (insertError) {
        throw insertError;
    }
}

async function findExistingSubscription(
    admin: ReturnType<typeof createAdminClient>,
    recurrence: CryptomusRecurrence
) {
    const { data: directMatch, error: directError } = await admin
        .from('subscriptions')
        .select('id, user_id, current_period_start, current_period_end, metadata')
        .eq('provider', 'cryptomus')
        .eq('provider_subscription_id', recurrence.uuid)
        .maybeSingle();

    if (directError) {
        throw directError;
    }

    if (directMatch) {
        return directMatch as ExistingSubscriptionRow;
    }

    const { data: candidates, error: candidatesError } = await admin
        .from('subscriptions')
        .select('id, user_id, current_period_start, current_period_end, metadata')
        .eq('provider', 'cryptomus')
        .order('created_at', { ascending: false })
        .limit(25);

    if (candidatesError) {
        throw candidatesError;
    }

    return ((candidates ?? []) as ExistingSubscriptionRow[]).find(
        (row) => row.metadata?.order_id === recurrence.order_id
    ) ?? null;
}

async function upsertSubscriptionFromCryptomus(
    admin: ReturnType<typeof createAdminClient>,
    recurrence: CryptomusRecurrence,
    options: {
        fallbackUserId?: string | null;
        fallbackPlanCode?: LocalPlanCode | null;
        paymentStatus?: string;
    } = {}
) {
    const existing = await findExistingSubscription(admin, recurrence);
    const additionalData = parseCryptomusAdditionalData<CryptomusAdditionalData>(recurrence.additional_data);
    const userId = existing?.user_id ?? additionalData?.userId ?? options.fallbackUserId ?? null;

    if (!userId) {
        throw new Error(`Unable to map Cryptomus recurrence ${recurrence.uuid} to a Supabase user.`);
    }

    const planCode = getPlanCodeFromRecurrence(recurrence, additionalData?.planCode ?? options.fallbackPlanCode ?? null);
    const localStatus = getLocalStatus(recurrence.status, options.paymentStatus);
    const currentPeriodStart =
        normalizeCryptomusDate(recurrence.last_pay_off) ??
        existing?.current_period_start ??
        (localStatus === 'active' ? new Date().toISOString() : null);
    const currentPeriodEnd =
        currentPeriodStart && planCode !== 'free'
            ? addPeriod(currentPeriodStart, planCode)
            : existing?.current_period_end ?? null;
    const canceledAt =
        localStatus === 'canceled'
            ? existing?.current_period_end ?? currentPeriodStart ?? new Date().toISOString()
            : null;

    const row = {
        user_id: userId,
        provider: 'cryptomus' as const,
        provider_customer_id: null,
        provider_subscription_id: recurrence.uuid,
        plan_code: planCode,
        status: localStatus,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: localStatus === 'canceled',
        canceled_at: canceledAt,
        trial_ends_at: null,
        metadata: {
            order_id: recurrence.order_id,
            provider_status: recurrence.status,
            payer_currency: recurrence.payer_currency,
            recurring_period: recurrence.period,
            checkout_url: recurrence.url,
            payment_status: options.paymentStatus ?? null,
        },
        updated_at: new Date().toISOString(),
    };

    const { data: subscription, error: upsertError } = await admin
        .from('subscriptions')
        .upsert(row, {
            onConflict: 'provider,provider_subscription_id',
        })
        .select('id, user_id, plan_code, status, current_period_start, current_period_end')
        .single();

    if (upsertError) {
        throw upsertError;
    }

    await syncEntitlements(
        admin,
        subscription.user_id as string,
        subscription.id as string,
        subscription.plan_code as LocalPlanCode,
        subscription.status as LocalSubscriptionStatus,
        (subscription.current_period_start as string | null) ?? null,
        (subscription.current_period_end as string | null) ?? null
    );

    return subscription;
}

async function markBillingEventProcessed(
    admin: ReturnType<typeof createAdminClient>,
    eventId: string,
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
        .eq('id', billingEventId)
        .eq('provider', 'cryptomus')
        .eq('provider_event_id', eventId);

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
        const payload = verifyCryptomusWebhook(rawBody) as CryptomusPaymentWebhook & Record<string, unknown>;
        const additionalData = parseCryptomusAdditionalData<CryptomusAdditionalData>(payload.additional_data);
        const eventId = `${payload.uuid}:${payload.status}:${payload.is_final ? '1' : '0'}`;
        const eventType = `cryptomus.payment.${payload.status}`;
        const admin = createAdminClient();
        const billingEvent = await registerBillingEvent(admin, eventId, eventType, payload);

        if (billingEvent.alreadyProcessed) {
            return Response.json({ ok: true, duplicate: true });
        }

        const recurrence = await getRecurringInfo(payload.order_id);
        const subscription = await upsertSubscriptionFromCryptomus(admin, recurrence, {
            fallbackUserId: additionalData?.userId ?? null,
            fallbackPlanCode: additionalData?.planCode ?? null,
            paymentStatus: payload.status,
        });

        await markBillingEventProcessed(admin, eventId, billingEvent.id, subscription, payload);

        return Response.json({
            ok: true,
            provider: 'cryptomus',
            subscriptionId: subscription.id,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 400 });
    }
});
