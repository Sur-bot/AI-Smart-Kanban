import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiQuotaInfo } from '../models/ai.model';

/**
 * Service quản lý AI Quota phía frontend.
 * Cung cấp API lấy thông tin quota và kiểm tra giới hạn.
 */
@Injectable({ providedIn: 'root' })
export class AiQuotaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;

  /**
   * Lấy thông tin quota AI hiện tại của user.
   */
  getQuota(): Observable<AiQuotaInfo> {
    return this.http.get<AiQuotaInfo>(
      `${this.apiUrl}/quota`,
      { withCredentials: true }
    );
  }
}
