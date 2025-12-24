# 🚀 Guide de Déploiement en Production

## ⚠️ Avant de Commencer

**IMPORTANT :** Lisez attentivement ce guide avant de déployer en production.

### Prérequis
- [ ] Accès à Supabase Dashboard (admin)
- [ ] Accès au dépôt Git
- [ ] Environnement de staging pour tester
- [ ] Backup de la base de données

---

## 📋 Checklist de Déploiement

### Étape 1 : Backup 🔐

```bash
# Via Supabase Dashboard
# Settings → Database → Create Backup

# Ou via CLI
supabase db dump -f backup-$(date +%Y%m%d).sql
```

**Vérification :**
- [ ] Backup créé avec succès
- [ ] Backup téléchargé localement
- [ ] Backup testé (restauration en local)

---

### Étape 2 : Base de Données (Production) 🗄️

#### 2.1 Exécuter le script SQL

1. **Ouvrez Supabase Dashboard**
   ```
   https://app.supabase.com/project/[VOTRE_PROJECT_ID]
   ```

2. **Naviguez vers SQL Editor**
   ```
   Left menu → SQL Editor → New Query
   ```

3. **Copiez-collez le script**
   ```sql
   -- Contenu du fichier : scripts/create-profiles-table.sql
   ```

4. **Exécutez (RUN)**
   ```
   Ctrl+Enter ou bouton "Run"
   ```

5. **Vérifiez le résultat**
   ```sql
   -- Pas d'erreur affichée
   -- Success: "[nombre] rows affected"
   ```

#### 2.2 Vérifications post-migration

```sql
-- Vérifier que la table existe
SELECT * FROM profiles LIMIT 1;

-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Vérifier le bucket storage
SELECT * FROM storage.buckets WHERE id = 'profiles';

-- Vérifier les policies storage
SELECT * FROM storage.policies WHERE bucket_id = 'profiles';

-- Vérifier le trigger
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

**Checklist Vérifications :**
- [ ] Table `profiles` existe
- [ ] 3 policies RLS sur `profiles`
- [ ] Bucket `profiles` existe et est public
- [ ] 4 policies sur `storage.objects`
- [ ] Trigger `on_auth_user_created` actif
- [ ] Index `idx_profiles_email` créé

---

### Étape 3 : Code (Git) 📦

#### 3.1 Créer une branche

```bash
# Depuis main/master
git checkout -b feature/budget-analytics-profile

# Vérifier les changements
git status
```

#### 3.2 Commit et push

```bash
# Ajouter tous les fichiers
git add .

# Commit avec message descriptif
git commit -m "feat: Add Budget Analytics Bar Charts and User Profile Settings

- Replace text comparisons with interactive Bar Charts (Recharts)
- Add horse comparison Bar Chart with dynamic colors
- Add monthly comparison Bar Chart with trend indicators
- Create user profile page with settings
- Add display name and bio editing
- Add avatar upload functionality
- Create profiles table and storage bucket
- Add navigation links to profile page
- Update documentation with guides and quickstart

Closes #[ISSUE_NUMBER]"

# Push vers remote
git push origin feature/budget-analytics-profile
```

#### 3.3 Créer une Pull Request

1. **Via GitHub/GitLab**
   - Ouvrez le lien fourni après le push
   - Ou allez sur le dépôt → Pull Requests → New

2. **Remplissez la description**
   ```markdown
   ## 🎯 Objectifs
   - Bar Charts pour Budget Analytics
   - Page de profil utilisateur avec paramètres
   
   ## ✅ Fonctionnalités
   - [x] Comparer les chevaux (Bar Chart)
   - [x] Comparer les mois (Bar Chart)
   - [x] Profil utilisateur
   - [x] Modification pseudo et bio
   - [x] Upload de photo de profil
   
   ## 🗄️ Base de données
   - Table `profiles` créée
   - Bucket `profiles` créé
   - Policies RLS configurées
   
   ## 📚 Documentation
   - README-NEW-FEATURES.md
   - QUICKSTART-NEW-FEATURES.md
   - CHANGELOG-NEW-FEATURES.md
   
   ## 🧪 Tests
   - [ ] Testé en local
   - [ ] Testé en staging
   - [ ] Tests manuels validés
   - [ ] Pas de régression
   ```

3. **Demandez une review**

4. **Attendez l'approbation**

---

### Étape 4 : Déploiement Staging 🧪

#### 4.1 Merger sur staging

```bash
git checkout staging
git merge feature/budget-analytics-profile
git push origin staging
```

#### 4.2 Vérifier le déploiement auto

```bash
# Si Vercel/Netlify
# Attendre le déploiement automatique
# Vérifier les logs

# Si manuel
npm run build
npm run start
```

#### 4.3 Tests en staging

**Checklist Tests :**

**Budget Analytics :**
- [ ] Accéder à `/budget`
- [ ] Cliquer sur "Analyses"
- [ ] Sélectionner "Comparer les chevaux"
  - [ ] Le graphique s'affiche
  - [ ] Les barres ont des couleurs différentes
  - [ ] Le tooltip fonctionne au survol
  - [ ] Les animations sont fluides
  - [ ] Responsive (mobile, tablet, desktop)
- [ ] Sélectionner "Comparer les mois"
  - [ ] Le graphique s'affiche
  - [ ] Les barres sont colorées (rouge/vert)
  - [ ] Le tooltip fonctionne au survol
  - [ ] Les 3 cartes de stats s'affichent
  - [ ] Responsive (mobile, tablet, desktop)

**Profil :**
- [ ] Se connecter
- [ ] Cliquer sur avatar → "Mon profil"
- [ ] La page se charge correctement
- [ ] L'avatar par défaut affiche les initiales
- [ ] Modifier le pseudo
  - [ ] Saisir un nouveau pseudo
  - [ ] Cliquer "Enregistrer"
  - [ ] Message de succès affiché
  - [ ] Le pseudo est mis à jour
- [ ] Modifier la bio
  - [ ] Saisir une bio
  - [ ] Compteur fonctionne (X/200)
  - [ ] Cliquer "Enregistrer"
  - [ ] Message de succès affiché
  - [ ] La bio est mise à jour
- [ ] Upload de photo
  - [ ] Cliquer "Choisir une photo"
  - [ ] Sélectionner une image < 5 Mo
  - [ ] Prévisualisation s'affiche
  - [ ] Cliquer "Enregistrer la photo"
  - [ ] Message de succès affiché
  - [ ] La photo est mise à jour
  - [ ] La photo s'affiche dans le header
- [ ] Tester les erreurs
  - [ ] Image > 5 Mo → Message d'erreur
  - [ ] Fichier non-image → Message d'erreur
  - [ ] Pseudo > 50 car. → Limité à 50
  - [ ] Bio > 200 car. → Limitée à 200

**Navigation :**
- [ ] Lien "Mon profil" dans header dropdown
- [ ] Lien "Mon profil" dans sidebar (desktop)
- [ ] Liens fonctionnent et redirigent correctement

**Responsive :**
- [ ] Mobile (< 640px)
- [ ] Tablet (640-1024px)
- [ ] Desktop (> 1024px)

**Performance :**
- [ ] Lighthouse Score > 90
- [ ] Pas de lag sur les animations
- [ ] Upload rapide (< 3s)

---

### Étape 5 : Déploiement Production 🚀

#### 5.1 Merger sur production

```bash
git checkout main  # ou master
git merge staging
git push origin main
```

#### 5.2 Vérifier le déploiement

```bash
# Attendre le déploiement automatique
# Vérifier les logs de déploiement
# Pas d'erreurs
```

#### 5.3 Tests de santé

```bash
# Vérifier que le site est accessible
curl -I https://votre-domaine.com

# Vérifier les API routes
curl https://votre-domaine.com/api/profile

# Vérifier Supabase
# Dashboard → Logs → Pas d'erreurs critiques
```

#### 5.4 Monitoring

**À surveiller pendant 24h :**
- [ ] Logs d'erreurs Supabase
- [ ] Logs d'erreurs Vercel/Netlify
- [ ] Métriques de performance
- [ ] Utilisation du storage (avatars)
- [ ] Nombre de requêtes API

---

### Étape 6 : Communication 📢

#### 6.1 Annoncer les nouvelles fonctionnalités

**Email / Newsletter :**
```
Objet : 🎉 Nouvelles fonctionnalités Cavaly !

Bonjour,

Nous sommes ravis de vous annoncer deux nouvelles fonctionnalités :

📊 Budget Analytics
Visualisez vos dépenses avec des graphiques interactifs :
- Comparez les dépenses par cheval
- Analysez l'évolution sur 12 mois
- Identifiez rapidement les tendances

👤 Profil Cavalier
Personnalisez votre profil :
- Ajoutez un pseudo
- Téléchargez une photo de profil
- Présentez-vous avec une bio

Pour en profiter, rendez-vous sur votre tableau de bord !

À bientôt,
L'équipe Cavaly
```

#### 6.2 Documentation utilisateur

Créez une page d'aide :
- Guide d'utilisation des graphiques
- Guide de modification du profil
- FAQ

---

## 🐛 Rollback (En cas de problème)

### Si problème MINEUR (fonctionnalité cassée)

1. **Désactiver temporairement**
   ```typescript
   // Dans analytics-section.tsx
   // Commenter les sections Bar Chart
   // Revenir à l'ancien affichage temporairement
   ```

2. **Fix rapide et redéployer**

### Si problème MAJEUR (site inaccessible)

1. **Rollback Git**
   ```bash
   # Trouver le dernier commit stable
   git log --oneline

   # Revenir en arrière
   git revert [COMMIT_HASH]
   git push origin main
   ```

2. **Rollback Base de données**
   ```sql
   -- Supprimer la table profiles
   DROP TABLE IF EXISTS profiles CASCADE;

   -- Supprimer le bucket
   DELETE FROM storage.buckets WHERE id = 'profiles';

   -- Supprimer le trigger
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   DROP FUNCTION IF EXISTS public.handle_new_user();
   ```

3. **Restaurer le backup**
   ```bash
   # Via Supabase Dashboard
   # Settings → Database → Restore Backup
   ```

---

## 📊 Métriques à Suivre

### Adoption des Fonctionnalités

**Budget Analytics :**
- Nombre de visites sur `/budget`
- Nombre de clics sur "Analyses"
- Nombre de changements de mode (chevaux/mois)
- Temps moyen passé sur la page

**Profil :**
- Nombre de visites sur `/profile`
- Nombre de profils complétés (pseudo + avatar)
- Nombre d'avatars uploadés
- Taux de modification du profil

### Performance

**Temps de Chargement :**
- Page Budget : < 1s
- Page Profile : < 1s
- Upload Avatar : < 3s
- API Profile GET : < 200ms
- API Profile PATCH : < 300ms
- API Avatar POST : < 2s

**Taux d'Erreur :**
- API Routes : < 1%
- Upload Avatar : < 5%
- RLS : 0%

### Utilisation Ressources

**Supabase :**
- Storage utilisé (avatars)
- Nombre de requêtes API
- Nombre de requêtes Storage
- Bande passante

---

## ✅ Post-Déploiement

### 24h après

- [ ] Vérifier les logs (pas d'erreurs)
- [ ] Vérifier les métriques (adoption)
- [ ] Vérifier le feedback utilisateurs
- [ ] Corriger les bugs mineurs si nécessaire

### 1 semaine après

- [ ] Analyser les métriques d'adoption
- [ ] Collecter les retours utilisateurs
- [ ] Planifier les améliorations
- [ ] Prioriser les bugs à corriger

### 1 mois après

- [ ] Rapport d'adoption complet
- [ ] A/B testing si nécessaire
- [ ] Optimisations performance
- [ ] Nouvelles fonctionnalités (contact, etc.)

---

## 🎉 Succès !

Si tout s'est bien passé, vous devriez avoir :

✅ Bar Charts fonctionnels en production
✅ Profil cavalier accessible
✅ Aucune erreur critique
✅ Performance optimale
✅ Utilisateurs satisfaits

**Félicitations ! 🎊**

---

## 📞 Support

En cas de problème en production :

1. **Logs Supabase**
   - Dashboard → Logs → Filter errors

2. **Logs Vercel/Netlify**
   - Dashboard → Deployments → Logs

3. **Console Browser**
   - F12 → Console → Errors

4. **Rollback**
   - Suivre la procédure ci-dessus

5. **Contact**
   - Créer une issue Git avec label `priority:high`
   - Inclure les logs d'erreur
   - Inclure les étapes de reproduction

---

**Bon déploiement ! 🚀**
