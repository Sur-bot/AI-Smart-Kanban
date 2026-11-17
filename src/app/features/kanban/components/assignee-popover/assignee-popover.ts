import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-assignee-popover',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './assignee-popover.html',
  styleUrls: ['./assignee-popover.scss'],
})
export class AssigneePopoverComponent {
  @Input() assigneeName = '';
  @Input() assigneeAvatar: string | null = null;
  @Input() assigneeId: string | null = null;

  @Output() memberSelected = new EventEmitter<{ id: string; name: string; avatar: string | null }>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  searchMemberQuery = '';

  selectMember(name: string, id: string, event: Event): void {
    event.stopPropagation();
    this.memberSelected.emit({ id, name, avatar: this.assigneeAvatar });
  }

  clearAssignee(event: Event): void {
    event.stopPropagation();
    this.clearSelection.emit();
  }
}
