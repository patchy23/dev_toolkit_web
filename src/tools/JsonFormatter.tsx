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

interface JsonNodeProps {
  data: any;
  keyName?: string;
  depth?: number;
  isLast?: boolean;
}

function JsonNode({ data, keyName, depth = 0, isLast = true }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const indent = '  '.repeat(depth);

  if (data === null) {
    return (
        <div className="code-line whitespace-pre">
          {indent}
          {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          <span className="text-[#9A9A9A] dark:text-[#B0B0B0]">null</span>
          {!isLast && ','}
        </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
        <div className="code-line whitespace-pre">
          {indent}
          {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          <span className="text-[#7A9E7A] dark:text-[#8FBA8F]">{data.toString()}</span>
          {!isLast && ','}
        </div>
    );
  }

  if (typeof data === 'number') {
    return (
        <div className="code-line whitespace-pre">
          {indent}
          {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          <span className="text-[#C9A66B] dark:text-[#D4B87A]">{data}</span>
          {!isLast && ','}
        </div>
    );
  }

  if (typeof data === 'string') {
    return (
        <div className="code-line whitespace-pre">
          {indent}
          {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          <span className="text-[#7A9E7A] dark:text-[#8FBA8F]">&quot;{data}&quot;</span>
          {!isLast && ','}
        </div>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
          <div className="code-line whitespace-pre">
            {indent}
            {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
            {keyName && ': '}
            []
            {!isLast && ','}
          </div>
      );
    }
    return (
        <>
          <div className="code-line whitespace-pre">
            {indent}
            <button onClick={() => setIsExpanded(!isExpanded)} className="inline-flex items-center hover:bg-[#EAE9E6] dark:hover:bg-[#333333] rounded px-0.5 transition-colors mr-1 cursor-pointer">
              {isExpanded ? <ChevronDown className="w-3 h-3 text-[#9A9A9A]" /> : <ChevronRight className="w-3 h-3 text-[#9A9A9A]" />}
            </button>
            {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
            {keyName && ': '}
            {'['}
            {/* 修正了这里的右括号转义 */}
            {!isExpanded && <span className="text-[#9A9A9A] ml-2">... {data.length} items {']'}{!isLast && ','}</span>}
          </div>
          {isExpanded && (
              <div>
                {data.map((item, index) => <JsonNode key={index} data={item} depth={depth + 1} isLast={index === data.length - 1} />)}
              </div>
          )}
          {isExpanded && (
              <div className="code-line whitespace-pre">
                {indent}{']'}{!isLast && ','}
              </div>
          )}
        </>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return (
          <div className="code-line whitespace-pre">
            {indent}
            {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
            {keyName && ': '}
            {'{'} {'}'}
            {!isLast && ','}
          </div>
      );
    }
    return (
        <>
          <div className="code-line whitespace-pre">
            {indent}
            <button onClick={() => setIsExpanded(!isExpanded)} className="inline-flex items-center hover:bg-[#EAE9E6] dark:hover:bg-[#333333] rounded px-0.5 transition-colors mr-1 cursor-pointer">
              {isExpanded ? <ChevronDown className="w-3 h-3 text-[#9A9A9A]" /> : <ChevronRight className="w-3 h-3 text-[#9A9A9A]" />}
            </button>
            {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
            {keyName && ': '}
            {'{'}
            {/* 修正了这里的右大括号转义 */}
            {!isExpanded && <span className="text-[#9A9A9A] ml-2">... {keys.length} keys {'}'}{!isLast && ','}</span>}
          </div>
          {isExpanded && (
              <div>
                {keys.map((k, index) => <JsonNode key={k} data={data[k]} keyName={k} depth={depth + 1} isLast={index === keys.length - 1} />)}
              </div>
          )}
          {isExpanded && (
              <div className="code-line whitespace-pre">
                {indent}{'}'}{!isLast && ','}
              </div>
          )}
        </>
    );
  }
  return null;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'format' | 'compress'>('format');
  const [parsedData, setParsedData] = useState<any>(null);

  const processJson = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      setParsedData(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setParsedData(parsed);
      setOutput(mode === 'format' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(`JSON 解析错误: ${(e as Error).message}`);
      setOutput('');
      setParsedData(null);
    }
  }, [input, mode]);

  useEffect(() => {
    processJson();
  }, [processJson]);

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
    setParsedData(null);
  };

  const handleSample = () => {
    setInput(JSON.stringify({ name: '开发者工具箱', features: ['JSON', 'XML', 'Rust'], config: { theme: 'light' } }));
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">JSON 格式化 / 压缩</h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">支持语法高亮、折叠和智能行号显示</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSample} className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]">加载示例</Button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setMode('format')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', mode === 'format' ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white' : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]')}>格式化</button>
          <button onClick={() => setMode('compress')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', mode === 'compress' ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white' : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]')}>压缩</button>
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
                value={input} onChange={e => setInput(e.target.value)} placeholder="在此粘贴 JSON 数据..."
                className={cn('w-full h-[400px] p-4 bg-white dark:bg-[#2A2A2A] border rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all', error ? 'border-[#B87A7A] dark:border-[#C98A8A] focus:ring-[#B87A7A]/15' : 'border-[#D9D8D5] dark:border-[#404040] focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-[#8B9A8B]/15')} spellCheck={false}
            />
            {error && <div className="flex items-center gap-2 text-sm text-[#B87A7A] dark:text-[#C98A8A]"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">输出</label>
              <div className="flex items-center gap-2">
                {output && <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B]">{output.length} 字符</span>}
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]">
                  {copied ? <><Check className="w-4 h-4 mr-1 text-[#7A9E7A]" />已复制</> : <><Copy className="w-4 h-4 mr-1" />复制</>}
                </Button>
              </div>
            </div>
            <div className="relative w-full h-[400px] bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg overflow-auto">
              {parsedData && mode === 'format' ? (
                  <div className="p-4 font-mono text-sm line-counter">
                    <SharedStyles />
                    <JsonNode data={parsedData} />
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