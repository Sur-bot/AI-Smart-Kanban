import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expandable-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expandable-search.html',
  styleUrls: ['./expandable-search.scss']
})
export class SearchComponent {
  // Signal quản lý trạng thái đóng/mở
  isExpanded = signal(false);

  // Lấy reference của thẻ input để tự động focus
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  toggleSearch() {
    this.isExpanded.update(val => !val);
    
    // Nếu mở rộng, đợi một chút cho animation chạy rồi focus vào input
    if (this.isExpanded()) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 300); // 300ms khớp với thời gian transition trong CSS
    }
  }
}