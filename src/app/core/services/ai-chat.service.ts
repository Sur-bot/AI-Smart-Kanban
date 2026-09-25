import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AiChatRequest,
  AiChatResponse,
  AiActionConfirmRequest,
  AiActionConfirmResponse,
  AiQuotaInfo,
  AiSessionListResponse,
  AiChatSession
} from '../models/ai.model';

/**
 * Service giao tiếp với AI CoPilot Backend API.
 * Mọi request đều đi qua backend (Proxy Pattern) — không gọi Gemini trực tiếp.
 */
@Injectable({ providedIn: 'root' })
export class AiChatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;

  /**
   * Gửi tin nhắn tới AI và nhận phản hồi.
   */
  sendMessage(payload: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(
      `${this.apiUrl}/chat`,
      payload,
      { withCredentials: true }
    );
  }

  /**
   * Xác nhận thực thi hành động mà AI đề xuất.
   * User đã review và đồng ý qua Confirmation Dialog.
   */
  confirmAction(payload: AiActionConfirmRequest): Observable<AiActionConfirmResponse> {
    return this.http.post<AiActionConfirmResponse>(
      `${this.apiUrl}/actions/confirm`,
      payload,
      { withCredentials: true }
    );
  }

  /**
   * Từ chối hành động AI đề xuất.
   */
  rejectAction(actionId: string, sessionId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/actions/reject`,
      { actionId, sessionId },
      { withCredentials: true }
    );
  }

  /**
   * Lấy thông tin quota AI của user hiện tại.
   */
  getQuota(): Observable<AiQuotaInfo> {
    return this.http.get<AiQuotaInfo>(
      `${this.apiUrl}/quota`,
      { withCredentials: true }
    );
  }

  /**
   * Lấy danh sách chat sessions.
   */
  getSessions(): Observable<AiSessionListResponse> {
    return this.http.get<AiSessionListResponse>(
      `${this.apiUrl}/sessions`,
      { withCredentials: true }
    );
  }

  /**
   * Lấy chi tiết một session (bao gồm messages).
   */
  getSession(sessionId: string): Observable<AiChatSession> {
    return this.http.get<AiChatSession>(
      `${this.apiUrl}/sessions/${sessionId}`,
      { withCredentials: true }
    );
  }

  /**
   * Xóa một chat session.
   */
  deleteSession(sessionId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/sessions/${sessionId}`,
      { withCredentials: true }
    );
  }
}
