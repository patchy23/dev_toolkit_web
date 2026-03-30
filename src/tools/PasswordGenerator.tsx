import { useState, useCallback } from 'react';
import { Copy, RefreshCw, Check, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generatePassword = useCallback((): string => {
    let chars = '';
    if (options.uppercase) chars += CHAR_SETS.uppercase;
    if (options.lowercase) chars += CHAR_SETS.lowercase;
    if (options.numbers) chars += CHAR_SETS.numbers;
    if (options.symbols) chars += CHAR_SETS.symbols;

    if (!chars) return '';

    let password = '';
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < options.length; i++) {
      password += chars[array[i] % chars.length];
    }

    return password;
  }, [options]);

  const generateBatch = useCallback(() => {
    const newPasswords: string[] = [];
    for (let i = 0; i < count; i++) {
      newPasswords.push(generatePassword());
    }
    setPasswords(newPasswords);
  }, [count, generatePassword]);

  const handleCopy = async (password: string, index: number) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(passwords.join('\n'));
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setPasswords([]);
  };

  const calculateStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: '弱', color: 'bg-[#B87A7A] dark:bg-[#C98A8A]' };
    if (score <= 4) return { score, label: '中等', color: 'bg-[#C9A66B] dark:bg-[#D4B87A]' };
    return { score, label: '强', color: 'bg-[#7A9E7A] dark:bg-[#8FBA8F]' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          密码生成器
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          生成强密码和随机字符串，支持自定义字符集
        </p>
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-[#2D2D2D] dark:text-[#E8E8E8]">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">选项</span>
        </div>

        {/* Length */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
              密码长度
            </label>
            <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              {options.length}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={options.length}
            onChange={e => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
            className="w-full h-2 bg-[#EAE9E6] dark:bg-[#333333] rounded-lg appearance-none cursor-pointer accent-[#8B9A8B]"
          />
          <div className="flex justify-between text-xs text-[#9A9A9A] dark:text-[#6B6B6B]">
            <span>4</span>
            <span>32</span>
            <span>64</span>
          </div>
        </div>

        {/* Character Types */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'uppercase', label: '大写字母 (A-Z)' },
            { key: 'lowercase', label: '小写字母 (a-z)' },
            { key: 'numbers', label: '数字 (0-9)' },
            { key: 'symbols', label: '特殊符号 (!@#$)' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 p-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] rounded-lg cursor-pointer hover:bg-[#EAE9E6] dark:hover:bg-[#333333] transition-colors"
            >
              <input
                type="checkbox"
                checked={options[key as keyof PasswordOptions] as boolean}
                onChange={e => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                className="w-4 h-4 rounded border-[#D9D8D5] dark:border-[#404040] text-[#8B9A8B] focus:ring-[#8B9A8B]"
              />
              <span className="text-sm text-[#2D2D2D] dark:text-[#E8E8E8]">{label}</span>
            </label>
          ))}
        </div>

        {/* Count */}
        <div className="space-y-2">
          <label className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            生成数量
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={e => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A]"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateBatch}
        disabled={!Object.values(options).slice(1).some(Boolean)}
        className="w-full py-6 bg-[#8B9A8B] dark:bg-[#7A897A] hover:bg-[#7A897A] dark:hover:bg-[#6A796A] text-white text-lg font-medium rounded-xl transition-all"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        生成密码
      </Button>

      {/* Warning */}
      {!Object.values(options).slice(1).some(Boolean) && (
        <div className="text-sm text-[#B87A7A] dark:text-[#C98A8A] text-center">
          请至少选择一种字符类型
        </div>
      )}

      {/* Results */}
      {passwords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              生成结果 ({passwords.length} 个)
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
              >
                {copiedIndex === -1 ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-[#7A9E7A]" />
                    已全部复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    复制全部
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {passwords.map((password, index) => {
              const strength = calculateStrength(password);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg px-4 py-3 group hover:border-[#8B9A8B] dark:hover:border-[#7A897A] transition-colors"
                >
                  <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] w-6">
                    {index + 1}
                  </span>
                  <code className="flex-1 font-mono text-sm text-[#2D2D2D] dark:text-[#E8E8E8] tracking-wider">
                    {password}
                  </code>
                  <div className={cn('w-12 h-6 rounded text-xs flex items-center justify-center text-white', strength.color)}>
                    {strength.label}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(password, index)}
                    className="opacity-0 group-hover:opacity-100 text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A] transition-opacity"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-[#7A9E7A]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
