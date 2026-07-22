import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImageFile } from '../models/image.model';

@Injectable({ providedIn: 'root' })
export class ImageStorageService {

  private readonly imagesSubject = new BehaviorSubject<ImageFile[]>(this.generateMockData());
  readonly images$ = this.imagesSubject.asObservable();

  get totalSize(): number {
    return this.imagesSubject.value.reduce((sum, img) => sum + img.size, 0);
  }

  get totalCount(): number {
    return this.imagesSubject.value.length;
  }

  addImage(file: File): ImageFile {
    const newImage: ImageFile = {
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      size: file.size,
      width: 0,
      height: 0,
      format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      uploadedAt: new Date(),
      uploadedBy: { name: 'Bạn', avatar: undefined },
    };

    // Đọc kích thước ảnh thực tế
    const img = new Image();
    img.onload = () => {
      newImage.width = img.naturalWidth;
      newImage.height = img.naturalHeight;
      this.imagesSubject.next([...this.imagesSubject.value]);
    };
    img.src = newImage.url;

    const current = this.imagesSubject.value;
    this.imagesSubject.next([newImage, ...current]);
    return newImage;
  }

  deleteImage(id: string): void {
    const updated = this.imagesSubject.value.filter(img => img.id !== id);
    this.imagesSubject.next(updated);
  }

  private generateMockData(): ImageFile[] {
    const users = [
      { name: 'Nguyễn Văn An' },
      { name: 'Trần Thị Bình' },
      { name: 'Lê Minh Châu' },
    ];

    const mockItems: Partial<ImageFile>[] = [
      { name: 'dashboard-overview.png',   format: 'png',  size: 524_288,   width: 1920, height: 1080 },
      { name: 'kanban-board-dark.jpg',     format: 'jpg',  size: 1_048_576, width: 2560, height: 1440 },
      { name: 'login-screen-v2.png',       format: 'png',  size: 312_400,   width: 1440, height: 900  },
      { name: 'mobile-app-preview.webp',   format: 'webp', size: 204_800,   width: 375,  height: 812  },
      { name: 'analytics-chart.png',       format: 'png',  size: 450_000,   width: 1280, height: 720  },
      { name: 'team-collaboration.jpg',    format: 'jpg',  size: 890_000,   width: 1920, height: 1080 },
      { name: 'notification-popup.gif',    format: 'gif',  size: 1_200_000, width: 800,  height: 600  },
      { name: 'sidebar-redesign.png',      format: 'png',  size: 380_000,   width: 1440, height: 900  },
      { name: 'user-profile-modal.png',    format: 'png',  size: 270_000,   width: 1024, height: 768  },
      { name: 'task-detail-expanded.webp', format: 'webp', size: 560_000,   width: 1920, height: 1200 },
    ];

    return mockItems.map((item, i) => ({
      id: `mock-${i + 1}`,
      name: item.name!,
      url: this.generatePlaceholderUrl(item.width!, item.height!, i),
      thumbnailUrl: this.generatePlaceholderUrl(300, 200, i),
      size: item.size!,
      width: item.width!,
      height: item.height!,
      format: item.format!,
      uploadedAt: new Date(Date.now() - (i * 86_400_000 + Math.random() * 86_400_000)),
      uploadedBy: users[i % users.length],
    }));
  }

  /** Tạo placeholder gradient SVG dưới dạng data URI */
  private generatePlaceholderUrl(w: number, h: number, seed: number): string {
    const colors = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#a18cd1', '#fbc2eb'],
      ['#fccb90', '#d57eeb'],
      ['#e0c3fc', '#8ec5fc'],
      ['#f5576c', '#ff6a00'],
      ['#667eea', '#43e97b'],
    ];
    const [c1, c2] = colors[seed % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Inter,sans-serif" font-size="14" fill="rgba(255,255,255,0.6)">${w}×${h}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}
