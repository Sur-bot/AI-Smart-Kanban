import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TaskStore } from '../../../core/state/task.store';
import { AuthService } from '../../../core/auth/auth.service';
import { CreateTaskPayload } from '../../../core/models/task.model';
import { TranslatePipe } from '@ngx-translate/core';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean; // T7 hoặc CN
  isSelected: boolean;
  isToday: boolean;
}

export interface DatePreset {
  id: string;
  title: string;
  subtitle: string;
  getDate: () => Date;
}

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule],
  templateUrl: './create-task-modal.html',
  styleUrls: ['./create-task-modal.scss'],
})
export class CreateTaskModalComponent implements OnInit {
  /** Trạng thái hiển thị modal */
  @Input() isOpen = false;

  /** Phát ra khi người dùng đóng modal */
  @Output() close = new EventEmitter<void>();

  /** Phát ra khi bấm "Biểu mẫu chi tiết" */
  @Output() openDetail = new EventEmitter<Partial<CreateTaskPayload>>();

  private readonly fb = inject(FormBuilder);
  readonly taskStore = inject(TaskStore);
  private readonly authService = inject(AuthService);

  form!: FormGroup;
  isSubmitting = false;
  isHighPriority = false;

  // ─── Assignee State ──────────────────────────────
  assigneeName = 'Văn Anh Nguyễn';
  assigneeAvatar: string | null = null;
  assigneeId: string | null = null;
  isAssigneeDropdownOpen = false;
  searchMemberQuery = '';

  // ─── DatePicker State ────────────────────────────
  isDatePickerOpen = false;
  selectedDate: Date | null = null;
  viewDate: Date = new Date();
  selectedTime = '19:00'; // 7:00 pm
  calendarDays: CalendarDay[] = [];
  datePresets: DatePreset[] = [];

  ngOnInit(): void {
    this.initAssignee();
    this.initDefaultDate();
    this.initPresets();
    this.generateCalendar();

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(500)]],
      description: [''],
      assigneeId: [this.assigneeId],
      dueDate: [this.selectedDate ? this.selectedDate.toISOString() : null],
      projectId: [this.taskStore.currentProjectId() || null],
      priority: ['none'],
    });
  }

  private initAssignee(): void {
    const user = this.authService.user();
    if (user) {
      const meta = user.user_metadata || {};
      this.assigneeName = meta['full_name'] || meta['name'] || user.email?.split('@')[0] || 'Văn Anh Nguyễn';
      this.assigneeAvatar = meta['avatar_url'] || null;
      this.assigneeId = user.id;
    } else {
      this.assigneeName = 'Văn Anh Nguyễn';
      this.assigneeId = 'current-user';
    }
  }

  private initDefaultDate(): void {
    // Mặc định chọn ngày 7 tháng 9 7:00 pm hoặc + 7 ngày
    const now = new Date();
    const defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 19, 0, 0);
    this.selectedDate = defaultDate;
    this.viewDate = new Date(defaultDate);
  }

  private initPresets(): void {
    const now = new Date();
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

    // 1. Hôm nay
    const today = new Date(now);
    const todaySubtitle = `${dayNames[today.getDay()]}, ${today.getDate()} tháng ${today.getMonth() + 1}`;

    // 2. Ngày mai
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowSubtitle = `${dayNames[tomorrow.getDay()]}, ${tomorrow.getDate()} tháng ${tomorrow.getMonth() + 1}`;

    // 3. Cuối tuần này (Chủ nhật tuần này)
    const dayOfWeek = now.getDay();
    const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const thisWeekend = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToSunday);
    const weekendSubtitle = `${dayNames[thisWeekend.getDay()]}, ${thisWeekend.getDate()} tháng ${thisWeekend.getMonth() + 1}`;

    // 4. Trong một tuần (+7 ngày)
    const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const nextWeekSubtitle = `${dayNames[nextWeek.getDay()]}, ${nextWeek.getDate()} tháng ${nextWeek.getMonth() + 1}`;

    // 5. Cuối tháng này
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfMonthSubtitle = `${dayNames[endOfMonth.getDay()]}, ${endOfMonth.getDate()} tháng ${endOfMonth.getMonth() + 1}`;

    this.datePresets = [
      {
        id: 'today',
        title: 'Hôm nay',
        subtitle: todaySubtitle,
        getDate: () => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0)
      },
      {
        id: 'tomorrow',
        title: 'Ngày mai',
        subtitle: tomorrowSubtitle,
        getDate: () => new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 19, 0)
      },
      {
        id: 'weekend',
        title: 'Cuối tuần này',
        subtitle: weekendSubtitle,
        getDate: () => new Date(thisWeekend.getFullYear(), thisWeekend.getMonth(), thisWeekend.getDate(), 19, 0)
      },
      {
        id: 'next-week',
        title: 'Trong một tuần',
        subtitle: nextWeekSubtitle,
        getDate: () => new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 19, 0)
      },
      {
        id: 'end-of-month',
        title: 'Cuối tháng này',
        subtitle: endOfMonthSubtitle,
        getDate: () => new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate(), 19, 0)
      }
    ];
  }

  // ─── Calendar Generation ─────────────────────────
  generateCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Thứ của ngày đầu tháng: 0 = CN, 1 = T2 => đổi sang Monday = 0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: CalendarDay[] = [];
    const today = new Date();

    // Các ngày cuối tháng trước
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isWeekend,
        isSelected: this.isSameDay(d, this.selectedDate),
        isToday: this.isSameDay(d, today)
      });
    }

    // Các ngày tháng hiện tại
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isWeekend,
        isSelected: this.isSameDay(d, this.selectedDate),
        isToday: this.isSameDay(d, today)
      });
    }

    // Các ngày đầu tháng sau cho đủ bội số của 7
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isWeekend,
        isSelected: this.isSameDay(d, this.selectedDate),
        isToday: this.isSameDay(d, today)
      });
    }

    this.calendarDays = days;
  }

  isSameDay(d1: Date | null, d2: Date | null): boolean {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  prevMonth(event: Event): void {
    event.stopPropagation();
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(event: Event): void {
    event.stopPropagation();
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectCalendarDay(day: CalendarDay, event: Event): void {
    event.stopPropagation();
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    const newDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), hours || 19, minutes || 0);
    this.selectedDate = newDate;
    this.form.patchValue({ dueDate: newDate.toISOString() });
    this.generateCalendar();
    this.isDatePickerOpen = false;
  }

  selectPreset(preset: DatePreset, event: Event): void {
    event.stopPropagation();
    const date = preset.getDate();
    this.selectedDate = date;
    this.viewDate = new Date(date);
    this.form.patchValue({ dueDate: date.toISOString() });
    this.generateCalendar();
    this.isDatePickerOpen = false;
  }

  onTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedTime = target.value || '19:00';
    if (this.selectedDate) {
      const [hours, minutes] = this.selectedTime.split(':').map(Number);
      this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate(), hours, minutes);
      this.form.patchValue({ dueDate: this.selectedDate.toISOString() });
    }
  }

  toggleAssigneeDropdown(event: Event): void {
    event.stopPropagation();
    this.isAssigneeDropdownOpen = !this.isAssigneeDropdownOpen;
    if (this.isAssigneeDropdownOpen) {
      this.isDatePickerOpen = false;
    }
  }

  selectMember(name: string, id: string, event: Event): void {
    event.stopPropagation();
    this.assigneeName = name;
    this.assigneeId = id;
    this.form.patchValue({ assigneeId: id });
    this.isAssigneeDropdownOpen = false;
  }

  clearAssignee(event: Event): void {
    event.stopPropagation();
    this.assigneeName = '';
    this.assigneeId = null;
    this.form.patchValue({ assigneeId: null });
  }

  toggleDatePicker(event: Event): void {
    event.stopPropagation();
    this.isDatePickerOpen = !this.isDatePickerOpen;
    if (this.isDatePickerOpen) {
      this.isAssigneeDropdownOpen = false;
      if (this.selectedDate) {
        this.viewDate = new Date(this.selectedDate);
        this.generateCalendar();
      }
    }
  }

  clearDueDate(event: Event): void {
    event.stopPropagation();
    this.selectedDate = null;
    this.form.patchValue({ dueDate: null });
    this.isDatePickerOpen = false;
  }

  get formattedDueDate(): string {
    if (!this.selectedDate) return 'Không có hạn chót';
    const day = this.selectedDate.getDate();
    const month = this.selectedDate.getMonth() + 1;
    let hours = this.selectedDate.getHours();
    const minutes = this.selectedDate.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const timeFormatted = `${hours}:${strMinutes} ${ampm}`;
    return `${day} tháng ${month} ${timeFormatted}`;
  }

  get formattedTimeDisplay(): string {
    const [hoursStr, minutesStr] = this.selectedTime.split(':');
    let hours = Number(hoursStr) || 19;
    const minutes = Number(minutesStr) || 0;
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  }

  toggleHighPriority(): void {
    this.isHighPriority = !this.isHighPriority;
    this.form.patchValue({ priority: this.isHighPriority ? 'high' : 'none' });
  }

  onDetailClick(event: Event): void {
    event.preventDefault();
    const values = this.form.value;
    this.openDetail.emit({
      title: values.title?.trim() || '',
      description: values.description?.trim() || '',
      assigneeId: this.assigneeId || undefined,
      dueDate: this.selectedDate ? this.selectedDate.toISOString() : undefined,
      priority: this.isHighPriority ? 'high' : 'none',
      projectId: this.taskStore.currentProjectId() || undefined,
    });
    this.onClose();
  }

  onDialogContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Neu click khong nam trong datepicker-popover hoac nut mo datepicker
    if (!target.closest('.datepicker-popover') && !target.closest('.due-date-container')) {
      this.isDatePickerOpen = false;
    }
    // Neu click khong nam trong assignee-popover hoac assignee-wrapper
    if (!target.closest('.assignee-popover') && !target.closest('.assignee-wrapper')) {
      this.isAssigneeDropdownOpen = false;
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isDatePickerOpen = false;
    this.isAssigneeDropdownOpen = false;
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isDatePickerOpen || this.isAssigneeDropdownOpen) {
      this.isDatePickerOpen = false;
      this.isAssigneeDropdownOpen = false;
      return;
    }
    if (this.isOpen) this.onClose();
  }

  onClose(): void {
    this.form.reset();
    this.isSubmitting = false;
    this.isDatePickerOpen = false;
    this.isAssigneeDropdownOpen = false;
    this.isHighPriority = false;
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    const values = this.form.value;
    const payload: CreateTaskPayload = {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      assigneeId: this.assigneeId || undefined,
      dueDate: this.selectedDate ? this.selectedDate.toISOString() : undefined,
      projectId: this.taskStore.currentProjectId() || undefined,
      priority: this.isHighPriority ? 'high' : 'none',
    };
    this.taskStore.createTask(payload, () => {
      this.onClose();
    });
    setTimeout(() => { this.isSubmitting = false; }, 1500);
  }
}