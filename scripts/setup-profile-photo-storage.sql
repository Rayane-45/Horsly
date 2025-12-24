-- Script SQL pour sauvegarder les photos de profil des utilisateurs
-- À exécuter dans Supabase SQL Editor

-- 1. S'assurer que la colonne avatar_url existe dans profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Créer le bucket 'profiles' pour stocker les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- 4. Créer les politiques de storage pour les avatars

-- Les avatars sont publiquement accessibles (lecture)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

-- Les utilisateurs authentifiés peuvent uploader leur avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profiles' 
    AND auth.role() = 'authenticated'
  );

-- Les utilisateurs peuvent modifier n'importe quel fichier (pour permettre upsert)
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profiles' 
    AND auth.role() = 'authenticated'
  );

-- Les utilisateurs peuvent supprimer leur avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profiles' 
    AND auth.role() = 'authenticated'
  );

-- Note: Pour uploader une photo de profil depuis l'application:
-- 1. Upload le fichier dans storage: profiles/avatars/{userId}-{timestamp}.jpg
-- 2. Récupérer l'URL publique
-- 3. Mettre à jour profiles.avatar_url avec cette URL

-- Exemple d'URL: https://{project_ref}.supabase.co/storage/v1/object/public/profiles/avatars/{userId}-{timestamp}.jpg
