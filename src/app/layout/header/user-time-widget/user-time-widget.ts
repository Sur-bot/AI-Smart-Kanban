import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-time-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-time-widget.html'
})
export class UserTimeWidgetComponent implements OnInit, OnDestroy {
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
    hours = hours ? hours : 12; // Đổi 0 thành 12
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    this.currentTime = `${hours}:${minStr}`;
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}