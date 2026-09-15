# Phase 2 — Développement collaboratif

## Membre 1 — Interface utilisateur et parcours métier


### **Sous-prompt 1.1 — Structure et sélection du patient**

Tu es développeur React/TypeScript spécialisé dans les interfaces de santé.

Construis la structure de MediRdv avec React, Vite et CSS Modules : navigation, en-tête, indication du serveur FHIR et zone principale.

Implémente PatientSearch en utilisant le service FHIR du projet : recherche par nom, identifiant métier ou ID FHIR, affichage des correspondances et sélection explicite.

Ajoute un bandeau persistant présentant l’identité du patient sélectionné. Prévois les états de chargement, l’absence de résultat et les erreurs avec possibilité de réessayer.

Organise les composants pour accueillir ensuite la consultation des rendez-vous.

### **Sous-prompt 1.2 — Consultation des rendez-vous**

Poursuis l’interface réalisée dans le sous-prompt précédent.

À partir du patient sélectionné, connecte la récupération de ses rendez-vous et implémente AppointmentList : dates, statuts, libellés, filtres et chargement des pages suivantes.

Ajoute AppointmentDetail pour afficher les horaires, la durée, le professionnel, le lieu, le service et le motif disponibles.

Affiche « Non renseigné » pour les données absentes et distingue un agenda vide d’une erreur technique.

Maintiens le bandeau patient visible. Lors d’un changement de patient, efface le rendez-vous sélectionné et toute conversion précédente.

### **Sous-prompt 1.3 — Sources FHIR et finalisation du parcours**

Complète le parcours patient et rendez-vous développé précédemment.

Implémente ResourceViewer pour présenter les ressources FHIR effectivement reçues : JSON, provenance, date de récupération et profils déclarés.

Relie la navigation aux vues de conversion HL7, de terminologies et de journal des échanges fournies par les autres modules.

Finalise l’affichage responsive, les libellés accessibles et les interactions clavier.

Vérifie avec Playwright la sélection explicite du patient, l’ouverture du bon rendez-vous, les états vides, la reprise après erreur et l’affichage mobile.

Documente les étapes de démonstration.
