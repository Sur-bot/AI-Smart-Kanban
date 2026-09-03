import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * AddTagBadgeComponent
 *
 * Component hoàn chỉnh, tự-quản lý: bao gồm nút badge + popup chọn thẻ.
 * Tái sử dụng ở bất kỳ đâu — kanban card, task detail, project modal, ...
 *
 * @example
 * <!-- Dùng mặc định -->
 * <app-add-tag-badge (tagSelected)="onTagSelected($event)"></app-add-tag-badge>
 *
 * <!-- Tuỳ chỉnh label và màu -->
 * <app-add-tag-badge label="+ Gắn nhãn" color="#9333ea" (tagSelected)="onAddLabel($event)"></app-add-tag-badge>
 */
@Component({
  selector: 'app-add-tag-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './add-tag-badge.html',
  styleUrls: ['./add-tag-badge.scss'],
})
export class AddTagBadgeComponent {
  /** Nội dung hiển thị của nút badge */
  @Input() label: string = '+ Thêm thẻ';

  /** Màu chữ của badge */
  @Input() color: string = '#0154C8';

  /** Event phát ra khi một thẻ được chọn (để component cha xử lý nghiệp vụ) */
  @Output() tagSelected = new EventEmitter<string>();

  // State nội tại — không lộ ra ngoài
  isOpen = signal(false);
  activeTab: 'recent' | 'all' = 'recent';

  togglePopup(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  closePopup(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isOpen()) {
      this.closePopup();
    }
  }
}
