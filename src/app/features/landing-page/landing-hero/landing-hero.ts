import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, NgZone, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

// ─── Hằng số điều khiển timeline & camera (60fps RAF) ───────────
const TAB_DURATION_MS = 5500;
const FEATURE_COUNT = 6;
const MAX_CAMERA_ZOOM = 1.18;

// ─── Pure Interpolation Utilities ───────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function easeInOutCubic(x: number): number {
  const c = clamp(x, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function segment(t: number, start: number, end: number): number {
  if (end <= start) return t >= end ? 1 : 0;
  return easeInOutCubic(clamp((t - start) / (end - start), 0, 1));
}

function buildFeatureKeys(prefix: string, count = FEATURE_COUNT): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}_F${i + 1}`);
}

// ─── Kiểu dữ liệu ───────────────────────────────────────────────

export type HeroTabKey = 'TAB_KANBAN' | 'TAB_AI' | 'TAB_PROJECT' | 'TAB_STORAGE' | 'TAB_SECURITY';

interface FeatureTabConfig {
  tabKey: HeroTabKey;
  icon: string;
  browserUrl: string;
  showCreateBtn: boolean;
  topbarBadgeKey?: string;
}

export interface FeatureTabVM extends FeatureTabConfig {
  labelKey: string;
  featureKeys: string[];
}

export interface AiWorkerJob {
  id: string;
  fileName: string;
  originalSize: string;
  optimizedSize: string;
  savedPercent: number;
  badgeKey: string;
}

export interface GanttBarItem {
  id: string;
  titleKey: string;
  assignee: string;
  avatarBg: string;
  barClass: string;
  startColPercent: number;
  widthPercent: number;
}

export interface StorageThumbItem {
  id: string;
  fileName: string;
  imageSrc: string;
  webpSize: string;
  savedTag: string;
}

export interface RbacMatrixRow {
  resourceKey: string;
  owner: boolean;
  member: boolean;
  guest: boolean;
  revealAt: number;
}

export interface SecurityStepItem {
  id: string;
  labelKey: string;
  detail: string;
  icon: string;
  unlockAt: number;
}

interface ChoreographyFrame {
  cursorX: number;
  cursorY: number;
  focusX: number;
  focusY: number;
  pressed: boolean;
  pulse: boolean;
}

// ─── Dữ liệu cấu hình tĩnh ──────────────────────────────────────

const FEATURE_TAB_CONFIGS: FeatureTabConfig[] = [
  { tabKey: 'TAB_KANBAN', icon: 'dashboard', browserUrl: 'digit24.dpdns.org/kanban', showCreateBtn: true },
  {
    tabKey: 'TAB_AI',
    icon: 'auto_awesome',
    browserUrl: 'digit24.dpdns.org/ai-worker',
    showCreateBtn: false,
    topbarBadgeKey: 'LANDING_HERO.MOCKUP.TOPBAR_AI'
  },
  { tabKey: 'TAB_PROJECT', icon: 'folder_special', browserUrl: 'digit24.dpdns.org/projects', showCreateBtn: true },
  {
    tabKey: 'TAB_STORAGE',
    icon: 'cloud_upload',
    browserUrl: 'digit24.dpdns.org/cloud-storage',
    showCreateBtn: false,
    topbarBadgeKey: 'LANDING_HERO.MOCKUP.TOPBAR_STORAGE'
  },
  {
    tabKey: 'TAB_SECURITY',
    icon: 'shield',
    browserUrl: 'digit24.dpdns.org/security',
    showCreateBtn: false,
    topbarBadgeKey: 'LANDING_HERO.MOCKUP.TOPBAR_SECURITY'
  }
];

function buildTabs(configs: FeatureTabConfig[]): FeatureTabVM[] {
  return configs.map(tab => {
    const prefix = `LANDING_HERO.${tab.tabKey}`;
    return { ...tab, labelKey: prefix, featureKeys: buildFeatureKeys(prefix) };
  });
}

// ─── Component ──────────────────────────────────────────────────

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [NgTemplateOutlet, RouterModule, MatIconModule, TranslatePipe],
  templateUrl: './landing-hero.html',
  styleUrl: './landing-hero.scss'
})
export class LandingHeroComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private rafId: number | null = null;
  private lastTimestamp: number | null = null;
  private elapsedMs = 0;
  private isPaused = false;

  readonly activeTab = signal(0);
  readonly hoveredTab = signal<number | null>(null);
  readonly progress = signal(0); // 0–100 (cập nhật 60fps theo RAF)

  readonly tabs = signal<FeatureTabVM[]>(buildTabs(FEATURE_TAB_CONFIGS));
  readonly teamAvatars = [
    { initials: 'NA', bg: 'bg-[#00629A] text-white' },
    { initials: 'TM', bg: 'bg-[#3FC0F0] text-[#1A1B1F]' },
    { initials: 'LH', bg: 'bg-emerald-600 text-white' }
  ];

  // ─── Choreography Frame: Cursor + Focus Point (60fps) ────────
  readonly normalizedT = computed(() => clamp(this.progress() / 100, 0, 1));

  readonly choreography = computed<ChoreographyFrame>(() => {
    const t = this.normalizedT();
    const key = this.tabs()[this.activeTab()]?.tabKey;

    switch (key) {
      case 'TAB_KANBAN': {
        // Con trỏ gắn trực tiếp trên thẻ TASK_2 (Cột 2 hàng 3 -> Floating Card -> Cột 3 hàng 3): sai số 0px
        const moveIn = segment(t, 0.0, 0.22);
        const drag = segment(t, 0.28, 0.68);
        const settle = segment(t, 0.72, 0.92);
        const cursorX = lerp(-25, 55, moveIn) + lerp(0, 12, settle);
        const cursorY = lerp(-130, 50, moveIn) + lerp(0, 22, settle);
        return {
          cursorX,
          cursorY,
          focusX: lerp(50, 80, drag),
          focusY: 66,
          pressed: t >= 0.26 && t <= 0.68,
          pulse: (t >= 0.25 && t <= 0.33) || (t >= 0.67 && t <= 0.74)
        };
      }

      case 'TAB_AI': {
        // Con trỏ gắn trực tiếp trên nút "Nén WebP" của Hàng đợi Worker bên phải
        const moveIn = segment(t, 0.0, 0.21);
        const retreat = segment(t, 0.36, 0.56);
        const cursorX = lerp(30, 52, moveIn) + lerp(0, 8, retreat);
        const cursorY = lerp(240, 55, moveIn) + lerp(0, 175, retreat);
        return {
          cursorX,
          cursorY,
          focusX: lerp(78, 45, segment(t, 0.42, 0.74)),
          focusY: lerp(24, 54, segment(t, 0.42, 0.74)),
          pressed: t >= 0.23 && t <= 0.33,
          pulse: t >= 0.23 && t <= 0.33
        };
      }

      case 'TAB_PROJECT': {
        // Vạch "Hôm nay" cố định ở mốc Thứ 4 (50%). Con trỏ nắm mép phải Gantt Bar M2 kéo gia hạn deadline -> T6
        const moveIn = segment(t, 0.0, 0.2);
        const resize = segment(t, 0.24, 0.76);
        const release = segment(t, 0.78, 0.94);
        const rightEdgeX = this.ganttActiveBarRightPercent();
        const cursorX = lerp(24, rightEdgeX, moveIn) + lerp(0, 3, release);
        const cursorY = lerp(74, 50, moveIn) + lerp(0, 12, release);
        return {
          cursorX,
          cursorY,
          focusX: lerp(66, 86, resize),
          focusY: 54,
          pressed: t >= 0.23 && t <= 0.76,
          pulse: (t >= 0.22 && t <= 0.30) || (t >= 0.75 && t <= 0.82)
        };
      }

      case 'TAB_STORAGE': {
        // Hệ tọa độ trong scene Storage: thẻ 2 (50%, 62%) -> thẻ 3 (83%, 62%)
        const moveIn = segment(t, 0.0, 0.2);
        const toThird = segment(t, 0.42, 0.58);
        const cursorX = lerp(26, 50, moveIn) + lerp(0, 33, toThird);
        const cursorY = lerp(24, 62, moveIn);
        return {
          cursorX,
          cursorY,
          focusX: lerp(52, 76, toThird),
          focusY: 62,
          pressed: (t >= 0.26 && t <= 0.33) || (t >= 0.60 && t <= 0.67),
          pulse: (t >= 0.25 && t <= 0.33) || (t >= 0.59 && t <= 0.67)
        };
      }

      case 'TAB_SECURITY':
      default: {
        // Pha 1 (<0.44): gắn trực tiếp vào ô RLS hàng 3 | Pha 2 (>=0.44): gắn trực tiếp vào thẻ SHA-256 Digest
        if (t < 0.44) {
          const moveIn = segment(t, 0.0, 0.2);
          const exitDown = segment(t, 0.33, 0.44);
          return {
            cursorX: lerp(-150, 50, moveIn) + lerp(0, 80, exitDown),
            cursorY: lerp(-170, 55, moveIn) + lerp(0, 175, exitDown),
            focusX: 60,
            focusY: 42,
            pressed: t >= 0.22 && t <= 0.31,
            pulse: t >= 0.22 && t <= 0.31
          };
        }

        const enterCard = segment(t, 0.44, 0.58);
        return {
          cursorX: lerp(10, 52, enterCard),
          cursorY: lerp(-45, 52, enterCard),
          focusX: 78,
          focusY: 78,
          pressed: t >= 0.60 && t <= 0.68,
          pulse: t >= 0.60 && t <= 0.68
        };
      }
    }
  });

  // ─── Camera Transform (Smooth Zoom In 1.18x -> Zoom Out 1.0x) ─
  readonly cameraTransform = computed(() => {
    if (this.hoveredTab() !== null) {
      return 'scale3d(1, 1, 1) translate3d(0%, 0%, 0)';
    }

    const t = this.normalizedT();
    const { focusX, focusY } = this.choreography();

    // Zoom in mượt [0.10 -> 0.28], giữ focus, rồi zoom out êm [0.76 -> 0.95] về 1.0x
    const zoomIn = segment(t, 0.10, 0.28);
    const zoomOut = segment(t, 0.76, 0.95);
    const zoomFactor = zoomIn * (1 - zoomOut);
    const scale = 1 + (MAX_CAMERA_ZOOM - 1) * zoomFactor;

    // Giới hạn dịch chuyển tối đa để mép viewport không bị hở khi zoom
    const maxShiftPercent = ((scale - 1) / (2 * scale)) * 100;
    const tx = clamp((50 - focusX) * 0.65 * zoomFactor, -maxShiftPercent, maxShiftPercent);
    const ty = clamp((50 - focusY) * 0.65 * zoomFactor, -maxShiftPercent, maxShiftPercent);

    return `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1) translate3d(${tx.toFixed(3)}%, ${ty.toFixed(3)}%, 0)`;
  });

  // ─── Cảnh 1: Kanban Drag & Drop State ────────────────────────
  readonly kanbanDragProgress = computed(() => segment(this.normalizedT(), 0.28, 0.68));
  readonly isKanbanDragging = computed(() => {
    const t = this.normalizedT();
    return t >= 0.28 && t < 0.69;
  });
  readonly isKanbanTaskPromoted = computed(() => this.normalizedT() >= 0.69);
  readonly kanbanDragLeftPercent = computed(() => lerp(34.5, 67.5, this.kanbanDragProgress()));
  readonly kanbanDragLiftY = computed(() => -Math.sin(this.kanbanDragProgress() * Math.PI) * 14);

  // ─── Cảnh 2: AI WebP Queue Worker ─────────────────────────────
  readonly isAiOptimizing = computed(() => this.normalizedT() >= 0.25);
  readonly isAiCompleted = computed(() => this.normalizedT() >= 0.72);
  readonly activeAiJobIndex = computed(() => {
    const t = this.normalizedT();
    if (t < 0.44) return 0;
    if (t < 0.62) return 1;
    return 2;
  });
  readonly aiJobs: AiWorkerJob[] = [
    {
      id: 'job-1',
      fileName: 'hero-banner-4k.png',
      originalSize: '2.4 MB',
      optimizedSize: '310 KB',
      savedPercent: 87,
      badgeKey: 'LANDING_HERO.MOCKUP.AI.EXIF_STRIPPED'
    },
    {
      id: 'job-2',
      fileName: 'kanban-cover.jpg',
      originalSize: '1.8 MB',
      optimizedSize: '245 KB',
      savedPercent: 86,
      badgeKey: 'LANDING_HERO.MOCKUP.AI.THUMB_READY'
    },
    {
      id: 'job-3',
      fileName: 'workspace-bg.png',
      originalSize: '3.1 MB',
      optimizedSize: '390 KB',
      savedPercent: 87,
      badgeKey: 'LANDING_HERO.MOCKUP.AI.LOSSLESS_WEBP'
    }
  ];

  // ─── Cảnh 3: Gantt Timeline Chart ────────────────────────────
  readonly ganttDayKeys = [0, 1, 2, 3, 4];
  readonly ganttTodayPercent = 50; // Mốc Hôm nay cố định tại giữa tuần (Thứ 4)
  readonly ganttActiveBarId = 'g2';
  readonly ganttActiveBarWidth = computed(() => {
    const resize = segment(this.normalizedT(), 0.24, 0.76);
    return Number(lerp(34, 70, resize).toFixed(2));
  });
  readonly ganttActiveBarRightPercent = computed(() =>
    Number((18 + this.ganttActiveBarWidth()).toFixed(2))
  );
  readonly activeGanttDayIndex = computed(() =>
    Math.min(4, Math.floor(this.ganttActiveBarRightPercent() / 20))
  );
  readonly ganttBars: GanttBarItem[] = [
    {
      id: 'g1',
      titleKey: 'LANDING_HERO.MOCKUP.PROJECT.M1_TITLE',
      assignee: 'NA',
      avatarBg: 'bg-[#00629A] text-white',
      barClass: 'bg-[#E3EFFD] border-[#00629A]/40 text-[#0046A4]',
      startColPercent: 4,
      widthPercent: 46
    },
    {
      id: 'g2',
      titleKey: 'LANDING_HERO.MOCKUP.PROJECT.M2_TITLE',
      assignee: 'TM',
      avatarBg: 'bg-indigo-600 text-white',
      barClass: 'bg-[#EBEAFC] border-indigo-400/50 text-indigo-800',
      startColPercent: 18,
      widthPercent: 34
    },
    {
      id: 'g3',
      titleKey: 'LANDING_HERO.MOCKUP.PROJECT.M3_TITLE',
      assignee: 'LH',
      avatarBg: 'bg-emerald-600 text-white',
      barClass: 'bg-[#E0F7F2] border-emerald-500/40 text-emerald-800',
      startColPercent: 42,
      widthPercent: 50
    }
  ];

  // ─── Cảnh 4: Storage Center (Real Assets) ────────────────────
  readonly activeStorageIndex = computed(() => {
    const t = this.normalizedT();
    if (t >= 0.58) return 2;
    if (t >= 0.28) return 1;
    return 0;
  });
  readonly storageQuotaMB = computed(() =>
    Math.round(142 + segment(this.normalizedT(), 0.2, 0.85) * 12)
  );
  readonly storageThumbs: StorageThumbItem[] = [
    {
      id: 'st-1',
      fileName: 'sprint-hero.webp',
      imageSrc: '/assets/images/main-bg-3.jpg',
      webpSize: '29 KB',
      savedTag: '-84%'
    },
    {
      id: 'st-2',
      fileName: 'sprint-cover.webp',
      imageSrc: '/assets/images/main-bg-2.jpg',
      webpSize: '56 KB',
      savedTag: '-79%'
    },
    {
      id: 'st-3',
      fileName: 'board-theme.webp',
      imageSrc: '/assets/images/main-bg-6.jpg',
      webpSize: '35 KB',
      savedTag: '-81%'
    }
  ];

  // ─── Cảnh 5: RBAC Matrix & Security Audit ────────────────────
  readonly securityPhase = computed<'row' | 'card'>(() =>
    this.normalizedT() < 0.44 ? 'row' : 'card'
  );
  readonly rbacRows: RbacMatrixRow[] = [
    {
      resourceKey: 'LANDING_HERO.MOCKUP.SECURITY.ROW_BOARD',
      owner: true,
      member: true,
      guest: false,
      revealAt: 10
    },
    {
      resourceKey: 'LANDING_HERO.MOCKUP.SECURITY.ROW_STORAGE',
      owner: true,
      member: true,
      guest: false,
      revealAt: 20
    },
    {
      resourceKey: 'LANDING_HERO.MOCKUP.SECURITY.ROW_RLS',
      owner: true,
      member: false,
      guest: false,
      revealAt: 28
    },
    {
      resourceKey: 'LANDING_HERO.MOCKUP.SECURITY.ROW_KEYS',
      owner: true,
      member: false,
      guest: false,
      revealAt: 42
    }
  ];
  readonly securitySteps: SecurityStepItem[] = [
    {
      id: 's1',
      labelKey: 'LANDING_HERO.MOCKUP.SECURITY.STEP_GATEWAY',
      detail: 'Bearer JWT',
      icon: 'vpn_key_off',
      unlockAt: 16
    },
    {
      id: 's2',
      labelKey: 'LANDING_HERO.MOCKUP.SECURITY.STEP_RLS',
      detail: 'uid() === owner',
      icon: 'admin_panel_settings',
      unlockAt: 36
    },
    {
      id: 's3',
      labelKey: 'LANDING_HERO.MOCKUP.SECURITY.STEP_HASH',
      detail: 'e3b0c4...98fc',
      icon: 'enhanced_encryption',
      unlockAt: 62
    }
  ];

  constructor() {
    this.startAutoSlide();
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  /** Hover trên thanh nav tab: chuyển sang tab được hover và tạm dừng timeline */
  onMouseEnter(index: number): void {
    this.hoveredTab.set(index);
    this.activeTab.set(index);
    this.isPaused = true;
    this.elapsedMs = 0;
    this.progress.set(0);
  }

  /** Rời chuột khỏi thanh nav tab: tiếp tục chạy timeline mượt từ đầu */
  onMouseLeave(): void {
    this.hoveredTab.set(null);
    this.isPaused = false;
    this.lastTimestamp = null;
  }

  // ─── Helper theo dõi tiến trình Timeline ──────────────────────

  getAiJobProgress(index: number): number {
    const t = this.normalizedT();
    const starts = [0.27, 0.36, 0.45];
    const ends = [0.5, 0.62, 0.74];
    const p = segment(t, starts[index] ?? 0.27, ends[index] ?? 0.74);
    return Math.round(lerp(12, 100, p));
  }

  getGanttBarWidth(bar: GanttBarItem): number {
    return bar.id === this.ganttActiveBarId ? this.ganttActiveBarWidth() : bar.widthPercent;
  }

  isGanttBarResizing(bar: GanttBarItem): boolean {
    return bar.id === this.ganttActiveBarId && this.choreography().pressed;
  }

  isStepVerified(unlockAt: number): boolean {
    return this.progress() >= unlockAt;
  }

  prevTab(): void {
    const total = this.tabs().length;
    if (total === 0) return;
    this.elapsedMs = 0;
    this.progress.set(0);
    this.activeTab.update(i => (i - 1 + total) % total);
  }

  nextTab(): void {
    const total = this.tabs().length;
    if (total === 0) return;
    this.elapsedMs = 0;
    this.progress.set(0);
    this.activeTab.update(i => (i + 1) % total);
  }

  private startAutoSlide(): void {
    this.clearTimer();
    this.elapsedMs = 0;
    this.lastTimestamp = null;
    this.progress.set(0);
    this.isPaused = false;

    if (typeof requestAnimationFrame === 'undefined') return;

    const tick = (now: number): void => {
      if (!this.isPaused) {
        if (this.lastTimestamp !== null) {
          const delta = Math.min(now - this.lastTimestamp, 100);
          this.elapsedMs += delta;

          if (this.elapsedMs >= TAB_DURATION_MS) {
            this.elapsedMs %= TAB_DURATION_MS;
            this.ngZone.run(() => {
              this.progress.set(0);
              this.activeTab.update(i => (i + 1) % this.tabs().length);
            });
          } else {
            const pct = (this.elapsedMs / TAB_DURATION_MS) * 100;
            this.ngZone.run(() => {
              this.progress.set(pct);
            });
          }
        }
        this.lastTimestamp = now;
      } else {
        this.lastTimestamp = now;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(tick);
    });
  }

  private clearTimer(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
