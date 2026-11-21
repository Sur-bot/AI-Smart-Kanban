import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@core/config/app-config.token';
import { firstValueFrom } from 'rxjs';

export interface DemoSeedResponse {
  seeded: boolean;
  alreadyExists: boolean;
  project?: { id: string; name: string };
  tasks?: unknown[];
}

@Injectable({
  providedIn: 'root',
})
export class DemoDataSeederService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly apiUrl = this.appConfig.apiUrl;

  async seedForGuest(): Promise<DemoSeedResponse | null> {
    try {
      return await firstValueFrom(
        this.http.post<DemoSeedResponse>(`${this.apiUrl}/demo/seed`, {}, { withCredentials: true })
      );
    } catch (error) {
      console.error('[DemoDataSeeder] Lỗi khi seed dữ liệu qua Backend:', error);
      return null;
    }
  }
}
