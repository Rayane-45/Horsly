-- Script pour CORRIGER les politiques RLS et éliminer la récursion infinie
-- Exécutez ce script dans Supabase SQL Editor

-- 1. SUPPRIMER TOUTES les anciennes politiques (toutes les variantes possibles)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own horses" ON horses;
DROP POLICY IF EXISTS "Users can insert own horses" ON horses;
DROP POLICY IF EXISTS "Users can update own horses" ON horses;
DROP POLICY IF EXISTS "Users can delete own horses" ON horses;
DROP POLICY IF EXISTS "Admins can view all horses" ON horses;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can view all expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view own health events" ON health_events;
DROP POLICY IF EXISTS "Users can insert own health events" ON health_events;
DROP POLICY IF EXISTS "Users can update own health events" ON health_events;
DROP POLICY IF EXISTS "Users can delete own health events" ON health_events;
DROP POLICY IF EXISTS "Admins can view all health events" ON health_events;

DROP POLICY IF EXISTS "Users can view own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can insert own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can update own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can delete own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Admins can view all training sessions" ON training_sessions;

-- 2. Créer des politiques SIMPLES sans récursion
-- Pour profiles: accès direct sans vérification récursive
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Pour horses: accès basé sur user_id OU email admin
CREATE POLICY "Users can view own horses" ON horses
  FOR SELECT USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('rayane.sdlhh@gmail.com', 'admin@cavaly.com')
    )
  );

CREATE POLICY "Users can insert own horses" ON horses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own horses" ON horses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own horses" ON horses
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Pour expenses: accès basé sur user_id OU email admin
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('rayane.sdlhh@gmail.com', 'admin@cavaly.com')
    )
  );

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Pour health_events: accès basé sur user_id OU email admin
CREATE POLICY "Users can view own health events" ON health_events
  FOR SELECT USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('rayane.sdlhh@gmail.com', 'admin@cavaly.com')
    )
  );

CREATE POLICY "Users can insert own health events" ON health_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health events" ON health_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health events" ON health_events
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Pour training_sessions: accès basé sur user_id OU email admin
CREATE POLICY "Users can view own training sessions" ON training_sessions
  FOR SELECT USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('rayane.sdlhh@gmail.com', 'admin@cavaly.com')
    )
  );

CREATE POLICY "Users can insert own training sessions" ON training_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training sessions" ON training_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training sessions" ON training_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Fonction RPC simplifiée pour les admins
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
  -- Vérifier si l'email est admin (sans utiliser profiles pour éviter la récursion)
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('rayane.sdlhh@gmail.com', 'admin@cavaly.com')
  ) THEN
    RAISE EXCEPTION 'Accès refusé: administrateur requis';
  END IF;

  -- Retourner tous les utilisateurs
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;

-- 8. Vérification
SELECT 'Politiques RLS corrigées avec succès!' as status;
