# MediRdv

Prototype de consultation des rendez-vous d’un patient sur **HAPI FHIR R4 4.0.1**, avec représentation **HL7 v2.5.1 SIU^S12** et audit des transformations.

Les données métier sont lues sur le serveur. L’application ne contient ni patient préchargé, ni rendez-vous simulé, ni mécanisme de peuplement du serveur. Les seules données synthétiques du dépôt se trouvent dans les tests, hors du bundle applicatif.

## Démarrage

Prérequis : Node.js 22 et npm 10 ou ultérieurs.

```bash
npm ci
npm run dev
```

Ouvrir **http://localhost:3006**.

```bash
npm run build
npm run preview
```

La compilation produit une application statique dans `dist/`. La configuration facultative `.env` reprend `.env.example`. `VITE_FHIR_BASE_URL` est une URL publique, jamais un secret. L’URL HTTPS `https://hapi.fhir.org/baseR4` correspond au serveur HTTP du cahier des charges et évite le contenu mixte dans le navigateur.

## Démonstration

1. Attendre « FHIR 4.0.1 vérifié ». Le prototype lit `/metadata` et contrôle le paramètre de recherche `Appointment.patient`.
2. Chercher un patient par nom, identifiant métier ou ID FHIR. **Patients avec rendez-vous** découvre des patients à partir des réservations réellement présentes sur HAPI.
3. Choisir explicitement une identité. Le bandeau patient reste visible dans les cinq vues.
4. Sélectionner un rendez-vous. Les dates sont affichées dans le fuseau de la source. Les professionnels, lieux et services sont résolus si disponibles.
5. Consulter **Ressources FHIR** pour examiner le JSON reçu, les profils déclarés et la requête source.
6. Dans **Conversion HL7**, confirmer le scénario de nouvelle réservation et générer le message. Copier ou télécharger le fichier `.hl7`, puis consulter l’audit et la provenance des champs.
7. Dans **Terminologies**, examiner les correspondances effectivement appliquées. **Journal des échanges** montre les opérations techniques de la session.

La pagination est explicite : **Charger la page suivante / Charger la suite** suit le lien `Bundle.link.next`. Le nombre affiché représente les ressources chargées, pas nécessairement la totalité du serveur. Les résultats peuvent changer ou disparaître lors des purges de HAPI.

## Conditions de conversion

Le scénario local S12 exige une confirmation utilisateur, un rendez-vous `booked`, un patient rattachable, un identifiant métier patient, un identifiant métier de rendez-vous, un nom/prénom structuré et des dates valides de début et de fin.

Un champ obligatoire absent produit `FAILED` et **aucun message**. Les champs facultatifs absents restent visibles comme « Non renseigné » et produisent des avertissements. `Resource.id` ne remplace jamais `Identifier.value`.

**La validation concerne la représentation pédagogique locale.** Elle ne certifie pas la conformité complète de tous les champs conditionnels de SIU_S12, des profils FHIR ou d’un contrat d’échange hospitalier. Les écarts et décisions sont explicités dans [docs/MAPPING.md](docs/MAPPING.md). Aucun message n’est transmis à un système cible.

## Architecture et fichiers

```text
MediRdv/
├── index.html
├── package.json / package-lock.json
├── tsconfig.json / vite.config.ts / playwright.config.ts
├── .env.example / .gitignore
├── public/favicon.svg
├── src/
│   ├── main.tsx                  # point d’entrée et erreur de dernier recours
│   ├── App.tsx                   # parcours, état patient, annulation des requêtes
│   ├── App.module.css / styles.css
│   ├── models/normalizedModel.ts # contrat intermédiaire sans dépendance FHIR
│   ├── services/
│   │   ├── fhirApi.ts            # Fetch, métadonnées, recherches, pagination
│   │   ├── fhirValidator.ts      # contrôles structurels ciblés à l’exécution
│   │   ├── references.ts         # Bundle, contenus, versions, PractitionerRole
│   │   ├── normalizer.ts         # modèle métier, invariants et pertes
│   │   ├── dates.ts              # précision, fuseaux, calendrier, durées
│   │   ├── terminology.ts        # tables de codes locales versionnées
│   │   ├── hl7Mapper.ts          # normalisé → segments avec provenance
│   │   └── hl7Validator.ts       # sérialisation ER7 et validation locale
│   └── components/
│       ├── PatientSearch.tsx
│       ├── AppointmentList.tsx
│       ├── AppointmentDetail.tsx
│       ├── HL7Preview.tsx
│       ├── ResourceViewer.tsx
│       ├── TerminologyView.tsx
│       └── Shared.tsx
├── tests/
│   ├── fixtures.ts               # uniquement des données synthétiques de test
│   ├── mapping.test.ts
│   ├── fhirApi.test.ts
│   └── e2e/workflow.spec.ts
├── scripts/
│   ├── live-check.ts             # contrôle HAPI en lecture seule
│   └── browser-live-check.mjs    # parcours Chrome contre le vrai serveur
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MAPPING.md
│   ├── RECETTE.md
│   ├── REMISE.md
│   └── cahier-des-charges.md
└── PROMPTS_Nom_Prenom.md        # journal de cette session à personnaliser
```

## Tests

```bash
npm test
npm run build
npm run test:e2e
npm run test:live
```

Les tests navigateur utilisent Chrome installé (`channel: chrome`). Si nécessaire : `npx playwright install chrome`. Pour vérifier l’accès réseau et CORS réel, laisser `npm run dev` actif puis lancer `node scripts/browser-live-check.mjs`.

Les tests unitaires et navigateur automatisés utilisent des fixtures isolées et n’accèdent pas au serveur. Les scripts `live-check` utilisent HAPI, sans écrire de ressource. Le second prend des captures locales dans `artifacts/`, dossier exclu de Git. Ne publier aucun extrait ou capture du serveur sans vérifier son caractère pédagogique.

## Confidentialité et limites

Les ressources et résultats restent en mémoire dans la page : pas de stockage local, de base de données ou de journal clinique. Les traces techniques gardent uniquement la catégorie de requête, le résultat et la durée ; pas les paramètres de recherche. L’audit exporté contient des identifiants de corrélation/ressource, les versions et les anomalies, sans la trame HL7 ni les valeurs des champs patient.

L’utilisateur est supposé habilité ; l’authentification, les autorisations d’un SI réel, le transport MLLP/ACK, l’historique événementiel, S13/S14/S15 et les profils nationaux ne font pas partie du MVP. Les ressources doivent être des données de test.

## Références

- [FHIR R4 Appointment](https://hl7.org/fhir/R4/appointment.html) : ressource, participants et recherche patient.
- [HL7 v2.5.1, chapitre 10](https://www.hl7.eu/HL7v2x/v251/std251/ch10.html) : messages SIU et segments de rendez-vous.
- [HL7 v2.5.1, chapitre 3](https://www.hl7.eu/HL7v2x/v251/std251/ch03.html) : patient et table 0001.
- [HL7 v2.5.1, types de données](https://www.hl7.eu/HL7v2x/v251/std251/ch02a.html) : CX, XPN, XCN, PL, EI, CE et TS.

Dépôt de remise indiqué : [MalekGabsi/MediRdv](https://github.com/MalekGabsi/MediRdv).
