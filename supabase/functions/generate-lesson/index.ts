import { createClient } from 'npm:@supabase/supabase-js@2.90.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const FREE_TRACK_DAY_LIMIT = 3;
const FREE_DAILY_HINT_LIMIT = 3;

interface GenerateLessonPayload {
    type?: 'lesson';
    trackId: string;
    language: string;
    day: number;
    title: string;
    topics: string[];
}

interface GenerateHintPayload {
    type: 'hint';
    trackId: string;
    language: string;
    day: number;
    lessonTitle: string;
    taskTitle: string;
    taskDescription: string;
    userCode?: string;
}

interface GenerateReviewPayload {
    type: 'review';
    trackId: string;
    language: string;
    day: number;
    lessonTitle: string;
    taskTitle: string;
    taskDescription: string;
    userCode: string;
}

interface GeneratedTask {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    codeTemplate?: string;
}

interface GeneratedLesson {
    theory: string;
    tasks: GeneratedTask[];
}

interface HintResponse {
    hint: string;
}

interface ReviewResponse {
    review: string;
    canComplete: boolean;
}

function isLessonPayload(value: unknown): value is GenerateLessonPayload {
    if (!value || typeof value !== 'object') return false;

    const payload = value as Partial<GenerateLessonPayload>;
    return (
        (payload.type === undefined || payload.type === 'lesson') &&
        typeof payload.trackId === 'string' &&
        typeof payload.language === 'string' &&
        typeof payload.day === 'number' &&
        typeof payload.title === 'string' &&
        Array.isArray(payload.topics) &&
        payload.topics.every((topic) => typeof topic === 'string')
    );
}

function isHintPayload(value: unknown): value is GenerateHintPayload {
    if (!value || typeof value !== 'object') return false;

    const payload = value as Partial<GenerateHintPayload>;
    return (
        payload.type === 'hint' &&
        typeof payload.trackId === 'string' &&
        typeof payload.language === 'string' &&
        typeof payload.day === 'number' &&
        typeof payload.lessonTitle === 'string' &&
        typeof payload.taskTitle === 'string' &&
        typeof payload.taskDescription === 'string' &&
        (payload.userCode === undefined || typeof payload.userCode === 'string')
    );
}

function isReviewPayload(value: unknown): value is GenerateReviewPayload {
    if (!value || typeof value !== 'object') return false;

    const payload = value as Partial<GenerateReviewPayload>;
    return (
        payload.type === 'review' &&
        typeof payload.trackId === 'string' &&
        typeof payload.language === 'string' &&
        typeof payload.day === 'number' &&
        typeof payload.lessonTitle === 'string' &&
        typeof payload.taskTitle === 'string' &&
        typeof payload.taskDescription === 'string' &&
        typeof payload.userCode === 'string'
    );
}

function isTask(value: unknown): value is GeneratedTask {
    if (!value || typeof value !== 'object') return false;

    const task = value as Partial<GeneratedTask>;
    return (
        typeof task.id === 'number' &&
        typeof task.title === 'string' &&
        typeof task.description === 'string' &&
        (task.difficulty === 'easy' || task.difficulty === 'medium' || task.difficulty === 'hard') &&
        (task.codeTemplate === undefined || typeof task.codeTemplate === 'string')
    );
}

function isLesson(value: unknown): value is GeneratedLesson {
    if (!value || typeof value !== 'object') return false;

    const lesson = value as Partial<GeneratedLesson>;
    return typeof lesson.theory === 'string' && Array.isArray(lesson.tasks) && lesson.tasks.every(isTask);
}

function isHintResponse(value: unknown): value is HintResponse {
    if (!value || typeof value !== 'object') return false;
    return typeof (value as Partial<HintResponse>).hint === 'string';
}

function isReviewResponse(value: unknown): value is ReviewResponse {
    if (!value || typeof value !== 'object') return false;

    const review = value as Partial<ReviewResponse>;
    return typeof review.review === 'string' && typeof review.canComplete === 'boolean';
}

function buildLessonPrompt(payload: GenerateLessonPayload) {
    return `You are an experienced programming instructor.
Generate a lesson in Russian for ${payload.language}.

Day ${payload.day}: ${payload.title}

Topics to cover:
${payload.topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}

Return:
1. Detailed theory in Russian with practical examples.
2. Seven coding tasks with this distribution: 3 easy, 3 medium, 1 hard.

Response format (JSON):
{
  "theory": "# ${payload.title}\\n\\n[Detailed markdown theory in Russian]",
  "tasks": [
    {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "difficulty": "easy|medium|hard",
      "codeTemplate": "// Optional starter code"
    }
  ]
}

Important:
- The theory must be at least 500 words.
- Code examples must be realistic and correct.
- Tasks must match the lesson topics.
- Return valid JSON only.`;
}

function buildHintPrompt(payload: GenerateHintPayload) {
    return `You are an experienced programming mentor.
Give a short helpful hint in Russian for the task below.

Course language: ${payload.language}
Day ${payload.day}
Lesson: ${payload.lessonTitle}
Task: ${payload.taskTitle}
Task description: ${payload.taskDescription}
Current user code:
${payload.userCode?.trim() || '[no code yet]'}

Return valid JSON only:
{
  "hint": "A short hint in Russian with 2-4 bullet points. Do not provide the full solution."
}`;
}

function buildReviewPrompt(payload: GenerateReviewPayload) {
    return `You are an experienced programming mentor.
Review the user's code in Russian.

Course language: ${payload.language}
Day ${payload.day}
Lesson: ${payload.lessonTitle}
Task: ${payload.taskTitle}
Task description: ${payload.taskDescription}
User code:
${payload.userCode}

Return valid JSON only:
{
  "review": "Short review in Russian with strengths and one next step.",
  "canComplete": true
}

Rules:
- Set canComplete to true only if the code is a meaningful attempt that addresses the task.
- Keep the review concise and practical.
- Do not mention automated tests or hidden validation.`;
}

function extractJson(raw: string) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error('Could not parse AI response.');
    }

    return JSON.parse(match[0]) as unknown;
}

async function requestJsonCompletion(apiKey: string, prompt: string, maxTokens: number) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an experienced programming instructor. Reply with valid JSON only.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI request failed with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
        throw new Error('Empty response from AI provider.');
    }

    return extractJson(content);
}

async function hashPayload(payload: GenerateLessonPayload) {
    const normalized = JSON.stringify({
        language: payload.language.trim().toLowerCase(),
        day: payload.day,
        title: payload.title.trim().toLowerCase(),
        topics: payload.topics.map((topic) => topic.trim().toLowerCase()),
    });
    const bytes = new TextEncoder().encode(normalized);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getRequesterKey(request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const realIp = request.headers.get('x-real-ip');
    const flyClientIp = request.headers.get('fly-client-ip');
    const authHeader = request.headers.get('authorization')?.slice(-24);

    return forwardedFor || realIp || flyClientIp || authHeader || 'anonymous';
}

function createAdminClient() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase service role secrets in Edge Functions environment.');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function createUserClient(request: Request) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !anonKey) {
        throw new Error('Missing Supabase anon secrets in Edge Functions environment.');
    }

    return createClient(supabaseUrl, anonKey, {
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

function isMissingBillingSchemaError(error: { message?: string } | null) {
    const message = error?.message?.toLowerCase() ?? '';
    return (
        message.includes('entitlements') ||
        message.includes('feature_usage') ||
        message.includes('subscriptions') ||
        message.includes('schema cache')
    );
}

function isPaidEntitlement(entitlementCodes: string[], featureCode: 'lesson_generation' | 'ai_hint' | 'ai_review') {
    if (entitlementCodes.includes('all_tracks')) {
        return true;
    }

    if (featureCode === 'lesson_generation') {
        return entitlementCodes.includes('unlimited_lessons');
    }

    if (featureCode === 'ai_hint') {
        return entitlementCodes.includes('unlimited_ai_hints');
    }

    return entitlementCodes.includes('unlimited_ai_reviews') || entitlementCodes.includes('unlimited_lessons');
}

async function getEntitlementCodes(userId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('entitlements')
        .select('entitlement_code')
        .eq('user_id', userId)
        .eq('active', true);

    if (error) {
        if (isMissingBillingSchemaError(error)) {
            return [] as string[];
        }

        throw new Error(`Entitlement lookup failed: ${error.message}`);
    }

    return (data ?? []).map((row) => String(row.entitlement_code));
}

async function getLatestChosenTrack(userId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('feature_usage')
        .select('metadata')
        .eq('user_id', userId)
        .eq('feature_code', 'lesson_generation')
        .order('usage_date', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        if (isMissingBillingSchemaError(error)) {
            return null;
        }

        throw new Error(`Feature usage lookup failed: ${error.message}`);
    }

    const metadata = data?.metadata;
    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const trackId = (metadata as Record<string, unknown>).track_id;
    return typeof trackId === 'string' ? trackId : null;
}

async function getFeatureUsageCount(userId: string, featureCode: 'lesson_generation' | 'ai_hint' | 'ai_review') {
    const supabase = createAdminClient();
    const usageDate = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
        .from('feature_usage')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature_code', featureCode)
        .eq('usage_date', usageDate)
        .maybeSingle();

    if (error) {
        if (isMissingBillingSchemaError(error)) {
            return 0;
        }

        throw new Error(`Feature usage counter lookup failed: ${error.message}`);
    }

    return Number(data?.usage_count ?? 0);
}

async function recordFeatureUsage(
    userId: string,
    featureCode: 'lesson_generation' | 'ai_hint' | 'ai_review',
    trackId: string,
    day: number
) {
    const supabase = createAdminClient();
    const usageDate = new Date().toISOString().slice(0, 10);

    const { data: existing, error: existingError } = await supabase
        .from('feature_usage')
        .select('id, usage_count, metadata')
        .eq('user_id', userId)
        .eq('feature_code', featureCode)
        .eq('usage_date', usageDate)
        .maybeSingle();

    if (existingError) {
        if (isMissingBillingSchemaError(existingError)) {
            return;
        }

        throw new Error(`Feature usage write lookup failed: ${existingError.message}`);
    }

    const metadata = {
        ...((existing?.metadata as Record<string, unknown> | null) ?? {}),
        track_id: trackId,
        day,
        touched_at: new Date().toISOString(),
    };

    if (existing) {
        const { error: updateError } = await supabase
            .from('feature_usage')
            .update({
                usage_count: Number(existing.usage_count ?? 0) + 1,
                metadata,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

        if (updateError && !isMissingBillingSchemaError(updateError)) {
            throw new Error(`Feature usage update failed: ${updateError.message}`);
        }

        return;
    }

    const { error: insertError } = await supabase
        .from('feature_usage')
        .insert({
            user_id: userId,
            feature_code: featureCode,
            usage_date: usageDate,
            usage_count: 1,
            metadata,
        });

    if (insertError && !isMissingBillingSchemaError(insertError)) {
        throw new Error(`Feature usage insert failed: ${insertError.message}`);
    }
}

async function enforceAccessRules(
    userId: string,
    featureCode: 'lesson_generation' | 'ai_hint' | 'ai_review',
    payload: GenerateLessonPayload | GenerateHintPayload | GenerateReviewPayload
) {
    const entitlementCodes = await getEntitlementCodes(userId);
    if (isPaidEntitlement(entitlementCodes, featureCode)) {
        return;
    }

    const chosenTrack = await getLatestChosenTrack(userId);
    if (chosenTrack && chosenTrack !== payload.trackId) {
        throw new Error('Free plan is limited to one selected track. Upgrade to unlock all tracks.');
    }

    if (payload.day > FREE_TRACK_DAY_LIMIT) {
        throw new Error(`Free plan includes only the first ${FREE_TRACK_DAY_LIMIT} days of the selected track.`);
    }

    if (featureCode === 'ai_hint') {
        const hintsUsedToday = await getFeatureUsageCount(userId, 'ai_hint');
        if (hintsUsedToday >= FREE_DAILY_HINT_LIMIT) {
            throw new Error(`Daily AI hint limit reached for the free plan. You have ${FREE_DAILY_HINT_LIMIT} hints per day.`);
        }
    }
}

async function getCachedLesson(cacheKey: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('lesson_cache')
        .select('theory, tasks, updated_at')
        .eq('topics_hash', cacheKey)
        .maybeSingle();

    if (error) {
        throw new Error(`Cache lookup failed: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    const updatedAt = new Date(data.updated_at).getTime();
    if (Number.isNaN(updatedAt) || Date.now() - updatedAt > CACHE_TTL_MS) {
        return null;
    }

    const lesson = {
        theory: data.theory,
        tasks: data.tasks,
    };

    return isLesson(lesson) ? lesson : null;
}

async function writeCachedLesson(payload: GenerateLessonPayload, cacheKey: string, lesson: GeneratedLesson) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('lesson_cache')
        .upsert({
            language: payload.language,
            day: payload.day,
            title: payload.title,
            topics_hash: cacheKey,
            theory: lesson.theory,
            tasks: lesson.tasks,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'language,day,title,topics_hash',
        });

    if (error) {
        throw new Error(`Cache write failed: ${error.message}`);
    }
}

async function checkRateLimit(requesterKey: string) {
    const supabase = createAdminClient();
    const threshold = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
        .from('ai_request_log')
        .select('id', { count: 'exact', head: true })
        .eq('requester_key', requesterKey)
        .gte('created_at', threshold);

    if (countError) {
        throw new Error(`Rate limit lookup failed: ${countError.message}`);
    }

    if ((count ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
        throw new Error('Rate limit exceeded. Try again in a few minutes.');
    }

    const { error: insertError } = await supabase
        .from('ai_request_log')
        .insert({ requester_key: requesterKey });

    if (insertError) {
        throw new Error(`Rate limit write failed: ${insertError.message}`);
    }
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            return Response.json(
                { error: 'Missing OPENAI_API_KEY secret in Edge Functions environment.' },
                { status: 500, headers: corsHeaders }
            );
        }

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

        const payload = await request.json();
        await checkRateLimit(getRequesterKey(request));

        if (isLessonPayload(payload)) {
            await enforceAccessRules(user.id, 'lesson_generation', payload);
            const cacheKey = await hashPayload(payload);
            const cachedLesson = await getCachedLesson(cacheKey);
            if (cachedLesson) {
                await recordFeatureUsage(user.id, 'lesson_generation', payload.trackId, payload.day);
                return Response.json(cachedLesson, {
                    headers: { ...corsHeaders, 'x-vibestudy-cache': 'hit' },
                });
            }

            const lesson = await requestJsonCompletion(apiKey, buildLessonPrompt(payload), 4000);
            if (!isLesson(lesson)) {
                throw new Error('AI returned an invalid lesson schema.');
            }

            await writeCachedLesson(payload, cacheKey, lesson);
            await recordFeatureUsage(user.id, 'lesson_generation', payload.trackId, payload.day);

            return Response.json(lesson, {
                headers: { ...corsHeaders, 'x-vibestudy-cache': 'miss' },
            });
        }

        if (isHintPayload(payload)) {
            await enforceAccessRules(user.id, 'ai_hint', payload);
            const hint = await requestJsonCompletion(apiKey, buildHintPrompt(payload), 700);
            if (!isHintResponse(hint)) {
                throw new Error('AI returned an invalid hint schema.');
            }

            await recordFeatureUsage(user.id, 'ai_hint', payload.trackId, payload.day);
            return Response.json(hint, { headers: corsHeaders });
        }

        if (isReviewPayload(payload)) {
            await enforceAccessRules(user.id, 'ai_review', payload);
            const review = await requestJsonCompletion(apiKey, buildReviewPrompt(payload), 900);
            if (!isReviewResponse(review)) {
                throw new Error('AI returned an invalid review schema.');
            }

            await recordFeatureUsage(user.id, 'ai_review', payload.trackId, payload.day);
            return Response.json(review, { headers: corsHeaders });
        }

        return Response.json(
            { error: 'Invalid payload.' },
            { status: 400, headers: corsHeaders }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 500, headers: corsHeaders });
    }
});
