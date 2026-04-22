export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';
  createdAt?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';
  createdAt?: Date;
}

export interface MessageResponse {
  message: string;
}