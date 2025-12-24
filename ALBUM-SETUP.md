# Configuration de l'album photos pour Supabase

## 1. Créer la table `horse_photos`

Exécutez le script SQL dans Supabase :

```bash
# Dans le SQL Editor de Supabase Dashboard
```

Ou utilisez le fichier : `scripts/create-horse-photos-table.sql`

## 2. Vérifier le bucket Storage

Assurez-vous que le bucket `horse-images` existe déjà dans Supabase Storage avec les bonnes policies RLS.

Si ce n'est pas le cas, référez-vous au fichier `scripts/setup-storage.sql`.

## 3. Structure de la table

```sql
horse_photos (
  id              UUID PRIMARY KEY
  horse_id        UUID (FK -> horses)
  user_id         UUID (FK -> auth.users)
  url             TEXT (URL publique Supabase)
  storage_path    TEXT (chemin dans le bucket)
  caption         TEXT (légende optionnelle)
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
)
```

## 4. Routes API créées

### GET `/api/horses/[id]/photos`
Récupère toutes les photos d'un cheval.

**Réponse :**
```json
{
  "photos": [
    {
      "id": "uuid",
      "horse_id": "uuid",
      "url": "https://...",
      "storage_path": "user_id/timestamp.jpg",
      "caption": null,
      "created_at": "2025-12-24T10:00:00Z"
    }
  ]
}
```

### POST `/api/horses/[id]/photos`
Ajoute une photo à l'album (après upload du fichier).

**Body :**
```json
{
  "url": "https://...",
  "storage_path": "user_id/timestamp.jpg",
  "caption": "Ma belle photo"
}
```

### DELETE `/api/horses/[id]/photos/[photoId]`
Supprime une photo de l'album ET du storage.

## 5. Workflow complet

1. **Upload fichier** → `/api/upload/horse-image` (retourne url + path)
2. **Enregistrer en BDD** → `/api/horses/[id]/photos` (avec url + path)
3. **Supprimer** → `/api/horses/[id]/photos/[photoId]` (supprime BDD + Storage)

## 6. Composant mis à jour

Le composant `horse-album-tab.tsx` utilise maintenant :
- ✅ Chargement des photos depuis Supabase
- ✅ Upload vers Storage + enregistrement en BDD
- ✅ Suppression complète (BDD + Storage)
- ✅ État de chargement
- ✅ Gestion d'erreurs avec toasts

## 7. Tester

1. Exécutez le script SQL dans Supabase
2. Redémarrez le serveur Next.js si nécessaire
3. Allez sur la fiche d'un cheval → Onglet Album
4. Ajoutez une photo
5. Vérifiez dans Supabase que :
   - Le fichier est dans `horse-images`
   - L'entrée existe dans `horse_photos`
