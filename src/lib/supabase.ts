import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: 'reader' | 'writer' | 'moderator' | 'admin' | 'super_admin' | 'banned';
  avatar_url?: string;
  bio?: string;
  banned_until?: string;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url?: string;
  author_id: string;
  status: 'draft' | 'published';
  approval_status: 'none' | 'pending' | 'approved' | 'rejected';
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type Book = {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  order_index: number;
  category?: 'revelation' | 'other';
  created_at: string;
  updated_at: string;
};

export type LibraryItem = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  download_count: number;
  created_at: string;
  updated_at: string;
  uploader?: Profile;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: Comment[];
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type PostTag = {
  post_id: string;
  tag_id: string;
  created_at: string;
};

export type PostReaction = {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'like';
  created_at: string;
};

export type PostBookmark = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type PostView = {
  id: string;
  post_id: string;
  user_id?: string;
  viewed_at: string;
  ip_address?: string;
};

export type UserBan = {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  banned_until: string;
  created_at: string;
};

export type PostApproval = {
  id: string;
  post_id: string;
  requested_by: string;
  action_type: 'publish' | 'delete';
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  post?: Post;
  requester?: Profile;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
};
