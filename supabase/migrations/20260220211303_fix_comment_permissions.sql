/*
  # Fix Comment Permissions

  1. Changes
    - Drop existing INSERT policy that requires user_id matching
    - Create new policy allowing all authenticated non-banned users to insert comments
    - The user_id will be set by the application and verified by policy
  
  2. Security
    - Users must be authenticated
    - Users must not be banned
    - Each user can only insert comments with their own user_id
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can create comments" ON comments;

-- Create new policy that allows authenticated users to insert comments
-- but ensures they can only set their own user_id
CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.banned_until > now()
    )
  );
