-- KeevOS Supabase Storage Setup

-- Create private documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'keevos-documents',
  'keevos-documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies

-- Only authenticated users can read files (server generates signed URLs)
CREATE POLICY "authenticated_read" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'keevos-documents'
  AND auth.role() = 'authenticated'
);

-- Staff and above can upload files
CREATE POLICY "staff_upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'keevos-documents'
  AND auth.role() = 'authenticated'
);

-- Only managers and above can delete files
CREATE POLICY "manager_delete" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'keevos-documents'
  AND (
    SELECT role FROM profiles WHERE auth_user_id = auth.uid()
  ) IN ('MANAGER', 'ADMIN', 'OWNER')
);
