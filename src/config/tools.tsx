import {
  Braces,
  FileCode,
  Database,
  Code,
  Link,
  Languages,
  Key,
  Hash,
  Fingerprint,
  Search,
  Type,
  GitCompare,
  FileCheck,
  Image, Code2, Clock, Binary, Calendar, FileJson, Terminal, Shield,
} from 'lucide-react';
import type { ToolCategory } from '@/types/tools';


// Lazy load tool components
import { lazy } from 'react';

const JsonFormatter = lazy(() => import('@/tools/JsonFormatter'));
const XmlFormatter = lazy(() => import('@/tools/XmlFormatter'));
const SqlFormatter = lazy(() => import('@/tools/SqlFormatter'));
const Base64Tool = lazy(() => import('@/tools/Base64Tool'));
const UrlCodec = lazy(() => import('@/tools/UrlCodec'));
const UnicodeConverter = lazy(() => import('@/tools/UnicodeConverter'));
const JwtParser = lazy(() => import('@/tools/JwtParser'));
const HashTool = lazy(() => import('@/tools/HashTool'));
const UuidGenerator = lazy(() => import('@/tools/UuidGenerator'));
const RegexTester = lazy(() => import('@/tools/RegexTester'));
const TextStats = lazy(() => import('@/tools/TextStats'));
const TextDiff = lazy(() => import('@/tools/TextDiff'));
const FileHash = lazy(() => import('@/tools/FileHash'));
const ImageToBase64 = lazy(() => import('@/tools/ImageToBase64'));
const RustStructFormatter = lazy(() => import("@/tools/RustStructFormatter"));
const TimestampConverter = lazy(() => import('@/tools/TimestampConverter'));
const BaseConverter = lazy(() => import('@/tools/BaseConverter'));
const CronGenerator = lazy(() => import('@/tools/CronGenerator'));
const JsonToTypes = lazy(() => import('@/tools/JsonToTypes'));
const CurlToCode = lazy(() => import('@/tools/CurlToCode'));
const PasswordGenerator = lazy(() => import('@/tools/PasswordGenerator'));

export const toolCategories: ToolCategory[] = [
  {
    id: 'formatters',
    name: '格式化与美化',
    icon: Braces,
    tools: [
      {
        id: 'json-formatter',
        name: 'JSON 格式化',
        description: 'JSON 格式化、压缩、语法高亮和错误检查',
        icon: Braces,
        component: JsonFormatter,
      },
      {
        id: 'xml-formatter',
        name: 'XML 格式化',
        description: 'XML 格式化和压缩工具',
        icon: FileCode,
        component: XmlFormatter,
      },
      {
        id: 'sql-formatter',
        name: 'SQL 美化',
        description: 'SQL 语句格式化和美化',
        icon: Database,
        component: SqlFormatter,
      },
      {
        id: 'rust-formatter',
        name: '结构体格式化',
        description: '将单行的 Rust 结构体或 RON 文本格式化为树状层级结构',
        icon: Code2,
        component: RustStructFormatter,
      },
    ],
  },
  {
    id: 'encoders',
    name: '编码与解码',
    icon: Code,
    tools: [
      {
        id: 'base64',
        name: 'Base64 编解码',
        description: '文本和图片的 Base64 编码与解码',
        icon: Code,
        component: Base64Tool,
      },
      {
        id: 'url-codec',
        name: 'URL 编解码',
        description: 'URL Encode 和 Decode 工具',
        icon: Link,
        component: UrlCodec,
      },
      {
        id: 'unicode',
        name: 'Unicode 转换',
        description: 'Unicode 与 ASCII 相互转换',
        icon: Languages,
        component: UnicodeConverter,
      },
      {
        id: 'jwt',
        name: 'JWT 解析器',
        description: '解析和验证 JWT Token',
        icon: Key,
        component: JwtParser,
      },

    ],
  },
  {
    id: 'crypto',
    name: '加密与哈希',
    icon: Hash,
    tools: [
      {
        id: 'hash',
        name: '哈希计算',
        description: 'MD5、SHA1、SHA256、SHA512 计算',
        icon: Hash,
        component: HashTool,
      },
      {
        id: 'uuid',
        name: 'UUID 生成器',
        description: '批量生成 UUID/GUID',
        icon: Fingerprint,
        component: UuidGenerator,
      },
      {
        id: 'password-generator',
        name: '密码生成器',
        description: '生成强密码和随机字符串',
        icon: Shield,
        component: PasswordGenerator,
      },
    ],
  },
  {
    id: 'converters',
    name: '时间与转换',
    icon: Clock,
    tools: [
      {
        id: 'timestamp',
        name: '时间戳转换',
        description: 'Unix 时间戳与本地时间/UTC 时间转换',
        icon: Clock,
        component: TimestampConverter,
      },
      {
        id: 'base-converter',
        name: '进制转换',
        description: '2/8/10/16 进制之间的相互转换',
        icon: Binary,
        component: BaseConverter,
      },
    ],
  },
  {
    id: 'generators',
    name: '代码生成与解析',
    icon: Terminal,
    tools: [
      {
        id: 'cron',
        name: 'Cron 表达式',
        description: 'Cron 表达式生成与解析，支持 5/6/7 位格式',
        icon: Calendar,
        component: CronGenerator,
      },
      {
        id: 'json-to-types',
        name: 'JSON 转类型定义',
        description: '将 JSON 转换为 TypeScript、Rust、Go 等类型定义',
        icon: FileJson,
        component: JsonToTypes,
      },
      {
        id: 'curl-to-code',
        name: 'cURL 转代码',
        description: '将 cURL 命令转换为多语言 HTTP 请求代码',
        icon: Terminal,
        component: CurlToCode,
      },
    ],
  },
  {
    id: 'text',
    name: '文本与开发辅助',
    icon: Type,
    tools: [
      {
        id: 'regex',
        name: '正则表达式测试',
        description: '在线测试正则表达式，提供常用模板',
        icon: Search,
        component: RegexTester,
      },
      {
        id: 'text-stats',
        name: '文本统计',
        description: '字数、字符数、行数统计',
        icon: Type,
        component: TextStats,
      },
      {
        id: 'text-diff',
        name: '文本对比',
        description: '比较两段文本的差异',
        icon: GitCompare,
        component: TextDiff,
      },
    ],
  },
  {
    id: 'file',
    name: '文件与处理',
    icon: FileCheck,
    tools: [
      {
        id: 'file-hash',
        name: '文件哈希',
        description: '计算文件的 MD5/SHA256 哈希值',
        icon: FileCheck,
        component: FileHash,
      },
      {
        id: 'image-base64',
        name: '图片转 Base64',
        description: '将图片转换为 Base64 编码',
        icon: Image,
        component: ImageToBase64,
      },
    ],
  },
];

export const allTools = toolCategories.flatMap(cat => cat.tools);

export function getToolById(id: string) {
  return allTools.find(tool => tool.id === id);
}

export function searchTools(query: string) {
  const lowerQuery = query.toLowerCase();
  return allTools.filter(
    tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery)
  );
}
