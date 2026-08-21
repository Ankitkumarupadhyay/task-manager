export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ExternalUser {
  id: number;
  name: string;
  email: string;
  company: string;
  website: string;
  city: string;
}
