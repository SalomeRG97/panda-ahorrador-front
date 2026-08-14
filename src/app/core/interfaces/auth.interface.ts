export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  role: 'admin' | 'regular' | 'viewer';
  roleId: number;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface SharedOwner {
  id: number;
  owner_id: number;
  viewer_id: number;
  owner_name: string;
  owner_email: string;
  owner_username: string;
  owner_avatar: string | null;
  created_at: string;
}

export interface SharedViewer {
  id: number;
  owner_id: number;
  viewer_id: number;
  viewer_name: string;
  viewer_email: string;
  viewer_username: string;
  viewer_avatar: string | null;
  created_at: string;
}
