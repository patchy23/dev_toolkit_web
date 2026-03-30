import { useState, useCallback, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  chars: number;
  charsNoSpace: number;
  words: number;
  lines: number;
  bytes: number;
  chinese: number;
  english: number;
  numbers: number;
  punctuation: number;
}

export default function TextStats() {
  const [input, setInput] = useState('');
  const [stats, setStats] = useState<Stats>({
    chars: 0,
    charsNoSpace: 0,
    words: 0,
    lines: 0,
    bytes: 0,
    chinese: 0,
    english: 0,
    numbers: 0,
    punctuation: 0,
  });

  const calculateStats = useCallback((text: string): Stats => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    const bytes = new Blob([text]).size;

    // Count Chinese characters
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

    // Count English words
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    const english = englishWords.length;

    // Count numbers
    const numbers = (text.match(/\d/g) || []).length;

    // Count punctuation
    const punctuation = (text.match(/[，。！？、；：""''（）【】《》.,!?;:'"()\[\]{}]/g) || []).length;

    // Total words (Chinese chars + English words)
    const words = chinese + english;

    return {
      chars,
      charsNoSpace,
      words,
      lines,
      bytes,
      chinese,
      english,
      numbers,
      punctuation,
    };
  }, []);

  useEffect(() => {
    setStats(calculateStats(input));
  }, [input, calculateStats]);

  const handleClear = () => {
    setInput('');
  };

  const statItems = [
    { label: '总字符数', value: stats.chars, color: 'text-[#2D2D2D] dark:text-[#E8E8E8]' },
    { label: '不含空格', value: stats.charsNoSpace, color: 'text-[#6B6B6B] dark:text-[#A0A0A0]' },
    { label: '词数', value: stats.words, color: 'text-[#8B9A8B] dark:text-[#9AB89A]' },
    { label: '行数', value: stats.lines, color: 'text-[#7A8BA8] dark:text-[#8BA4C9]' },
    { label: '字节数', value: stats.bytes, color: 'text-[#C9A66B] dark:text-[#D4B87A]' },
    { label: '中文字符', value: stats.chinese, color: 'text-[#B87A7A] dark:text-[#C98A8A]' },
    { label: '英文单词', value: stats.english, color: 'text-[#7A9E7A] dark:text-[#8FBA8F]' },
    { label: '数字', value: stats.numbers, color: 'text-[#9A9A9A] dark:text-[#6B6B6B]' },
    { label: '标点符号', value: stats.punctuation, color: 'text-[#9A9A9A] dark:text-[#6B6B6B]' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          文本统计
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          统计字数、字符数、行数等信息
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {statItems.slice(0, 5).map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4 text-center"
          >
            <div className={`text-2xl font-semibold ${color}`}>
              {value.toLocaleString()}
            </div>
            <div className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-4 gap-3">
        {statItems.slice(5).map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-[#F5F5F3] dark:bg-[#1E1E1E] rounded-lg p-3 text-center"
          >
            <div className={`text-lg font-medium ${color}`}>
              {value.toLocaleString()}
            </div>
            <div className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] mt-0.5">
              {label}
            </div>
          </div>
        ))}
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
          placeholder="在此输入或粘贴文本..."
          className="w-full h-[300px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
