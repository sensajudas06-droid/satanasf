/*
  # Update library storage bucket file size limit

  1. Changes
    - Update `library-files` bucket file size limit from 50MB to 250MB (262144000 bytes)
*/

UPDATE storage.buckets
SET file_size_limit = 262144000
WHERE id = 'library-files';