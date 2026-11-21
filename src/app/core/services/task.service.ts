import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import {
  TaskItem,
  TaskDetail,
  TaskListResponse,
  TaskFilterParams,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskComment,
  TimeLog,
} from '@core/models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private apiUrl = `${this.appConfig.apiUrl}/tasks`;

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

  getTaskById(id: string): Observable<TaskDetail> {
    return this.http.get<TaskDetail>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createTask(payload: CreateTaskPayload): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, payload, { withCredentials: true });
  }

  updateTask(id: string, payload: UpdateTaskPayload): Observable<TaskDetail> {
    return this.http.patch<TaskDetail>(`${this.apiUrl}/${id}`, payload, { withCredentials: true });
  }

  bulkMoveTasks(moves: { taskId: string, statusId?: string, boardColumnOrder: number }[], projectId?: string): Observable<{ success: boolean; count: number }> {
    return this.http.post<{ success: boolean; count: number }>(`${this.apiUrl}/bulk-move`, { moves, projectId }, { withCredentials: true });
  }

  bulkUpdateTasks(ids: string[], payload: Partial<UpdateTaskPayload>, projectId: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/bulk`,
      { taskIds: ids, projectId, ...payload },
      { withCredentials: true }
    );
  }

  deleteTask(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  bulkDeleteTasks(ids: string[], projectId: string): Observable<{ success: boolean; count: number }> {
    return this.http.delete<{ success: boolean; count: number }>(
      `${this.apiUrl}/bulk`,
      { body: { taskIds: ids, projectId }, withCredentials: true }
    );
  }

  addComment(taskId: string, content: string, parentCommentId?: string): Observable<TaskComment> {
    return this.http.post<TaskComment>(
      `${this.apiUrl}/${taskId}/comments`,
      { content, parentCommentId },
      { withCredentials: true }
    );
  }

  createChecklist(taskId: string, title: string, items: string[]): Observable<TaskDetail> {
    return this.http.post<TaskDetail>(
      `${this.apiUrl}/${taskId}/checklists`,
      { title, items },
      { withCredentials: true }
    );
  }

  toggleChecklistItem(itemId: string, isDone: boolean): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/checklist-items/${itemId}`,
      { isDone },
      { withCredentials: true }
    );
  }

  logTime(taskId: string, startedAt: string, endedAt?: string, note?: string, isBillable = false): Observable<TimeLog> {
    return this.http.post<TimeLog>(
      `${this.apiUrl}/${taskId}/time-logs`,
      { startedAt, endedAt, note, isBillable },
      { withCredentials: true }
    );
  }
}
