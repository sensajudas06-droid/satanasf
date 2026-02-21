/*
  # Fix Super Admin Posts Permissions
  
  ## Overview
  This migration fixes RLS policies for posts table to properly include super_admin role.
  
  ## Changes
  
  1. Posts Table Policies
    - Update "Writers and above can create posts" to include super_admin
    - Update "Moderators and admins can update any post" to include super_admin  
    - Update "Admins can delete posts" to include super_admin
    
  2. Books Table Policies
    - Update "Admins can manage books" to include super_admin
    
  3. Library Table Policies
    - Update all admin-level policies to include super_admin
    
  ## Security
  Super admin now has full access to all content management operations.
*/

-- Drop and recreate posts policies with super_admin included

-- Drop existing policies
DROP POLICY IF EXISTS "Writers and above can create posts" ON posts;
DROP POLICY IF EXISTS "Moderators and admins can update any post" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- Recreate with super_admin included
CREATE POLICY "Writers and above can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('writer', 'moderator', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Moderators and above can update any post"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('moderator', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins and super_admin can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Update books policies
DROP POLICY IF EXISTS "Admins can manage books" ON books;

CREATE POLICY "Admins can manage books"
  ON books FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Update library policies
DROP POLICY IF EXISTS "Writers and above can upload resources" ON library;
DROP POLICY IF EXISTS "Admins can update any resource" ON library;
DROP POLICY IF EXISTS "Admins can delete resources" ON library;

CREATE POLICY "Writers and above can upload resources"
  ON library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('writer', 'moderator', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update any resource"
  ON library FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete resources"
  ON library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Update comments moderator policies
DROP POLICY IF EXISTS "Moderators and admins can update any comment" ON comments;
DROP POLICY IF EXISTS "Moderators and admins can delete any comment" ON comments;

CREATE POLICY "Moderators and above can update any comment"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('moderator', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Moderators and above can delete any comment"
  ON comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('moderator', 'admin', 'super_admin')
    )
  );
