import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskPipelineStatus } from '../../../../../../core/models/task.model';
import { TaskStore } from '../../../../../../core/state/task.store';

export interface PipelineStatusConfig {
  key: TaskPipelineStatus;
  label: string;
  icon: string;
  color: string;
}

export const PIPELINE_STATUS_CONFIG: PipelineStatusConfig[] = [
  { key: 'unset',              label: 'No Status',           icon: 'radio_button_unchecked', color: '#cbd5e1' },
  { key: 'ready_in_dev',       label: 'Ready in Dev',        icon: 'developer_mode',         color: '#3b82f6' },
  { key: 'ready_in_staging',   label: 'Ready in Staging',    icon: 'layers',                 color: '#8b5cf6' },
  { key: 'ready_in_master',    label: 'Ready in Master',     icon: 'verified',               color: '#10b981' },
  { key: 'waiting_for_review', label: 'Waiting for Review',  icon: 'rate_review',            color: '#f59e0b' },
  { key: 'need_verify',        label: 'Need Verify',         icon: 'fact_check',             color: '#f97316' },
  { key: 'need_support',       label: 'Need Support',        icon: 'support_agent',          color: '#ef4444' },
];

@Component({
  selector: 'app-task-pipeline-status',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './task-pipeline-status.html',
  styleUrls: ['./task-pipeline-status.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskPipelineStatusComponent implements OnChanges, OnDestroy {
  private readonly taskStore = inject(TaskStore) as TaskStore;
  private readonly elRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() taskId!: string;
  @Input() pipelineStatus: TaskPipelineStatus | undefined;

  @ViewChild('triggerBtn', { static: false }) triggerBtn?: ElementRef<HTMLButtonElement>;

  readonly isOpen = signal(false);
  readonly allStatuses = PIPELINE_STATUS_CONFIG;

  currentConfig: PipelineStatusConfig = PIPELINE_STATUS_CONFIG[0];

  dropdownTop = 0;
  dropdownLeft = 0;

  ngOnChanges(): void {
    this.currentConfig =
      PIPELINE_STATUS_CONFIG.find(c => c.key === this.pipelineStatus) ??
      PIPELINE_STATUS_CONFIG[0];
  }

  ngOnDestroy(): void {
    this.isOpen.set(false);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (!this.isOpen()) {
      const btn = (event.currentTarget as HTMLElement);
      const rect = btn.getBoundingClientRect();
      this.dropdownTop = rect.bottom + 6;
      this.dropdownLeft = rect.left + rect.width / 2;
      this.cdr.markForCheck();
    }
    this.isOpen.update(v => !v);
  }

  select(config: PipelineStatusConfig, event: Event): void {
    event.stopPropagation();
    this.taskStore.updatePipelineStatus(this.taskId, config.key);
    this.currentConfig = config;
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}
