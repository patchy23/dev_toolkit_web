import { useState, useCallback } from 'react';
import { Copy, RefreshCw, Check, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [copiedField, setCopiedField] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateUuids = useCallback(() => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      const uuid = uuidv4();
      newUuids.push(uppercase ? uuid.toUpperCase() : uuid);
    }
    setUuids(newUuids);
  }, [count, uppercase]);

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(index);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCopyAll = async () => {
    if (uuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          UUID 生成器
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          批量生成 UUID/GUID
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-[#2D2D2D] dark:text-[#E8E8E8]">
          <Settings2 className="w-4 h-4" />
          <span className="text-sm font-medium">设置</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Count */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
              数量
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={e => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 px-3 py-2 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A]"
              />
            </div>
          </div>

          {/* Case */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
              大小写
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setUppercase(false)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  !uppercase
                    ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
                    : 'bg-[#F5F5F3] dark:bg-[#1E1E1E] text-[#6B6B6B] dark:text-[#A0A0A0]'
                )}
              >
                小写
              </button>
              <button
                onClick={() => setUppercase(true)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  uppercase
                    ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
                    : 'bg-[#F5F5F3] dark:bg-[#1E1E1E] text-[#6B6B6B] dark:text-[#A0A0A0]'
                )}
              >
                大写
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateUuids}
        className="w-full py-6 bg-[#8B9A8B] dark:bg-[#7A897A] hover:bg-[#7A897A] dark:hover:bg-[#6A796A] text-white text-lg font-medium rounded-xl transition-all"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        生成 UUID
      </Button>

      {/* Results */}
      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              生成结果 ({uuids.length} 个)
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAll}
              className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
            >
              {copiedAll ? (
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
          </div>

          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg px-4 py-3 group hover:border-[#8B9A8B] dark:hover:border-[#7A897A] transition-colors"
              >
                <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] w-8">
                  {index + 1}
                </span>
                <code className="flex-1 font-mono text-sm text-[#2D2D2D] dark:text-[#E8E8E8]">
                  {uuid}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(uuid, index)}
                  className="opacity-0 group-hover:opacity-100 text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A] transition-opacity"
                >
                  {copiedField === index ? (
                    <Check className="w-4 h-4 text-[#7A9E7A]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
