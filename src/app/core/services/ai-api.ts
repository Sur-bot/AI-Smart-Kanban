import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service giao tiếp với AI API Backend.
 * TODO: Implement các tính năng AI (phân tích task, gợi ý, tóm tắt...)
 */
@Injectable({ providedIn: 'root' })
export class AiApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;
}
