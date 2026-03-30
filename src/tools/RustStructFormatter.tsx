import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SharedStyles = () => (
    <style>{`
    .line-counter { counter-reset: line; }
    .code-line { display: block; line-height: 1.6; }
    .code-line::before {
      counter-increment: line;
      content: counter(line);
      display: inline-block;
      min-width: 2.5rem;
      margin-right: 1rem;
      text-align: right;
      color: #9A9A9A;
      border-right: 1px solid #D9D8D5;
      padding-right: 0.5rem;
      user-select: none;
    }
    .dark .code-line::before {
      color: #6B6B6B;
      border-right-color: #404040;
    }
  `}</style>
);

interface CodeBlockNode {
    header: string;
    children: CodeBlockNode[];
    footer?: string;
}

const parseRustToTree = (formattedText: string): CodeBlockNode[] => {
    const lines = formattedText.split('\n');
    let i = 0;

    const parseLevel = (targetIndent: number): CodeBlockNode[] => {
        const nodes: CodeBlockNode[] = [];
        while (i < lines.length) {
            const line = lines[i];
            const indent = line.search(/\S|$/);

            if (indent < targetIndent && line.trim() !== '') break;
            if (line.trim() === '') { i++; continue; }

            const trimmed = line.trim();
            if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
                const node: CodeBlockNode = { header: line, children: [] };
                i++;
                node.children = parseLevel(indent + 2);

                if (i < lines.length) {
                    const closeIndent = lines[i].search(/\S|$/);
                    const closeTrimmed = lines[i].trim();
                    if (closeIndent === indent && (closeTrimmed.startsWith('}') || closeTrimmed.startsWith(']') || closeTrimmed.startsWith(')'))) {
                        node.footer = lines[i];
                        i++;
                    }
                }
                nodes.push(node);
            } else {
                nodes.push({ header: line, children: [] });
                i++;
            }
        }
        return nodes;
    };

    return parseLevel(0);
};

function RustNodeRenderer({ node }: { node: CodeBlockNode }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const isBlock = node.children.length > 0 || node.footer;

    const indentSpaces = node.header.search(/\S/);
    const indentStr = indentSpaces > 0 ? ' '.repeat(indentSpaces) : '';
    const headerText = node.header.trim();

    if (!isBlock) {
        return (
            <div className="code-line whitespace-pre">
                {indentStr}<span className="inline-block w-4 mr-1"></span><span className="text-[#7A9E7A] dark:text-[#8FBA8F]">{headerText}</span>
            </div>
        );
    }

    return (
        <>
            <div className="code-line whitespace-pre">
                {indentStr}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center hover:bg-[#EAE9E6] dark:hover:bg-[#333333] rounded px-0.5 transition-colors mr-1 cursor-pointer"
                >
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-[#9A9A9A]" /> : <ChevronRight className="w-3 h-3 text-[#9A9A9A]" />}
                </button>
                <span className="text-[#C9A66B] dark:text-[#D4B87A]">{headerText}</span>
                {!isExpanded && <span className="text-[#9A9A9A] ml-2">... {node.children.length} items {node.footer?.trim()}</span>}
            </div>
            {isExpanded && (
                <div>
                    {node.children.map((child, idx) => <RustNodeRenderer key={idx} node={child} />)}
                </div>
            )}
            {isExpanded && node.footer && (
                <div className="code-line whitespace-pre">
                    {indentStr}<span className="inline-block w-4 mr-1"></span><span className="text-[#C9A66B] dark:text-[#D4B87A]">{node.footer.trim()}</span>
                </div>
            )}
        </>
    );
}

export default function RustStructFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [parsedTree, setParsedTree] = useState<CodeBlockNode[]>([]);

    const formatRustStruct = (code: string): string => {
        let formatted = '';
        let indentLevel = 0;
        const indentStr = '  ';
        let inString = false;
        let normalized = code.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

        for (let i = 0; i < normalized.length; i++) {
            const char = normalized[i];
            if (inString) {
                formatted += char;
                if (char === '\\') formatted += normalized[++i] || '';
                else if (char === '"') inString = false;
                continue;
            }
            if (char === '"') { inString = true; formatted += char; continue; }
            if (char === '{' || char === '[' || char === '(') {
                indentLevel++;
                formatted += char + '\n' + indentStr.repeat(indentLevel);
            } else if (char === '}' || char === ']' || char === ')') {
                indentLevel = Math.max(0, indentLevel - 1);
                if (formatted.endsWith('\n' + indentStr.repeat(indentLevel + 1))) {
                    formatted = formatted.slice(0, -(indentStr.repeat(indentLevel + 1).length + 1));
                } else {
                    formatted += '\n' + indentStr.repeat(indentLevel);
                }
                formatted += char;
            } else if (char === ',') {
                formatted += char + '\n' + indentStr.repeat(indentLevel);
            } else if (char === ':') {
                if (normalized[i + 1] === ':') { formatted += '::'; i++; }
                else { formatted += ': '; while (normalized[i + 1] === ' ') i++; }
            } else if (char === ' ') {
                const lastChar = formatted.slice(-1);
                if (!/[\{\[\(\n, ]/.test(lastChar)) formatted += ' ';
            } else {
                formatted += char;
            }
        }
        return formatted.trim();
    };

    const processCode = useCallback(() => {
        if (!input.trim()) {
            setOutput(''); setError(''); setParsedTree([]); return;
        }
        try {
            const formatted = formatRustStruct(input);
            const tree = parseRustToTree(formatted);
            setParsedTree(tree);
            setOutput(formatted);

            const openBraces = (input.match(/[\{\[\(]/g) || []).length;
            const closeBraces = (input.match(/[\}\]\)]/g) || []).length;
            setError(openBraces !== closeBraces ? '警告: 结构体中的括号数量似乎不匹配' : '');
        } catch (e) {
            setError(`格式化错误: ${(e as Error).message}`);
            setOutput('');
            setParsedTree([]);
        }
    }, [input]);

    useEffect(() => { processCode(); }, [processCode]);

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        } catch (err) { console.error('Copy failed:', err); }
    };

    const handleClear = () => { setInput(''); setOutput(''); setError(''); setParsedTree([]); };
    const handleSample = () => setInput(`User { id: 1024, username: "admin", profile: UserProfile { age: 28, roles: ["admin", "user"] } }`);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">Rust 结构体格式化</h2>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">智能解析单行 Rust/RON 日志，带区域折叠和行号</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSample} className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]">加载示例</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">输入</label>
                        <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input} className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]">
                            <Trash2 className="w-4 h-4 mr-1" /> 清空
                        </Button>
                    </div>
                    <textarea
                        value={input} onChange={e => setInput(e.target.value)} placeholder='例如: User { id: 1 }...'
                        className={cn('w-full h-[400px] p-4 bg-white dark:bg-[#2A2A2A] border rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all', error ? 'border-[#B87A7A] dark:border-[#C98A8A] focus:ring-[#B87A7A]/15' : 'border-[#D9D8D5] dark:border-[#404040] focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-[#8B9A8B]/15')} spellCheck={false}
                    />
                    {error && <div className="flex items-center gap-2 text-sm text-[#B87A7A] dark:text-[#C98A8A]"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">输出</label>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]">
                                {copied ? <><Check className="w-4 h-4 mr-1 text-[#7A9E7A]" />已复制</> : <><Copy className="w-4 h-4 mr-1" />复制</>}
                            </Button>
                        </div>
                    </div>
                    <div className="relative w-full h-[400px] bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg overflow-auto">
                        {parsedTree.length > 0 ? (
                            <div className="p-4 font-mono text-sm line-counter">
                                <SharedStyles />
                                {parsedTree.map((node, idx) => <RustNodeRenderer key={idx} node={node} />)}
                            </div>
                        ) : (
                            <div className="p-4 font-mono text-sm text-[#9A9A9A] dark:text-[#6B6B6B]">
                                输出将显示在这里...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}