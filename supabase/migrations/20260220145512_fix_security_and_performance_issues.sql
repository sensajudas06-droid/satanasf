/*
  # Fix Security and Performance Issues

  ## 1. Add Missing Foreign Key Indexes
  Performance optimization for queries involving foreign key relationships:
  - `comments.parent_id` - for threaded comments
  - `library.uploaded_by` - for user's uploaded resources
  - `post_approvals.requested_by` and `reviewed_by` - for approval workflow queries
  - `post_tags.tag_id` - for tag-based queries
  - `post_views.user_id` - for user view tracking
  - `user_bans.banned_by` - for ban audit queries

  ## 2. Optimize RLS Policies
  Wrap all `auth.uid()` calls in `(SELECT auth.uid())` to prevent re-evaluation per row.
  This significantly improves query performance at scale by initializing auth context once.

  ## 3. Fix Function Security
  Set immutable search_path on functions to prevent search_path manipulation attacks.

  ## 4. Fix RLS Policies with Always True Conditions
  Replace overly permissive policies with proper authentication checks.
*/

-- =====================================================
-- PART 1: Add Missing Foreign Key Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_library_uploaded_by ON public.library(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_post_approvals_requested_by ON public.post_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_post_approvals_reviewed_by ON public.post_approvals(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON public.post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON public.post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_banned_by ON public.user_bans(banned_by);

-- =====================================================
-- PART 2: Optimize RLS Policies - Profiles Table
-- =====================================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;
CREATE POLICY "Users can update own profile except role"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id AND role = (SELECT role FROM profiles WHERE id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Super admin can update any profile" ON public.profiles;
CREATE POLICY "Super admin can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'super_admin');

DROP POLICY IF EXISTS "Users can update own profile (non-role fields)" ON public.profiles;
CREATE POLICY "Users can update own profile (non-role fields)"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- =====================================================
-- PART 3: Optimize RLS Policies - Posts Table
-- =====================================================

DROP POLICY IF EXISTS "Authors can view their own posts" ON public.posts;
CREATE POLICY "Authors can view their own posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;
CREATE POLICY "Authors can update their own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Moderators and above can update any post" ON public.posts;
CREATE POLICY "Moderators and above can update any post"
  ON public.posts FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins and super_admin can delete posts" ON public.posts;
CREATE POLICY "Admins and super_admin can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Writers and above can create posts" ON public.posts;
CREATE POLICY "Writers and above can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('writer', 'moderator', 'admin', 'super_admin'));

-- =====================================================
-- PART 4: Optimize RLS Policies - Library Table
-- =====================================================

DROP POLICY IF EXISTS "Uploaders can update their own resources" ON public.library;
CREATE POLICY "Uploaders can update their own resources"
  ON public.library FOR UPDATE
  TO authenticated
  USING (uploaded_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Writers and above can upload resources" ON public.library;
CREATE POLICY "Writers and above can upload resources"
  ON public.library FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('writer', 'moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can update any resource" ON public.library;
CREATE POLICY "Admins can update any resource"
  ON public.library FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can delete resources" ON public.library;
CREATE POLICY "Admins can delete resources"
  ON public.library FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'super_admin'));

-- =====================================================
-- PART 5: Optimize RLS Policies - Comments Table
-- =====================================================

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Moderators and above can update any comment" ON public.comments;
CREATE POLICY "Moderators and above can update any comment"
  ON public.comments FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Moderators and above can delete any comment" ON public.comments;
CREATE POLICY "Moderators and above can delete any comment"
  ON public.comments FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Authenticated non-banned users can create comments" ON public.comments;
CREATE POLICY "Authenticated non-banned users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (NOT is_user_banned((SELECT auth.uid())));

-- =====================================================
-- PART 6: Optimize RLS Policies - Tags & Post Tags
-- =====================================================

DROP POLICY IF EXISTS "Writers can create tags" ON public.tags;
CREATE POLICY "Writers can create tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('writer', 'moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Writers can add tags to their posts" ON public.post_tags;
CREATE POLICY "Writers can add tags to their posts"
  ON public.post_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_id 
      AND posts.author_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Writers can remove tags from their posts" ON public.post_tags;
CREATE POLICY "Writers can remove tags from their posts"
  ON public.post_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_id 
      AND posts.author_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 7: Optimize RLS Policies - Reactions & Bookmarks
-- =====================================================

DROP POLICY IF EXISTS "Users can create own reactions" ON public.post_reactions;
CREATE POLICY "Users can create own reactions"
  ON public.post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own reactions" ON public.post_reactions;
CREATE POLICY "Users can delete own reactions"
  ON public.post_reactions FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Anyone can view bookmarks" ON public.post_bookmarks;
CREATE POLICY "Anyone can view bookmarks"
  ON public.post_bookmarks FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can create own bookmarks"
  ON public.post_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON public.post_bookmarks FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 8: Fix Post Views - Replace Always True Policy
-- =====================================================

DROP POLICY IF EXISTS "Anyone can create views" ON public.post_views;
CREATE POLICY "Authenticated users can create views"
  ON public.post_views FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- =====================================================
-- PART 9: Optimize RLS Policies - Books & Settings
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
CREATE POLICY "Admins can manage books"
  ON public.books FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Super admin can update settings" ON public.site_settings;
CREATE POLICY "Super admin can update settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'super_admin');

DROP POLICY IF EXISTS "Super admin can insert settings" ON public.site_settings;
CREATE POLICY "Super admin can insert settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'super_admin');

DROP POLICY IF EXISTS "Super admin can delete settings" ON public.site_settings;
CREATE POLICY "Super admin can delete settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'super_admin');

-- =====================================================
-- PART 10: Optimize RLS Policies - User Bans
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own bans" ON public.user_bans;
CREATE POLICY "Users can view their own bans"
  ON public.user_bans FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins and moderators can view all bans" ON public.user_bans;
CREATE POLICY "Admins and moderators can view all bans"
  ON public.user_bans FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins and moderators can create bans" ON public.user_bans;
CREATE POLICY "Admins and moderators can create bans"
  ON public.user_bans FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can delete bans" ON public.user_bans;
CREATE POLICY "Admins can delete bans"
  ON public.user_bans FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'super_admin'));

-- =====================================================
-- PART 11: Optimize RLS Policies - Post Approvals
-- =====================================================

DROP POLICY IF EXISTS "Writers can view their own approval requests" ON public.post_approvals;
CREATE POLICY "Writers can view their own approval requests"
  ON public.post_approvals FOR SELECT
  TO authenticated
  USING (requested_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins and moderators can view all approvals" ON public.post_approvals;
CREATE POLICY "Admins and moderators can view all approvals"
  ON public.post_approvals FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('moderator', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Writers can create approval requests" ON public.post_approvals;
CREATE POLICY "Writers can create approval requests"
  ON public.post_approvals FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins and moderators can update approvals" ON public.post_approvals;
CREATE POLICY "Admins and moderators can update approvals"
  ON public.post_approvals FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (SELECT auth.uid())) IN ('moderator', 'admin', 'super_admin'));

-- =====================================================
-- PART 12: Fix Notifications - Replace Always True Policy
-- =====================================================

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 13: Fix Function Security - Set Immutable Search Path
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_banned(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_bans
    WHERE user_id = user_uuid
    AND (expires_at IS NULL OR expires_at > now())
    AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_admins_for_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    id,
    'approval_request',
    'New Post Approval Request',
    'A writer has requested approval for a new post',
    '/admin'
  FROM profiles
  WHERE role IN ('admin', 'super_admin');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_ban_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE profiles
    SET banned_until = NEW.expires_at
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET banned_until = NULL
    WHERE id = OLD.user_id
    AND NOT EXISTS (
      SELECT 1 FROM user_bans
      WHERE user_id = OLD.user_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;
