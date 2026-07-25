export const HUGGING_FACE_CHAT_COMPLETIONS_URL = 'https://router.huggingface.co/v1/chat/completions';
export const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
export const DEFAULT_HUGGING_FACE_MODEL = 'Qwen/Qwen3-Coder-30B-A3B-Instruct:scaleway';
export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

export interface AiProviderConfig {
    name: 'huggingface' | 'openai';
    endpoint: string;
    token: string;
    model: string;
}

interface CompletionOptions {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    onProviderError?: (provider: AiProviderConfig, error: unknown) => void;
}

function getRuntimeEnv(name: string) {
    if (typeof Deno !== 'undefined' && typeof Deno.env?.get === 'function') return Deno.env.get(name);
    if (typeof process !== 'undefined' && process.env) return process.env[name];
    return undefined;
}

export function getAiProviderConfigs(env: Record<string, string | undefined> = {
    AI_PROVIDER: getRuntimeEnv('AI_PROVIDER'),
    AI_FALLBACK_ENABLED: getRuntimeEnv('AI_FALLBACK_ENABLED'),
    HF_TOKEN: getRuntimeEnv('HF_TOKEN'),
    HF_MODEL: getRuntimeEnv('HF_MODEL'),
    OPENAI_API_KEY: getRuntimeEnv('OPENAI_API_KEY'),
    OPENAI_MODEL: getRuntimeEnv('OPENAI_MODEL'),
}) {
    const huggingFace = env.HF_TOKEN ? {
        name: 'huggingface' as const,
        endpoint: HUGGING_FACE_CHAT_COMPLETIONS_URL,
        token: env.HF_TOKEN,
        model: env.HF_MODEL || DEFAULT_HUGGING_FACE_MODEL,
    } : null;
    const openAi = env.OPENAI_API_KEY ? {
        name: 'openai' as const,
        endpoint: OPENAI_CHAT_COMPLETIONS_URL,
        token: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    } : null;
    const preferred = env.AI_PROVIDER === 'openai' ? openAi : huggingFace;
    const fallback = env.AI_PROVIDER === 'openai' ? huggingFace : openAi;

    if (env.AI_FALLBACK_ENABLED === 'false') return preferred ? [preferred] : [];
    return [preferred, fallback].filter((provider): provider is AiProviderConfig => provider !== null);
}

export function getAiCacheNamespace(providers: AiProviderConfig[], promptVersion = 'v2') {
    return `${promptVersion}:${providers.map((provider) => `${provider.name}:${provider.model}`).join('|')}`;
}

function extractJson(raw: string) {
    const trimmed = raw.trim();
    try {
        return JSON.parse(trimmed) as unknown;
    } catch {
        // Some compatible providers still wrap JSON in a Markdown fence.
    }

    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
    const source = fenced?.[1]?.trim() ?? trimmed;
    const start = source.indexOf('{');
    const end = source.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('AI response does not contain JSON.');
    return JSON.parse(source.slice(start, end + 1)) as unknown;
}

export async function requestJsonCompletion(
    providers: AiProviderConfig[],
    prompt: string,
    maxTokens: number,
    options: CompletionOptions = {}
) {
    if (providers.length === 0) throw new Error('No AI provider is configured.');

    const fetchImpl = options.fetchImpl ?? fetch;
    const timeoutMs = options.timeoutMs ?? 75_000;
    let lastError: unknown;

    for (const provider of providers) {
        try {
            const response = await fetchImpl(provider.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.token}` },
                body: JSON.stringify({
                    model: provider.model,
                    messages: [
                        { role: 'system', content: 'Ты опытный преподаватель программирования. Отвечай только валидным JSON.' },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.4,
                    max_tokens: maxTokens,
                    response_format: { type: 'json_object' },
                }),
                signal: AbortSignal.timeout(timeoutMs),
            });
            if (!response.ok) {
                throw new Error(`${provider.name} returned ${response.status}; request_id=${response.headers.get('x-request-id') ?? 'unknown'}`);
            }

            const result = await response.json();
            const content = result?.choices?.[0]?.message?.content;
            if (!content || typeof content !== 'string') throw new Error(`${provider.name} returned an empty completion.`);
            return extractJson(content);
        } catch (error) {
            lastError = error;
            options.onProviderError?.(provider, error);
        }
    }

    throw new Error('All configured AI providers failed.', { cause: lastError });
}
