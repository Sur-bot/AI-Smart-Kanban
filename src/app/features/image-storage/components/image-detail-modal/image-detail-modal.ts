import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ImageFile } from '../../models/image.model';

@Component({
  selector: 'app-image-detail-modal',
  templateUrl: './image-detail-modal.html',
  styleUrls: ['./image-detail-modal.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class ImageDetailModalComponent {
  @Input() image: ImageFile | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(1) + ' MB';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onDelete(): void {
    if (this.image) {
      this.delete.emit(this.image.id);
    }
  }

  onDownload(): void {
    if (!this.image) return;
    const link = document.createElement('a');
    link.href = this.image.url;
    link.download = this.image.name;
    link.click();
  }

  onCopyLink(): void {
    if (!this.image) return;
    navigator.clipboard.writeText(this.image.url);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}
