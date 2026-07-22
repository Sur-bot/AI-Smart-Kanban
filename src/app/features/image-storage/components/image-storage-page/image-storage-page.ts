import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { ImageFile } from '../../models/image.model';
import { SupabaseStorageService } from '../../services/supabase-storage.service';
import { ImageUploadZoneComponent } from '../image-upload-zone/image-upload-zone';
import { ImageGridComponent } from '../image-grid/image-grid';
import { ImageDetailModalComponent } from '../image-detail-modal/image-detail-modal';

@Component({
  selector: 'app-image-storage-page',
  templateUrl: './image-storage-page.html',
  styleUrls: ['./image-storage-page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ImageUploadZoneComponent,
    ImageGridComponent,
    ImageDetailModalComponent,
  ],
})
export class ImageStoragePageComponent implements OnInit, OnDestroy {
  images: ImageFile[] = [];
  filteredImages: ImageFile[] = [];
  selectedImage: ImageFile | null = null;
  showUploadZone = false;
  searchQuery = '';

  private subscription?: Subscription;

  constructor(
    private imageService: SupabaseStorageService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/kanban']);
    }
  }

  ngOnInit(): void {
    // Subscribe trước khi gọi loadImages để không bỏ lỡ bất kỳ event nào
    this.subscription = this.imageService.images$.subscribe(images => {
      this.images = images;
      this.applyFilter();
      this.cdr.markForCheck(); // Tự động buộc Angular cập nhật giao diện ngay lập tức
    });
    this.imageService.loadImages();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get totalCount(): number {
    return this.images.length;
  }

  get totalSizeFormatted(): string {
    const bytes = this.images.reduce((sum, img) => sum + img.size, 0);
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1_073_741_824) return (bytes / 1_048_576).toFixed(1) + ' MB';
    return (bytes / 1_073_741_824).toFixed(2) + ' GB';
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
  }

  onFilesSelected(files: File[]): void {
    for (const file of files) {
      this.imageService.uploadImage(file).subscribe({
        error: (err) => console.error('Lỗi khi tải ảnh lên Supabase:', err)
      });
    }
    this.showUploadZone = false;
  }

  onImageClick(image: ImageFile): void {
    this.selectedImage = image;
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
}
