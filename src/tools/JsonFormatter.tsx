import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      <span>
        {indent}
        {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span className="text-[#9A9A9A] dark:text-[#B0B0B0]">null</span>
        {!isLast && ','}
      </span>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <span>
        {indent}
        {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span className="text-[#7A9E7A] dark:text-[#8FBA8F]">{data.toString()}</span>
        {!isLast && ','}
      </span>
    );
  }

  if (typeof data === 'number') {
    return (
      <span>
        {indent}
        {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span className="text-[#C9A66B] dark:text-[#D4B87A]">{data}</span>
        {!isLast && ','}
      </span>
    );
  }

  if (typeof data === 'string') {
    return (
      <span>
        {indent}
        {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span className="text-[#7A9E7A] dark:text-[#8FBA8F]">&quot;{data}&quot;</span>
        {!isLast && ','}
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <span>
          {indent}
          {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          []
          {!isLast && ','}
        </span>
      );
    }

    return (
      <span>
        {indent}
        {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center hover:bg-[#EAE9E6] dark:hover:bg-[#333333] rounded px-0.5 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-[#9A9A9A]" />
          ) : (
            <ChevronRight className="w-3 h-3 text-[#9A9A9A]" />
          )}
        </button>
        {'['}
        {isExpanded ? (
          <>
            {'\n'}
            {data.map((item, index) => (
              <div key={index} className="block">
                <JsonNode
                  data={item}
                  depth={depth + 1}
                  isLast={index === data.length - 1}
                />
              </div>
            ))}
            {indent}
          </>
        ) : (
          <span className="text-[#9A9A9A]"> ...{data.length} items </span>
        )}
        {']'}
        {!isLast && ','}
      </span>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return (
        <span>
          {indent}
          {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          {'{}'}
          {!isLast && ','}
        </span>
      );
    }

    return (
      <span>
        {indent}
        {keyName && <span className="text-[#7A8BA8] dark:text-[#8BA4C9]">&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center hover:bg-[#EAE9E6] dark:hover:bg-[#333333] rounded px-0.5 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-[#9A9A9A]" />
          ) : (
            <ChevronRight className="w-3 h-3 text-[#9A9A9A]" />
          )}
        </button>
        {'{'}
        {isExpanded ? (
          <>
            {'\n'}
            {keys.map((k, index) => (
              <div key={k} className="block">
                <JsonNode
                  data={data[k]}
                  keyName={k}
                  depth={depth + 1}
                  isLast={index === keys.length - 1}
                />
              </div>
            ))}
            {indent}
          </>
        ) : (
          <span className="text-[#9A9A9A]"> ...{keys.length} keys </span>
        )}
        {'}'}
        {!isLast && ','}
      </span>
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

      if (mode === 'format') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
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
    const sample = {
      name: '开发者工具箱',
      version: '1.0.0',
      features: ['JSON 格式化', 'Base64 编解码', '哈希计算'],
      config: {
        theme: 'light',
        autoSave: true,
      },
    };
    setInput(JSON.stringify(sample));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
            JSON 格式化 / 压缩
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
            格式化、压缩 JSON 数据，支持语法高亮和树状结构浏览
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSample}
            className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
          >
            加载示例
          </Button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('format')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'format'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]'
          )}
        >
          格式化
        </button>
        <button
          onClick={() => setMode('compress')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'compress'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]'
          )}
        >
          压缩
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              输入
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!input}
              className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="在此粘贴 JSON 数据..."
            className={cn(
              'w-full h-[400px] p-4 bg-white dark:bg-[#2A2A2A] border rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all',
              error
                ? 'border-[#B87A7A] dark:border-[#C98A8A] focus:ring-[#B87A7A]/15'
                : 'border-[#D9D8D5] dark:border-[#404040] focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-[#8B9A8B]/15'
            )}
            spellCheck={false}
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-[#B87A7A] dark:text-[#C98A8A]">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              输出
            </label>
            <div className="flex items-center gap-2">
              {output && (
                <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B]">
                  {output.length} 字符
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-[#7A9E7A]" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="relative w-full h-[400px] bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg overflow-auto">
            {parsedData && mode === 'format' ? (
              <pre className="p-4 font-mono text-sm leading-relaxed whitespace-pre">
                <JsonNode data={parsedData} />
              </pre>
            ) : output ? (
              <pre className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
                {output}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-[#9A9A9A] dark:text-[#6B6B6B]">
                输出将显示在这里
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
