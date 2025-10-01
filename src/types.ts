export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type TaskType = "quick" | "normal";
export type TaskType = 'quick' | 'normal';
export type TaskStatus = 'todo' | 'doing' | 'done' | 'blocked';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  project: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: 0 | 1 | 2;
  estimate_blocks: number;
  target_date: string | null;
  due_at: string | null;
  scheduled_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface TaskPayload {
  title: string;
  note?: string | null;
  project?: string | null;
  type?: TaskType;
  status?: TaskStatus;
  priority?: 0 | 1 | 2;
  estimate_blocks?: number;
  target_date?: string | null;
  due_at?: string | null;
  scheduled_date?: string | null;
  progress?: number;
}
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
