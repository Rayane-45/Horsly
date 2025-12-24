# Configuration de l'upload de photo de profil

## ⚠️ Erreur courante : "Bucket does not exist"

Si vous rencontrez une erreur lors de l'upload de la photo de profil, c'est probablement parce que le bucket de storage n'existe pas encore dans Supabase.

## 🔧 Solution : Exécuter le script SQL

1. **Ouvrez votre projet Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez au SQL Editor**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "+ New query"

3. **Copiez et exécutez le script**
   - Ouvrez le fichier `scripts/setup-profile-photo-storage.sql`
   - Copiez tout le contenu
   - Collez-le dans le SQL Editor
   - Cliquez sur "Run" (ou appuyez sur Ctrl+Enter)

4. **Vérification**
   - Allez dans "Storage" dans le menu de gauche
   - Vous devriez voir un bucket nommé "profiles"
   - Le bucket doit être public (icône 🌐)

## ✅ Ce que le script fait

Le script SQL :
- ✅ Crée la colonne `avatar_url` dans la table `profiles` (si elle n'existe pas)
- ✅ Crée le bucket de storage `profiles` (public)
- ✅ Configure les politiques RLS pour permettre :
  - La lecture publique des avatars
  - L'upload uniquement par le propriétaire
  - La modification uniquement par le propriétaire
  - La suppression uniquement par le propriétaire

## 📁 Structure des fichiers dans Storage

Les avatars sont stockés dans le format suivant :
```
profiles/
  └── avatars/
      ├── {userId}-{timestamp}.jpg
      ├── {userId}-{timestamp}.png
      └── ...
```

## 🔒 Sécurité

- ✅ Les utilisateurs peuvent uniquement uploader/modifier/supprimer **leur propre** avatar
- ✅ Les avatars sont publiquement accessibles (pour l'affichage)
- ✅ Limite de taille : **5 Mo maximum**
- ✅ Types acceptés : images uniquement (jpg, png, gif, webp, etc.)

## 🐛 Dépannage

### L'erreur persiste après avoir exécuté le script

1. Vérifiez que le bucket existe bien dans Storage
2. Vérifiez que le bucket est public (Settings du bucket)
3. Vérifiez les policies RLS dans "Storage" > "Policies"

### "Row Level Security" erreur

Si vous obtenez une erreur RLS, vérifiez que les policies sont bien créées :
- `Avatar images are publicly accessible`
- `Users can upload their own avatar`
- `Users can update their own avatar`
- `Users can delete their own avatar`

### Problème de permissions

Assurez-vous d'être connecté dans l'application. L'upload nécessite une session utilisateur valide.
