import type { ReactNode } from 'react';

interface LessonMarkdownProps {
    content: string;
}

function renderInline(text: string): ReactNode[] {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

    return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={index} className="rounded bg-dark-700 px-2 py-1 text-vibe-300">
                    {part.slice(1, -1)}
                </code>
            );
        }

        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="font-semibold text-white">
                    {part.slice(2, -2)}
                </strong>
            );
        }

        return part;
    });
}

export default function LessonMarkdown({ content }: LessonMarkdownProps) {
    const normalized = content.replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');
    const blocks: ReactNode[] = [];
    let paragraph: string[] = [];
    let listItems: string[] = [];
    let codeLines: string[] = [];
    let codeLanguage = '';
    let inCodeBlock = false;

    const flushParagraph = () => {
        if (paragraph.length === 0) return;

        blocks.push(
            <p key={`paragraph-${blocks.length}`} className="mb-4 leading-relaxed text-gray-300">
                {renderInline(paragraph.join(' '))}
            </p>
        );
        paragraph = [];
    };

    const flushList = () => {
        if (listItems.length === 0) return;

        blocks.push(
            <ul key={`list-${blocks.length}`} className="mb-4 list-disc space-y-2 pl-6 text-gray-300">
                {listItems.map((item, index) => (
                    <li key={index}>{renderInline(item)}</li>
                ))}
            </ul>
        );
        listItems = [];
    };

    const flushCode = () => {
        if (codeLines.length === 0) return;

        blocks.push(
            <pre key={`code-${blocks.length}`} className="mb-4 overflow-x-auto rounded-xl bg-dark-900 p-4">
                <code className="font-mono text-sm text-vibe-200" data-language={codeLanguage || undefined}>
                    {codeLines.join('\n')}
                </code>
            </pre>
        );
        codeLines = [];
        codeLanguage = '';
    };

    for (const line of lines) {
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                flushCode();
                inCodeBlock = false;
            } else {
                flushParagraph();
                flushList();
                inCodeBlock = true;
                codeLanguage = line.slice(3).trim();
            }
            continue;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            continue;
        }

        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            flushParagraph();
            listItems.push(trimmed.slice(2));
            continue;
        }

        if (/^\d+\.\s/.test(trimmed)) {
            flushParagraph();
            listItems.push(trimmed.replace(/^\d+\.\s/, ''));
            continue;
        }

        if (trimmed.startsWith('### ')) {
            flushParagraph();
            flushList();
            blocks.push(
                <h3 key={`h3-${blocks.length}`} className="mb-3 mt-6 text-lg font-semibold text-white">
                    {renderInline(trimmed.slice(4))}
                </h3>
            );
            continue;
        }

        if (trimmed.startsWith('## ')) {
            flushParagraph();
            flushList();
            blocks.push(
                <h2 key={`h2-${blocks.length}`} className="mb-4 mt-8 text-xl font-bold text-white">
                    {renderInline(trimmed.slice(3))}
                </h2>
            );
            continue;
        }

        if (trimmed.startsWith('# ')) {
            flushParagraph();
            flushList();
            blocks.push(
                <h1 key={`h1-${blocks.length}`} className="mb-4 text-2xl font-bold text-white">
                    {renderInline(trimmed.slice(2))}
                </h1>
            );
            continue;
        }

        paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();
    flushCode();

    return <div>{blocks}</div>;
}
