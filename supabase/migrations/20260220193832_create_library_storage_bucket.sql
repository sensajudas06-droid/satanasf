/*
  # Create storage bucket for library files

  1. New Storage Bucket
    - `library-files` bucket for storing PDF and other document files
  
  2. Security
    - Allow authenticated users with writer, moderator, admin, or super_admin roles to upload files
    - Allow public read access to all files
    - Allow file owners and admins to delete files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'library-files',
  'library-files',
  true,
  52428800,
  ARRAY['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated writers can upload library files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'library-files' AND
  (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) IN ('writer', 'moderator', 'admin', 'super_admin')
);

CREATE POLICY "Public can view library files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'library-files');

CREATE POLICY "File owners and admins can delete library files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'library-files' AND
  (
    auth.uid() = owner OR
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('admin', 'super_admin')
  )
);

CREATE POLICY "File owners and admins can update library files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'library-files' AND
  (
    auth.uid() = owner OR
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('admin', 'super_admin')
  )
);