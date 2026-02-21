/*
  # Satanas Fidelis CMS Database Schema

  ## Overview
  Complete content management system for occult studies community with role-based access control,
  blog posts, sacred books, library resources, and commenting system.

  ## New Tables
  
  ### 1. profiles
  Extended user information with role management
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `display_name` (text) - Public display name
  - `role` (text) - User role: 'reader', 'writer', 'moderator', 'admin', 'banned'
  - `avatar_url` (text, nullable) - Profile picture
  - `bio` (text, nullable) - User biography
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. posts
  Blog posts and articles
  - `id` (uuid, PK)
  - `title` (text) - Post title
  - `slug` (text, unique) - URL-friendly slug
  - `content` (text) - Post content (markdown/html)
  - `excerpt` (text) - Short description
  - `cover_image_url` (text, nullable) - Featured image
  - `author_id` (uuid, FK to profiles)
  - `status` (text) - 'draft', 'published'
  - `published_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. books
  Sacred texts in the Üç Kitap section
  - `id` (uuid, PK)
  - `title` (text) - Book title
  - `description` (text) - Book description
  - `content` (text) - Full book content
  - `cover_image_url` (text, nullable)
  - `author` (text) - Original author
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. library
  PDF resources and documents
  - `id` (uuid, PK)
  - `title` (text) - Resource title
  - `description` (text) - Resource description
  - `file_url` (text) - PDF file URL
  - `file_size` (bigint) - File size in bytes
  - `category` (text) - Resource category
  - `uploaded_by` (uuid, FK to profiles)
  - `download_count` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. comments
  User comments on posts
  - `id` (uuid, PK)
  - `post_id` (uuid, FK to posts)
  - `user_id` (uuid, FK to profiles)
  - `content` (text) - Comment text
  - `parent_id` (uuid, nullable, FK to comments) - For nested replies
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  
  All tables have Row Level Security enabled with appropriate policies:
  
  ### profiles
  - Anyone can view non-banned user profiles
  - Users can update their own profile (except role)
  - Admins and moderators can manage user roles
  
  ### posts
  - Anyone can view published posts
  - Writers, moderators, and admins can create posts
  - Authors can update their own posts
  - Admins and moderators can manage all posts
  
  ### books
  - Anyone can view books
  - Only admins can manage books
  
  ### library
  - Anyone can view library resources
  - Writers, moderators, and admins can upload resources
  - Uploaders and admins can manage their resources
  
  ### comments
  - Anyone can view comments
  - Authenticated users (non-banned) can create comments
  - Users can update/delete their own comments
  - Moderators and admins can manage all comments
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'moderator', 'admin', 'banned')),
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  cover_image_url text,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  cover_image_url text,
  author text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create library table
CREATE TABLE IF NOT EXISTS library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  file_url text NOT NULL,
  file_size bigint DEFAULT 0,
  category text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_library_category ON library(category);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view non-banned profiles"
  ON profiles FOR SELECT
  USING (role != 'banned');

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile except role"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Posts policies
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view their own posts"
  ON posts FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Writers and above can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('writer', 'moderator', 'admin')
    )
  );

CREATE POLICY "Authors can update their own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Moderators and admins can update any post"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Books policies
CREATE POLICY "Anyone can view books"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage books"
  ON books FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Library policies
CREATE POLICY "Anyone can view library resources"
  ON library FOR SELECT
  USING (true);

CREATE POLICY "Writers and above can upload resources"
  ON library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('writer', 'moderator', 'admin')
    )
  );

CREATE POLICY "Uploaders can update their own resources"
  ON library FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can update any resource"
  ON library FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete resources"
  ON library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated non-banned users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role != 'banned'
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Moderators and admins can update any comment"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Moderators and admins can delete any comment"
  ON comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_library_updated_at BEFORE UPDATE ON library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();