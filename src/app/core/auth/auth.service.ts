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

  private _session = signal<Session | null>(null);
  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(true);
  
  private _isGuestMode = signal<boolean>(false);

  readonly session = this._session.asReadonly();
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isGuestMode = this._isGuestMode.asReadonly();
  
  readonly isAuthenticated = computed(() => !!this._session() || this._isGuestMode());
  readonly accessToken = computed(() => this._session()?.access_token ?? null);

  constructor() {
    const storedGuest = localStorage.getItem('ai_smart_kanban_guest');
    if (storedGuest === 'true') {
      this._isGuestMode.set(true);
      this._loading.set(false);
    }

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      if (!this._isGuestMode()) {
        this._loading.set(false);
      }
    });

    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      if (!this._isGuestMode()) {
        this._loading.set(false);
      }

      if (event === 'SIGNED_OUT' && !this._isGuestMode()) {
        this.router.navigate(['/login']);
      }
    });
  }

  async loginAsGuest() {
    this._isGuestMode.set(true);
    localStorage.setItem('ai_smart_kanban_guest', 'true');
    await this.router.navigate(['/kanban']);
  }

  async signUp(email: string, password: string, fullName?: string) {
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
        emailRedirectTo: redirectTo
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) throw error;
    return data;
  }

  async signInWithFacebook() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    if (this._isGuestMode()) {
      this._isGuestMode.set(false);
      localStorage.removeItem('ai_smart_kanban_guest');
      this.router.navigate(['/login']);
      return;
    }

    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
  }

  /**
   * Láº¥y instance Supabase client Ä‘á»ƒ dÃ¹ng trong cÃ¡c service khÃ¡c (query DB, storage...).
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

