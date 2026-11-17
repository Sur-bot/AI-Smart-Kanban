import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AI_QUICK_ACTIONS, AiQuickAction } from '@core/models/ai.model';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.scss'
})
export class QuickActionsComponent {
  actions: AiQuickAction[] = AI_QUICK_ACTIONS;
  @Output() onSelect = new EventEmitter<string>();
}
