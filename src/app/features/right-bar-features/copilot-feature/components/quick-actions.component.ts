import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AI_QUICK_ACTIONS, AiQuickAction } from '../../../../core/models/ai.model';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-3 py-2 w-full overflow-hidden">
      <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {{ 'AI.QUICK_ACTIONS.TITLE' | translate }}
      </div>
      
      <!-- Horizontal scroll container -->
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x" style="scrollbar-width: none;">
        <button *ngFor="let action of actions" 
                (click)="onSelect.emit(action.prompt)"
                class="snap-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 dark:hover:border-primary-800 transition-colors shadow-sm">
          <mat-icon class="w-3.5 h-3.5 text-[14px] leading-4">{{ action.icon }}</mat-icon>
          <span>{{ action.labelKey | translate }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class QuickActionsComponent {
  actions: AiQuickAction[] = AI_QUICK_ACTIONS;
  @Output() onSelect = new EventEmitter<string>();
}
