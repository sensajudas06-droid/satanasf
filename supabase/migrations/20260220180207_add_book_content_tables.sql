/*
  # Add Book Content Storage

  1. New Tables
    - `book_chapters`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `chapter_number` (integer)
      - `title` (text)
      - `content` (text, full chapter content)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `book_chapters` table
    - Add policy for public read access (books are public content)
    - Add policy for admin write access
  
  3. Changes
    - Allows storing complete book content in database
    - Chapters can be read sequentially
    - Easy navigation between chapters
*/

CREATE TABLE IF NOT EXISTS book_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(book_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_order ON book_chapters(book_id, chapter_number);

ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read book chapters"
  ON book_chapters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert book chapters"
  ON book_chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update book chapters"
  ON book_chapters
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete book chapters"
  ON book_chapters
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
