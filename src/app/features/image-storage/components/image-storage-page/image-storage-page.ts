import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ImageFile, StorageQuota } from '../../models/image.model';
import { SupabaseStorageService } from '../../services/supabase-storage.service';
import { ImageUploadZoneComponent } from '../image-upload-zone/image-upload-zone';
import { ImageGridComponent } from '../image-grid/image-grid';
import { ImageDetailModalComponent } from '../image-detail-modal/image-detail-modal';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file

@Component({
  selector: 'app-image-storage-page',
  templateUrl: './image-storage-page.html',
  styleUrls: ['./image-storage-page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    TranslatePipe,
    ImageUploadZoneComponent,
    ImageGridComponent,
    ImageDetailModalComponent,
  ],
})
export class ImageStoragePageComponent implements OnInit, OnDestroy {
  private imageService = inject(SupabaseStorageService);
  private router = inject(Router);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  images: ImageFile[] = [];
  filteredImages: ImageFile[] = [];
  selectedImage: ImageFile | null = null;
  showUploadZone = false;
  searchQuery = '';
  quota: StorageQuota | null = null;
  errorMessage: string | null = null;

  private imagesSub?: Subscription;
  private quotaSub?: Subscription;

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/kanban']);
    }
  }

  ngOnInit(): void {
    this.imagesSub = this.imageService.images$.subscribe(images => {
      this.images = images;
      this.applyFilter();
      this.cdr.markForCheck();
    });

    this.quotaSub = this.imageService.quota$.subscribe(quota => {
      this.quota = quota;
      this.cdr.markForCheck();
    });

    this.imageService.loadImages();
    this.imageService.loadQuota();
  }

  ngOnDestroy(): void {
    this.imagesSub?.unsubscribe();
    this.quotaSub?.unsubscribe();
  }

  get totalCount(): number {
    return this.images.length;
  }

  get totalSizeFormatted(): string {
    return this.formatBytes(this.quota?.usedBytes ?? this.images.reduce((sum, img) => sum + img.size, 0));
  }

  get quotaTotalFormatted(): string {
    return this.formatBytes(this.quota?.quotaBytes ?? 524288000);
  }

  get quotaAvailableFormatted(): string {
    return this.formatBytes(this.quota?.availableBytes ?? Math.max(0, 524288000 - this.images.reduce((sum, img) => sum + img.size, 0)));
  }

  get quotaPercentage(): number {
    if (!this.quota || !this.quota.quotaBytes) return 0;
    return Math.min(100, Math.round((this.quota.usedBytes / this.quota.quotaBytes) * 100));
  }

  get quotaStatusClass(): 'safe' | 'warning' | 'danger' {
    const pct = this.quotaPercentage;
    if (pct >= 90) return 'danger';
    if (pct >= 70) return 'warning';
    return 'safe';
  }

  get isQuotaNearLimit(): boolean {
    return this.quotaPercentage >= 80 && this.quotaPercentage < 100;
  }

  get isQuotaFull(): boolean {
    return this.quotaPercentage >= 100 || (this.quota?.isFull ?? false);
  }

  get todayCount(): number {
    const today = new Date();
    return this.images.filter(img => {
      const d = new Date(img.uploadedAt);
      return d.toDateString() === today.toDateString();
    }).length;
  }

  toggleUploadZone(): void {
    this.showUploadZone = !this.showUploadZone;
    this.errorMessage = null;

    if (this.showUploadZone) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const container = document.querySelector('.storage-page');
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  }

  onFilesSelected(files: File[]): void {
    this.errorMessage = null;

    if (this.isQuotaFull) {
      this.errorMessage = 'Dung lượng lưu trữ của bạn đã đầy (500 MB). Vui lòng xóa bớt ảnh cũ để tải ảnh mới.';
      return;
    }

    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      this.errorMessage = `Có ${oversizedFiles.length} file vượt quá kích thước cho phép (tối đa 10 MB / file).`;
      return;
    }

    for (const file of files) {
      this.imageService.uploadImage(file).subscribe({
        error: (err) => {
          console.error('Lỗi khi tải ảnh lên Supabase:', err);
          this.errorMessage = 'Không thể tải ảnh lên. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.';
          this.cdr.markForCheck();
        }
      });
    }
    this.showUploadZone = false;
  }

  onImageClick(image: ImageFile): void {
    this.selectedImage = image;
  }

  get selectedIndex(): number {
    if (!this.selectedImage) return -1;
    return this.filteredImages.findIndex(img => img.id === this.selectedImage!.id);
  }

  get hasNext(): boolean {
    const idx = this.selectedIndex;
    return idx >= 0 && idx < this.filteredImages.length - 1;
  }

  get hasPrev(): boolean {
    return this.selectedIndex > 0;
  }

  onNextImage(): void {
    if (this.hasNext) {
      this.selectedImage = this.filteredImages[this.selectedIndex + 1];
    }
  }

  onPrevImage(): void {
    if (this.hasPrev) {
      this.selectedImage = this.filteredImages[this.selectedIndex - 1];
    }
  }

  onModalClose(): void {
    this.selectedImage = null;
  }

  onImageDelete(id: string): void {
    this.selectedImage = null;
    this.imageService.deleteImage(id).subscribe({
      next: () => {
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('[Delete] Lỗi xóa ảnh:', err.status)
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredImages = [...this.images];
    } else {
      this.filteredImages = this.images.filter(img =>
        img.name.toLowerCase().includes(query) ||
        img.uploadedBy.name.toLowerCase().includes(query) ||
        img.format.toLowerCase().includes(query)
      );
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1_073_741_824) return (bytes / 1_048_576).toFixed(1) + ' MB';
    return (bytes / 1_073_741_824).toFixed(2) + ' GB';
  }
}

