import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Play, X, Check, RotateCcw, Loader2 } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    codeTemplate?: string;
}

interface TaskEditorProps {
    task: Task;
    language: string;
    onClose: () => void;
    onComplete: () => void;
}

// Маппинг языков для Monaco
const languageMap: Record<string, string> = {
    'Python': 'python',
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'Go': 'go',
    'Rust': 'rust',
    'Java': 'java',
    'C++': 'cpp',
    'Swift': 'swift',
};

// Дефолтные шаблоны для языков
const defaultTemplates: Record<string, string> = {
    'python': '# Напиши свой код здесь\n\n',
    'javascript': '// Напиши свой код здесь\n\n',
    'typescript': '// Напиши свой код здесь\n\n',
    'go': 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Напиши свой код здесь\n}\n',
    'rust': 'fn main() {\n    // Напиши свой код здесь\n}\n',
    'java': 'public class Main {\n    public static void main(String[] args) {\n        // Напиши свой код здесь\n    }\n}\n',
    'cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Напиши свой код здесь\n    return 0;\n}\n',
    'swift': '// Напиши свой код здесь\n\n',
};

export default function TaskEditor({ task, language, onClose, onComplete }: TaskEditorProps) {
    const monacoLang = languageMap[language] || 'python';
    const defaultCode = task.codeTemplate || defaultTemplates[monacoLang] || '';

    const [code, setCode] = useState(defaultCode);
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Выполняется...\n');

        // Симуляция выполнения (в реальности можно подключить API типа Judge0)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Простая проверка что код не пустой
        if (code.trim().length > 20) {
            setOutput('✅ Код выполнен успешно!\n\n' +
                'Output:\n' +
                '> Результат выполнения вашего кода\n\n' +
                '---\n' +
                'Время: 0.023s | Память: 3.2MB'
            );
            setIsCompleted(true);
        } else {
            setOutput('⚠️ Напишите больше кода для выполнения задания.\n\n' +
                'Минимальная длина кода: 20 символов'
            );
        }

        setIsRunning(false);
    };

    const handleReset = () => {
        setCode(defaultCode);
        setOutput('');
        setIsCompleted(false);
    };

    const handleComplete = () => {
        onComplete();
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-5xl h-[85vh] glass rounded-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.difficulty === 'easy'
                                    ? 'bg-green-500/20 text-green-400'
                                    : task.difficulty === 'medium'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                }`}>
                                {task.difficulty === 'easy' ? 'Легко' : task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                            </span>
                            <h2 className="text-lg font-bold text-white">{task.title}</h2>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </motion.button>
                    </div>

                    {/* Task Description */}
                    <div className="px-4 py-3 bg-dark-800/50 border-b border-white/5">
                        <p className="text-gray-300 text-sm">{task.description}</p>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Editor */}
                        <div className="flex-1 flex flex-col border-r border-white/10">
                            <div className="px-4 py-2 bg-dark-800/50 border-b border-white/5 flex items-center justify-between">
                                <span className="text-sm text-gray-400">{language}</span>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleReset}
                                        className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Сбросить
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleRun}
                                        disabled={isRunning}
                                        className="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isRunning ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                        Запустить
                                    </motion.button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    language={monacoLang}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
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

                        {/* Output */}
                        <div className="w-80 flex flex-col bg-dark-900/50">
                            <div className="px-4 py-2 bg-dark-800/50 border-b border-white/5">
                                <span className="text-sm text-gray-400">Вывод</span>
                            </div>
                            <div className="flex-1 p-4 overflow-auto font-mono text-sm">
                                {output ? (
                                    <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
                                ) : (
                                    <p className="text-gray-500 italic">Нажмите "Запустить" чтобы выполнить код</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {isCompleted ? '✓ Задание выполнено!' : 'Напишите код и нажмите "Запустить"'}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleComplete}
                            disabled={!isCompleted}
                            className={`px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${isCompleted
                                    ? 'bg-vibe-500 hover:bg-vibe-600 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Check className="w-4 h-4" />
                            Завершить задание
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
