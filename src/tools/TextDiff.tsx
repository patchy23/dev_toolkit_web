import { useState, useCallback } from 'react';
import { Trash2, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as Diff from 'diff';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  lineNumber: { old?: number; new?: number };
}

export default function TextDiff() {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [diffs, setDiffs] = useState<DiffLine[]>([]);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showUnchanged, setShowUnchanged] = useState(true);

  const calculateDiff = useCallback(() => {
    if (!oldText && !newText) {
      setDiffs([]);
      return;
    }

    const changes = Diff.diffLines(oldText, newText, {
      ignoreWhitespace,
    });
    
    const result: DiffLine[] = [];
    let oldLineNum = 0;
    let newLineNum = 0;

    changes.forEach(change => {
      const lines = change.value.split('\n');
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }

      lines.forEach(line => {
        if (change.added) {
          newLineNum++;
          result.push({
            type: 'added',
            value: line,
            lineNumber: { new: newLineNum },
          });
        } else if (change.removed) {
          oldLineNum++;
          result.push({
            type: 'removed',
            value: line,
            lineNumber: { old: oldLineNum },
          });
        } else {
          oldLineNum++;
          newLineNum++;
          result.push({
            type: 'unchanged',
            value: line,
            lineNumber: { old: oldLineNum, new: newLineNum },
          });
        }
      });
    });

    setDiffs(result);
  }, [oldText, newText, ignoreWhitespace]);

  const handleCompare = () => {
    calculateDiff();
  };

  const handleClear = () => {
    setOldText('');
    setNewText('');
    setDiffs([]);
  };

  const visibleDiffs = showUnchanged
    ? diffs
    : diffs.filter(d => d.type !== 'unchanged');

  const addedCount = diffs.filter(d => d.type === 'added').length;
  const removedCount = diffs.filter(d => d.type === 'removed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          文本对比
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          比较两段文本的差异
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIgnoreWhitespace(!ignoreWhitespace)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm transition-all',
            ignoreWhitespace
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          忽略空白
        </button>
        <button
          onClick={() => setShowUnchanged(!showUnchanged)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm transition-all',
            showUnchanged
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
          )}
        >
          显示未变更行
        </button>
      </div>

      {/* Input Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              原文本
            </label>
          </div>
          <textarea
            value={oldText}
            onChange={e => setOldText(e.target.value)}
            placeholder="输入原始文本..."
            className="w-full h-[200px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              对比文本
            </label>
          </div>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="输入对比文本..."
            className="w-full h-[200px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleCompare}
          disabled={!oldText && !newText}
          className="bg-[#8B9A8B] dark:bg-[#7A897A] hover:bg-[#7A897A] dark:hover:bg-[#6A796A] text-white"
        >
          <GitCompare className="w-4 h-4 mr-2" />
          对比
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={!oldText && !newText}
          className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          清空
        </Button>
      </div>

      {/* Diff Result */}
      {diffs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              对比结果
            </label>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#7A9E7A] dark:text-[#8FBA8F]">
                +{addedCount} 新增
              </span>
              <span className="text-[#B87A7A] dark:text-[#C98A8A]">
                -{removedCount} 删除
              </span>
            </div>
          </div>

          <div className="border border-[#D9D8D5] dark:border-[#404040] rounded-lg overflow-hidden">
            <div className="grid grid-cols-[50px_50px_1fr] bg-[#F5F5F3] dark:bg-[#1E1E1E] border-b border-[#D9D8D5] dark:border-[#404040]">
              <div className="px-2 py-2 text-xs text-[#9A9A9A] dark:text-[#6B6B6B] text-center border-r border-[#D9D8D5] dark:border-[#404040]">
                旧
              </div>
              <div className="px-2 py-2 text-xs text-[#9A9A9A] dark:text-[#6B6B6B] text-center border-r border-[#D9D8D5] dark:border-[#404040]">
                新
              </div>
              <div className="px-4 py-2 text-xs text-[#9A9A9A] dark:text-[#6B6B6B]">
                内容
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto">
              {visibleDiffs.map((diff, index) => (
                <div
                  key={index}
                  className={cn(
                    'grid grid-cols-[50px_50px_1fr] font-mono text-sm',
                    diff.type === 'added' && 'bg-[#7A9E7A]/10 dark:bg-[#8FBA8F]/10',
                    diff.type === 'removed' && 'bg-[#B87A7A]/10 dark:bg-[#C98A8A]/10',
                    diff.type === 'unchanged' && 'bg-white dark:bg-[#2A2A2A]'
                  )}
                >
                  <div className="px-2 py-1 text-xs text-[#9A9A9A] dark:text-[#6B6B6B] text-center border-r border-[#D9D8D5] dark:border-[#404040]/50">
                    {diff.lineNumber.old || ''}
                  </div>
                  <div className="px-2 py-1 text-xs text-[#9A9A9A] dark:text-[#6B6B6B] text-center border-r border-[#D9D8D5] dark:border-[#404040]/50">
                    {diff.lineNumber.new || ''}
                  </div>
                  <div
                    className={cn(
                      'px-4 py-1 whitespace-pre',
                      diff.type === 'added' && 'text-[#7A9E7A] dark:text-[#8FBA8F]',
                      diff.type === 'removed' && 'text-[#B87A7A] dark:text-[#C98A8A]',
                      diff.type === 'unchanged' && 'text-[#2D2D2D] dark:text-[#E8E8E8]'
                    )}
                  >
                    {diff.type === 'added' && '+'}
                    {diff.type === 'removed' && '-'}
                    {diff.type === 'unchanged' && ' '}
                    {diff.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
