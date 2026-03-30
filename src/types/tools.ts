import type { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  tools: Tool[];
}

export interface HashResult {
  algorithm: string;
  value: string;
}

export interface UUIDResult {
  id: string;
  value: string;
}

export interface RegexMatch {
  text: string;
  index: number;
  groups?: string[];
}

export interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  line: string;
  lineNumber: {
    old?: number;
    new?: number;
  };
}
