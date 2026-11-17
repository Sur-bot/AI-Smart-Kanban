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
  templateUrl: './chat-input.html'
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
