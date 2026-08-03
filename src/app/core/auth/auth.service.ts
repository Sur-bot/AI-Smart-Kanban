import { Injectable, inject, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  private supabase: SupabaseClient = createClient(
    environment.supabase.url,
    environment.supabase.anonKey
  );

  // ─── Signals (Reactive State) ─────────────────────────
  private _session = signal<Session | null>(null);
  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(true);

  readonly session = this._session.asReadonly();
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly accessToken = computed(() => this._session()?.access_token ?? null);

  constructor() {
    // Phục hồi session hiện có (nếu đã đăng nhập trước đó)
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      this._loading.set(false);
    });

    // Lắng nghe thay đổi trạng thái xác thực (đăng nhập, đăng xuất, refresh token tự động)
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      this._loading.set(false);

      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Đăng ký tài khoản mới.
   * Supabase tự gửi email xác nhận — không cần cấu hình SMTP, không cần domain riêng.
   */
  async signUp(email: string, password: string, fullName?: string) {
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
        emailRedirectTo: redirectTo  // Supabase sẽ dùng URL này trong link email xác nhận
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Đăng nhập bằng Email + Mật khẩu.
   * Supabase cấp access_token và refresh_token, tự động lưu vào localStorage/cookie.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  /**
   * Đăng nhập bằng Google OAuth (1-click).
   * Chỉ cần bật Google Provider trong Supabase Dashboard → Authentication → Providers.
   */
  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) throw error;
    return data;
  }

  /**
   * Đăng xuất — Supabase xóa session và tự động điều hướng về trang login.
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Gửi lại email đặt lại mật khẩu.
   */
  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
  }

  /**
   * Lấy instance Supabase client để dùng trong các service khác (query DB, storage...).
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
