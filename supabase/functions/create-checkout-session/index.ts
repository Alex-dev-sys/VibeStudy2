import { createClient } from 'npm:@supabase/supabase-js@2.90.1';
import {
    type BinanceOrderResult,
    type BinancePaidPlanCode,
    binancePayRequest,
    createMerchantTradeNo,
    getBinanceCheckoutRedirectUrl,
    getBinancePayEnv,
} from '../_shared/binance-pay.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCheckoutPayload {
    planCode: BinancePaidPlanCode;
    successPath?: string;
    cancelPath?: string;
}

function createUserClient(request: Request) {
    return createClient(getBinancePayEnv('SUPABASE_URL'), getBinancePayEnv('SUPABASE_ANON_KEY'), {
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
    return createClient(getBinancePayEnv('SUPABASE_URL'), getBinancePayEnv('SUPABASE_SERVICE_ROLE_KEY'), {
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
    const origin = request.headers.get('Origin') ?? getBinancePayEnv('APP_BASE_URL');
    const url = new URL(path, origin);
    if (Array.from(url.searchParams.keys()).length > 1) {
        throw new Error('Binance Pay redirect URLs can only contain one query parameter.');
    }
    return url.toString();
}

function getPlanConfig(planCode: BinancePaidPlanCode) {
    const currency = Deno.env.get('BINANCE_PAY_CURRENCY') ?? 'USDT';

    switch (planCode) {
        case 'pro_monthly':
            return {
                planCode,
                amount: Number(getBinancePayEnv('BINANCE_PAY_PRO_MONTHLY_AMOUNT')),
                currency,
                title: 'VibeStudy Pro 30 Days',
                description: 'VibeStudy premium access for 30 days',
            };
        case 'pro_three_month':
            return {
                planCode,
                amount: Number(getBinancePayEnv('BINANCE_PAY_PRO_THREE_MONTH_AMOUNT')),
                currency,
                title: 'VibeStudy Pro 90 Days',
                description: 'VibeStudy premium access for 90 days',
            };
    }
}

async function createBinanceOrder(params: {
    userId: string;
    userEmail?: string;
    planCode: BinancePaidPlanCode;
    successUrl: string;
    cancelUrl: string;
}) {
    const plan = getPlanConfig(params.planCode);
    const merchantTradeNo = createMerchantTradeNo(params.userId, params.planCode);
    const webhookUrl = new URL('/functions/v1/billing-webhook', getBinancePayEnv('SUPABASE_URL')).toString();
    const orderExpireMinutes = Number(Deno.env.get('BINANCE_PAY_ORDER_EXPIRE_MINUTES') ?? '20');
    const payload = {
        env: {
            terminalType: 'WEB',
        },
        merchantTradeNo,
        orderAmount: plan.amount,
        currency: plan.currency,
        description: plan.description,
        goodsDetails: [
            {
                goodsType: '02',
                goodsCategory: 'Z000',
                referenceGoodsId: plan.planCode.toUpperCase(),
                goodsName: plan.title,
                goodsDetail: plan.description,
            },
        ],
        returnUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        orderExpireTime: Date.now() + orderExpireMinutes * 60_000,
        passThroughInfo: JSON.stringify({
            userId: params.userId,
            planCode: params.planCode,
        }),
        webhookUrl,
        ...(params.userEmail
            ? {
                  buyer: {
                      buyerEmail: params.userEmail,
                  },
              }
            : {}),
    };

    const order = await binancePayRequest<BinanceOrderResult>('/binancepay/openapi/v3/order', payload);

    return {
        order,
        merchantTradeNo,
        plan,
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
                { error: 'Unsupported plan. Only Binance Pay plans can open checkout.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const successPath = normalizePath(payload.successPath, '/profile?billing=success');
        const cancelPath = normalizePath(payload.cancelPath, '/pricing?billing=cancelled');
        const successUrl = buildRedirectUrl(request, successPath);
        const cancelUrl = buildRedirectUrl(request, cancelPath);

        const userClient = createUserClient(request);
        const admin = createAdminClient();
        const {
            data: { user },
            error: userError,
        } = await userClient.auth.getUser();

        if (userError || !user) {
            return Response.json({ error: 'Unauthorized.' }, { status: 401, headers: corsHeaders });
        }

        const { order, merchantTradeNo, plan } = await createBinanceOrder({
            userId: user.id,
            userEmail: typeof user.email === 'string' ? user.email : undefined,
            planCode: payload.planCode,
            successUrl,
            cancelUrl,
        });

        const { error: upsertError } = await admin.from('payment_orders').upsert(
            {
                user_id: user.id,
                provider: 'binance',
                plan_code: payload.planCode,
                status: 'created',
                merchant_trade_no: merchantTradeNo,
                provider_order_id: order.prepayId,
                provider_transaction_id: null,
                amount: String(plan.amount),
                currency: order.currency,
                checkout_url: order.checkoutUrl ?? null,
                deeplink: order.deeplink ?? null,
                universal_url: order.universalUrl ?? null,
                qr_code_link: order.qrcodeLink ?? null,
                order_expires_at: new Date(order.expireTime).toISOString(),
                paid_at: null,
                last_checked_at: null,
                metadata: {
                    terminal_type: order.terminalType,
                    total_fee: order.totalFee,
                    qr_content: order.qrContent ?? null,
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                },
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider,merchant_trade_no' }
        );

        if (upsertError) {
            throw upsertError;
        }

        return Response.json(
            {
                ok: true,
                provider: 'binance',
                sessionId: order.prepayId,
                url: getBinanceCheckoutRedirectUrl(order),
                checkoutUrl: order.checkoutUrl ?? null,
                universalUrl: order.universalUrl ?? null,
                deeplink: order.deeplink ?? null,
                expiresAt: new Date(order.expireTime).toISOString(),
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 500, headers: corsHeaders });
    }
});
