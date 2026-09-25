import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AiQuotaInfo } from '../../../../core/models/ai.model';

@Component({
  selector: 'app-quota-badge',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="quota" class="flex items-center gap-2 text-xs py-1 px-3 rounded-full bg-gray-100 dark:bg-gray-800"
         [ngClass]="{'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400': isExceeded}">
      
      <!-- Icon -->
      <mat-icon class="w-4 h-4 text-[16px] leading-4 text-primary-500" *ngIf="!isExceeded">auto_awesome</mat-icon>
      <mat-icon class="w-4 h-4 text-[16px] leading-4 text-red-500" *ngIf="isExceeded">warning</mat-icon>
      
      <!-- Text -->
      <span class="font-medium whitespace-nowrap">
        <ng-container *ngIf="quota.planType === 'enterprise'; else standardQuota">
          {{ 'AI.QUOTA.TITLE' | translate }}: Vô hạn
        </ng-container>
        <ng-template #standardQuota>
          <span *ngIf="isExceeded">{{ 'AI.QUOTA.EXCEEDED' | translate }}</span>
          <span *ngIf="!isExceeded">
            {{ 'AI.QUOTA.REMAINING' | translate:{remaining: remainingQuota, limit: quota.limit} }}
          </span>
        </ng-template>
      </span>
    </div>
  `
})
export class QuotaBadgeComponent {
  @Input() quota: AiQuotaInfo | null = null;

  get isExceeded(): boolean {
    if (!this.quota || this.quota.planType === 'enterprise') return false;
    return this.quota.used >= this.quota.limit;
  }

  get remainingQuota(): number {
    if (!this.quota) return 0;
    return Math.max(0, this.quota.limit - this.quota.used);
  }
}
