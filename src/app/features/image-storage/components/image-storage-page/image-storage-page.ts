import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription, from, mergeMap, finalize } from 'rxjs';

import { ImageFile, StorageQuota } from '../../models/image.model';
import { SupabaseStorageService } from '../../services/supabase-storage.service';
import { ImageUploadZoneComponent } from '../image-upload-zone/image-upload-zone';
import { ImageGridComponent } from '../image-grid/image-grid';
import { ImageDetailModalComponent } from '../image-detail-modal/image-detail-modal';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file
const MAX_FILE_COUNT = 2000;        // Hard limit per batch
const UPLOAD_CONCURRENCY = 10;      // Parallel uploads at a time

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
  isGridSelectMode = false;

  // Upload progress state
  isUploading = false;
  uploadTotal = 0;
  uploadDone = 0;
  uploadFailed = 0;

  private imagesSub?: Subscription;
  private quotaSub?: Subscription;
  private uploadSub?: Subscription;

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
    this.uploadSub?.unsubscribe();
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
      this.errorMessage = 'Dung luong luu tru da day (500 MB). Vui long xoa bot anh cu.';
      return;
    }

    if (files.length > MAX_FILE_COUNT) {
      this.errorMessage = `Chi duoc chon toi da ${MAX_FILE_COUNT} anh moi lan. Ban da chon ${files.length} anh.`;
      return;
    }

    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      this.errorMessage = `Co ${oversizedFiles.length} file vuot qua kich thuoc cho phep (toi da 10 MB / file).`;
      return;
    }

    // Close upload zone immediately so user sees the progress UI
    this.showUploadZone = false;
    this.isUploading = true;
    this.uploadTotal = files.length;
    this.uploadDone = 0;
    this.uploadFailed = 0;

    const userId = (this.imageService as any).authService?.user?.()?.id ?? null;
    const accumulatedImages: ImageFile[] = [];
    const processJobs: { fileId: string; storageKey: string; userId: string | null }[] = [];

    this.uploadSub = from(files).pipe(
      // Process UPLOAD_CONCURRENCY files simultaneously
      mergeMap(file => {
        return this.imageService.uploadImage(file);
      }, UPLOAD_CONCURRENCY),
      finalize(() => {
        // Runs once the entire stream completes or errors
        this.isUploading = false;
        // Flush all collected images to state in ONE call
        this.imageService.flushUploadedImages(accumulatedImages);
        // Queue all processing jobs in ONE API call
        this.imageService.batchProcessImages(processJobs);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (img: ImageFile) => {
        this.uploadDone++;
        accumulatedImages.push(img);
        processJobs.push({ fileId: img.id, storageKey: img.storageKey!, userId });
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploadFailed++;
        this.uploadDone++;
        this.cdr.markForCheck();
      }
    });
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

  get nextImageUrl(): string | null {
    const idx = this.selectedIndex;
    if (idx >= 0 && idx < this.filteredImages.length - 1) {
      return this.filteredImages[idx + 1].url;
    }
    return null;
  }

  get prevImageUrl(): string | null {
    const idx = this.selectedIndex;
    if (idx > 0) {
      return this.filteredImages[idx - 1].url;
    }
    return null;
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
    // 1) Lạc quan cập nhật local UI ngay lập tức
    this.images = this.images.filter(i => i.id !== id);
    this.applyFilter();

    if (this.selectedImage?.id === id) {
      this.onModalClose();
    }

    // 2) Gọi API ngầm
    this.imageService.deleteImage(id).subscribe({
      error: (err) => {
        console.error('Lỗi khi xóa ảnh trên server:', err);
        // Tùy chọn: reload danh sách ảnh hoặc hiện thông báo
        this.errorMessage = 'Có lỗi xảy ra khi xóa ảnh trên hệ thống, nhưng đã ẩn trên giao diện.';
        this.cdr.markForCheck();
      }
    });
  }

  onBulkDelete(ids: string[]): void {
    // Optimistic UI update
    this.images = this.images.filter(i => !ids.includes(i.id));
    this.applyFilter();
    this.isGridSelectMode = false;

    if (this.selectedImage && ids.includes(this.selectedImage.id)) {
      this.onModalClose();
    }

    // Call service to bulk delete
    this.imageService.bulkDeleteImages(ids).subscribe({
      error: (err) => {
        console.error('Lỗi khi xóa hàng loạt ảnh:', err);
        this.errorMessage = 'Có lỗi xảy ra khi xóa ảnh trên hệ thống, vui lòng tải lại trang.';
        this.cdr.markForCheck();
      }
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

