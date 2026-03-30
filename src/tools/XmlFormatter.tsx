import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'format' | 'compress'>('format');

  const formatXml = (xml: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    xml = xml.replace(/>\s*</g, '><');
    
    const tokens = xml.split(/(<[^>]+>)/g).filter(t => t.trim());
    
    for (const token of tokens) {
      if (token.match(/^<\/\w/)) {
        indent = Math.max(0, indent - 1);
      }
      
      if (token.match(/^<\?xml/)) {
        formatted += token + '\n';
      } else if (token.match(/^<[^\/!][^>]*>[^<]*<\/\w+>/)) {
        formatted += tab.repeat(indent) + token + '\n';
      } else if (token.match(/^<[^\/!][^>]*>$/)) {
        formatted += tab.repeat(indent) + token + '\n';
        if (!token.match(/\/>$/)) {
          indent++;
        }
      } else if (token.match(/^<\/\w+>$/)) {
        formatted += tab.repeat(indent) + token + '\n';
      } else {
        formatted += tab.repeat(indent) + token + '\n';
      }
    }
    
    return formatted.trim();
  };

  const compressXml = (xml: string): string => {
    return xml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  };

  const processXml = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('XML 解析失败');
      }

      if (mode === 'format') {
        setOutput(formatXml(input));
      } else {
        setOutput(compressXml(input));
      }
      setError('');
    } catch (e) {
      setError(`XML 解析错误: ${(e as Error).message}`);
      setOutput('');
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
  };

  const handleSample = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <app>
    <name>开发者工具箱</name>
    <version>1.0.0</version>
  </app>
  <features>
    <feature>JSON 格式化</feature>
    <feature>XML 格式化</feature>
    <feature>哈希计算</feature>
  </features>
</config>`;
    setInput(sample);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
            XML 格式化 / 压缩
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
            格式化和压缩 XML 数据
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSample}
          className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
        >
          加载示例
        </Button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            placeholder="在此粘贴 XML 数据..."
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              输出
            </label>
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
          <textarea
            value={output}
            readOnly
            placeholder="输出将显示在这里..."
            className="w-full h-[400px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8]"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
