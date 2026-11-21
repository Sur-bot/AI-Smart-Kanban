import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { ProjectMember, ProjectMemberRole, JobRoleId } from '@core/models/task.model';

export interface AddMemberPayload {
  userId: string;
  role?: ProjectMemberRole;
  jobRole?: JobRoleId;
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  private http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private apiUrl = this.appConfig.apiUrl;

  getMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(
      `${this.apiUrl}/projects/${projectId}/members`
    );
  }

  addMember(projectId: string, payload: AddMemberPayload): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(
      `${this.apiUrl}/projects/${projectId}/members`,
      payload
    );
  }

  removeMember(projectId: string, memberId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/members/${memberId}`
    );
  }

  updateRole(projectId: string, memberId: string, role: ProjectMemberRole): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(
      `${this.apiUrl}/projects/${projectId}/members/${memberId}/role`,
      { role }
    );
  }

  updateJobRole(projectId: string, memberId: string, jobRole: JobRoleId | null): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(
      `${this.apiUrl}/projects/${projectId}/members/${memberId}/job-role`,
      { jobRole }
    );
  }

  leaveProject(projectId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/members/leave`,
      {}
    );
  }

  transferOwnership(projectId: string, newOwnerUserId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/transfer-ownership`,
      { newOwnerUserId }
    );
  }
}
