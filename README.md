# 🐴 Cavaly - Application de Gestion Équestre

Application web complète de gestion pour propriétaires de chevaux, avec suivi des soins, entraînements, budget et plus encore.

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Connexion/Inscription sécurisée
- Compte administrateur par défaut
- Changement de mot de passe
- Session persistante
- Mots de passe hashés (bcrypt)
- Isolation complète des données par utilisateur (RLS)

### 🐴 Gestion des Chevaux
- Fiche complète pour chaque cheval
- Informations détaillées (race, âge, puce, etc.)
- Historique complet
- Photos et documents

### 💰 Budget & Finances
- Suivi des dépenses par catégorie
- Budget mensuel
- Graphiques et statistiques
- Filtrage avancé
- Export de rapports

### 🏥 Santé & Soins
- Carnet de santé numérique
- Rappels vétérinaires
- Historique des soins
- Calendrier des vaccins
- Suivi des vermifuges
- Maréchalerie

### 🏃 Entraînements
- Planning des séances
- Suivi GPS (tracking)
- Statistiques (distance, vitesse, durée)
- Calendrier interactif
- Notes et observations

### 📦 Commandes & Fournitures
- Gestion des commandes
- Suivi des livraisons
- Historique des achats

## 🚀 Installation

### Prérequis
- Node.js 18+
- pnpm
- Compte Supabase (gratuit)

### Configuration

1. **Cloner le projet**
```bash
git clone https://github.com/votre-repo/cavaly.git
cd cavaly
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer Supabase**
- Créer un projet sur [supabase.com](https://supabase.com)
- Exécuter le script SQL `scripts/init-database.sql` dans le SQL Editor
- Créer l'utilisateur admin via Authentication > Users (voir CONFIGURATION.md)

4. **Configurer les variables d'environnement**
```bash
cp .env.local.example .env.local
# Éditer .env.local avec vos credentials Supabase
```

5. **Lancer l'application**
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[CONFIGURATION.md](CONFIGURATION.md)** - Guide de configuration détaillé
- **[GUIDE-COMPLET.md](GUIDE-COMPLET.md)** - Documentation complète avec exemples
- **[README-IMPLEMENTATION.md](README-IMPLEMENTATION.md)** - Détails de l'implémentation

## 🔑 Compte Administrateur par Défaut

```
Email: admin@cavaly.app
Mot de passe: admin
```

⚠️ **IMPORTANT** : Changez ce mot de passe immédiatement après la première connexion !

## 🛠️ Technologies

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Base de données**: PostgreSQL (Supabase)
- **Authentification**: Supabase Auth
- **Déploiement**: Vercel

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- 📱 Smartphones
- 📱 Tablettes
- 💻 Desktop

## 🧪 Tests

Pour tester l'application :

1. **Authentification**
   - Créer un compte
   - Se connecter/déconnecter
   - Changer le mot de passe

2. **Fonctionnalités**
   - Ajouter un cheval
   - Enregistrer une dépense
   - Créer un rendez-vous médical
   - Planifier un entraînement

Voir [GUIDE-COMPLET.md](GUIDE-COMPLET.md) pour des scénarios de test détaillés.

## 📊 Structure du Projet

```
cavaly/
├── app/                    # Pages et API routes
│   ├── api/               # Backend API
│   └── */                 # Pages Next.js
├── components/            # Composants React
│   ├── auth/             # Authentification
│   ├── ui/               # Composants UI (shadcn)
│   └── */                # Composants métier
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires et config
│   └── supabase/        # Client Supabase
├── scripts/             # Scripts SQL
└── public/              # Assets statiques
```

## 🔒 Sécurité

- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Authentification JWT
- ✅ Mots de passe hashés (bcrypt)
- ✅ Cookies sécurisés (httpOnly)
- ✅ Validation des entrées
- ✅ Protection CSRF

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous license MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :

1. Consulter la [documentation](GUIDE-COMPLET.md)
2. Vérifier les [issues](https://github.com/votre-repo/cavaly/issues) existantes
3. Créer une nouvelle issue si nécessaire

## 🎯 Roadmap

- [ ] Upload de fichiers (photos, documents)
- [ ] Notifications push
- [ ] Export PDF
- [ ] Partage de données entre utilisateurs
- [ ] Application mobile
- [ ] Mode hors ligne

## 👥 Auteurs

- Votre Nom - [GitHub](https://github.com/votre-profil)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

---

Made with ❤️ for horse lovers 🐴
