import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiChatMessage } from '@core/models/ai.model';
import { ActionCardComponent } from '@features/right-bar-features/copilot-feature/components/action-card/action-card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ActionCardComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-message.html'
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
