import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserSummary } from '../models/task.model';

export interface UserSearchResult extends UserSummary {
  is_member?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Tìm kiếm user trong một workspace.
   * Backend: GET /api/users/search?q=keyword&workspaceId=xxx&limit=10
   */
  searchUsers(query: string, workspaceId: string, limit = 10): Observable<UserSearchResult[]> {
    return this.http.get<UserSearchResult[]>(`${this.apiUrl}/users/search`, {
      params: { q: query, workspaceId, limit: String(limit) },
      withCredentials: true
    });
  }
}
