export interface Comment {
  id: number;
  content: string;
  author: UserSummary;
  createdAt: Date;
}

export interface UserSummary {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface CommentRequest {
  content: string;
}