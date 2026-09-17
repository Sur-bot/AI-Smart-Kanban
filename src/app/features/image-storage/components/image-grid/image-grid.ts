import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ImageFile } from '../../models/image.model';

export interface ImageGroup {
  label: string;
  images: ImageFile[];
}

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.html',
  styleUrls: ['./image-grid.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class ImageGridComponent {
  private _images: ImageFile[] = [];
  groupedImages: ImageGroup[] = [];

  // Multi-select state
  isSelectMode = signal(false);
  selectedIds = signal<Set<string>>(new Set());

  // Long press / Swipe state
  private pressTimer: any;
  private isSwiping = false;

  get selectedCount() {
    return this.selectedIds().size;
  }

  @Input() set images(value: ImageFile[]) {
    this._images = value || [];
    this.groupImages();
  }
  
  get images(): ImageFile[] {
    return this._images;
  }

  private groupImages() {
    const groupsMap = new Map<string, ImageFile[]>();
    
    // Các nhóm cố định để đảm bảo thứ tự hiển thị
    const order = ['Hôm nay', 'Hôm qua', 'Tuần trước', 'Tháng trước', 'Cũ hơn'];
    order.forEach(l => groupsMap.set(l, []));

    this._images.forEach(img => {
      const label = this.getGroupLabel(img.uploadedAt);
      groupsMap.get(label)?.push(img);
    });

    // Lọc ra những nhóm có dữ liệu
    this.groupedImages = order
      .map(label => ({ label, images: groupsMap.get(label) || [] }))
      .filter(g => g.images.length > 0);
  }

  private getGroupLabel(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays <= 7) return 'Tuần trước';
    if (diffDays <= 30) return 'Tháng trước';
    return 'Cũ hơn';
  }
  @Output() imageClick = new EventEmitter<ImageFile>();
  @Output() deleteClick = new EventEmitter<ImageFile>();
  @Output() bulkDeleteClick = new EventEmitter<string[]>();

  onDeleteClick(event: Event, image: ImageFile): void {
    event.stopPropagation();
    this.deleteClick.emit(image);
  }

  // --- Multi Select / Swipe Logic ---

  onTouchStart(event: TouchEvent, image: ImageFile): void {
    if (this.isSelectMode()) return;
    this.pressTimer = setTimeout(() => {
      // Long press activated
      this.isSelectMode.set(true);
      if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
      this.toggleSelection(image.id);
    }, 500);
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.pressTimer) clearTimeout(this.pressTimer);
    this.isSwiping = false;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isSelectMode()) {
      if (this.pressTimer) clearTimeout(this.pressTimer); // Cancel if scrolling
      return;
    }
    this.isSwiping = true;
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const card = target.closest('[data-image-id]');
      if (card) {
        const id = card.getAttribute('data-image-id');
        if (id) {
          const current = new Set(this.selectedIds());
          current.add(id);
          this.selectedIds.set(current);
        }
      }
    }
  }

  toggleSelection(id: string): void {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
      if (current.size === 0) {
        this.isSelectMode.set(false);
      }
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  selectAllInGroup(group: ImageGroup): void {
    const current = new Set(this.selectedIds());
    group.images.forEach(img => current.add(img.id));
    this.selectedIds.set(current);
    this.isSelectMode.set(true);
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
    this.isSelectMode.set(false);
  }

  onBulkDelete(): void {
    if (this.selectedIds().size > 0) {
      this.bulkDeleteClick.emit(Array.from(this.selectedIds()));
      this.clearSelection();
    }
  }

  onImageClick(image: ImageFile): void {
    if (this.isSelectMode()) {
      this.toggleSelection(image.id);
    } else {
      this.imageClick.emit(image);
    }
  }
  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(1) + ' MB';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
