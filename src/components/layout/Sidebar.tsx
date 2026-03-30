import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Sun,
  Moon,
  Toolbox,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { toolCategories, searchTools } from '@/config/tools';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

export default function Sidebar({ activeTool, onSelectTool }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    toolCategories.map(cat => cat.id)
  );

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchTools(searchQuery);
  }, [searchQuery]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <aside className="w-[280px] h-screen bg-[#EAE9E6] dark:bg-[#252525] border-r border-[#D9D8D5] dark:border-[#404040] flex flex-col transition-colors duration-300">
      {/* Logo */}
      <div className="p-5 border-b border-[#D9D8D5] dark:border-[#404040]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8B9A8B] dark:bg-[#7A897A] flex items-center justify-center">
            <Toolbox className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[#2D2D2D] dark:text-[#E8E8E8] text-lg leading-tight">
              开发者工具箱
            </h1>
            <p className="text-xs text-[#9A9A9A] dark:text-[#6B6B6B]">
              Developer Toolkit
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A]" />
          <input
            type="text"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm text-[#2D2D2D] dark:text-[#E8E8E8] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#8B9A8B] dark:focus:border-[#7A897A] focus:ring-2 focus:ring-[#8B9A8B]/15 transition-all"
          />
        </div>
      </div>

      {/* Tool List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredTools ? (
          <div className="space-y-1">
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150',
                      activeTool === tool.id
                        ? 'bg-[#E8EBE8] dark:bg-[#8B9A8B]/20 text-[#2D2D2D] dark:text-[#E8E8E8] border-l-3 border-[#8B9A8B]'
                        : 'text-[#6B6B6B] dark:text-[#A0A0A0] hover:bg-white dark:hover:bg-[#2A2A2A]'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{tool.name}</span>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-[#9A9A9A] dark:text-[#6B6B6B] text-sm">
                未找到匹配的工具
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {toolCategories.map(category => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-[#2D2D2D] dark:text-[#E8E8E8] hover:bg-white dark:hover:bg-[#2A2A2A] transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#9A9A9A]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#9A9A9A]" />
                    )}
                    <CategoryIcon className="w-4 h-4 text-[#8B9A8B] dark:text-[#7A897A]" />
                    <span>{category.name}</span>
                  </button>

                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <div className="pl-9 pr-1 py-1 space-y-0.5">
                      {category.tools.map(tool => {
                        const ToolIcon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => onSelectTool(tool.id)}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-sm transition-all duration-150',
                              activeTool === tool.id
                                ? 'bg-[#E8EBE8] dark:bg-[#8B9A8B]/20 text-[#2D2D2D] dark:text-[#E8E8E8] border-l-[3px] border-[#8B9A8B]'
                                : 'text-[#6B6B6B] dark:text-[#A0A0A0] hover:bg-white dark:hover:bg-[#2A2A2A]'
                            )}
                          >
                            <ToolIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{tool.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-[#D9D8D5] dark:border-[#404040]">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#2A2A2A] border border-[#D9D8D5] dark:border-[#404040] rounded-lg text-sm text-[#6B6B6B] dark:text-[#A0A0A0] hover:bg-[#F5F5F3] dark:hover:bg-[#333333] transition-all"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4" />
              <span>切换暗色主题</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span>切换浅色主题</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
