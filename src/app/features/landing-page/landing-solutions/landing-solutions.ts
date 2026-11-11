import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { tap } from 'rxjs';
import { LandingSolutionsService } from './landing-solutions.service';

const BATCH_SYNC_WINDOW_MS = 450;

@Component({
  selector: 'app-landing-solutions',
  imports: [MatIconModule, TranslatePipe, AsyncPipe, NgOptimizedImage],
  templateUrl: './landing-solutions.html',
  styleUrl: './landing-solutions.scss'
})
export class LandingSolutionsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly landingSolutionsService = inject(LandingSolutionsService);

  private totalExpected = 0;
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loadedImages = signal<Record<string, boolean>>({});
  readonly isBatchRevealed = signal(false);

  readonly groups$ = this.landingSolutionsService.getSolutions().pipe(
    tap(groups => {
      this.totalExpected = groups.reduce((sum, g) => sum + g.items.length, 0);
    })
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.batchTimer !== null) {
        clearTimeout(this.batchTimer);
      }
    });
  }

  onImageLoad(url: string): void {
    this.loadedImages.update(prev => (prev[url] ? prev : { ...prev, [url]: true }));

    const loadedCount = Object.keys(this.loadedImages()).length;
    if (this.totalExpected > 0 && loadedCount >= this.totalExpected) {
      if (this.batchTimer !== null) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
      this.isBatchRevealed.set(true);
      return;
    }

    // Khởi động cửa sổ đồng bộ ngay khi bức ảnh đầu tiên tải xong
    if (!this.isBatchRevealed() && this.batchTimer === null) {
      this.batchTimer = setTimeout(() => {
        this.isBatchRevealed.set(true);
        this.batchTimer = null;
      }, BATCH_SYNC_WINDOW_MS);
    }
  }

  isCardRevealed(url: string): boolean {
    return this.isBatchRevealed() && !!this.loadedImages()[url];
  }
}

