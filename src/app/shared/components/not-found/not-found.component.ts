import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <main class="not-found-page" role="main">
      <section class="not-found-content" aria-labelledby="not-found-title">
        <span class="error-code" aria-hidden="true">404</span>
        <h1 id="not-found-title" class="not-found-title">Trang không tồn tại</h1>
        <p class="not-found-desc">
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.
        </p>
        <a routerLink="/" class="back-home-btn" aria-label="Quay về trang chủ">
          <mat-icon>home</mat-icon>
          Về trang chủ
        </a>
      </section>
    </main>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
    }
    .not-found-content {
      text-align: center;
      padding: 2rem;
    }
    .error-code {
      display: block;
      font-size: 8rem;
      font-weight: 900;
      line-height: 1;
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .not-found-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 1rem 0 0.5rem;
    }
    .not-found-desc {
      color: #64748b;
      margin-bottom: 2rem;
    }
    .back-home-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      transition: opacity 0.2s;
      &:hover { opacity: 0.9; }
    }
  `]
})
export class NotFoundComponent {}
