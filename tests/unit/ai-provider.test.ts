import test from 'node:test';
import assert from 'node:assert/strict';
import {
    DEFAULT_HUGGING_FACE_MODEL,
    getAiCacheNamespace,
    getAiProviderConfigs,
    requestJsonCompletion,
} from '../../supabase/functions/_shared/ai-provider.ts';

test('Hugging Face Qwen is the default provider and OpenAI remains a fallback', () => {
    const providers = getAiProviderConfigs({
        HF_TOKEN: 'hf_test',
        OPENAI_API_KEY: 'openai_test',
    });

    assert.deepEqual(
        providers.map(({ name, model }) => ({ name, model })),
        [
            { name: 'huggingface', model: DEFAULT_HUGGING_FACE_MODEL },
            { name: 'openai', model: 'gpt-4o-mini' },
        ]
    );
});

test('OpenAI works as the only provider when HF_TOKEN is absent', () => {
    const providers = getAiProviderConfigs({ OPENAI_API_KEY: 'openai_test' });

    assert.equal(providers.length, 1);
    assert.equal(providers[0]?.name, 'openai');
});

test('cache namespace changes with the model', () => {
    const first = getAiCacheNamespace(getAiProviderConfigs({ HF_TOKEN: 'hf_test', HF_MODEL: 'model-a' }));
    const second = getAiCacheNamespace(getAiProviderConfigs({ HF_TOKEN: 'hf_test', HF_MODEL: 'model-b' }));

    assert.notEqual(first, second);
});

test('completion falls back when the preferred provider fails', async () => {
    const providers = getAiProviderConfigs({
        HF_TOKEN: 'hf_test',
        OPENAI_API_KEY: 'openai_test',
    });
    const requestedModels: string[] = [];
    const fetchImpl: typeof fetch = async (_input, init) => {
        const body = JSON.parse(String(init?.body)) as {
            model: string;
            response_format: { type: string };
        };
        requestedModels.push(body.model);
        assert.equal(body.response_format.type, 'json_object');

        if (requestedModels.length === 1) return new Response('provider unavailable', { status: 503 });

        return Response.json({
            choices: [{ message: { content: '{"hint":"Попробуй цикл."}' } }],
        });
    };

    const result = await requestJsonCompletion(providers, 'Дай подсказку', 200, {
        fetchImpl,
        timeoutMs: 1_000,
    });

    assert.deepEqual(result, { hint: 'Попробуй цикл.' });
    assert.deepEqual(requestedModels, [DEFAULT_HUGGING_FACE_MODEL, 'gpt-4o-mini']);
});
