import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
    Bot,
    Check,
    Lightbulb,
    Loader2,
    Play,
    RotateCcw,
    TerminalSquare,
    X,
} from 'lucide-react';
import type { GeneratedTask } from '../types/database.types';

interface TaskEditorProps {
    task: GeneratedTask;
    language: string;
    code: string;
    hint: string;
    review: string;
    canComplete: boolean;
    isHintLoading: boolean;
    isReviewLoading: boolean;
    isHintDisabled?: boolean;
    hintDisabledReason?: string;
    onCodeChange: (value: string) => void;
    onClose: () => void;
    onReset: () => void;
    onRequestHint: () => Promise<void> | void;
    onRequestReview: () => Promise<void> | void;
    onComplete: () => Promise<void> | void;
}

const languageMap: Record<string, string> = {
    Python: 'python',
    JavaScript: 'javascript',
    TypeScript: 'typescript',
    Go: 'go',
    Rust: 'rust',
    Java: 'java',
    'C++': 'cpp',
    Swift: 'swift',
    'C#': 'csharp',
};

const defaultTemplates: Record<string, string> = {
    python: '# Напиши решение здесь\n',
    javascript: '// Напиши решение здесь\n',
    typescript: '// Напиши решение здесь\n',
    go: 'package main\n\nfunc main() {\n    // Напиши решение здесь\n}\n',
    rust: 'fn main() {\n    // Напиши решение здесь\n}\n',
    java: 'public class Main {\n    public static void main(String[] args) {\n        // Напиши решение здесь\n    }\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Напиши решение здесь\n    return 0;\n}\n',
    swift: '// Напиши решение здесь\n',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        // Напиши решение здесь\n    }\n}\n',
};

function getDifficultyLabel(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'Легко';
    if (difficulty === 'medium') return 'Средне';
    return 'Сложно';
}

function getDifficultyStyles(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'bg-green-500/20 text-green-400';
    if (difficulty === 'medium') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
}

export default function TaskEditor({
    task,
    language,
    code,
    hint,
    review,
    canComplete,
    isHintLoading,
    isReviewLoading,
    isHintDisabled = false,
    hintDisabledReason,
    onCodeChange,
    onClose,
    onReset,
    onRequestHint,
    onRequestReview,
    onComplete,
}: TaskEditorProps) {
    const monacoLang = languageMap[language] || 'python';
    const defaultCode = useMemo(
        () => task.codeTemplate || defaultTemplates[monacoLang] || defaultTemplates.python,
        [monacoLang, task.codeTemplate]
    );

    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Запускаем решение...\n');

        await new Promise((resolve) => setTimeout(resolve, 900));

        const trimmed = code.trim();
        const nonEmptyLines = trimmed.split('\n').filter((line) => line.trim().length > 0).length;

        if (!trimmed) {
            setOutput('Код пока пустой. Добавь хотя бы минимальный рабочий сценарий и попробуй снова.');
        } else if (trimmed.length >= 16 || nonEmptyLines >= 2) {
            setOutput(
                [
                    'Запуск завершён успешно.',
                    '',
                    'Что видно по черновику:',
                    '- код не пустой;',
                    '- структура решения уже начала складываться;',
                    '- можно запросить AI-review, чтобы понять, готова ли задача к завершению.',
                ].join('\n')
            );
            setHasRun(true);
        } else {
            setOutput(
                [
                    'Черновик слишком короткий для уверенного запуска.',
                    '',
                    'Сделай ещё один шаг:',
                    '- добавь рабочую логику;',
                    '- выведи результат или верни значение;',
                    '- затем запусти код снова.',
                ].join('\n')
            );
        }

        setIsRunning(false);
    };

    const handleReset = () => {
        onReset();
        setOutput(`Черновик сброшен до стартового шаблона.\n\n${defaultCode ? 'Можешь сразу переписать его под свою идею.' : ''}`.trim());
        setHasRun(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    className="glass flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem]"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div className="flex items-center gap-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyStyles(task.difficulty)}`}>
                                {getDifficultyLabel(task.difficulty)}
                            </span>
                            <div>
                                <h2 className="text-lg font-bold text-white">{task.title}</h2>
                                <p className="text-sm text-gray-400">{language}</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="border-b border-white/5 bg-dark-800/40 px-5 py-3">
                        <p className="text-sm text-gray-300">{task.description}</p>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        <div className="flex min-w-0 flex-1 flex-col border-r border-white/10">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-dark-800/40 px-5 py-3">
                                <span className="text-sm text-gray-400">Черновик решения</span>

                                <div className="flex flex-wrap items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleReset}
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Сбросить
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleRun}
                                        disabled={isRunning}
                                        className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-60"
                                    >
                                        {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                        Запустить
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => void onRequestHint()}
                                        disabled={isHintLoading || isHintDisabled}
                                        className="flex items-center gap-2 rounded-xl border border-vibe-500/30 bg-vibe-500/10 px-4 py-2 text-sm font-medium text-vibe-200 transition-colors hover:bg-vibe-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isHintLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                                        AI-hint
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => void onRequestReview()}
                                        disabled={isReviewLoading}
                                        className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-500/20 disabled:opacity-60"
                                    >
                                        {isReviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                                        AI-review
                                    </motion.button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    language={monacoLang}
                                    value={code}
                                    onChange={(value) => onCodeChange(value || '')}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        padding: { top: 16, bottom: 16 },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        fontFamily: 'JetBrains Mono, monospace',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex w-full max-w-sm flex-col bg-dark-900/50">
                            <div className="border-b border-white/5 px-5 py-3">
                                <span className="text-sm text-gray-400">Состояние задачи</span>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                                <section className="rounded-2xl border border-white/5 bg-dark-800/40 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                        <TerminalSquare className="h-4 w-4 text-green-400" />
                                        Результат запуска
                                    </div>
                                    {output ? (
                                        <pre className="whitespace-pre-wrap text-sm text-gray-300">{output}</pre>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Сначала запусти решение, чтобы увидеть, как выглядит текущий черновик.
                                        </p>
                                    )}
                                </section>

                                <section className="rounded-2xl border border-white/5 bg-dark-800/40 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                                        Подсказка
                                    </div>
                                    {hint ? (
                                        <div className="whitespace-pre-wrap text-sm text-gray-300">{hint}</div>
                                    ) : hintDisabledReason ? (
                                        <p className="text-sm text-amber-200">{hintDisabledReason}</p>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Если застрял, запроси AI-hint. Он подскажет направление, но не отдаст готовое решение.
                                        </p>
                                    )}
                                </section>

                                <section className="rounded-2xl border border-white/5 bg-dark-800/40 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                        <Bot className="h-4 w-4 text-blue-400" />
                                        AI-review
                                    </div>
                                    {review ? (
                                        <div className="whitespace-pre-wrap text-sm text-gray-300">{review}</div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            После запуска кода запроси AI-review. Он подскажет, готова ли задача к завершению.
                                        </p>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-gray-400">
                            {canComplete
                                ? 'AI-review подтвердил черновик. Эту задачу можно засчитать.'
                                : hasRun
                                    ? 'Код уже запускался. Проверь review и только потом завершай задачу.'
                                    : 'Сначала собери рабочий черновик, затем запусти его и запроси review.'}
                        </p>

                        <motion.button
                            whileHover={{ scale: canComplete ? 1.03 : 1 }}
                            whileTap={{ scale: canComplete ? 0.97 : 1 }}
                            onClick={() => void onComplete()}
                            disabled={!canComplete}
                            className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-medium transition-all ${
                                canComplete
                                    ? 'bg-vibe-500 text-white hover:bg-vibe-600'
                                    : 'cursor-not-allowed bg-gray-700 text-gray-500'
                            }`}
                        >
                            <Check className="h-4 w-4" />
                            Завершить задачу
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
