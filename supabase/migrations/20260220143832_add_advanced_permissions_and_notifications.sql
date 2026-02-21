/*
  # Advanced Permissions and Notifications System
  
  ## Overview
  Comprehensive role-based permission system with temporary bans, post approval workflow, and notifications.
  
  ## New Tables
  
  ### 1. user_bans
  Temporary user bans with expiry dates
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles) - Banned user
  - `banned_by` (uuid, FK to profiles) - Admin/moderator who issued ban
  - `reason` (text) - Ban reason
  - `banned_until` (timestamptz) - Ban expiry date
  - `created_at` (timestamptz)
  
  ### 2. post_approvals
  Approval requests for writer posts
  - `id` (uuid, PK)
  - `post_id` (uuid, FK to posts)
  - `requested_by` (uuid, FK to profiles) - Writer requesting approval
  - `action_type` (text) - 'publish', 'delete'
  - `status` (text) - 'pending', 'approved', 'rejected'
  - `reviewed_by` (uuid, FK to profiles) - Admin/moderator who reviewed
  - `reviewed_at` (timestamptz)
  - `notes` (text) - Review notes
  - `created_at` (timestamptz)
  
  ### 3. notifications
  User notifications for various events
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles) - Recipient
  - `type` (text) - Notification type
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `link` (text) - Related link
  - `read` (boolean) - Read status
  - `created_at` (timestamptz)
  
  ## Changes
  
  ### profiles table
  - Add `banned_until` (timestamptz, nullable) - Quick ban check
  
  ### posts table
  - Add `approval_status` (text) - 'none', 'pending', 'approved', 'rejected'
  
  ## Security
  All tables have comprehensive RLS policies based on user roles:
  - Super admin: Full access to everything
  - Admin: Can ban writer/moderator/reader, manage all posts
  - Moderator: Can ban writer/reader, manage posts, delete comments
  - Writer: Can only edit own posts, requires approval for publish/delete
*/

-- Add banned_until to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_until timestamptz;

-- Add approval_status to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'none' CHECK (approval_status IN ('none', 'pending', 'approved', 'rejected'));

-- Create user_bans table
CREATE TABLE IF NOT EXISTS user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  banned_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create post_approvals table
CREATE TABLE IF NOT EXISTS post_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('publish', 'delete')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_bans_user ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_expiry ON user_bans(banned_until);
CREATE INDEX IF NOT EXISTS idx_post_approvals_status ON post_approvals(status);
CREATE INDEX IF NOT EXISTS idx_post_approvals_post ON post_approvals(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_profiles_banned_until ON profiles(banned_until);
CREATE INDEX IF NOT EXISTS idx_posts_approval_status ON posts(approval_status);

-- Enable RLS
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- user_bans policies
CREATE POLICY "Users can view their own bans"
  ON user_bans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins and moderators can view all bans"
  ON user_bans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

CREATE POLICY "Admins and moderators can create bans"
  ON user_bans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete bans"
  ON user_bans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- post_approvals policies
CREATE POLICY "Writers can view their own approval requests"
  ON post_approvals FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Admins and moderators can view all approvals"
  ON post_approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

CREATE POLICY "Writers can create approval requests"
  ON post_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'writer'
    )
  );

CREATE POLICY "Admins and moderators can update approvals"
  ON post_approvals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

-- notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to check if user is currently banned
CREATE OR REPLACE FUNCTION is_user_banned(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND banned_until IS NOT NULL
    AND banned_until > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for role change
CREATE OR REPLACE FUNCTION notify_admins_for_approval()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    id,
    'approval_request',
    'Yeni Onay Talebi',
    'Bir yazar yazı yayımlama/silme onayı bekliyor.',
    '/admin'
  FROM profiles
  WHERE role IN ('admin', 'moderator', 'super_admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new approval requests
CREATE TRIGGER on_approval_request_created
  AFTER INSERT ON post_approvals
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_admins_for_approval();

-- Function to update profile banned_until when ban is created
CREATE OR REPLACE FUNCTION update_profile_ban_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET banned_until = NEW.banned_until
  WHERE id = NEW.user_id;
  
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    NEW.user_id,
    'ban',
    'Hesabınız Geçici Olarak Yasaklandı',
    'Sebep: ' || NEW.reason || '. Yasak bitiş: ' || NEW.banned_until::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new bans
CREATE TRIGGER on_user_ban_created
  AFTER INSERT ON user_bans
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_ban_status();

-- Update existing RLS policies to check ban status

-- Update posts insert policy to check ban
DROP POLICY IF EXISTS "Writers and above can create posts" ON posts;

CREATE POLICY "Writers and above can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_user_banned(auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('writer', 'moderator', 'admin', 'super_admin')
    )
  );

-- Update comments insert policy to check ban
DROP POLICY IF EXISTS "Authenticated non-banned users can create comments" ON comments;

CREATE POLICY "Authenticated non-banned users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_user_banned(auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role != 'banned'
    )
  );
