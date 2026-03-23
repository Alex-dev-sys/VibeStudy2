import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
    Play,
    RotateCcw,
    Copy,
    Check,
    Terminal,
    ChevronDown,
    Settings,
    Maximize2,
    Code2,
    Sparkles,
} from 'lucide-react';

const languages = [
    { id: 'python', name: 'Python', icon: 'Py', template: '# Welcome to Vibe Study!\n\ndef greet(name):\n    return f"Hello, {name}! Welcome to your coding journey."\n\nprint(greet("Developer"))\n' },
    { id: 'javascript', name: 'JavaScript', icon: 'JS', template: '// Welcome to Vibe Study!\n\nconst greet = (name) => {\n  return `Hello, ${name}! Welcome to your coding journey.`;\n};\n\nconsole.log(greet("Developer"));\n' },
    { id: 'go', name: 'Go', icon: 'Go', template: '// Welcome to Vibe Study!\n\npackage main\n\nimport "fmt"\n\nfunc greet(name string) string {\n    return fmt.Sprintf("Hello, %s! Welcome to your coding journey.", name)\n}\n\nfunc main() {\n    fmt.Println(greet("Developer"))\n}\n' },
    { id: 'rust', name: 'Rust', icon: 'Rs', template: '// Welcome to Vibe Study!\n\nfn greet(name: &str) -> String {\n    format!("Hello, {}! Welcome to your coding journey.", name)\n}\n\nfn main() {\n    println!("{}", greet("Developer"));\n}\n' },
    { id: 'java', name: 'Java', icon: 'Jv', template: '// Welcome to Vibe Study!\n\npublic class Main {\n    public static String greet(String name) {\n        return "Hello, " + name + "! Welcome to your coding journey.";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(greet("Developer"));\n    }\n}\n' },
    { id: 'cpp', name: 'C++', icon: 'C++', template: '// Welcome to Vibe Study!\n\n#include <iostream>\n#include <string>\n\nstd::string greet(const std::string& name) {\n    return "Hello, " + name + "! Welcome to your coding journey.";\n}\n\nint main() {\n    std::cout << greet("Developer") << std::endl;\n    return 0;\n}\n' },
    { id: 'swift', name: 'Swift', icon: 'Sw', template: '// Welcome to Vibe Study!\n\nfunc greet(_ name: String) -> String {\n    return "Hello, \\(name)! Welcome to your coding journey."\n}\n\nprint(greet("Developer"))\n' },
];

const vibeTheme = {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc' },
        { token: 'string', foreground: 'a5f3fc' },
        { token: 'number', foreground: 'fcd34d' },
        { token: 'function', foreground: '8b5cf6' },
        { token: 'variable', foreground: 'e9d5ff' },
        { token: 'type', foreground: '67e8f9' },
    ],
    colors: {
        'editor.background': '#0a051000',
        'editor.foreground': '#e9d5ff',
        'editor.lineHighlightBackground': '#1e0b3650',
        'editor.selectionBackground': '#8b5cf640',
        'editorCursor.foreground': '#8b5cf6',
        'editorLineNumber.foreground': '#6b7280',
        'editorLineNumber.activeForeground': '#8b5cf6',
        'editor.inactiveSelectionBackground': '#8b5cf620',
    },
};

export default function Playground() {
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const [code, setCode] = useState(languages[0].template);
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLanguageChange = (lang: typeof languages[0]) => {
        setSelectedLang(lang);
        setCode(lang.template);
        setOutput([]);
        setIsDropdownOpen(false);
    };

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setOutput([`> Running ${selectedLang.name} code...`, '']);

        setTimeout(() => {
            setOutput([
                `> Running ${selectedLang.name} code...`,
                '',
                'Hello, Developer! Welcome to your coding journey.',
                '',
                `OK Execution completed in 0.${Math.floor(Math.random() * 900) + 100}s`,
            ]);
            setIsRunning(false);
        }, 1000);
    }, [selectedLang]);

    const handleReset = () => {
        setCode(selectedLang.template);
        setOutput([]);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEditorMount: OnMount = (_editor, monaco) => {
        monaco.editor.defineTheme('vibe-theme', vibeTheme);
        monaco.editor.setTheme('vibe-theme');
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] pb-10">
            <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-vibe-600/20 blur-[120px] mix-blend-screen" />
            <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px] mix-blend-screen" />

            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-vibe-400"
                >
                    <Code2 className="h-5 w-5" />
                    <span>Interactive Workspace</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-bold tracking-tight text-white md:text-5xl"
                >
                    Code Playground
                </motion.h1>
            </div>

            <div className="grid h-[calc(100vh-16rem)] min-h-[600px] gap-6 lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-4"
                >
                    <div className="glass group relative flex flex-1 flex-col overflow-hidden border-white/10">
                        <div className="border-b border-white/5 bg-[#090516]/50 px-4 py-3 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full border border-white/10 bg-[#FF5F56]" />
                                    <div className="h-3 w-3 rounded-full border border-white/10 bg-[#FFBD2E]" />
                                    <div className="h-3 w-3 rounded-full border border-white/10 bg-[#27C93F]" />
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
                                    <span className="font-mono text-xs text-gray-400">
                                        main.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'javascript' ? 'js' : selectedLang.id}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Settings className="h-4 w-4 cursor-pointer text-gray-500 transition-colors hover:text-white" />
                                    <Maximize2 className="h-4 w-4 cursor-pointer text-gray-500 transition-colors hover:text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 bg-[#090516]/30">
                            <Editor
                                height="100%"
                                language={selectedLang.id === 'cpp' ? 'cpp' : selectedLang.id}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                onMount={handleEditorMount}
                                options={{
                                    fontSize: 15,
                                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                    fontLigatures: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    padding: { top: 20, bottom: 20 },
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

                    <div className="glass flex h-16 items-center justify-between border-white/10 px-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all hover:bg-white/10"
                                >
                                    <span className="text-sm font-semibold">{selectedLang.icon}</span>
                                    <span className="text-sm font-medium text-white">{selectedLang.name}</span>
                                    <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-full left-0 z-50 mb-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#090516] py-1 shadow-2xl"
                                    >
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => handleLanguageChange(lang)}
                                                className={`w-full px-4 py-2 text-left transition-colors hover:bg-white/5 ${
                                                    selectedLang.id === lang.id ? 'bg-vibe-600/20 text-white' : 'text-gray-400'
                                                }`}
                                            >
                                                <span className="mr-3 inline-block min-w-8 text-sm font-semibold">{lang.icon}</span>
                                                <span className="text-sm">{lang.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            <button onClick={handleReset} className="p-2 text-gray-400 transition-colors hover:text-white" title="Reset">
                                <RotateCcw className="h-5 w-5" />
                            </button>
                            <button onClick={() => void handleCopy()} className="p-2 text-gray-400 transition-colors hover:text-white" title="Copy">
                                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>

                        <motion.button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="btn-neon flex items-center gap-2 border border-vibe-500/50 px-6 py-2.5 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Play className={`h-4 w-4 fill-white ${isRunning ? 'animate-pulse' : ''}`} />
                            <span className="font-semibold">{isRunning ? 'Running...' : 'Run Code'}</span>
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass relative flex flex-col overflow-hidden border-vibe-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)]"
                >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-vibe-600/5 to-transparent" />

                    <div className="flex items-center gap-3 border-b border-white/10 bg-[#090516]/50 px-5 py-4">
                        <Terminal className="h-5 w-5 text-vibe-400" />
                        <span className="text-sm font-semibold tracking-wide text-white">Console Output</span>
                        <div className="ml-auto flex gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-white/10" />
                            <div className="h-2 w-2 rounded-full bg-white/10" />
                        </div>
                    </div>

                    <div className="relative flex-1 overflow-auto bg-[#0a0510]/50 p-6 font-mono text-[13px] leading-relaxed">
                        {output.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-500 opacity-60">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                                    <Sparkles className="h-8 w-8 text-vibe-400" />
                                </div>
                                <p className="max-w-[200px] text-center">Run your code to see the output here...</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {output.map((line, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={index}
                                        className={`
                                            ${line.startsWith('>') ? 'mb-2 font-bold text-vibe-400' : ''}
                                            ${line.startsWith('OK') ? 'mt-2 border-t border-white/5 pt-2 text-green-400' : ''}
                                            ${line.startsWith('ERROR') ? 'mt-2 text-red-400' : ''}
                                            ${!line.startsWith('>') && !line.startsWith('OK') && !line.startsWith('ERROR') ? 'border-l-2 border-white/5 pl-4 text-gray-300' : ''}
                                        `}
                                    >
                                        {line || '\u00A0'}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
