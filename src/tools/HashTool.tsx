import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CryptoJS from 'crypto-js';

interface HashResult {
  algorithm: string;
  value: string;
}

const algorithms = [
  { id: 'md5', name: 'MD5', color: 'bg-[#7A8BA8] dark:bg-[#8BA4C9]' },
  { id: 'sha1', name: 'SHA1', color: 'bg-[#8B9A8B] dark:bg-[#7A897A]' },
  { id: 'sha256', name: 'SHA256', color: 'bg-[#7A9E7A] dark:bg-[#8FBA8F]' },
  { id: 'sha512', name: 'SHA512', color: 'bg-[#C9A66B] dark:bg-[#D4B87A]' },
];

export default function HashTool() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<HashResult[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['md5', 'sha1', 'sha256']);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uppercase, setUppercase] = useState(false);

  const calculateHashes = useCallback(() => {
    if (!input) {
      setResults([]);
      return;
    }

    const newResults: HashResult[] = [];

    if (selectedAlgorithms.includes('md5')) {
      newResults.push({
        algorithm: 'MD5',
        value: CryptoJS.MD5(input).toString(),
      });
    }

    if (selectedAlgorithms.includes('sha1')) {
      newResults.push({
        algorithm: 'SHA1',
        value: CryptoJS.SHA1(input).toString(),
      });
    }

    if (selectedAlgorithms.includes('sha256')) {
      newResults.push({
        algorithm: 'SHA256',
        value: CryptoJS.SHA256(input).toString(),
      });
    }

    if (selectedAlgorithms.includes('sha512')) {
      newResults.push({
        algorithm: 'SHA512',
        value: CryptoJS.SHA512(input).toString(),
      });
    }

    setResults(newResults);
  }, [input, selectedAlgorithms]);

  useEffect(() => {
    calculateHashes();
  }, [calculateHashes]);

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(uppercase ? value.toUpperCase() : value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setResults([]);
  };

  const toggleAlgorithm = (id: string) => {
    setSelectedAlgorithms(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          哈希计算
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          计算文本的 MD5、SHA1、SHA256、SHA512 哈希值
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
          选择算法
        </label>
        <div className="flex flex-wrap gap-2">
          {algorithms.map(({ id, name, color }) => (
            <button
              key={id}
              onClick={() => toggleAlgorithm(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedAlgorithms.includes(id)
                  ? `${color} text-white`
                  : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Uppercase Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUppercase(!uppercase)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
            uppercase
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          大写输出
        </button>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            输入文本
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
          placeholder="输入要计算哈希的文本..."
          className="w-full h-[150px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
          spellCheck={false}
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            计算结果
          </label>
          <div className="space-y-3">
            {results.map(({ algorithm, value }) => (
              <div
                key={algorithm}
                className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-[#F5F5F3] dark:bg-[#1E1E1E] border-b border-[#D9D8D5] dark:border-[#404040]">
                  <span className="text-sm font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">
                    {algorithm}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(value, algorithm)}
                    className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
                  >
                    {copiedField === algorithm ? (
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
                <div className="p-4">
                  <code className="font-mono text-sm text-[#2D2D2D] dark:text-[#E8E8E8] break-all">
                    {uppercase ? value.toUpperCase() : value}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
