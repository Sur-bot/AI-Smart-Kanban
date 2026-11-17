import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';
import {
  FEEDBACK_ALLOWED_IMAGE_TYPES,
  FEEDBACK_MAX_FILE_SIZE_BYTES,
} from '../../features/landing-page/landing-feedback/landing-feedback.data';
import {
  CreateFeedbackPayload,
  FeedbackErrorCode,
  FeedbackSubmissionResult,
} from '../../features/landing-page/landing-feedback/landing-feedback.types';

/**
 * Lỗi có cấu trúc khi gửi phản hồi qua Supabase Storage / Edge Function.
 */
export class FeedbackSubmissionError extends Error {
  constructor(
    public readonly code: FeedbackErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'FeedbackSubmissionError';
  }
}

interface EdgeFunctionErrorBody {
  code?: FeedbackErrorCode;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly authService = inject(AuthService);
  private readonly bucketName = 'feedback-attachments';
  private readonly edgeFunctionName = 'submit-feedback';

  private get supabase(): SupabaseClient {
    return this.authService.getClient();
  }

  /**
   * Kiểm tra file ảnh chụp đính kèm trước khi tạo preview và upload lên Supabase Storage.
   */
  validateScreenshotFile(file: File): void {
    if (!FEEDBACK_ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new FeedbackSubmissionError('VALIDATION_ERROR', 'INVALID_FILE_TYPE');
    }

    if (file.size > FEEDBACK_MAX_FILE_SIZE_BYTES) {
      throw new FeedbackSubmissionError('VALIDATION_ERROR', 'FILE_TOO_LARGE');
    }
  }

  /**
   * Thực thi flow thật: (1) upload ảnh chụp lên Supabase Storage (nếu có),
   * (2) gọi Supabase Edge Function `submit-feedback` để ghi bảng `public.feedbacks`
   * và gửi đồng thời email báo cáo cho admin + email xác nhận cho người dùng.
   */
  async submitFeedback(payload: CreateFeedbackPayload): Promise<FeedbackSubmissionResult> {
    let screenshotPath: string | null = null;

    if (payload.screenshotFile) {
      this.validateScreenshotFile(payload.screenshotFile);
      screenshotPath = await this.uploadScreenshot(payload.screenshotFile);
    }

    const { data, error } = await this.supabase.functions.invoke<FeedbackSubmissionResult>(
      this.edgeFunctionName,
      {
        body: {
          rating: payload.rating,
          fullName: payload.fullName.trim(),
          email: payload.email.trim(),
          message: payload.message.trim(),
          screenshotPath,
          locale: payload.locale,
          pageUrl: payload.pageUrl,
        },
      }
    );

    if (error) {
      throw await this.mapFunctionError(error);
    }

    if (!data || !data.feedbackId) {
      throw new FeedbackSubmissionError('UNKNOWN_ERROR', 'EMPTY_RESPONSE');
    }

    return {
      ...data,
      screenshotPath: data.screenshotPath ?? screenshotPath,
    };
  }

  private async uploadScreenshot(file: File): Promise<string> {
    const ext = this.resolveFileExtension(file);
    const year = new Date().getUTCFullYear();
    const storagePath = `${year}/${crypto.randomUUID()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn('[FeedbackService] Screenshot upload error:', error.message);
      throw new FeedbackSubmissionError(
        'STORAGE_ERROR',
        error.message || 'SCREENSHOT_UPLOAD_FAILED'
      );
    }

    return storagePath;
  }

  private resolveFileExtension(file: File): string {
    const mimeExtensionMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
    };
    return mimeExtensionMap[file.type] ?? 'png';
  }

  private async mapFunctionError(error: unknown): Promise<FeedbackSubmissionError> {
    const errRecord = error as { name?: string; message?: string; context?: unknown };
    const parsedBody = await this.extractErrorBody(errRecord.context);

    if (parsedBody?.code) {
      console.warn('[FeedbackService] Backend error:', parsedBody.code, parsedBody.error || errRecord.message);
      return new FeedbackSubmissionError(
        parsedBody.code,
        parsedBody.error || errRecord.message || parsedBody.code
      );
    }

    if (
      errRecord.name === 'FunctionsFetchError' ||
      errRecord.name === 'FunctionsRelayError'
    ) {
      console.warn('[FeedbackService] Edge Function unreachable:', errRecord.message);
      return new FeedbackSubmissionError(
        'FUNCTION_UNAVAILABLE',
        errRecord.message || 'Edge Function is unavailable'
      );
    }

    console.warn('[FeedbackService] Unknown submission error:', errRecord.message);
    return new FeedbackSubmissionError(
      'UNKNOWN_ERROR',
      errRecord.message || 'Failed to submit feedback'
    );
  }

  private async extractErrorBody(context: unknown): Promise<EdgeFunctionErrorBody | null> {
    if (!context || typeof context !== 'object') {
      return null;
    }

    const maybeResponse = context as { json?: () => Promise<unknown> };
    if (typeof maybeResponse.json === 'function') {
      try {
        const body = await maybeResponse.json();
        if (body && typeof body === 'object') {
          return body as EdgeFunctionErrorBody;
        }
      } catch {
        return null;
      }
    }

    if ('code' in context || 'error' in context) {
      return context as EdgeFunctionErrorBody;
    }

    return null;
  }
}
