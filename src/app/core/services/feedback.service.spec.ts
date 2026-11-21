import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { FeedbackService, FeedbackSubmissionError } from './feedback.service';
import { CreateFeedbackPayload } from '@features/landing-page/landing-feedback/landing-feedback.types';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;
  const endpoint = `${(environment.apiUrl || 'http://localhost:3000/api').replace(/\/+$/, '')}/feedback`;

  const basePayload: CreateFeedbackPayload = {
    rating: 5,
    fullName: 'Nguyen Van A',
    email: 'user@example.com',
    message: 'Giao dien Kanban rat muot va AI Copilot goi y rat hop ly.',
    screenshotFile: null,
    locale: 'vi',
    pageUrl: 'https://digit24.vercel.app/',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeedbackService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gửi phản hồi kèm ảnh chụp thành công qua Backend REST API POST /api/feedback (Happy Path)', async () => {
    const file = new File(['png-binary'], 'bug-capture.png', { type: 'image/png' });

    const submitPromise = service.submitFeedback({
      ...basePayload,
      screenshotFile: file,
    });

    // Chờ bước đọc base64 từ File hoàn tất trước khi kiểm tra HTTP request
    await new Promise((resolve) => setTimeout(resolve, 10));

    const req = httpMock.expectOne(endpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({
      rating: 5,
      fullName: 'Nguyen Van A',
      email: 'user@example.com',
      locale: 'vi',
      screenshot: {
        mimeType: 'image/png',
        fileName: 'bug-capture.png',
      },
    });
    expect(typeof req.request.body.screenshot.base64).toBe('string');
    expect(req.request.body.screenshot.base64.length).toBeGreaterThan(0);

    req.flush({
      feedbackId: 'fb-uuid-123',
      ticketCode: 'FB-261121-ABCD',
      screenshotPath: '2026/mock-uuid.png',
      adminEmailSent: true,
      userConfirmationSent: true,
      createdAt: '2026-11-21T02:25:00.000Z',
    });

    const result = await submitPromise;
    expect(result.ticketCode).toBe('FB-261121-ABCD');
    expect(result.adminEmailSent).toBe(true);
    expect(result.userConfirmationSent).toBe(true);
  });

  it('từ chối ảnh không đúng định dạng hoặc vượt quá 5MB tại client trước khi gọi API (Validation Error Path)', async () => {
    const invalidFile = new File(['text'], 'notes.txt', { type: 'text/plain' });

    await expect(
      service.submitFeedback({ ...basePayload, screenshotFile: invalidFile })
    ).rejects.toMatchObject({
      name: 'FeedbackSubmissionError',
      code: 'VALIDATION_ERROR',
      message: 'INVALID_FILE_TYPE',
    });

    const oversizedFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.png', {
      type: 'image/png',
    });

    await expect(
      service.submitFeedback({ ...basePayload, screenshotFile: oversizedFile })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'FILE_TOO_LARGE',
    });

    httpMock.expectNone(endpoint);
  });

  it('ánh xạ mã lỗi STORAGE_ERROR khi Backend upload ảnh đính kèm thất bại (Error Path)', async () => {
    const submitPromise = service.submitFeedback(basePayload);

    const req = httpMock.expectOne(endpoint);
    req.flush(
      {
        code: 'STORAGE_ERROR',
        error: 'Bucket feedback-attachments not found',
      },
      { status: 502, statusText: 'Bad Gateway' }
    );

    await expect(submitPromise).rejects.toMatchObject({
      code: 'STORAGE_ERROR',
      message: 'Bucket feedback-attachments not found',
    });
  });

  it('ánh xạ mã lỗi EMAIL_NOT_CONFIGURED khi Backend thiếu RESEND_API_KEY hoặc email admin (Error Path)', async () => {
    const submitPromise = service.submitFeedback(basePayload);

    const req = httpMock.expectOne(endpoint);
    req.flush(
      {
        code: 'EMAIL_NOT_CONFIGURED',
        error: 'Missing RESEND_API_KEY or FEEDBACK_ADMIN_EMAIL',
      },
      { status: 503, statusText: 'Service Unavailable' }
    );

    await expect(submitPromise).rejects.toBeInstanceOf(FeedbackSubmissionError);
  });

  it('ánh xạ FUNCTION_UNAVAILABLE khi không thể kết nối tới Backend API (Network Error Path)', async () => {
    const submitPromise = service.submitFeedback(basePayload);

    const req = httpMock.expectOne(endpoint);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    await expect(submitPromise).rejects.toMatchObject({
      code: 'FUNCTION_UNAVAILABLE',
    });
  });

  it('báo lỗi UNKNOWN_ERROR khi Backend trả về payload rỗng không có feedbackId (Error Path)', async () => {
    const submitPromise = service.submitFeedback(basePayload);

    const req = httpMock.expectOne(endpoint);
    req.flush({});

    await expect(submitPromise).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: 'EMPTY_RESPONSE',
    });
  });
});
