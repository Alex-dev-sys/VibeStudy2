import { createClient } from 'npm:@supabase/supabase-js@2.90.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
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

type FeatureCode = 'lesson_generation' | 'ai_hint' | 'ai_review';

class HttpError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
    }
}

function isBoundedText(value: unknown, maxLength: number, allowEmpty = false): value is string {
    return (
        typeof value === 'string' &&
        value.length <= maxLength &&
        (allowEmpty || value.trim().length > 0)
    );
}

function isValidDay(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 3650;
}

function isLessonPayload(value: unknown): value is GenerateLessonPayload {
    if (!value || typeof value !== 'object') return false;

    const payload = value as Partial<GenerateLessonPayload>;
    return (
        (payload.type === undefined || payload.type === 'lesson') &&
        isBoundedText(payload.trackId, 80) &&
        isBoundedText(payload.language, 40) &&
        isValidDay(payload.day) &&
        isBoundedText(payload.title, 200) &&
        Array.isArray(payload.topics) &&
        payload.topics.length >= 1 &&
        payload.topics.length <= 20 &&
        payload.topics.every((topic) => isBoundedText(topic, 200))
    );
}

function isHintPayload(value: unknown): value is GenerateHintPayload {
    if (!value || typeof value !== 'object') return false;

    const payload = value as Partial<GenerateHintPayload>;
    return (
        payload.type === 'hint' &&
        isBoundedText(payload.trackId, 80) &&
        isBoundedText(payload.language, 40) &&
        isValidDay(payload.day) &&
        isBoundedText(payload.lessonTitle, 200) &&
        isBoundedText(payload.taskTitle, 200) &&
        isBoundedText(payload.taskDescription, 4000) &&
        (payload.userCode === undefined || isBoundedText(payload.userCode, 20000, true))
    );
}

function isReviewPayload(value: unknown): value is GenerateReviewPayload {
    if (!value || typeof value !== 'object') return false;

    const payload = value as Partial<GenerateReviewPayload>;
    return (
        payload.type === 'review' &&
        isBoundedText(payload.trackId, 80) &&
        isBoundedText(payload.language, 40) &&
        isValidDay(payload.day) &&
        isBoundedText(payload.lessonTitle, 200) &&
        isBoundedText(payload.taskTitle, 200) &&
        isBoundedText(payload.taskDescription, 4000) &&
        isBoundedText(payload.userCode, 20000)
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

function getRequesterKey(userId: string) {
    return `user:${userId}`;
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

async function reserveFeatureUsage(
    userId: string,
    featureCode: FeatureCode,
    payload: GenerateLessonPayload | GenerateHintPayload | GenerateReviewPayload
) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('reserve_feature_usage', {
        p_user_id: userId,
        p_feature_code: featureCode,
        p_track_id: payload.trackId,
        p_day: payload.day,
        p_daily_limit: featureCode === 'ai_hint' ? FREE_DAILY_HINT_LIMIT : null,
    });

    if (error) {
        throw new Error(`Feature usage reservation failed: ${error.message}`);
    }

    const reservation = Array.isArray(data) ? data[0] : data;
    if (!reservation?.allowed) {
        throw new HttpError(
            typeof reservation?.reason === 'string' ? reservation.reason : 'This feature is not available on your plan.',
            403
        );
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
    const { data, error } = await supabase.rpc('reserve_ai_request', {
        p_requester_key: requesterKey,
        p_max_requests: RATE_LIMIT_MAX_REQUESTS,
        p_window_seconds: Math.floor(RATE_LIMIT_WINDOW_MS / 1000),
    });

    if (error) {
        throw new Error(`Rate limit reservation failed: ${error.message}`);
    }

    if (data !== true) {
        throw new HttpError('Rate limit exceeded. Try again in a few minutes.', 429);
    }
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return Response.json(
            { error: 'Method not allowed.' },
            { status: 405, headers: { ...corsHeaders, Allow: 'POST' } }
        );
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

        const payload: unknown = await request.json();
        if (!isLessonPayload(payload) && !isHintPayload(payload) && !isReviewPayload(payload)) {
            return Response.json({ error: 'Invalid payload.' }, { status: 400, headers: corsHeaders });
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('Missing OPENAI_API_KEY secret in Edge Functions environment.');
        }

        await checkRateLimit(getRequesterKey(user.id));

        if (isLessonPayload(payload)) {
            await reserveFeatureUsage(user.id, 'lesson_generation', payload);
            const cacheKey = await hashPayload(payload);
            const cachedLesson = await getCachedLesson(cacheKey);
            if (cachedLesson) {
                return Response.json(cachedLesson, {
                    headers: { ...corsHeaders, 'x-vibestudy-cache': 'hit' },
                });
            }

            const lesson = await requestJsonCompletion(apiKey, buildLessonPrompt(payload), 4000);
            if (!isLesson(lesson)) {
                throw new Error('AI returned an invalid lesson schema.');
            }

            await writeCachedLesson(payload, cacheKey, lesson);
            return Response.json(lesson, {
                headers: { ...corsHeaders, 'x-vibestudy-cache': 'miss' },
            });
        }

        if (isHintPayload(payload)) {
            await reserveFeatureUsage(user.id, 'ai_hint', payload);
            const hint = await requestJsonCompletion(apiKey, buildHintPrompt(payload), 700);
            if (!isHintResponse(hint)) {
                throw new Error('AI returned an invalid hint schema.');
            }

            return Response.json(hint, { headers: corsHeaders });
        }

        await reserveFeatureUsage(user.id, 'ai_review', payload);
        const review = await requestJsonCompletion(apiKey, buildReviewPrompt(payload), 900);
        if (!isReviewResponse(review)) {
            throw new Error('AI returned an invalid review schema.');
        }

        return Response.json(review, { headers: corsHeaders });
    } catch (error) {
        console.error('generate-lesson failed', error);
        const status = error instanceof HttpError ? error.status : error instanceof SyntaxError ? 400 : 500;
        const message = error instanceof HttpError
            ? error.message
            : error instanceof SyntaxError
              ? 'Invalid JSON body.'
              : 'AI request could not be completed.';
        return Response.json({ error: message }, { status, headers: corsHeaders });
    }
});
