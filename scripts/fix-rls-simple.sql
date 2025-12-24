-- Script FINAL pour corriger les politiques RLS
-- Exécutez ce script dans Supabase SQL Editor

-- 1. SUPPRIMER TOUTES les politiques existantes
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

-- 2. POLITIQUES SIMPLES - seulement basées sur user_id = auth.uid()
-- Pas de vérification admin dans les politiques RLS (l'API admin utilise le service_role)

-- HORSES
CREATE POLICY "Users can view own horses" ON horses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own horses" ON horses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own horses" ON horses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own horses" ON horses
  FOR DELETE USING (auth.uid() = user_id);

-- EXPENSES
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- HEALTH_EVENTS
CREATE POLICY "Users can view own health events" ON health_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health events" ON health_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health events" ON health_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health events" ON health_events
  FOR DELETE USING (auth.uid() = user_id);

-- TRAINING_SESSIONS
CREATE POLICY "Users can view own training sessions" ON training_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training sessions" ON training_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training sessions" ON training_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training sessions" ON training_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- PROFILES (si table existe)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Vérification
SELECT 'Politiques RLS simplifiées créées avec succès!' as status;
