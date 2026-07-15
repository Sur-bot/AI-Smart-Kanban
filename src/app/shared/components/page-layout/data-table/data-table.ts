import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItem } from '../../../../shared/models/task-list.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.scss'],
})
export class DataTableComponent {
  @Input() tasks: TaskItem[] = [];

  columns = [
    { id: 'name', label: 'Tên', sortable: true },
    { id: 'activity', label: 'Hoạt động', sortable: false },
    { id: 'dueDate', label: 'Hạn chốt', sortable: true },
    { id: 'creator', label: 'Người tạo', sortable: true },
    { id: 'assignee', label: 'Người được phân công', sortable: true, hasDropdown: true },
    { id: 'project', label: 'Dự án', sortable: true },
    { id: 'tags', label: 'Thẻ', sortable: false },
  ];
}
