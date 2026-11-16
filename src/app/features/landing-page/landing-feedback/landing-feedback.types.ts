export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackRatingOption {
  score: FeedbackRating;
  labelKey: string;
}

export interface CreateFeedbackPayload {
  rating: FeedbackRating;
  fullName: string;
  email: string;
  message: string;
  screenshotFile?: File | null;
  locale: string;
  pageUrl: string;
}

export interface FeedbackSubmissionResult {
  feedbackId: string;
  ticketCode: string;
  screenshotPath: string | null;
  adminEmailSent: boolean;
  userConfirmationSent: boolean;
  emailWarning?: string | null;
  createdAt: string;
}

export type FeedbackErrorCode =
  | 'VALIDATION_ERROR'
  | 'STORAGE_ERROR'
  | 'EMAIL_NOT_CONFIGURED'
  | 'EMAIL_DELIVERY_FAILED'
  | 'FUNCTION_UNAVAILABLE'
  | 'UNKNOWN_ERROR';
