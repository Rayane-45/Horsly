# Nouvelles fonctionnalités Album - Résumé

## ✅ Fonctionnalités ajoutées

### 1. Gestion complète de la photo de profil du cheval

**Cliquer sur l'icône 📷 ouvre un dialog avec 2 options :**
- **Changer la photo** : Uploader une nouvelle image
- **Supprimer la photo** : Revenir à l'icône 🐴 par défaut

### 2. Support des vidéos dans l'album

**L'album accepte maintenant :**
- 🖼️ **Images** (JPG, PNG, WEBP) - Max 10 Mo
- 🎥 **Vidéos** (MP4, MOV, WEBM) - Max 50 Mo

**Affichage :**
- Les vidéos affichent une icône ▶️ Play dans la grille
- Clic sur une vidéo → Lecteur plein écran avec contrôles

### 3. Suppression des médias dans l'album

**Bouton supprimer visible au survol** de chaque photo/vidéo :
- Dans la grille (icône 🗑️ en haut à droite)
- Dans le lightbox/lecteur (bouton rouge en haut à gauche)

## 📋 Migration à effectuer

Exécutez ce script SQL dans Supabase pour ajouter le support vidéo :

```sql
-- Fichier: scripts/add-video-support.sql
```

Ou copiez/collez dans le **SQL Editor** :

```sql
ALTER TABLE horse_photos 
ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image' 
CHECK (media_type IN ('image', 'video'));

UPDATE horse_photos SET media_type = 'image' WHERE media_type IS NULL;
```

## 🎯 Utilisation

### Changer/Supprimer la photo du cheval
1. Allez sur la fiche d'un cheval
2. Cliquez sur l'icône **📷 Camera** (en bas à droite de la photo)
3. Choisissez :
   - **Changer la photo** → Sélectionnez une nouvelle image
   - **Supprimer la photo** → Revient au 🐴 par défaut

### Ajouter une vidéo à l'album
1. Allez sur l'onglet **Album**
2. Cliquez sur **Ajouter**
3. Sélectionnez une vidéo (MP4, MOV, WEBM)
4. La vidéo apparaît avec l'icône ▶️
5. Cliquez pour lire en plein écran

### Supprimer un média
1. **Dans la grille** : Survolez la photo/vidéo → Cliquez sur 🗑️
2. **Dans le lecteur** : Cliquez sur le bouton rouge en haut à gauche

## 📊 Structure des données

```typescript
interface Photo {
  id: string
  horse_id: string
  user_id: string
  url: string
  storage_path: string
  media_type: 'image' | 'video'  // ← NOUVEAU
  caption?: string
  created_at: string
}
```

## 🔧 Limites techniques

- **Images** : 10 Mo max
- **Vidéos** : 50 Mo max
- Formats supportés :
  - Images : JPG, PNG, GIF, WEBP
  - Vidéos : MP4, MOV, WEBM, AVI

## ✨ Améliorations futures possibles

- [ ] Réorganiser l'ordre des photos (drag & drop)
- [ ] Ajouter des légendes aux photos
- [ ] Filtrer par type (images / vidéos)
- [ ] Télécharger les médias
- [ ] Partager un album
