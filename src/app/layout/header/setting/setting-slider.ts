import { Component, HostListener, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-setting-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setting-slider.html',
  styleUrl: './setting-slider.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        // Bắt đầu mờ tịt và tụt xuống 50px
        style({ opacity: 0, transform: 'translateY(50px)' }),

        // Trượt lên vị trí gốc (0px) mượt mà trong 0.3s
        animate(
          '300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          }),
        ),
      ]),
      transition(':leave', [
        // Tụt ngược xuống 50px và mờ đi khi đóng
        animate(
          '200ms ease-in',
          style({
            opacity: 0,
            transform: 'translateY(50px)',
          }),
        ),
      ]),
    ]),
  ],
})
export class SettingSliderComponent {
  @Input() isOpen = false; // Nhận trạng thái từ Header
  @Output() close = new EventEmitter<void>();

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // Chỉ xử lý đóng khi popup đang mở
    if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }
}
