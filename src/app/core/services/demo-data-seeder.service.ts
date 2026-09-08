import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemoDataSeederService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async seedForGuest(): Promise<void> {
    try {
      // 1. Tạo Project mẫu
      const projectPayload = {
        name: 'Dự án Demo (Khách)',
        description: 'Đây là dự án dùng thử của bạn. Hãy trải nghiệm các tính năng!',
        icon: 'rocket_launch'
      };
      const project = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/projects`, projectPayload, { withCredentials: true }));
      
      // 2. Lấy Statuses mặc định (thường BE tự tạo 3 cột mặc định: To Do, In Progress, Done)
      const statuses = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/projects/${project.id}/statuses`, { withCredentials: true }));
      
      if (!statuses || statuses.length === 0) {
        return;
      }

      const todoStatusId = statuses[0]?.id;
      const inProgressStatusId = statuses.length > 1 ? statuses[1].id : statuses[0].id;

      if (!todoStatusId) return;

      // 3. Tạo một số Task mẫu
      const tasks = [
        {
          title: 'Khám phá AI Smart Kanban',
          description: 'Thử kéo thả thẻ công việc này sang cột Đang làm',
          status_id: todoStatusId,
          project_id: project.id,
          priority: 'high'
        },
        {
          title: 'Đăng ký tài khoản để lưu dữ liệu',
          description: 'Dữ liệu Khách chỉ là tạm thời, hãy đăng ký để không bị mất!',
          status_id: inProgressStatusId,
          project_id: project.id,
          priority: 'urgent'
        }
      ];

      for (const task of tasks) {
        await firstValueFrom(this.http.post<any>(`${this.apiUrl}/tasks`, task, { withCredentials: true }));
      }
    } catch (error) {
      console.error('[DemoDataSeeder] Lỗi khi seed dữ liệu:', error);
    }
  }
}
