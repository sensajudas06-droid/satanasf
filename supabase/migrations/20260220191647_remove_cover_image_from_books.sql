/*
  # Remove cover_image_url from books table

  1. Changes
    - Drop `cover_image_url` column from `books` table
  
  2. Notes
    - Cover images are no longer needed for books display
    - This change is safe as cover images were optional and not critical to functionality
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE books DROP COLUMN cover_image_url;
  END IF;
END $$;
