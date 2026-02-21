/*
  # Create social media settings table

  1. New Tables
    - `social_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `discord_url` (text) - Discord server invite link
      - `instagram_url` (text) - Instagram profile link
      - `tiktok_url` (text) - TikTok profile link
      - `updated_at` (timestamptz) - Last update timestamp
      - `updated_by` (uuid, foreign key) - Reference to user who updated

  2. Security
    - Enable RLS on `social_settings` table
    - Add policy for all authenticated users to read settings
    - Add policy for super_admin users to update settings

  3. Initial Data
    - Insert default row with empty values
*/

CREATE TABLE IF NOT EXISTS social_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_url text DEFAULT '',
  instagram_url text DEFAULT '',
  tiktok_url text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE social_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read social settings"
  ON social_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can update social settings"
  ON social_settings
  FOR UPDATE
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

INSERT INTO social_settings (discord_url, instagram_url, tiktok_url)
VALUES ('', '', '')
ON CONFLICT (id) DO NOTHING;