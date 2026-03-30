import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [localTime, setLocalTime] = useState('');
  const [utcTime, setUtcTime] = useState('');
  const [isoString, setIsoString] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  // Update current timestamp every second
  useEffect(() => {
    const updateCurrent = () => {
      const now = Math.floor(Date.now() / 1000);
      setCurrentTimestamp(now);
    };
    updateCurrent();
    const interval = setInterval(updateCurrent, 1000);
    return () => clearInterval(interval);
  }, []);

  const convertFromTimestamp = useCallback(() => {
    if (!timestamp.trim()) {
      setLocalTime('');
      setUtcTime('');
      setIsoString('');
      return;
    }

    const ts = parseInt(timestamp);
    if (isNaN(ts)) {
      setLocalTime('无效的时间戳');
      setUtcTime('');
      setIsoString('');
      return;
    }

    const date = unit === 'seconds' ? new Date(ts * 1000) : new Date(ts);
    
    setLocalTime(date.toLocaleString('zh-CN'));
    setUtcTime(date.toUTCString());
    setIsoString(date.toISOString());
  }, [timestamp, unit]);

  const convertFromDate = useCallback((dateStr: string) => {
    if (!dateStr) {
      setTimestamp('');
      return;
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return;
    }

    const ts = unit === 'seconds' 
      ? Math.floor(date.getTime() / 1000)
      : date.getTime();
    setTimestamp(ts.toString());
  }, [unit]);

  useEffect(() => {
    convertFromTimestamp();
  }, [convertFromTimestamp]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleNow = () => {
    const now = unit === 'seconds' 
      ? Math.floor(Date.now() / 1000)
      : Date.now();
    setTimestamp(now.toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          时间戳转换
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          Unix 时间戳与本地时间、UTC 时间的双向转换
        </p>
      </div>

      {/* Current Timestamp Display */}
      <div className="bg-[#E8EBE8] dark:bg-[#8B9A8B]/10 rounded-xl p-4">
        <div className="flex items-center gap-2 text-[#6B6B6B] dark:text-[#A0A0A0] mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">当前时间戳</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-2xl font-mono font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
              {currentTimestamp}
            </span>
            <span className="text-sm text-[#9A9A9A] dark:text-[#6B6B6B] ml-2">秒</span>
          </div>
          <div>
            <span className="text-2xl font-mono font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
              {currentTimestamp * 1000}
            </span>
            <span className="text-sm text-[#9A9A9A] dark:text-[#6B6B6B] ml-2">毫秒</span>
          </div>
        </div>
      </div>

      {/* Unit Selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">单位:</span>
        <button
          onClick={() => setUnit('seconds')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm transition-all',
            unit === 'seconds'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          秒
        </button>
        <button
          onClick={() => setUnit('milliseconds')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm transition-all',
            unit === 'milliseconds'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          毫秒
        </button>
      </div>

      {/* Timestamp Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            Unix 时间戳
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNow}
            className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            现在
          </Button>
        </div>
        <input
          type="text"
          value={timestamp}
          onChange={e => setTimestamp(e.target.value)}
          placeholder={`输入 ${unit === 'seconds' ? '秒' : '毫秒'} 级时间戳...`}
          className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg font-mono text-lg text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A]"
        />
      </div>

      {/* Date Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
          或选择日期时间
        </label>
        <input
          type="datetime-local"
          onChange={e => convertFromDate(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A]"
        />
      </div>

      {/* Results */}
      {timestamp && localTime && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            转换结果
          </label>
          
          {[
            { label: '本地时间', value: localTime, field: 'local' },
            { label: 'UTC 时间', value: utcTime, field: 'utc' },
            { label: 'ISO 8601', value: isoString, field: 'iso' },
          ].map(({ label, value, field }) => (
            <div
              key={field}
              className="flex items-center gap-3 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg px-4 py-3 group"
            >
              <span className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] w-24 flex-shrink-0">
                {label}
              </span>
              <code className="flex-1 font-mono text-sm text-[#2D2D2D] dark:text-[#E8E8E8] truncate">
                {value}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(value, field)}
                className="opacity-0 group-hover:opacity-100 text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A] transition-opacity"
              >
                {copied === field ? (
                  <Check className="w-4 h-4 text-[#7A9E7A]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
