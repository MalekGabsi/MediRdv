# Journal des prompts — MediRdv

## Attribution

Journal technique de la session de réalisation assistée. Le nom/prénom de l’étudiant doit remplacer `Nom_Prenom` dans le nom du fichier lors de la remise. Les identités du groupe n’ont pas été fournies dans la conversation.

## Entrées utilisateur reçues

1. Cahier des charges complet « Prototype d’interopérabilité en santé — Rendez-vous / calendrier d’un patient — FHIR R4 → HL7 v2 ». Copie dans [docs/cahier-des-charges.md](docs/cahier-des-charges.md).
2. Consigne de développement : « Tu es un ingénieur expert en interopérabilité des systèmes d'information de santé (normes HL7 FHIR R4 et HL7 v2.5.1) et développeur front-end React / TypeScript. » Elle demande un projet complet React/Vite/TypeScript, les couches d’accès FHIR, normalisation, mapping et les composants de recherche, rendez-vous et prévisualisation.
3. Demande : « en se basant sur le cahier des charges », accompagnée du critère de réalisation : interactions réelles FHIR, vue métier, vue source, conversion, alignement terminologique, gestion des erreurs et traçabilité, tests et dépôt GitHub avec journal de prompts individuel.
4. En réponse à la demande du dépôt de remise : `https://github.com/MalekGabsi/MediRdv`.

La consigne technique intégrale est conservée dans [docs/consigne-developpement.md](docs/consigne-developpement.md).

## Travail de l’assistant

- Lecture des documents et du dossier initialement vide.
- Contrôle du CapabilityStatement HAPI et consultation des définitions FHIR R4 et HL7 v2.5.1.
- Création des modules React/TypeScript, du modèle normalisé et du mapping local versionné.
- Mise en place de cinq vues : rendez-vous, ressources FHIR, conversion, terminologies, journal.
- Tests synthétiques isolés des données de l’application, puis vérification en lecture seule contre HAPI.
- Correction de la prise en charge des liens de pagination HAPI à la racine de baseR4.
- Documentation des choix locaux, des champs obligatoires, des pertes et des limites de validation.

## Décisions à expliquer à l’oral

- Pourquoi `Appointment.status` ne détermine pas un événement S12.
- Pourquoi un ID de ressource ne remplace pas un identifiant métier.
- Comment un champ HL7 est relié à son chemin FHIR ou à une règle déclarée.
- Pourquoi l’absence d’un professionnel est un avertissement et l’absence d’identifiant patient un échec.
- Ce que les tests démontrent et ce que la validation pédagogique ne certifie pas.

Les tests et résultats vérifiés sont consignés dans [docs/RECETTE.md](docs/RECETTE.md). Ce journal rapporte uniquement les demandes et travaux effectivement présents dans cette session ; il n’invente pas d’autres échanges ni de participation personnelle.
