*Hoàn tất: 2026-09-29, đánh dấu bởi tag phase-a-complete*

# 🛡 BÁO CÁO AUDIT & BẢO MẬT HỆ THỐNG
**Dự án:** AI-Smart-Kanban
**Thời điểm:** Hoàn tất Giai đoạn A (Khép lại Pass 1 & Pass 2)

## 1. TÓM TẮT ĐIỀU HÀNH
- **Phạm vi Audit:** Rà soát chuyên sâu luồng xác thực (Auth), ủy quyền (RLS/Middleware) ở Backend và sửa lỗi Unit/E2E test ở Frontend. Tập trung vào các Module: Auth, Project Management, Kanban Board, Storage và AI Copilot.
- **Tổng số Commit:**
  - **Frontend Repo (`ai-smart-kanban`):** 10 commit (bao gồm fix UX, UI overlay, logic Unit/E2E test).
  - **Backend Repo (`ai-smart-kanban-backend`):** 5 commit (bao gồm vá lỗ hổng phân quyền, thêm rate limit, dọn dẹp và sửa script test E2E nội bộ).
- **Thời gian thực hiện:** Kéo dài qua 2 giai đoạn (Pass 1 & Giai đoạn A), giải quyết từ bug rendering của Angular Signal đến việc truy vết tận cùng lỗi giả `PGRST116` của PostgREST.

## 2. DANH SÁCH LỖ HỔNG BẢO MẬT ĐÃ VÁ
*(Không theo thứ tự thời gian)*

| Lỗ hổng | Hậu quả (Nếu không vá) | Cách khắc phục | Commit Hash |
|---|---|---|---|
| **Thiếu kiểm tra phân quyền (Privilege Escalation)** ở tầng Backend Service | Bất kỳ user nào cũng có thể gọi API sửa/xóa/đổi chủ Project bằng cách tự chế payload hoặc giả mạo role vì Service Layer hoàn toàn tin tưởng, không gọi hàm kiểm tra quyền. | Backend: Bổ sung và bắt buộc gọi `assertTaskAccess` và `assertProjectRole` trên TẤT CẢ các mutations và queries của Task/Project Service để lấy quyền thực tế từ bảng `project_members`. | `198fb2f` (Backend) |
| **Thiếu Rate Limit ở AI Route** | Kẻ tấn công hoặc bot có thể gọi vòng lặp API chat AI, làm sập hệ thống (DDoS) và làm cạn kiệt Quota API Key Gemini. | Backend: Tích hợp `express-rate-limit` riêng cho `aiRoutes.js`. | `9ea1f71` (Backend) |
| **Bảo vệ chống HTML Injection qua AI Markdown** | AI trả về format Markdown có thể làm vỡ toàn bộ cấu trúc UI của thẻ Card nếu có chứa HTML không mong muốn. | Frontend: Dựa vào cơ chế chặn XSS mặc định của Angular `DomSanitizer` qua binding `[innerHTML]` (chặn `<script>`, sự kiện `onerror`). Đồng thời, **chủ động escape thủ công `<` và `>`** trong hàm `formattedContent()` để vô hiệu hóa hoàn toàn HTML injection phá layout. | `1944029` (Frontend) |
| **Lỗ hổng logic (Session Pollution)** trong script Test E2E | Lỗ hổng trong file `real-e2e-api.js`: Lệnh `signInWithPassword` lưu đè Session vào bộ nhớ RAM của Supabase admin client, gây lỗi giả `PGRST116` (0 rows) và báo động giả về DB. | Backend: Sử dụng một instance `supabaseAdmin` độc lập với cấu hình `{ auth: { persistSession: false } }` chuyên dùng để query verify DB, giữ nguyên tính chất của Service Role Key. | `8a6f352` (Backend) |

## 3. DANH SÁCH BUG THẬT TRONG CODE SẢN XUẤT ĐÃ SỬA
*(Các bug ảnh hưởng đến End-User)*

| Lỗi | Mô tả & Hậu quả | Tại sao rất khó phát hiện trước đó? | Commit Hash |
|---|---|---|---|
| **Mất State Điều hướng ở Auth** | User đăng ký email tồn tại bị văng ra form đăng ký trắng thay vì thấy màn hình chờ xác thực (`verify-pending`). | Hàm `this.router.getCurrentNavigation()` trả về `null` vì route auth được lazy-load. Không ai thấy lỗi này trong lúc code vì unit test dùng mock Router cứng thay vì mô phỏng luồng History thật trên trình duyệt. | `d8c1242` (Frontend) |
| **Pointer Events Intercepted (Lỗi UI Overlay)** | Nút tạo dự án hoặc nút menu bị thẻ `.switcher-btn` vô tình đè Z-index che khuất. | Người dùng thật bằng mắt thường có thể vô ý click nhích lệch 1px để qua, nhưng E2E Playwright click chính xác vào tâm điểm thì bị block. | `9553c3c` (Frontend) |
| **Lỗi `routerLink="null"` ở Menu Collaboration** | Thuộc tính này sinh ra thẻ `<a>` có link là `"null"`, làm hỏng Menu Dropdown hoặc điều hướng sai. | Angular âm thầm bỏ qua lỗi này nếu người dùng bấm vào trang hiện tại; không gây sập app rõ rệt nhưng phá hỏng hành vi DOM. | `9553c3c` (Frontend) |

## 4. TÌNH TRẠNG TEST SUITE HIỆN TẠI

- **Unit Test (Vitest):** **PASS toàn bộ** (Đã fix lỗi cú pháp Signal-based services và mock chính xác giá trị mâu thuẫn như `isMember` & `currentRole`).
- **E2E Test (Playwright):** Tổng cộng 31 Tests.
  - **29 Passed** (Bao gồm Auth, Storage, Kanban cơ bản).
  - **1 Skipped (`TC-KANBAN-005`):** Test case về kéo thả Task giữa các cột. Playwright có hạn chế cố hữu về giả lập HTML5 Drag-and-Drop thực tế. *Kế hoạch un-skip:* Cần viết hàm `page.evaluate` giả lập DataTransfer object hoặc test thủ công.
  - **1 Failed (`TC-PROJ-002`):** Lỗi "mời thành viên" thất bại CÓ CHỦ ĐÍCH do thiếu cấu hình biến môi trường thật (`E2E_TEST_INVITE_UUID` trong `.env.test`). Dự án kiên quyết không dùng mock trả về 200 để né lỗi này. 

## 5. DANH SÁCH NỢ KỸ THUẬT & VIỆC CÒN LẠI (BACKLOG)
*(Ưu tiên từ cao xuống thấp)*

- **[P1] Lỗi Foreign Key Constraint 23503 ở Backend API:** 
  - *Bằng chứng:* Ghi nhận trong log background task của server (`task-2981.log`):
    ```
    [ProjectController:addMember] Error: {
      code: '23503',
      message: 'insert or update on table "project_members" violates foreign key constraint "project_members_user_id_fkey"'
    }
    ```
  - *Hành động:* Backend cần bắt exception này và trả về HTTP 400 rõ ràng (VD: "User không tồn tại") thay vì để văng lỗi Postgres nội bộ.
- **[P1] Config Key Gemini cho AI E2E Test:** E2E test cho AI CoPilot (`TC-AI-...`) đang văng HTTP 500 do API Key Gemini không hợp lệ. Cần đưa Key thật vào GitHub Secrets / `.env.test` để E2E test cover được tính năng này.
- **[P2] Xóa sổ `getCurrentNavigation()` toàn codebase:** Đã fix được 1 chỗ ở Auth, nhưng cần rà soát và thay thế toàn bộ pattern này bằng `history.state` hoặc URL Query Params để tránh rủi ro mất state khi Lazy-Load các module khác.
- **[P3] Viết Unit Test thật cho `create-task-modal.spec.ts`:** File này hiện tại đang chỉ test đúng 1 case rỗng (kiểm tra component tồn tại). Cần bổ sung test cho luồng điền form và submit task.

## 6. BÀI HỌC QUY TRÌNH (LESSONS LEARNED)

1. **Tin vào Bằng chứng (Log), Đừng Tin vào Ấn tượng:** Trước khi kết luận backend (Supabase) bị delay hoặc connection pooler lỗi, phải trích xuất log thực tế. Bất ngờ phát hiện ra `signInWithPassword` lưu session RAM nội bộ làm hỏng quyền của admin client.
2. **Không Mock để né lỗi Sản xuất:** TC-PROJ-002 từng bị mock để qua mặt lỗi Rate Limit/User không tồn tại, điều này che giấu thực trạng Supabase Auth thay đổi (trả về 200 chống User Enumeration). *Nguyên tắc mới:* Thà để E2E test Failed do thiếu config `.env`, còn hơn Mock để 100% Pass ảo.
3. **Phân tách Rõ Ràng Cơ chế Bảo mật:** Angular `DomSanitizer` lo việc chặn XSS thực thi mã độc, trong khi việc escape `<`/`>` thủ công lo việc bảo vệ Layout UI. Phải hiểu rõ ranh giới từng lớp bảo vệ, không gộp chung khái niệm.
4. **Cẩn trọng với Môi trường "Lazy-Load" ở Frontend:** Các hàm vốn hoạt động tốt ở môi trường đơn giản (như `getCurrentNavigation`) sẽ chết ngầm khi cấu trúc Router bị cắt nhỏ chunk (lazy load). Luôn dùng `history.state` cho tính ổn định lâu dài.
