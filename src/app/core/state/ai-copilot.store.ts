import { Injectable, inject, computed, signal } from '@angular/core';
import { AiChatService } from '../services/ai-chat.service';
import { AuthService } from '../auth/auth.service';
import { TaskStore } from './task.store';
import { TranslateService } from '@ngx-translate/core';
import {
  AiChatMessage,
  AiPendingAction,
  AiQuotaInfo,
  AiChatRequest,
  AiContextPayload,
  AiTaskContext,
  AiProjectContext
} from '../models/ai.model';

/**
 * Signal-based Store quản lý toàn bộ state của AI CoPilot.
 * Theo đúng pattern TaskStore hiện tại.
 */
@Injectable({ providedIn: 'root' })
export class AiCopilotStore {
  private aiChatService = inject(AiChatService);
  private authService = inject(AuthService);
  private taskStore = inject(TaskStore);
  private translate = inject(TranslateService);

  // ─── Signals ──────────────────────────────────────────
  readonly messages = signal<AiChatMessage[]>([]);
  readonly currentSessionId = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isStreaming = signal<boolean>(false);
  readonly quota = signal<AiQuotaInfo | null>(null);
  readonly error = signal<string | null>(null);
  readonly pendingActions = signal<AiPendingAction[]>([]);

  /** CoPilot Panel đang mở hay không */
  readonly isPanelOpen = signal<boolean>(false);
  /** Floating Bubble chat đang mở hay không */
  readonly isBubbleOpen = signal<boolean>(false);

  // ─── Computed Selectors ───────────────────────────────
  readonly isQuotaExceeded = computed(() => {
    const q = this.quota();
    return q ? q.used >= q.limit : false;
  });

  readonly remainingQuota = computed(() => {
    const q = this.quota();
    return q ? Math.max(0, q.limit - q.used) : 0;
  });

  readonly hasMessages = computed(() => this.messages().length > 0);

  readonly lastMessage = computed(() => {
    const msgs = this.messages();
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  });

  // ─── Actions ──────────────────────────────────────────

  /**
   * Gửi tin nhắn tới AI CoPilot.
   */
  sendMessage(content: string) {
    if (!content.trim() || this.isLoading() || this.isQuotaExceeded()) return;

    // 1. Thêm tin nhắn user vào danh sách (optimistic)
    const userMessage: AiChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      status: 'done',
      timestamp: new Date().toISOString()
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.isLoading.set(true);
    this.error.set(null);

    // 2. Thêm placeholder cho AI response
    const aiPlaceholder: AiChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      status: 'sending',
      timestamp: new Date().toISOString()
    };
    this.messages.update(msgs => [...msgs, aiPlaceholder]);

    // 3. Xây dựng context từ dữ liệu hiện tại
    const context = this.buildContext();

    // 4. Gửi request tới backend
    const payload: AiChatRequest = {
      message: content.trim(),
      sessionId: this.currentSessionId() || undefined,
      projectId: this.taskStore.currentProjectId() || '',
      lang: (this.translate.currentLang as unknown as string) || 'vi',
      context
    };

    this.aiChatService.sendMessage(payload).subscribe({
      next: response => {
        // Cập nhật session ID
        if (response.sessionId) {
          this.currentSessionId.set(response.sessionId);
        }

        // Thay thế placeholder bằng response thật
        this.messages.update(msgs =>
          msgs.map(m => m.id === aiPlaceholder.id
            ? { ...response.message, id: aiPlaceholder.id }
            : m
          )
        );

        // Cập nhật pending actions (nếu AI đề xuất hành động)
        if (response.message.pendingActions?.length) {
          this.pendingActions.update(actions => [
            ...actions,
            ...response.message.pendingActions!
          ]);
        }

        // Cập nhật quota
        if (response.quota) {
          this.quota.set(response.quota);
        }

        this.isLoading.set(false);
      },
      error: err => {
        // Đánh dấu placeholder là lỗi
        this.messages.update(msgs =>
          msgs.map(m => m.id === aiPlaceholder.id
            ? { ...m, content: 'Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại.', status: 'error' as const }
            : m
          )
        );

        this.error.set(err.error?.message || 'Không thể kết nối AI CoPilot');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Xác nhận thực thi hành động AI đề xuất.
   */
  confirmAction(actionId: string) {
    const sessionId = this.currentSessionId();
    if (!sessionId) return;

    // Đánh dấu đang xử lý
    this.pendingActions.update(actions =>
      actions.map(a => a.id === actionId ? { ...a, status: 'confirmed' as const } : a)
    );

    this.aiChatService.confirmAction({ actionId, sessionId }).subscribe({
      next: response => {
        // Đánh dấu đã thực thi
        this.pendingActions.update(actions =>
          actions.map(a => a.id === actionId
            ? { ...a, status: 'executed' as const, result: response.data }
            : a
          )
        );

        // Thêm tin nhắn xác nhận vào chat
        const confirmMessage: AiChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `✅ ${response.message}`,
          status: 'done',
          timestamp: new Date().toISOString()
        };
        this.messages.update(msgs => [...msgs, confirmMessage]);

        // Cập nhật quota
        if (response.quota) {
          this.quota.set(response.quota);
        }

        // Reload tasks nếu hành động thay đổi dữ liệu
        this.taskStore.loadTasks();
      },
      error: err => {
        this.pendingActions.update(actions =>
          actions.map(a => a.id === actionId ? { ...a, status: 'pending' as const } : a)
        );
        this.error.set(err.error?.message || 'Không thể thực thi hành động');
      }
    });
  }

  /**
   * Từ chối hành động AI đề xuất.
   */
  rejectAction(actionId: string) {
    const sessionId = this.currentSessionId();
    if (!sessionId) return;

    this.pendingActions.update(actions =>
      actions.map(a => a.id === actionId ? { ...a, status: 'rejected' as const } : a)
    );

    this.aiChatService.rejectAction(actionId, sessionId).subscribe();
  }

  /**
   * Xóa toàn bộ chat hiện tại và bắt đầu session mới.
   */
  clearChat() {
    this.messages.set([]);
    this.currentSessionId.set(null);
    this.pendingActions.set([]);
    this.error.set(null);
  }

  /**
   * Tải thông tin quota từ server.
   */
  loadQuota() {
    this.aiChatService.getQuota().subscribe({
      next: quota => this.quota.set(quota),
      error: err => console.warn('[AiCopilotStore] Could not load quota:', err)
    });
  }

  /**
   * Tải một session cũ (lịch sử chat).
   */
  loadSession(sessionId: string) {
    this.isLoading.set(true);
    this.aiChatService.getSession(sessionId).subscribe({
      next: session => {
        this.currentSessionId.set(session.id);
        this.messages.set(session.messages);
        this.isLoading.set(false);
      },
      error: err => {
        this.error.set('Không thể tải lịch sử trò chuyện');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Toggle trạng thái CoPilot Panel.
   */
  togglePanel(open?: boolean) {
    this.isPanelOpen.set(open !== undefined ? open : !this.isPanelOpen());
  }

  /**
   * Toggle trạng thái Floating Bubble.
   */
  toggleBubble(open?: boolean) {
    this.isBubbleOpen.set(open !== undefined ? open : !this.isBubbleOpen());
  }

  /**
   * Reset toàn bộ state (khi logout).
   */
  resetState() {
    this.messages.set([]);
    this.currentSessionId.set(null);
    this.isLoading.set(false);
    this.isStreaming.set(false);
    this.quota.set(null);
    this.error.set(null);
    this.pendingActions.set([]);
    this.isPanelOpen.set(false);
    this.isBubbleOpen.set(false);
  }

  // ─── Private Helpers ──────────────────────────────────

  /**
   * Xây dựng context từ dữ liệu hiện tại của TaskStore.
   * Context này được gửi kèm mỗi request để AI hiểu bối cảnh.
   */
  private buildContext(): AiContextPayload {
    const tasks = this.taskStore.tasks();
    const project = this.taskStore.currentProject();

    const currentTasks: AiTaskContext[] = tasks.slice(0, 50).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status?.name || 'Unknown',
      priority: t.priority,
      assignee: t.assignee?.name,
      dueDate: t.dueDate,
      taskType: t.taskType
    }));

    const overdueCount = tasks.filter(t => {
      if (!t.dueDate || t.completedAt) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const projectInfo: AiProjectContext | undefined = project ? {
      id: project.id,
      name: project.name,
      memberCount: project.project_members?.length || 0,
      taskCount: tasks.length,
      overdueCount
    } : undefined;

    return { currentTasks, projectInfo };
  }
}
