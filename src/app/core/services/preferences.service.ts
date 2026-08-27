import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private authService = inject(AuthService);
  private _preferences = signal<any>({});
  readonly preferences = this._preferences.asReadonly();

  private saveSubject = new Subject<{ prefs: any }>();

  constructor() {
    this.saveSubject.pipe(debounceTime(1500)).subscribe(async ({ prefs }: { prefs: any }) => {
      const supabase = this.authService.getClient();
      const { error } = await supabase.auth.updateUser({
        data: { preferences: prefs }
      });
      if (error) {
        console.error('Failed to save preferences to Supabase:', error);
      }
    });
  }

  loadPreferences() {
    const user = this.authService.user();
    if (user && user.user_metadata && user.user_metadata['preferences']) {
      this._preferences.set(user.user_metadata['preferences']);
      return user.user_metadata['preferences'];
    }
    return {};
  }

  async saveColumnWidths(context: string, columns: any[]) {
    if (this.authService.isGuestMode()) {
      // Fallback for guest mode
      const guestPrefs = JSON.parse(localStorage.getItem('guest_preferences') || '{}');
      if (!guestPrefs[context]) guestPrefs[context] = {};
      guestPrefs[context].columns = columns.map(c => ({ id: c.id, width: c.width }));
      localStorage.setItem('guest_preferences', JSON.stringify(guestPrefs));
      return;
    }

    const currentPrefs = this.loadPreferences() || {};
    if (!currentPrefs[context]) currentPrefs[context] = {};
    currentPrefs[context].columns = columns.map(c => ({ id: c.id, width: c.width }));

    this._preferences.set(currentPrefs);

    this.saveSubject.next({ prefs: currentPrefs });
  }

  getColumnWidths(context: string): any[] | null {
    if (this.authService.isGuestMode()) {
      const guestPrefs = JSON.parse(localStorage.getItem('guest_preferences') || '{}');
      return guestPrefs[context]?.columns || null;
    }

    const user = this.authService.user();
    if (user && user.user_metadata && user.user_metadata['preferences']) {
      return user.user_metadata['preferences'][context]?.columns || null;
    }
    return null;
  }
}
