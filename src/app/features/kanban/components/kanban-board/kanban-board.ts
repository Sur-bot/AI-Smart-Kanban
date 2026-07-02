import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.html',
  standalone: false
})
export class KanbanBoardComponent implements OnInit {
  todoTasks: Task[] = [
    { id: '1', title: 'Thiết kế Database Mock', description: 'Tạo file JSON chứa dữ liệu mẫu cho UI', columnId: 'todo', priority: 'high' },
    { id: '2', title: 'Tích hợp Tailwind v4', description: 'Cấu hình postcss và theme colors', columnId: 'todo', priority: 'medium' }
  ];

  inProgressTasks: Task[] = [
    { id: '3', title: 'Xây dựng Drag & Drop', description: 'Sử dụng Angular CDK để kéo thả thẻ', columnId: 'inprogress', priority: 'high', estimatedHours: 4, checklist: [{id: 'c1', text: 'Import DragDropModule', done: true}] }
  ];

  doneTasks: Task[] = [
    { id: '4', title: 'Khởi tạo dự án', description: 'Chạy lệnh ng new và cấu trúc thư mục', columnId: 'done', priority: 'low' }
  ];

  constructor() {}

  ngOnInit(): void {}

  /**
   * Hàm xử lý khi thả chuột. 
   * (Trong thực tế dùng NgRx, ta sẽ dispatch action ở đây. 
   * Hiện tại ta cập nhật mảng nội bộ để UI phản hồi ngay lập tức).
   */
  onTaskDropped(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Kéo thả thay đổi thứ tự trong CÙNG 1 CỘT
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Kéo thả sang CỘT KHÁC
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      // Cập nhật lại thuộc tính columnId của Task vừa được chuyển
      const movedTask = event.container.data[event.currentIndex];
      movedTask.columnId = event.container.id as 'todo' | 'inprogress' | 'done';
    }
  }

  onTaskSelected(taskId: string): void {
    console.log('Mở chi tiết Task ID:', taskId);
    // TODO: Bật Modal chi tiết Task lên
  }
}