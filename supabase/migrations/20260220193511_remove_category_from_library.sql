/*
  # Remove category column from library table

  1. Changes
    - Remove the `category` column from the `library` table as categories are no longer needed

  2. Notes
    - This is a non-destructive change since the category field is not critical for functionality
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'library' AND column_name = 'category'
  ) THEN
    ALTER TABLE library DROP COLUMN category;
  END IF;
END $$;