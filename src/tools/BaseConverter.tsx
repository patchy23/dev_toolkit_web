import { useState, useCallback } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Base = 2 | 8 | 10 | 16;

interface BaseConfig {
  base: Base;
  name: string;
  prefix: string;
  placeholder: string;
}

const bases: BaseConfig[] = [
  { base: 2, name: '二进制', prefix: '0b', placeholder: '101010' },
  { base: 8, name: '八进制', prefix: '0o', placeholder: '52' },
  { base: 10, name: '十进制', prefix: '', placeholder: '42' },
  { base: 16, name: '十六进制', prefix: '0x', placeholder: '2a' },
];

export default function BaseConverter() {
  const [values, setValues] = useState<Record<Base, string>>({
    2: '',
    8: '',
    10: '',
    16: '',
  });
  const [copied, setCopied] = useState<Base | null>(null);
  const [lastEdited, setLastEdited] = useState<Base | null>(null);

  const convertFrom = useCallback((value: string, fromBase: Base) => {
    if (!value.trim()) {
      setValues({ 2: '', 8: '', 10: '', 16: '' });
      return;
    }

    // Remove prefix if present
    let cleanValue = value.toLowerCase();
    if (fromBase === 2 && cleanValue.startsWith('0b')) {
      cleanValue = cleanValue.slice(2);
    } else if (fromBase === 8 && cleanValue.startsWith('0o')) {
      cleanValue = cleanValue.slice(2);
    } else if (fromBase === 16 && cleanValue.startsWith('0x')) {
      cleanValue = cleanValue.slice(2);
    }

    // Validate input
    const validChars = getValidChars(fromBase);
    if (!new RegExp(`^[${validChars}]+$`, 'i').test(cleanValue)) {
      return;
    }

    try {
      const decimal = parseInt(cleanValue, fromBase);
      if (isNaN(decimal)) return;

      setValues({
        2: decimal.toString(2),
        8: decimal.toString(8),
        10: decimal.toString(10),
        16: decimal.toString(16).toUpperCase(),
      });
    } catch (e) {
      // Invalid input, ignore
    }
  }, []);

  const getValidChars = (base: Base): string => {
    switch (base) {
      case 2: return '01';
      case 8: return '01234567';
      case 10: return '0123456789';
      case 16: return '0123456789abcdef';
      default: return '';
    }
  };

  const handleChange = (base: Base, value: string) => {
    setLastEdited(base);
    setValues(prev => ({ ...prev, [base]: value }));
    convertFrom(value, base);
  };

  const handleCopy = async (value: string, base: Base) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(base);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setValues({ 2: '', 8: '', 10: '', 16: '' });
    setLastEdited(null);
  };

  const formatWithPrefix = (value: string, base: Base): string => {
    if (!value) return '';
    const config = bases.find(b => b.base === base);
    if (!config) return value;
    return config.prefix + value.toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          进制转换
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          二进制、八进制、十进制、十六进制之间的实时同步转换
        </p>
      </div>

      {/* Clear Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={!Object.values(values).some(v => v)}
          className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          清空
        </Button>
      </div>

      {/* Base Inputs */}
      <div className="space-y-4">
        {bases.map(({ base, name, placeholder }) => (
          <div
            key={base}
            className={cn(
              'relative bg-white dark:bg-[#2A2A2A] border rounded-xl p-4 transition-all',
              lastEdited === base
                ? 'border-[#8B9A8B] dark:border-[#7A897A] ring-2 ring-[#8B9A8B]/15'
                : 'border-[#D9D8D5] dark:border-[#404040]'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                {name}
                <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] ml-2">
                  (Base {base})
                </span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(formatWithPrefix(values[base], base), base)}
                disabled={!values[base]}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
              >
                {copied === base ? (
                  <Check className="w-4 h-4 text-[#7A9E7A]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <input
              type="text"
              value={values[base]}
              onChange={e => handleChange(base, e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg font-mono text-lg text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A]"
              spellCheck={false}
            />
            {values[base] && (
              <div className="mt-2 text-xs text-[#9A9A9A] dark:text-[#6B6B6B] font-mono">
                带前缀: {formatWithPrefix(values[base], base)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className="bg-[#F5F5F3] dark:bg-[#1E1E1E] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8] mb-3">
          常用进制对照表
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6B6B6B] dark:text-[#A0A0A0]">
                <th className="text-left py-2 px-3">十进制</th>
                <th className="text-left py-2 px-3">二进制</th>
                <th className="text-left py-2 px-3">八进制</th>
                <th className="text-left py-2 px-3">十六进制</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[#2D2D2D] dark:text-[#E8E8E8]">
              {[0, 1, 2, 8, 10, 16, 32, 64, 100, 255].map(dec => (
                <tr key={dec} className="border-t border-[#D9D8D5] dark:border-[#404040]">
                  <td className="py-2 px-3">{dec}</td>
                  <td className="py-2 px-3">{dec.toString(2)}</td>
                  <td className="py-2 px-3">{dec.toString(8)}</td>
                  <td className="py-2 px-3">{dec.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
