import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <button type="button" class="status-badge-btn" [style.--status-color]="color" (click)="toggle()">
      <span class="status-check-wrap" [style.background]="color">
        <mat-icon class="status-check-icon">check</mat-icon>
      </span>
      <span class="status-label">{{ status }}</span>
      <mat-icon class="status-chevron">expand_more</mat-icon>
    </button>
  `,
  styleUrls: ['./status-dropdown.scss']
})
export class StatusDropdownComponent {
  @Input() status: string = 'READY IN DEV';
  @Input() color: string = '#22C55E';
  @Output() statusChange = new EventEmitter<string>();

  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
