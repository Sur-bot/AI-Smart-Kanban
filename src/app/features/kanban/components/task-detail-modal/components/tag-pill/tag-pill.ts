import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tag-pill',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span class="tag-pill"
          [class.tag-pill--outline]="variant === 'outline'"
          [class.tag-pill--filled]="variant === 'filled'"
          [style.--pill-color]="color"
          [style.--pill-bg]="bgColor">
      <mat-icon *ngIf="icon" class="tag-pill-icon">{{ icon }}</mat-icon>
      {{ text }}
    </span>
  `,
  styleUrls: ['./tag-pill.scss']
})
export class TagPillComponent {
  @Input({ required: true }) text!: string;
  @Input() color: string = '#16A34A';
  @Input() bgColor: string = '#F0FDF4';
  @Input() variant: 'outline' | 'filled' = 'outline';
  @Input() icon?: string;
}
