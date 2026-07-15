import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskViewMode, ViewTab } from '../../../../shared/models/task-list.model';
import { RightBarService } from '../../../../core/services/right-bar.service';

export interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  count: number;
  isActive: boolean;
  rightBarFeatureId?: string;
}

@Component({
  selector: 'app-view-filter-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './view-filter-bar.html',
  styleUrls: ['./view-filter-bar.scss'],
})
export class ViewFilterBarComponent {
  private rightBarService = inject(RightBarService);

  @Input() activeView: TaskViewMode = 'list';
  @Input() viewTabs: ViewTab[] = [];
  @Input() quickFilters: QuickFilter[] = [];

  @Output() viewChange = new EventEmitter<TaskViewMode>();

  selectView(id: TaskViewMode) {
    this.activeView = id;
    this.viewChange.emit(id);
  }

  onQuickFilterClick(filter: QuickFilter) {
    if (filter.rightBarFeatureId) {
      this.rightBarService.openFeature(filter.rightBarFeatureId);
    }
  }
}
