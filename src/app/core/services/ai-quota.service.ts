import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { AiQuotaInfo } from '@core/models/ai.model';

@Injectable({ providedIn: 'root' })
export class AiQuotaService {
  private http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private apiUrl = `${this.appConfig.apiUrl}/ai`;

  getQuota(): Observable<AiQuotaInfo> {
    return this.http.get<AiQuotaInfo>(
      `${this.apiUrl}/quota`,
      { withCredentials: true }
    );
  }
}
