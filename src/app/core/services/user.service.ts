import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { UserSummary } from '@core/models/task.model';

export interface UserSearchResult extends UserSummary {
  is_member?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private apiUrl = this.appConfig.apiUrl;

  searchUsers(query: string, workspaceId: string, limit = 10): Observable<UserSearchResult[]> {
    return this.http.get<UserSearchResult[]>(`${this.apiUrl}/users/search`, {
      params: { q: query, workspaceId, limit: String(limit) },
      withCredentials: true,
    });
  }
}
