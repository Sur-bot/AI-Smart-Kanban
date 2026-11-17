import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AiQuotaInfo } from '@core/models/ai.model';

@Component({
  selector: 'app-quota-badge',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quota-badge.html'
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
