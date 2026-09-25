import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all p-2 shadow-sm">
        
        <textarea
          #inputEl
          [(ngModel)]="message"
          (keydown)="onKeyDown($event)"
          [disabled]="disabled"
          [placeholder]="'AI.CHAT_PLACEHOLDER' | translate"
          class="flex-1 max-h-32 min-h-[40px] bg-transparent border-none outline-none resize-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 py-2 px-2 scrollbar-thin"
          rows="1"
          (input)="autoResize()">
        </textarea>

        <button 
          (click)="send()"
          [disabled]="disabled || !message.trim()"
          [title]="'AI.SEND' | translate"
          class="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors mb-0.5">
          <mat-icon class="w-5 h-5 text-[20px] leading-5 -mr-1">send</mat-icon>
        </button>
      </div>
      <div class="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
        <mat-icon class="w-3 h-3 text-[12px] leading-3">info</mat-icon>
        Enter để gửi, Shift+Enter để xuống dòng
      </div>
    </div>
  `
})
export class ChatInputComponent {
  @Input() disabled = false;
  @Output() onSend = new EventEmitter<string>();
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLTextAreaElement>;

  message = '';

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send() {
    if (this.disabled || !this.message.trim()) return;
    this.onSend.emit(this.message.trim());
    this.message = '';
    
    // Reset height
    setTimeout(() => {
      if (this.inputEl) {
        this.inputEl.nativeElement.style.height = 'auto';
      }
    });
  }

  autoResize() {
    const el = this.inputEl.nativeElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'; // Max 32rem
  }
}
