import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@core/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private apiUrl = `${this.appConfig.apiUrl}/ai`;
}
