import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'white' | 'indigo' | 'slate' | 'primary';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="flex items-center justify-center select-none"
      [class.min-h-[480px]]="fullHeight()"
      [class.w-full]="fullHeight()"
      role="status"
      [attr.aria-label]="ariaLabel()"
    >
      <div
        class="rounded-full animate-spin"
        [ngClass]="[sizeClasses, colorClasses]"
      ></div>
      <span class="sr-only">{{ ariaLabel() }}</span>
    </section>
  `,
})
export class LoadingSpinnerComponent {
  /** Kích thước vòng xoay: 'sm' (nhỏ), 'md' (vừa), 'lg' (lớn), 'xl' (rất lớn) */
  size = input<SpinnerSize>('lg');

  /** Màu sắc: 'white' (mặc định), 'indigo', 'slate', 'primary' */
  color = input<SpinnerColor>('white');

  /** Chiếm toàn bộ chiều cao vùng chứa (mặc định: true) */
  fullHeight = input<boolean>(true);

  /** Nhãn hỗ trợ Accessibility cho Screen Reader */
  ariaLabel = input<string>('Đang tải dữ liệu...');

  get sizeClasses(): string {
    switch (this.size()) {
      case 'sm': return 'w-6 h-6 border-2';
      case 'md': return 'w-10 h-10 border-[3px]';
      case 'xl': return 'w-20 h-20 border-[4px]';
      case 'lg':
      default: return 'w-14 h-14 border-[3.5px]';
    }
  }

  get colorClasses(): string {
    switch (this.color()) {
      case 'indigo': return 'border-indigo-500/20 border-t-indigo-600';
      case 'slate': return 'border-slate-400/20 border-t-slate-600';
      case 'primary': return 'border-sky-500/20 border-t-sky-500';
      case 'white':
      default: return 'border-white/20 border-t-white';
    }
  }
}
