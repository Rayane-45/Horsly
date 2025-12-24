# 🚀 Guide de Démarrage Rapide - Nouvelles Fonctionnalités

## ⚡ TL;DR

Deux nouvelles fonctionnalités majeures ont été ajoutées :

1. **📊 Budget Analytics** : Graphiques en barres (Bar Charts) pour comparer les chevaux et les mois
2. **👤 Profil Cavalier** : Page de paramètres avec modification du pseudo et de la photo

## 🎯 Configuration Rapide (5 minutes)

### Étape 1 : Créer la table profiles dans Supabase

1. Ouvrez [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle query
5. Copiez-collez le contenu de `scripts/create-profiles-table.sql`
6. Cliquez sur **Run**
7. ✅ Vérifiez qu'il n'y a pas d'erreurs

### Étape 2 : Tester localement

```bash
# Démarrer le serveur
npm run dev
# ou
pnpm dev
```

### Étape 3 : Tester les fonctionnalités

#### 📊 Budget Analytics
1. Naviguez vers `/budget`
2. Cliquez sur l'onglet **"Analyses"**
3. Dans le sélecteur "Mode d'analyse", choisissez :
   - **"Comparer les chevaux"** → Voir le Bar Chart des dépenses par cheval
   - **"Comparer les mois"** → Voir le Bar Chart des 12 derniers mois
4. ✅ Les graphiques doivent s'afficher avec des animations fluides

#### 👤 Profil Cavalier
1. **Connectez-vous** (si ce n'est pas déjà fait)
2. Cliquez sur votre **avatar** en haut à droite
3. Sélectionnez **"Mon profil"**
4. Testez les fonctionnalités :
   - ✏️ Modifiez votre pseudo
   - 📝 Ajoutez une bio
   - 📸 Uploadez une photo de profil
   - 💾 Cliquez sur "Enregistrer"
5. ✅ Vérifiez que les modifications sont sauvegardées

---

## 📋 Checklist de Validation

### Budget Analytics

- [ ] Le graphique des chevaux s'affiche correctement
- [ ] Le graphique des mois s'affiche correctement
- [ ] Les tooltips apparaissent au survol
- [ ] Les animations sont fluides
- [ ] Les couleurs sont cohérentes avec le thème
- [ ] Les axes X et Y sont bien nommés
- [ ] Le responsive fonctionne (tester sur mobile)

### Profil Cavalier

- [ ] La page `/profile` charge correctement
- [ ] L'avatar par défaut affiche les initiales
- [ ] Le formulaire de profil s'affiche
- [ ] L'upload d'image fonctionne (max 5 Mo)
- [ ] La prévisualisation de l'image s'affiche
- [ ] La sauvegarde du pseudo fonctionne
- [ ] La sauvegarde de la bio fonctionne
- [ ] Les messages de succès/erreur s'affichent
- [ ] L'onglet "Contact" affiche le placeholder
- [ ] Le lien "Mon profil" est présent dans le header dropdown
- [ ] Le lien "Mon profil" est présent dans la sidebar (desktop)

---

## 🐛 Problèmes Courants & Solutions

### "Les graphiques ne s'affichent pas"

**Cause :** Recharts n'est pas installé ou il y a des données manquantes

**Solution :**
```bash
# Vérifier l'installation
npm list recharts

# Réinstaller si nécessaire
npm install recharts

# Redémarrer le serveur
npm run dev
```

### "Erreur 500 sur /api/profile"

**Cause :** La table `profiles` n'existe pas

**Solution :**
- Exécutez le script SQL dans Supabase (voir Étape 1)
- Vérifiez les policies RLS

### "L'upload d'avatar échoue"

**Cause :** Le bucket `profiles` n'existe pas

**Solution :**
1. Allez dans Supabase → Storage
2. Vérifiez que le bucket `profiles` existe
3. Si ce n'est pas le cas, le script SQL le crée automatiquement
4. Vérifiez les policies RLS du bucket

### "Permission denied lors de l'upload"

**Cause :** Les policies RLS ne sont pas correctement configurées

**Solution :**
- Relancez le script `create-profiles-table.sql`
- Vérifiez que les policies pour storage.objects sont créées

---

## 📸 Captures d'écran attendues

### Budget Analytics - Comparer les chevaux
```
┌─────────────────────────────────────────┐
│ Comparer les chevaux                    │
├─────────────────────────────────────────┤
│                                         │
│  Dépenses (€)                           │
│    ▲                                    │
│ 500│     ███                            │
│    │     ███  ███                       │
│ 250│ ███ ███  ███  ███                 │
│    │ ███ ███  ███  ███                 │
│  0 └─────────────────────►             │
│     Luna Max  Star  Rex                │
│                                         │
│ ┌─────────────────┐ ┌────────────────┐ │
│ │ Luna - 450€     │ │ Max - 380€     │ │
│ │ 🟦 Véto: 200€   │ │ 🟩 Alim: 150€  │ │
│ └─────────────────┘ └────────────────┘ │
└─────────────────────────────────────────┘
```

### Budget Analytics - Comparer les mois
```
┌─────────────────────────────────────────┐
│ Comparer les mois                       │
├─────────────────────────────────────────┤
│                                         │
│  Dépenses (€)                           │
│    ▲                                    │
│ 500│         ███      ███               │
│    │     ███ ███  ███ ███               │
│ 250│ ███ ███ ███  ███ ███  ███         │
│    │ ███ ███ ███  ███ ███  ███         │
│  0 └─────────────────────────►         │
│     Jan Fév Mar  Avr Mai  Jun          │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Actuel   │ │ Précédent│ │ Évolution│ │
│ │ 420€     │ │ 380€     │ │ +10.5%   │ │
│ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

### Profil Cavalier
```
┌─────────────────────────────────────────┐
│ Profil                                  │
├─────────────────────────────────────────┤
│  ╭─────╮                                │
│  │ JP  │  Jean-Pierre                   │
│  ╰─────╯  jp@example.com                │
│            📅 Membre depuis...          │
│                                         │
│  ┌─ Paramètres ─┬─ Contact ─┐         │
│  │                            │         │
│  │ 📸 Photo de profil         │         │
│  │  ╭─────╮ 🔼 Choisir        │         │
│  │  │ JP  │    💾 Enregistrer │         │
│  │  ╰─────╯                   │         │
│  │                            │         │
│  │ ✏️  Nom d'affichage        │         │
│  │  [Jean-Pierre...........]  │         │
│  │                            │         │
│  │ 📝 Bio                     │         │
│  │  [Cavalier passionné...]   │         │
│  │  150/200 caractères        │         │
│  │                            │         │
│  │              💾 Enregistrer │         │
│  └────────────────────────────┘         │
└─────────────────────────────────────────┘
```

---

## 🎨 Personnalisation

### Modifier les couleurs des graphiques

Dans `components/budget/analytics-section.tsx` :

```tsx
// Pour les chevaux (ligne ~140)
fill={`hsl(${(index * 360 / horseComparison.length)}, 70%, 50%)`}

// Pour les mois (ligne ~220)
fill={isIncreasing ? "hsl(var(--destructive))" : "hsl(142, 70%, 50%)"}
```

### Modifier les limites de taille

Dans `components/profile/profile-settings.tsx` :

```tsx
// Taille max de l'avatar (ligne ~40)
if (file.size > 5 * 1024 * 1024)

// Longueur max du pseudo (ligne ~233)
maxLength={50}

// Longueur max de la bio (ligne ~243)
maxLength={200}
```

---

## ✅ Test de Production

Avant de déployer en production :

1. [ ] Testez tous les scénarios utilisateur
2. [ ] Vérifiez les performances (Lighthouse)
3. [ ] Testez sur différents navigateurs
4. [ ] Testez sur mobile et tablette
5. [ ] Vérifiez les logs Supabase pour les erreurs
6. [ ] Testez avec des utilisateurs non-admin
7. [ ] Vérifiez que les policies RLS sont correctes
8. [ ] Testez l'upload d'images de différentes tailles
9. [ ] Vérifiez que les animations sont fluides
10. [ ] Testez le mode dark/light

---

## 📞 Support

En cas de problème :

1. Vérifiez les logs de la console browser (F12)
2. Vérifiez les logs du serveur Next.js
3. Vérifiez les logs Supabase
4. Consultez le fichier `README-NEW-FEATURES.md` pour plus de détails
5. Relancez le script SQL si nécessaire

---

## 🎉 C'est terminé !

Félicitations ! Vous avez maintenant :
- ✅ Des graphiques en barres professionnels pour analyser les dépenses
- ✅ Un système de profil utilisateur complet et évolutif
- ✅ Une base solide pour les futures fonctionnalités

**Prochaines étapes suggérées :**
- Ajoutez plus de graphiques (Line Chart, Pie Chart)
- Implémentez la section Contact
- Ajoutez des notifications
- Créez une version mobile PWA

Bon développement ! 🚀
