import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskViewMode } from '../../../models/task-list.model';
import { RightBarService } from '../../../../../core/services/right-bar.service';

@Component({
    selector: 'app-tasks-filter-bar',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './tasks-filter-bar.html',
    styleUrls: ['./tasks-filter-bar.scss'],
})
export class TasksFilterBarComponent {
    private rightBarService = inject(RightBarService);

    activeView: TaskViewMode = 'list';

    @Output() viewChange = new EventEmitter<TaskViewMode>();

    selectView(id: TaskViewMode) {
      this.activeView = id;
      this.viewChange.emit(id);
    }

    viewTabs: { id: TaskViewMode; label: string }[] = [
        { id: 'list', label: 'Danh sách' },
        { id: 'deadline', label: 'Hạn chót' },
        { id: 'planner', label: 'Trình lập kế hoạch' },
        { id: 'calendar', label: 'Lịch' },
        { id: 'gantt', label: 'Gantt' },
    ];

    quickFilters: { id: string; label: string; icon: string; count: number; isActive: boolean; rightBarFeatureId?: string }[] = [
        { id: 'conversations', label: 'Cuộc trò chuyện tác vụ', icon: 'chat', count: 3, isActive: false, rightBarFeatureId: 'task_chat' },
        { id: 'overdue', label: 'Quá hạn', icon: 'clock', count: 0, isActive: false },
        { id: 'comments', label: 'Bình luận', icon: 'comment', count: 12, isActive: false },
    ];

    onQuickFilterClick(filter: { id: string; rightBarFeatureId?: string; isActive: boolean }) {
        if (filter.rightBarFeatureId) {
            this.rightBarService.openFeature(filter.rightBarFeatureId);
        }
    }
}
