-- Script de correction pour les champs height et weight dans la table horses
-- À exécuter dans Supabase SQL Editor

-- Le champ height était DECIMAL(4,2) ce qui limite à 99.99
-- Un cheval mesure généralement entre 120 et 200 cm
-- On passe à DECIMAL(5,2) pour permettre jusqu'à 999.99 cm

ALTER TABLE horses 
ALTER COLUMN height TYPE DECIMAL(5,2);

-- Vérification
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'horses' AND column_name IN ('height', 'weight');
