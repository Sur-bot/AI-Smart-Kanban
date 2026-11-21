import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import {
  AiChatRequest,
  AiChatResponse,
  AiActionConfirmRequest,
  AiActionConfirmResponse,
  AiQuotaInfo,
  AiSessionListResponse,
  AiChatSession,
} from '@core/models/ai.model';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private apiUrl = `${this.appConfig.apiUrl}/ai`;

  sendMessage(payload: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(
      `${this.apiUrl}/chat`,
      payload,
      { withCredentials: true }
    );
  }

  confirmAction(payload: AiActionConfirmRequest): Observable<AiActionConfirmResponse> {
    return this.http.post<AiActionConfirmResponse>(
      `${this.apiUrl}/actions/confirm`,
      payload,
      { withCredentials: true }
    );
  }

  rejectAction(actionId: string, sessionId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/actions/reject`,
      { actionId, sessionId },
      { withCredentials: true }
    );
  }

  getQuota(): Observable<AiQuotaInfo> {
    return this.http.get<AiQuotaInfo>(
      `${this.apiUrl}/quota`,
      { withCredentials: true }
    );
  }

  getSessions(): Observable<AiSessionListResponse> {
    return this.http.get<AiSessionListResponse>(
      `${this.apiUrl}/sessions`,
      { withCredentials: true }
    );
  }

  getSession(sessionId: string): Observable<AiChatSession> {
    return this.http.get<AiChatSession>(
      `${this.apiUrl}/sessions/${sessionId}`,
      { withCredentials: true }
    );
  }

  deleteSession(sessionId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/sessions/${sessionId}`,
      { withCredentials: true }
    );
  }
}
