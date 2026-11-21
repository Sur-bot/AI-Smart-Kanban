import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
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
  private readonly apiUrl = (environment.apiUrl || 'http://localhost:3000/api').replace(/\/+$/, '');

  /**
   * Ủy thác việc khởi tạo dữ liệu mẫu (dự án, cột trạng thái và tác vụ demo)
   * sang Backend REST API `POST /api/demo/seed` để đảm bảo nguyên tử và chống trùng lặp.
   */
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
