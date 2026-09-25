import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AiPendingAction } from '../../../../core/models/ai.model';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
      <!-- Header -->
      <div class="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800 flex items-center gap-2 text-primary-700 dark:text-primary-400">
        <mat-icon class="w-4 h-4 text-[16px] leading-4">psychology</mat-icon>
        <span class="text-xs font-semibold uppercase tracking-wider">{{ 'AI.ACTIONS.TITLE' | translate }}</span>
      </div>

      <!-- Content -->
      <div class="p-3 text-sm text-gray-700 dark:text-gray-300">
        <p class="font-medium mb-1">{{ action.description }}</p>
        
        <!-- Status badges -->
        <div *ngIf="action.status === 'executed'" class="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">
          <mat-icon class="w-3 h-3 text-[12px] leading-3">check_circle</mat-icon>
          <span>{{ 'AI.ACTIONS.EXECUTED' | translate }}</span>
        </div>
        
        <div *ngIf="action.status === 'rejected'" class="inline-flex items-center gap-1 mt-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
          <mat-icon class="w-3 h-3 text-[12px] leading-3">cancel</mat-icon>
          <span>{{ 'AI.ACTIONS.REJECTED' | translate }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div *ngIf="action.status === 'pending'" class="flex border-t border-gray-100 dark:border-gray-700">
        <button type="button" 
                (click)="onReject.emit(action.id)"
                class="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-r border-gray-100 dark:border-gray-700">
          {{ 'AI.ACTIONS.REJECT' | translate }}
        </button>
        <button type="button" 
                (click)="onConfirm.emit(action.id)"
                class="flex-1 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
          {{ 'AI.ACTIONS.CONFIRM' | translate }}
        </button>
      </div>
    </div>
  `
})
export class ActionCardComponent {
  @Input({ required: true }) action!: AiPendingAction;
  @Output() onConfirm = new EventEmitter<string>();
  @Output() onReject = new EventEmitter<string>();
}
