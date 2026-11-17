import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-field',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="user-field" [class.user-field--hoverable]="hoverable">
      <figure class="user-avatar m-0" [style.background]="avatarBg">
        <img *ngIf="avatarUrl" [src]="avatarUrl" [alt]="name" class="w-full h-full object-cover" />
        <span *ngIf="!avatarUrl">{{ initials }}</span>
      </figure>
      <span class="user-name">{{ name }}</span>
      <button *ngIf="showRemove" type="button" class="remove-btn"
              (click)="remove.emit()" aria-label="Xóa">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styleUrls: ['./user-field.scss']
})
export class UserFieldComponent {
  @Input({ required: true }) name!: string;
  @Input() avatarUrl?: string;
  @Input() avatarBg: string = '#6366F1';
  @Input() showRemove: boolean = false;
  @Input() hoverable: boolean = false;
  @Output() remove = new EventEmitter<void>();

  get initials(): string {
    return this.name?.charAt(0)?.toUpperCase() ?? '?';
  }
}
