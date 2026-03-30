import { useState, useCallback } from 'react';
import { Copy, Trash2, Check, Upload, Image as ImageIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ImageToBase64() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setBase64Data(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleCopy = async () => {
    if (!base64Data) return;
    try {
      await navigator.clipboard.writeText(base64Data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setBase64Data('');
    setFileInfo(null);
  };

  const handleDownload = () => {
    if (!base64Data) return;
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileInfo?.name || 'image.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          图片转 Base64
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          将图片转换为 Base64 编码，支持 Data URL 格式
        </p>
      </div>

      {/* Upload Area */}
      {!imagePreview && (
        <label
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'block h-[250px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-[#8B9A8B] dark:border-[#7A897A] bg-[#E8EBE8] dark:bg-[#8B9A8B]/10'
              : 'border-[#D9D8D5] dark:border-[#404040] bg-white dark:bg-[#2A2A2A] hover:border-[#8B9A8B] dark:hover:border-[#7A897A] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]'
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload
            className={cn(
              'w-14 h-14 mb-4 transition-colors',
              isDragging
                ? 'text-[#8B9A8B] dark:text-[#7A897A]'
                : 'text-[#9A9A9A] dark:text-[#6B6B6B]'
            )}
          />
          <p className="text-[#2D2D2D] dark:text-[#E8E8E8] font-medium">
            拖拽图片到此处，或点击上传
          </p>
          <p className="text-sm text-[#9A9A9A] dark:text-[#6B6B6B] mt-1">
            支持 JPG、PNG、GIF、WebP、SVG 等格式
          </p>
        </label>
      )}

      {/* Preview & Result */}
      {imagePreview && fileInfo && (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8EBE8] dark:bg-[#333333] flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-[#8B9A8B] dark:text-[#7A897A]" />
              </div>
              <div>
                <p className="font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                  {fileInfo.name}
                </p>
                <p className="text-sm text-[#9A9A9A] dark:text-[#6B6B6B]">
                  {formatFileSize(fileInfo.size)} · {fileInfo.type}
                </p>
              </div>
            </div>
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
            {/* Image Preview */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                图片预览
              </label>
              <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-[300px] object-contain mx-auto rounded-lg"
                />
              </div>
            </div>

            {/* Base64 Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                  Base64 结果
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
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
                value={base64Data}
                readOnly
                className="w-full h-[300px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-xs leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8] break-all"
                spellCheck={false}
              />
              <p className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B]">
                结果长度: {base64Data.length.toLocaleString()} 字符
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
