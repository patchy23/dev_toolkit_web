import { useState, useRef, useCallback } from 'react';
import { Upload, Copy, Check, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import CryptoJS from 'crypto-js';

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
}

export default function FileHash() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<HashResult | null>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const calculateHash = useCallback(async (file: File) => {
    setIsCalculating(true);
    setProgress(0);
    setError('');
    setResult(null);

    try {
      const chunkSize = 1024 * 1024;
      const chunks = Math.ceil(file.size / chunkSize);
      
      const md5 = CryptoJS.algo.MD5.create();
      const sha1 = CryptoJS.algo.SHA1.create();
      const sha256 = CryptoJS.algo.SHA256.create();

      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const arrayBuffer = await chunk.arrayBuffer();
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
        
        md5.update(wordArray);
        sha1.update(wordArray);
        sha256.update(wordArray);

        const currentProgress = Math.round(((i + 1) / chunks) * 100);
        setProgress(currentProgress);
      }

      setResult({
        md5: md5.finalize().toString(),
        sha1: sha1.finalize().toString(),
        sha256: sha256.finalize().toString(),
      });
    } catch (err) {
      setError('计算哈希值时出错: ' + (err as Error).message);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      calculateHash(droppedFile);
    }
  }, [calculateHash]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      calculateHash(selectedFile);
    }
  }, [calculateHash]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleCopy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
          文件哈希计算
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
          拖拽文件或点击上传，计算文件的 MD5、SHA1、SHA256 哈希值（纯前端计算，文件不会上传）
        </p>
      </div>

      {/* Drop Zone */}
      {!file && (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-[#8B9A8B] dark:border-[#7A897A] bg-[#E8EBE8] dark:bg-[#8B9A8B]/10'
              : 'border-[#D9D8D5] dark:border-[#404040] bg-white dark:bg-[#2A2A2A] hover:border-[#8B9A8B] dark:hover:border-[#7A897A] hover:bg-[#F5F5F3] dark:hover:bg-[#333333]'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload
            className={cn(
              'w-12 h-12 mb-4 transition-colors',
              isDragging
                ? 'text-[#8B9A8B] dark:text-[#7A897A]'
                : 'text-[#9A9A9A] dark:text-[#6B6B6B]'
            )}
          />
          <p className="text-[#2D2D2D] dark:text-[#E8E8E8] font-medium">
            拖拽文件到此处，或点击上传
          </p>
          <p className="text-sm text-[#9A9A9A] dark:text-[#6B6B6B] mt-1">
            支持任意文件类型，文件不会离开您的设备
          </p>
        </div>
      )}

      {/* File Info */}
      {file && (
        <div className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8EBE8] dark:bg-[#333333] flex items-center justify-center">
                <File className="w-5 h-5 text-[#8B9A8B] dark:text-[#7A897A]" />
              </div>
              <div>
                <p className="font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                  {file.name}
                </p>
                <p className="text-sm text-[#9A9A9A] dark:text-[#6B6B6B]">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            {!isCalculating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#B87A7A] dark:hover:text-[#C98A8A]"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress */}
          {isCalculating && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B6B6B] dark:text-[#A0A0A0]">计算中...</span>
                <span className="text-[#8B9A8B] dark:text-[#7A897A] font-medium">
                  {progress}%
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-[#EAE9E6] dark:bg-[#333333]"
              />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-[#B87A7A]/10 dark:bg-[#C98A8A]/10 border border-[#B87A7A]/30 dark:border-[#C98A8A]/30 rounded-lg text-sm text-[#B87A7A] dark:text-[#C98A8A]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            计算结果
          </h3>

          {[
            { key: 'md5', label: 'MD5', value: result.md5 },
            { key: 'sha1', label: 'SHA1', value: result.sha1 },
            { key: 'sha256', label: 'SHA256', value: result.sha256 },
          ].map(({ key, label, value }) => (
            <div
              key={key}
              className="bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {label}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(value, key)}
                  className="text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#8B9A8B] dark:hover:text-[#9AB89A]"
                >
                  {copiedField === key ? (
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
              <code className="block font-mono text-sm text-[#2D2D2D] dark:text-[#E8E8E8] break-all bg-[#F5F5F3] dark:bg-[#1E1E1E] rounded-lg p-3">
                {value}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
