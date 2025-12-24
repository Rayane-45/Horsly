-- Fonction RPC pour que les admins puissent voir tous les utilisateurs avec leurs emails
-- Cette fonction doit être créée dans Supabase SQL Editor

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

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;

COMMENT ON FUNCTION get_all_users_admin() IS 'Permet aux administrateurs de récupérer la liste de tous les utilisateurs avec leurs emails';
