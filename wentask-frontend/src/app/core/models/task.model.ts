export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  project: ProjectSummary;
  assignee?: UserSummary;
  createdBy: UserSummary;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectSummary {
  id: number;
  name: string;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: number | null;
  dueDate?: Date | string | null;  // ✅ Ajouter null
}

// ✅ Pour les mises à jour partielles
export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: number | null;
  dueDate?: Date | string | null;  // ✅ Ajouter null
}