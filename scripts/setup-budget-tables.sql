-- ========================================
-- Script d'installation complet du système budget
-- Exécutez ce script dans Supabase SQL Editor
-- ========================================

-- 1. Créer la table expenses (si elle n'existe pas)
-- ========================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID REFERENCES horses(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_period VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_horse_id ON expenses(horse_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category);

-- RLS pour expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own expenses" ON expenses;
CREATE POLICY "Users can create own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_expenses_updated_at ON expenses;
CREATE TRIGGER trigger_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expenses_updated_at();

-- 2. Créer la table budget_envelopes
-- ========================================
CREATE TABLE IF NOT EXISTS budget_envelopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Index pour budget_envelopes
CREATE INDEX IF NOT EXISTS idx_budget_envelopes_user_id ON budget_envelopes(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_envelopes_category ON budget_envelopes(category);

-- RLS pour budget_envelopes
ALTER TABLE budget_envelopes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own envelopes" ON budget_envelopes;
CREATE POLICY "Users can view own envelopes" ON budget_envelopes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own envelopes" ON budget_envelopes;
CREATE POLICY "Users can create own envelopes" ON budget_envelopes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own envelopes" ON budget_envelopes;
CREATE POLICY "Users can update own envelopes" ON budget_envelopes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own envelopes" ON budget_envelopes;
CREATE POLICY "Users can delete own envelopes" ON budget_envelopes
  FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_budget_envelopes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_budget_envelopes_updated_at ON budget_envelopes;
CREATE TRIGGER trigger_budget_envelopes_updated_at
  BEFORE UPDATE ON budget_envelopes
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_envelopes_updated_at();

-- Commentaires
COMMENT ON TABLE expenses IS 'Dépenses liées aux chevaux';
COMMENT ON COLUMN expenses.category IS 'Catégorie: vet, farrier, feed, boarding, equipment, training, competition, transport, insurance, other';
COMMENT ON TABLE budget_envelopes IS 'Enveloppes budgétaires mensuelles par catégorie';
COMMENT ON COLUMN budget_envelopes.category IS 'Catégorie de dépense (vet, feed, boarding, etc.)';
COMMENT ON COLUMN budget_envelopes.monthly_budget IS 'Budget mensuel alloué pour cette catégorie';

-- ========================================
-- Script terminé avec succès !
-- ========================================
