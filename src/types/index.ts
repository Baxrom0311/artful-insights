export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'artist' | 'admin' | 'judge';
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  credits: number;
  date_joined: string;
  artworks_count: string;
  evaluations_count: string;
}

export interface UserStats {
  total_artworks: number;
  evaluated_artworks: number;
  pending_artworks: number;
  average_score: string | null;
  highest_score: string | null;
  credits_remaining: number;
  total_api_cost: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export type ArtworkStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ArtworkListItem {
  id: number;
  title: string;
  user: string;
  image: string;
  status: ArtworkStatus;
  status_display: string;
  format: string;
  created_at: string;
  evaluation_score: string;
}

export interface ArtworkDetail {
  id: number;
  user: string;
  title: string;
  description: string;
  image: string;
  image_url: string | null;
  file_size: number;
  width: number;
  height: number;
  format: string;
  status: ArtworkStatus;
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  name_uz: string;
  description: string;
  weight: string;
  criteria: unknown;
  is_active: boolean;
}

export interface CategoryScore {
  id: number;
  category: Category;
  score: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface EvaluationHistory {
  id: number;
  action: 'started' | 'processing' | 'completed' | 'failed' | 'retried';
  action_display: string;
  message: string;
  metadata: unknown;
  created_at: string;
}

export interface EvaluationListItem {
  id: number;
  artwork_id: number;
  artwork_title: string;
  total_score: string;
  grade: string;
  processing_time: string;
  created_at: string;
}

export interface EvaluationDetail {
  id: number;
  artwork_title: string;
  artwork_image: string;
  llm_provider: string;
  llm_model: string;
  prompt_version: string;
  total_score: string;
  summary: string;
  grade: string;
  raw_response: unknown;
  processing_time: string;
  api_cost: string | null;
  created_at: string;
  category_scores: CategoryScore[];
  history: EvaluationHistory[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
