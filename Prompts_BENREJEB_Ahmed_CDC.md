# Livrable individuel — Prompts utilisés pour le cahier des charges

**Sujet :** Rendez-vous / calendrier d’un patient  
**Partie traitée :** Modèle informationnel, spécification FHIR et interopérabilité sémantique

> Ce document présente les prompts employés et les réponses obtenues dans le cadre de la phase de conception du cahier des charges.

---

## Prompt 1 — Élaboration initiale de la spécification FHIR

Agis en tant qu'expert HL7 FHIR, modélisation des données de santé et interopérabilité sémantique.

### CONTEXTE DU PROJET

Nous sommes trois étudiants travaillant sur un prototype d'interopérabilité en santé.

Sujet :

**« Rendez-vous / calendrier d'un patient »**

Le prototype devra consulter un **serveur FHIR**, récupérer les informations nécessaires concernant le patient et ses rendez-vous, puis les présenter dans une application.

Une autre partie du projet, prise en charge par un autre membre, traitera la transformation vers HL7 v2.

Je suis responsable de la partie du cahier des charges concernant :

- la spécification FHIR ;

- le modèle informationnel ;

- les ressources nécessaires ;

- les profils et Implementation Guides pertinents ;

- les terminologies ;

- les interactions avec le serveur FHIR ;

- les contraintes de qualité et de validation sémantique.

Nous sommes actuellement en phase de conception. Ne développe pas l'application et ne produis pas de code applicatif.

### OBJECTIF

Élaborer un **contrat d'interopérabilité FHIR suffisamment précis pour guider le futur développement**.

Il faut déterminer exactement :

- quelles informations sont nécessaires ;

- dans quelles ressources FHIR elles se trouvent ;

- comment les ressources sont reliées ;

- quelles valeurs sont codées ;

- comment interroger le serveur ;

- quels éléments nécessitent une validation avant développement.

### TRAVAIL DEMANDÉ

#### 1. Choix de la version FHIR

Détermine la version de FHIR à retenir pour le projet.

IMPORTANT :

- ne choisis pas une version arbitrairement ;

- si l'énoncé ou le serveur pédagogique impose une version, celle-ci doit primer ;

- sinon, formule une recommandation argumentée ;

- précise que la version réellement exposée doit être vérifiée à partir du CapabilityStatement du serveur.

Explique brièvement pourquoi figer la version est nécessaire.

#### 2. Modèle informationnel du cas d'usage

À partir du besoin « rendez-vous / calendrier d'un patient », identifie les concepts métier nécessaires, par exemple :

- patient ;

- rendez-vous ;

- professionnel ;

- rôle professionnel ;

- lieu ;

- service ;

- organisation ;

- date/heure ;

- statut.

Pour chacun, indique :

- pourquoi il est nécessaire ;

- s'il est obligatoire ou facultatif pour notre prototype.

#### 3. Ressources FHIR

Identifie les ressources FHIR pertinentes.

Étudie en priorité les ressources susceptibles d'être utilisées, telles que :

- Patient ;

- Appointment ;

- Practitioner ;

- PractitionerRole ;

- Location ;

- HealthcareService ;

- Organization ;

- Schedule / Slot uniquement si le cas d'usage les nécessite réellement.

Ne retiens pas une ressource simplement parce qu'elle existe.

Pour chaque ressource retenue, donne :

- son rôle dans notre cas d'usage ;

- les éléments/champs utiles ;

- leur cardinalité pertinente ;

- les références vers les autres ressources ;

- leur caractère obligatoire ou facultatif pour notre application.

Présente le résultat dans un tableau.

#### 4. Ressource centrale Appointment

Analyse particulièrement `Appointment`.

Identifie notamment les éléments permettant de représenter :

- l'identifiant ;

- le statut ;

- le type ou motif si disponible ;

- le début ;

- la fin ou durée ;

- les participants ;

- le patient ;

- le professionnel ;

- le lieu ;

- le service.

Distingue ce qui appartient directement à Appointment de ce qui doit être obtenu en suivant une référence.

#### 5. Profils et Implementation Guides

Détermine si un profil FHIR ou un Implementation Guide particulier est nécessaire.

Respecte les règles suivantes :

- ne prétends jamais qu'un profil est obligatoire sans source ;

- distingue la ressource FHIR de base, un profil, une extension et un Implementation Guide ;

- si aucun profil spécifique n'est imposé, indique clairement que le prototype peut s'appuyer sur les ressources de base tout en restant capable de détecter `meta.profile` ;

- signale les éventuels profils français ou européens pertinents comme pistes uniquement s'ils sont réellement applicables au cas.

#### 6. Terminologies et interopérabilité sémantique

Recense tous les éléments potentiellement codés.

Pour chacun, précise :

- l'élément FHIR ;

- le CodeSystem éventuel ;

- le ValueSet ou binding prévu par FHIR ;

- la force du binding lorsqu'elle est pertinente ;

- ce qu'il faut conserver entre `system`, `code` et `display`.

Analyse notamment :

- Appointment.status ;

- appointmentType ;

- serviceType ;

- specialty ;

- reasonCode ;

- participant.status ;

- Patient.gender si utilisé.

Explique comment éviter les erreurs liées à des codes locaux ou à l'utilisation du seul libellé `display`.

#### 7. Interactions avec le serveur FHIR

Définis les interactions nécessaires au prototype.

Étudie notamment :

- `GET [base]/metadata` ;

- recherche de Patient ;

- lecture de Patient par identifiant ;

- recherche des Appointment d'un patient ;

- lecture des ressources référencées ;

- possibilité d'utiliser `_include` si elle est supportée.

Pour chaque interaction, indique :

- objectif ;

- méthode HTTP ;

- ressource ;

- paramètres de recherche ;

- résultat attendu ;

- comportement si le serveur ne supporte pas l'interaction.

Ne suppose pas qu'un paramètre de recherche est disponible : précise qu'il doit être vérifié dans le CapabilityStatement et dans la spécification de la version retenue.

#### 8. Structure des réponses FHIR

Explique les formes de réponses à gérer :

- Resource ;

- Bundle de recherche ;

- références ;

- OperationOutcome ;

- absence de résultat ;

- pagination si pertinente.

#### 9. Validation des données

Établis les contrôles minimaux nécessaires :

- structure FHIR ;

- cardinalités ;

- types ;

- références ;

- terminologies ;

- cohérence des dates ;

- données manquantes.

Distingue :

- validation syntaxique ;

- validation structurelle FHIR ;

- validation sémantique.

#### 10. Mini-modèle de données destiné aux autres membres

Produis une synthèse indiquant exactement quelles données le futur front-end et le futur moteur FHIR → HL7 v2 pourront consommer.

Par exemple sous forme d'un tableau :

| Donnée métier | Ressource FHIR | Chemin FHIR | Obligatoire pour le prototype ? |

Ce tableau servira de contrat entre les trois membres du groupe.

### SOURCES ET VÉRIFICATION

Appuie-toi prioritairement sur :

1. la spécification officielle HL7 FHIR correspondant à la version retenue ;

2. le CapabilityStatement du serveur pédagogique lorsqu'il sera disponible ;

3. les Implementation Guides officiels éventuellement retenus ;

4. les supports de cours.

N'utilise pas un blog comme justification principale lorsqu'une spécification officielle existe.

Pour chaque affirmation technique importante concernant FHIR, indique la source ou la section de spécification à vérifier.

Si tu ne peux pas confirmer une information, écris :

**« À vérifier dans la spécification / sur le serveur »**

plutôt que de l'inventer.

### CONTRAINTES

- Français professionnel.

- Pas de code d'application.

- Pas encore de mapping détaillé HL7 v2.

- Pas de choix arbitraire de profils ou terminologies.

- Distinguer explicitement :

- standard FHIR ;

- profil ;

- terminologie ;

- choix local du projet.

- Distinguer `code`, `system` et `display`.

- Signaler chaque hypothèse.

### FORMAT DE SORTIE

1. Version FHIR

2. Modèle informationnel

3. Ressources FHIR retenues

4. Analyse détaillée d'Appointment

5. Profils / Implementation Guides

6. Terminologies et bindings

7. Interactions avec le serveur

8. Gestion des réponses FHIR

9. Validation et qualité

10. Contrat de données pour l'application et le mapping

11. Hypothèses / décisions restant à valider

---

## Réponse obtenue — Prompt 1

### 1. Version FHIR

#### 1.1 Version candidate retenue

À ce stade, aucune information fournie ne prouve que le serveur pédagogique impose une version précise de FHIR. Il serait donc incorrect de présenter une version comme définitivement validée.

La recommandation de conception est :

> **Version candidate : HL7 FHIR R4 — 4.0.1**

Cette version doit cependant être considérée comme **provisoire jusqu’à interrogation du `CapabilityStatement` du serveur pédagogique**.

La spécification officielle R4 consultée correspond à la version 4.0.1. La ressource `Appointment` y est définie comme une réservation d’un événement de santé entre notamment patients et professionnels pour une période donnée.

La première opération de qualification du serveur devra donc être :

```http
GET [base]/metadata
```

puis inspection de :

CapabilityStatement.fhirVersion

CapabilityStatement.format

CapabilityStatement.rest

CapabilityStatement.rest.resource

En R4, `CapabilityStatement.fhirVersion` est obligatoire (`1..1`) et indique la version FHIR supportée par le système.

##### Règle de décision

Si le serveur annonce :

4.0.1

le projet confirme FHIR R4.

S’il annonce une autre version :

4.3.x → R4B

5.0.x → R5

la présente spécification devra être réévaluée avant développement.

Il est indispensable de figer la version car la structure des ressources, certains éléments, les cardinalités, les SearchParameters et les bindings terminologiques peuvent évoluer entre versions.

---

### 2. Modèle informationnel

Le modèle informationnel découle directement du besoin fonctionnel défini dans la première partie. Celui-ci impose notamment de pouvoir identifier un patient, conserver le lien patient–rendez-vous, exploiter les informations temporelles et le statut, et traiter professionnel, service et lieu comme informations conditionnelles.

| Concept métier | Rôle dans le prototype | Nécessité |
| ----- | ----- | ----- |
| Patient | Identifier la personne dont le calendrier est consulté | Obligatoire |
| Rendez-vous | Élément central du calendrier | Obligatoire |
| Identifiant du patient | Distinguer le patient, notamment en cas d’homonymie | Fortement recommandé |
| Identifiant du rendez-vous | Identifier durablement un rendez-vous et préparer les traitements ultérieurs | Recommandé |
| Date / heure de début | Situer le rendez-vous | Obligatoire pour un rendez-vous planifié exploitable |
| Date / heure de fin ou durée | Déterminer la plage temporelle | Conditionnel mais fortement souhaitable |
| Statut | Connaître l’état administratif du rendez-vous | Obligatoire dans la ressource Appointment |
| Type / motif / description | Comprendre la nature du rendez-vous | Facultatif |
| Participant | Relier le rendez-vous aux acteurs concernés | Structure FHIR obligatoire dans Appointment R4 |
| Professionnel | Identifier l’intervenant lorsqu’il est connu | Facultatif pour le MVP |
| Rôle professionnel | Représenter la fonction du professionnel dans son contexte organisationnel | Facultatif |
| Lieu | Localiser le rendez-vous | Facultatif |
| Service de santé | Représenter le service associé | Facultatif |
| Organisation | Préciser l’organisation associée à un rôle ou un service | Facultatif |
| Créneau de disponibilité | Représenter un créneau réservable | Hors besoin principal du MVP |

Il faut distinguer **« obligatoire dans FHIR »** et **« obligatoire pour notre application »**. Un champ peut être facultatif dans le standard mais devenir requis par une règle locale du prototype, et inversement.

---

### 3. Ressources FHIR retenues

#### 3.1 Ressources cœur

Les deux ressources indispensables sont :

- `Patient` ;
- `Appointment`.

`Patient` fournit les informations administratives permettant d’identifier la personne. En R4, `Patient.identifier` et `Patient.name` ont une cardinalité standard `0..*`, tandis que `gender` et `birthDate` sont `0..1`.

`Appointment` constitue la ressource centrale : elle décrit un rendez-vous planifié et contient notamment son statut, ses horaires et ses participants.

#### 3.2 Ressources conditionnelles

| Ressource | Rôle | Éléments utiles | Cardinalités pertinentes R4 | Références / relation | Nécessité applicative |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `Patient` | Identifier le patient | `identifier`, `name`, `birthDate`, éventuellement `gender` | `identifier 0..*`, `name 0..*`, `birthDate 0..1`, `gender 0..1` | référencé depuis `Appointment.participant.actor` | Obligatoire |
| `Appointment` | Représenter le rendez-vous | `identifier`, `status`, `serviceType`, `specialty`, `appointmentType`, `reasonCode`, `description`, `start`, `end`, `minutesDuration`, `participant` | voir section 4 | référence Patient, Practitioner, PractitionerRole, HealthcareService, Location... | Obligatoire |
| `Practitioner` | Identifier une personne exerçant une fonction professionnelle | `identifier`, `name` | `identifier 0..*`, `name 0..*` | cible possible de `Appointment.participant.actor` | Conditionnelle |
| `PractitionerRole` | Porter le rôle du professionnel dans un contexte organisationnel | `practitioner`, `organization`, `code`, `specialty`, `location`, `healthcareService` | `practitioner 0..1`, `organization 0..1`, `code 0..*`, `specialty 0..*`, `location 0..*`, `healthcareService 0..*` | référence Practitioner, Organization, Location, HealthcareService | Conditionnelle |
| `Location` | Décrire un lieu physique ou logique | `identifier`, `name`, éventuellement type/adresse | À vérifier selon les éléments finalement exploités | cible possible d’un participant Appointment | Conditionnelle |
| `HealthcareService` | Décrire un service de santé | identifiant, nom, type/service, organisation, localisation selon données | À vérifier avant contractualisation finale | peut être référencé comme participant ; peut être lié à PractitionerRole | Conditionnelle |
| `Organization` | Donner le contexte organisationnel d’un rôle/service | identifiant, nom | À vérifier selon les données réellement nécessaires | principalement via PractitionerRole ou HealthcareService | Facultative |

FHIR R4 distingue bien `Practitioner` de `PractitionerRole` : le premier représente la personne, tandis que le second porte notamment les rôles que cette personne peut exercer pour une organisation, avec ses spécialités, lieux et services.

#### 3.3 Schedule et Slot

Pour le MVP, **`Schedule` et `Slot` ne sont pas nécessaires**.

La spécification explique que `Schedule` et `Slot` interviennent notamment dans la recherche de disponibilités avant réservation ; cette étape est facultative dans le workflow de planification.

Or notre besoin est :

> consulter des rendez-vous existants,

et non :

> rechercher puis réserver des créneaux disponibles.

Ils seront donc exclus du périmètre minimal.

---

### 4. Analyse détaillée d’Appointment

#### 4.1 Rôle

`Appointment` représente un rendez-vous planifié, passé ou futur. La ressource concerne une réunion/réservation pouvant impliquer personnes, lieux, services ou équipements.

#### 4.2 Éléments principaux

| Information métier | Élément FHIR R4 | Type | Cardinalité | Direct / référence | Utilisation |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Identifiant FHIR | `Appointment.id` | `id` | hérité de Resource | Direct | Identifiant technique |
| Identifiant métier | `Appointment.identifier` | `Identifier` | `0..*` | Direct | Identifiant externe du RDV |
| Statut | `Appointment.status` | `code` | `1..1` | Direct | Obligatoire FHIR |
| Catégorie de service | `Appointment.serviceCategory` | `CodeableConcept` | `0..*` | Direct | Facultatif |
| Type de service | `Appointment.serviceType` | `CodeableConcept` | `0..*` | Direct | Facultatif |
| Spécialité | `Appointment.specialty` | `CodeableConcept` | `0..*` | Direct | Facultatif |
| Type de RDV | `Appointment.appointmentType` | `CodeableConcept` | `0..1` | Direct | Facultatif |
| Motif codé | `Appointment.reasonCode` | `CodeableConcept` | `0..*` | Direct | Facultatif |
| Motif référencé | `Appointment.reasonReference` | `Reference` | `0..*` | Référence | Hors besoin minimal |
| Description | `Appointment.description` | `string` | `0..1` | Direct | Affichage humain possible |
| Début | `Appointment.start` | `instant` | `0..1` | Direct | Information temporelle |
| Fin | `Appointment.end` | `instant` | `0..1` | Direct | Information temporelle |
| Durée | `Appointment.minutesDuration` | `positiveInt` | `0..1` | Direct | Durée indicative |
| Participants | `Appointment.participant` | BackboneElement | `1..*` | Direct | Structure essentielle |
| Rôle participant | `participant.type` | `CodeableConcept` | `0..*` | Direct | Rôle du participant |
| Acteur | `participant.actor` | `Reference` | `0..1` | Référence | Patient / professionnel / lieu / service… |
| Obligation participation | `participant.required` | `code` | `0..1` | Direct | Facultatif |
| Statut participation | `participant.status` | `code` | `1..1` | Direct | Obligatoire par participant |

Ces cardinalités sont celles de FHIR R4, pas celles de notre futur profil local.

#### 4.3 Contraintes temporelles importantes

FHIR R4 impose deux règles notables :

- `start` et `end` doivent être présents ensemble ou absents ensemble ;
- seuls certains statuts — notamment `proposed` ou `cancelled` — peuvent être dépourvus de début/fin selon les invariants définis par la ressource.

La couche applicative ne devra donc pas déclarer automatiquement toute absence de `start` comme invalide sans considérer le statut.

#### 4.4 Identification du patient

FHIR R4 ne possède pas dans `Appointment` un simple champ :

Appointment.patient

Le patient est représenté comme un participant dont :

Appointment.participant.actor

référence un `Patient`.

La ressource autorise `participant.actor` à référencer :

Patient

Practitioner

PractitionerRole

RelatedPerson

Device

HealthcareService

Location

Cela signifie que le prototype devra **inspecter le type de référence** au lieu de supposer que tous les participants sont des professionnels.

#### 4.5 Professionnel

Deux formes principales doivent être supportées conceptuellement :

Appointment.participant.actor → Practitioner

ou :

Appointment.participant.actor → PractitionerRole

Dans le second cas, il peut être nécessaire de poursuivre vers :

PractitionerRole.practitioner → Practitioner

pour obtenir l’identité de la personne.

`PractitionerRole` peut également fournir organisation, rôle, spécialité, lieux et services.

#### 4.6 Lieu

FHIR R4 indique explicitement que le lieu d’un Appointment est représenté par un participant référençant un `Location` ou éventuellement un `HealthcareService`.

Le prototype ne devra donc pas inventer un lieu à partir d’un libellé non prévu à cet effet.

#### 4.7 Service

Il existe plusieurs représentations possibles qui ne sont pas synonymes :

Appointment.serviceCategory

Appointment.serviceType

Appointment.specialty

Appointment.appointmentType

FHIR précise notamment que `appointmentType` représente le style/type de rendez-vous et **pas** le type de service.

Le prototype devra donc conserver ces concepts séparément.

---

### 5. Profils / Implementation Guides

#### 5.1 Distinctions à conserver

Le cahier des charges distingue :

**FHIR de base**
La définition standard de ressources comme `Patient` et `Appointment`.

**Profil**
Une `StructureDefinition` imposant ou précisant l’utilisation d’une ressource dans un contexte particulier.

**Extension**
Un élément supplémentaire utilisé lorsqu’un concept n’est pas représenté directement dans le modèle de base.

**Implementation Guide**
Un ensemble cohérent de règles, profils, extensions, terminologies et recommandations pour un contexte donné.

**Terminologie**
Les CodeSystems et ValueSets utilisés pour donner un sens contrôlé aux données codées.

#### 5.2 Décision pour le prototype

Aucun profil national, européen ou métier spécifique n’est actuellement fourni dans l’énoncé ou le contexte disponible.

La décision raisonnable est donc :

> **Le MVP s’appuie initialement sur les ressources FHIR de base de la version retenue.**

Cependant, chaque ressource reçue devra pouvoir être inspectée pour identifier :

Resource.meta.profile

Si le serveur pédagogique annonce des profils précis, ceux-ci devront être analysés avant de figer le contrat.

De même, le `CapabilityStatement` peut annoncer les profils ou Implementation Guides supportés. La spécification prévoit notamment une déclaration des Implementation Guides dans le CapabilityStatement.

##### Profils français ou européens

Aucun profil français ou européen n’est déclaré obligatoire dans les informations dont nous disposons.

Ils doivent donc être considérés comme des **pistes d’analyse ultérieure uniquement**, et non comme des exigences du cahier des charges actuel.

---

### 6. Terminologies et bindings

L’interopérabilité sémantique exige de ne pas réduire les informations codées à leur seul texte affiché.

Pour un `Coding`, les trois propriétés principales doivent être distinguées :

system

code

display

La clé sémantique est généralement portée par :

system + code

tandis que :

display

sert principalement à la présentation humaine.

#### 6.1 Éléments codés principaux

| Élément | Type | Binding / jeu de valeurs R4 | Force | Règle |
| ----- | ----- | ----- | ----- | ----- |
| `Appointment.status` | `code` | AppointmentStatus | **Required** | Valeur obligatoirement issue du jeu FHIR |
| `Appointment.serviceCategory` | `CodeableConcept` | Service Category | Example | Accepter terminologie du serveur |
| `Appointment.serviceType` | `CodeableConcept` | Service Type | Example | Ne pas supposer SNOMED ou autre sans preuve |
| `Appointment.specialty` | `CodeableConcept` | Practice Setting Code Value Set | Preferred | Conserver codages d’origine |
| `Appointment.appointmentType` | `CodeableConcept` | v2 Appointment Reason Codes dans R4 | Preferred | Ne pas confondre avec serviceType |
| `Appointment.reasonCode` | `CodeableConcept` | Encounter Reason Codes | Preferred | Peut contenir plusieurs codages |
| `Appointment.participant.type` | `CodeableConcept` | Participant type | Extensible | Préserver les codes |
| `Appointment.participant.required` | `code` | ParticipantRequired | Required | Codes FHIR |
| `Appointment.participant.status` | `code` | ParticipationStatus | **Required** | accepted / declined / tentative / needs-action |
| `Patient.gender` | `code` | AdministrativeGender | **Required** si l’élément est présent | Ne pas interpréter comme sexe clinique |

Les bindings d’`Appointment` et leurs forces sont définis dans la spécification R4 : statut Required, spécialité Preferred, appointmentType Preferred, reasonCode Preferred, participant.type Extensible et participant.status Required.

`Patient.gender` utilise le ValueSet AdministrativeGender avec un binding Required ; FHIR précise qu’il représente un **genre administratif**, pas l’ensemble des dimensions cliniques ou sociales du sexe/genre.

#### 6.2 Gestion d’un CodeableConcept

Un `CodeableConcept` peut comporter plusieurs `Coding`.

Le prototype ne devra pas supposer :

coding[0] = code de référence universel

Il devra préserver l’ensemble des codages utiles ou, si une sélection est nécessaire pour l’affichage, appliquer une règle documentée.

#### 6.3 Codes locaux

Un exemple de code local :

system = https://example-hospital.fr/codes/services

code = CARDIO1

display = Consultation cardiologie

ne doit pas être transformé arbitrairement en SNOMED CT ou dans une autre terminologie.

La règle est :

> **préserver le codage source ; ne réaliser une transcoding terminologique que si une table de correspondance ou un service terminologique validé existe.**

#### 6.4 `display` seul

La valeur :

display = "Cardiologie"

sans `system` ni `code` ne permet pas de garantir l’identité sémantique du concept.

Elle peut être utilisée pour l’affichage, mais elle ne doit pas être traitée comme un code standard.

---

### 7. Interactions avec le serveur

Avant toute implémentation, les capacités réellement déclarées par le serveur doivent être confrontées à ces interactions.

| Interaction | Objectif | Méthode | Ressource | Paramètres | Résultat attendu | Si non supporté |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Capability Statement | Identifier version/capacités | GET | `metadata` | aucun | `CapabilityStatement` | Bloquant pour qualification initiale |
| Recherche Patient | Trouver un patient | GET search | `Patient` | `identifier`, `name` ou autre confirmé | Bundle | Utiliser un paramètre réellement supporté |
| Lecture Patient | Lire un patient connu | GET read | `Patient/{id}` | id logique | Patient | Gérer 404/OperationOutcome |
| Recherche RDV patient | Obtenir les RDV d’un patient | GET search | `Appointment` | `patient` | Bundle d’Appointment | Vérifier support serveur |
| Lecture ressource référencée | Résoudre professionnel/lieu/service | GET read | ressource cible | id logique | Resource | Information marquée indisponible |
| Inclusion | Limiter les requêtes supplémentaires | GET search | Appointment | `_include` | Bundle avec inclusions | Repli sur lectures individuelles |

#### 7.1 Recherche Patient

FHIR R4 définit notamment un SearchParameter `Patient.identifier`.

On peut donc envisager conceptuellement :

```http
GET [base]/Patient?identifier=...
```

mais son support effectif doit être confirmé dans :

CapabilityStatement.rest.resource.searchParam

Le CapabilityStatement permet justement au serveur de déclarer ses SearchParameters supportés.

#### 7.2 Recherche des rendez-vous du patient

FHIR R4 définit pour `Appointment` le SearchParameter :

patient

de type `reference`, basé sur le participant dont l’acteur est un Patient.

L’interaction candidate est donc :

```http
GET [base]/Appointment?patient={patient-id}
```

ou la représentation équivalente acceptée par le serveur.

La spécification indique qu’un paramètre de recherche spécifiquement typé `patient` n’a pas besoin que la valeur soit préfixée par `Patient/`, mais la forme effectivement utilisée devra être testée sur le serveur.

#### 7.3 Recherche par date

FHIR R4 définit également :

Appointment?date=...

où `date` cible `Appointment.start`.

Ce paramètre peut être utile si le projet décide ultérieurement de ne récupérer que les rendez-vous futurs.

Il n’est pas indispensable au MVP tant que l’application peut filtrer les résultats reçus.

#### 7.4 `_include`

FHIR permet l’utilisation de `_include` pour demander que des ressources référencées soient incluses dans le Bundle de recherche, ce qui réduit les requêtes réseau.

Mais il ne faut pas supposer que le serveur accepte n’importe quel `_include`.

Le CapabilityStatement R4 possède :

CapabilityStatement.rest.resource.searchInclude

pour déclarer les valeurs `_include` supportées.

Par conséquent :

> `_include` est une optimisation, pas une dépendance obligatoire du MVP.

---

### 8. Gestion des réponses FHIR

#### 8.1 Lecture d’une ressource

Une interaction de type read, par exemple :

```http
GET [base]/Patient/{id}
```

retourne normalement une ressource unique `Patient`.

Même logique pour :

Practitioner/{id}

PractitionerRole/{id}

Location/{id}

HealthcareService/{id}

#### 8.2 Résultat d’une recherche

Une recherche FHIR renvoie un `Bundle`, même lorsque le résultat est vide. La spécification précise qu’une réponse de recherche est une liste de ressources dans un Bundle.

La couche FHIR doit donc gérer :

Bundle.total = 0 / aucune entrée

Bundle avec 1 match

Bundle avec plusieurs matches

Bundle avec ressources incluses

#### 8.3 Aucun résultat

Il faut distinguer :

Patient trouvé mais aucun Appointment

de :

échec de la requête

Un résultat de recherche vide **n’est pas une erreur FHIR**. La spécification le précise explicitement.

Cela correspond directement à l’exigence fonctionnelle selon laquelle « aucun rendez-vous » doit être traité comme un état métier normal.

#### 8.4 OperationOutcome

En cas d’échec d’une recherche, un serveur devrait retourner un `OperationOutcome` avec des informations décrivant le problème. Des `OperationOutcome` peuvent également apparaître comme avertissements dans un Bundle de recherche.

Le prototype devra donc distinguer :

OperationOutcome fatal/error

OperationOutcome warning/information

lorsque les données le permettent.

#### 8.5 Références

Une référence peut être :

- relative ;
- absolue ;
- potentiellement non résoluble par le serveur courant.

La couche d’accès devra conserver la référence d’origine et ne pas inventer de ressource cible.

Si un `Practitioner` ou un `Location` n’est pas résoluble, le rendez-vous doit rester exploitable si cette information est facultative.

#### 8.6 Pagination

Le prototype ne doit pas supposer qu’un Bundle contient tous les résultats.

FHIR utilise les liens du Bundle pour naviguer dans les pages de résultats. Le paramètre `_count` peut demander une taille de page, mais le serveur peut retourner moins d’éléments que demandé.

La future couche FHIR devra donc suivre :

Bundle.link[relation = "next"]

jusqu’à épuisement des pages si la récupération complète est nécessaire.

---

### 9. Validation et qualité

La validation doit être organisée sur trois niveaux.

#### 9.1 Validation syntaxique

Objectif : déterminer si la réponse est techniquement lisible.

Contrôles :

JSON/XML correctement formé

Content-Type attendu

réponse HTTP exploitable

Une erreur syntaxique empêche l’interprétation FHIR.

#### 9.2 Validation structurelle FHIR

Objectif : vérifier que la ressource respecte la structure de la version FHIR retenue.

Contrôles principaux :

| Contrôle | Exemple |
| ----- | ----- |
| `resourceType` | `Appointment` réellement reçu |
| Types | `start` conforme au type `instant` |
| Cardinalités | `Appointment.status` présent exactement une fois |
| Participants | au moins un `participant` en R4 |
| Statut participant | `participant.status` présent |
| Références | type de cible compatible avec la définition |
| Contraintes | cohérence `start/end` |

FHIR R4 impose notamment `Appointment.status 1..1`, `participant 1..*` et `participant.status 1..1`.

#### 9.3 Validation sémantique

Elle porte sur le sens.

Exemples :

Appointment.status appartient au ValueSet requis

participant.status est valide

system + code d’un Coding sont conservés

appointmentType n’est pas interprété comme serviceType

Patient.gender reste un genre administratif

start \<= end

type de participant interprété correctement

#### 9.4 Contraintes locales du prototype

À ne pas confondre avec les règles FHIR.

Exemples de contraintes locales candidates :

Le rendez-vous doit être rattachable au patient sélectionné.

Un rendez-vous affichable doit disposer d’assez d’informations temporelles

pour le scénario retenu.

Les informations facultatives absentes génèrent un état "non renseigné",

pas une erreur bloquante.

#### 9.5 Niveaux de sévérité recommandés

**Bloquant** :

- ressource illisible ;
- mauvais `resourceType` ;
- absence d’un élément obligatoire par FHIR ;
- patient impossible à rattacher au rendez-vous dans le scénario.

**Warning** :

- professionnel non résoluble ;
- lieu absent ;
- service absent ;
- code local inconnu mais correctement identifié par `system + code`.

**Informationnel** :

- champ optionnel absent ;
- `display` manquant lorsque le code est correctement identifié.

---

### 10. Contrat de données pour l’application et le mapping

Ce tableau constitue le premier contrat d’échange entre la couche FHIR, le front-end et le futur composant de transformation.

| Donnée métier | Ressource FHIR | Chemin FHIR R4 | Obligatoire pour le prototype ? | Destinataire |
| ----- | ----- | ----- | ----- | ----- |
| Id technique patient | Patient | `Patient.id` | Oui pour suivi interne | Front + futur mapping |
| Identifiant métier patient | Patient | `Patient.identifier` | Conditionnel mais recommandé | Front + futur mapping |
| Nom patient | Patient | `Patient.name` | Oui dans le scénario d’identification | Front + futur mapping |
| Date de naissance | Patient | `Patient.birthDate` | Conditionnelle | Front + futur mapping |
| Genre administratif | Patient | `Patient.gender` | Facultatif | Futur mapping si nécessaire |
| Id technique RDV | Appointment | `Appointment.id` | Oui pour gestion interne | Front + futur mapping |
| Identifiant métier RDV | Appointment | `Appointment.identifier` | Conditionnel / recommandé | Futur mapping |
| Statut RDV | Appointment | `Appointment.status` | Oui | Front + futur mapping |
| Description | Appointment | `Appointment.description` | Facultatif | Front |
| Type de RDV | Appointment | `Appointment.appointmentType` | Facultatif | Front + futur mapping |
| Type de service | Appointment | `Appointment.serviceType` | Facultatif | Front + futur mapping |
| Spécialité | Appointment | `Appointment.specialty` | Facultatif | Front + futur mapping |
| Motif codé | Appointment | `Appointment.reasonCode` | Facultatif | Front + futur mapping |
| Début | Appointment | `Appointment.start` | Selon statut ; nécessaire pour RDV planifié du MVP | Front + futur mapping |
| Fin | Appointment | `Appointment.end` | Selon statut | Front + futur mapping |
| Durée | Appointment | `Appointment.minutesDuration` | Facultatif | Front + futur mapping |
| Participants | Appointment | `Appointment.participant` | Oui FHIR R4 | Couche normalisation |
| Patient participant | Appointment | `participant.actor → Patient` | Oui pour lien métier | Couche normalisation |
| Statut participant | Appointment | `participant.status` | Oui FHIR | Futur mapping si nécessaire |
| Professionnel | Appointment + Practitioner | `participant.actor → Practitioner` | Facultatif | Front + futur mapping |
| Rôle professionnel | Appointment + PractitionerRole | `participant.actor → PractitionerRole` puis `code/specialty` | Facultatif | Front + futur mapping |
| Nom professionnel | Practitioner | `Practitioner.name` | Facultatif | Front + futur mapping |
| Lieu | Appointment + Location | `participant.actor → Location` | Facultatif | Front + futur mapping |
| Service | Appointment / HealthcareService | `serviceType` ou `participant.actor → HealthcareService` | Facultatif ; concepts à ne pas confondre | Front + futur mapping |
| Organisation | PractitionerRole / HealthcareService | références organisationnelles | Facultatif | Principalement futur mapping |

L’objectif n’est pas de transmettre directement le JSON FHIR à toutes les couches mais, à terme, de tendre vers :

FHIR reçu

↓

validation

↓

résolution des références

↓

normalisation métier

↓

┌───────────────────────┐

│ Front-end             │

└───────────────────────┘

+

┌───────────────────────┐

│ futur mapping HL7 v2  │

└───────────────────────┘

Cette séparation évitera que l’interface ou le moteur HL7 v2 aient chacun leur propre interprétation de `Appointment`.

---

### 11. Hypothèses / décisions restant à valider

| ID | Élément à valider | Nature | Méthode de validation | Impact |
| ----- | ----- | ----- | ----- | ----- |
| H-01 | Version FHIR réelle | Serveur | `GET [base]/metadata` → `fhirVersion` | Bloquant avant développement |
| H-02 | Support de `Patient` | Serveur | CapabilityStatement | Bloquant |
| H-03 | Support de `Appointment` | Serveur | CapabilityStatement | Bloquant |
| H-04 | Support recherche `Patient.identifier` | Serveur | `searchParam` | Détermine l’identification |
| H-05 | Support recherche `Patient.name` si nécessaire | Serveur | CapabilityStatement + test | Alternative d’identification |
| H-06 | Support `Appointment?patient=` | Serveur | CapabilityStatement + test | Central pour le cas d’usage |
| H-07 | Support `_include` | Serveur | `searchInclude` | Optimisation uniquement |
| H-08 | Ressources réellement utilisées comme participants | Données | Inspection de vrais Appointment | Détermine les résolveurs nécessaires |
| H-09 | Présence de Practitioner ou PractitionerRole | Données | Inspection serveur | Modèle du professionnel |
| H-10 | Présence de Location | Données | Inspection serveur | Affichage du lieu |
| H-11 | Présence de HealthcareService | Données | Inspection serveur | Modèle du service |
| H-12 | Profils dans `meta.profile` | Serveur / données | Inspection des ressources | Validation de conformité |
| H-13 | Implementation Guides déclarés | Serveur | CapabilityStatement | Peut modifier le contrat |
| H-14 | Terminologies réellement rencontrées | Données | Inspection des Coding | Détermine la validation sémantique |
| H-15 | Rendez-vous passés/futurs à récupérer | Groupe | Décision fonctionnelle | Recherche/date/filtrage |
| H-16 | Données minimales nécessaires au futur HL7 v2 | Groupe / membre 3 | Confrontation au mapping cible | Peut renforcer certaines contraintes locales |

##### Décision de conception provisoire

Tant que le serveur n’a pas été qualifié, le contrat doit être interprété comme :

> **FHIR R4 4.0.1 candidat + ressources de base `Patient` et `Appointment` obligatoires + ressources référencées résolues conditionnellement + aucun profil spécifique imposé + conservation stricte de la sémantique des codes + CapabilityStatement comme source de vérité sur les capacités réellement offertes par le serveur.**

La distinction la plus importante à conserver pour la suite est donc :

FHIR permet

≠

notre serveur supporte

≠

notre prototype implémente

≠

notre besoin métier exige

---

## Prompt 2 — Relecture technique et consolidation

Agis comme un architecte d'interopérabilité en santé spécialisé en :

- HL7 FHIR ;

- conception de contrats d'interopérabilité ;

- modélisation informationnelle ;

- interopérabilité sémantique ;

- validation FHIR ;

- analyse de CapabilityStatement ;

- ingénierie des exigences d'interopérabilité.

Tu interviens comme RELECTEUR TECHNIQUE d'une première proposition de

spécification FHIR.

Ton objectif n'est pas de produire davantage de contenu, mais de vérifier que

chaque décision est correcte, nécessaire, justifiée et exploitable pour

développer le prototype.

### CONTEXTE DU PROJET

Le projet universitaire porte sur :

« Rendez-vous / calendrier d'un patient ».

Le prototype doit permettre :

- d'identifier un patient ;

- de consulter les rendez-vous qui lui sont associés ;

- d'afficher les informations nécessaires à leur compréhension ;

- de gérer les informations partielles ou indisponibles ;

- de préparer les données qui seront ultérieurement transformées vers HL7 v2.

La transformation HL7 v2 détaillée relève d'un autre membre du groupe.

La présente partie concerne exclusivement le contrat d'interopérabilité FHIR.

### CONTRAINTES ISSUES DU CADRAGE FONCTIONNEL

La partie métier déjà validée impose les règles suivantes :

1. le patient doit pouvoir être identifié sans ambiguïté ;

2. un rendez-vous doit rester rattaché au patient concerné ;

3. les informations temporelles doivent être exploitées lorsqu'elles existent ;

4. le statut du rendez-vous doit être exploité lorsqu'il est disponible ;

5. professionnel, service et lieu sont des informations conditionnelles ;

6. une information absente ne doit jamais être inventée ;

7. l'absence de rendez-vous doit être distinguée d'une erreur d'accès aux données ;

8. une donnée facultative absente ne doit pas bloquer toute la consultation ;

9. la couche FHIR doit fournir des données suffisamment structurées pour être

consommées par l'interface et par le futur moteur de transformation.

### ENTRÉE

Tu devras agir maintenant sur le résultat de mon précédent prompt comme input.

Informations disponibles sur le serveur pédagogique, si connues :

- URL de base :  http://hapi.fhir.org/baseR4

- CapabilityStatement : http://hapi.fhir.org/baseR4/metadata

- version FHIR annoncée : FHIR Version

4.0.1 (R4)

- éventuelles contraintes données par l'enseignant :

- Serveur public de test/démonstration non sécurisé (interdiction de stocker des données          réelles / identifiantes).

- Les données du serveur sont régulièrement purgées et rechargées avec des jeux de données de test fixes (*« This server will be regularly purged and reloaded with fixed test data »*).

Si une information serveur n'est pas fournie, ne l'invente pas.

### OBJECTIF

Corriger les éléments non suffisamment justifiés dans cette première élaboration afin d’en fournir la version finale.

La nouvelle version doit distinguer explicitement :

- ce qui est imposé par FHIR ;

- ce qui dépend du serveur ;

- ce qui est un choix du projet ;

- ce qui reste à vérifier.

\!\!\! Tu devrais te poser sur un audit comme défini ci-dessous tout en veillant à ce que le résultat final ne soit que la version finale de cette 2ème partie.

### 1 — VALIDATION DE LA VERSION FHIR

Vérifie le choix de version proposé.

Applique l'ordre de priorité suivant :

1. version imposée par l'énoncé ;

2. version déclarée par le CapabilityStatement du serveur ;

3. recommandation du projet uniquement si aucune version n'est imposée.

Pour chaque conclusion, indique son statut :

- CONFIRMÉ PAR LE SERVEUR ;

- IMPOSÉ PAR L'ÉNONCÉ ;

- RECOMMANDATION ;

- À VÉRIFIER.

Ne suppose jamais que R4, R4B ou R5 est utilisé sans preuve.

Explique les conséquences d'une différence de version sur :

- structure des ressources ;

- éléments disponibles ;

- paramètres de recherche ;

- bindings terminologiques ;

- futurs mappings.

### 2 — REVUE DU MODÈLE INFORMATIONNEL

Pour chaque concept métier identifié dans la version précédente, vérifie :

- qu'il est réellement nécessaire au besoin fonctionnel ;

- qu'il n'est pas redondant avec un autre concept ;

- qu'il appartient bien au périmètre MVP ;

- s'il est obligatoire, conditionnel ou optionnel.

Produis une matrice :

| Concept métier | Besoin fonctionnel associé | Nécessaire au MVP ? |

| Ressource FHIR candidate | Justification |

Ne choisis pas une ressource FHIR uniquement parce qu'elle existe.

### 3 — REVUE DES RESSOURCES FHIR

Pour chaque ressource proposée dans la première version :

1. confirmer ou rejeter son utilité ;

2. expliquer ce qu'elle apporte réellement ;

3. distinguer :

- ressource centrale ;

- ressource référencée ;

- ressource optionnelle ;

- ressource inutile pour le MVP.

Étudier notamment :

- Patient ;

- Appointment ;

- Practitioner ;

- PractitionerRole ;

- Location ;

- HealthcareService ;

- Organization ;

- Schedule ;

- Slot.

IMPORTANT :

Schedule et Slot ne doivent être retenus que si le prototype gère réellement

les disponibilités ou la planification des créneaux.

Si le prototype se limite à consulter des rendez-vous déjà existants,

vérifie s'ils sont réellement nécessaires.

### 4 — VÉRIFICATION DES ÉLÉMENTS FHIR

Pour chaque élément FHIR retenu :

- vérifier son existence dans la version retenue ;

- vérifier son type ;

- vérifier sa cardinalité standard ;

- vérifier s'il est directement présent dans la ressource ou accessible

par référence ;

- vérifier si son usage proposé respecte sa sémantique officielle.

Produis un tableau :

| Donnée métier | Ressource | Élément FHIR | Type FHIR |

| Cardinalité standard | Direct / référence | Usage dans le prototype |

| Statut de vérification |

Utilise uniquement les cardinalités officielles de la version retenue.

Ne transforme pas une cardinalité FHIR en exigence métier sans le signaler.

Exemple :

un élément facultatif en FHIR peut devenir obligatoire pour NOTRE prototype.

Dans ce cas, écrire explicitement :

« contrainte locale du projet ».

### 5 — ANALYSE APPROFONDIE DE Appointment

Vérifie avec attention la ressource Appointment.

Pour chaque information suivante, établir exactement comment elle est obtenue :

- identifiant du rendez-vous ;

- statut ;

- date/heure de début ;

- date/heure de fin ;

- durée ;

- description ;

- type ;

- motif ;

- service ;

- spécialité ;

- participants ;

- patient ;

- professionnel ;

- rôle professionnel ;

- lieu ;

- service de santé éventuel.

Produis :

| Information | Élément Appointment direct ? |

| Élément / référence | Ressource cible éventuelle |

| Obligatoire pour notre MVP ? | Remarque |

Vérifie particulièrement les erreurs classiques :

- confondre participant et professionnel ;

- supposer qu'un participant est toujours Practitioner ;

- confondre Practitioner et PractitionerRole ;

- confondre serviceType, specialty et appointmentType ;

- déduire le lieu sans référence ou information explicite ;

- traiter description comme un code ;

- supposer que tous les rendez-vous possèdent start/end ;

- confondre statut métier et événement historique.

### 6 — ANALYSE DES RÉFÉRENCES

Construis un graphe logique des références utiles.

Exemple de forme attendue :

Patient

↑

Appointment

├── participant → ...

├── service ...

└── ...

Ne renseigne que les relations réellement permises par la version retenue.

Pour chaque référence, préciser :

- types de ressources autorisés ;

- types réellement utiles au prototype ;

- comportement si la référence n'est pas résolue ;

- comportement si la ressource référencée est absente.

### 7 — TERMINOLOGIES ET BINDINGS

Reprends tous les éléments codés identifiés.

Pour chacun :

- vérifier le type FHIR : code, Coding, CodeableConcept, etc. ;

- vérifier le ValueSet associé lorsqu'il existe ;

- vérifier la force du binding :

required / extensible / preferred / example ;

- identifier le CodeSystem uniquement lorsqu'il est défini ou constaté ;

- distinguer terminologie FHIR standard et terminologie externe.

Produis :

| Élément | Type FHIR | ValueSet / CodeSystem |

| Force du binding | Ce que doit conserver l'application |

| Risque d'interopérabilité |

Vérifie notamment :

- Appointment.status ;

- Appointment.appointmentType ;

- Appointment.serviceType ;

- Appointment.specialty ;

- Appointment.reasonCode ou équivalent de la version retenue ;

- Appointment.participant.status ;

- Patient.gender si utilisé.

RÈGLE SÉMANTIQUE :

Pour un Coding, l'application ne doit pas identifier le concept uniquement par

display.

Lorsqu'ils existent, conserver séparément :

- system ;

- code ;

- display.

Explique le traitement à prévoir pour :

- code standard ;

- code local ;

- system absent ;

- code absent ;

- display absent ;

- plusieurs Coding dans un même CodeableConcept.

Ne crée aucune table de correspondance locale arbitraire.

### 8 — PROFILS, EXTENSIONS ET IMPLEMENTATION GUIDES

Réévalue toute affirmation de la première version concernant les profils.

Pour chaque profil ou IG éventuellement proposé :

- fournir sa canonical URL si elle est connue et vérifiable ;

- expliquer sa portée ;

- dire s'il est :

- imposé par le serveur ;

- imposé par l'énoncé ;

- pertinent mais optionnel ;

- hors sujet.

Distingue systématiquement :

FHIR de base

≠ profil

≠ extension

≠ Implementation Guide

≠ terminologie.

Ne prétends pas que le projet est conforme à un profil national simplement

parce qu'il existe.

Si aucun profil spécifique n'est imposé, recommander une stratégie compatible

avec les ressources de base et l'inspection de meta.profile.

### 9 — ANALYSE DU CAPABILITYSTATEMENT

Si le CapabilityStatement est fourni, analyse-le.

Identifier au minimum :

- fhirVersion ;

- formats supportés ;

- ressources exposées ;

- interactions read/search-type ;

- paramètres de recherche déclarés ;

- support éventuel de _include ;

- éventuelles contraintes ou profils déclarés.

Construis un tableau :

| Besoin du prototype | Capacité requise |

| Déclarée par le serveur ? | Conséquence |

Si le CapabilityStatement n'est pas fourni, produire ce même tableau avec

« À vérifier sur le serveur ».

Ne confonds pas :

« autorisé par la spécification FHIR »

et

« effectivement supporté par ce serveur ».

### 10 — SEARCH PARAMETERS

Vérifie chaque paramètre de recherche envisagé.

Pour chaque recherche :

- nom du SearchParameter ;

- ressource concernée ;

- type du paramètre ;

- signification ;

- support standard dans la version ;

- support serveur à vérifier.

Étudier notamment :

- recherche Patient ;

- recherche par identifiant ;

- recherche des Appointment associés à un patient ;

- recherche par date si nécessaire ;

- _include éventuel.

Ne construis pas d'URL définitive tant que le support serveur n'est pas confirmé.

### 11 — GESTION DES BUNDLE ET DE LA PAGINATION

Vérifie que la spécification traite correctement :

- Bundle de type searchset ;

- zéro entrée ;

- une entrée ;

- plusieurs entrées ;

- ressources incluses via _include ;

- liens Bundle.link ;

- pagination ;

- ressources référencées non incluses.

Préciser la différence entre :

- « aucun résultat » ;

- « requête en erreur ».

### 12 — OPERATIONOUTCOME ET ERREURS FHIR

Définis les comportements à prévoir face à :

- réponse HTTP réussie sans résultat ;

- erreur HTTP ;

- OperationOutcome ;

- ressource inattendue ;

- référence cassée ;

- données non conformes au contrat local.

Ne définis pas ici les détails d'interface graphique.

### 13 — VALIDATION MULTINIVEAUX

Construis une stratégie distinguant explicitement :

#### Niveau 1 — transport / syntaxe

Exemples :

- JSON/XML bien formé ;

- réponse HTTP exploitable.

#### Niveau 2 — structure FHIR

Exemples :

- resourceType ;

- type des éléments ;

- cardinalités ;

- références ;

- respect du profil éventuel.

#### Niveau 3 — sémantique

Exemples :

- codes valides ;

- système de codage ;

- signification correcte des éléments ;

- cohérence entre début et fin ;

- participant interprété selon son type.

#### Niveau 4 — contraintes locales du prototype

Exemples :

- informations minimales nécessaires à l'affichage ;

- données minimales nécessaires au futur mapping.

Ne mélange pas contrainte FHIR et contrainte locale.

### 14 — LISTE DES POINTS NON RÉSOLUS

À la fin, produire uniquement les décisions qui restent réellement ouvertes.

Classer :

A. à vérifier sur le serveur ;

B. à décider par le groupe ;

C. à transmettre au membre architecture / HL7 v2.

Pour chaque point :

- question ;

- responsable ;

- conséquence si non résolu.

### SOURCES

Utilise prioritairement :

1. spécification officielle HL7 FHIR de la version retenue ;

2. CapabilityStatement du serveur ;

3. IG officiels réellement concernés ;

4. supports de cours.

Pour chaque affirmation normative importante, fournir la référence officielle

ou indiquer clairement :

« À vérifier dans la spécification / sur le serveur ».

### CONTRÔLE QUALITÉ FINAL

Avant de répondre, vérifie silencieusement :

1. Ai-je confirmé chaque élément FHIR dans la bonne version ?

2. Ai-je séparé standard et contraintes locales ?

3. Ai-je distingué possibilité FHIR et capacité réelle du serveur ?

4. Ai-je évité les ressources inutiles ?

5. Ai-je contrôlé les références d'Appointment ?

6. Ai-je contrôlé les bindings ?

7. Ai-je traité les codes locaux ?

8. Ai-je traité la pagination ?

9. Ai-je distingué absence de résultat et erreur ?

10. Ai-je identifié ce qui reste réellement à vérifier ?

Corrige le résultat avant de le restituer si l'une de ces vérifications échoue.

### FORMAT DE SORTIE

Retourne :

1. Version FHIR vérifiée

2. Modèle informationnel révisé

3. Ressources retenues / rejetées

4. Contrat détaillé des éléments FHIR

5. Analyse Appointment

6. Graphe des références

7. Terminologies et bindings

8. Profils / extensions / IG

9. Capacités serveur

10. Search Parameters

11. Bundle / pagination / références

12. Gestion des erreurs FHIR

13. Stratégie de validation

14. Points restant à résoudre
///////////////////////////

---

## Réponse obtenue — Prompt 2

### 1. Version FHIR vérifiée

La version à retenir pour ce projet est désormais **HL7 FHIR R4, version 4.0.1**.

Cette décision n’est plus une simple recommandation : le serveur pédagogique retenu est le serveur public HAPI FHIR `baseR4`, et sa documentation publique annonce explicitement **FHIR Version 4.0.1 (R4)**.

**Statut : CONFIRMÉ PAR LE SERVEUR.**

Le serveur expose également l’opération système `GET /metadata`, destinée à retourner son `CapabilityStatement`.

Dans FHIR R4, `CapabilityStatement.fhirVersion` est un élément obligatoire et permet précisément d’identifier la version FHIR supportée par l’implémentation.

La version doit être figée avant développement, car un changement entre R4, R4B ou R5 peut modifier :

- la structure des ressources ;
- les éléments disponibles ;
- les types et cardinalités ;
- certains SearchParameters ;
- les bindings terminologiques ;
- les règles de transformation ultérieures vers HL7 v2.

Pour le reste du cahier des charges, la référence normative sera donc :

> **HL7 FHIR R4 4.0.1**

Le serveur utilisé étant un serveur public de test/démonstration, aucune donnée réelle, nominative ou sensible ne devra y être créée ou stockée. Cette contrainte est explicitement fournie dans le contexte du projet.

---

### 2. Modèle informationnel

Le modèle informationnel doit rester strictement aligné avec le besoin fonctionnel : identifier un patient, retrouver ses rendez-vous, présenter leurs informations essentielles et enrichir l’affichage lorsque des informations supplémentaires existent.

| Concept métier | Besoin fonctionnel associé | Nécessaire au MVP ? | Ressource FHIR candidate | Justification |
| ----- | ----- | ----- | ----- | ----- |
| Patient | Identifier la personne dont le calendrier est consulté | Oui | `Patient` | Ressource administrative de référence pour l’identité du patient |
| Rendez-vous | Représenter une activité planifiée | Oui | `Appointment` | Ressource centrale du cas d’usage |
| Identifiant patient | Éviter les confusions entre patients | Oui au niveau applicatif si disponible | `Patient.identifier` | Identifiant métier distinct de l’id technique FHIR |
| Nom / identité | Confirmer le contexte patient | Oui au niveau applicatif | `Patient.name` | Utilisé pour la confirmation utilisateur |
| Date de naissance | Aider à différencier des patients | Conditionnel | `Patient.birthDate` | Donnée d’identité secondaire |
| Statut du rendez-vous | Connaître l’état du rendez-vous | Oui | `Appointment.status` | Élément obligatoire dans FHIR R4 |
| Début / fin | Situer le rendez-vous dans le temps | Oui pour les rendez-vous planifiés du MVP | `Appointment.start`, `Appointment.end` | Informations temporelles centrales |
| Durée | Compléter les informations temporelles | Facultatif | `Appointment.minutesDuration` | Peut fournir une durée indicative |
| Type / description / motif | Comprendre la nature du rendez-vous | Facultatif | Plusieurs éléments d’`Appointment` | Concepts distincts à ne pas fusionner |
| Patient participant | Rattacher le rendez-vous au bon patient | Oui | `Appointment.participant.actor` | En R4, le patient passe par les participants |
| Professionnel | Identifier l’intervenant | Conditionnel | `Practitioner` | Participant possible |
| Rôle professionnel | Contextualiser le professionnel | Conditionnel | `PractitionerRole` | Utile si le rendez-vous pointe vers un rôle plutôt qu’une personne |
| Lieu | Orienter le patient/utilisateur | Conditionnel | `Location` | Participant possible |
| Service de santé | Identifier un service participant | Conditionnel | `HealthcareService` | Participant possible |
| Organisation | Contextualiser rôle ou service | Optionnel | `Organization` | Pas nécessaire directement au MVP |
| Disponibilités / créneaux | Chercher des horaires disponibles | Non | `Schedule`, `Slot` | Hors périmètre : le MVP consulte des rendez-vous existants |

La spécification R4 présente `Schedule` et `Slot` dans le workflow de recherche de disponibilité, cette étape étant explicitement facultative pour la prise de rendez-vous. Notre prototype ne réalisant pas de réservation, ces ressources ne sont pas nécessaires au MVP.

---

### 3. Ressources

#### 3.1 Ressources cœur

##### `Patient`

**Statut : ressource obligatoire pour le MVP.**

Elle sert à identifier et présenter le patient.

Éléments principaux envisagés :

- `Patient.id` ;
- `Patient.identifier` ;
- `Patient.name` ;
- `Patient.birthDate` ;
- éventuellement `Patient.gender`.

`Patient.identifier` possède une cardinalité standard `0..*` en FHIR R4 : sa présence ne peut donc pas être considérée comme une obligation FHIR.

Si le groupe exige un identifiant métier pour sécuriser la sélection, cela constituera une **contrainte locale du projet**, et non une règle FHIR.

##### `Appointment`

**Statut : ressource centrale obligatoire.**

FHIR R4 définit `Appointment` comme la réservation d’un événement de santé impliquant notamment patient(s), professionnel(s), personnes associées ou dispositifs pour une période déterminée.

---

#### 3.2 Ressources référencées conditionnelles

##### `Practitioner`

**Retenue, conditionnelle.**

Elle est utilisée si `Appointment.participant.actor` référence directement un professionnel.

##### `PractitionerRole`

**Retenue, conditionnelle.**

Elle doit être prise en compte car `Appointment.participant.actor` peut référencer un `PractitionerRole`, pas seulement un `Practitioner`.

Elle devient particulièrement utile lorsque le contexte professionnel doit être connu : rôle, spécialité, organisation, lieu ou service.

##### `Location`

**Retenue, conditionnelle.**

FHIR R4 précise que le lieu d’un rendez-vous est représenté par un participant référençant `Location` ou `HealthcareService`.

##### `HealthcareService`

**Retenue, conditionnelle.**

Elle peut représenter un service participant ou contribuer à la localisation fonctionnelle du rendez-vous.

##### `Organization`

**Optionnelle.**

Elle n’est pas requise pour afficher directement un rendez-vous mais peut devenir nécessaire si un `PractitionerRole` ou un `HealthcareService` doit être contextualisé.

---

#### 3.3 Ressources rejetées du MVP

##### `Schedule`

**Non retenue pour le MVP.**

Elle intervient principalement dans la gestion des calendriers de disponibilité.

##### `Slot`

**Non retenue pour le MVP.**

Elle représente des créneaux disponibles ou réservés. Le prototype ne recherche pas de créneaux et ne crée pas de réservation.

Le serveur HAPI expose bien actuellement des ressources `Schedule` et `Slot`, mais leur existence sur le serveur ne justifie pas leur utilisation dans le projet.

C’est un principe important :

> **ressource exposée par le serveur ≠ ressource nécessaire au cas d’usage.**

---

### 4. Contrat détaillé des éléments FHIR

| Donnée métier | Ressource | Élément FHIR | Type FHIR | Cardinalité R4 | Direct / référence | Usage prototype | Statut |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Identifiant technique patient | Patient | `id` | `id` | héritée de Resource | Direct | Suivi interne | Confirmé |
| Identifiant métier patient | Patient | `identifier` | `Identifier` | `0..*` | Direct | Identification | Confirmé |
| Nom patient | Patient | `name` | `HumanName` | `0..*` | Direct | Affichage / confirmation | Confirmé |
| Date naissance | Patient | `birthDate` | `date` | `0..1` | Direct | Désambiguïsation | Confirmé |
| Genre administratif | Patient | `gender` | `code` | `0..1` | Direct | Facultatif | Confirmé |
| Identifiant métier RDV | Appointment | `identifier` | `Identifier` | `0..*` | Direct | Identification externe | Confirmé |
| Statut RDV | Appointment | `status` | `code` | `1..1` | Direct | Affichage / traitement | Confirmé |
| Catégorie service | Appointment | `serviceCategory` | `CodeableConcept` | `0..*` | Direct | Facultatif | Confirmé |
| Type service | Appointment | `serviceType` | `CodeableConcept` | `0..*` | Direct | Facultatif | Confirmé |
| Spécialité | Appointment | `specialty` | `CodeableConcept` | `0..*` | Direct | Facultatif | Confirmé |
| Type RDV | Appointment | `appointmentType` | `CodeableConcept` | `0..1` | Direct | Facultatif | Confirmé |
| Motif codé | Appointment | `reasonCode` | `CodeableConcept` | `0..*` | Direct | Facultatif | Confirmé |
| Description | Appointment | `description` | `string` | `0..1` | Direct | Affichage | Confirmé |
| Début | Appointment | `start` | `instant` | `0..1` | Direct | Temps | Confirmé |
| Fin | Appointment | `end` | `instant` | `0..1` | Direct | Temps | Confirmé |
| Durée | Appointment | `minutesDuration` | `positiveInt` | `0..1` | Direct | Facultatif | Confirmé |
| Participants | Appointment | `participant` | `BackboneElement` | `1..*` | Direct | Relations métier | Confirmé |
| Type participant | Appointment | `participant.type` | `CodeableConcept` | `0..*` | Direct | Rôle | Confirmé |
| Acteur participant | Appointment | `participant.actor` | `Reference` | `0..1` | Référence | Patient/professionnel/lieu/service | Confirmé |
| Participation obligatoire | Appointment | `participant.required` | `code` | `0..1` | Direct | Facultatif | Confirmé |
| Statut participant | Appointment | `participant.status` | `code` | `1..1` | Direct | Sémantique participant | Confirmé |

La structure officielle confirme notamment `Appointment.status 1..1`, `participant 1..*`, `participant.actor 0..1` et `participant.status 1..1`.

Une contrainte importante s’applique au participant : au moins `type` ou `actor` doit être présent.

---

### 5. Analyse Appointment

#### 5.1 Informations directement portées par Appointment

| Information | Directe ? | Élément | MVP ? | Commentaire |
| ----- | ----- | ----- | ----- | ----- |
| Identifiant externe | Oui | `identifier` | Recommandé | `0..*` |
| Statut | Oui | `status` | Oui | Obligatoire FHIR |
| Début | Oui | `start` | Oui pour rendez-vous planifié | `0..1` |
| Fin | Oui | `end` | Oui pour rendez-vous planifié | `0..1` |
| Durée | Oui | `minutesDuration` | Non | Ne remplace pas nécessairement start/end |
| Description | Oui | `description` | Non | Texte libre |
| Type RDV | Oui | `appointmentType` | Non | Ne pas confondre avec serviceType |
| Type service | Oui | `serviceType` | Non | Service à réaliser |
| Spécialité | Oui | `specialty` | Non | Spécialité requise |
| Motif | Oui | `reasonCode` | Non | Raison codée |
| Participants | Oui | `participant` | Oui | Structure obligatoire |

FHIR précise explicitement que `appointmentType` décrit le style/type du rendez-vous et **pas** le type de service.

#### 5.2 Patient

Le modèle R4 n’utilise pas un élément direct `Appointment.patient`.

Le patient est identifié dans :

Appointment.participant.actor

→ Reference(Patient)

Le SearchParameter standard `patient` repose d’ailleurs sur ce même chemin.

**Contrainte locale du projet :** un Appointment consommé dans le scénario patient devra être rattachable explicitement au patient actuellement sélectionné.

#### 5.3 Professionnel

Deux représentations principales sont possibles :

Appointment.participant.actor

→ Practitioner

ou :

Appointment.participant.actor

→ PractitionerRole

Il serait donc incorrect d’écrire :

participant = médecin

Un participant peut également être un Patient, RelatedPerson, Device, HealthcareService ou Location.

#### 5.4 Lieu

Le lieu doit être interprété à partir d’un participant dont `actor` référence :

Location

ou, selon le contexte :

HealthcareService

FHIR décrit explicitement ce mécanisme pour les lieux de rendez-vous.

#### 5.5 Dates

FHIR R4 impose :

start existe ⇔ end existe

et précise que seuls les rendez-vous `proposed` ou `cancelled` peuvent être dépourvus de début et de fin.

La future validation devra donc tenir compte du statut et ne pas imposer aveuglément `start/end` à tous les Appointment.

---

### 6. Graphe des références

Le modèle utile au MVP peut être résumé ainsi :

Patient

▲

│ Appointment.participant.actor

│

Appointment

│

├── participant.actor → Patient

│

├── participant.actor → Practitioner

│

├── participant.actor → PractitionerRole

│                         │

│                         ├── practitioner → Practitioner

│                         ├── organization → Organization

│                         ├── location → Location

│                         └── healthcareService → HealthcareService

│

├── participant.actor → Location

│

└── participant.actor → HealthcareService

Les cibles autorisées officiellement pour `Appointment.participant.actor` en R4 sont :

- Patient ;
- Practitioner ;
- PractitionerRole ;
- RelatedPerson ;
- Device ;
- HealthcareService ;
- Location.

Pour notre prototype :

| Type cible | Support MVP | Comportement |
| ----- | ----- | ----- |
| Patient | Obligatoire | Utilisé pour rattacher le RDV |
| Practitioner | Oui | Résoudre si disponible |
| PractitionerRole | Oui | Résoudre le rôle puis éventuellement Practitioner |
| Location | Oui | Résoudre pour affichage |
| HealthcareService | Oui | Résoudre si présent |
| RelatedPerson | Non nécessaire au MVP | Conserver référence, warning éventuel |
| Device | Non nécessaire au MVP | Ne pas interpréter comme professionnel |
| Autre type | Non valide pour ce champ en R4 | Erreur de conformité |

Si une référence conditionnelle ne peut pas être résolue, le rendez-vous reste affichable si l’information n’est pas indispensable au scénario.

---

### 7. Terminologies et bindings

| Élément | Type | Binding R4 | Force | Conservation | Risque |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `Appointment.status` | `code` | AppointmentStatus | Required | valeur du code | Valeur hors ValueSet invalide |
| `Appointment.serviceCategory` | `CodeableConcept` | Service Category | Example | tous les Coding utiles | Codes locaux fréquents |
| `Appointment.serviceType` | `CodeableConcept` | Service Type | Example | `system`, `code`, `display` | Ne pas imposer une terminologie absente |
| `Appointment.specialty` | `CodeableConcept` | Practice Setting | Preferred | Codings complets | Code externe/local possible |
| `Appointment.appointmentType` | `CodeableConcept` | v2 Appointment Reason Codes | Preferred | Codings complets | Ne pas confondre avec serviceType |
| `Appointment.reasonCode` | `CodeableConcept` | Encounter Reason Codes | Preferred | Codings complets | Plusieurs codages possibles |
| `Appointment.participant.type` | `CodeableConcept` | Participant Type | Extensible | Codings complets | Extensions de terminologie possibles |
| `Appointment.participant.required` | `code` | ParticipantRequired | Required | code | Valeur non standard invalide |
| `Appointment.participant.status` | `code` | ParticipationStatus | Required | code | Sémantique différente du statut global |
| `Patient.gender` | `code` | AdministrativeGender | Required si présent | code | Ne pas l’interpréter comme donnée clinique de sexe |

Ces forces de binding sont définies dans la structure normative R4 d’Appointment.

#### Règles sémantiques du projet

Pour tout `Coding`, conserver séparément :

system

code

display

La règle générale est :

> **`system + code` identifie le concept ; `display` sert principalement à sa présentation humaine.**

##### Code standard

Conserver le système, le code et le display reçus.

##### Code local

Un code local est accepté si son système est clairement indiqué. Il ne doit pas être transformé automatiquement en SNOMED CT, LOINC ou autre terminologie.

##### `system` absent

Le concept ne peut pas être considéré comme globalement identifié. Le code peut être conservé mais doit être traité avec prudence.

##### `code` absent

Un simple `display` peut servir à l’affichage, mais pas comme identifiant sémantique fiable.

##### `display` absent

Le code reste exploitable s’il possède un `system` et un `code`. Le texte humain pourra éventuellement être récupéré via un service terminologique ultérieur, mais ce n’est pas requis pour le MVP.

##### Plusieurs `Coding`

Ils doivent être conservés. Le prototype ne doit pas supposer que `coding[0]` est toujours le « meilleur » ou le plus standard.

---

### 8. Profils / extensions / Implementation Guides

Aucun profil métier ou national supplémentaire n’est imposé par les informations actuellement fournies.

Le contrat de base est donc :

> **ressources FHIR R4 de base.**

Les concepts doivent être distingués ainsi :

FHIR de base

≠ profil

≠ extension

≠ Implementation Guide

≠ terminologie

#### Profils

Le prototype devra inspecter :

Resource.meta.profile

lorsqu’il est présent.

Mais la présence d’un profil dans une ressource ne permet pas, à elle seule, de conclure que toutes les ressources du serveur doivent respecter ce profil.

#### Extensions

Les extensions inconnues ne doivent pas provoquer automatiquement le rejet d’une ressource.

La couche de normalisation devra :

- utiliser les extensions explicitement comprises si le projet en adopte ;
- conserver ou ignorer proprement les extensions inconnues ;
- ne pas leur attribuer de sens inventé.

#### Implementation Guides

Aucun IG français ou européen n’est retenu comme obligatoire.

Une éventuelle adoption ultérieure devra être justifiée par :

- l’énoncé ;
- le serveur ;
- ou une décision explicite du groupe.

Il serait incorrect de déclarer arbitrairement la conformité du prototype à un IG simplement parce qu’il existe.

---

### 9. Capacités serveur

Le serveur utilisé est :

https://hapi.fhir.org/baseR4

Sa documentation publique confirme actuellement :

- FHIR 4.0.1 R4 ;
- présence de `Patient` ;
- présence de `Appointment` ;
- présence de `Practitioner` ;
- présence de `PractitionerRole` ;
- présence de `Location` ;
- présence de `HealthcareService` ;
- présence de `Organization` ;
- présence également de `Schedule` et `Slot`.

Le serveur expose également des opérations `read` et `search-type` pour les ressources telles que Patient et Appointment.

| Besoin | Capacité nécessaire | État |
| ----- | ----- | ----- |
| Déterminer version | `/metadata` | Confirmé |
| Lire Patient | `read` Patient | Confirmé |
| Rechercher Patient | `search-type` Patient | Confirmé |
| Lire Appointment | `read` Appointment | Confirmé |
| Rechercher Appointment | `search-type` Appointment | Confirmé |
| Résoudre Practitioner | ressource disponible + read | Ressource confirmée ; interaction à vérifier dans metadata si contractualisée |
| Résoudre PractitionerRole | idem | Ressource confirmée |
| Résoudre Location | idem | Ressource confirmée |
| Résoudre HealthcareService | idem | Ressource confirmée |
| Recherche Appointment par patient | SearchParameter `patient` | Standard R4 ; support HAPI à confirmer par CapabilityStatement/test |
| `_include=Appointment:patient` | support `_include` | Le testeur HAPI l’annonce comme option d’include |
| Pagination | Bundle.link `next` | Standard FHIR ; comportement à tester |

Le testeur public HAPI expose notamment les includes `Appointment:actor`, `Appointment:location`, `Appointment:patient`, `Appointment:practitioner` et d’autres.

Cependant, pour la version finale contractualisée, la source de vérité reste :

CapabilityStatement.rest.resource.searchParam

CapabilityStatement.rest.resource.searchInclude

FHIR R4 prévoit précisément ces éléments pour déclarer les SearchParameters et les valeurs `_include` supportées.

---

### 10. Search Parameters

#### Recherche Patient

Les besoins minimaux sont :

- recherche par identifiant ;
- éventuellement recherche par nom.

`Patient.identifier` existe bien comme donnée FHIR. Le support effectif du SearchParameter correspondant doit être contrôlé dans les capacités du serveur avant implémentation définitive.

**Choix du projet :**

1. préférer un identifiant lorsque disponible ;
2. utiliser la recherche nominative uniquement comme mécanisme utilisateur complémentaire ;
3. ne jamais sélectionner automatiquement un patient en cas de résultats multiples.

#### Recherche Appointment

FHIR R4 définit officiellement les SearchParameters suivants utiles au projet :

| Paramètre | Type | Signification |
| ----- | ----- | ----- |
| `patient` | reference | Appointment ayant ce Patient parmi ses participants |
| `date` | date | Date/heure du rendez-vous |
| `identifier` | token | Identifiant d’Appointment |
| `location` | reference | Location présente dans les participants |
| `practitioner` | reference | Practitioner parmi les participants |
| `actor` | reference | N’importe quel acteur participant |
| `part-status` | token | Statut d’un participant |

Les définitions R4 montrent notamment que `patient` cible `Appointment.participant.actor` résolu en `Patient`, et que `date` cible `Appointment.start`.

##### Paramètre central du MVP

Appointment?patient=...

constitue le moyen standard pour rechercher les rendez-vous associés au patient.

**Support standard : confirmé.**

**Support serveur : à confirmer formellement dans le CapabilityStatement / test d’intégration**, même si le serveur HAPI expose la ressource Appointment et les includes associés.

#### `_include`

`_include` sera traité comme une optimisation.

Exemples potentiellement utiles :

Appointment:patient

Appointment:practitioner

Appointment:location

Appointment:actor

Le testeur HAPI annonce actuellement ces includes.

Si `_include` n’est pas utilisé ou échoue, la stratégie de repli consiste à résoudre les références individuellement.

---

### 11. Bundle / pagination / références

#### Recherche

Une opération de recherche retourne un `Bundle` de type recherche.

La couche FHIR doit gérer :

- zéro entrée ;
- une entrée ;
- plusieurs entrées ;
- entrées de type `match` ;
- ressources supplémentaires incluses par `_include`.

#### Zéro résultat

Il faut distinguer :

> recherche réussie avec zéro résultat

de :

> requête en erreur.

Pour le cas :

patient connu

+

0 Appointment

le résultat métier est :

> **aucun rendez-vous disponible**

et non une erreur technique.

#### Pagination

La couche FHIR ne doit pas considérer la première page comme l’ensemble complet des résultats.

Elle devra examiner :

Bundle.link

notamment la relation :

next

lorsqu’elle est présente.

#### Références non incluses

Si une référence n’est pas présente dans le Bundle :

1. vérifier si elle est nécessaire ;
2. si nécessaire et locale/résoluble, effectuer une lecture ;
3. si elle est facultative et non résoluble, conserver le rendez-vous avec warning ;
4. ne jamais fabriquer la ressource manquante.

---

### 12. Gestion des erreurs FHIR

| Situation | Interprétation | Comportement couche FHIR |
| ----- | ----- | ----- |
| HTTP 2xx + Bundle sans entrée | Recherche valide sans résultat | Retourner collection vide |
| HTTP 2xx + ressource valide | Succès | Valider puis normaliser |
| HTTP 4xx | Requête invalide / non autorisée / ressource absente selon code | Retour erreur structurée |
| HTTP 5xx | Erreur serveur | Signaler indisponibilité |
| `OperationOutcome` | Information structurée FHIR d’erreur/warning | Lire `issue.severity`, `issue.code`, `diagnostics` si présents |
| Mauvais `resourceType` | Réponse inattendue | Bloquer le traitement correspondant |
| Référence facultative cassée | Donnée partielle | Warning ; poursuivre |
| Référence Patient indispensable non résolue | Perte du contexte métier | Bloquant pour ce rendez-vous |
| Code local inconnu mais correctement identifié | Donnée sémantique non normalisée | Conserver, warning éventuel |
| Donnée facultative absente | Situation valide | Continuer |

---

### 13. Stratégie de validation

La validation est organisée en quatre niveaux.

#### Niveau 1 — Transport / syntaxe

Vérifications :

- statut HTTP ;
- type de contenu ;
- JSON/XML lisible ;
- corps de réponse exploitable.

Une réponse illisible est bloquante.

#### Niveau 2 — Structure FHIR

Contrôles :

- `resourceType` attendu ;
- éléments conformes aux types R4 ;
- cardinalités ;
- invariants ;
- références autorisées ;
- profil éventuel.

Pour Appointment, contrôler notamment :

status 1..1

participant 1..*

participant.status 1..1

start et end ensemble

participant.type ou participant.actor présent

Ces contraintes proviennent de la définition R4 officielle.

#### Niveau 3 — Validation sémantique

Contrôles :

- valeurs de bindings Required ;
- conservation `system`, `code`, `display` ;
- interprétation correcte des CodeableConcept ;
- non-confusion `appointmentType` / `serviceType` / `specialty` ;
- type réel de chaque participant ;
- cohérence chronologique `start <= end` ;
- cohérence entre statut et présence des dates.

#### Niveau 4 — Contraintes locales du prototype

Ces contraintes ne viennent pas nécessairement de FHIR.

Elles comprennent :

- Appointment rattachable au patient sélectionné ;
- patient identifiable pour la présentation utilisateur ;
- informations suffisantes pour afficher un rendez-vous planifié ;
- conservation des informations nécessaires au futur mapping ;
- données conditionnelles manquantes non bloquantes.

#### Politique de sévérité

##### Bloquant

- ressource non FHIR exploitable ;
- mauvais type de ressource ;
- violation d’une cardinalité obligatoire pertinente ;
- `Appointment.status` absent ;
- aucun participant dans Appointment ;
- absence des informations permettant de rattacher le rendez-vous au patient du scénario ;
- incohérence temporelle structurelle.

##### Warning

- professionnel absent ;
- lieu absent ;
- service absent ;
- référence conditionnelle non résolue ;
- code local inconnu mais porteur d’un `system` et d’un `code`.

##### Information

- description absente ;
- display absent ;
- autre donnée facultative non fournie.
