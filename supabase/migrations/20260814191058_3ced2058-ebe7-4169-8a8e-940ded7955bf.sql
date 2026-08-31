
CREATE POLICY "upload own report images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'denuncias' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "read report images" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'denuncias');

CREATE POLICY "admins upload resolution images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'denuncias' AND (storage.foldername(name))[1] = 'prefeitura' AND public.has_role(auth.uid(),'ADMIN'));
