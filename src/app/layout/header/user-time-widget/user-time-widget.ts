import { Component, OnInit, OnDestroy, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-time-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-time-widget.html',
  styleUrl: './user-time-widget.scss'
})
export class UserTimeWidgetComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;

  private authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly avatarUrl = computed(() => this.user()?.user_metadata?.['avatar_url'] || null);
  readonly userName = computed(() => this.user()?.user_metadata?.['full_name'] || this.user()?.email || 'Tài khoản');

  currentTime: string = '';
  ampm: string = '';
  private timer: any;

  ngOnInit() {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 60000);
  }

  updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    this.ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    this.currentTime = `${hours}:${minStr}`;
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}