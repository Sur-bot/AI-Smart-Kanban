import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { JobRole, getJobRole } from '../../../core/constants/job-roles';

@Component({
  selector: 'app-job-role-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (jobRoleData) {
      <span
        class="job-role-badge"
        [style.color]="jobRoleData.color"
        [style.background-color]="jobRoleData.bgColor"
        [title]="jobRoleData.label"
      >
        <mat-icon class="badge-icon" fontSet="material-icons-outlined">{{ jobRoleData.icon }}</mat-icon>
        @if (!iconOnly) {
          <span class="badge-label">{{ jobRoleData.label }}</span>
        }
      </span>
    }
  `,
  styleUrls: ['./job-role-badge.scss'],
})
export class JobRoleBadgeComponent {
  /** Ma job_role (vi du: 'FE', 'BE', 'PM') */
  @Input() jobRole: string | null | undefined = null;

  /** Chi hien thi icon, khong hien thi text */
  @Input() iconOnly = false;

  get jobRoleData(): JobRole | undefined {
    return getJobRole(this.jobRole);
  }
}