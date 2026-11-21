import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@core/config/app-config.token';
import { ProjectMemberRole } from '@core/models/task.model';

const PERMISSION_MATRIX: Record<string, ProjectMemberRole[]> = {
  'project.view':            ['owner', 'admin', 'member', 'viewer'],
  'project.update':          ['owner', 'admin'],
  'project.delete':          ['owner'],
  'project.archive':         ['owner', 'admin'],
  'project.transferOwner':   ['owner'],

  'member.view':             ['owner', 'admin', 'member', 'viewer'],
  'member.invite':           ['owner', 'admin'],
  'member.inviteLink':       ['owner', 'admin', 'member'],
  'member.remove':           ['owner', 'admin'],
  'member.changeRole':       ['owner', 'admin'],
  'member.leave':            ['admin', 'member', 'viewer'],

  'task.view':               ['owner', 'admin', 'member', 'viewer'],
  'task.create':             ['owner', 'admin', 'member'],
  'task.update':             ['owner', 'admin', 'member'],
  'task.delete':             ['owner', 'admin'],
  'task.assign':             ['owner', 'admin', 'member'],

  'status.manage':           ['owner', 'admin'],
  'label.create':            ['owner', 'admin', 'member'],

  'comment.create':          ['owner', 'admin', 'member'],
  'checklist.create':        ['owner', 'admin', 'member'],
  'checklist.toggle':        ['owner', 'admin', 'member'],
};

export type PermissionAction = keyof typeof PERMISSION_MATRIX;

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private apiUrl = this.appConfig.apiUrl;

  private _currentRole = signal<ProjectMemberRole | null>(null);
  readonly currentRole = this._currentRole.asReadonly();

  readonly isOwner = computed(() => this._currentRole() === 'owner');
  readonly isAdmin = computed(() => this._currentRole() === 'admin');
  readonly isMember = computed(() => this._currentRole() === 'member');
  readonly isViewer = computed(() => this._currentRole() === 'viewer');
  readonly isReadOnly = computed(() => this._currentRole() === 'viewer');

  loadRole(projectId: string, members: Array<{ user_id: string; role: ProjectMemberRole }>, currentUserId: string): void {
    const myMembership = members.find(m => m.user_id === currentUserId);
    this._currentRole.set(myMembership?.role ?? null);
  }

  setRole(role: ProjectMemberRole | null): void {
    this._currentRole.set(role);
  }

  can(action: string): boolean {
    const role = this._currentRole();
    if (!role) return false;
    const allowed = PERMISSION_MATRIX[action];
    if (!allowed) return false;
    return allowed.includes(role);
  }

  static roleCanDo(role: ProjectMemberRole, action: string): boolean {
    const allowed = PERMISSION_MATRIX[action];
    if (!allowed) return false;
    return allowed.includes(role);
  }

  clear(): void {
    this._currentRole.set(null);
  }
}
