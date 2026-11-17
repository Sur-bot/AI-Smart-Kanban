import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AiCopilotStore } from '@core/state/ai-copilot.store';
import { ChatMessageComponent } from './components/chat-message/chat-message';
import { ChatInputComponent } from './components/chat-input/chat-input';
import { QuotaBadgeComponent } from './components/quota-badge/quota-badge';
import { QuickActionsComponent } from './components/quick-actions/quick-actions';
import { TypingIndicatorComponent } from './components/typing-indicator/typing-indicator';

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
  templateUrl: './copilot-feature.html'
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
