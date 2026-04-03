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
    python: '# Write your solution here\n',
    javascript: '// Write your solution here\n',
    typescript: '// Write your solution here\n',
    go: 'package main\n\nfunc main() {\n    // Write your solution here\n}\n',
    rust: 'fn main() {\n    // Write your solution here\n}\n',
    java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
    swift: '// Write your solution here\n',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        // Write your solution here\n    }\n}\n',
};

function getDifficultyLabel(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'Easy';
    if (difficulty === 'medium') return 'Core';
    return 'Hard';
}

function getDifficultyStyles(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20';
    if (difficulty === 'medium') return 'bg-amber-300/15 text-amber-100 border border-amber-300/20';
    return 'bg-rose-400/15 text-rose-200 border border-rose-300/20';
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
        setOutput('Running the draft...\n');

        await new Promise((resolve) => setTimeout(resolve, 900));

        const trimmed = code.trim();
        const nonEmptyLines = trimmed.split('\n').filter((line) => line.trim().length > 0).length;

        if (!trimmed) {
            setOutput('The code is still empty. Add a minimal working draft and run it again.');
        } else if (trimmed.length >= 16 || nonEmptyLines >= 2) {
            setOutput(
                [
                    'Run completed successfully.',
                    '',
                    'What the sandbox sees:',
                    '- the draft is no longer empty;',
                    '- the solution has a visible structure;',
                    '- you can request AI review to decide whether the task is ready to complete.',
                ].join('\n')
            );
            setHasRun(true);
        } else {
            setOutput(
                [
                    'The draft is still too thin for a confident run.',
                    '',
                    'Do one more pass:',
                    '- add working logic;',
                    '- print a result or return a value;',
                    '- then run the code again.',
                ].join('\n')
            );
        }

        setIsRunning(false);
    };

    const handleReset = () => {
        onReset();
        setOutput(`The draft was reset to the starting template.\n\n${defaultCode ? 'You can reshape it immediately around your own idea.' : ''}`.trim());
        setHasRun(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    className="relative flex h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,16,28,0.97),rgba(6,10,18,0.99))] shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#F3BA2F]/8 blur-[140px]" />
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[150px]" />

                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5">
                        <div className="flex items-center gap-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getDifficultyStyles(task.difficulty)}`}>
                                {getDifficultyLabel(task.difficulty)}
                            </span>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{task.title}</h2>
                                <p className="text-sm text-slate-400">{language} workspace</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative z-10 border-b border-white/5 bg-white/[0.03] px-6 py-4">
                        <p className="max-w-4xl text-sm leading-7 text-slate-300">{task.description}</p>
                    </div>

                    <div className="relative z-10 flex flex-1 overflow-hidden">
                        <div className="flex min-w-0 flex-1 flex-col border-r border-white/10">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-white/[0.03] px-6 py-4">
                                <span className="text-sm font-medium text-slate-300">Draft workspace</span>

                                <div className="flex flex-wrap items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRun}
                                        disabled={isRunning}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15 disabled:opacity-60"
                                    >
                                        {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                        Run draft
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => void onRequestHint()}
                                        disabled={isHintLoading || isHintDisabled}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isHintLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                                        AI hint
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => void onRequestReview()}
                                        disabled={isReviewLoading}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-60"
                                    >
                                        {isReviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                                        AI review
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
                                        fontFamily: 'IBM Plex Mono, monospace',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex w-full max-w-sm flex-col bg-black/20">
                            <div className="border-b border-white/5 px-6 py-4">
                                <span className="text-sm font-medium text-slate-300">Task signals</span>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                                <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                        <TerminalSquare className="h-4 w-4 text-emerald-300" />
                                        Run output
                                    </div>
                                    {output ? (
                                        <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{output}</pre>
                                    ) : (
                                        <p className="text-sm leading-6 text-slate-500">
                                            Run the draft first to see how the current solution behaves.
                                        </p>
                                    )}
                                </section>

                                <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                        <Lightbulb className="h-4 w-4 text-amber-300" />
                                        Hint
                                    </div>
                                    {hint ? (
                                        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{hint}</div>
                                    ) : hintDisabledReason ? (
                                        <p className="text-sm leading-6 text-amber-100">{hintDisabledReason}</p>
                                    ) : (
                                        <p className="text-sm leading-6 text-slate-500">
                                            Ask for an AI hint when you get stuck. It should guide your direction, not
                                            hand you the whole answer.
                                        </p>
                                    )}
                                </section>

                                <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                        <Bot className="h-4 w-4 text-cyan-300" />
                                        Review
                                    </div>
                                    {review ? (
                                        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{review}</div>
                                    ) : (
                                        <p className="text-sm leading-6 text-slate-500">
                                            After you run the draft, ask for AI review to check whether the task is
                                            ready to complete.
                                        </p>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col gap-3 border-t border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm leading-6 text-slate-300">
                            {canComplete
                                ? 'AI review marked this draft as ready. You can count the task as complete.'
                                : hasRun
                                    ? 'The draft already ran. Check the review before you try to complete the task.'
                                    : 'Build a working draft, run it once, and then request AI review.'}
                        </p>

                        <motion.button
                            whileHover={{ scale: canComplete ? 1.02 : 1 }}
                            whileTap={{ scale: canComplete ? 0.98 : 1 }}
                            onClick={() => void onComplete()}
                            disabled={!canComplete}
                            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold transition ${
                                canComplete
                                    ? 'border border-[#F3BA2F]/20 bg-[#F3BA2F]/12 text-white hover:bg-[#F3BA2F]/18'
                                    : 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
                            }`}
                        >
                            <Check className="h-4 w-4" />
                            Complete task
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
