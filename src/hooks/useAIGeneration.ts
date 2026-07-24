import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GeneratedContent {
    theory: string;
    tasks: Task[];
}

interface Task {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    codeTemplate?: string;
}

function isGeneratedContent(value: unknown): value is GeneratedContent {
    if (!value || typeof value !== 'object') return false;

    const content = value as Partial<GeneratedContent>;
    return typeof content.theory === 'string'
        && content.theory.length > 0
        && Array.isArray(content.tasks)
        && content.tasks.length > 0;
}

export function useAIGeneration() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

    const generateLesson = useCallback(async (
        courseId: string,
        language: string,
        day: number,
        title: string,
        topics: string[]
    ): Promise<GeneratedContent | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: invokeError } = await supabase.functions.invoke(
                'generate-lesson',
                {
                    body: {
                        courseId,
                        language,
                        day,
                        title,
                        topics,
                    },
                }
            );

            if (invokeError) {
                throw invokeError;
            }

            if (!isGeneratedContent(data)) {
                throw new Error('Сервер вернул некорректный урок');
            }

            setGeneratedContent(data);
            return data;
        } catch (generationError) {
            console.error('AI generation error:', generationError);
            setError('Не удалось сгенерировать урок. Попробуйте ещё раз.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadContent = useCallback((content: GeneratedContent) => {
        setGeneratedContent(content);
        setError(null);
    }, []);

    const clearContent = useCallback(() => {
        setGeneratedContent(null);
        setError(null);
    }, []);

    return {
        generateLesson,
        generatedContent,
        isLoading,
        error,
        loadContent,
        clearContent,
    };
}
