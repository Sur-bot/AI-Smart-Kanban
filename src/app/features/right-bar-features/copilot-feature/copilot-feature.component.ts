import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AiCopilotStore } from '../../../core/state/ai-copilot.store';
import { ChatMessageComponent } from './components/chat-message.component';
import { ChatInputComponent } from './components/chat-input.component';
import { QuotaBadgeComponent } from './components/quota-badge.component';
import { QuickActionsComponent } from './components/quick-actions.component';
import { TypingIndicatorComponent } from './components/typing-indicator.component';

@Component({
  selector: 'app-copilot-feature',
  standalone: true,
  imports: [
    MatIconModule,
    ChatMessageComponent,
    ChatInputComponent,
    QuotaBadgeComponent,
    QuickActionsComponent,
    TypingIndicatorComponent
  ],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      <!-- Quota -->
      <div class="flex-none px-4 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-center">
        <app-quota-badge [quota]="store.quota()"></app-quota-badge>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/30 dark:bg-gray-900" #scrollContainer>

        @if (!store.hasMessages()) {
          <div class="h-full flex flex-col items-center justify-center text-center opacity-70">
            <mat-icon class="w-12 h-12 text-[48px] leading-[48px] text-gray-300 dark:text-gray-600 mb-3">chat_bubble_outline</mat-icon>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Xin chào! Tôi có thể giúp gì cho dự án của bạn?
            </p>
          </div>
        }

        @for (msg of store.messages(); track msg.id) {
          @if (msg.status !== 'sending') {
            <app-chat-message
              [message]="msg"
              (onConfirmAction)="store.confirmAction($event)"
              (onRejectAction)="store.rejectAction($event)">
            </app-chat-message>
          }
        }

        @if (store.isLoading()) {
          <app-typing-indicator></app-typing-indicator>
        }
      </div>

      <!-- Quick Actions -->
      @if (!store.isQuotaExceeded() && !store.isLoading()) {
        <div class="flex-none bg-white dark:bg-gray-900">
          <app-quick-actions (onSelect)="onQuickAction($event)"></app-quick-actions>
        </div>
      }

      <!-- Error -->
      @if (store.error()) {
        <div class="flex-none px-4 py-2 bg-red-50 text-red-600 text-xs text-center border-t border-red-100 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400">
          {{ store.error() }}
        </div>
      }

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
export class CopilotFeatureComponent implements OnInit, AfterViewChecked {
  store = inject(AiCopilotStore);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private previousMessageCount = 0;

  ngOnInit() {
    this.store.loadQuota();
  }

  ngAfterViewChecked() {
    const currentCount = this.store.messages().length + (this.store.isLoading() ? 1 : 0);
    if (currentCount > this.previousMessageCount) {
      this.scrollToBottom();
      this.previousMessageCount = currentCount;
    }
  }

  onQuickAction(prompt: string) {
    this.store.sendMessage(prompt);
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
