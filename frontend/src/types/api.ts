// Response and request shapes of the FastAPI backend.
// Mirrors backend/app/schemas/ — keep the two in sync when the API changes.

export interface Author {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface CategoryRef {
  name: string;
  slug: string;
}

export interface Category extends CategoryRef {
  id: number;
  description: string | null;
  cover_url: string | null;
  post_count: number;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string | null;
  featured: boolean;
  read_time: number;
  views: number;
  like_count: number;
  published_at: string | null;
  author: Author;
  category: CategoryRef;
  tags: Tag[];
}

export interface PostDetail extends PostSummary {
  body: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: { id: number; name: string; avatar_url: string | null };
  post: { slug: string; title: string };
}

export type PostSort = "recent" | "popular";

export interface PostQuery {
  category?: string;
  tag?: string;
  q?: string;
  featured?: boolean;
  sort?: PostSort;
  page?: number;
  page_size?: number;
}

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export interface Message {
  detail: string;
}

export type Role = "reader" | "author" | "admin";

export interface User {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface Engagement {
  like_count: number;
  liked: boolean;
  bookmarked: boolean;
}

export type PostStatus = "draft" | "pending" | "published";

export interface MyPostSummary extends PostSummary {
  status: PostStatus;
  updated_at: string;
  review_note: string | null;
}

export interface MyPost extends PostDetail {
  status: PostStatus;
  updated_at: string;
  review_note: string | null;
}

export interface AuthorApplication {
  id: number;
  status: "pending" | "approved" | "rejected";
  motivation: string;
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
}

export interface AdminOverview {
  pending_applications: number;
  pending_posts: number;
  unhandled_messages: number;
  published_posts: number;
  users: number;
  comments: number;
}

export interface AdminApplication extends AuthorApplication {
  user: { id: number; name: string; email: string | null };
}

export interface AdminComment extends Comment {
  status: "visible" | "hidden";
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  created_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface NewsletterOverview {
  confirmed: number;
  pending: number;
  issues: { id: number; subject: string; recipient_count: number; sent_at: string }[];
}
