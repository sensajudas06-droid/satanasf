/*
  # Add Super Admin Role
  
  ## Changes
  
  1. Role System Enhancement
    - Add 'super_admin' role as the highest authority level
    - Update role check constraint to include super_admin
    - Only super_admin can assign/change admin roles
  
  2. Security
    - Update RLS policies to recognize super_admin authority
    - Super admin has full control over all operations
    
  ## Notes
  
  - Super admin is the only role that can manage other admins
  - This creates a founder-level access separate from regular admins
*/

-- Update the role check constraint to include super_admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('reader', 'writer', 'moderator', 'admin', 'super_admin', 'banned'));

-- Update RLS policies for profiles to allow super_admin full access
DROP POLICY IF EXISTS "Users can update own role" ON profiles;

CREATE POLICY "Super admin can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Users can update own profile (non-role fields)"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- User can't change their own role unless they're super_admin
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
      )
    )
  );