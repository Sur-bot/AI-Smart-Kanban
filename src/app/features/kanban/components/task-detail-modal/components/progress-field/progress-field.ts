import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-wrap"
         role="progressbar"
         [attr.aria-valuenow]="value"
         aria-valuemin="0"
         aria-valuemax="100">
      <div class="progress-track">
        <div class="progress-fill" [style.width.%]="value"></div>
        <span class="progress-dot" [style.left.%]="value"></span>
      </div>
    </div>
    <span class="progress-label">{{ value }}%</span>
  `,
  styleUrls: ['./progress-field.scss']
})
export class ProgressFieldComponent {
  @Input() value: number = 0;
}
