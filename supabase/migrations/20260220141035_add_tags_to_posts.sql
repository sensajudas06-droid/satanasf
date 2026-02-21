/*
  # Add Tags System to Posts

  ## Changes
  
  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Tag name
      - `slug` (text, unique) - URL-friendly version
      - `created_at` (timestamptz)
    
    - `post_tags`
      - `post_id` (uuid, foreign key to posts)
      - `tag_id` (uuid, foreign key to tags)
      - `created_at` (timestamptz)
      - Primary key: (post_id, tag_id)
  
  2. Security
    - Enable RLS on both tables
    - Anyone can read tags
    - Only authenticated writers/moderators/admins can create tags
    - Only post authors and admins can add/remove tags from posts
  
  ## Notes
  
  - This creates a many-to-many relationship between posts and tags
  - Tags can be reused across multiple posts
  - Each post can have multiple tags
*/

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Writers can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('writer', 'moderator', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Anyone can view post tags"
  ON post_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Writers can add tags to their posts"
  ON post_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.author_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

CREATE POLICY "Writers can remove tags from their posts"
  ON post_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.author_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );
