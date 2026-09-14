import {
  Component,
  Input,
  inject,
  computed,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { interval } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-time-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-time-widget.html',
  styleUrl: './user-time-widget.scss',
})
export class UserTimeWidgetComponent {
  @Input() isOpen = false;

  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = this.authService.user;
  readonly avatarUrl = computed(() => this.user()?.user_metadata?.['avatar_url'] || null);
  readonly userName = computed(() => this.user()?.user_metadata?.['full_name'] || this.user()?.email || 'Tài khoản');

  readonly currentTime = signal('');
  readonly ampm = signal('');

  constructor() {
    this.updateTime();
    const sub = interval(1000).subscribe(() => this.updateTime());
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private updateTime(): void {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    this.ampm.set(hours >= 12 ? 'PM' : 'AM');
    hours = hours % 12 || 12;
    this.currentTime.set(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
  }
}