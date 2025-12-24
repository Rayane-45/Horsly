# ✅ CHECKLIST DE TESTS MANUELS - Cavaly

## Prérequis

1. Avoir configuré Supabase (voir START-HERE.md)
2. Avoir créé le bucket `horse-images` dans Supabase Storage
3. Avoir lancé l'application avec `pnpm dev`

---

## 🔐 1. Test Authentification (Login)

### Test 1.1: Affichage page d'accueil non connecté
- [ ] Ouvrir http://localhost:3000
- [ ] Vérifier que le message "Bienvenue sur Cavaly" s'affiche
- [ ] Vérifier que le bouton "Se connecter" est visible
- [ ] Cliquer sur "Se connecter"
- [ ] Vérifier que la modale de connexion s'ouvre

### Test 1.2: Création de compte
- [ ] Dans la modale, cliquer sur "Créer un compte"
- [ ] Remplir :
  - Nom complet : Test User
  - Email : test@example.com
  - Mot de passe : test123456
- [ ] Cliquer sur "Créer le compte"
- [ ] Vérifier le toast de succès
- [ ] (Optionnel si email verification activé) Vérifier l'email

### Test 1.3: Connexion
- [ ] Cliquer sur "Connexion" dans le header
- [ ] Remplir email et mot de passe
- [ ] Cliquer sur "Se connecter"
- [ ] Vérifier que l'avatar apparaît en haut à droite
- [ ] Vérifier que les sections du dashboard sont vides (pas de données démo)

### Test 1.4: Déconnexion
- [ ] Cliquer sur l'avatar
- [ ] Cliquer sur "Se déconnecter"
- [ ] Vérifier le retour à l'écran d'accueil non connecté

### Test 1.5: Persistance de session
- [ ] Se reconnecter
- [ ] Fermer l'onglet
- [ ] Rouvrir http://localhost:3000
- [ ] Vérifier que l'utilisateur est toujours connecté

---

## 🐴 2. Test Ajout Cheval

### Test 2.1: Protection auth
- [ ] Se déconnecter
- [ ] Aller sur /horses
- [ ] Cliquer sur "Ajouter un cheval"
- [ ] Vérifier que la modale de login s'ouvre

### Test 2.2: Ajout sans photo
- [ ] Se connecter
- [ ] Aller sur /horses
- [ ] Cliquer sur "Ajouter un cheval"
- [ ] Remplir uniquement le nom : "Luna"
- [ ] Cliquer sur "Ajouter"
- [ ] Vérifier le toast de succès
- [ ] Vérifier que le cheval apparaît dans la liste

### Test 2.3: Ajout avec tous les champs
- [ ] Cliquer sur "Ajouter un cheval"
- [ ] Remplir :
  - Nom : Thunder
  - Race : Selle Français
  - Date de naissance : 01/01/2018
  - Sexe : Hongre
  - Robe : Bai
  - Taille : 165
  - Poids : 520
  - N° de puce : 250123456789123
  - Notes : Cheval de dressage
- [ ] Cliquer sur "Ajouter"
- [ ] Vérifier que le cheval apparaît avec tous les détails

### Test 2.4: Ajout avec photo
- [ ] Cliquer sur "Ajouter un cheval"
- [ ] Cliquer sur "Choisir une photo"
- [ ] Sélectionner une image JPG ou PNG (< 5 Mo)
- [ ] Vérifier l'aperçu de l'image
- [ ] Remplir le nom : "Spirit"
- [ ] Cliquer sur "Ajouter"
- [ ] Vérifier que la photo s'affiche sur la carte du cheval

### Test 2.5: Validation photo
- [ ] Tester avec un fichier > 5 Mo → vérifier message d'erreur
- [ ] Tester avec un fichier non-image → vérifier message d'erreur
- [ ] Tester suppression de photo (bouton X) → vérifier disparition

---

## 💰 3. Test Ajout Dépense

### Test 3.1: Protection auth
- [ ] Se déconnecter
- [ ] Aller sur /budget
- [ ] Cliquer sur "Ajouter une dépense"
- [ ] Vérifier que la modale de login s'ouvre

### Test 3.2: Ajout simple
- [ ] Se connecter
- [ ] Aller sur /budget
- [ ] Cliquer sur "Ajouter une dépense"
- [ ] Remplir :
  - Titre : Visite vétérinaire
  - Montant : 85
  - Catégorie : Vétérinaire
  - Date : (aujourd'hui)
- [ ] Cliquer sur "Enregistrer"
- [ ] Vérifier le toast de succès
- [ ] Vérifier que la dépense apparaît

### Test 3.3: Ajout avec cheval associé
- [ ] Cliquer sur "Ajouter une dépense"
- [ ] Remplir :
  - Titre : Ferrage
  - Montant : 120
  - Catégorie : Maréchal-ferrant
  - Cheval : Luna
  - Date : (aujourd'hui)
  - Notes : Ferrage aux 4 pieds
- [ ] Cliquer sur "Enregistrer"
- [ ] Vérifier que la dépense montre le nom du cheval

### Test 3.4: Vérification budget
- [ ] Sur la page Budget, vérifier que le total est mis à jour
- [ ] Vérifier la répartition par catégorie
- [ ] Retourner sur la page d'accueil
- [ ] Vérifier que la section Budget affiche les bonnes données

---

## 🏥 4. Test Ajout Rendez-vous Médical

### Test 4.1: Protection auth
- [ ] Se déconnecter
- [ ] Aller sur /sante
- [ ] Cliquer sur "Ajouter un acte"
- [ ] Vérifier que la modale de login s'ouvre

### Test 4.2: Ajout événement santé
- [ ] Se connecter
- [ ] Aller sur /sante ou sur la page d'un cheval
- [ ] Cliquer sur "Ajouter un acte"
- [ ] Remplir :
  - Cheval : Luna
  - Type : Vétérinaire
  - Titre : Visite de contrôle
  - Date : (aujourd'hui)
  - Vétérinaire : Dr Martin
  - Description : Visite annuelle
  - Coût : 65
  - Prochain rappel : (dans 1 an)
- [ ] Cliquer sur "Enregistrer"
- [ ] Vérifier le toast de succès

### Test 4.3: Différents types
- [ ] Tester l'ajout pour chaque type :
  - [ ] Maréchal-ferrant
  - [ ] Vaccination
  - [ ] Vermifuge
  - [ ] Dentaire
  - [ ] Blessure
  - [ ] Maladie
  - [ ] Autre

### Test 4.4: Vérification rappels
- [ ] Sur la page d'accueil, vérifier la section "À venir"
- [ ] Vérifier que les événements avec date future apparaissent

---

## 🏃 5. Test Ajout Entraînement

### Test 5.1: Protection auth
- [ ] Se déconnecter
- [ ] Aller sur /training
- [ ] Cliquer sur "Nouvelle séance"
- [ ] Vérifier que la modale de login s'ouvre

### Test 5.2: Ajout séance
- [ ] Se connecter
- [ ] Aller sur /training
- [ ] Cliquer sur "Nouvelle séance"
- [ ] Remplir :
  - Cheval : Luna
  - Type : Dressage
  - Titre : Travail aux deux pistes
  - Date : (aujourd'hui)
  - Heure : 10:00
  - Durée : 45 minutes
  - Intensité : Modérée
  - Lieu : Carrière principale
  - Notes : Travail épaule en dedans
- [ ] Cliquer sur "Enregistrer"
- [ ] Vérifier le toast de succès

### Test 5.3: Différents types
- [ ] Tester l'ajout pour chaque type :
  - [ ] Dressage
  - [ ] Saut d'obstacles
  - [ ] Cross
  - [ ] Travail à plat
  - [ ] Longe
  - [ ] Balade en extérieur

### Test 5.4: Vérification statistiques
- [ ] Sur la page d'accueil, vérifier la section "Activité récente"
- [ ] Vérifier les stats de la semaine (séances, durée, distance)

---

## 📱 6. Test Responsive

### Test 6.1: Mobile (375px)
- [ ] Ouvrir les DevTools (F12)
- [ ] Activer le mode responsive
- [ ] Sélectionner iPhone 12 ou équivalent
- [ ] Vérifier :
  - [ ] Header lisible
  - [ ] Bouton login visible (icône seule)
  - [ ] Navigation bottom bar
  - [ ] Formulaires fonctionnels
  - [ ] Cards bien dimensionnées

### Test 6.2: Tablette (768px)
- [ ] Sélectionner iPad ou équivalent
- [ ] Vérifier :
  - [ ] Grille de chevaux (2 colonnes)
  - [ ] Formulaires centrés
  - [ ] Sidebar visible si applicable

### Test 6.3: Desktop (1920px)
- [ ] Revenir en mode desktop
- [ ] Vérifier :
  - [ ] Grille de chevaux (3 colonnes)
  - [ ] Espacement correct
  - [ ] Sidebar complète

---

## 🔒 7. Test Isolation des Données

### Test 7.1: Créer un second utilisateur
- [ ] Se déconnecter
- [ ] Créer un compte : user2@example.com
- [ ] Vérifier que la liste des chevaux est vide
- [ ] Ajouter un cheval "Tempête"
- [ ] Vérifier qu'il apparaît

### Test 7.2: Vérifier l'isolation
- [ ] Se déconnecter
- [ ] Se reconnecter avec le premier utilisateur
- [ ] Vérifier que "Tempête" n'apparaît PAS
- [ ] Vérifier que Luna, Thunder, Spirit sont présents

---

## 🎯 Résumé

| Test | Status |
|------|--------|
| 1.1 Page accueil non connecté | ⬜ |
| 1.2 Création compte | ⬜ |
| 1.3 Connexion | ⬜ |
| 1.4 Déconnexion | ⬜ |
| 1.5 Persistance session | ⬜ |
| 2.1 Auth cheval | ⬜ |
| 2.2 Ajout cheval simple | ⬜ |
| 2.3 Ajout cheval complet | ⬜ |
| 2.4 Ajout avec photo | ⬜ |
| 2.5 Validation photo | ⬜ |
| 3.1 Auth dépense | ⬜ |
| 3.2 Ajout dépense simple | ⬜ |
| 3.3 Ajout dépense + cheval | ⬜ |
| 3.4 Vérification budget | ⬜ |
| 4.1 Auth santé | ⬜ |
| 4.2 Ajout événement santé | ⬜ |
| 4.3 Différents types | ⬜ |
| 4.4 Vérification rappels | ⬜ |
| 5.1 Auth entraînement | ⬜ |
| 5.2 Ajout séance | ⬜ |
| 5.3 Différents types | ⬜ |
| 5.4 Vérification stats | ⬜ |
| 6.1 Mobile | ⬜ |
| 6.2 Tablette | ⬜ |
| 6.3 Desktop | ⬜ |
| 7.1 Second utilisateur | ⬜ |
| 7.2 Isolation données | ⬜ |

---

## 🐛 Problèmes Connus

### Si le bucket Storage n'existe pas
Erreur: "Bucket not found"
→ Créer le bucket `horse-images` dans Supabase Storage

### Si les policies RLS bloquent
Erreur: "new row violates row-level security policy"
→ Vérifier que le script init-database.sql a bien été exécuté

### Si l'upload échoue
→ Vérifier les policies du bucket:
```sql
-- Allow authenticated users to upload
create policy "Users can upload"
on storage.objects for insert
with check (bucket_id = 'horse-images' AND auth.role() = 'authenticated');

-- Allow public read
create policy "Public read"
on storage.objects for select
using (bucket_id = 'horse-images');
```

---

## ✅ Tous les tests passés ?

Si tous les tests sont cochés ✅, l'application est prête pour la production !

**Prochaines étapes :**
1. Déployer sur Vercel
2. Configurer le domaine personnalisé
3. Activer HTTPS
4. Configurer les backups Supabase
