# AI-Smart-Kanban — Project Rules

## Công nghệ

- **Framework:** Angular 22 (Standalone Components)
- **Styling:** Tailwind CSS (không dùng Vanilla CSS trừ khi cần SCSS scope)
- **Icons:** Angular Material Icons (`<mat-icon>`)
- **Template:** 100% Semantic HTML5 — tuyệt đối không lạm dụng `<div>` vô nghĩa
- **Ngôn ngữ trả lời:** Tiếng Việt

---

## Quy tắc Responsive UI cho Angular Component

### Quy tắc 1 — Mobile-First (Ưu tiên Mobile trước)
Luôn viết CSS cho màn hình nhỏ nhất trước, sau đó mở rộng lên màn hình lớn hơn bằng prefix.

```html
<!-- ✅ Đúng: mobile-first -->
<button class="w-8 h-8 px-0 xl:w-auto xl:px-4">...</button>

<!-- ❌ Sai: desktop-first -->
<button class="w-auto px-4 max-xl:w-8 max-xl:px-0">...</button>
```

### Quy tắc 2 — Dùng Breakpoint nhất quán theo thiết kế hệ thống

| Breakpoint | Tailwind prefix | Độ rộng tối thiểu |
|---|---|---|
| Mobile | *(default)* | < 640px |
| Tablet | `sm:` | ≥ 640px |
| Tablet lớn | `md:` | ≥ 768px |
| Laptop | `lg:` | ≥ 1024px |
| Desktop | `xl:` | ≥ 1280px |
| Wide | `2xl:` | ≥ 1536px |

> Chọn điểm ngắt dựa trên nội dung bị vỡ, không phải dựa trên kích thước thiết bị cụ thể.

### Quy tắc 3 — Phân tách rõ Layer: Structure / Visibility / Content

```html
<!-- Structure: layout thay đổi theo breakpoint -->
<nav class="flex flex-col lg:flex-row gap-2 lg:gap-4">

  <!-- Visibility: ẩn/hiện theo breakpoint -->
  <span class="hidden xl:inline">Text dài</span>
  <mat-icon class="xl:hidden">menu</mat-icon>

  <!-- Content: không đổi, chỉ sắp xếp khác -->
  <img class="w-8 h-8 lg:w-12 lg:h-12" />
</nav>
```

### Quy tắc 4 — Component tự chứa Responsive Logic của mình
Mỗi component phải tự xử lý responsive của chính nó. **Không** để component cha điều khiển layout con thông qua class từ bên ngoài.

```scss
// ✅ Đúng: component tự khai báo trong SCSS của nó
.header-action-btn {
  @apply w-7 h-7 px-0 xl:w-auto xl:px-3;
}
```

### Quy tắc 5 — Không cứng hóa kích thước Pixel (Tránh Fixed Width/Height)
Ưu tiên dùng `min-w`, `max-w`, `flex-1`, `shrink-0`, `truncate` thay vì `w-[300px]`.

```html
<!-- ✅ Đúng: linh hoạt -->
<div class="flex-1 min-w-0 truncate">{{ longText }}</div>

<!-- ❌ Sai: cứng, dễ vỡ trên màn hình khác -->
<div class="w-[280px]">{{ longText }}</div>
```

### Quy tắc 6 — Accessibility: Luôn giữ `title` / `aria-label` khi ẩn Text
Khi text bị ẩn ở mobile, phải đảm bảo người dùng vẫn biết chức năng của nút bấm đó.

```html
<!-- ✅ Đúng -->
<button [title]="'HEADER.INVITE' | translate" aria-label="Mời thành viên">
  <svg>...</svg>
  <span class="hidden xl:inline">{{ 'HEADER.INVITE' | translate }}</span>
</button>
```

### Quy tắc 7 — Kiểm tra Overflow và Wrapping
Luôn dùng `overflow-hidden`, `truncate`, `whitespace-nowrap` ở những khu vực có thể tràn nội dung.

```html
<span class="truncate max-w-[120px] xl:max-w-none">{{ userName }}</span>
```

### Quy tắc 8 — Dùng SCSS Media Query cho logic Responsive phức tạp
Nếu responsive phức tạp hơn (thay đổi toàn bộ cấu trúc DOM), dùng `@media` trong SCSS thay vì chất đống class Tailwind trong HTML.

```scss
@media (max-width: 1280px) {
  .sidebar {
    @apply absolute left-0 -translate-x-full;

    &.open {
      @apply translate-x-0;
    }
  }
}
```

### Quy tắc 9 — Testing thực tế bằng Chrome DevTools
Sau mỗi thay đổi responsive, test ở các mốc cụ thể: `375px`, `768px`, `1024px`, `1280px`, `1440px`.

### Quy tắc 10 — Commit riêng biệt cho Responsive
Các thay đổi liên quan đến Responsive nên được đưa vào commit riêng với scope `style`.

```
style(header): make action buttons icon-only on viewports < 1280px
```

---

## Quy tắc Semantic HTML5

- Dùng `<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`, `<footer>` thay cho `<div>` generic.
- Dùng `<fieldset>` + `<legend>` cho nhóm input.
- Dùng `<button type="button">` (không phải `<div>` hay `<a href="javascript:void(0)">`) cho các phần tử bấm.
- Dùng `<label [for]="id">` gắn với `<input [id]="id">` để hỗ trợ Screen Reader.
- Mỗi trang phải có đúng một `<h1>`. Cấu trúc heading phải đúng thứ tự h1 → h2 → h3.

---

## Quy tắc Commit

Dùng chuẩn **Conventional Commits**:

```
<type>(<scope>): <short description>

- Chi tiết thay đổi 1
- Chi tiết thay đổi 2
```

| Type | Dùng khi |
|---|---|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi |
| `style` | Chỉnh UI/CSS, không ảnh hưởng logic |
| `refactor` | Tái cấu trúc code |
| `docs` | Thay đổi tài liệu |
| `chore` | Cập nhật cấu hình, deps |

---

## Quy tắc Icon

Luôn dùng `<mat-icon>` của Angular Material cho các tác vụ thêm-xóa-sửa icon. Không tự chèn SVG thuần nếu icon đã có sẵn trong thư viện Material.

```html
<!-- ✅ Đúng -->
<mat-icon>close</mat-icon>
<mat-icon fontSet="material-icons-outlined">auto_awesome</mat-icon>

<!-- ❌ Sai: tự vẽ SVG khi icon đã có trong Material -->
<svg>...</svg>
```
