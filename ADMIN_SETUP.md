# Configuration Admin - Cavaly

## 🔐 Configuration du système d'administration

### Étape 1 : Créer les tables profiles

Exécutez le script SQL dans Supabase SQL Editor :

```sql
-- Ouvrez scripts/setup-admin-roles.sql et exécutez-le
```

Ce script crée :
- La table `profiles` avec les rôles (user/admin)
- Un trigger pour créer automatiquement un profil à l'inscription
- Les politiques RLS pour la sécurité

### Étape 2 : Créer la fonction RPC admin

Exécutez le script SQL dans Supabase SQL Editor :

```sql
-- Ouvrez scripts/create-admin-rpc.sql et exécutez-le
```

Cette fonction permet aux admins de récupérer la liste des utilisateurs avec leurs emails.

### Étape 3 : Définir un administrateur

Dans le script `setup-admin-roles.sql`, modifiez la ligne :

```sql
WHERE email = 'admin@cavaly.com'
```

Remplacez `'admin@cavaly.com'` par l'email de votre compte admin.

Ou exécutez manuellement dans Supabase SQL Editor :

```sql
-- Remplacez votre.email@exemple.com par votre email
INSERT INTO profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'votre.email@exemple.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## 🎯 Fonctionnalités

### Page Connexion (`/connexion`)
- ✅ Se connecter avec email/mot de passe
- ✅ Se déconnecter
- ✅ Accessible depuis la sidebar

### Page Admin (`/admin`)
- ✅ Vue d'ensemble : nombre d'utilisateurs, chevaux, dépenses totales
- ✅ Tableau avec tous les utilisateurs
- ✅ Pour chaque utilisateur :
  - Email et date d'inscription
  - Liste des chevaux
  - Dépenses totales
  - Dernières dépenses
- ✅ Barre de recherche par email
- ✅ Accessible uniquement aux admins

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Vérification du rôle admin côté serveur
- Fonction RPC sécurisée avec `SECURITY DEFINER`
- Redirection automatique si non-admin

## 📝 Ordre d'exécution des scripts SQL

1. `scripts/setup-budget-tables.sql` (déjà fait)
2. `scripts/setup-admin-roles.sql` (nouveau - à exécuter)
3. `scripts/create-admin-rpc.sql` (nouveau - à exécuter)

## 🚀 Utilisation

1. Créez un compte utilisateur sur l'application
2. Définissez ce compte comme admin via SQL
3. Déconnectez-vous puis reconnectez-vous
4. Le lien "Administration" apparaît dans la sidebar
5. Accédez à `/admin` pour voir tous les utilisateurs
