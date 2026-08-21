export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserBrief {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'member';
  avatar_url?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'member';
  password?: string;
  avatar_url?: string;
}
