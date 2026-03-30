import { useState, useCallback } from 'react';
import { Copy, Trash2, Check, Terminal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Language = 'javascript' | 'python' | 'go' | 'rust' | 'java' | 'csharp' | 'php' | 'ruby' | 'bash';

interface LanguageOption {
  id: Language;
  name: string;
  extension: string;
}

const languages: LanguageOption[] = [
  { id: 'javascript', name: 'JavaScript (Fetch)', extension: 'js' },
  { id: 'python', name: 'Python (requests)', extension: 'py' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust (reqwest)', extension: 'rs' },
  { id: 'java', name: 'Java (OkHttp)', extension: 'java' },
  { id: 'csharp', name: 'C# (HttpClient)', extension: 'cs' },
  { id: 'php', name: 'PHP (cURL)', extension: 'php' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
  { id: 'bash', name: 'Bash (HTTPie)', extension: 'sh' },
];

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: string;
  contentType?: string;
}

export default function CurlToCode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>('javascript');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [parsed, setParsed] = useState<ParsedCurl | null>(null);

  const parseCurl = useCallback((curlCommand: string): ParsedCurl | null => {
    const result: ParsedCurl = {
      url: '',
      method: 'GET',
      headers: {},
    };

    // Extract URL
    const urlMatch = curlCommand.match(/['"](https?:\/\/[^'"]+)['"]/);
    if (urlMatch) {
      result.url = urlMatch[1];
    }

    // Extract method
    const methodMatch = curlCommand.match(/-X\s+(\w+)/i);
    if (methodMatch) {
      result.method = methodMatch[1].toUpperCase();
    } else if (curlCommand.includes(' -d ') || curlCommand.includes(' --data ')) {
      result.method = 'POST';
    }

    // Extract headers
    const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(curlCommand)) !== null) {
      const key = headerMatch[1].trim();
      const value = headerMatch[2].trim();
      result.headers[key] = value;
      if (key.toLowerCase() === 'content-type') {
        result.contentType = value;
      }
    }

    // Extract data
    const dataMatch = curlCommand.match(/-d\s+['"]([^'"]*)['"]|--data\s+['"]([^'"]*)['"]/);
    if (dataMatch) {
      result.data = dataMatch[1] || dataMatch[2];
    }

    return result.url ? result : null;
  }, []);

  const generateCode = useCallback((curl: ParsedCurl, lang: Language): string => {
    const { url, method, headers, data } = curl;
    const headerEntries = Object.entries(headers);

    switch (lang) {
      case 'javascript': {
        let code = 'const options = {\n';
        code += `  method: '${method}',\n`;
        if (headerEntries.length > 0) {
          code += '  headers: {\n';
          headerEntries.forEach(([key, value]) => {
            code += `    '${key}': '${value}',\n`;
          });
          code += '  },\n';
        }
        if (data) {
          code += `  body: ${data.startsWith('{') ? data : `'${data}'`},\n`;
        }
        code += '};\n\n';
        code += `fetch('${url}', options)\n`;
        code += '  .then(response => response.json())\n';
        code += '  .then(data => console.log(data))\n';
        code += '  .catch(error => console.error(error));';
        return code;
      }

      case 'python': {
        let code = 'import requests\n\n';
        code += `url = '${url}'\n`;
        if (headerEntries.length > 0) {
          code += 'headers = {\n';
          headerEntries.forEach(([key, value]) => {
            code += `    '${key}': '${value}',\n`;
          });
          code += '}\n';
        }
        if (data) {
          code += `data = ${data}\n`;
        }
        code += `\nresponse = requests.${method.toLowerCase()}(url`;
        if (headerEntries.length > 0) code += ', headers=headers';
        if (data) code += ', json=data';
        code += ')\n';
        code += 'print(response.json())';
        return code;
      }

      case 'go': {
        let code = 'package main\n\n';
        code += 'import (\n';
        code += '\t"fmt"\n';
        code += '\t"net/http"\n';
        if (data) code += '\t"strings"\n';
        code += ')\n\n';
        code += 'func main() {\n';
        if (data) {
          code += `\tpayload := strings.NewReader(\`${data}\`)\n`;
          code += `\treq, _ := http.NewRequest("${method}", "${url}", payload)\n`;
        } else {
          code += `\treq, _ := http.NewRequest("${method}", "${url}", nil)\n`;
        }
        headerEntries.forEach(([key, value]) => {
          code += `\treq.Header.Add("${key}", "${value}")\n`;
        });
        code += '\tclient := &http.Client{}\n';
        code += '\tresp, err := client.Do(req)\n';
        code += '\tif err != nil {\n';
        code += '\t\tfmt.Println(err)\n';
        code += '\t\treturn\n';
        code += '\t}\n';
        code += '\tdefer resp.Body.Close()\n';
        code += '\tfmt.Println(resp.Status)\n';
        code += '}';
        return code;
      }

      case 'rust': {
        let code = 'use reqwest;\n';
        if (data) code += 'use serde_json::json;\n';
        code += '\n';
        code += '#[tokio::main]\n';
        code += 'async fn main() -> Result<(), Box<dyn std::error::Error>> {\n';
        code += `    let client = reqwest::Client::new();\n`;
        code += `    let response = client.${method.toLowerCase()}("${url}")\n`;
        headerEntries.forEach(([key, value]) => {
          code += `        .header("${key}", "${value}")\n`;
        });
        if (data) {
          code += `        .json(&${data})\n`;
        }
        code += `        .send()\n`;
        code += `        .await?;\n\n`;
        code += `    println!("{}", response.text().await?);\n`;
        code += `    Ok(())\n`;
        code += '}';
        return code;
      }

      case 'java': {
        let code = 'import okhttp3.*;\n\n';
        code += 'public class Main {\n';
        code += '    public static void main(String[] args) {\n';
        code += '        OkHttpClient client = new OkHttpClient();\n\n';
        if (data) {
          code += `        MediaType mediaType = MediaType.parse("${curl.contentType || 'application/json'}");\n`;
          code += `        RequestBody body = RequestBody.create(mediaType, "${data.replace(/"/g, '\\"')}");\n`;
        }
        code += '        Request request = new Request.Builder()\n';
        code += `            .url("${url}")\n`;
        headerEntries.forEach(([key, value]) => {
          code += `            .addHeader("${key}", "${value}")\n`;
        });
        if (data) {
          code += `            .${method.toLowerCase()}(body)\n`;
        }
        code += '            .build();\n\n';
        code += '        try {\n';
        code += '            Response response = client.newCall(request).execute();\n';
        code += '            System.out.println(response.body().string());\n';
        code += '        } catch (Exception e) {\n';
        code += '            e.printStackTrace();\n';
        code += '        }\n';
        code += '    }\n';
        code += '}';
        return code;
      }

      case 'csharp': {
        let code = 'using System;\n';
        code += 'using System.Net.Http;\n';
        code += 'using System.Text;\n';
        code += 'using System.Threading.Tasks;\n\n';
        code += 'class Program\n{\n';
        code += '    static async Task Main()\n';
        code += '    {\n';
        code += '        using (var client = new HttpClient())\n';
        code += '        {\n';
        headerEntries.forEach(([key, value]) => {
          code += `            client.DefaultRequestHeaders.Add("${key}", "${value}");\n`;
        });
        if (data) {
          code += `            var content = new StringContent(@"${data.replace(/"/g, '""')}", Encoding.UTF8, "${curl.contentType || 'application/json'}");\n`;
          code += `            var response = await client.${method.charAt(0) + method.slice(1).toLowerCase()}Async("${url}", content);\n`;
        } else {
          code += `            var response = await client.${method.toLowerCase()}Async("${url}");\n`;
        }
        code += '            var result = await response.Content.ReadAsStringAsync();\n';
        code += '            Console.WriteLine(result);\n';
        code += '        }\n';
        code += '    }\n';
        code += '}';
        return code;
      }

      case 'php': {
        let code = '<?php\n\n';
        code += '$ch = curl_init();\n\n';
        code += `curl_setopt($ch, CURLOPT_URL, '${url}');\n`;
        code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
        code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');\n`;
        if (headerEntries.length > 0) {
          code += `curl_setopt($ch, CURLOPT_HTTPHEADER, [\n`;
          headerEntries.forEach(([key, value]) => {
            code += `    '${key}: ${value}',\n`;
          });
          code += ']);\n';
        }
        if (data) {
          code += `curl_setopt($ch, CURLOPT_POSTFIELDS, '${data}');\n`;
        }
        code += '\n$response = curl_exec($ch);\n';
        code += 'curl_close($ch);\n\n';
        code += 'echo $response;\n';
        return code;
      }

      case 'ruby': {
        let code = "require 'net/http'\n";
        code += "require 'uri'\n";
        if (data) code += "require 'json'\n";
        code += '\n';
        code += `uri = URI.parse('${url}')\n`;
        code += `http = Net::HTTP.new(uri.host, uri.port)\n`;
        if (url.startsWith('https')) {
          code += 'http.use_ssl = true\n';
        }
        code += `\nrequest = Net::HTTP::${method.charAt(0) + method.slice(1).toLowerCase()}.new(uri.request_uri)\n`;
        headerEntries.forEach(([key, value]) => {
          code += `request['${key}'] = '${value}'\n`;
        });
        if (data) {
          code += `request.body = '${data}'\n`;
        }
        code += '\nresponse = http.request(request)\n';
        code += 'puts response.body\n';
        return code;
      }

      case 'bash': {
        let code = `http ${method} ${url}`;
        headerEntries.forEach(([key, value]) => {
          code += ` '${key}:${value}'`;
        });
        if (data) {
          code += ` ${data}`;
        }
        return code;
      }

      default:
        return '// Code generation not available for this language';
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      setParsed(null);
      return;
    }

    const parsedCurl = parseCurl(input);
    if (!parsedCurl) {
      setError('无法解析 cURL 命令，请检查格式是否正确');
      setOutput('');
      setParsed(null);
      return;
    }

    setParsed(parsedCurl);
    const generated = generateCode(parsedCurl, selectedLang);
    setOutput(generated);
    setError('');
  }, [input, selectedLang, parseCurl, generateCode]);

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
    setParsed(null);
  };

  const handleSample = () => {
    const sample = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token123' \\
  -d '{"name":"John","email":"john@example.com"}'`;
    setInput(sample);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-[#E8E8E8]">
            cURL 转代码
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
            将 cURL 命令转换为多语言 HTTP 请求代码
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSample}
          className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
        >
          <Terminal className="w-4 h-4 mr-2" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8]">
              cURL 命令
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
            placeholder="在此粘贴 cURL 命令..."
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
              生成的 {languages.find(l => l.id === selectedLang)?.name} 代码
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConvert}
                disabled={!input}
                className="text-[#6B6B6B] dark:text-[#A0A0A0] border-[#D9D8D5] dark:border-[#404040]"
              >
                转换
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
            placeholder={`点击"转换"按钮生成 ${languages.find(l => l.id === selectedLang)?.name} 代码...`}
            className="w-full h-[400px] p-4 bg-[#F5F5F3] dark:bg-[#1E1E1E] border border-[#D9D8D5] dark:border-[#404040] rounded-lg resize-none font-mono text-sm leading-relaxed text-[#2D2D2D] dark:text-[#E8E8E8]"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Parsed Info */}
      {parsed && (
        <div className="bg-[#F5F5F3] dark:bg-[#1E1E1E] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8] mb-3">
            解析结果
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[#9A9A9A] dark:text-[#6B6B6B]">方法:</span>
              <span className="ml-2 font-mono text-[#2D2D2D] dark:text-[#E8E8E8]">{parsed.method}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#9A9A9A] dark:text-[#6B6B6B]">URL:</span>
              <span className="ml-2 font-mono text-[#2D2D2D] dark:text-[#E8E8E8] truncate">{parsed.url}</span>
            </div>
            <div>
              <span className="text-[#9A9A9A] dark:text-[#6B6B6B]">Headers:</span>
              <span className="ml-2 font-mono text-[#2D2D2D] dark:text-[#E8E8E8]">{Object.keys(parsed.headers).length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
