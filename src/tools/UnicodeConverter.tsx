import { useState, useCallback } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function UnicodeConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'toUnicode' | 'fromUnicode'>('toUnicode');

  const toUnicode = useCallback((text: string): string => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code > 127) {
          return '\\u' + code.toString(16).padStart(4, '0');
        }
        return char;
      })
      .join('');
  }, []);

  const fromUnicode = useCallback((text: string): string => {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }, []);

  const handleConvert = useCallback(() => {
    try {
      if (mode === 'toUnicode') {
        setOutput(toUnicode(input));
      } else {
        setOutput(fromUnicode(input));
      }
    } catch (e) {
      setOutput('转换失败: ' + (e as Error).message);
    }
  }, [input, mode, toUnicode, fromUnicode]);

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
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          Unicode 转换
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          Unicode 与 ASCII 相互转换
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('toUnicode')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'toUnicode'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          转 Unicode
        </button>
        <button
          onClick={() => setMode('fromUnicode')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'fromUnicode'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          Unicode 转文本
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              {mode === 'toUnicode' ? '原文' : 'Unicode'}
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
            placeholder={mode === 'toUnicode' ? '输入要转换的文本...' : '输入 Unicode 字符串 (如 \\u4e2d\\u6587)...'}
            className="w-full h-[300px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
            spellCheck={false}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              {mode === 'toUnicode' ? 'Unicode' : '原文'}
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConvert}
                disabled={!input}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
              >
                转换
              </Button>
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
          <textarea
            value={output}
            readOnly
            placeholder="结果将显示在这里..."
            className="w-full h-[300px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8]"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
