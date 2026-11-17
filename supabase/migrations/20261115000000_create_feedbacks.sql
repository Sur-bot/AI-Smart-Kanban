-- =============================================================================
-- SUPABASE SCHEMA, STORAGE BUCKET & RLS CHO TINH NANG PHAN HOI (LANDING FEEDBACK)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. BANG LUU DANH GIA & PHAN HOI NGUOI DUNG
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(24) NOT NULL UNIQUE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    full_name VARCHAR(120) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 10 AND 1000),
    screenshot_path VARCHAR(512),
    locale VARCHAR(12) NOT NULL DEFAULT 'vi',
    page_url TEXT,
    admin_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    user_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    email_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at
    ON public.feedbacks (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedbacks_rating
    ON public.feedbacks (rating);

-- Bat RLS: chi Edge Function (service_role) duoc ghi va doc du lieu nhay cam (email)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. BUCKET LUU ANH CHUP MAN HINH DINH KEM (PRIVATE, SIGNED URL QUA EDGE FUNCTION)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'feedback-attachments',
    'feedback-attachments',
    FALSE,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Allow anon upload feedback attachments" ON storage.objects;
CREATE POLICY "Allow anon upload feedback attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
    bucket_id = 'feedback-attachments'
    AND (storage.extension(name) IN ('png', 'jpg', 'webp'))
);
