/*
  # Social Media Links Configuration
  
  ## Overview
  Add social media links table for configurable social media connections
  
  ## New Tables
  
  ### site_settings
  Settings for the website including social media links
  - `id` (uuid, PK)
  - `key` (text, unique) - Setting key
  - `value` (text) - Setting value
  - `description` (text) - Setting description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## Security
  - Only super_admin can modify settings
  - Everyone can read settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default social media links
INSERT INTO site_settings (key, value, description) VALUES
  ('discord_invite', 'https://discord.gg/your-discord-invite', 'Discord server invite link'),
  ('instagram_url', 'https://instagram.com/your-instagram', 'Instagram profile URL'),
  ('tiktok_url', 'https://tiktok.com/@your-tiktok', 'TikTok profile URL')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only super_admin can modify settings
CREATE POLICY "Super admin can update settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can insert settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can delete settings"
  ON site_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
