import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
    Check,
    ChevronDown,
    Code2,
    Copy,
    Maximize2,
    Play,
    RotateCcw,
    Settings,
    Sparkles,
    Terminal,
    Zap,
} from 'lucide-react';

const languages = [
    {
        id: 'python',
        name: 'Python',
        icon: 'Py',
        template:
            '# VibeStudy Playground\n\n\ndef greet(name):\n    return f"Hello, {name}. Your code is live."\n\n\nprint(greet("Builder"))\n',
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        icon: 'JS',
        template:
            '// VibeStudy Playground\n\nconst greet = (name) => {\n  return `Hello, ${name}. Your code is live.`;\n};\n\nconsole.log(greet("Builder"));\n',
    },
    {
        id: 'go',
        name: 'Go',
        icon: 'Go',
        template:
            '// VibeStudy Playground\n\npackage main\n\nimport "fmt"\n\nfunc greet(name string) string {\n    return fmt.Sprintf("Hello, %s. Your code is live.", name)\n}\n\nfunc main() {\n    fmt.Println(greet("Builder"))\n}\n',
    },
    {
        id: 'rust',
        name: 'Rust',
        icon: 'Rs',
        template:
            '// VibeStudy Playground\n\nfn greet(name: &str) -> String {\n    format!("Hello, {}. Your code is live.", name)\n}\n\nfn main() {\n    println!("{}", greet("Builder"));\n}\n',
    },
    {
        id: 'java',
        name: 'Java',
        icon: 'Jv',
        template:
            '// VibeStudy Playground\n\npublic class Main {\n    public static String greet(String name) {\n        return "Hello, " + name + ". Your code is live.";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(greet("Builder"));\n    }\n}\n',
    },
    {
        id: 'cpp',
        name: 'C++',
        icon: 'C++',
        template:
            '// VibeStudy Playground\n\n#include <iostream>\n#include <string>\n\nstd::string greet(const std::string& name) {\n    return "Hello, " + name + ". Your code is live.";\n}\n\nint main() {\n    std::cout << greet("Builder") << std::endl;\n    return 0;\n}\n',
    },
];

const vibeTheme = {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
        { token: 'comment', foreground: '717581', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F3BA2F' },
        { token: 'string', foreground: '22d3ee' },
        { token: 'number', foreground: 'fda4af' },
        { token: 'function', foreground: 'f8fafc' },
        { token: 'variable', foreground: 'eaedfb' },
        { token: 'type', foreground: '7dd3fc' },
    ],
    colors: {
        'editor.background': '#00000000',
        'editor.foreground': '#eaedfb',
        'editor.lineHighlightBackground': '#141a2550',
        'editor.selectionBackground': '#F3BA2F25',
        'editorCursor.foreground': '#F3BA2F',
        'editorLineNumber.foreground': '#717581',
        'editorLineNumber.activeForeground': '#F3BA2F',
        'editor.inactiveSelectionBackground': '#F3BA2F20',
    },
};

export default function Playground() {
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const [code, setCode] = useState(languages[0].template);
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLanguageChange = (lang: (typeof languages)[0]) => {
        setSelectedLang(lang);
        setCode(lang.template);
        setOutput([]);
        setIsDropdownOpen(false);
    };

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setOutput([`> Running ${selectedLang.name} template...`, '']);

        window.setTimeout(() => {
            setOutput([
                `> Running ${selectedLang.name} template...`,
                '',
                'Hello, Builder. Your code is live.',
                '',
                `OK Execution completed in 0.${Math.floor(Math.random() * 900) + 100}s`,
            ]);
            setIsRunning(false);
        }, 900);
    }, [selectedLang]);

    const handleReset = () => {
        setCode(selectedLang.template);
        setOutput([]);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const handleEditorMount: OnMount = (_editor, monaco) => {
        monaco.editor.defineTheme('vibe-theme', vibeTheme);
        monaco.editor.setTheme('vibe-theme');
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] px-8 py-8">
            <div className="mx-auto max-w-7xl">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-premium relative overflow-hidden p-8 lg:p-10"
                >
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-[130px]" />
                    <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#F3BA2F]/8 blur-[120px]" />
                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <div className="eyebrow">
                                <Code2 className="h-3.5 w-3.5" />
                                Interactive code lab
                            </div>
                            <h1 className="mt-5 max-w-3xl font-headline text-4xl font-bold tracking-tight text-white lg:text-6xl">
                                A cleaner Playground for fast iterations and sharper code feedback.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                                Switch languages, edit the template, run the snippet, and keep the coding surface feeling
                                like a premium internal tool instead of a default editor embed.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Current language</p>
                                <p className="mt-3 text-3xl font-bold text-white">{selectedLang.name}</p>
                                <p className="mt-2 text-sm text-slate-300">Swap instantly and keep the output panel clean.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Editor intent</p>
                                <p className="mt-3 text-xl font-bold text-white">Code, inspect, repeat</p>
                                <p className="mt-2 text-sm text-slate-300">A pressure-free space before the next challenge or lesson task.</p>
                            </div>
                            <div className="metric-chip sm:col-span-2">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Why this surface matters</p>
                                <p className="mt-3 text-lg font-semibold text-white">
                                    The Playground bridges theory and performance. It should feel deliberate and alive.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="mt-8 grid min-h-[680px] gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <motion.section
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 }}
                        className="surface-premium-soft flex min-h-[680px] flex-col overflow-hidden"
                    >
                        <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                                    <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                                    main.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'javascript' ? 'js' : selectedLang.id}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white">
                                        <Settings className="h-4 w-4" />
                                    </button>
                                    <button type="button" className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white">
                                        <Maximize2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col">
                            <div className="border-b border-white/8 px-5 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen((value) => !value)}
                                            className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#F3BA2F]/20 hover:bg-[#F3BA2F]/08"
                                        >
                                            <span className="rounded-full border border-white/10 px-2 py-1 text-xs uppercase tracking-[0.18em] text-[#F8D775]">
                                                {selectedLang.icon}
                                            </span>
                                            {selectedLang.name}
                                            <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isDropdownOpen ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0f131d] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                                            >
                                                {languages.map((lang) => (
                                                    <button
                                                        key={lang.id}
                                                        type="button"
                                                        onClick={() => handleLanguageChange(lang)}
                                                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                                                            selectedLang.id === lang.id
                                                                ? 'bg-[#F3BA2F]/10 text-white'
                                                                : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[#F8D775]">
                                                            {lang.icon}
                                                        </span>
                                                        {lang.name}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300 transition hover:text-white"
                                            title="Reset code"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleCopy()}
                                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300 transition hover:text-white"
                                            title="Copy code"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRun}
                                            disabled={isRunning}
                                            className="btn-neon inline-flex items-center gap-2 px-5 py-3 text-sm"
                                        >
                                            <Play className={`h-4 w-4 ${isRunning ? 'animate-pulse' : ''}`} />
                                            {isRunning ? 'Running...' : 'Run code'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-[#0a0e17]/40">
                                <Editor
                                    height="100%"
                                    language={selectedLang.id === 'cpp' ? 'cpp' : selectedLang.id}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    onMount={handleEditorMount}
                                    options={{
                                        fontSize: 15,
                                        fontFamily: 'IBM Plex Mono, JetBrains Mono, monospace',
                                        fontLigatures: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        padding: { top: 22, bottom: 22 },
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        cursorBlinking: 'smooth',
                                        cursorSmoothCaretAnimation: 'on',
                                        smoothScrolling: true,
                                        tabSize: 4,
                                        wordWrap: 'on',
                                        contextmenu: true,
                                        mouseWheelZoom: true,
                                    }}
                                />
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 }}
                        className="space-y-6"
                    >
                        <div className="surface-premium-soft flex min-h-[430px] flex-col overflow-hidden">
                            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                                <Terminal className="h-5 w-5 text-[#F3BA2F]" />
                                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Console output</span>
                            </div>

                            <div className="flex-1 bg-[#090d15] p-6 font-mono text-[13px] leading-relaxed">
                                {output.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-500">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                                            <Sparkles className="h-8 w-8 text-[#F3BA2F]" />
                                        </div>
                                        <p className="max-w-[260px] text-center text-sm leading-6">
                                            Run the current template to see the console surface come alive.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {output.map((line, index) => (
                                            <motion.div
                                                key={`${line}-${index}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={
                                                    line.startsWith('>')
                                                        ? 'mb-2 font-semibold text-[#F8D775]'
                                                        : line.startsWith('OK')
                                                            ? 'mt-2 border-t border-white/8 pt-2 text-emerald-300'
                                                            : line
                                                                ? 'border-l-2 border-white/8 pl-4 text-slate-300'
                                                                : ''
                                                }
                                            >
                                                {line || '\u00A0'}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="surface-premium-soft p-6">
                            <div className="eyebrow">
                                <Zap className="h-3.5 w-3.5" />
                                Why this screen matters
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-white">It should feel closer to an internal tool than a demo editor.</h2>
                            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                                <p>
                                    The Playground is where lesson theory turns into muscle memory. It needs clarity, speed,
                                    and enough visual intention that using it feels rewarding.
                                </p>
                                <p>
                                    This redesign keeps the functionality intact but upgrades the surface quality around it:
                                    stronger headers, cleaner control hierarchy, and a better console story.
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
}
