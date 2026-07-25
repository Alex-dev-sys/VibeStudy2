import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { GeneratedTask } from '../types/database.types';
import { useAuthStore } from '../stores/useAuthStore';

export interface GeneratedContent {
    theory: string;
    tasks: GeneratedTask[];
    source: 'ai' | 'demo';
}

export interface TaskHintResponse {
    hint: string;
}

export interface TaskReviewResponse {
    review: string;
    canComplete: boolean;
}

interface LessonPayload {
    type: 'lesson';
    trackId: string;
    language: string;
    day: number;
    title: string;
    topics: string[];
}

interface TaskAssistPayload {
    trackId: string;
    language: string;
    day: number;
    lessonTitle: string;
    taskTitle: string;
    taskDescription: string;
    userCode?: string;
}

interface HintPayload extends TaskAssistPayload {
    type: 'hint';
}

interface ReviewPayload extends TaskAssistPayload {
    type: 'review';
    userCode: string;
}

type GenerateRequestPayload = LessonPayload | HintPayload | ReviewPayload;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
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

function isGeneratedContent(value: unknown): value is Omit<GeneratedContent, 'source'> {
    if (!value || typeof value !== 'object') return false;

    const content = value as Partial<GeneratedContent>;
    return typeof content.theory === 'string' && Array.isArray(content.tasks) && content.tasks.every(isTask);
}

function isHintResponse(value: unknown): value is TaskHintResponse {
    if (!value || typeof value !== 'object') return false;
    return typeof (value as Partial<TaskHintResponse>).hint === 'string';
}

function isReviewResponse(value: unknown): value is TaskReviewResponse {
    if (!value || typeof value !== 'object') return false;

    const review = value as Partial<TaskReviewResponse>;
    return typeof review.review === 'string' && typeof review.canComplete === 'boolean';
}

async function invokeGenerateAction(payload: GenerateRequestPayload) {
    if (useAuthStore.getState().isDemo) {
        if (payload.type === 'lesson') {
            return generateDemoContent(payload.language, payload.day, payload.title, payload.topics);
        }

        if (payload.type === 'hint') {
            return generateDemoHint(payload);
        }

        return generateDemoReview(payload);
    }

    const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: payload,
    });

    if (!error) {
        return data;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        throw error;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-lesson`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
    });

    const fallbackData = await response.json();
    if (!response.ok) {
        throw new Error(
            typeof fallbackData?.error === 'string'
                ? fallbackData.error
                : `Edge Function request failed with status ${response.status}.`
        );
    }

    return fallbackData;
}

function getDemoTheory(language: string, day: number, title: string, topics: string[]) {
    const formattedTopics = topics
        .map(
            (topic, index) =>
                `### ${index + 1}. ${topic}

${topic} в ${language} полезна не сама по себе, а как часть реального сценария: чтение данных, принятие решений, работа с коллекциями или подготовка логики для проекта. В этом уроке стоит не просто повторить синтаксис, а посмотреть, как тема помогает писать код чище и увереннее.

Что важно удержать:
- зачем эта тема нужна в повседневной разработке;
- какие ошибки чаще всего делают новички;
- как проверить себя на маленьком примере перед переходом к задачам.`
        )
        .join('\n\n');

    const exampleByLanguage: Record<string, string> = {
        Python: `user_name = "VibeStudy"
points = 12

if points >= 10:
    print(f"{user_name}, отличный старт!")`,
        JavaScript: `const userName = "VibeStudy";
const points = 12;

if (points >= 10) {
  console.log(\`\${userName}, отличный старт!\`);
}`,
        Go: `package main

import "fmt"

func main() {
    userName := "VibeStudy"
    points := 12

    if points >= 10 {
        fmt.Printf("%s, отличный старт!\\n", userName)
    }
}`,
    };

    const example = exampleByLanguage[language] || exampleByLanguage.Python;

    return `# ${title}

## Что ты изучаешь сегодня

Это день ${day} в треке ${language}. Цель урока не в том, чтобы просто прочитать теорию, а в том, чтобы дойти до рабочего результата: понять идею, увидеть пример и сразу закрепить всё задачами. Такой формат важен для ежедневного ритма обучения, потому что даёт не «ощущение прогресса», а реальный маленький шаг вперёд.

## Ключевые темы дня

${formattedTopics}

## Пример

\`\`\`${language.toLowerCase()}
${example}
\`\`\`

## Как проходить этот урок

1. Сначала прочитай теорию и разберись, что именно меняется в поведении программы.
2. Затем открывай задачи по одной и не пытайся решить всё сразу.
3. Если застрял, запрашивай hint, а перед завершением задачи получай короткий AI-review.

## Что будет хорошим результатом

К концу этого урока у тебя должно получиться:
- понять материал без ощущения «я просто пролистал текст»;
- решить хотя бы несколько задач самостоятельно;
- сохранить рабочий черновик и вернуться к нему позже, если не успеваешь закончить за один заход.`;
}

function generateDemoContent(
    language: string,
    day: number,
    title: string,
    topics: string[]
): GeneratedContent {
    const templates: Record<string, string> = {
        Python: '# Напиши решение здесь\n',
        JavaScript: '// Напиши решение здесь\n',
        Go: 'package main\n\nfunc main() {\n    // Напиши решение здесь\n}\n',
    };

    return {
        source: 'demo',
        theory: getDemoTheory(language, day, title, topics),
        tasks: [
            {
                id: 1,
                title: 'Быстрый разогрев',
                description: `Создай короткий пример на ${language}, который использует одну из тем сегодняшнего урока и выводит результат.`,
                difficulty: 'easy',
                codeTemplate: templates[language] || templates.Python,
            },
            {
                id: 2,
                title: 'Условие или проверка',
                description: 'Напиши решение, которое принимает значение и принимает простое решение на основе условия.',
                difficulty: 'easy',
            },
            {
                id: 3,
                title: 'Работа с коллекцией',
                description: 'Создай список или массив, затем обработай его и выведи результат в понятном виде.',
                difficulty: 'easy',
            },
            {
                id: 4,
                title: 'Небольшая функция',
                description: 'Собери повторяющуюся логику в функцию и используй её несколько раз.',
                difficulty: 'medium',
            },
            {
                id: 5,
                title: 'Мини-сценарий',
                description: 'Смоделируй маленький жизненный сценарий: подсчёт баллов, фильтрация задач или проверка статуса.',
                difficulty: 'medium',
            },
            {
                id: 6,
                title: 'Структурируй данные',
                description: 'Собери данные в объект, словарь или структуру и выведи итог в удобном формате.',
                difficulty: 'medium',
            },
            {
                id: 7,
                title: 'Мини-проект дня',
                description: 'Собери короткую, но законченную программу по мотивам сегодняшней темы. Главное — чтобы у неё был понятный вход и результат.',
                difficulty: 'hard',
            },
        ],
    };
}

function generateDemoHint(payload: TaskAssistPayload): TaskHintResponse {
    const hasCode = Boolean(payload.userCode?.trim());

    return {
        hint: `### Подсказка

- Сначала выпиши минимальный сценарий, который должна покрывать задача: что приходит на вход и что должно получиться на выходе.
- Затем собери решение в два шага: подготовь данные, после этого выведи или верни результат.
- Если уже есть черновик, проверь, использует ли он тему урока "${payload.lessonTitle}", а не просто выводит заглушку.

${hasCode ? 'Твой черновик уже есть. Попробуй не переписывать всё заново, а улучшить текущую структуру.' : 'Начни с самого маленького рабочего варианта, даже если он покрывает только один пример.'}`,
    };
}

function generateDemoReview(payload: ReviewPayload): TaskReviewResponse {
    const trimmed = payload.userCode.trim();
    const nonEmptyLines = trimmed.split('\n').filter((line) => line.trim().length > 0);
    const hasStructure = /if|for|while|return|print|console|fmt|func|function|def|class|let|const|var|:=/i.test(trimmed);
    const canComplete = trimmed.length >= 24 && (nonEmptyLines.length >= 2 || hasStructure);

    if (!trimmed) {
        return {
            canComplete: false,
            review: `### AI-review

Пока оценивать нечего: в редакторе нет кода. Начни с минимального решения, которое покрывает один понятный сценарий, и запроси review ещё раз.`,
        };
    }

    if (canComplete) {
        return {
            canComplete: true,
            review: `### AI-review

Решение уже похоже на рабочий черновик:
- код не пустой и содержит структуру, а не только заглушку;
- видно, что ты пытаешься решить задачу, а не просто вывести тестовую строку;
- такого уровня достаточно, чтобы засчитать задачу и двигаться дальше.

Перед следующим шагом проверь названия переменных и убедись, что результат действительно соответствует условию задачи "${payload.taskTitle}".`,
        };
    }

    return {
        canComplete: false,
        review: `### AI-review

В решении уже есть начало, но пока оно выглядит слишком коротким, чтобы надёжно засчитать задачу.

Что стоит улучшить:
- добавь явную рабочую логику, а не только подготовку переменных;
- покажи итог через вывод, return или итоговое состояние данных;
- сверься с формулировкой "${payload.taskDescription}" и закрой именно её, а не соседний случай.`,
    };
}

export function useAIGeneration() {
    const [isLoading, setIsLoading] = useState(false);
    const [isHintLoading, setIsHintLoading] = useState(false);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hintError, setHintError] = useState<string | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

    const generateLesson = async (
        trackId: string,
        language: string,
        day: number,
        title: string,
        topics: string[]
    ): Promise<GeneratedContent | null> => {
        setIsLoading(true);
        setError(null);

        const payload: LessonPayload = {
            type: 'lesson',
            trackId,
            language,
            day,
            title,
            topics,
        };

        try {
            const data = await invokeGenerateAction(payload);

            if (!isGeneratedContent(data)) {
                throw new Error('AI function returned an invalid lesson payload.');
            }

            const nextContent: GeneratedContent = {
                ...data,
                source: useAuthStore.getState().isDemo ? 'demo' : 'ai',
            };

            setGeneratedContent(nextContent);
            return nextContent;
        } catch (err) {
            console.error('AI lesson generation error:', err);
            const demoContent = generateDemoContent(language, day, title, topics);
            setGeneratedContent(demoContent);
            setError(`${getErrorMessage(err, 'AI временно недоступен.')} Показываем demo-урок, чтобы ты мог продолжить без паузы.`);
            return demoContent;
        } finally {
            setIsLoading(false);
        }
    };

    const generateTaskHint = async (
        trackId: string,
        language: string,
        day: number,
        lessonTitle: string,
        task: GeneratedTask,
        userCode?: string
    ): Promise<TaskHintResponse> => {
        setIsHintLoading(true);
        setHintError(null);

        const payload: HintPayload = {
            type: 'hint',
            trackId,
            language,
            day,
            lessonTitle,
            taskTitle: task.title,
            taskDescription: task.description,
            userCode,
        };

        try {
            const data = await invokeGenerateAction(payload);
            if (!isHintResponse(data)) {
                throw new Error('AI function returned an invalid hint payload.');
            }

            return data;
        } catch (err) {
            console.error('AI hint generation error:', err);
            setHintError(`${getErrorMessage(err, 'AI-подсказка временно недоступна.')} Показываем локальную подсказку.`);
            return generateDemoHint(payload);
        } finally {
            setIsHintLoading(false);
        }
    };

    const generateTaskReview = async (
        trackId: string,
        language: string,
        day: number,
        lessonTitle: string,
        task: GeneratedTask,
        userCode: string
    ): Promise<TaskReviewResponse> => {
        setIsReviewLoading(true);
        setReviewError(null);

        const payload: ReviewPayload = {
            type: 'review',
            trackId,
            language,
            day,
            lessonTitle,
            taskTitle: task.title,
            taskDescription: task.description,
            userCode,
        };

        try {
            const data = await invokeGenerateAction(payload);
            if (!isReviewResponse(data)) {
                throw new Error('AI function returned an invalid review payload.');
            }

            return data;
        } catch (err) {
            console.error('AI review generation error:', err);
            setReviewError(`${getErrorMessage(err, 'AI-review временно недоступен.')} Показываем локальную проверку.`);
            return generateDemoReview(payload);
        } finally {
            setIsReviewLoading(false);
        }
    };

    const clearContent = () => {
        setGeneratedContent(null);
        setError(null);
        setHintError(null);
        setReviewError(null);
    };

    return {
        generateLesson,
        generateTaskHint,
        generateTaskReview,
        generatedContent,
        isLoading,
        isHintLoading,
        isReviewLoading,
        error,
        hintError,
        reviewError,
        clearContent,
    };
}
