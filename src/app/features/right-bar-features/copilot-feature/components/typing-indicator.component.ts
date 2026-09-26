import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-sm self-start max-w-[85%] text-sm text-gray-500">
      <div class="flex gap-1">
        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
      <span>{{ 'AI.TYPING' | translate }}</span>
    </div>
  `
})
export class TypingIndicatorComponent {}
