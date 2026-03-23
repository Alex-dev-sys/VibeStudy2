import { createClient } from 'npm:@supabase/supabase-js@2.90.1';
import {
    cryptomusRequest,
    type CryptomusRecurrence,
    type CryptomusRecurrencePeriod,
    getCryptomusEnv,
} from '../_shared/cryptomus.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PaidPlanCode = 'pro_monthly' | 'pro_three_month';

interface CreateCheckoutPayload {
    planCode: PaidPlanCode;
    successPath?: string;
    cancelPath?: string;
}

function createUserClient(request: Request) {
    return createClient(getCryptomusEnv('SUPABASE_URL'), getCryptomusEnv('SUPABASE_ANON_KEY'), {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        global: {
            headers: {
                Authorization: request.headers.get('Authorization') ?? '',
            },
        },
    });
}

function createAdminClient() {
    return createClient(getCryptomusEnv('SUPABASE_URL'), getCryptomusEnv('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function normalizePath(path: string | undefined, fallback: string) {
    const value = path?.trim() || fallback;
    if (!value.startsWith('/')) {
        throw new Error('Checkout redirect paths must start with "/".');
    }
    return value;
}

function buildRedirectUrl(request: Request, path: string) {
    const origin = request.headers.get('Origin') ?? getCryptomusEnv('APP_BASE_URL');
    return new URL(path, origin).toString();
}

function getPlanConfig(planCode: PaidPlanCode) {
    switch (planCode) {
        case 'pro_monthly':
            return {
                amount: getCryptomusEnv('CRYPTOMUS_PRO_MONTHLY_AMOUNT'),
                period: 'monthly' as CryptomusRecurrencePeriod,
            };
        case 'pro_three_month':
            return {
                amount: getCryptomusEnv('CRYPTOMUS_PRO_THREE_MONTH_AMOUNT'),
                period: 'three_month' as CryptomusRecurrencePeriod,
            };
    }
}

async function createCryptomusSubscription(
    request: Request,
    userId: string,
    userEmail: string | undefined,
    planCode: PaidPlanCode,
    successUrl: string,
    returnUrl: string
) {
    const plan = getPlanConfig(planCode);
    const orderId = `vibestudy:${userId}:${planCode}:${Date.now()}`;

    const recurrence = await cryptomusRequest<CryptomusRecurrence>('/v1/recurrence/create', {
        amount: plan.amount,
        currency: getCryptomusEnv('CRYPTOMUS_INVOICE_CURRENCY'),
        name: `VibeStudy ${planCode}`,
        period: plan.period,
        order_id: orderId,
        url_callback: new URL('/functions/v1/billing-webhook', getCryptomusEnv('SUPABASE_URL')).toString(),
        url_success: successUrl,
        url_return: returnUrl,
        additional_data: JSON.stringify({
            userId,
            planCode,
            userEmail: userEmail ?? null,
            orderId,
        }),
    });

    return {
        recurrence,
        orderId,
    };
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: corsHeaders });
    }

    try {
        if (!request.headers.get('Authorization')) {
            return Response.json({ error: 'Missing authorization header.' }, { status: 401, headers: corsHeaders });
        }

        const payload = (await request.json()) as Partial<CreateCheckoutPayload>;
        if (payload.planCode !== 'pro_monthly' && payload.planCode !== 'pro_three_month') {
            return Response.json(
                { error: 'Unsupported plan. Only crypto recurring plans can open checkout.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const successPath = normalizePath(payload.successPath, '/profile?billing=success');
        const cancelPath = normalizePath(payload.cancelPath, '/pricing?billing=cancelled');

        const userClient = createUserClient(request);
        const admin = createAdminClient();
        const {
            data: { user },
            error: userError,
        } = await userClient.auth.getUser();

        if (userError || !user) {
            return Response.json({ error: 'Unauthorized.' }, { status: 401, headers: corsHeaders });
        }

        const successUrl = buildRedirectUrl(request, successPath);
        const returnUrl = buildRedirectUrl(request, cancelPath);
        const { recurrence, orderId } = await createCryptomusSubscription(
            request,
            user.id,
            typeof user.email === 'string' ? user.email : undefined,
            payload.planCode,
            successUrl,
            returnUrl
        );

        const now = new Date().toISOString();
        const { error: upsertError } = await admin.from('subscriptions').upsert(
            {
                user_id: user.id,
                provider: 'cryptomus',
                provider_customer_id: null,
                provider_subscription_id: recurrence.uuid,
                plan_code: payload.planCode,
                status: recurrence.status === 'active' ? 'active' : 'incomplete',
                current_period_start: null,
                current_period_end: null,
                cancel_at_period_end: recurrence.status === 'cancel_by_user' || recurrence.status === 'cancel_by_merchant',
                canceled_at: null,
                trial_ends_at: null,
                metadata: {
                    order_id: orderId,
                    checkout_url: recurrence.url,
                    currency: recurrence.currency,
                    recurring_period: recurrence.period,
                    provider_status: recurrence.status,
                },
                updated_at: now,
            },
            { onConflict: 'provider,provider_subscription_id' }
        );

        if (upsertError) {
            throw upsertError;
        }

        return Response.json(
            {
                ok: true,
                provider: 'cryptomus',
                sessionId: recurrence.uuid,
                url: recurrence.url,
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 500, headers: corsHeaders });
    }
});
