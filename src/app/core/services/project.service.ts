import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  /**
   * Lấy danh sách dự án
   */
  getProjects(workspaceId?: string): Observable<Project[]> {
    const params: Record<string, string> = {};
    if (workspaceId) params['workspaceId'] = workspaceId;
    return this.http.get<Project[]>(this.apiUrl, { params, withCredentials: true });
  }

  /**
   * Tạo dự án mới
   */
  createProject(payload: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, payload, { withCredentials: true });
  }

  /**
   * Lấy danh sách trạng thái của dự án
   */
  getProjectStatuses(projectId: string): Observable<TaskStatus[]> {
    return this.http.get<TaskStatus[]>(`${this.apiUrl}/${projectId}/statuses`, { withCredentials: true });
  }
}
