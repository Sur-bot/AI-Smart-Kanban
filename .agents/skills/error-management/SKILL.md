---
name: error-management
description: Automated error diagnosis, root-cause analysis, security verification, and local audit registry tracking inside Antigravity IDE. Activate whenever a build, unit test, E2E test, or runtime error occurs, or before committing code changes.
---

# Quy Trình Quản Lý Lỗi Tự Động (Automated Error Management)

## 1. Phạm Vi Áp Dụng

Kích hoạt quy trình này tự động trong các tình huống:
- Phát hiện lỗi biên dịch TypeScript/Angular, lỗi Unit Test (`Vitest`), lỗi E2E Test (`Playwright`), hoặc cảnh báo bảo mật.
- Trước khi đóng gói bất kỳ commit nào vào Git.
- Khi người dùng yêu cầu rà soát sức khỏe dự án hoặc kiểm toán lỗi.

## 2. Quy Trình 4 Bước Tự Động

### Bước 1 — Chẩn Đoán Tự Động (Automated Diagnostics)
Chạy lệnh kiểm tra sức khỏe dự án:
```bash
npm run verify:health
```
- Quét các file nhạy cảm (`src/environments/*.ts`, `.env*`, `docs/audit-report.md`, `docker-compose*.yml`) và JWT token trong Git staging.
- Kiểm tra kiểu dữ liệu toàn dự án (`tsconfig.app.json` & `tsconfig.spec.json`).
- Chạy Unit Test mục tiêu hoặc toàn bộ suite (`npm test -- --watch=false`).

### Bước 2 — Phân Tích Gốc Rễ 3 Phần (Mandatory 3-Part Root Cause Analysis)
Bắt buộc trình bày rõ cho người dùng theo đúng 3 mục:
1. **Lỗi là gì?** (Triệu chứng, thông báo lỗi, file và dòng code cụ thể).
2. **Vì sao lỗi?** (Nguyên nhân gốc rễ về kiến trúc, bất đồng bộ, state, hoặc cấu hình).
3. **Cách khắc phục (Đề xuất):** (Giải pháp chuẩn, kiểm chứng cả nhánh thành công *Happy Path* lẫn nhánh lỗi *Error Path*).

### Bước 3 — Khắc Phục & Kiểm Chứng Đầy Đủ (Fix & Full Verification)
- Khi viết hoặc sửa Unit Test có sử dụng Mock ở ranh giới hệ thống (như Supabase SDK hoặc HTTP API), bắt buộc phải kiểm tra **cả trường hợp thành công lẫn trường hợp trả về lỗi (`error`)** để không bao giờ tạo ra "Pass ảo" che giấu lỗi logic.
- Tuyệt đối không mock API trong E2E Test (`e2e/`) để phản ánh trung thực trạng thái tích hợp.

### Bước 4 — Lưu Vết Vào Sổ Quản Lý Lỗi Nội Bộ (`docs/audit-report.md`)
- Cập nhật lỗi mới phát hiện vào mục **Backlog** hoặc chuyển lỗi đã xử lý vào danh sách **Đã sửa / Đã vá** trong file local `docs/audit-report.md` (file này nằm trong `.gitignore`, chỉ lưu nội bộ trên máy phát triển, không đẩy lên GitHub Public).

