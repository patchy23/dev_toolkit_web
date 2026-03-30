import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RegexTemplate {
  name: string;
  pattern: string;
  description: string;
}

const templates: RegexTemplate[] = [
  { name: '邮箱', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$', description: '匹配电子邮箱地址' },
  { name: '手机号', pattern: '^1[3-9]\\d{9}$', description: '匹配中国大陆手机号' },
  { name: 'URL', pattern: '^https?://[^\\s/$.?#].[^\\s]*$', description: '匹配 HTTP/HTTPS URL' },
  { name: 'IP 地址', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', description: '匹配 IPv4 地址' },
  { name: '身份证号', pattern: '^\\d{17}[\\dXx]$', description: '匹配 18 位身份证号' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', description: '匹配中文字符' },
  { name: '数字', pattern: '^\\d+$', description: '匹配纯数字' },
  { name: '字母', pattern: '^[a-zA-Z]+$', description: '匹配纯字母' },
];

interface Match {
  text: string;
  index: number;
  groups?: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);

  const testRegex = useCallback(() => {
    if (!pattern || !testText) {
      setMatches([]);
      setError('');
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const newMatches: Match[] = [];
      let match: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((match = regex.exec(testText)) !== null) {
          newMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          newMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(newMatches);
      setError('');
    } catch (e) {
      setError('正则表达式错误: ' + (e as Error).message);
      setMatches([]);
    }
  }, [pattern, flags, testText]);

  useEffect(() => {
    testRegex();
  }, [testRegex]);

  const handleTemplateSelect = (template: RegexTemplate) => {
    setPattern(template.pattern);
    setShowTemplates(false);
  };

  const handleCopy = async () => {
    if (!pattern) return;
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
    setMatches([]);
    setError('');
  };

  const toggleFlag = (flag: string) => {
    setFlags(prev =>
      prev.includes(flag)
        ? prev.replace(flag, '')
        : prev + flag
    );
  };

  const highlightText = () => {
    if (matches.length === 0) return testText;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>{testText.slice(lastIndex, match.index)}</span>
        );
      }
      parts.push(
        <mark
          key={`match-${i}`}
          className="bg-[#C9A66B]/30 dark:bg-[#D4B87A]/30 text-[#2D2D2D] dark:text-[#E8E8E8] rounded px-0.5"
        >
          {match.text}
        </mark>
      );
      lastIndex = match.index + match.text.length;
    });

    if (lastIndex < testText.length) {
      parts.push(<span key="text-end">{testText.slice(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          正则表达式测试
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          在线测试正则表达式，提供常用模板
        </p>
      </div>

      {/* Pattern Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            正则表达式
          </label>
          <div className="flex items-center gap-2">
            {/* Templates Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#6B6B6B] dark:text-[#A0A0A0] bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg hover:bg-[#F5F5F3] dark:hover:bg-[#333333] transition-colors"
              >
                常用模板
                <ChevronDown className="w-4 h-4" />
              </button>
              {showTemplates && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl shadow-lg z-10">
                  {templates.map(template => (
                    <button
                      key={template.name}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full px-4 py-3 text-left hover:bg-[#F5F5F3] dark:hover:bg-[#333333] first:rounded-t-xl last:rounded-b-xl transition-colors"
                    >
                      <div className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                        {template.name}
                      </div>
                      <div className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] mt-0.5">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!pattern}
              className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-1 text-[#7A9E7A]" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              复制
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="flex items-center px-3 py-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] border-r-0 rounded-l-lg text-[#9A9A9A] dark:text-[#6B6B6B] font-mono">
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="输入正则表达式..."
            className={cn(
              'flex-1 px-4 py-3 bg-white dark:bg-[#2A2A2A] border-y border-[#D9D8D5] dark:border-[#404040] font-mono text-sm focus:outline-none transition-all',
              error ? 'text-[#B87A7A] dark:text-[#C98A8A]' : 'text-[#2D2D2D] dark:text-[#E8E8E8]'
            )}
          />
          <span className="flex items-center px-3 py-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] border-l-0 rounded-r-lg text-[#9A9A9A] dark:text-[#6B6B6B] font-mono">
            /{flags}
          </span>
        </div>

        {/* Flags */}
        <div className="flex items-center gap-2">
          {[
            { id: 'g', label: '全局 (g)', desc: '查找所有匹配' },
            { id: 'i', label: '忽略大小写 (i)', desc: '不区分大小写' },
            { id: 'm', label: '多行 (m)', desc: '^$ 匹配每行' },
            { id: 's', label: '单行 (s)', desc: '. 匹配换行' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => toggleFlag(id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-all',
                flags.includes(id)
                  ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
                  : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-sm text-[#B87A7A] dark:text-[#C98A8A]">
            {error}
          </div>
        )}
      </div>

      {/* Test Text */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            测试文本
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!testText && !pattern}
            className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </Button>
        </div>
        <textarea
          value={testText}
          onChange={e => setTestText(e.target.value)}
          placeholder="输入要测试的文本..."
          className="w-full h-[150px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
          spellCheck={false}
        />
      </div>

      {/* Results */}
      {testText && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            匹配结果 ({matches.length} 个匹配)
          </label>

          {/* Highlighted Text */}
          <div className="p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
            {matches.length > 0 ? highlightText() : testText}
          </div>

          {/* Match List */}
          {matches.length > 0 && (
            <div className="space-y-2">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] rounded-lg"
                >
                  <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B] w-6">
                    {index + 1}
                  </span>
                  <code className="flex-1 font-mono text-sm text-[#2D2D2D] dark:text-[#E8E8E8]">
                    {match.text}
                  </code>
                  <span className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B]">
                    位置: {match.index}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
