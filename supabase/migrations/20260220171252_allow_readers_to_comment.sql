/*
  # Allow Readers to Comment

  ## 1. Changes
    - Update comments table RLS policy to allow 'reader' role to create comments
    - Readers can now comment on posts just like any other authenticated user
    - Maintains ban check to prevent banned users from commenting

  ## 2. Security
    - Comments can only be created by authenticated, non-banned users
    - All existing comment policies remain intact (users can update/delete their own comments)
    - Moderators and above can still manage any comment
*/

-- =====================================================
-- Allow Readers to Comment
-- =====================================================

-- Drop the existing policy that only allowed authenticated users
DROP POLICY IF EXISTS "Authenticated non-banned users can create comments" ON public.comments;

-- Create new policy that explicitly allows readers and all other roles
CREATE POLICY "Authenticated non-banned users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_user_banned((SELECT auth.uid()))
    AND (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('reader', 'writer', 'moderator', 'admin', 'super_admin')
  );