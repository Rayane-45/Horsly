-- =============================================
-- Migration: Ajouter les champs réseaux sociaux à profiles
-- Exécutez ce script dans Supabase SQL Editor
-- =============================================

-- Ajouter les nouveaux champs s'ils n'existent pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS snapchat TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Créer l'index pour le username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Mettre à jour les policies pour permettre la lecture publique des profils (pour afficher les avatars/noms)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Commentaires
COMMENT ON COLUMN public.profiles.username IS 'Pseudo unique de l''utilisateur';
COMMENT ON COLUMN public.profiles.instagram IS 'Nom d''utilisateur Instagram (sans @)';
COMMENT ON COLUMN public.profiles.snapchat IS 'Nom d''utilisateur Snapchat';
COMMENT ON COLUMN public.profiles.linkedin IS 'URL ou nom d''utilisateur LinkedIn';
COMMENT ON COLUMN public.profiles.website IS 'Site web personnel';
COMMENT ON COLUMN public.profiles.location IS 'Ville ou région';
