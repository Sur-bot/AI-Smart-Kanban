import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  onDeleteClick(event: Event, image: ImageFile): void {
    event.stopPropagation();
    this.deleteClick.emit(image);
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

  onImageClick(image: ImageFile): void {
    this.imageClick.emit(image);
  }
}
