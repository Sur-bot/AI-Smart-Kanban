export interface TaskItem {
  id: string;
  title: string;
  status: 'new' | 'in_progress' | 'completed' | 'deferred' | 'waiting';
  priority: 'high' | 'medium' | 'low' | 'none';
  dueDate?: string;
  creator: string;
  assignee: string;
  project?: string;
  tags?: string[];
  activity?: string;
  isSelected?: boolean;
}

export type TaskViewMode = 'list' | 'deadline' | 'planner' | 'calendar' | 'gantt';

export interface TaskQuickFilter {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
}

export interface ViewTab {
  id: TaskViewMode;
  label: string;
}
