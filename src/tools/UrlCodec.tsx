import { useState, useCallback } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function UrlCodec() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEncoding, setIsEncoding] = useState(true);

  const handleEncode = useCallback(() => {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
    } catch (e) {
      setOutput('编码失败: ' + (e as Error).message);
    }
  }, [input]);

  const handleDecode = useCallback(() => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (e) {
      setOutput('解码失败: 无效的 URL 编码字符串');
    }
  }, [input]);

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
          URL 编解码
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          URL Encode 和 Decode 工具
        </p>
      </div>

      {/* Encode/Decode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEncoding(true)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            isEncoding
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          Encode
        </button>
        <button
          onClick={() => setIsEncoding(false)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            !isEncoding
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          Decode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              {isEncoding ? '原文' : '编码后'}
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
            placeholder={isEncoding ? '输入要编码的文本...' : '输入 URL 编码字符串...'}
            className="w-full h-[300px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
            spellCheck={false}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              {isEncoding ? '编码后' : '原文'}
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isEncoding ? handleEncode : handleDecode}
                disabled={!input}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
              >
                {isEncoding ? 'Encode' : 'Decode'}
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
