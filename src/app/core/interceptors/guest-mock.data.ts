import { TaskItem, TaskStatus, TaskLabel, UserSummary, Project } from '../models/task.model';

export const GUEST_USERS: UserSummary[] = [
  { id: 'user-1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: 'user-2', name: 'Trần Thị B', email: 'tranthib@example.com', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 'user-3', name: 'Lê Văn C', email: 'levanc@example.com', avatar_url: 'https://i.pravatar.cc/150?u=a04258114e29026702d' }
];

export const GUEST_LABELS: TaskLabel[] = [
  { id: 'lbl-1', name: 'Tính năng', color: 'bg-blue-500' },
  { id: 'lbl-2', name: 'Lỗi', color: 'bg-red-500' },
  { id: 'lbl-3', name: 'Thiết kế', color: 'bg-purple-500' },
  { id: 'lbl-4', name: 'Gấp', color: 'bg-orange-500' }
];

export const GUEST_STATUSES: TaskStatus[] = [
  { id: 'status-todo', name: 'To Do', category: 'todo', color: '#94a3b8', sort_order: 1 },
  { id: 'status-in-progress', name: 'In Progress', category: 'in_progress', color: '#3b82f6', sort_order: 2 },
  { id: 'status-review', name: 'Review', category: 'review', color: '#f59e0b', sort_order: 3 },
  { id: 'status-done', name: 'Done', category: 'done', color: '#10b981', sort_order: 4 }
];

export const GUEST_PROJECT: Project = {
  id: 'proj-guest',
  workspace_id: 'ws-guest',
  name: 'Dự án Sản phẩm AI Smart',
  status: 'active',
  owner_id: 'user-1',
  privacy: 'public',
  project_type: 'project',
  created_at: new Date().toISOString(),
  statuses: GUEST_STATUSES
};

export const GUEST_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    workspaceId: 'ws-guest',
    projectId: 'proj-guest',
    statusId: 'status-todo',
    status: GUEST_STATUSES[0],
    title: 'Thiết kế trang Landing Page mới',
    priority: 'high',
    taskType: 'feature',
    creatorId: 'user-1',
    assignee: GUEST_USERS[1],
    assignees: [GUEST_USERS[1]],
    jobRole: 'FE',
    labels: [GUEST_LABELS[2]],
    actualMinutes: 0,
    sortOrder: 1,
    boardColumnOrder: 1,
    checklistCount: 5,
    checklistDoneCount: 1,
    commentCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    workspaceId: 'ws-guest',
    projectId: 'proj-guest',
    statusId: 'status-todo',
    status: GUEST_STATUSES[0],
    title: 'Nghiên cứu đối thủ cạnh tranh',
    priority: 'medium',
    taskType: 'story',
    creatorId: 'user-1',
    assignee: GUEST_USERS[0],
    assignees: [GUEST_USERS[0]],
    jobRole: 'BA',
    labels: [],
    actualMinutes: 0,
    sortOrder: 2,
    boardColumnOrder: 2,
    checklistCount: 0,
    checklistDoneCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    workspaceId: 'ws-guest',
    projectId: 'proj-guest',
    statusId: 'status-in-progress',
    status: GUEST_STATUSES[1],
    title: 'Tích hợp thanh toán Stripe',
    priority: 'urgent',
    taskType: 'feature',
    creatorId: 'user-1',
    assignee: GUEST_USERS[2],
    assignees: [GUEST_USERS[2]],
    jobRole: 'BE',
    labels: [GUEST_LABELS[0], GUEST_LABELS[3]],
    actualMinutes: 120,
    sortOrder: 1,
    boardColumnOrder: 1,
    checklistCount: 8,
    checklistDoneCount: 4,
    commentCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    workspaceId: 'ws-guest',
    projectId: 'proj-guest',
    statusId: 'status-review',
    status: GUEST_STATUSES[2],
    title: 'Lỗi hiển thị trên Safari Mobile',
    priority: 'high',
    taskType: 'bug',
    creatorId: 'user-2',
    assignee: GUEST_USERS[0],
    assignees: [GUEST_USERS[0]],
    jobRole: 'QA',
    labels: [GUEST_LABELS[1]],
    actualMinutes: 45,
    sortOrder: 1,
    boardColumnOrder: 1,
    checklistCount: 2,
    checklistDoneCount: 2,
    commentCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-5',
    workspaceId: 'ws-guest',
    projectId: 'proj-guest',
    statusId: 'status-done',
    status: GUEST_STATUSES[3],
    title: 'Cập nhật tài liệu API v2',
    priority: 'low',
    taskType: 'task',
    creatorId: 'user-3',
    assignee: GUEST_USERS[1],
    assignees: [GUEST_USERS[1], GUEST_USERS[2]],
    jobRole: 'DevOps',
    labels: [],
    actualMinutes: 200,
    sortOrder: 1,
    boardColumnOrder: 1,
    checklistCount: 0,
    checklistDoneCount: 0,
    commentCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
