# Hướng Dẫn Kích Hoạt Flow Thật Cho Feedback Panel (Supabase + Email)

Tài liệu này hướng dẫn cấu hình đầy đủ để `app-landing-feedback` lưu đánh giá thật vào PostgreSQL, upload ảnh chụp lên Supabase Storage và gửi 2 email thật (báo cáo tới email cá nhân quản trị viên + thư cảm ơn/xác nhận tới người gửi).

## Bước 1 — Chạy Migration Tạo Bảng & Storage Bucket
1. Mở **Supabase Dashboard** → **SQL Editor** → **New Query**.
2. Dán toàn bộ nội dung từ file [20261115000000_create_feedbacks.sql](file:///c:/ai-smart-kanban/supabase/migrations/20261115000000_create_feedbacks.sql) và nhấn **Run**.
3. Kiểm tra đã có:
   - Bảng `public.feedbacks` (đã bật RLS).
   - Private Bucket `feedback-attachments` (giới hạn 5MB, chỉ nhận PNG/JPG/WEBP).

## Bước 2 — Đăng Ký Resend & Lấy API Key Gửi Mail Thật
1. Tạo tài khoản miễn phí tại [resend.com](https://resend.com) và tạo API Key (`RESEND_API_KEY`).
2. **Lưu ý quan trọng về gửi mail cho email người dùng bất kỳ:**
   - Khi chưa xác thực domain riêng (dùng địa chỉ mặc định `onboarding@resend.dev`), Resend chỉ cho phép gửi mail tới chính email bạn đăng ký tài khoản Resend (vì vậy thư gửi quản trị viên về email cá nhân của bạn sẽ chạy ngay, còn thư xác nhận gửi tới email người dùng khác sẽ cần domain đã verify trên Resend).
   - Để gửi thư xác nhận tự động tới mọi địa chỉ email người dùng nhập, hãy verify một domain trên Resend và đặt `FEEDBACK_FROM_EMAIL="AI Smart Kanban <feedback@ten-mien-cua-ban.com>"`.

## Bước 3 — Deploy Edge Function `submit-feedback` & Cấu Hình Secrets
Cài Supabase CLI (nếu chưa có) rồi chạy lần lượt:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>

npx supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxxx \
  FEEDBACK_ADMIN_EMAIL=email-ca-nhan-cua-ban@gmail.com \
  FEEDBACK_FROM_EMAIL="AI Smart Kanban <onboarding@resend.dev>"

npx supabase functions deploy submit-feedback --no-verify-jwt
```

> Lưu ý `--no-verify-jwt`: Cần bật cờ này để khách truy cập Landing Page (chưa đăng nhập) vẫn gửi được phản hồi hợp lệ; Edge Function đã kiểm tra chặt đầu vào, escape HTML chống XSS và ghi DB bằng `SUPABASE_SERVICE_ROLE_KEY`.

