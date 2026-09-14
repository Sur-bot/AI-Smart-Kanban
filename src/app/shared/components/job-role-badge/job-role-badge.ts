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
        [title]="jobRoleData.label"
      >
        {{ jobRole }}
      </span>
    }
  `,
  styleUrls: ['./job-role-badge.scss'],
})
export class JobRoleBadgeComponent {
  @Input() jobRole: string | null | undefined = null;

  get jobRoleData(): JobRole | undefined {
    return getJobRole(this.jobRole);
  }
}