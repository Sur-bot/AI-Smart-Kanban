import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/auth/auth.service';
import { FeedbackService, FeedbackSubmissionError } from './feedback.service';
import { CreateFeedbackPayload } from '@features/landing-page/landing-feedback/landing-feedback.types';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let uploadMock: ReturnType<typeof vi.fn>;
  let invokeMock: ReturnType<typeof vi.fn>;

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
    uploadMock = vi.fn();
    invokeMock = vi.fn();

    const mockSupabaseClient = {
      storage: {
        from: vi.fn().mockReturnValue({
          upload: uploadMock,
        }),
      },
      functions: {
        invoke: invokeMock,
      },
    };

    TestBed.configureTestingModule({
      providers: [
        FeedbackService,
        {
          provide: AuthService,
          useValue: {
            getClient: () => mockSupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(FeedbackService);
  });

  it('gửi phản hồi kèm ảnh chụp thành công lên Storage và Edge Function (Happy Path)', async () => {
    const file = new File(['png-binary'], 'bug-capture.png', { type: 'image/png' });
    uploadMock.mockResolvedValue({ data: { path: '2026/mock-uuid.png' }, error: null });
    invokeMock.mockResolvedValue({
      data: {
        feedbackId: 'fb-uuid-123',
        ticketCode: 'FB-261115-ABCD',
        screenshotPath: '2026/mock-uuid.png',
        adminEmailSent: true,
        userConfirmationSent: true,
        createdAt: '2026-11-15T02:25:00.000Z',
      },
      error: null,
    });

    const result = await service.submitFeedback({
      ...basePayload,
      screenshotFile: file,
    });

    expect(uploadMock).toHaveBeenCalledTimes(1);
    expect(invokeMock).toHaveBeenCalledWith('submit-feedback', {
      body: expect.objectContaining({
        rating: 5,
        fullName: 'Nguyen Van A',
        email: 'user@example.com',
        locale: 'vi',
      }),
    });
    expect(result.ticketCode).toBe('FB-261115-ABCD');
    expect(result.adminEmailSent).toBe(true);
    expect(result.userConfirmationSent).toBe(true);
  });

  it('từ chối ảnh không đúng định dạng ngay tại client trước khi gọi mạng (Validation Error Path)', async () => {
    const invalidFile = new File(['text'], 'notes.txt', { type: 'text/plain' });

    await expect(
      service.submitFeedback({ ...basePayload, screenshotFile: invalidFile })
    ).rejects.toMatchObject({
      name: 'FeedbackSubmissionError',
      code: 'VALIDATION_ERROR',
      message: 'INVALID_FILE_TYPE',
    });

    expect(uploadMock).not.toHaveBeenCalled();
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('báo lỗi STORAGE_ERROR và dừng flow nếu upload ảnh thất bại (Error Path)', async () => {
    const file = new File(['png-binary'], 'bug-capture.png', { type: 'image/png' });
    uploadMock.mockResolvedValue({
      data: null,
      error: { message: 'Bucket feedback-attachments not found' },
    });

    await expect(
      service.submitFeedback({ ...basePayload, screenshotFile: file })
    ).rejects.toMatchObject({
      code: 'STORAGE_ERROR',
      message: 'Bucket feedback-attachments not found',
    });

    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('ánh xạ mã lỗi EMAIL_NOT_CONFIGURED khi Edge Function thiếu RESEND_API_KEY hoặc email admin (Error Path)', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        name: 'FunctionsHttpError',
        message: 'Edge Function returned a non-2xx status code',
        context: {
          json: async () => ({
            code: 'EMAIL_NOT_CONFIGURED',
            error: 'Missing RESEND_API_KEY or FEEDBACK_ADMIN_EMAIL',
          }),
        },
      },
    });

    await expect(service.submitFeedback(basePayload)).rejects.toBeInstanceOf(
      FeedbackSubmissionError
    );
    await expect(service.submitFeedback(basePayload)).rejects.toMatchObject({
      code: 'EMAIL_NOT_CONFIGURED',
    });
  });

  it('ánh xạ FUNCTION_UNAVAILABLE khi chưa deploy Edge Function hoặc lỗi mạng (Error Path)', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        name: 'FunctionsFetchError',
        message: 'Failed to send a request to the Edge Function',
      },
    });

    await expect(service.submitFeedback(basePayload)).rejects.toMatchObject({
      code: 'FUNCTION_UNAVAILABLE',
    });
  });
});
