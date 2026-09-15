# Remise du groupe

Dépôt indiqué par l’utilisateur : https://github.com/MalekGabsi/MediRdv

## Contenu à déposer

- Le code source, les configurations et `package-lock.json`.
- Le README et les documents d’architecture, de mapping et de recette.
- Les tests automatisés et les scripts de contrôle du serveur réel.
- Un fichier `PROMPTS_Nom_Prenom.md` **par étudiant**, avec son identité et les prompts qu’il a personnellement utilisés.

Le fichier générique à la racine contient le journal de cette session. Les noms des étudiants n’ayant pas été communiqués, aucune attribution personnelle n’a été inventée. Chaque étudiant doit le renommer/adapter à son propre travail et ses échanges ; ne pas attribuer à tous des prompts qu’ils n’ont pas utilisés.

Les dépendances (`node_modules/`), `dist/`, captures (`artifacts/`), résultats Playwright et fichiers `.env` sont exclus du dépôt. Les captures et données HAPI lues pendant une démonstration ne font pas partie des sources.

## Commandes de vérification avant remise

```bash
npm ci
npm test
npm run build
npm run test:e2e
npm run test:live
```

Le dernier test dépend de l’état du serveur public au moment de la démonstration. L’absence d’un rendez-vous convertible ne justifie pas de créer des informations métier fictives.

## État de la publication dans cette session

Le dépôt GitHub était vide lors de sa vérification. Les sources ont été réunies et commitées dans un dépôt temporaire. La tentative de push a échoué car aucune authentification GitHub n’est disponible (`could not read Username`). Aucune publication n’a été réalisée.

Deux fichiers de remise locaux sont fournis hors des sources versionnées :

- `MediRdv-sources.zip` : tous les fichiers source nécessaires, documentation et tests.
- `MediRdv.git.bundle` : dépôt Git transportable, avec les commits préparés.

Après connexion à GitHub sur votre machine, le bundle permet de reprendre la publication dans un nouveau dossier :

```bash
git clone MediRdv.git.bundle MediRdv-publication
cd MediRdv-publication
git remote set-url origin https://github.com/MalekGabsi/MediRdv.git
git push -u origin main
```

Un push normal conserve la protection contre l’écrasement d’un historique distant ajouté entre-temps. Le répertoire de travail initial de la session n’a pas été réinitialisé ; son dossier `.git` est protégé par l’environnement.
