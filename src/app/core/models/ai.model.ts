// ═══════════════════════════════════════════════════════════════════════════
// AI CoPilot — TypeScript Interfaces & Types
// ═══════════════════════════════════════════════════════════════════════════

// ─── Chat Message Types ─────────────────────────────────────────────────
export type AiMessageRole = 'user' | 'assistant' | 'system';
export type AiMessageStatus = 'sending' | 'streaming' | 'done' | 'error';

export interface AiChatMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  status: AiMessageStatus;
  timestamp: string;
  /** Hành động mà AI đề xuất (nếu có) */
  pendingActions?: AiPendingAction[];
}

// ─── Function Calling Types ─────────────────────────────────────────────
export type AiFunctionName =
  | 'createTask'
  | 'updateTask'
  | 'deleteTask'
  | 'listTasks'
  | 'analyzeProject'
  | 'suggestPriority'
  | 'suggestAssignee';

export interface AiPendingAction {
  id: string;
  functionName: AiFunctionName;
  /** Mô tả bằng ngôn ngữ tự nhiên để user hiểu */
  description: string;
  /** Tham số được AI trích xuất từ lệnh */
  parameters: Record<string, unknown>;
  status: 'pending' | 'confirmed' | 'rejected' | 'executed';
  /** Kết quả sau khi thực thi (nếu có) */
  result?: unknown;
}

// ─── Quota Types ────────────────────────────────────────────────────────
export type AiPlanType = 'free' | 'pro' | 'enterprise';

export interface AiQuotaInfo {
  used: number;
  limit: number;
  /** ISO datetime — thời điểm reset quota tiếp theo */
  resetAt: string;
  planType: AiPlanType;
}

// ─── Chat Session ───────────────────────────────────────────────────────
export interface AiChatSession {
  id: string;
  projectId: string;
  title?: string;
  messages: AiChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── API Request/Response ───────────────────────────────────────────────

/** Context dự án được inject vào prompt AI */
export interface AiContextPayload {
  currentTasks?: AiTaskContext[];
  projectInfo?: AiProjectContext;
}

export interface AiTaskContext {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: string;
  dueDate?: string;
  taskType?: string;
}

export interface AiProjectContext {
  id: string;
  name: string;
  memberCount: number;
  taskCount: number;
  overdueCount?: number;
}

/** Request gửi tin nhắn tới AI */
export interface AiChatRequest {
  message: string;
  sessionId?: string;
  projectId: string;
  /** Ngôn ngữ hiện tại (i18n) */
  lang?: string;
  /** Context được gắn kèm (optional — backend tự lấy nếu không truyền) */
  context?: AiContextPayload;
}

/** Response từ AI */
export interface AiChatResponse {
  message: AiChatMessage;
  sessionId: string;
  quota: AiQuotaInfo;
}

/** Request xác nhận hành động AI */
export interface AiActionConfirmRequest {
  actionId: string;
  sessionId: string;
}

/** Response sau khi thực thi hành động */
export interface AiActionConfirmResponse {
  success: boolean;
  message: string;
  /** Dữ liệu được tạo/cập nhật (nếu có) */
  data?: unknown;
  quota: AiQuotaInfo;
}

/** Danh sách chat sessions */
export interface AiSessionListResponse {
  sessions: Omit<AiChatSession, 'messages'>[];
  total: number;
}

// ─── Quick Actions ──────────────────────────────────────────────────────
export type AiQuickActionId =
  | 'analyze_project'
  | 'suggest_priority'
  | 'optimize_assignment'
  | 'daily_summary'
  | 'risk_warning';

export interface AiQuickAction {
  id: AiQuickActionId;
  labelKey: string;
  icon: string;
  prompt: string;
}

/** Danh sách Quick Actions có sẵn */
export const AI_QUICK_ACTIONS: AiQuickAction[] = [
  {
    id: 'analyze_project',
    labelKey: 'AI.QUICK_ACTIONS.ANALYZE_PROJECT',
    icon: 'analytics',
    prompt: 'Phân tích tổng quan dự án hiện tại: tiến độ, bottleneck, tasks quá hạn.'
  },
  {
    id: 'suggest_priority',
    labelKey: 'AI.QUICK_ACTIONS.SUGGEST_PRIORITY',
    icon: 'flag',
    prompt: 'Đề xuất mức ưu tiên cho các task chưa được gán priority.'
  },
  {
    id: 'optimize_assignment',
    labelKey: 'AI.QUICK_ACTIONS.OPTIMIZE_ASSIGNMENT',
    icon: 'group',
    prompt: 'Phân tích workload của từng thành viên và đề xuất phân công lại để tối ưu.'
  },
  {
    id: 'daily_summary',
    labelKey: 'AI.QUICK_ACTIONS.DAILY_SUMMARY',
    icon: 'summarize',
    prompt: 'Tóm tắt hoạt động trong ngày hôm nay: tasks hoàn thành, đang làm, quá hạn.'
  },
  {
    id: 'risk_warning',
    labelKey: 'AI.QUICK_ACTIONS.RISK_WARNING',
    icon: 'warning',
    prompt: 'Liệt kê các task có rủi ro trễ deadline và đề xuất biện pháp xử lý.'
  }
];
