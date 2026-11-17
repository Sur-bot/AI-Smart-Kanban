import { FeedbackRatingOption } from './landing-feedback.types';

export const FEEDBACK_MESSAGE_MIN_LENGTH = 10;
export const FEEDBACK_MESSAGE_MAX_LENGTH = 500;
export const FEEDBACK_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const FEEDBACK_ATTACHMENT_NAME_MAX_DISPLAY = 24;
export const FEEDBACK_ALLOWED_IMAGE_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

/**
 * 5 mức đánh giá sao dùng cho cả hiển thị aria-label/tooltip lẫn thanh 5 sao.
 */
export const FEEDBACK_RATING_OPTIONS: readonly FeedbackRatingOption[] = [
  { score: 1, labelKey: 'LANDING_FEEDBACK.RATINGS.VERY_BAD' },
  { score: 2, labelKey: 'LANDING_FEEDBACK.RATINGS.BAD' },
  { score: 3, labelKey: 'LANDING_FEEDBACK.RATINGS.NEUTRAL' },
  { score: 4, labelKey: 'LANDING_FEEDBACK.RATINGS.GOOD' },
  { score: 5, labelKey: 'LANDING_FEEDBACK.RATINGS.EXCELLENT' },
];
