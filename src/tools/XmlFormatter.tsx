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

function XmlNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const indent = '  '.repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return null;
    return (
        <div className="code-line whitespace-pre">
          {indent}<span className="text-[#C9A66B] dark:text-[#D4B87A]">{text}</span>
        </div>
    );
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tagName = el.tagName;
    const attrs = Array.from(el.attributes).map(attr => ` ${attr.name}="${attr.value}"`).join('');

    const childNodes = Array.from(el.childNodes).filter(n => {
      if (n.nodeType === Node.TEXT_NODE) return n.textContent?.trim() !== '';
      return true;
    });

    const isSelfClosing = childNodes.length === 0 && !el.textContent;
    const isTextOnly = childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE;

    if (isSelfClosing) {
      return (
          <div className="code-line whitespace-pre">
            {indent}<span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&lt;{tagName}{attrs}/&gt;</span>
          </div>
      );
    }

    if (isTextOnly) {
      return (
          <div className="code-line whitespace-pre">
            {indent}
            <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&lt;{tagName}{attrs}&gt;</span>
            <span className="text-[#C9A66B] dark:text-[#D4B87A]">{childNodes[0].textContent?.trim()}</span>
            <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&lt;/{tagName}&gt;</span>
          </div>
      );
    }

    return (
        <>
          <div className="code-line whitespace-pre">
            {indent}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center hover:bg-[#EAE9E6] dark:hover:bg-[#333333] rounded px-0.5 transition-colors mr-1 cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3 text-[#9A9A9A]" /> : <ChevronRight className="w-3 h-3 text-[#9A9A9A]" />}
            </button>
            <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&lt;{tagName}{attrs}&gt;</span>
            {/* 这里加上了 nodes 数量统计 */}
            {!isExpanded && <span className="text-[#9A9A9A] ml-2">... {childNodes.length} nodes &lt;/{tagName}&gt;</span>}
          </div>
          {isExpanded && (
              <div>
                {childNodes.map((child, idx) => (
                    <XmlNode key={idx} node={child} depth={depth + 1} />
                ))}
              </div>
          )}
          {isExpanded && (
              <div className="code-line whitespace-pre">
                {indent}<span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&lt;/{tagName}&gt;</span>
              </div>
          )}
        </>
    );
  }
  return null;
}

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'format' | 'compress'>('format');
  const [parsedDoc, setParsedDoc] = useState<Document | null>(null);
  const [xmlDeclaration, setXmlDeclaration] = useState<string | null>(null);

  const formatXml = (xml: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    xml = xml.replace(/\r?\n/g, '').replace(/>\s+</g, '><').trim();
    const tokens = xml.split(/(<[^>]+>)/g).filter(t => t.trim());

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.match(/^<\/\w/)) {
        indent = Math.max(0, indent - 1);
        if (i > 0 && !tokens[i-1].startsWith('<')) {
          formatted += token + '\n';
        } else {
          formatted += tab.repeat(indent) + token + '\n';
        }
      } else if (token.match(/^<\?xml/) || token.match(/^<!/)) {
        formatted += tab.repeat(indent) + token + '\n';
      } else if (token.match(/^<[^/!][^>]*>$/)) {
        if (token.match(/\/>$/)) {
          formatted += tab.repeat(indent) + token + '\n';
        } else {
          formatted += tab.repeat(indent) + token;
          if (i + 1 < tokens.length && !tokens[i+1].startsWith('<')) {
            indent++;
          } else {
            formatted += '\n';
            indent++;
          }
        }
      } else {
        formatted += token;
      }
    }
    return formatted.trim();
  };

  const processXml = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      setParsedDoc(null);
      setXmlDeclaration(null);
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');

      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('XML 解析失败');
      }

      const match = input.match(/<\?xml[^>]*\?>/);
      setXmlDeclaration(match ? match[0] : null);
      setParsedDoc(doc);

      if (mode === 'format') {
        setOutput(formatXml(input));
      } else {
        setOutput(input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim());
      }
      setError('');
    } catch (e) {
      setError(`XML 解析错误: ${(e as Error).message}`);
      setOutput('');
      setParsedDoc(null);
    }
  }, [input, mode]);

  useEffect(() => {
    processXml();
  }, [processXml]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setParsedDoc(null);
  };

  const handleSample = () => {
    setInput(`<?xml version="1.0" encoding="UTF-8"?>\n<config>\n  <app>\n    <name>开发者工具箱</name>\n    <version>1.0.0</version>\n  </app>\n</config>`);
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">XML 格式化 / 压缩</h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">格式化和压缩 XML 数据，支持区域折叠</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSample} className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]">
            加载示例
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setMode('format')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', mode === 'format' ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white' : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]')}>
            格式化
          </button>
          <button onClick={() => setMode('compress')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', mode === 'compress' ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white' : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]')}>
            压缩
          </button>
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
                value={input} onChange={e => setInput(e.target.value)} placeholder="在此粘贴 XML 数据..."
                className={cn('w-full h-[400px] p-4 bg-white dark:bg-[#2A2A2A] border rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all', error ? 'border-[#B87A7A] dark:border-[#C98A8A] focus:ring-[#B87A7A]/15' : 'border-[#D9D8D5] dark:border-[#404040] focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-[#8B9A8B]/15')} spellCheck={false}
            />
            {error && <div className="flex items-center gap-2 text-sm text-[#B87A7A] dark:text-[#C98A8A]"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">输出</label>
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]">
                {copied ? <><Check className="w-4 h-4 mr-1 text-[#7A9E7A]" />已复制</> : <><Copy className="w-4 h-4 mr-1" />复制</>}
              </Button>
            </div>
            <div className="relative w-full h-[400px] bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg overflow-auto">
              {parsedDoc && mode === 'format' ? (
                  <div className="p-4 font-mono text-sm line-counter">
                    <SharedStyles />
                    {xmlDeclaration && <div className="code-line whitespace-pre"><span className="text-[#7A8BA8] dark:text-[#8BA4C9]">{xmlDeclaration}</span></div>}
                    {Array.from(parsedDoc.childNodes).map((node, idx) => <XmlNode key={idx} node={node} />)}
                  </div>
              ) : output ? (
                  <textarea value={output} readOnly className="w-full h-full p-4 bg-transparent resize-none font-mono text-sm leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none" spellCheck={false} />
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