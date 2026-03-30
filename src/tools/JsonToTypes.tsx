import { useState, useCallback } from 'react';
import { Copy, Trash2, Check, AlertCircle, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Language = 'typescript' | 'rust' | 'go' | 'python' | 'java' | 'csharp' | 'kotlin' | 'swift' | 'cpp' | 'ruby';

interface LanguageOption {
  id: Language;
  name: string;
  extension: string;
}

interface TypeDefinition {
  name: string;
  code: string;
  dependencies: string[];
}

const languages: LanguageOption[] = [
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt' },
  { id: 'swift', name: 'Swift', extension: 'swift' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
];

export default function JsonToTypes() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>('typescript');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [rootTypeName, setRootTypeName] = useState('Root');

  // 工具函数：驼峰命名
  const toPascalCase = (str: string): string => {
    return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, (_, char) => char.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '');
  };

  // 工具函数：蛇形命名（用于 Rust 字段）
  const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  };

  // 工具函数：首字母大写（用于 Go/C# 等）
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // 拓扑排序：确保依赖的结构体先定义
  const topologicalSort = (defs: TypeDefinition[]): TypeDefinition[] => {
    const sorted: TypeDefinition[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (def: TypeDefinition) => {
      if (temp.has(def.name)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(def.name)) return;

      temp.add(def.name);

      // 先访问依赖
      def.dependencies.forEach(depName => {
        const dep = defs.find(d => d.name === depName);
        if (dep && !visited.has(depName)) {
          visit(dep);
        }
      });

      temp.delete(def.name);
      visited.add(def.name);
      sorted.push(def);
    };

    // 找到所有没有被其他类型依赖的（叶子节点优先，但我们需要根节点在后）
    // 所以这里简单处理：按依赖数量排序，依赖少的在前
    const sortedDefs = [...defs].sort((a, b) => {
      const aDeps = a.dependencies.length;
      const bDeps = b.dependencies.length;
      return aDeps - bDeps;
    });

    sortedDefs.forEach(def => {
      if (!visited.has(def.name)) {
        visit(def);
      }
    });

    return sorted;
  };

  // 收集所有类型定义（递归）
  const collectDefinitions = (
      value: any,
      suggestedName: string,
      lang: Language,
      definitions: Map<string, TypeDefinition>,
      visited: Set<string>
  ): string => {
    if (value === null) {
      return getNullType(lang);
    }

    const type = typeof value;

    if (type === 'boolean') return getPrimitiveType('boolean', lang);
    if (type === 'number') return getNumberType(value, lang);
    if (type === 'string') return getPrimitiveType('string', lang);

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return getArrayType('any', lang);
      }
      const itemType = collectDefinitions(value[0], 'Item', lang, definitions, visited);
      return getArrayType(itemType, lang);
    }

    if (type === 'object') {
      const typeName = toPascalCase(suggestedName);

      // 避免循环定义
      if (visited.has(typeName)) {
        return typeName;
      }

      // 如果已经定义过，直接返回类型名
      if (definitions.has(typeName)) {
        return typeName;
      }

      visited.add(typeName);

      const fields: string[] = [];
      const deps: string[] = [];

      Object.entries(value).forEach(([key, val]) => {
        const fieldTypeName = collectDefinitions(val, key, lang, definitions, visited);

        // 如果是对象类型，记录依赖
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          deps.push(toPascalCase(key));
        }

        const fieldCode = generateFieldCode(key, fieldTypeName, lang);
        fields.push(fieldCode);
      });

      visited.delete(typeName);

      // 生成结构体代码
      const structCode = generateStructDefinition(typeName, fields, lang);

      definitions.set(typeName, {
        name: typeName,
        code: structCode,
        dependencies: deps
      });

      return typeName;
    }

    return 'any';
  };

  // 生成字段代码
  const generateFieldCode = (key: string, typeName: string, lang: Language): string => {
    switch (lang) {
      case 'typescript':
        return `${key}: ${typeName};`;
      case 'rust':
        return `pub ${toSnakeCase(key)}: ${typeName},`;
      case 'go':
        return `${capitalize(key)} ${typeName} \`json:"${key}"\``;
      case 'python':
        return `${key}: ${typeName}`;
      case 'java':
        return `private ${typeName} ${key};`;
      case 'csharp':
        return `public ${typeName} ${capitalize(key)} { get; set; }`;
      case 'kotlin':
        return `val ${key}: ${typeName}`;
      case 'swift':
        return `let ${key}: ${typeName}`;
      case 'cpp':
        return `${typeName} ${key};`;
      case 'ruby':
        return `attr_accessor :${toSnakeCase(key)}`;
      default:
        return `${key}: ${typeName}`;
    }
  };

  // 生成结构体定义
  const generateStructDefinition = (name: string, fields: string[], lang: Language): string => {
    const indent = '  ';

    switch (lang) {
      case 'typescript': {
        let result = `interface ${name} {\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        result += `}`;
        return result;
      }

      case 'rust': {
        let result = `#[derive(Debug, Serialize, Deserialize)]\n`;
        result += `pub struct ${name} {\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        result += `}`;
        return result;
      }

      case 'go': {
        let result = `type ${name} struct {\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        result += `}`;
        return result;
      }

      case 'python': {
        let result = `@dataclass\n`;
        result += `class ${name}:\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        return result;
      }

      case 'java': {
        let result = `public class ${name} {\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        result += `\n${indent}// TODO: Add getters and setters\n`;
        result += `}`;
        return result;
      }

      case 'csharp': {
        let result = `public class ${name}\n{\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        result += `}`;
        return result;
      }

      case 'kotlin': {
        let result = `data class ${name}(\n`;
        fields.forEach((field, index) => {
          const comma = index < fields.length - 1 ? ',' : '';
          result += `${indent}${field}${comma}\n`;
        });
        result += `)`;
        return result;
      }

      case 'swift': {
        let result = `struct ${name}: Codable {\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        result += `}`;
        return result;
      }

      case 'cpp': {
        let result = `struct ${name} {\n`;
        fields.forEach(field => {
          result += `${indent}${field}\n`;
        });
        result += `};`;
        return result;
      }

      case 'ruby': {
        let result = `class ${name}\n`;
        result += `${indent}${fields.join('\n' + indent)}\n`;
        result += `end`;
        return result;
      }

      default:
        return `// ${name} definition`;
    }
  };

  const getNullType = (lang: Language): string => {
    switch (lang) {
      case 'typescript': return 'null';
      case 'rust': return 'Option<()>';
      case 'go': return 'interface{}';
      case 'python': return 'None';
      case 'java': return 'Object';
      case 'csharp': return 'object';
      case 'kotlin': return 'Any?';
      case 'swift': return 'Any?';
      case 'cpp': return 'std::nullptr_t';
      case 'ruby': return 'NilClass';
      default: return 'null';
    }
  };

  const getPrimitiveType = (type: string, lang: Language): string => {
    switch (lang) {
      case 'typescript':
        return type;
      case 'rust':
        return type === 'string' ? 'String' : 'bool';
      case 'go':
        return type === 'string' ? 'string' : 'bool';
      case 'python':
        return type === 'string' ? 'str' : 'bool';
      case 'java':
        return type === 'string' ? 'String' : 'Boolean';
      case 'csharp':
        return type === 'string' ? 'string' : 'bool';
      case 'kotlin':
        return type === 'string' ? 'String' : 'Boolean';
      case 'swift':
        return type === 'string' ? 'String' : 'Bool';
      case 'cpp':
        return type === 'string' ? 'std::string' : 'bool';
      case 'ruby':
        return type === 'string' ? 'String' : 'TrueClass | FalseClass';
      default:
        return type;
    }
  };

  const getNumberType = (value: number, lang: Language): string => {
    const isInt = Number.isInteger(value);
    switch (lang) {
      case 'typescript':
        return 'number';
      case 'rust':
        return isInt ? 'i64' : 'f64';
      case 'go':
        return isInt ? 'int' : 'float64';
      case 'python':
        return 'int';
      case 'java':
        return isInt ? 'Integer' : 'Double';
      case 'csharp':
        return isInt ? 'int' : 'double';
      case 'kotlin':
        return isInt ? 'Int' : 'Double';
      case 'swift':
        return isInt ? 'Int' : 'Double';
      case 'cpp':
        return isInt ? 'int' : 'double';
      case 'ruby':
        return 'Numeric';
      default:
        return 'number';
    }
  };

  const getArrayType = (itemType: string, lang: Language): string => {
    switch (lang) {
      case 'typescript':
        return `${itemType}[]`;
      case 'rust':
        return `Vec<${itemType}>`;
      case 'go':
        return `[]${itemType}`;
      case 'python':
        return `List[${itemType}]`;
      case 'java':
        return `List<${itemType}>`;
      case 'csharp':
        return `List<${itemType}>`;
      case 'kotlin':
        return `List<${itemType}>`;
      case 'swift':
        return `[${itemType}]`;
      case 'cpp':
        return `std::vector<${itemType}>`;
      case 'ruby':
        return `Array<${itemType}>`;
      default:
        return `${itemType}[]`;
    }
  };

  // 主生成函数
  const generateTypes = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const definitions = new Map<string, TypeDefinition>();

      // 收集所有定义
      collectDefinitions(parsed, rootTypeName, selectedLang, definitions, new Set());

      // 转换为数组并排序
      const defsArray = Array.from(definitions.values());
      const sorted = topologicalSort(defsArray);

      // 生成输出
      let result = '';

      // Python 需要导入
      if (selectedLang === 'python' && sorted.length > 0) {
        result = 'from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n';
      }

      // Rust 嵌套结构体需要按依赖顺序输出（依赖少的在前）
      // 实际上 topologicalSort 已经处理了，但我们需要子结构体在前
      // 反转数组，让叶子节点（依赖少的）在前
      const ordered = selectedLang === 'rust' || selectedLang === 'go' || selectedLang === 'java' || selectedLang === 'csharp'
          ? sorted.reverse()
          : sorted;

      ordered.forEach((def, index) => {
        result += def.code;
        if (index < ordered.length - 1) {
          result += '\n\n';
        }
      });

      setOutput(result);
      setError('');
    } catch (e) {
      setError('JSON 解析错误: ' + (e as Error).message);
      setOutput('');
    }
  }, [input, selectedLang, rootTypeName]);

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
    setError('');
  };

  const handleSample = () => {
    const sample = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
      },
      tags: ['developer', 'admin']
    };
    setInput(JSON.stringify(sample, null, 2));
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
              JSON 转类型定义
            </h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
              将 JSON 转换为 TypeScript、Rust、Go 等多种语言的类型定义
            </p>
          </div>
          <Button
              variant="outline"
              size="sm"
              onClick={handleSample}
              className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
          >
            <FileJson className="w-4 h-4 mr-2" />
            加载示例
          </Button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            目标语言
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
                <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id)}
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-sm transition-all',
                        selectedLang === lang.id
                            ? 'bg-[#8B9A8B] dark:bg-[#7A897A] text-white'
                            : 'bg-white dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#A0A0A0] border border-[#D9D8D5] dark:border-[#404040]'
                    )}
                >
                  {lang.name}
                </button>
            ))}
          </div>
        </div>

        {/* Root Type Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
            根类型名称
          </label>
          <input
              type="text"
              value={rootTypeName}
              onChange={e => setRootTypeName(e.target.value || 'Root')}
              className="w-full max-w-xs px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm text-[#2D2D2D] dark:text-[#E8E8E8] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A]"
              placeholder="Root"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                JSON 输入
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
                placeholder="在此粘贴 JSON 数据..."
                className={cn(
                    'w-full h-[400px] p-4 bg-white dark:bg-[#2A2A2A] border rounded-lg resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all',
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

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
                生成的 {languages.find(l => l.id === selectedLang)?.name} 类型
              </label>
              <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={generateTypes}
                    disabled={!input}
                    className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
                >
                  生成
                </Button>
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
            </div>
            <textarea
                value={output}
                readOnly
                placeholder={`点击"生成"按钮生成 ${languages.find(l => l.id === selectedLang)?.name} 类型定义...`}
                className="w-full h-[400px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8]"
                spellCheck={false}
            />
          </div>
        </div>
      </div>
  );
}