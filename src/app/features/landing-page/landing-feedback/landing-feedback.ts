import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing-feedback',
  imports: [MatIconModule],
  templateUrl: './landing-feedback.html',
  styleUrl: './landing-feedback.scss'
})
export class LandingFeedbackComponent {
  /** Trạng thái mở/đóng khung phản hồi */
  feedbackOpen = signal(false);

  toggleFeedback(): void {
    this.feedbackOpen.update(v => !v);
  }

  closeFeedback(): void {
    this.feedbackOpen.set(false);
    this.isTypeDropdownOpen.set(false);
  }

  /** Custom Dropdown cho Loại phản hồi */
  readonly feedbackTypes = [
    { value: 'suggestion', label: 'Góp ý cải tiến', icon: 'lightbulb' },
    { value: 'bug', label: 'Báo lỗi', icon: 'bug_report' },
    { value: 'compliment', label: 'Khen ngợi', icon: 'star' },
    { value: 'question', label: 'Câu hỏi', icon: 'help_outline' },
    { value: 'other', label: 'Khác', icon: 'article' },
  ];

  selectedFeedbackType = signal(this.feedbackTypes[0]);
  isTypeDropdownOpen = signal(false);

  toggleTypeDropdown(): void {
    this.isTypeDropdownOpen.update(v => !v);
  }

  selectFeedbackType(type: any): void {
    this.selectedFeedbackType.set(type);
    this.isTypeDropdownOpen.set(false);
  }
}
