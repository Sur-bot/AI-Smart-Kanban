/** Mô hình dữ liệu cho trang danh sách Tác vụ */
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
  activity?: string;          // Mô tả hoạt động gần nhất
  isSelected?: boolean;
}
/** Chế độ xem của trang Tác vụ */
export type TaskViewMode = 'list' | 'deadline' | 'planner' | 'calendar' | 'gantt';
/** Bộ lọc nhanh */
export interface TaskQuickFilter {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
}
