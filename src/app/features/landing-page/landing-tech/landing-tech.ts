import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { TECH_LAYER_GROUPS, TOTAL_TECHNOLOGIES_COUNT } from './landing-tech.data';
import {
  TechCategoryId,
  TechFilterId,
  TechFilterTab,
  TechLayerGroup,
} from './landing-tech.types';

/**
 * Thành phần hiển thị hệ sinh thái công nghệ của AI Smart Kanban
 * theo phong cách Minimalism đồng bộ UI toàn Landing Page, chuẩn Semantic HTML5 và GEO.
 */
@Component({
  selector: 'app-landing-tech',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './landing-tech.html',
  styleUrl: './landing-tech.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingTechComponent {
  readonly layerGroups: readonly TechLayerGroup[] = TECH_LAYER_GROUPS;

  /**
   * Mặc định hiển thị tầng Frontend để giữ nhịp chiều cao cân đối trên Landing Page.
   */
  readonly activeCategory = signal<TechFilterId>('frontend');

  /**
   * Tập hợp mã công nghệ gặp lỗi tải logo SVG để tự động chuyển sang mat-icon fallback.
   */
  readonly failedIcons = signal<ReadonlySet<string>>(new Set());

  /**
   * Danh sách tab chuyển đổi từng tầng kiến trúc cùng chế độ xem toàn bộ.
   */
  readonly filterTabs = computed<readonly TechFilterTab[]>(() => [
    ...this.layerGroups.map((group) => ({
      id: group.id,
      icon: group.icon,
      labelKey: group.titleKey,
      count: group.items.length,
    })),
    {
      id: 'all',
      icon: 'apps',
      labelKey: 'LANDING_TECH.FILTERS.ALL',
      count: TOTAL_TECHNOLOGIES_COUNT,
    },
  ]);

  /**
   * Cập nhật tầng kiến trúc đang hiển thị.
   */
  selectCategory(category: TechFilterId): void {
    this.activeCategory.set(category);
  }

  /**
   * Kiểm tra xem một tầng kiến trúc có đang được hiển thị hay không.
   */
  isGroupVisible(groupId: TechCategoryId): boolean {
    const selected = this.activeCategory();
    return selected === 'all' || selected === groupId;
  }

  /**
   * Đánh dấu logo công nghệ bị lỗi tải ảnh để hiển thị mat-icon thay thế.
   */
  handleImageError(techId: string): void {
    this.failedIcons.update((current) => {
      if (current.has(techId)) {
        return current;
      }
      const next = new Set(current);
      next.add(techId);
      return next;
    });
  }

  /**
   * Kiểm tra xem logo SVG của công nghệ có đang bị lỗi tải hay không.
   */
  isIconFailed(techId: string): boolean {
    return this.failedIcons().has(techId);
  }
}
