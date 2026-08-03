export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type TaskType = 'task' | 'bug' | 'story' | 'epic' | 'feature' | 'milestone';
export type StatusCategory = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface TaskStatus {
  id: string;
  project_id?: string;
  name: string;
  color: string;
  icon?: string;
  category: StatusCategory;
  sort_order: number;
  is_default?: boolean;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskChecklistItem {
  id: string;
  checklist_id?: string;
  text: string;
  is_done: boolean;
  assignee_id?: string;
  assignee?: UserSummary;
  due_date?: string;
  sort_order?: number;
  completed_at?: string;
}

export interface TaskChecklist {
  id: string;
  task_id?: string;
  title: string;
  sort_order?: number;
  task_checklist_items?: TaskChecklistItem[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  parent_comment_id?: string;
  content: string;
  content_json?: any;
  is_edited?: boolean;
  reactions?: Record<string, string[]>;
  created_at: string;
  updated_at?: string;
  author?: UserSummary;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  storage_key: string;
  thumbnail_key?: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  uploaded_by_user?: { id: string; name: string };
}

export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  note?: string;
  is_billable: boolean;
  logged_at: string;
  user?: UserSummary;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  actor_id: string;
  action: string;
  field?: string;
  old_value?: any;
  new_value?: any;
  metadata?: Record<string, any>;
  created_at: string;
  actor?: UserSummary;
}

export interface SubTaskSummary {
  id: string;
  title: string;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  status?: TaskStatus;
  assignee?: UserSummary;
}

/**
 * Task item trong danh sách (Flat & Lightweight)
 */
export interface TaskItem {
  id: string;
  workspaceId: string;
  projectId?: string;
  parentTaskId?: string;
  statusId: string;
  status?: TaskStatus;
  title: string;
  description?: string;
  priority: TaskPriority;
  taskType: TaskType;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  creatorId: string;
  creator?: UserSummary;
  assigneeId?: string;
  assignee?: UserSummary;
  assignees: UserSummary[];
  labels: TaskLabel[];
  estimatedMinutes?: number;
  actualMinutes: number;
  storyPoints?: number;
  sprintId?: string;
  sortOrder: number;
  boardColumnOrder: number;
  aiRiskScore?: number;
  aiSummary?: string;
  aiTags?: string[];
  checklistCount: number;
  checklistDoneCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;

  // Thuộc tính phục vụ hiển thị trên Kanban/Deadline Board
  timeLabel?: string;
  timeColor?: 'red' | 'green' | 'default';
  stripeColor?: string;
}

/**
 * Task Detail đầy đủ các quan hệ
 */
export interface TaskDetail extends TaskItem {
  descriptionJson?: any;
  checklists?: TaskChecklist[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  timeLogs?: TimeLog[];
  activities?: TaskActivity[];
  subtasks?: SubTaskSummary[];
}

export interface TaskListResponse {
  tasks: TaskItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskFilterParams {
  workspaceId?: string;
  projectId?: string;
  sprintId?: string;
  statusId?: string;
  statusIds?: string[];
  priority?: TaskPriority;
  priorities?: TaskPriority[];
  assigneeId?: string;
  role?: 'all' | 'mine' | 'assigned_to_me' | 'created_by_me';
  isOverdue?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  parentTaskId?: string;
  onlyRootTasks?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTaskPayload {
  workspaceId?: string;
  projectId?: string;
  statusId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  descriptionJson?: any;
  priority?: TaskPriority;
  taskType?: TaskType;
  startDate?: string;
  dueDate?: string;
  assigneeId?: string;
  assigneeIds?: string[];
  labelIds?: string[];
  estimatedMinutes?: number;
  storyPoints?: number;
  sprintId?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  actualMinutes?: number;
  sortOrder?: number;
  boardColumnOrder?: number;
  isArchived?: boolean;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed' | 'on_hold';
  color?: string;
  icon?: string;
  cover_url?: string;
  owner_id: string;
  start_date?: string;
  end_date?: string;
  is_public: boolean;
  created_at: string;
  statuses?: TaskStatus[];
}
