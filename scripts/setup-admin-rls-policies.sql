-- Script pour configurer les politiques RLS permettant aux admins de voir toutes les données
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Politique pour que les utilisateurs puissent voir leur propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 4. Politique pour que les admins puissent voir tous les profils
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. Ajouter des politiques admin pour la table horses
DROP POLICY IF EXISTS "Admins can view all horses" ON horses;
CREATE POLICY "Admins can view all horses" ON horses
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 6. Ajouter des politiques admin pour la table expenses
DROP POLICY IF EXISTS "Admins can view all expenses" ON expenses;
CREATE POLICY "Admins can view all expenses" ON expenses
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 7. Assigner le rôle admin à rayane.sdlhh@gmail.com
INSERT INTO profiles (id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'rayane.sdlhh@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = NOW();

-- 8. Créer la fonction RPC pour récupérer tous les utilisateurs
CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier si l'utilisateur actuel est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accès refusé: administrateur requis';
  END IF;

  -- Retourner tous les utilisateurs depuis auth.users
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- 9. Accorder les permissions
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;

-- 10. Vérification
SELECT 'Configuration terminée!' as status;
SELECT id, email FROM auth.users;
SELECT * FROM profiles;
