import { createClient } from 'npm:@supabase/supabase-js@2.90.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getEnv(name: string) {
    const value = Deno.env.get(name);
    if (!value) {
        throw new Error(`Missing ${name} secret in Edge Functions environment.`);
    }
    return value;
}

function createUserClient(request: Request) {
    return createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_ANON_KEY'), {
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
    return createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
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

    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return Response.json({ error: 'Missing authorization header.' }, { status: 401, headers: corsHeaders });
        }

        const userClient = createUserClient(request);
        const {
            data: { user },
            error: userError,
        } = await userClient.auth.getUser();

        if (userError || !user) {
            return Response.json({ error: 'Unauthorized.' }, { status: 401, headers: corsHeaders });
        }

        const admin = createAdminClient();

        const operations = await Promise.all([
            admin.from('completed_tasks').delete().eq('user_id', user.id),
            admin.from('user_progress').delete().eq('user_id', user.id),
            admin.from('achievements').delete().eq('user_id', user.id),
            admin
                .from('profiles')
                .update({
                    current_streak: 0,
                    longest_streak: 0,
                    total_xp: 0,
                    level: 1,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id),
        ]);

        const firstError = operations.find((operation) => operation.error)?.error;
        if (firstError) {
            throw new Error(firstError.message);
        }

        return Response.json(
            {
                ok: true,
                message: 'Account progress has been reset.',
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 500, headers: corsHeaders });
    }
});
