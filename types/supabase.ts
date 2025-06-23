export type UserRole = 'superadmin' | 'admin' | 'user';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
  categories?: Category[];
  tags?: Tag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PostCategory {
  post_id: string;
  category_id: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}