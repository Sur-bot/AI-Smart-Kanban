import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskViewMode } from '../../../models/task-list.model';
@Component({
    selector: 'app-tasks-filter-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tasks-filter-bar.html',
    styleUrls: ['./tasks-filter-bar.scss'],
})
export class TasksFilterBarComponent {
    /** Chế độ xem hiện tại */
    activeView: TaskViewMode = 'list';
    /** Các tab chế độ xem */
    viewTabs: { id: TaskViewMode; label: string }[] = [
        { id: 'list', label: 'Danh sách' },
        { id: 'deadline', label: 'Hạn chốt' },
        { id: 'planner', label: 'Trình lập kế hoạch' },
        { id: 'calendar', label: 'Lịch' },
        { id: 'gantt', label: 'Gantt' },
    ];
    /** Quick filters */
    quickFilters = [
        { id: 'conversations', label: 'Cuộc trò chuyện tác vụ', icon: 'chat', isActive: false },
        { id: 'overdue', label: 'Quá hạn', icon: 'clock', isActive: false },
        { id: 'comments', label: 'Bình luận', icon: 'comment', isActive: false },
    ];
}
