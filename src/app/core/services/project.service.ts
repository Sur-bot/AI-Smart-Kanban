import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectMember, ProjectMemberRole, TaskStatus, CreateProjectPayload } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  getProjects(workspaceId?: string): Observable<Project[]> {
    const params: Record<string, string> = {};
    if (workspaceId) params['workspaceId'] = workspaceId;
    return this.http.get<Project[]>(this.apiUrl, { params, withCredentials: true });
  }

  createProject(payload: CreateProjectPayload): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, payload, { withCredentials: true });
  }

  updateProject(projectId: string, payload: Partial<Project>): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${projectId}`, payload, { withCredentials: true });
  }

  deleteProject(projectId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${projectId}`, { withCredentials: true });
  }

  archiveProject(projectId: string): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${projectId}/archive`, {}, { withCredentials: true });
  }

  getProjectStatuses(projectId: string): Observable<TaskStatus[]> {
    return this.http.get<TaskStatus[]>(`${this.apiUrl}/${projectId}/statuses`, { withCredentials: true });
  }

  // ─── Member management ────────────────────────────────

  getMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.apiUrl}/${projectId}/members`, { withCredentials: true });
  }

  addMember(projectId: string, userId: string, role: ProjectMemberRole = 'member'): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(`${this.apiUrl}/${projectId}/members`, { userId, role }, { withCredentials: true });
  }

  updateMemberRole(projectId: string, memberId: string, role: ProjectMemberRole): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(`${this.apiUrl}/${projectId}/members/${memberId}/role`, { role }, { withCredentials: true });
  }

  removeMember(projectId: string, memberId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${projectId}/members/${memberId}`, { withCredentials: true });
  }

  transferOwnership(projectId: string, newOwnerUserId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${projectId}/transfer-ownership`, { newOwnerUserId }, { withCredentials: true });
  }

  generateInviteLink(projectId: string): Observable<{ token: string; url: string; expires_at: string }> {
    return this.http.post<{ token: string; url: string; expires_at: string }>(`${this.apiUrl}/${projectId}/invite-link`, {}, { withCredentials: true });
  }

  joinByInviteToken(token: string): Observable<Project> {
    return this.http.post<Project>(`${environment.apiUrl}/projects/join`, { token }, { withCredentials: true });
  }
}
