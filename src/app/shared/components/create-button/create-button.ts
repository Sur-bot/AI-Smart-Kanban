import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './create-button.html',
  styleUrls: ['./create-button.scss'],
})
export class CreateButtonComponent {
  @Input() context: 'task' | 'project' = 'task';
  @Input() labelKey: string = 'Tạo';
  @Input() showDropdown = false;
  @Input() disabled = false;

  @Output() create = new EventEmitter<void>();
  @Output() dropdownClick = new EventEmitter<Event>();

  onCreateClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.create.emit();
    }
  }

  onDropdownClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.dropdownClick.emit(event);
    }
  }
}
