/*
  # Add Profile Settings Fields

  ## Changes
  
  1. New Columns
    - `display_name_changed_at` (timestamptz) - Tracks when display name was last changed
      - Used to enforce 13-day cooldown period
      - Default: current timestamp for existing users
  
  2. Notes
    - Display names can only be changed once every 13 days
    - Email and password changes are handled through Supabase Auth
    - Avatar URL already exists in profiles table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name_changed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name_changed_at timestamptz DEFAULT now();
  END IF;
END $$;