import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as cronParser from 'cron-parser';

interface CronField {
  name: string;
  min: number;
  max: number;
  value: string;
}

const cronFields: CronField[] = [
  { name: '秒', min: 0, max: 59, value: '0' },
  { name: '分', min: 0, max: 59, value: '0' },
  { name: '时', min: 0, max: 23, value: '0' },
  { name: '日', min: 1, max: 31, value: '*' },
  { name: '月', min: 1, max: 12, value: '*' },
  { name: '周', min: 0, max: 6, value: '*' },
];

const presetCrons = [
  { name: '每分钟', value: '0 * * * * *', desc: '每分钟执行一次' },
  { name: '每小时', value: '0 0 * * * *', desc: '每小时整点执行' },
  { name: '每天', value: '0 0 0 * * *', desc: '每天零点执行' },
  { name: '每周一', value: '0 0 0 * * 1', desc: '每周一零点执行' },
  { name: '每月1日', value: '0 0 0 1 * *', desc: '每月1日零点执行' },
  { name: '每年1月1日', value: '0 0 0 1 1 *', desc: '每年1月1日零点执行' },
];

export default function CronGenerator() {
  const [mode, setMode] = useState<'generate' | 'parse'>('generate');
  const [cronInput, setCronInput] = useState('0 0 * * *');
  const [cronFormat, setCronFormat] = useState<'5' | '6' | '7'>('5');
  const [fields, setFields] = useState<CronField[]>(cronFields.map(f => ({ ...f })));
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  const [humanReadable, setHumanReadable] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const parseCron = useCallback(() => {
    if (!cronInput.trim()) {
      setNextExecutions([]);
      setHumanReadable('');
      setError('');
      return;
    }

    try {
      let cronExpr = cronInput.trim();
      
      // Adjust for different formats
      if (cronFormat === '5') {
        // 5-field cron doesn't have seconds
        cronExpr = '0 ' + cronExpr;
      } else if (cronFormat === '7') {
        // 7-field cron has year, we need to remove it
        const parts = cronExpr.split(' ');
        if (parts.length === 7) {
          cronExpr = parts.slice(0, 6).join(' ');
        }
      }

      const interval = cronParser.CronExpressionParser.parse(cronExpr);
      const executions: string[] = [];
      
      for (let i = 0; i < 5; i++) {
        executions.push(interval.next().toDate().toLocaleString('zh-CN'));
      }

      setNextExecutions(executions);
      setHumanReadable(getHumanReadable(cronInput.trim(), cronFormat));
      setError('');
    } catch (e) {
      setError('无效的 Cron 表达式: ' + (e as Error).message);
      setNextExecutions([]);
      setHumanReadable('');
    }
  }, [cronInput, cronFormat]);

  const getHumanReadable = (cron: string, format: string): string => {
    const parts = cron.split(' ');
    const len = parts.length;
    
    if (format === '5' && len === 5) {
      const [min, hour, day, month, week] = parts;
      if (min === '0' && hour === '0' && day === '*' && month === '*' && week === '*') {
        return '每天零点执行';
      }
      if (min === '0' && hour === '*' && day === '*' && month === '*' && week === '*') {
        return '每小时整点执行';
      }
      if (min === '*' && hour === '*' && day === '*' && month === '*' && week === '*') {
        return '每分钟执行';
      }
    }
    
    return '自定义调度';
  };

  const generateCronFromFields = useCallback(() => {
    if (cronFormat === '5') {
      return fields.slice(1).map(f => f.value).join(' ');
    }
    return fields.map(f => f.value).join(' ');
  }, [fields, cronFormat]);

  useEffect(() => {
    if (mode === 'generate') {
      const generated = generateCronFromFields();
      setCronInput(generated);
      parseCron();
    }
  }, [fields, cronFormat, mode, generateCronFromFields, parseCron]);

  useEffect(() => {
    if (mode === 'parse') {
      parseCron();
    }
  }, [cronInput, cronFormat, mode, parseCron]);

  const handleFieldChange = (index: number, value: string) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, value } : f));
  };

  const handlePresetSelect = (value: string) => {
    setCronInput(value);
    // Parse and update fields
    const parts = value.split(' ');
    if (parts.length >= 5) {
      setFields(prev => prev.map((f, i) => ({
        ...f,
        value: parts[i] || f.value
      })));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cronInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setCronInput('');
    setNextExecutions([]);
    setHumanReadable('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          Cron 表达式生成与解析
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          生成和解析 Cron 表达式，支持 5/6/7 位格式
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('generate')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'generate'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          生成器
        </button>
        <button
          onClick={() => setMode('parse')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'parse'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          解析器
        </button>
      </div>

      {/* Format Selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">格式:</span>
        {['5', '6', '7'].map(fmt => (
          <button
            key={fmt}
            onClick={() => setCronFormat(fmt as '5' | '6' | '7')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-all',
              cronFormat === fmt
                ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
                : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
            )}
          >
            {fmt} 位
          </button>
        ))}
        <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] ml-2">
          {cronFormat === '5' && '分 时 日 月 周'}
          {cronFormat === '6' && '秒 分 时 日 月 周'}
          {cronFormat === '7' && '秒 分 时 日 月 周 年'}
        </span>
      </div>

      {mode === 'generate' && (
        <>
          {/* Field Editor */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {fields.slice(0, cronFormat === '5' ? 5 : 6).map((field, index) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {field.name}
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={e => handleFieldChange(index, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A]"
                  placeholder="*"
                />
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              常用模板
            </label>
            <div className="flex flex-wrap gap-2">
              {presetCrons.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset.value)}
                  className="px-3 py-1.5 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm text-[#6B6B6B] dark:text-[#A0A0A0] hover:border-[#8B9A8B] dark:hover:border-[#7A897A] transition-colors"
                  title={preset.desc}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Cron Output / Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            Cron 表达式
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!cronInput}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!cronInput}
              className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          </div>
        </div>
        <input
          type="text"
          value={cronInput}
          onChange={e => setCronInput(e.target.value)}
          placeholder="0 0 * * *"
          className={cn(
            'w-full px-4 py-3 bg-white dark:bg-[#2A2A2A] border rounded-lg font-mono text-lg focus:outline-none transition-all',
            error
              ? 'border-[#B87A7A] dark:border-[#C98A8A]'
              : 'border-[#D9D8D5] dark:border-[#404040] focus:border-[#8B9A8B] dark:focus:border-[#7A897A]'
          )}
        />
        {error && (
          <div className="flex items-center gap-2 text-sm text-[#B87A7A] dark:text-[#C98A8A]">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {!error && cronInput && (
        <div className="space-y-4">
          {/* Human Readable */}
          <div className="bg-[#E8EBE8] dark:bg-[#8B9A8B]/10 rounded-lg p-4">
            <span className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">描述: </span>
            <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              {humanReadable || '自定义调度'}
            </span>
          </div>

          {/* Next Executions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              未来 5 次执行时间
            </label>
            <div className="space-y-2">
              {nextExecutions.map((time, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg"
                >
                  <RefreshCw className="w-4 h-4 text-[#8B9A8B] dark:text-[#7A897A]" />
                  <span className="text-sm text-[#2D2D2D] dark:text-[#E8E8E8]">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
