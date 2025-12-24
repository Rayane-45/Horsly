-- Table pour les photos d'album des chevaux
CREATE TABLE IF NOT EXISTS horse_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_horse_photos_horse_id ON horse_photos(horse_id);
CREATE INDEX IF NOT EXISTS idx_horse_photos_user_id ON horse_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_horse_photos_created_at ON horse_photos(created_at DESC);

-- RLS Policies
ALTER TABLE horse_photos ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les photos de leurs chevaux
CREATE POLICY "Users can view their horse photos"
  ON horse_photos FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent ajouter des photos à leurs chevaux
CREATE POLICY "Users can insert their horse photos"
  ON horse_photos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM horses
      WHERE horses.id = horse_photos.horse_id
      AND horses.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer leurs photos
CREATE POLICY "Users can delete their horse photos"
  ON horse_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_horse_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_horse_photos_updated_at
  BEFORE UPDATE ON horse_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_horse_photos_updated_at();
