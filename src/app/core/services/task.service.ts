import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskItem,
  TaskDetail,
  TaskListResponse,
  TaskFilterParams,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskComment,
  TimeLog
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  /**
   * Lấy danh sách tác vụ theo bộ lọc
   */
  getTasks(filters: TaskFilterParams = {}): Observable<TaskListResponse> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            params = params.append(`${key}[]`, item);
          });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.get<TaskListResponse>(this.apiUrl, { params, withCredentials: true });
  }

  /**
   * Lấy chi tiết một tác vụ
   */
  getTaskById(id: string): Observable<TaskDetail> {
    return this.http.get<TaskDetail>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Tạo tác vụ mới
   */
  createTask(payload: CreateTaskPayload): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, payload, { withCredentials: true });
  }

  /**
   * Cập nhật tác vụ
   */
  updateTask(id: string, payload: UpdateTaskPayload): Observable<TaskDetail> {
    return this.http.patch<TaskDetail>(`${this.apiUrl}/${id}`, payload, { withCredentials: true });
  }

  /**
   * Cập nhật hàng loạt (Drag & Drop)
   */
  bulkMoveTasks(moves: { taskId: string, statusId?: string, boardColumnOrder: number }[], projectId?: string): Observable<{ success: boolean; count: number }> {
    return this.http.post<{ success: boolean; count: number }>(`${this.apiUrl}/bulk-move`, { moves, projectId }, { withCredentials: true });
  }

  /**
   * Cập nhật hàng loạt nhiều trường
   */
  bulkUpdateTasks(ids: string[], payload: Partial<UpdateTaskPayload>, projectId: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/bulk`,
      { taskIds: ids, projectId, ...payload },
      { withCredentials: true }
    );
  }

  /**
   * Xóa tác vụ (Soft Delete)
   */
  deleteTask(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Xóa hàng loạt tác vụ
   */
  bulkDeleteTasks(ids: string[], projectId: string): Observable<{ success: boolean; count: number }> {
    return this.http.delete<{ success: boolean; count: number }>(
      `${this.apiUrl}/bulk`,
      { body: { taskIds: ids, projectId }, withCredentials: true }
    );
  }

  /**
   * Thêm bình luận vào tác vụ
   */
  addComment(taskId: string, content: string, parentCommentId?: string): Observable<TaskComment> {
    return this.http.post<TaskComment>(
      `${this.apiUrl}/${taskId}/comments`,
      { content, parentCommentId },
      { withCredentials: true }
    );
  }

  /**
   * Tạo Checklist cho tác vụ
   */
  createChecklist(taskId: string, title: string, items: string[]): Observable<TaskDetail> {
    return this.http.post<TaskDetail>(
      `${this.apiUrl}/${taskId}/checklists`,
      { title, items },
      { withCredentials: true }
    );
  }

  /**
   * Toggle trạng thái của 1 mục Checklist
   */
  toggleChecklistItem(itemId: string, isDone: boolean): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/checklist-items/${itemId}`,
      { isDone },
      { withCredentials: true }
    );
  }

  /**
   * Ghi nhận thời gian làm việc (Time Log)
   */
  logTime(taskId: string, startedAt: string, endedAt?: string, note?: string, isBillable = false): Observable<TimeLog> {
    return this.http.post<TimeLog>(
      `${this.apiUrl}/${taskId}/time-logs`,
      { startedAt, endedAt, note, isBillable },
      { withCredentials: true }
    );
  }
}
