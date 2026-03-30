import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const keywords = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
  'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
  'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION',
  'ALL', 'DISTINCT', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN',
  'BETWEEN', 'LIKE', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'IF', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
];

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const formatSql = useCallback((sql: string): string => {
    if (!sql.trim()) return '';

    let formatted = sql
      .replace(/\s+/g, ' ')
      .trim();

    // Uppercase keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, keyword);
    });

    // Add newlines after specific keywords
    formatted = formatted
      .replace(/\s*,\s*/g, ',\n  ')
      .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|UNION|INTERSECT|EXCEPT)\b/gi, '\n$1')
      .replace(/\b(LEFT|RIGHT|INNER|OUTER|CROSS|JOIN)\b/gi, '\n  $1')
      .replace(/\b(AND|OR)\b/gi, '\n    $1')
      .replace(/\b(VALUES|SET)\b/gi, '\n$1');

    // Clean up extra newlines
    formatted = formatted
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');

    return formatted.trim();
  }, []);

  useEffect(() => {
    setOutput(formatSql(input));
  }, [input, formatSql]);

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

  const handleSample = () => {
    const sample = `select u.id, u.name, u.email, count(o.id) as order_count
from users u
left join orders o on u.id = o.user_id
where u.status = 'active'
and u.created_at > '2024-01-01'
group by u.id, u.name, u.email
having count(o.id) > 5
order by order_count desc
limit 10`;
    setInput(sample);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
            SQL 美化
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
            格式化 SQL 语句，自动关键字大写和缩进
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSample}
          className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
        >
          加载示例
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              输入
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
            placeholder="在此粘贴 SQL 语句..."
            className="w-full h-[400px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
            spellCheck={false}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              输出
            </label>
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
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的 SQL 将显示在这里..."
            className="w-full h-[400px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8]"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
