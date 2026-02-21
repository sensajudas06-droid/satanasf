/*
  # Add Social Features: Reactions, Bookmarks, and Views

  ## New Tables
  
  1. **post_reactions**
    - `id` (uuid, primary key)
    - `post_id` (uuid, foreign key to posts)
    - `user_id` (uuid, foreign key to profiles)
    - `reaction_type` (text) - 'like', 'fire', 'star'
    - `created_at` (timestamptz)
    - Unique constraint: (post_id, user_id, reaction_type)
  
  2. **post_bookmarks**
    - `id` (uuid, primary key)
    - `post_id` (uuid, foreign key to posts)
    - `user_id` (uuid, foreign key to profiles)
    - `created_at` (timestamptz)
    - Unique constraint: (post_id, user_id)
  
  3. **post_views**
    - `id` (uuid, primary key)
    - `post_id` (uuid, foreign key to posts)
    - `user_id` (uuid, foreign key to profiles, nullable for anonymous)
    - `viewed_at` (timestamptz)
    - `ip_address` (text, nullable)
  
  ## Security
  
  - Enable RLS on all tables
  - Users can create/delete their own reactions and bookmarks
  - Users can view reaction counts for any post
  - Views are tracked automatically and viewable by all
  
  ## Notes
  
  - Reactions support multiple types (like, fire, star)
  - Each user can only have one reaction per post per type
  - Bookmarks allow users to save posts for later reading
  - Views track post popularity for analytics
*/

CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'fire', 'star')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS post_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now(),
  ip_address text
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post_id ON post_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own reactions"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view bookmarks"
  ON post_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON post_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON post_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view post views"
  ON post_views FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create views"
  ON post_views FOR INSERT
  TO authenticated
  WITH CHECK (true);
