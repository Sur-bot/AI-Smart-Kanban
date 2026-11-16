import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

export const SCROLL_TOP_THRESHOLD_PX = 300;

@Component({
  selector: 'app-landing-scroll-top',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './landing-scroll-top.html',
  styleUrl: './landing-scroll-top.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingScrollTopComponent {
  readonly suppressed = input<boolean>(false);

  readonly isScrolledPastThreshold = signal<boolean>(
    typeof window !== 'undefined' && window.scrollY > SCROLL_TOP_THRESHOLD_PX
  );

  readonly isVisible = computed(
    () => this.isScrolledPastThreshold() && !this.suppressed()
  );

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.isScrolledPastThreshold.set(window.scrollY > SCROLL_TOP_THRESHOLD_PX);
  }

  scrollToTop(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
