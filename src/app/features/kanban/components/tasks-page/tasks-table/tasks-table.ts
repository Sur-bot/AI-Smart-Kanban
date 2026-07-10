import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItem } from '../../../models/task-list.model';
import { TasksEmptyStateComponent } from '../tasks-empty-state/tasks-empty-state';
@Component({
    selector: 'app-tasks-table',
    standalone: true,
    imports: [CommonModule, TasksEmptyStateComponent],
    templateUrl: './tasks-table.html',
    styleUrls: ['./tasks-table.scss'],
})
export class TasksTableComponent {
    @Input() tasks: TaskItem[] = [];
    /** Cấu hình các cột hiển thị */
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
