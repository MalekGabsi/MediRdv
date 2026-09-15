# Prompt initial de développement — Rendez-vous / calendrier d’un patient

Tu es un ingénieur expert en interopérabilité des systèmes d'information de santé (normes HL7 FHIR R4 et HL7 v2.5.1) et développeur front-end React / TypeScript.

Développe un prototype d'application Web complet en React (avec Vite, TypeScript et Tailwind CSS ou CSS Modules) qui implémente le cahier des charges d'interopérabilité suivant.

## 1. CONTEXTE TECHNIQUE ET ENVIRONNEMENT

- Serveur FHIR source : http://hapi.fhir.org/baseR4

- Métadonnées / CapabilityStatement : http://hapi.fhir.org/baseR4/metadata

- Version FHIR : 4.0.1 (R4)

- Standard cible : HL7 v2.5.1 (Famille SIU, message SIU_S12 par défaut pour le MVP)

- Encodage HL7 v2 : format pipe-delimited (|), séparateurs standards : `|` (champ), `^` (composant), `\~` (répétition), `\\` (échappement), `&` (sous-composant).

## 2. RÈGLE D'OR MÉTIER

Toute information produite dans le message HL7 v2 doit provenir directement d'une donnée source FHIR ou d'une règle de transformation explicite.

**UNE INFORMATION ABSENTE DANS FHIR NE DOIT JAMAIS ÊTRE INVENTÉE NI SIMULÉE.**

Une donnée facultative manquante ne doit pas faire échouer l'application (afficher « Non renseigné » et ajouter un Warning de transformation).

Une donnée obligatoire manquante pour le profil cible bloque la transformation avec statut FAILED explicite.

## 3. ARCHITECTURE APPLICATIVE REQUISE

Le code doit être modulaire, fortement typé en TypeScript et strictement découplé selon l'architecture en couches :

1. `/services/fhirApi.ts` :

- Appels HTTP Fetch vers http://hapi.fhir.org/baseR4.

- Recherche Patient (par ex. `Patient?name=...` ou saisie d'un ID `Patient/{id}`).

- Recherche des rendez-vous : `Appointment?patient={patientId}` (avec support optionnel du `_include=Appointment:actor`).

- Résolution conditionnelle unitaire des références du `participant.actor` si non incluses : `Practitioner/{id}`, `PractitionerRole/{id}`, `Location/{id}`, `HealthcareService/{id}`.

- Gestion robuste des erreurs HTTP, timeouts, Bundles vides (0 résultat \!= erreur) et OperationOutcome.

2. `/models/normalizedModel.ts` :

- Interfaces TypeScript représentant le modèle métier intermédiaire normalisé (Patient, Appointment, Participant, Organisation, Durée, Dates ISO).

- Pas de passage direct et brut du JSON FHIR vers les chaînes HL7 v2.

3. `/services/normalizer.ts` :

- Extrait et normalise les données du Bundle FHIR vers le modèle intermédiaire.

- Extraction des identifiants (distinguer Resource.id technique de Identifier.value métier).

- Identification des rôles des participants en analysant la chaîne de référence (Patient, Practitioner, Location, etc.).

4. `/services/hl7Mapper.ts` :

- Transforme le modèle normalisé en structure HL7 v2.5.1 SIU_S12.

- Formatage des dates : conversion ISO 8601 (ex. `2026-09-18T10:00:00+02:00`) en format HL7 TS (`YYYYMMDDHHMMSS[+/-ZZZZ]`). Préserver le fuseau, ne jamais inventer d'heure.

- Transcodage genre (PID-8) : male -\> M, female -\> F, other -\> O, unknown -\> U.

- Segments à générer :

* MSH : MSH-1 (|), MSH-2 (^\~\\&), MSH-7 (Horodatage courant), MSH-9 (SIU^S12^SIU_S12), MSH-10 (Message Control ID unique généré), MSH-11 (P), MSH-12 (2.5.1).

* SCH : SCH-1/2 (identifiant rdv), SCH-7 (motif CodeableConcept), SCH-8 (type rdv), SCH-25 (statut transcodé).

* PID : PID-3 (identifiant patient CX), PID-5 (Nom XPN), PID-7 (Date naissance TS), PID-8 (Genre).

* RGS : RGS-1 (1).

* AIS : AIS-1, AIS-3 (service/activité), AIS-4 (date début), AIS-7/8 (durée et unité).

* AIP : AIP-1, AIP-3 (praticien XCN), AIP-6 (date début). Optionnel, présent uniquement si praticien résolu.

* AIL : AIL-1, AIL-3 (lieu PL), AIL-6 (date début). Optionnel, présent uniquement si lieu résolu.

- Retourne un objet résultat : `{ hl7Message: string, status: 'SUCCESS' | 'SUCCESS_WITH_WARNINGS' | 'FAILED', warnings: string[], errors: string[] }`.

5. `/components/` :

- `PatientSearch.tsx` : Recherche/sélection de patient, affichage des correspondances multiples, confirmation explicite du contexte patient.

- `AppointmentList.tsx` : Vue synthétique des rendez-vous du patient (dates, statut, service).

- `AppointmentDetail.tsx` : Vue détaillée du rendez-vous sélectionné (distinction nette entre données connues et données absentes / non renseignées).

- `HL7Preview.tsx` : Sélecteur d'événement métier (défaut SIU-S12 Nouvelle réservation), zone d'affichage du message HL7 v2 généré avec coloration syntaxique ou mise en valeur des segments (MSH, SCH, PID, RGS, etc.), statut de validation, et panneau d'audit listant les warnings et la traçabilité.

## 4. INTERFACE UTILISATEUR (UI/UX)

- Interface claire, professionnelle, typée logiciel médical.

- Bannière d'en-tête rappelant le serveur connecté : HAPI FHIR R4 (http://hapi.fhir.org/baseR4).

- Statut patient persistant (bandeau d'identité affichant nom, ID, date de naissance une fois sélectionné).

- Bouton explicite pour lancer la génération de la trame HL7 v2 une fois le rendez-vous sélectionné.

- Bouton pour copier le message HL7 v2 généré dans le presse-papier.

- En cas d'erreur de communication FHIR (CORS, 404, 500), afficher un bandeau d'alerte explicite et compréhensible avec possibilité de réessayer.

## 5. LIVRABLES ATTENDUS

Fournis l'arborescence complète du projet et le code source complet de chaque fichier essentiel, exempt de placeholders non implémentés (« TODO ») sur la logique de mapping et de communication.
