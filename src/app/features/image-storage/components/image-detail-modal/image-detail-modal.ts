import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
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
export class ImageDetailModalComponent implements OnChanges {
  @Input() image: ImageFile | null = null;
  @Input() hasNext = false;
  @Input() hasPrev = false;
  @Input() nextImageUrl: string | null = null;
  @Input() prevImageUrl: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  rotation = 0;
  scaleX = 1;
  scaleY = 1;

  get isRotated(): boolean {
    return this.rotation % 180 !== 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['image']) {
      this.rotation = 0;
      this.scaleX = 1;
      this.scaleY = 1;
    }
  }

  onRotateAndFlip(): void {
    // Không dùng % 360 để CSS animation quay mượt mà theo 1 chiều vĩnh viễn (thay vì giật lùi về 0)
    this.rotation += 90;
  }

  private touchStartX = 0;
  private touchEndX = 0;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.image) return;
    if (event.key === 'ArrowRight') {
      this.onNext();
    } else if (event.key === 'ArrowLeft') {
      this.onPrev();
    } else if (event.key === 'Escape') {
      this.onClose();
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeThreshold = 50;
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      this.onNext();
    }
    if (this.touchEndX > this.touchStartX + swipeThreshold) {
      this.onPrev();
    }
  }

  transitionDirection: 'left' | 'right' | 'none' = 'none';

  get animationClass(): string {
    if (this.transitionDirection === 'right') return 'slide-in-right';
    if (this.transitionDirection === 'left') return 'slide-in-left';
    return 'zoom-in';
  }

  onNext() {
    if (this.hasNext) {
      this.transitionDirection = 'right';
      this.next.emit();
    }
  }

  onPrev() {
    if (this.hasPrev) {
      this.transitionDirection = 'left';
      this.prev.emit();
    }
  }

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

  showInfoSidebar = false;

  toggleInfoSidebar(): void {
    this.showInfoSidebar = !this.showInfoSidebar;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      if (this.showInfoSidebar) {
        this.showInfoSidebar = false;
      } else {
        this.onClose();
      }
    }
  }
}
