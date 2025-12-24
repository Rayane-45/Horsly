-- Migration: Ajouter le support des vidéos dans horse_photos
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne media_type si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'horse_photos' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE horse_photos 
    ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image' 
    CHECK (media_type IN ('image', 'video'));
  END IF;
END $$;

-- Mettre à jour toutes les entrées existantes pour être de type 'image'
UPDATE horse_photos SET media_type = 'image' WHERE media_type IS NULL;
