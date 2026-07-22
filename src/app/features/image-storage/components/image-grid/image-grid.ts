import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ImageFile } from '../../models/image.model';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.html',
  styleUrls: ['./image-grid.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class ImageGridComponent {
  @Input() images: ImageFile[] = [];
  @Output() imageClick = new EventEmitter<ImageFile>();

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
