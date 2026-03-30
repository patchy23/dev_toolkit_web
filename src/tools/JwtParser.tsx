import { useState, useCallback } from 'react';
import { Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DecodedJWT {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
}

export default function JwtParser() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const decodeJwt = useCallback((token: string): DecodedJWT => {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('无效的 JWT 格式');
    }

    const base64UrlDecode = (str: string): string => {
      const padding = '='.repeat((4 - (str.length % 4)) % 4);
      const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    };

    return {
      header: JSON.parse(base64UrlDecode(parts[0])),
      payload: JSON.parse(base64UrlDecode(parts[1])),
      signature: parts[2],
    };
  }, []);

  const handleParse = useCallback(() => {
    if (!input.trim()) {
      setDecoded(null);
      setError('');
      return;
    }

    try {
      const result = decodeJwt(input.trim());
      setDecoded(result);
      setError('');
    } catch (e) {
      setError('解析失败: ' + (e as Error).message);
      setDecoded(null);
    }
  }, [input, decodeJwt]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  const handleSample = () => {
    const sample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4iSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    setInput(sample);
    try {
      setDecoded(decodeJwt(sample));
      setError('');
    } catch (e) {
      setError('解析失败: ' + (e as Error).message);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
            JWT 解析器
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
            解析和验证 JWT Token
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            JWT Token
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleParse}
              disabled={!input}
              className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
            >
              解析
            </Button>
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
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="在此粘贴 JWT Token..."
          className={cn(
            'w-full h-[120px] p-4 bg-white dark:bg-[#2A2A2A] border rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all',
            error
              ? 'border-[#B87A7A] dark:border-[#C98A8A] focus:ring-[#B87A7A]/15'
              : 'border-[#D9D8D5] dark:border-[#404040] focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-[#8B9A8B]/15'
          )}
          spellCheck={false}
        />
        {error && (
          <div className="flex items-center gap-2 text-sm text-[#B87A7A] dark:text-[#C98A8A]">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {decoded && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] border-b border-[#D9D8D5] dark:border-[#404040]">
              <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                HEADER (算法 & 令牌类型)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'header')}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
              >
                {copiedField === 'header' ? (
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
            <pre className="p-4 font-mono text-sm text-[#2D2D2D] dark:text-[#E8E8E8] overflow-auto">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] border-b border-[#D9D8D5] dark:border-[#404040]">
              <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                PAYLOAD (数据)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'payload')}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
              >
                {copiedField === 'payload' ? (
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
            <div className="p-4 space-y-2">
              {Object.entries(decoded.payload).map(([key, value]) => (
                <div key={key} className="flex items-start gap-4">
                  <span className="text-sm font-mono text-[#7A8BA8] dark:text-[#8BA4C9] min-w-[100px]">
                    {key}
                  </span>
                  <span className="text-sm font-mono text-[#2D2D2D] dark:text-[#E8E8E8]">
                    {(key === 'iat' || key === 'exp' || key === 'nbf') && typeof value === 'number'
                      ? `${value} (${formatDate(value)})`
                      : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature */}
          <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F3] dark:bg-[#1E1E1E] border-b border-[#D9D8D5] dark:border-[#404040]">
              <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                SIGNATURE (签名)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(decoded.signature, 'signature')}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
              >
                {copiedField === 'signature' ? (
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
              <code className="font-mono text-sm text-[#9A9A9A] dark:text-[#6B6B6B] break-all">
                {decoded.signature}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
