import {
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  FeedbackService,
  FeedbackSubmissionError,
} from '../../../core/services/feedback.service';
import {
  FEEDBACK_ATTACHMENT_NAME_MAX_DISPLAY,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_MESSAGE_MIN_LENGTH,
  FEEDBACK_RATING_OPTIONS,
} from './landing-feedback.data';
import {
  FeedbackRating,
  FeedbackSubmissionResult,
} from './landing-feedback.types';

interface SubmittedFeedbackSummary {
  rating: FeedbackRating;
  email: string;
}

@Component({
  selector: 'app-landing-feedback',
  imports: [MatIconModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './landing-feedback.html',
  styleUrl: './landing-feedback.scss',
})
export class LandingFeedbackComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly feedbackService = inject(FeedbackService);

  readonly ratingOptions = FEEDBACK_RATING_OPTIONS;
  readonly messageMinLength = FEEDBACK_MESSAGE_MIN_LENGTH;
  readonly messageMaxLength = FEEDBACK_MESSAGE_MAX_LENGTH;

  readonly suppressed = input<boolean>(false);

  /** Trạng thái đóng/mở panel phản hồi */
  readonly feedbackOpen = signal(false);

  /** Form Reactive tối giản với validation thực cho từng trường */
  readonly feedbackForm = this.fb.group({
    rating: this.fb.control<FeedbackRating | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    fullName: this.fb.control('', [Validators.maxLength(80)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    message: this.fb.control('', [
      Validators.required,
      Validators.minLength(FEEDBACK_MESSAGE_MIN_LENGTH),
      Validators.maxLength(FEEDBACK_MESSAGE_MAX_LENGTH),
    ]),
  });

  readonly selectedRating = signal<FeedbackRating | null>(null);
  readonly hoveredRating = signal<FeedbackRating | null>(null);
  readonly messageLength = signal(0);

  /** Điểm sao hiển thị theo ưu tiên hover trước, rồi đến sao đã chọn */
  readonly activeRatingDisplay = computed<FeedbackRating | null>(
    () => this.hoveredRating() ?? this.selectedRating()
  );

  /** Tệp ảnh chụp đính kèm */
  readonly attachedFile = signal<File | null>(null);
  readonly attachmentPreviewUrl = signal<string | null>(null);
  readonly attachmentErrorKey = signal<string | null>(null);

  /** Trạng thái gửi thật lên hệ thống */
  readonly isSubmitting = signal(false);
  readonly isFormValid = signal(false);
  readonly submitErrorKey = signal<string | null>(null);
  readonly submittedResult = signal<FeedbackSubmissionResult | null>(null);
  readonly submittedSummary = signal<SubmittedFeedbackSummary | null>(null);

  /** Chỉ cho phép bấm Gửi khi tất cả trường bắt buộc hợp lệ và không có lỗi đính kèm ảnh */
  readonly isSubmitDisabled = computed(
    () =>
      this.isSubmitting() ||
      !this.isFormValid() ||
      this.attachmentErrorKey() !== null
  );

  constructor() {
    effect(() => {
      if (this.suppressed() && this.feedbackOpen()) {
        this.closeFeedback();
      }
    });

    this.feedbackForm.controls.message.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.messageLength.set(value.length);
      });

    this.feedbackForm.controls.rating.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.selectedRating.set(value);
      });

    this.feedbackForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncFormValidity();
      });
    this.syncFormValidity();

    this.destroyRef.onDestroy(() => {
      this.revokePreviewUrl();
    });
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.feedbackOpen()) {
      this.closeFeedback();
    }
  }

  toggleFeedback(): void {
    if (this.feedbackOpen()) {
      this.closeFeedback();
      return;
    }
    this.feedbackOpen.set(true);
  }

  closeFeedback(): void {
    this.hoveredRating.set(null);
    this.feedbackOpen.set(false);
  }

  selectRating(score: FeedbackRating): void {
    const control = this.feedbackForm.controls.rating;
    control.setValue(score);
    control.markAsTouched();
    this.selectedRating.set(score);
  }

  isStarActive(score: FeedbackRating): boolean {
    const active = this.activeRatingDisplay();
    return active !== null && score <= active;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    if (!file) {
      return;
    }

    this.attachmentErrorKey.set(null);

    try {
      this.feedbackService.validateScreenshotFile(file);
    } catch (error) {
      if (error instanceof FeedbackSubmissionError) {
        this.attachmentErrorKey.set(`LANDING_FEEDBACK.ERRORS.${error.message}`);
      } else {
        this.attachmentErrorKey.set('LANDING_FEEDBACK.ERRORS.INVALID_FILE_TYPE');
      }
      if (input) {
        input.value = '';
      }
      return;
    }

    this.revokePreviewUrl();
    this.attachedFile.set(file);
    if (typeof URL.createObjectURL === 'function') {
      this.attachmentPreviewUrl.set(URL.createObjectURL(file));
    }

    if (input) {
      input.value = '';
    }
  }

  removeScreenshot(): void {
    this.revokePreviewUrl();
    this.attachedFile.set(null);
    this.attachmentErrorKey.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Rút gọn tên file ảnh vượt quá ngưỡng hiển thị (giữ phần đầu + đuôi mở rộng)
   * để tránh xé rộng bố cục panel khi tên ảnh tải về quá dài.
   */
  formatAttachmentName(fileName: string): string {
    const trimmed = fileName.trim();
    const maxLen = FEEDBACK_ATTACHMENT_NAME_MAX_DISPLAY;
    if (trimmed.length <= maxLen) {
      return trimmed;
    }

    const dotIndex = trimmed.lastIndexOf('.');
    const hasValidExt = dotIndex > 0 && trimmed.length - dotIndex <= 6;
    const ext = hasValidExt ? trimmed.slice(dotIndex) : '';
    const stem = hasValidExt ? trimmed.slice(0, dotIndex) : trimmed;

    const ellipsis = '...';
    const tailLength = hasValidExt ? 4 : 6;
    const headLength = Math.max(4, maxLen - ellipsis.length - tailLength - ext.length);

    return `${stem.slice(0, headLength)}${ellipsis}${stem.slice(-tailLength)}${ext}`;
  }

  hasFieldError(controlName: 'rating' | 'email' | 'message'): boolean {
    const control = this.feedbackForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.feedbackForm.markAllAsTouched();
    this.syncFormValidity();
    if (!this.isFormValid() || this.attachmentErrorKey() !== null) {
      return;
    }

    const raw = this.feedbackForm.getRawValue();
    if (!raw.rating) {
      return;
    }

    this.submitErrorKey.set(null);
    this.isSubmitting.set(true);

    try {
      const result = await this.feedbackService.submitFeedback({
        rating: raw.rating,
        fullName: raw.fullName,
        email: raw.email,
        message: raw.message,
        screenshotFile: this.attachedFile(),
        locale: this.resolveCurrentLocale(),
        pageUrl: typeof window !== 'undefined' ? window.location.href : '/',
      });

      this.submittedSummary.set({
        rating: raw.rating,
        email: raw.email.trim(),
      });
      this.submittedResult.set(result);
      this.resetFormFields();
    } catch (error) {
      if (error instanceof FeedbackSubmissionError) {
        this.submitErrorKey.set(`LANDING_FEEDBACK.ERRORS.${error.code}`);
      } else {
        this.submitErrorKey.set('LANDING_FEEDBACK.ERRORS.UNKNOWN_ERROR');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  startNewFeedback(): void {
    this.submittedResult.set(null);
    this.submittedSummary.set(null);
    this.submitErrorKey.set(null);
    this.resetFormFields();
  }

  private resetFormFields(): void {
    this.feedbackForm.reset({
      rating: null,
      fullName: '',
      email: '',
      message: '',
    });
    this.selectedRating.set(null);
    this.hoveredRating.set(null);
    this.messageLength.set(0);
    this.removeScreenshot();
    this.syncFormValidity();
  }

  private syncFormValidity(): void {
    const trimmedMessageLength = this.feedbackForm.controls.message.value.trim().length;
    const valid =
      this.feedbackForm.valid &&
      trimmedMessageLength >= FEEDBACK_MESSAGE_MIN_LENGTH &&
      trimmedMessageLength <= FEEDBACK_MESSAGE_MAX_LENGTH;
    this.isFormValid.set(valid);
  }

  private resolveCurrentLocale(): string {
    const current = this.translate.currentLang;
    if (typeof current === 'function') {
      return current() || 'vi';
    }
    return 'vi';
  }

  private revokePreviewUrl(): void {
    const currentUrl = this.attachmentPreviewUrl();
    if (currentUrl && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(currentUrl);
    }
    this.attachmentPreviewUrl.set(null);
  }
}
