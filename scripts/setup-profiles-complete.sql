-- ============================================
-- Script complet pour configurer la table profiles
-- Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- 1. Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 200),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter les colonnes manquantes (email, username et réseaux sociaux)
-- Ces commandes sont idempotentes (n'échouent pas si la colonne existe déjà)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS snapchat TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Ajouter la contrainte bio si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_bio_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_bio_check CHECK (char_length(bio) <= 200);
  END IF;
END $$;

-- 3. Ajouter les contraintes
-- Contrainte d'unicité sur username (si pas déjà présente)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Contrainte de format sur username (lettres minuscules, chiffres, underscores)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_format'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_format 
      CHECK (username IS NULL OR username ~ '^[a-z0-9_]+$');
  END IF;
END $$;

-- Contrainte de longueur sur username (max 30 caractères)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_length'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_length 
      CHECK (username IS NULL OR char_length(username) <= 30);
  END IF;
END $$;

-- 4. Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Supprimer les anciennes policies (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- 6. Créer les nouvelles policies RLS
-- Lecture : chaque utilisateur peut voir son propre profil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Insertion : chaque utilisateur peut créer son propre profil
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Mise à jour : chaque utilisateur peut modifier son propre profil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Créer un trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Créer les profils manquants pour les utilisateurs existants
-- Utilise DO pour gérer les erreurs si la colonne email n'existe pas encore
DO $$
BEGIN
  INSERT INTO profiles (id, email, created_at, updated_at)
  SELECT au.id, au.email, au.created_at, NOW()
  FROM auth.users au
  WHERE au.id NOT IN (SELECT id FROM profiles)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN undefined_column THEN
    -- Si la colonne email n'existe pas encore, insérer sans elle
    INSERT INTO profiles (id, created_at, updated_at)
    SELECT au.id, au.created_at, NOW()
    FROM auth.users au
    WHERE au.id NOT IN (SELECT id FROM profiles)
    ON CONFLICT (id) DO NOTHING;
    
    -- Puis mettre à jour avec l'email
    UPDATE profiles p
    SET email = au.email
    FROM auth.users au
    WHERE p.id = au.id AND p.email IS NULL;
END $$;

-- ============================================
-- Vérification finale
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
