-- Create storage bucket for retreat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('retreat-images', 'retreat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for retreat images
CREATE POLICY "Anyone can view retreat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated users can upload retreat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'retreat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own retreat images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'retreat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own retreat images"
ON storage.objects FOR DELETE
USING (bucket_id = 'retreat-images' AND auth.uid()::text = (storage.foldername(name))[1]);