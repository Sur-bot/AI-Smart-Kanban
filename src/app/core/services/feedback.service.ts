import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import {
  FEEDBACK_ALLOWED_IMAGE_TYPES,
  FEEDBACK_MAX_FILE_SIZE_BYTES,
} from '@features/landing-page/landing-feedback/landing-feedback.data';
import {
  CreateFeedbackPayload,
  FeedbackErrorCode,
  FeedbackSubmissionResult,
} from '@features/landing-page/landing-feedback/landing-feedback.types';

export class FeedbackSubmissionError extends Error {
  constructor(
    public readonly code: FeedbackErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'FeedbackSubmissionError';
  }
}

interface FeedbackApiErrorBody {
  code?: FeedbackErrorCode;
  error?: string;
}

const KNOWN_ERROR_CODES = new Set<FeedbackErrorCode>([
  'VALIDATION_ERROR',
  'STORAGE_ERROR',
  'EMAIL_NOT_CONFIGURED',
  'EMAIL_DELIVERY_FAILED',
  'FUNCTION_UNAVAILABLE',
  'UNKNOWN_ERROR',
]);

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly apiUrl = this.appConfig.apiUrl;

  validateScreenshotFile(file: File): void {
    if (!FEEDBACK_ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new FeedbackSubmissionError('VALIDATION_ERROR', 'INVALID_FILE_TYPE');
    }

    if (file.size > FEEDBACK_MAX_FILE_SIZE_BYTES) {
      throw new FeedbackSubmissionError('VALIDATION_ERROR', 'FILE_TOO_LARGE');
    }
  }

  async submitFeedback(payload: CreateFeedbackPayload): Promise<FeedbackSubmissionResult> {
    let screenshot: { base64: string; mimeType: string; fileName: string } | undefined;

    if (payload.screenshotFile) {
      this.validateScreenshotFile(payload.screenshotFile);
      const base64 = await this.readFileAsBase64(payload.screenshotFile);
      screenshot = {
        base64,
        mimeType: payload.screenshotFile.type,
        fileName: payload.screenshotFile.name,
      };
    }

    try {
      const data = await firstValueFrom(
        this.http.post<FeedbackSubmissionResult>(`${this.apiUrl}/feedback`, {
          rating: payload.rating,
          fullName: payload.fullName.trim(),
          email: payload.email.trim(),
          message: payload.message.trim(),
          locale: payload.locale,
          pageUrl: payload.pageUrl,
          ...(screenshot ? { screenshot } : {}),
        })
      );

      if (!data || !data.feedbackId) {
        throw new FeedbackSubmissionError('UNKNOWN_ERROR', 'EMPTY_RESPONSE');
      }

      return data;
    } catch (error) {
      if (error instanceof FeedbackSubmissionError) {
        throw error;
      }
      throw this.mapHttpError(error);
    }
  }

  private async readFileAsBase64(file: File): Promise<string> {
    if (typeof file.arrayBuffer === 'function') {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? '');
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = () =>
        reject(new FeedbackSubmissionError('STORAGE_ERROR', 'SCREENSHOT_READ_FAILED'));
      reader.readAsDataURL(file);
    });
  }

  private mapHttpError(error: unknown): FeedbackSubmissionError {
    if (error instanceof HttpErrorResponse) {
      const body =
        error.error && typeof error.error === 'object'
          ? (error.error as FeedbackApiErrorBody)
          : null;

      if (body?.code && KNOWN_ERROR_CODES.has(body.code)) {
        console.warn('[FeedbackService] Backend error:', body.code, body.error || error.message);
        return new FeedbackSubmissionError(
          body.code,
          body.error || error.message || body.code
        );
      }

      if (error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504) {
        console.warn('[FeedbackService] Backend API unreachable:', error.message);
        return new FeedbackSubmissionError(
          'FUNCTION_UNAVAILABLE',
          error.message || 'Backend API is unavailable'
        );
      }

      console.warn('[FeedbackService] HTTP submission error:', error.status, error.message);
      return new FeedbackSubmissionError(
        'UNKNOWN_ERROR',
        body?.error || error.message || 'Failed to submit feedback'
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to submit feedback';
    console.warn('[FeedbackService] Unknown submission error:', message);
    return new FeedbackSubmissionError('UNKNOWN_ERROR', message);
  }
}
