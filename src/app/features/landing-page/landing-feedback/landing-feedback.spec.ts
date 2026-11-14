import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FeedbackService,
  FeedbackSubmissionError,
} from '../../../core/services/feedback.service';
import { LandingFeedbackComponent } from './landing-feedback';

describe('LandingFeedbackComponent', () => {
  let component: LandingFeedbackComponent;
  let fixture: ComponentFixture<LandingFeedbackComponent>;
  let rootElement: HTMLElement;
  let submitFeedbackMock: ReturnType<typeof vi.fn>;
  let validateFileMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    submitFeedbackMock = vi.fn();
    validateFileMock = vi.fn((file: File) => {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        throw new FeedbackSubmissionError('VALIDATION_ERROR', 'INVALID_FILE_TYPE');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new FeedbackSubmissionError('VALIDATION_ERROR', 'FILE_TOO_LARGE');
      }
    });

    await TestBed.configureTestingModule({
      imports: [LandingFeedbackComponent],
      providers: [
        provideTranslateService(),
        {
          provide: FeedbackService,
          useValue: {
            submitFeedback: submitFeedbackMock,
            validateScreenshotFile: validateFileMock,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    rootElement = fixture.nativeElement as HTMLElement;
  });

  it('mở panel tinh gọn chuẩn 100% Semantic HTML5 (không div), đủ 5 sao và các trường cốt lõi', () => {
    component.toggleFeedback();
    fixture.detectChanges();

    expect(component.feedbackOpen()).toBe(true);
    expect(rootElement.querySelectorAll('div').length).toBe(0);
    const panelDialog = rootElement.querySelector('section[role="dialog"].feedback-panel');
    expect(panelDialog).not.toBeNull();
    const panelHeader = panelDialog?.querySelector('header');
    expect(panelHeader?.classList.contains('bg-gradient-to-r')).toBe(true);
    expect(panelHeader?.classList.contains('from-blue-600')).toBe(true);
    expect(
      panelHeader?.querySelector('#feedback-panel-title')?.classList.contains('text-white')
    ).toBe(true);

    const starButtons = Array.from(
      rootElement.querySelectorAll<HTMLButtonElement>('button.feedback-star-btn')
    );
    expect(starButtons.length).toBe(5);
    starButtons.forEach((btn) => {
      expect(btn.hasAttribute('title')).toBe(false);
    });

    // Hover sao không gắn class phóng to (scale-110)
    component.hoveredRating.set(5);
    fixture.detectChanges();
    expect(starButtons[4].classList.contains('scale-110')).toBe(false);

    const fullNameInput = rootElement.querySelector<HTMLInputElement>('input#fb-fullname');
    const emailInput = rootElement.querySelector<HTMLInputElement>('input#fb-email');
    const messageTextarea = rootElement.querySelector<HTMLTextAreaElement>('textarea#fb-message');

    expect(fullNameInput).not.toBeNull();
    expect(emailInput).not.toBeNull();
    expect(messageTextarea).not.toBeNull();
    expect(rootElement.querySelector('input#fb-screenshot')).not.toBeNull();

    [fullNameInput, emailInput, messageTextarea].forEach((field) => {
      expect(field?.classList.contains('outline-none')).toBe(true);
      expect(field?.classList.contains('transition-colors')).toBe(true);
      expect(field?.classList.contains('focus:ring-2')).toBe(false);
      expect(field?.classList.contains('transition-all')).toBe(false);
    });

    // Xác nhận bộ đếm ẩn khi chưa nhập và hiện khi nhập
    expect(rootElement.querySelector('output.feedback-counter')).toBeNull();
    component.feedbackForm.controls.message.setValue('Test message content');
    fixture.detectChanges();
    expect(rootElement.querySelector('output.feedback-counter')?.textContent?.trim()).toBe(
      '20 / 500'
    );
  });

  it('khóa nút Gửi khi thiếu điều kiện hoặc toàn khoảng trắng và chỉ bật khi hợp lệ', () => {
    component.toggleFeedback();
    fixture.detectChanges();

    const submitBtn = rootElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submitBtn?.disabled).toBe(true);

    // Chưa đủ điều kiện khi nội dung chỉ gồm khoảng trắng
    component.selectRating(5);
    component.feedbackForm.controls.email.setValue('anh@example.com');
    component.feedbackForm.controls.message.setValue('          ');
    fixture.detectChanges();
    expect(submitBtn?.disabled).toBe(true);

    // Đủ điều kiện thì bật sáng nút Gửi
    component.feedbackForm.controls.message.setValue('Test message content');
    fixture.detectChanges();
    expect(submitBtn?.disabled).toBe(false);

    // Khóa lại nếu phát sinh lỗi chọn tệp ảnh
    component.attachmentErrorKey.set('LANDING_FEEDBACK.ERRORS.INVALID_FILE_TYPE');
    fixture.detectChanges();
    expect(submitBtn?.disabled).toBe(true);
  });

  it('giữ nút gửi ở trạng thái disabled khi thiếu sao, sai email hoặc lỗi validation', async () => {
    component.toggleFeedback();
    fixture.detectChanges();

    const submitBtn = rootElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submitBtn?.disabled).toBe(true);

    await component.onSubmit();
    fixture.detectChanges();

    expect(submitFeedbackMock).not.toHaveBeenCalled();
    expect(component.hasFieldError('rating')).toBe(true);
    expect(component.hasFieldError('email')).toBe(true);
    expect(component.hasFieldError('message')).toBe(true);

    const errors = rootElement.querySelectorAll('p.feedback-error-text[role="alert"]');
    expect(errors.length).toBe(3);
  });

  it('gửi đánh giá 5 sao thành công qua FeedbackService và hiển thị màn hình xác nhận (Happy Path)', async () => {
    submitFeedbackMock.mockResolvedValue({
      feedbackId: 'fb-001',
      ticketCode: 'FB-261115-9A2B',
      screenshotPath: '2026/mock.png',
      adminEmailSent: true,
      userConfirmationSent: true,
      createdAt: '2026-11-15T02:25:00.000Z',
    });

    component.toggleFeedback();
    component.selectRating(5);
    component.feedbackForm.patchValue({
      fullName: 'Nguyen Van A',
      email: 'anh@example.com',
      message: 'Nút kéo thả trên mobile cần thêm độ nhạy khi cuộn.',
    });
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(submitFeedbackMock).toHaveBeenCalledTimes(1);
    expect(submitFeedbackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: 5,
        fullName: 'Nguyen Van A',
        email: 'anh@example.com',
      })
    );
    expect(component.submittedResult()?.ticketCode).toBe('FB-261115-9A2B');
    expect(rootElement.querySelector('section.feedback-success')).not.toBeNull();
    expect(rootElement.querySelector('.feedback-ticket-code')?.textContent?.trim()).toBe(
      'FB-261115-9A2B'
    );
  });

  it('hiển thị thông báo lỗi và giữ nguyên dữ liệu form khi Edge Function trả lỗi mail (Error Path)', async () => {
    submitFeedbackMock.mockRejectedValue(
      new FeedbackSubmissionError(
        'EMAIL_NOT_CONFIGURED',
        'Missing RESEND_API_KEY or FEEDBACK_ADMIN_EMAIL'
      )
    );

    component.toggleFeedback();
    component.selectRating(4);
    component.feedbackForm.patchValue({
      email: 'anh@example.com',
      message: 'Đề xuất hỗ trợ xuất báo cáo PDF hàng tuần cho team.',
    });
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.submittedResult()).toBeNull();
    expect(component.submitErrorKey()).toBe('LANDING_FEEDBACK.ERRORS.EMAIL_NOT_CONFIGURED');

    const errorAlert = rootElement.querySelector('aside.feedback-submit-error[role="alert"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert?.textContent).not.toContain('RESEND_API_KEY');
    expect(errorAlert?.textContent).not.toContain('FEEDBACK_ADMIN_EMAIL');
    expect(errorAlert?.textContent).not.toContain('Missing');
    expect(component.feedbackForm.controls.email.value).toBe('anh@example.com');
  });

  it('xử lý đính kèm ảnh hợp lệ và báo lỗi khi chọn sai định dạng ảnh (Error Path)', () => {
    component.toggleFeedback();
    fixture.detectChanges();

    const invalidFile = new File(['bad'], 'readme.txt', { type: 'text/plain' });
    component.onFileSelected({
      target: { files: [invalidFile], value: 'fake' },
    } as unknown as Event);
    fixture.detectChanges();

    expect(component.attachedFile()).toBeNull();
    expect(component.attachmentErrorKey()).toBe('LANDING_FEEDBACK.ERRORS.INVALID_FILE_TYPE');

    const validImage = new File(['png'], 'capture.png', { type: 'image/png' });
    component.onFileSelected({
      target: { files: [validImage], value: 'fake' },
    } as unknown as Event);
    fixture.detectChanges();

    expect(component.attachmentErrorKey()).toBeNull();
    expect(component.attachedFile()?.name).toBe('capture.png');
    expect(rootElement.querySelector('figure.feedback-attachment-card')).not.toBeNull();

    // Kiểm tra tên ảnh quá dài tự động rút gọn <= 24 ký tự và giữ phần đuôi mở rộng
    const longFileName = '21622415665211_4218277428540274434_29b61513a58f6efb9a.png';
    const longNamedImage = new File(['png'], longFileName, { type: 'image/png' });
    component.onFileSelected({
      target: { files: [longNamedImage], value: 'fake' },
    } as unknown as Event);
    fixture.detectChanges();

    const displayedNameEl = rootElement.querySelector<HTMLElement>('.feedback-attachment-name');
    const displayedName = displayedNameEl?.textContent?.trim() ?? '';
    expect(displayedName.length).toBeLessThanOrEqual(24);
    expect(displayedName.endsWith('.png')).toBe(true);
    expect(displayedNameEl?.getAttribute('title')).toBe(longFileName);
    rootElement.querySelectorAll('fieldset').forEach((fieldset) => {
      expect(fieldset.classList.contains('min-w-0')).toBe(true);
      expect(fieldset.classList.contains('w-full')).toBe(true);
    });

    component.removeScreenshot();
    fixture.detectChanges();
    expect(component.attachedFile()).toBeNull();
  });

  it('đóng panel khi nhấn phím Escape', () => {
    component.toggleFeedback();
    expect(component.feedbackOpen()).toBe(true);

    component.handleEscapeKey();
    expect(component.feedbackOpen()).toBe(false);
  });
});
