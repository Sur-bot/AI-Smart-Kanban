import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// ─── Hằng số điều khiển auto-slide ─────────────────────────────
const TAB_DURATION_MS = 4000;
const TICK_MS = 50;
const FEATURE_COUNT = 6;

const INITIAL_FEATURE_TABS: FeatureTab[] = [
  {
    tabKey: 'TAB_KANBAN',
    icon: 'dashboard',
    imageUrl:
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fm=webp&fit=crop&q=75&w=960&h=540'
  }
];

// ─── Kiểu dữ liệu ───────────────────────────────────────────────

/** Cấu trúc dữ liệu thô từ file assets/config/feature-tabs.json */
interface FeatureTab {
  tabKey: string;   // Ví dụ: 'TAB_KANBAN'
  icon: string;     // Material icon name
  imageUrl: string; // URL hình ảnh banner
}

/** View-model đầy đủ — được tính toán từ FeatureTab */
interface FeatureTabVM extends FeatureTab {
  labelKey: string;     // 'LANDING_HERO.TAB_KANBAN'
  imageAltKey: string;  // 'LANDING_HERO.TAB_KANBAN' (= labelKey)
  featureKeys: string[]; // ['LANDING_HERO.TAB_KANBAN_F1', ..., '_F6']
}

// ─── Pure Utilities ─────────────────────────────────────────────

function buildFeatureKeys(prefix: string, count = FEATURE_COUNT): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}_F${i + 1}`);
}

function buildTabs(data: FeatureTab[]): FeatureTabVM[] {
  return data.map(tab => {
    const prefix = `LANDING_HERO.${tab.tabKey}`;
    return { ...tab, labelKey: prefix, imageAltKey: prefix, featureKeys: buildFeatureKeys(prefix) };
  });
}

// ─── Component ──────────────────────────────────────────────────

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [RouterModule, MatIconModule, TranslatePipe],
  templateUrl: './landing-hero.html',
  styleUrl: './landing-hero.scss'
})
export class LandingHeroComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  private timer: ReturnType<typeof setInterval> | null = null;
  private isPaused = false;

  readonly activeTab = signal(0);
  readonly hoveredTab = signal<number | null>(null);
  readonly progress = signal(0); // 0–100
  readonly loadedTabs = signal<Record<number, boolean>>({});
  readonly renderedTabs = signal<Record<number, boolean>>({ 0: true, 1: true });

  /**
   * Tabs được load từ `assets/config/feature-tabs.json`.
   * Dùng toSignal() để Angular tự theo dõi Observable → Signal.
   * initialValue chứa sẵn Tab 0 (LCP) để render ngay lập tức không chờ HTTP waterfall.
   */
  readonly tabs = toSignal(
    this.http.get<FeatureTab[]>('assets/config/feature-tabs.json').pipe(
      map(data => buildTabs(data))
    ),
    { initialValue: buildTabs(INITIAL_FEATURE_TABS) }
  );

  constructor() {
    // Khởi động auto-slide SAU khi dữ liệu đầy đủ của các tabs đã tải về
    effect(() => {
      if (this.tabs().length > 1) {
        this.startAutoSlide();
      }
    });

    // Chỉ gắn vào DOM tab đang hiển thị và tab kế tiếp để không tải dồn cả 5 ảnh cùng lúc
    effect(() => {
      const total = this.tabs().length;
      const current = this.activeTab();
      if (total === 0) return;
      const next = (current + 1) % total;
      this.renderedTabs.update(prev => {
        if (prev[current] && prev[next]) return prev;
        return { ...prev, [current]: true, [next]: true };
      });
    });

    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  onImageLoad(index: number): void {
    this.loadedTabs.update(prev => (prev[index] ? prev : { ...prev, [index]: true }));
  }

  isTabLoaded(index: number): boolean {
    return !!this.loadedTabs()[index];
  }

  shouldRenderTab(index: number): boolean {
    return !!this.renderedTabs()[index];
  }

  /** Hover start: chuyển sang tab được hover, tạm dừng auto-slide */
  onMouseEnter(index: number): void {
    this.hoveredTab.set(index);
    this.activeTab.set(index);
    this.isPaused = true;
    this.progress.set(0);
  }

  /** Hover end: tiếp tục auto-slide từ đầu */
  onMouseLeave(): void {
    this.hoveredTab.set(null);
    this.isPaused = false;
  }

  private startAutoSlide(): void {
    this.clearTimer();
    this.progress.set(0);
    this.isPaused = false;

    this.timer = setInterval(() => {
      if (this.isPaused) return;
      const next = this.progress() + (TICK_MS / TAB_DURATION_MS * 100);
      if (next >= 100) {
        this.progress.set(0);
        this.activeTab.update(i => (i + 1) % this.tabs().length);
      } else {
        this.progress.set(next);
      }
    }, TICK_MS);
  }

  prevTab(): void {
    const total = this.tabs().length;
    if (total === 0) return;
    this.progress.set(0);
    this.activeTab.update(i => (i - 1 + total) % total);
  }

  nextTab(): void {
    const total = this.tabs().length;
    if (total === 0) return;
    this.progress.set(0);
    this.activeTab.update(i => (i + 1) % total);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

