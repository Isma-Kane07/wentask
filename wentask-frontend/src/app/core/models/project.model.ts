import { User } from './user.model';

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  owner: UserSummary;
  members: UserSummary[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface ProjectStats {
  projectId: number;
  projectName: string;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
  memberCount: number;
}