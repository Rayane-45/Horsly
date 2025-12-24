-- Script pour créer la table des enveloppes budgétaires
-- Exécutez ce script dans votre console Supabase SQL Editor

-- Créer la table budget_envelopes
CREATE TABLE IF NOT EXISTS budget_envelopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte d'unicité : une seule enveloppe par catégorie par utilisateur
  UNIQUE(user_id, category)
);

-- Index pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_budget_envelopes_user_id ON budget_envelopes(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_envelopes_category ON budget_envelopes(category);

-- Activer RLS (Row Level Security)
ALTER TABLE budget_envelopes ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs propres enveloppes
CREATE POLICY "Users can view own envelopes" ON budget_envelopes
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres enveloppes
CREATE POLICY "Users can create own envelopes" ON budget_envelopes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres enveloppes
CREATE POLICY "Users can update own envelopes" ON budget_envelopes
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres enveloppes
CREATE POLICY "Users can delete own envelopes" ON budget_envelopes
  FOR DELETE USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE budget_envelopes IS 'Enveloppes budgétaires mensuelles par catégorie';
COMMENT ON COLUMN budget_envelopes.category IS 'Catégorie de dépense (vet, feed, boarding, etc.)';
COMMENT ON COLUMN budget_envelopes.monthly_budget IS 'Budget mensuel alloué pour cette catégorie';
