export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: 'todo' | 'inprogress' | 'done';
  priority: 'high' | 'medium' | 'low';
  estimatedHours?: number;
  checklist?: { id: string; text: string; done: boolean }[];
}

export interface AiAssistResponse {
  taskId: string;
  estimatedHours: number;
  checklist: { id: string; text: string; done: boolean }[];
}

export interface KanbanState {
  tasks: { [id: string]: Task };
  taskIdsByColumn: {
    todo: string[];
    inprogress: string[];
    done: string[];
  };
  loading: boolean;
  error: string | null;
}