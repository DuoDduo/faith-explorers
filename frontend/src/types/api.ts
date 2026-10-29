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
  user: { name: string; avatar_url: string | null };
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
