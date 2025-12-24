# Guide de Configuration - Application Cavaly

## 🚀 Configuration Initiale

### 1. Prérequis
- Compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- Node.js 18+ et pnpm installés

### 2. Configuration Supabase

#### A. Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé anonyme (anon key)

#### B. Initialiser la base de données
1. Dans votre projet Supabase, aller dans **SQL Editor**
2. Créer une nouvelle requête
3. Copier le contenu de `scripts/init-database.sql`
4. Exécuter la requête pour créer toutes les tables

#### C. Créer le compte administrateur
1. Dans Supabase, aller dans **Authentication** > **Users**
2. Cliquer sur **Add user** > **Create new user**
3. Remplir:
   - **Email**: `admin@cavaly.app`
   - **Password**: `admin`
   - Cocher **Auto Confirm User**
4. Cliquer sur **Create user**
5. Dans **SQL Editor**, exécuter:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'admin@cavaly.app';
   ```

### 3. Configuration de l'Application

#### A. Variables d'environnement
1. Copier `.env.local.example` vers `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Éditer `.env.local` avec vos credentials Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_ici
   ```

#### B. Installer les dépendances
```bash
pnpm install
```

#### C. Lancer l'application
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Connexion

### Compte Administrateur par Défaut
- **Email**: `admin@cavaly.app`
- **Mot de passe**: `admin`

⚠️ **IMPORTANT**: Changez ce mot de passe immédiatement après la première connexion !

### Changer le Mot de Passe
1. Se connecter avec le compte admin
2. Cliquer sur l'avatar en haut à droite
3. Sélectionner **Changer le mot de passe**
4. Suivre les instructions

## ✨ Fonctionnalités Implémentées

### Authentification
- ✅ Connexion/Déconnexion
- ✅ Création de compte utilisateur
- ✅ Session persistante
- ✅ Changement de mot de passe
- ✅ Mots de passe hashés et sécurisés (bcrypt via Supabase Auth)
- ✅ Compte administrateur

### Gestion des Chevaux
- ✅ Ajouter un cheval
- ✅ Modifier les informations d'un cheval
- ✅ Supprimer un cheval
- ✅ Visualiser la liste des chevaux
- ✅ Données liées à l'utilisateur connecté

### Budget et Dépenses
- ✅ Ajouter une dépense
- ✅ Modifier une dépense
- ✅ Supprimer une dépense
- ✅ Visualiser le budget mensuel
- ✅ Graphiques et statistiques
- ✅ Filtrage par catégorie et période

### Santé
- ✅ Ajouter un rendez-vous médical (vétérinaire, maréchal-ferrant, vaccins, etc.)
- ✅ Modifier un événement de santé
- ✅ Supprimer un événement
- ✅ Timeline des événements
- ✅ Rappels pour les prochains rendez-vous

### Entraînements
- ✅ Ajouter une séance d'entraînement
- ✅ Modifier une séance
- ✅ Supprimer une séance
- ✅ Suivi GPS (données stockées en JSON)
- ✅ Calendrier des entraînements
- ✅ Statistiques (distance, durée, vitesse)

### Commandes
- ✅ Créer une commande de fournitures
- ✅ Suivre le statut des commandes
- ✅ Historique des commandes

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (smartphones)
- 📱 Tablette
- 💻 Desktop

Le design existant a été préservé, seules les fonctionnalités backend ont été ajoutées.

## 🔒 Sécurité

### Row Level Security (RLS)
Toutes les tables utilisent RLS pour garantir que :
- Chaque utilisateur ne peut voir que ses propres données
- Les modifications sont restreintes aux propriétaires des données
- L'isolation des données est assurée au niveau de la base de données

### Authentification
- Mots de passe hashés avec bcrypt
- Tokens JWT pour les sessions
- Cookies sécurisés (httpOnly)
- Protection CSRF

## 🧪 Tests

### Test Manuel
1. **Authentification**
   - Créer un compte
   - Se connecter
   - Changer le mot de passe
   - Se déconnecter

2. **Chevaux**
   - Ajouter un cheval
   - Modifier ses informations
   - Vérifier qu'il apparaît dans la liste

3. **Dépenses**
   - Ajouter une dépense
   - Vérifier la mise à jour du budget
   - Filtrer par catégorie

4. **Santé**
   - Ajouter un rendez-vous vétérinaire
   - Vérifier l'affichage dans la timeline

5. **Entraînements**
   - Créer une séance d'entraînement
   - Vérifier l'affichage dans le calendrier

### Responsive
Tester sur :
- Chrome DevTools (mobile/tablette/desktop)
- Navigateur mobile réel
- Différentes tailles d'écran

## 📚 Structure de la Base de Données

### Tables Principales
- `profiles` - Profils utilisateurs
- `horses` - Chevaux
- `health_events` - Événements de santé
- `vital_signs` - Signes vitaux
- `training_sessions` - Séances d'entraînement
- `expenses` - Dépenses
- `budgets` - Budgets mensuels
- `orders` - Commandes
- `notifications` - Notifications

Voir `scripts/init-database.sql` pour le schéma complet.

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Next.js API Routes
- **Base de données**: PostgreSQL (Supabase)
- **Authentification**: Supabase Auth
- **Déploiement**: Vercel (recommandé)

## 📝 Notes Importantes

1. **Premier Déploiement**: N'oubliez pas de configurer les variables d'environnement sur votre plateforme de déploiement
2. **Sécurité**: Changez immédiatement le mot de passe admin après la première connexion
3. **Backup**: Configurez des sauvegardes régulières de votre base de données Supabase
4. **Rate Limiting**: Considérez ajouter du rate limiting en production

## 🐛 Dépannage

### Erreur "Service non disponible"
- Vérifier que les variables d'environnement sont correctement configurées
- Vérifier que Supabase est accessible

### Erreur d'authentification
- Vérifier que le compte existe dans Supabase Auth
- Vérifier que l'email est confirmé
- Essayer de se déconnecter et se reconnecter

### Les données ne s'affichent pas
- Vérifier que l'utilisateur est bien connecté
- Vérifier la console du navigateur pour les erreurs
- Vérifier que RLS est correctement configuré

## 📞 Support

Pour toute question ou problème, consulter :
- Documentation Supabase : https://supabase.com/docs
- Documentation Next.js : https://nextjs.org/docs

---

**Version**: 1.0.0  
**Dernière mise à jour**: Décembre 2024
