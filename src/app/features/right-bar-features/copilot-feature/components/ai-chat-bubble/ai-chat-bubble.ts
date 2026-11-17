import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AiCopilotStore } from '@core/state/ai-copilot.store';
import { ChatMessageComponent } from '@features/right-bar-features/copilot-feature/components/chat-message/chat-message';
import { ChatInputComponent } from '@features/right-bar-features/copilot-feature/components/chat-input/chat-input';
import { QuotaBadgeComponent } from '@features/right-bar-features/copilot-feature/components/quota-badge/quota-badge';
import { QuickActionsComponent } from '@features/right-bar-features/copilot-feature/components/quick-actions/quick-actions';
import { TypingIndicatorComponent } from '@features/right-bar-features/copilot-feature/components/typing-indicator/typing-indicator';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RightBarService } from '@core/services/right-bar.service';

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
  templateUrl: './ai-chat-bubble.html'
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
