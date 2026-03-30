import { useState, useCallback } from 'react';
import { Copy, Trash2, Check, Upload, Image as ImageIcon, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Base64Tool() {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEncoding, setIsEncoding] = useState(true);

  const handleTextEncode = useCallback(() => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(textInput)));
      setTextOutput(encoded);
    } catch (e) {
      setTextOutput('编码失败: ' + (e as Error).message);
    }
  }, [textInput]);

  const handleTextDecode = useCallback(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(textInput)));
      setTextOutput(decoded);
    } catch (e) {
      setTextOutput('解码失败: 无效的 Base64 字符串');
    }
  }, [textInput]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      setImagePreview(result);
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setTextInput('');
    setTextOutput('');
    setImagePreview(null);
    setImageBase64('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          Base64 编解码
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          文本和图片的 Base64 编码与解码
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('text')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'text'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]'
          )}
        >
          <Type className="w-4 h-4" />
          文本
        </button>
        <button
          onClick={() => setMode('image')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'image'
              ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
              : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]'
          )}
        >
          <ImageIcon className="w-4 h-4" />
          图片
        </button>
      </div>

      {mode === 'text' ? (
        <div className="space-y-4">
          {/* Encode/Decode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEncoding(true)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isEncoding
                  ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
                  : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
              )}
            >
              编码
            </button>
            <button
              onClick={() => setIsEncoding(false)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                !isEncoding
                  ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
                  : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
              )}
            >
              解码
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                  {isEncoding ? '原文' : 'Base64'}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={!textInput}
                  className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </div>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder={isEncoding ? '输入要编码的文本...' : '输入 Base64 字符串...'}
                className="w-full h-[300px] p-4 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
                spellCheck={false}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                  {isEncoding ? 'Base64' : '原文'}
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isEncoding ? handleTextEncode : handleTextDecode}
                    disabled={!textInput}
                    className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
                  >
                    {isEncoding ? '编码' : '解码'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(textOutput)}
                    disabled={!textOutput}
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
              </div>
              <textarea
                value={textOutput}
                readOnly
                placeholder="结果将显示在这里..."
                className="w-full h-[300px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8]"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image Upload */}
          {!imagePreview && (
            <label className="block h-[200px] border-2 border-dashed border-[#D9D8D5] dark:border-[#404040] rounded-xl bg-white dark:bg-[#2A2A2A] hover:border-[#8B9A8B] dark:hover:border-[#7A897A] hover:bg-[#F5F5F3] dark:hover:bg-[#333333] transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="h-full flex flex-col items-center justify-center">
                <Upload className="w-12 h-12 text-[#9A9A9A] dark:text-[#6B6B6B] mb-4" />
                <p className="text-[#2D2D2D] dark:text-[#E8E8E8] font-medium">
                  点击上传图片
                </p>
                <p className="text-sm text-[#9A9A9A] dark:text-[#6B6B6B] mt-1">
                  支持 JPG、PNG、GIF、WebP 等格式
                </p>
              </div>
            </label>
          )}

          {/* Image Preview & Result */}
          {imagePreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                  图片预览
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  清除
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-[300px] object-contain mx-auto"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                      Base64 结果
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(imageBase64)}
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
                    value={imageBase64}
                    readOnly
                    className="w-full h-[300px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-xs leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8] break-all"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
