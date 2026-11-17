import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="placeholder-field" (click)="clicked.emit()">
      {{ text }}
    </button>
  `,
  styles: [`
    .placeholder-field {
      font-size: 14px;
      color: #9CA3AF;
      font-style: italic;
      font-weight: 400;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: background 0.15s;
      &:hover { background: #F3F4F6; }
    }
  `]
})
export class PlaceholderFieldComponent {
  @Input({ required: true }) text!: string;
  @Output() clicked = new EventEmitter<void>();
}
