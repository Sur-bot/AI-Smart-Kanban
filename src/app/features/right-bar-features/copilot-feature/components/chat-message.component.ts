import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiChatMessage } from '../../../../core/models/ai.model';
import { ActionCardComponent } from './action-card.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ActionCardComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1 w-full" [ngClass]="isUser ? 'items-end' : 'items-start'">
      
      <!-- Avatar & Name (for AI only) -->
      <div *ngIf="!isUser" class="flex items-center gap-1.5 px-1 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
        <div class="w-5 h-5 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
          <mat-icon class="w-3 h-3 text-[12px] leading-3">auto_awesome</mat-icon>
        </div>
        <span class="font-medium">CoPilot</span>
      </div>

      <!-- Message Bubble -->
      <div class="relative max-w-[85%] px-3.5 py-2.5 text-sm shadow-sm"
           [ngClass]="{
             'bg-primary-600 text-white rounded-2xl rounded-tr-sm': isUser,
             'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700': !isUser,
             'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200': isError
           }">
        
        <!-- Text content -->
        <div class="whitespace-pre-wrap break-words" [innerHTML]="formattedContent"></div>
        
        <!-- Pending Actions -->
        <ng-container *ngIf="message.pendingActions?.length">
          <app-action-card 
            *ngFor="let action of message.pendingActions"
            [action]="action"
            (onConfirm)="onConfirmAction.emit($event)"
            (onReject)="onRejectAction.emit($event)">
          </app-action-card>
        </ng-container>

      </div>
      
      <!-- Timestamp -->
      <div class="text-[10px] text-gray-400 px-1 mt-0.5" *ngIf="message.status !== 'error'">
        {{ message.timestamp | date:'HH:mm' }}
      </div>
    </div>
  `
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: AiChatMessage;
  @Output() onConfirmAction = new EventEmitter<string>();
  @Output() onRejectAction = new EventEmitter<string>();

  get isUser(): boolean {
    return this.message.role === 'user';
  }

  get isError(): boolean {
    return this.message.status === 'error';
  }

  // Simple markdown parser cho bold và code (vì dự án có thể không cài sẵn thư viện markdown xịn)
  get formattedContent(): string {
    let text = this.message.content || '';
    
    // 1. Escape HTML first to prevent layout breaking (e.g. <div> inside code blocks)
    // We only escape < and > since Angular handles script execution naturally,
    // but < and > will break UI layout if rendered as DOM tags.
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // 2. Bold: **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 3. Bullet points
    text = text.replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
    
    // 4. Code inline: `code`
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">$1</code>');
    
    return text;
  }
}
