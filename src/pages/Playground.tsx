import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
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
    Sparkles
} from 'lucide-react';

const languages = [
    { id: 'python', name: 'Python', icon: '🐍', template: '# Welcome to Vibe Study!\n\ndef greet(name):\n    return f"Hello, {name}! Welcome to your coding journey."\n\nprint(greet("Developer"))\n' },
    { id: 'javascript', name: 'JavaScript', icon: '⚡', template: '// Welcome to Vibe Study!\n\nconst greet = (name) => {\n  return `Hello, ${name}! Welcome to your coding journey.`;\n};\n\nconsole.log(greet("Developer"));\n' },
    { id: 'go', name: 'Go', icon: '🔷', template: '// Welcome to Vibe Study!\n\npackage main\n\nimport "fmt"\n\nfunc greet(name string) string {\n    return fmt.Sprintf("Hello, %s! Welcome to your coding journey.", name)\n}\n\nfunc main() {\n    fmt.Println(greet("Developer"))\n}\n' },
    { id: 'rust', name: 'Rust', icon: '🦀', template: '// Welcome to Vibe Study!\n\nfn greet(name: &str) -> String {\n    format!("Hello, {}! Welcome to your coding journey.", name)\n}\n\nfn main() {\n    println!("{}", greet("Developer"));\n}\n' },
    { id: 'java', name: 'Java', icon: '☕', template: '// Welcome to Vibe Study!\n\npublic class Main {\n    public static String greet(String name) {\n        return "Hello, " + name + "! Welcome to your coding journey.";\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(greet("Developer"));\n    }\n}\n' },
    { id: 'cpp', name: 'C++', icon: '⚙️', template: '// Welcome to Vibe Study!\n\n#include <iostream>\n#include <string>\n\nstd::string greet(const std::string& name) {\n    return "Hello, " + name + "! Welcome to your coding journey.";\n}\n\nint main() {\n    std::cout << greet("Developer") << std::endl;\n    return 0;\n}\n' },
    { id: 'swift', name: 'Swift', icon: '🍎', template: '// Welcome to Vibe Study!\n\nfunc greet(_ name: String) -> String {\n    return "Hello, \\(name)! Welcome to your coding journey."\n}\n\nprint(greet("Developer"))\n' },
];

// Custom violet theme for Monaco
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
        'editor.background': '#0a051000', // Transparent for glass effect (handled by container)
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
        setOutput([`▶ Running ${selectedLang.name} code...`, '']);

        // Simulate code execution
        setTimeout(() => {
            const simulatedOutput = [
                `▶ Running ${selectedLang.name} code...`,
                '',
                'Hello, Developer! Welcome to your coding journey.',
                '',
                `✓ Execution completed in 0.${Math.floor(Math.random() * 900) + 100}s`,
            ];
            setOutput(simulatedOutput);
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

    const handleEditorMount = (_editor: any, monaco: any) => {
        monaco.editor.defineTheme('vibe-theme', vibeTheme);
        monaco.editor.setTheme('vibe-theme');
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] relative pb-10">
            {/* Background Nebula/Mesh */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vibe-600/20 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-screen" />

            {/* Header Title */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-vibe-400 mb-2 uppercase tracking-wider text-sm font-semibold"
                >
                    <Code2 className="w-5 h-5" />
                    <span>Interactive Workspace</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                >
                    Code Playground
                </motion.h1>
            </div>

            {/* Main Layout Grid */}
            <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[600px]">

                {/* Editor Column */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-4"
                >
                    {/* Editor Frame */}
                    <div className="flex-1 glass border-white/10 overflow-hidden flex flex-col relative group">
                        {/* Control Dots Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#090516]/50 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-white/10" />
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-white/10" />
                                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-white/10" />
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                <span className="text-xs font-mono text-gray-400">main.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'javascript' ? 'js' : selectedLang.id}</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                                <Maximize2 className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </div>

                        {/* Monaco Editor */}
                        <div className="flex-1 bg-[#090516]/30 relative">
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

                    {/* Bottom Control Bar */}
                    <div className="h-16 glass border-white/10 flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-all"
                                >
                                    <span className="text-lg">{selectedLang.icon}</span>
                                    <span className="text-sm font-medium text-white">{selectedLang.name}</span>
                                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-full left-0 mb-2 w-48 bg-[#090516] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-1"
                                    >
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => handleLanguageChange(lang)}
                                                className={`
                                                    w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-white/5 transition-colors
                                                    ${selectedLang.id === lang.id ? 'bg-vibe-600/20 text-white' : 'text-gray-400'}
                                                `}
                                            >
                                                <span>{lang.icon}</span>
                                                <span className="text-sm">{lang.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            <button onClick={handleReset} className="p-2 text-gray-400 hover:text-white transition-colors" title="Reset">
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white transition-colors" title="Copy">
                                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>

                        <motion.button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="btn-neon flex items-center gap-2 px-6 py-2.5 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-vibe-500/50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-pulse' : ''}`} />
                            <span className="font-semibold">{isRunning ? 'Running...' : 'Run Code'}</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Console Column */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass border-vibe-500/30 flex flex-col overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.1)] relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-vibe-600/5 to-transparent pointer-events-none" />

                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#090516]/50">
                        <Terminal className="w-5 h-5 text-vibe-400" />
                        <span className="text-sm font-semibold text-white tracking-wide">Console Output</span>
                        <div className="ml-auto flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                        </div>
                    </div>

                    <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed overflow-auto bg-[#0a0510]/50 relative">
                        {output.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-60">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-vibe-400" />
                                </div>
                                <p className="text-center max-w-[200px]">Run your code to see the output here...</p>
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
                                            ${line.startsWith('▶') ? 'text-vibe-400 font-bold mb-2' : ''}
                                            ${line.startsWith('✓') ? 'text-green-400 mt-2 border-t border-white/5 pt-2' : ''}
                                            ${line.startsWith('✗') ? 'text-red-400 mt-2' : ''}
                                            ${!line.startsWith('▶') && !line.startsWith('✓') && !line.startsWith('✗') ? 'text-gray-300 pl-4 border-l-2 border-white/5' : ''}
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
