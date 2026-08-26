import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProjectMember, ProjectMemberRole, JobRoleId } from '../models/task.model';

export interface AddMemberPayload {
  userId: string;
  role?: ProjectMemberRole;
  jobRole?: JobRoleId;
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  /** Get all members of a project */
  getMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(
      `${this.apiUrl}/projects/${projectId}/members`
    );
  }

  /** Add a new member to a project */
  addMember(projectId: string, payload: AddMemberPayload): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(
      `${this.apiUrl}/projects/${projectId}/members`,
      payload
    );
  }

  /** Remove a member from a project */
  removeMember(projectId: string, memberId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/members/${memberId}`
    );
  }

  /** Change a member role (admin/member/viewer) */
  updateRole(projectId: string, memberId: string, role: ProjectMemberRole): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(
      `${this.apiUrl}/projects/${projectId}/members/${memberId}/role`,
      { role }
    );
  }

  /** Update a member job role (PM, FE, BE, QA...) */
  updateJobRole(projectId: string, memberId: string, jobRole: JobRoleId | null): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(
      `${this.apiUrl}/projects/${projectId}/members/${memberId}/job-role`,
      { jobRole }
    );
  }

  /** Leave a project (self-removal) */
  leaveProject(projectId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/members/leave`,
      {}
    );
  }

  /** Transfer project ownership */
  transferOwnership(projectId: string, newOwnerUserId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/transfer-ownership`,
      { newOwnerUserId }
    );
  }
}
