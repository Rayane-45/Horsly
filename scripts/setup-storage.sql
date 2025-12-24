-- =====================================================
-- CAVALY - Configuration Supabase Storage
-- À exécuter APRÈS init-database.sql
-- =====================================================

-- Note: La création du bucket doit être faite via l'interface Supabase
-- Storage > New bucket > Name: horse-images > Public bucket: ON

-- =====================================================
-- Policies pour le bucket horse-images
-- =====================================================

-- Policy 1: Permettre aux utilisateurs authentifiés d'uploader leurs images
-- L'image est stockée dans un dossier avec leur user_id
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'horse-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Permettre aux utilisateurs de mettre à jour leurs images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'horse-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Permettre aux utilisateurs de supprimer leurs images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'horse-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Permettre à tous de voir les images (bucket public)
CREATE POLICY "Public can view horse images"
ON storage.objects FOR SELECT
USING (bucket_id = 'horse-images');

-- =====================================================
-- Instructions de configuration manuelle
-- =====================================================

/*
Si les policies ci-dessus ne fonctionnent pas via SQL, 
configurer manuellement dans Supabase:

1. Aller dans Storage > horse-images > Policies
2. Cliquer sur "New Policy"
3. Créer les policies suivantes:

=== INSERT (Upload) ===
- Policy name: "Users can upload"
- Target roles: authenticated
- Policy definition:
  ((bucket_id = 'horse-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))

=== UPDATE ===
- Policy name: "Users can update"
- Target roles: authenticated
- Policy definition:
  ((bucket_id = 'horse-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))

=== DELETE ===
- Policy name: "Users can delete"
- Target roles: authenticated
- Policy definition:
  ((bucket_id = 'horse-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))

=== SELECT (Read) ===
- Policy name: "Public read"
- Target roles: public (ou anon + authenticated)
- Policy definition:
  (bucket_id = 'horse-images'::text)
*/
