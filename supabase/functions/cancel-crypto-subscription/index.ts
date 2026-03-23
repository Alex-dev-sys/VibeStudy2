import { createClient } from 'npm:@supabase/supabase-js@2.90.1';
import {
    cryptomusRequest,
    type CryptomusRecurrence,
    getCryptomusEnv,
} from '../_shared/cryptomus.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

        const userClient = createUserClient(request);
        const admin = createAdminClient();
        const {
            data: { user },
            error: userError,
        } = await userClient.auth.getUser();

        if (userError || !user) {
            return Response.json({ error: 'Unauthorized.' }, { status: 401, headers: corsHeaders });
        }

        const { data: subscription, error: subscriptionError } = await admin
            .from('subscriptions')
            .select('id, provider_subscription_id, metadata')
            .eq('user_id', user.id)
            .eq('provider', 'cryptomus')
            .in('status', ['active', 'past_due', 'incomplete'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (subscriptionError) {
            throw subscriptionError;
        }

        if (!subscription?.provider_subscription_id) {
            return Response.json({ error: 'No active crypto subscription found.' }, { status: 404, headers: corsHeaders });
        }

        const recurrence = await cryptomusRequest<CryptomusRecurrence>('/v1/recurrence/cancel', {
            uuid: subscription.provider_subscription_id,
        });

        const { error: updateSubscriptionError } = await admin
            .from('subscriptions')
            .update({
                status: 'canceled',
                cancel_at_period_end: true,
                canceled_at: new Date().toISOString(),
                metadata: {
                    ...(subscription.metadata ?? {}),
                    provider_status: recurrence.status,
                },
                updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

        if (updateSubscriptionError) {
            throw updateSubscriptionError;
        }

        const { error: deleteEntitlementsError } = await admin
            .from('entitlements')
            .delete()
            .eq('source', 'subscription')
            .eq('source_id', subscription.id);

        if (deleteEntitlementsError) {
            throw deleteEntitlementsError;
        }

        return Response.json(
            {
                ok: true,
                provider: 'cryptomus',
                status: recurrence.status,
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 500, headers: corsHeaders });
    }
});
