import { useState, Suspense } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import Sidebar from '@/components/layout/Sidebar';
import { getToolById } from '@/config/tools';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Default tool to show
const DEFAULT_TOOL_ID = 'json-formatter';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <Loader2 className="w-8 h-8 text-[#8B9A8B] dark:text-[#7A897A] animate-spin" />
    </div>
  );
}

function AppContent() {
  const [activeTool, setActiveTool] = useState(DEFAULT_TOOL_ID);

  const currentTool = getToolById(activeTool);
  const ToolComponent = currentTool?.component;

  return (
    <div className="flex h-screen bg-[#F5F5F3] dark:bg-[#1E1E1E] transition-colors duration-300">
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          {ToolComponent ? (
            <Suspense fallback={<LoadingFallback />}>
              <div
                className={cn(
                  'animate-in fade-in slide-in-from-bottom-4 duration-500'
                )}
              >
                <ToolComponent />
              </div>
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-[#9A9A9A] dark:text-[#6B6B6B]">
              工具加载失败
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
