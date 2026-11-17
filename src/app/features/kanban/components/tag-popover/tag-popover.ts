import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tag-popover',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './tag-popover.html',
  styleUrls: ['./tag-popover.scss'],
})
export class TagPopoverComponent {
  @Input() selectedTagIds: string[] = [];
  @Output() tagsChanged = new EventEmitter<string[]>();
  @Output() close = new EventEmitter<void>();

  searchQuery = '';

  tags: any[] = [];
}
