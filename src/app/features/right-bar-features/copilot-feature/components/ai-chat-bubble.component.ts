import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AiCopilotStore } from '../../../../core/state/ai-copilot.store';
import { ChatMessageComponent } from './chat-message.component';
import { ChatInputComponent } from './chat-input.component';
import { QuotaBadgeComponent } from './quota-badge.component';
import { QuickActionsComponent } from './quick-actions.component';
import { TypingIndicatorComponent } from './typing-indicator.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RightBarService } from '../../../../core/services/right-bar.service';

@Component({
  selector: 'app-ai-chat-bubble',
  standalone: true,
  imports: [
    CommonModule, 
    TranslatePipe, 
    MatIconModule,
    ChatMessageComponent,
    ChatInputComponent,
    QuotaBadgeComponent,
    QuickActionsComponent,
    TypingIndicatorComponent
  ],
  animations: [
    trigger('bubbleAnimation', [
      state('void', style({ transform: 'scale(0.8) translateY(20px)', opacity: 0 })),
      state('*', style({ transform: 'scale(1) translateY(0)', opacity: 1 })),
      transition('void => *', animate('200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)')),
      transition('* => void', animate('150ms ease-in'))
    ])
  ],
  template: `
    <!-- Floating Button -->
    <button 
      *ngIf="!store.isBubbleOpen()"
      (click)="store.toggleBubble()"
      [title]="'AI.BUBBLE.OPEN' | translate"
      class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center hover:scale-110 hover:shadow-xl hover:shadow-primary-500/40 transition-all z-50 group">
      <mat-icon class="w-7 h-7 text-[28px] leading-7 group-hover:animate-pulse">auto_awesome</mat-icon>
      
      <!-- Unread dot (optional) -->
      <span *ngIf="store.hasMessages()" class="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
    </button>

    <!-- Chat Window -->
    <div *ngIf="store.isBubbleOpen()"
         @bubbleAnimation
         class="fixed bottom-24 right-6 w-[380px] h-[600px] max-h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/10 border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden z-50">
      
      <!-- Header -->
      <div class="flex-none flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white cursor-default">
        <div class="flex items-center gap-2">
          <mat-icon class="w-5 h-5 text-[20px] leading-5">auto_awesome</mat-icon>
          <div>
            <h3 class="text-sm font-semibold leading-tight">{{ 'AI.COPILOT_TITLE' | translate }}</h3>
            <p class="text-[10px] text-primary-100">{{ 'AI.COPILOT_SUBTITLE' | translate }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-1">
          <button (click)="openFullPanel()" 
                  [title]="'AI.EXPAND_PANEL' | translate"
                  class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <mat-icon class="w-4 h-4 text-[16px] leading-4">open_in_new</mat-icon>
          </button>
          <button (click)="store.toggleBubble(false)" 
                  [title]="'AI.BUBBLE.CLOSE' | translate"
                  class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <mat-icon class="w-4 h-4 text-[16px] leading-4">close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Quota -->
      <div class="flex-none px-4 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-center">
        <app-quota-badge [quota]="store.quota()"></app-quota-badge>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/30 dark:bg-gray-900" #scrollContainer>
        
        <div *ngIf="!store.hasMessages()" class="h-full flex flex-col items-center justify-center text-center opacity-70">
          <mat-icon class="w-12 h-12 text-[48px] leading-[48px] text-gray-300 dark:text-gray-600 mb-3">chat_bubble_outline</mat-icon>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Xin chào! Tôi có thể giúp gì cho dự án của bạn?
          </p>
        </div>

        <ng-container *ngFor="let msg of store.messages()">
          <app-chat-message 
            *ngIf="msg.status !== 'sending'"
            [message]="msg"
            (onConfirmAction)="store.confirmAction($event)"
            (onRejectAction)="store.rejectAction($event)">
          </app-chat-message>
        </ng-container>

        <app-typing-indicator *ngIf="store.isLoading()"></app-typing-indicator>
      </div>

      <!-- Quick Actions -->
      <div class="flex-none bg-white dark:bg-gray-900" *ngIf="!store.isQuotaExceeded() && !store.isLoading()">
        <app-quick-actions (onSelect)="onQuickAction($event)"></app-quick-actions>
      </div>

      <!-- Error -->
      <div *ngIf="store.error()" class="flex-none px-4 py-2 bg-red-50 text-red-600 text-xs text-center border-t border-red-100 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400">
        {{ store.error() }}
      </div>

      <!-- Input Area -->
      <div class="flex-none">
        <app-chat-input 
          [disabled]="store.isLoading() || store.isQuotaExceeded()"
          (onSend)="store.sendMessage($event)">
        </app-chat-input>
      </div>
    </div>
  `
})
export class AiChatBubbleComponent implements OnInit, AfterViewChecked {
  store = inject(AiCopilotStore);
  private rightBarService = inject(RightBarService);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private previousMessageCount = 0;

  ngOnInit() {
    this.store.loadQuota();
  }

  ngAfterViewChecked() {
    const currentCount = this.store.messages().length + (this.store.isLoading() ? 1 : 0);
    if (currentCount > this.previousMessageCount && this.store.isBubbleOpen()) {
      this.scrollToBottom();
      this.previousMessageCount = currentCount;
    }
  }

  onQuickAction(prompt: string) {
    this.store.sendMessage(prompt);
  }

  openFullPanel() {
    this.store.toggleBubble(false);
    this.rightBarService.openFeature('copilot');
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.scrollContainer) {
          const el = this.scrollContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      }, 50);
    } catch(err) { }
  }
}
