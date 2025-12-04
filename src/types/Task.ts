export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  reminderDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  isAssessment: boolean;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt'>;

