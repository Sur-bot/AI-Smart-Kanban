import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskViewMode } from '../../../models/task-list.model';
@Component({
    selector: 'app-tasks-filter-bar',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './tasks-filter-bar.html',
    styleUrls: ['./tasks-filter-bar.scss'],
})
export class TasksFilterBarComponent {
    /** Chế độ xem hiện tại */
    activeView: TaskViewMode = 'list';

    @Output() viewChange = new EventEmitter<TaskViewMode>();

    selectView(id: TaskViewMode) {
      this.activeView = id;
      this.viewChange.emit(id);
    }

    /** Các tab chế độ xem */
    viewTabs: { id: TaskViewMode; label: string }[] = [
        { id: 'list', label: 'Danh sách' },
        { id: 'deadline', label: 'Hạn chót' },
        { id: 'planner', label: 'Trình lập kế hoạch' },
        { id: 'calendar', label: 'Lịch' },
        { id: 'gantt', label: 'Gantt' },
    ];
    /** Quick filters */
    quickFilters = [
        { id: 'conversations', label: 'Cuộc trò chuyện tác vụ', icon: 'chat', count: 3, isActive: false },
        { id: 'overdue', label: 'Quá hạn', icon: 'clock', count: 5, isActive: false },
        { id: 'comments', label: 'Bình luận', icon: 'comment', count: 12, isActive: false },
    ];
}
