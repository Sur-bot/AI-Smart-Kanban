import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { TranslatePipe } from '@ngx-translate/core';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  isToday: boolean;
}

export interface DatePreset {
  id: string;
  titleKey: string;
  subtitle: string;
  getDate: () => Date;
}

@Component({
  selector: 'app-due-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, OverlayModule, TranslatePipe],
  templateUrl: './due-date-picker.html',
  styleUrls: ['./due-date-picker.scss']
})
export class DueDatePickerComponent implements OnInit, OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() value: string | null | undefined = null;
  @Input() disabled: boolean = false;
  @Input() emptyVariant: 'oval' | 'badge' | 'rectangle' = 'badge';
  @Input() showBadgeIcon: boolean = false;
  @Input() isOverdue: boolean = false;
  @Input() emptyTextKey: string = 'DUE_DATE_PICKER.NO_DUE_DATE';

  @Output() valueChange = new EventEmitter<string | null>();

  currentView: 'calendar' | 'time' | 'month' | 'year' = 'calendar';
  isOpen = false;
  selectedDate: Date | null = null;
  viewDate: Date = new Date();
  selectedTime = '19:00';
  calendarDays: CalendarDay[] = [];
  datePresets: DatePreset[] = [];
  decadeStartYear: number = 2022;

  readonly monthsGrid: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [9, 10, 11]
  ];

  readonly amHoursGrid: number[][] = [
    [12, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11]
  ];

  readonly pmHoursGrid: number[][] = [
    [12, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11]
  ];

  readonly minutesGrid: number[][] = [
    [0, 5],
    [10, 15],
    [20, 25],
    [30, 35],
    [40, 45],
    [50, 55]
  ];

  readonly overlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 6
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -6
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 6
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -6
    }
  ];

  get computedIsOverdue(): boolean {
    if (this.isOverdue) return true;
    if (!this.selectedDate) return false;
    return this.selectedDate.getTime() < Date.now();
  }

  ngOnInit(): void {
    this.initPresets();
    this.syncFromValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.syncFromValue();
    }
  }

  private syncFromValue(): void {
    if (this.value) {
      const d = new Date(this.value);
      if (!isNaN(d.getTime())) {
        this.selectedDate = d;
        this.viewDate = new Date(d);
        this.initDecadeStartYear(d.getFullYear());
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        this.selectedTime = `${h}:${m}`;
        this.generateCalendar();
        return;
      }
    }
    this.selectedDate = null;
    const now = new Date();
    this.viewDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    this.initDecadeStartYear(this.viewDate.getFullYear());
    this.selectedTime = '19:00';
    this.generateCalendar();
  }

  private initDecadeStartYear(year: number): void {
    this.decadeStartYear = year - 4;
  }

  get yearGrid(): number[][] {
    const start = this.decadeStartYear;
    return [
      [start, start + 1, start + 2],
      [start + 3, start + 4, start + 5],
      [start + 6, start + 7, start + 8],
      [start + 9, start + 10, start + 11]
    ];
  }

  private initPresets(): void {
    const now = new Date();
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

    const today = new Date(now);
    const todaySubtitle = `${dayNames[today.getDay()]}, ${today.getDate()} tháng ${today.getMonth() + 1}`;

    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowSubtitle = `${dayNames[tomorrow.getDay()]}, ${tomorrow.getDate()} tháng ${tomorrow.getMonth() + 1}`;

    const dayOfWeek = now.getDay();
    const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const thisWeekend = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToSunday);
    const weekendSubtitle = `${dayNames[thisWeekend.getDay()]}, ${thisWeekend.getDate()} tháng ${thisWeekend.getMonth() + 1}`;

    const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const nextWeekSubtitle = `${dayNames[nextWeek.getDay()]}, ${nextWeek.getDate()} tháng ${nextWeek.getMonth() + 1}`;

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfMonthSubtitle = `${dayNames[endOfMonth.getDay()]}, ${endOfMonth.getDate()} tháng ${endOfMonth.getMonth() + 1}`;

    this.datePresets = [
      {
        id: 'today',
        titleKey: 'DUE_DATE_PICKER.PRESETS.TODAY',
        subtitle: todaySubtitle,
        getDate: () => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0)
      },
      {
        id: 'tomorrow',
        titleKey: 'DUE_DATE_PICKER.PRESETS.TOMORROW',
        subtitle: tomorrowSubtitle,
        getDate: () => new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 19, 0)
      },
      {
        id: 'weekend',
        titleKey: 'DUE_DATE_PICKER.PRESETS.THIS_WEEKEND',
        subtitle: weekendSubtitle,
        getDate: () => new Date(thisWeekend.getFullYear(), thisWeekend.getMonth(), thisWeekend.getDate(), 19, 0)
      },
      {
        id: 'next-week',
        titleKey: 'DUE_DATE_PICKER.PRESETS.IN_A_WEEK',
        subtitle: nextWeekSubtitle,
        getDate: () => new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 19, 0)
      },
      {
        id: 'end-of-month',
        titleKey: 'DUE_DATE_PICKER.PRESETS.END_OF_MONTH',
        subtitle: endOfMonthSubtitle,
        getDate: () => new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate(), 19, 0)
      }
    ];
  }

  generateCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: CalendarDay[] = [];
    const today = new Date();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        date: d,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isWeekend,
        isSelected: this.isSameDay(d, this.selectedDate),
        isToday: this.isSameDay(d, today)
      });
    }

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
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
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

  togglePopover(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.currentView = 'calendar';
      if (this.selectedDate) {
        this.viewDate = new Date(this.selectedDate);
      }
      this.generateCalendar();
    }
  }

  clearDate(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.selectedDate = null;
    this.isOpen = false;
    this.valueChange.emit(null);
    this.cdr.detectChanges();
  }

  selectCalendarDay(day: CalendarDay, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    const newDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), hours || 19, minutes || 0);
    this.selectedDate = newDate;
    this.isOpen = false;
    this.valueChange.emit(newDate.toISOString());
    this.cdr.detectChanges();
  }

  selectPreset(preset: DatePreset, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    const date = preset.getDate();
    this.selectedDate = date;
    this.isOpen = false;
    this.valueChange.emit(date.toISOString());
    this.cdr.detectChanges();
  }

  switchToMonthView(event: Event): void {
    event.stopPropagation();
    this.currentView = 'month';
  }

  switchToYearView(event: Event): void {
    event.stopPropagation();
    this.initDecadeStartYear(this.viewDate.getFullYear());
    this.currentView = 'year';
  }

  prevYear(event: Event): void {
    event.stopPropagation();
    this.viewDate = new Date(this.viewDate.getFullYear() - 1, this.viewDate.getMonth(), 1);
  }

  nextYear(event: Event): void {
    event.stopPropagation();
    this.viewDate = new Date(this.viewDate.getFullYear() + 1, this.viewDate.getMonth(), 1);
  }

  prevDecade(event: Event): void {
    event.stopPropagation();
    this.decadeStartYear -= 12;
  }

  nextDecade(event: Event): void {
    event.stopPropagation();
    this.decadeStartYear += 12;
  }

  selectMonth(monthIndex: number, event: Event): void {
    event.stopPropagation();
    const day = Math.min(this.selectedDate?.getDate() || this.viewDate.getDate() || 1, new Date(this.viewDate.getFullYear(), monthIndex + 1, 0).getDate());
    this.viewDate = new Date(this.viewDate.getFullYear(), monthIndex, day);
    this.generateCalendar();
    this.currentView = 'calendar';
    this.cdr.detectChanges();
  }

  selectYear(year: number, event: Event): void {
    event.stopPropagation();
    const month = this.viewDate.getMonth();
    const day = Math.min(this.selectedDate?.getDate() || this.viewDate.getDate() || 1, new Date(year, month + 1, 0).getDate());
    this.viewDate = new Date(year, month, day);
    this.generateCalendar();
    this.currentView = 'calendar';
    this.cdr.detectChanges();
  }

  isSelectedMonth(m: number): boolean {
    return this.viewDate.getMonth() === m;
  }

  isCurrentMonthToday(m: number): boolean {
    const now = new Date();
    return now.getMonth() === m && now.getFullYear() === this.viewDate.getFullYear();
  }

  isSelectedYear(y: number): boolean {
    return this.viewDate.getFullYear() === y;
  }

  isCurrentYearToday(y: number): boolean {
    const now = new Date();
    return now.getFullYear() === y;
  }

  switchToTimeView(event: Event): void {
    event.stopPropagation();
    this.currentView = 'time';
  }

  switchToCalendarView(event: Event): void {
    event.stopPropagation();
    this.currentView = 'calendar';
    this.generateCalendar();
  }

  selectHour(hour12: number, period: 'am' | 'pm', event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    let h = hour12;
    if (period === 'am') {
      h = hour12 === 12 ? 0 : hour12;
    } else {
      h = hour12 === 12 ? 12 : hour12 + 12;
    }
    const currentMinutes = this.selectedDate ? this.selectedDate.getMinutes() : 0;
    const baseDate = this.selectedDate || new Date();
    const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h, currentMinutes);
    this.selectedDate = newDate;
    this.selectedTime = `${h.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    this.valueChange.emit(newDate.toISOString());
    this.cdr.detectChanges();
  }

  selectMinute(minute: number, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    const currentHours = this.selectedDate ? this.selectedDate.getHours() : 19;
    const baseDate = this.selectedDate || new Date();
    const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), currentHours, minute);
    this.selectedDate = newDate;
    this.selectedTime = `${currentHours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.valueChange.emit(newDate.toISOString());
    this.cdr.detectChanges();
  }

  isHourSelected(hour12: number, period: 'am' | 'pm'): boolean {
    if (!this.selectedDate) return false;
    const h = this.selectedDate.getHours();
    if (period === 'am') {
      if (h >= 12) return false;
      const current12 = h === 0 ? 12 : h;
      return current12 === hour12;
    } else {
      if (h < 12) return false;
      const current12 = h === 12 ? 12 : h - 12;
      return current12 === hour12;
    }
  }

  isMinuteSelected(minute: number): boolean {
    if (!this.selectedDate) return false;
    return this.selectedDate.getMinutes() === minute;
  }

  get formattedFullDateTimeHeader(): string {
    const d = this.selectedDate || new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours.toString().padStart(2, '0');
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  }

  get formattedDisplay(): string {
    if (!this.selectedDate) return '';
    const day = this.selectedDate.getDate();
    const month = this.selectedDate.getMonth() + 1;
    let hours = this.selectedDate.getHours();
    const minutes = this.selectedDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} Thg ${month}, ${hours}:${minutes} ${ampm}`;
  }

  get formattedTimeDisplay(): string {
    const [hoursStr, minutesStr] = this.selectedTime.split(':');
    let hours = Number(hoursStr) || 19;
    const minutes = Number(minutesStr) || 0;
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.cdr.detectChanges();
    }
  }
}
