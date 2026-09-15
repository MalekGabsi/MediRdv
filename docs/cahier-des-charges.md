CAHIER DES CHARGES — PROTOTYPE D’INTEROPÉRABILITÉ EN SANTÉ
Sujet : Rendez-vous / calendrier d’un patient
Source : HL7 FHIR R4 — Cible : HL7 v2

0. Présentation générale du projet
Le projet consiste à concevoir puis développer un prototype permettant à un utilisateur habilité de consulter les rendez-vous associés à un patient à partir d’un serveur FHIR, puis de représenter un rendez-vous sélectionné sous la forme d’un message HL7 v2.
Le prototype doit démontrer un parcours complet d’interopérabilité :
Données source FHIR
        ↓
Identification du patient
        ↓
Consultation de ses rendez-vous
        ↓
Sélection d’un rendez-vous
        ↓
Normalisation des informations
        ↓
Transformation
        ↓
Représentation HL7 v2
Le cahier des charges est structuré en trois parties correspondant à la répartition du travail au sein du groupe :
Cadrage métier et fonctionnel ;
Spécification FHIR et modèle informationnel ;
Architecture d’intégration et transformation FHIR → HL7 v2.
La règle commune au projet est la suivante :
Toute information produite par le prototype doit pouvoir être reliée à une donnée source ou à une règle de transformation explicitement définie. Une information absente ne doit jamais être inventée.

PARTIE 1 — CADRAGE MÉTIER ET FONCTIONNEL
1. Contexte et problématique
Dans un système d’information de santé, les informations relatives aux rendez-vous peuvent être produites par un système d’agenda, un logiciel métier, un outil de planification ou un autre composant du SI.
Le besoin ne consiste donc pas uniquement à afficher un calendrier. Il consiste à permettre à un utilisateur autorisé de :
retrouver le bon patient ;
consulter les rendez-vous qui lui sont associés ;
comprendre les informations principales du rendez-vous ;
identifier les éventuelles données absentes ;
disposer d’une représentation suffisamment structurée pour permettre ensuite un échange avec un système utilisant un autre standard.
Une information de rendez-vous erronée, absente ou obsolète peut notamment provoquer :
une mauvaise orientation du patient ;
un rendez-vous manqué ;
une mauvaise préparation de l’activité ;
une confusion entre patients ou rendez-vous ;
une perte de temps organisationnelle.
Le prototype doit donc privilégier la fidélité aux informations disponibles plutôt que leur reconstruction.

2. Objectifs et périmètre
2.1 Objectif général
Permettre à un utilisateur habilité de retrouver un patient, consulter ses rendez-vous et afficher le détail d’un rendez-vous à partir de données obtenues sur un serveur FHIR.
Le rendez-vous sélectionné devra ensuite pouvoir alimenter la représentation HL7 v2 définie dans la partie 3.
2.2 Objectifs fonctionnels
Le prototype doit permettre de :
rechercher ou sélectionner un patient ;
confirmer le contexte du patient ;
récupérer ses rendez-vous ;
afficher une vue synthétique des rendez-vous ;
distinguer les rendez-vous entre eux ;
sélectionner un rendez-vous ;
consulter son détail ;
afficher les informations temporelles disponibles ;
afficher le statut lorsqu’il est disponible ;
afficher professionnel, service et lieu lorsqu’ils existent ;
distinguer une donnée absente d’une donnée connue ;
gérer les cas d’absence de résultat ;
signaler une indisponibilité technique ;
produire une représentation HL7 v2 du rendez-vous sélectionné.
2.3 MVP
Le périmètre minimal comprend :
consultation d’un patient ;
récupération de ses rendez-vous ;
affichage synthétique ;
consultation détaillée ;
gestion des données partielles ;
conversion d’un rendez-vous vers le format cible.
2.4 Hors périmètre
Ne sont pas nécessaires au MVP :
création de rendez-vous ;
modification ;
annulation directement dans FHIR ;
recherche de créneaux libres ;
gestion complète d’un agenda professionnel ;
détection des conflits ;
rappels SMS/e-mail ;
facturation ;
gestion du dossier clinique ;
synchronisation bidirectionnelle entre plusieurs agendas.
La consultation seule est cohérente avec le périmètre fonctionnel déjà retenu.

3. Acteurs
Catégorie
Acteur
Rôle
Acteur humain principal
Utilisateur habilité du SI de santé
Recherche un patient et consulte ses rendez-vous
Acteur système externe
Serveur / système source FHIR
Fournit les données Patient, Appointment et ressources associées
Entité métier
Patient
Personne concernée par les rendez-vous
Composant cible
Moteur / représentation HL7 v2
Reçoit les informations normalisées et produit le message cible

Hypothèse : l’utilisateur dispose des droits nécessaires pour consulter les données.

4. Dictionnaire fonctionnel des données
Information métier
Finalité
MVP
Identité patient
Vérifier le contexte patient
Oui
Identifiant patient
Différencier les patients
Oui si disponible
Date du rendez-vous
Positionner le rendez-vous dans le temps
Oui
Heure / plage horaire
Organisation temporelle
Oui si disponible
Statut
Connaître l’état du rendez-vous
Oui lorsqu’il est fourni
Libellé / type / motif
Comprendre la nature du rendez-vous
Conditionnel
Professionnel
Identifier l’intervenant
Conditionnel
Service
Comprendre le contexte organisationnel
Conditionnel
Lieu
Orienter l’utilisateur
Conditionnel
Identifiant du rendez-vous
Distinguer et tracer la transformation
Recommandé


5. Scénario nominal
SN-01 — Accès
 L’utilisateur ouvre le prototype.
SN-02 — Recherche patient
 L’utilisateur saisit ou sélectionne les informations permettant d’identifier le patient.
SN-03 — Confirmation
 Le prototype présente les éléments permettant de confirmer le contexte patient.
SN-04 — Sélection
 L’utilisateur confirme le patient.
SN-05 — Recherche des rendez-vous
 Le prototype récupère les rendez-vous associés.
SN-06 — Vue synthétique
 Le prototype présente les rendez-vous disponibles.
SN-07 — Informations principales
 Pour chaque rendez-vous, les informations temporelles et le statut disponibles sont présentés.
SN-08 — Informations complémentaires
 Professionnel, service, lieu et description sont présentés lorsqu’ils sont disponibles.
SN-09 — Sélection du rendez-vous
 L’utilisateur choisit un rendez-vous.
SN-10 — Détail
 Le prototype affiche son détail.
SN-11 — Contexte patient
 Le patient concerné reste identifiable.
SN-12 — Transformation
 L’utilisateur peut demander la représentation HL7 v2 du rendez-vous sélectionné.

6. Scénarios alternatifs
ID
Situation
Comportement
SA-01
Patient introuvable
Informer l’utilisateur ; aucun choix automatique
SA-02
Plusieurs patients
Présenter les candidats ; choix explicite
SA-03
Aucun rendez-vous
Afficher « aucun rendez-vous » ; ce n’est pas une erreur
SA-04
Donnée facultative absente
Afficher les autres données ; ne rien inventer
SA-05
Professionnel absent
Rendez-vous consultable avec mention « non renseigné »
SA-06
Lieu absent
Rendez-vous consultable
SA-07
Rendez-vous incomplet
Affichage partiel possible ; warning
SA-08
Source indisponible
Message compréhensible et possibilité de réessayer
SA-09
Transformation impossible
Ne pas générer de faux message HL7 ; expliquer la cause


7. Exigences fonctionnelles
EF-01 — Patient — MUST : permettre la sélection explicite d’un patient.
EF-02 — Contexte patient — MUST : maintenir les éléments permettant d’identifier le patient sélectionné.
EF-03 — Patient absent — MUST : informer l’utilisateur lorsqu’aucun patient n’est trouvé.
EF-04 — Ambiguïté patient — MUST : laisser l’utilisateur choisir lorsqu’il existe plusieurs résultats.
EF-05 — Rendez-vous — MUST : récupérer les rendez-vous associés au patient sélectionné.
EF-06 — Aucun rendez-vous — MUST : distinguer ce cas d’une erreur technique.
EF-07 — Vue synthétique — MUST : permettre de distinguer les rendez-vous.
EF-08 — Informations temporelles — MUST : afficher les informations temporelles disponibles.
EF-09 — Statut — MUST : afficher le statut lorsqu’il existe.
EF-10 — Sélection — MUST : permettre la sélection d’un rendez-vous.
EF-11 — Détail — MUST : présenter le détail du rendez-vous sélectionné.
EF-12 — Informations complémentaires — MUST : présenter les informations conditionnelles disponibles.
EF-13 — Absence de données — MUST : ne jamais créer de valeur métier fictive.
EF-14 — Données partielles — MUST : une donnée facultative absente ne doit pas bloquer tout le parcours.
EF-15 — Indisponibilité — MUST : présenter une erreur fonctionnelle compréhensible.
EF-16 — Transformation — MUST : permettre de générer la représentation HL7 v2 lorsqu’un rendez-vous dispose des informations minimales requises.
EF-17 — Échec de transformation — MUST : refuser une transformation lorsque les données obligatoires sont insuffisantes.

8. Exigences non fonctionnelles
ENF-01 — Lisibilité : l’utilisateur doit pouvoir identifier facilement patient et rendez-vous.
ENF-02 — Confidentialité : seules les données nécessaires doivent être manipulées.
ENF-03 — Robustesse : une donnée facultative absente ne doit pas provoquer l’arrêt complet du prototype.
ENF-04 — Gestion des erreurs : aucune erreur technique brute ne doit constituer l’unique retour utilisateur.
ENF-05 — Traçabilité : les opérations techniques importantes doivent pouvoir être expliquées.
ENF-06 — Réactivité : le fonctionnement doit rester compatible avec une démonstration interactive.
ENF-07 — Fidélité : aucune transformation ne doit modifier silencieusement le sens d’une donnée.

9. Critères d’acceptation fonctionnels
ID
Test
Résultat attendu
CA-01
Patient connu
Patient sélectionnable
CA-02
Plusieurs patients
Aucun choix automatique
CA-03
Patient avec rendez-vous
Rendez-vous affichés
CA-04
Patient sans rendez-vous
Message explicite, sans erreur
CA-05
Rendez-vous complet
Informations principales visibles
CA-06
Donnée facultative absente
Consultation toujours possible
CA-07
Professionnel absent
Aucune identité fictive
CA-08
Source indisponible
Erreur utilisateur compréhensible
CA-09
Rendez-vous sélectionné
Détail correspondant
CA-10
Conversion valide
Représentation HL7 générée
CA-11
Donnée obligatoire de conversion absente
Transformation refusée ou explicitement signalée


10. Analyse ReEIF — Métier, organisation, juridique
Métier
L’information de rendez-vous intervient dans l’organisation d’une activité de santé. Sa qualité est importante pour l’orientation et la préparation de l’activité.
Organisation
Hypothèse : le prototype est consommateur et non système de référence.
Une anomalie métier doit normalement être corrigée dans le système producteur de la donnée.
Juridique
Principes à respecter :
minimisation des données ;
accès légitime ;
absence de données réelles dans un dépôt public ;
absence de secrets dans Git ;
journalisation minimale ;
utilisation des données uniquement dans le cadre autorisé.

PARTIE 2 — SPÉCIFICATION FHIR ET MODÈLE INFORMATIONNEL
11. Version FHIR
La version retenue est :
HL7 FHIR R4 — 4.0.1
Le serveur pédagogique retenu est le serveur HAPI FHIR baseR4, annoncé en FHIR 4.0.1. Le contexte fourni précise également qu’il s’agit d’un serveur public de test, sans données réelles, pouvant être régulièrement purgé.
La version doit également être contrôlée par :
GET [base]/metadata
et :
CapabilityStatement.fhirVersion

12. Modèle informationnel FHIR
Ressources cœur
Patient
Appointment
Ressources conditionnelles
Practitioner
PractitionerRole
Location
HealthcareService
Organization
Ressources exclues du MVP
Schedule
Slot
Ces dernières concernent notamment la disponibilité et la planification des créneaux, alors que le prototype consulte des rendez-vous déjà existants.

13. Ressources FHIR retenues
Ressource
Rôle
Statut
Patient
Identité du patient
Obligatoire
Appointment
Rendez-vous
Obligatoire
Practitioner
Professionnel
Conditionnel
PractitionerRole
Rôle professionnel
Conditionnel
Location
Lieu
Conditionnel
HealthcareService
Service de santé
Conditionnel
Organization
Contexte organisationnel
Optionnel
Schedule
Disponibilités
Hors MVP
Slot
Créneau
Hors MVP


14. Ressource Appointment
Appointment constitue la ressource centrale.
Informations retenues :
Information
Élément FHIR R4
Identifiant métier
Appointment.identifier
Statut
Appointment.status
Catégorie
Appointment.serviceCategory
Service
Appointment.serviceType
Spécialité
Appointment.specialty
Type
Appointment.appointmentType
Motif
Appointment.reasonCode
Description
Appointment.description
Début
Appointment.start
Fin
Appointment.end
Durée
Appointment.minutesDuration
Participants
Appointment.participant
Acteur
Appointment.participant.actor
Statut participant
Appointment.participant.status

Le patient n’est pas porté par un champ Appointment.patient en R4.
Il est retrouvé via :
Appointment.participant.actor → Patient
Un participant peut également référencer notamment :
Practitioner
PractitionerRole
Location
HealthcareService
RelatedPerson
Device
La couche applicative doit donc examiner le type de chaque référence.

15. Graphe des ressources
Patient
   ▲
   │
Appointment
   │
   ├── participant.actor → Patient
   ├── participant.actor → Practitioner
   ├── participant.actor → PractitionerRole
   │                         ├── practitioner → Practitioner
   │                         ├── organization → Organization
   │                         ├── location → Location
   │                         └── healthcareService → HealthcareService
   ├── participant.actor → Location
   └── participant.actor → HealthcareService

16. Profils et Implementation Guides
Aucun profil spécifique n’est actuellement imposé.
Le MVP repose donc sur :
les ressources FHIR R4 de base.
Le prototype doit toutefois pouvoir inspecter :
Resource.meta.profile
Un profil trouvé dans une ressource ne sera considéré comme obligatoire pour le projet qu’après vérification explicite.
Il convient de distinguer :
FHIR de base
≠ profil
≠ extension
≠ Implementation Guide
≠ terminologie
Aucun IG français ou européen n’est déclaré obligatoire à ce stade.

17. Terminologies et bindings
Règle générale concernant un Coding :
system
code
display
doivent être distingués.
system + code permettent l’identification sémantique du concept.
display est essentiellement un libellé humain.
Éléments principaux
Élément
Type
Règle
Appointment.status
code
Binding Required
serviceCategory
CodeableConcept
Codages à conserver
serviceType
CodeableConcept
Codage source préservé
specialty
CodeableConcept
Codage source préservé
appointmentType
CodeableConcept
Ne pas confondre avec serviceType
reasonCode
CodeableConcept
Plusieurs Coding possibles
participant.status
code
Binding Required
Patient.gender
code
AdministrativeGender

Un code local ne doit jamais être transformé arbitrairement en un code standard.

18. Interactions avec le serveur FHIR
Interaction
Objectif
GET [base]/metadata
Identifier version et capacités
Recherche Patient
Identifier le patient
GET Patient/{id}
Lire un patient connu
Recherche Appointment
Obtenir les rendez-vous du patient
GET Practitioner/{id}
Résoudre un professionnel
GET PractitionerRole/{id}
Résoudre un rôle
GET Location/{id}
Résoudre un lieu
GET HealthcareService/{id}
Résoudre un service
_include
Optimiser la résolution des références

Le paramètre central envisagé est :
Appointment?patient={patient-id}
Son support réel doit être contrôlé dans le CapabilityStatement.
_include constitue une optimisation et non une dépendance obligatoire.

19. Gestion des réponses FHIR
Le prototype doit gérer :
ressource unique ;
Bundle de recherche ;
zéro résultat ;
un résultat ;
plusieurs résultats ;
ressources incluses ;
références externes au Bundle ;
pagination ;
OperationOutcome.
Règle importante :
0 Appointment
≠
erreur de recherche
La pagination doit tenir compte de :
Bundle.link[relation="next"]
si cette relation est fournie.

20. Validation FHIR
Quatre niveaux sont retenus.
VAL-FHIR-1 — Transport / syntaxe
HTTP ;
JSON/XML lisible ;
Content-Type.
VAL-FHIR-2 — Structure
resourceType ;
types ;
cardinalités ;
références ;
invariants.
VAL-FHIR-3 — Sémantique
codes ;
bindings ;
systèmes terminologiques ;
type des participants ;
cohérence des dates.
VAL-FHIR-4 — Contraintes locales
patient rattachable au rendez-vous ;
informations suffisantes pour l’affichage ;
informations suffisantes pour le mapping.

21. Contrat de données FHIR
Donnée
Source
Patient id
Patient.id
Identifiant patient
Patient.identifier
Nom
Patient.name
Date de naissance
Patient.birthDate
Genre administratif
Patient.gender
Appointment id
Appointment.id
Identifiant RDV
Appointment.identifier
Statut
Appointment.status
Description
Appointment.description
Type
Appointment.appointmentType
Service
Appointment.serviceType
Spécialité
Appointment.specialty
Motif
Appointment.reasonCode
Début
Appointment.start
Fin
Appointment.end
Durée
Appointment.minutesDuration
Participant
Appointment.participant
Professionnel
participant.actor → Practitioner / PractitionerRole
Lieu
participant.actor → Location
Service santé
participant.actor → HealthcareService


PARTIE 3 — ARCHITECTURE ET TRANSFORMATION FHIR → HL7 V2
22. Architecture d’intégration
Architecture minimale :
Utilisateur
     │
     ▼
Interface
     │
     ▼
Service d’accès FHIR
     │
     ▼
Serveur FHIR R4
     │
     ▼
Validation FHIR
     │
     ▼
Modèle normalisé
     ├────────────────► Interface métier
     │
     ▼
Moteur de transformation
     │
     ▼
Validation HL7 v2
     │
     ▼
Message / représentation HL7 v2
Il n’est pas nécessaire d’introduire un ESB, middleware hospitalier ou architecture microservices pour ce prototype.

23. ReEIF — Infrastructure et Application
Infrastructure
Le prototype doit traiter :
connectivité réseau ;
HTTPS ;
indisponibilité du serveur ;
timeout ;
absence d’authentification sur le serveur pédagogique ;
secrets externalisés si authentification future ;
journalisation minimale ;
absence de données réelles sur le serveur public.
Application
L’application doit séparer :
Accès FHIR
Validation
Normalisation
Mapping
Validation HL7
Affichage
Une concaténation directe :
JSON FHIR → chaînes HL7
depuis l’interface est interdite par conception.

24. Version HL7 v2
Aucune sous-version n’a été explicitement imposée dans l’énoncé disponible.
La version candidate retenue est donc :
HL7 v2.5.1
Statut : recommandation à confirmer avec l’enseignant et les supports de cours.
Il faut distinguer :
HL7 v2.5.1 = version
SIU          = type de message
S12          = trigger event
SIU_S12      = structure

25. Message et trigger event
La famille retenue est :
SIU — Schedule Information Unsolicited
Les principaux événements considérés sont :
Événement métier
Trigger
Nouvelle réservation
S12
Replanification
S13
Modification
S14
Annulation
S15

État versus événement
Appointment.status
représente un état courant.
Un trigger SIU représente un événement métier.
Par conséquent :
booked ≠ automatiquement S12
cancelled ≠ automatiquement S15
Un snapshot FHIR ne fournit pas nécessairement l’historique ayant produit cet état.
Hypothèse MVP
Pour la démonstration :
lorsque l’utilisateur sélectionne un rendez-vous et choisit le scénario de notification de nouvelle réservation, le prototype génère une représentation SIU^S12.
S13, S14 et S15 ne doivent être générés que lorsqu’un contexte métier correspondant est disponible.

26. Profil de message HL7 minimal
Structure locale du MVP :
MSH
SCH
PID
RGS
[AIS]
[AIP]
[AIL]
Segments
Segment
Utilité
MSH
Métadonnées du message
SCH
Informations générales du rendez-vous
PID
Patient
RGS
Groupe de ressources
AIS
Service / activité
AIP
Professionnel
AIL
Lieu

PV1 n’est pas retenu par défaut car le projet porte sur le rendez-vous et non sur la visite hospitalière.
NTE n’est pas utilisé par défaut.

27. Mapping FHIR → HL7 v2
Information
Source FHIR
Transformation
Cible v2.5.1
Condition
Perte
Identifiant patient
Patient.identifier
Identifier → CX
PID-3
Identifiant pertinent disponible
Plusieurs identifiants possibles
Nom/prénom
Patient.name
HumanName → XPN
PID-5
Nom disponible
HumanName plus riche
Date naissance
Patient.birthDate
date → TS
PID-7
Facultatif
Précision partielle possible
Genre administratif
Patient.gender
Transcodage
PID-8
Table validée
Sémantique non strictement identique
Identifiant RDV
Appointment.identifier
Identifier → EI
SCH-1 ou SCH-2
Rôle placer/filler à définir
Choix local
Motif
Appointment.reasonCode
CodeableConcept → CE
SCH-7
Si retenu
Multiples codings
Type
Appointment.appointmentType
CodeableConcept → CE
SCH-8
Si disponible
Réduction possible
Service
Appointment.serviceType
CodeableConcept → CE
AIS-3
Si AIS utilisé
Terminologie variable
Début
Appointment.start
instant → TS
AIS-4
Si disponible
Répétition temporelle
Durée
minutesDuration / calcul
Nombre + unité
AIS-7/AIS-8
Durée fiable
Possible approximation
Professionnel
Practitioner
Normalisation → XCN
AIP-3
Professionnel résolu
Rôle enrichi perdu
Début professionnel
Appointment.start
instant → TS
AIP-6
Si AIP
Redondance
Lieu
Location
Normalisation → PL
AIL-3
Location résolue
Structure FHIR plus riche
Début lieu
Appointment.start
instant → TS
AIL-6
Si AIL
Redondance
Statut
Appointment.status
Transcodage éventuel
SCH-25
Table locale validée
Différence sémantique
Événement
Contexte métier
Détermination trigger
MSH-9
Contexte événementiel connu
Snapshot FHIR insuffisant


28. Alignements terminologiques
Trois types de transformations sont distingués.
Formatage
Même concept, représentation syntaxique différente.
Exemple :
FHIR instant
→
HL7 TS
Changement de représentation
Même information structurée autrement.
Exemple :
FHIR HumanName
→
HL7 XPN
Transcodage
Passage entre deux systèmes de codes.
Exemple candidat :
FHIR AdministrativeGender
→
HL7 Administrative Sex
Table locale proposée :
FHIR
HL7
male
M
female
F
other
O
unknown
U

Cette table doit être validée pour la version HL7 v2 retenue.
Aucune correspondance terminologique inconnue ne doit être inventée.

29. Dates et identifiants
Dates
Exemple FHIR :
2026-09-18T10:00:00+02:00
Représentation HL7 possible :
20260918100000+0200
Règles :
préserver le fuseau ;
préserver la précision ;
ne pas inventer une heure ;
vérifier start <= end ;
calculer une durée uniquement avec des valeurs fiables.
Identifiants
Ne pas confondre :
FHIR Resource.id
et :
Identifier.system + Identifier.value
Le premier est technique ; le second représente généralement un identifiant métier.
Le message HL7 possède en outre un identifiant technique propre pouvant être généré par l’application.

30. Gestion des erreurs
Code
Catégorie
Exemple
Transformation
ERR-NET
Réseau
timeout
FAILED
ERR-HTTP
HTTP
500
FAILED
ERR-FHIR
FHIR
OperationOutcome bloquant
FAILED
ERR-REF
Référence
Practitioner absent
Warning si facultatif
ERR-DATA
Donnée
patient non rattachable
FAILED
ERR-TERM
Terminologie
code local sans mapping
Warning ou échec selon champ
ERR-MAP
Mapping
donnée impossible à convertir
Selon criticité
ERR-HL7
Message cible
structure invalide
FAILED

Résultats généraux :
SUCCESS
SUCCESS_WITH_WARNINGS
FAILED

31. Traçabilité
Chaque transformation doit pouvoir être expliquée.
À conserver :
correlationId ;
Appointment.id ;
éventuellement Patient.id ;
version FHIR ;
version HL7 ;
message / trigger ;
version des règles de mapping ;
timestamp ;
résultat ;
warnings ;
erreurs.
À éviter dans les logs :
nom du patient ;
adresse ;
date de naissance ;
texte clinique ;
contenu complet des ressources.

32. Limites et pertes
FHIR → HL7 v2 n’est pas une transformation bijective.
Participants multiples
FHIR autorise plusieurs participants de types différents.
Stratégie :
Practitioner → AIP
Location     → AIL
Service      → AIS
Autre        → warning / omission
CodeableConcept multiples
Plusieurs Coding peuvent exister dans FHIR.
Une cible HL7 peut ne pas conserver cette richesse.
→ sélection explicite + warning éventuel.
Extensions
Une extension FHIR sans équivalent :
→ omission avec warning.
PractitionerRole
FHIR peut représenter :
personne ;
rôle ;
spécialité ;
organisation ;
lieu ;
service.
Une représentation AIP simplifiée peut perdre une partie de ce contexte.
Historique
La principale perte conceptuelle concerne :
état actuel FHIR
vs
événement historique HL7
Cette information ne doit pas être reconstruite arbitrairement.

33. Règles normatives de transformation
R1 — Une information absente dans FHIR ne doit pas être inventée.
R2 — Toute donnée HL7 doit avoir une provenance identifiable.
R3 — Le moteur de mapping doit consommer une représentation normalisée.
R4 — Un trigger SIU ne doit pas être déduit automatiquement de Appointment.status.
R5 — Tout transcodage doit reposer sur une règle explicite.
R6 — Un code local ne doit pas être remplacé arbitrairement par un code standard.
R7 — display seul ne constitue pas un identifiant sémantique fiable.
R8 — Les références facultatives non résolues produisent un warning et ne bloquent pas nécessairement le message.
R9 — Une donnée obligatoire pour le profil local absente bloque la transformation.
R10 — Un identifiant technique FHIR ne doit pas être automatiquement substitué à un identifiant métier.
R11 — Un identifiant technique du message HL7 peut être généré.
R12 — Les fuseaux horaires doivent être conservés lorsqu’ils sont disponibles.
R13 — Aucune durée ne doit être inventée.
R14 — Le type d’un participant doit être interprété avant mapping.
R15 — Toute perte sémantique significative doit être signalée.
R16 — Un message syntaxiquement valide n’est pas nécessairement sémantiquement correct.
R17 — La transformation doit être validée avant présentation comme réussie.
R18 — Les traces doivent minimiser les données personnelles.
R19 — La version du standard et du mapping doit être traçable.
R20 — SUCCESS ne signifie pas nécessairement « transformation sans perte ».

34. Points restant à valider avant développement
Décision
Responsable
Confirmation de HL7 v2.5.1
Groupe / enseignant
Support effectif d’Appointment?patient sur le serveur
Membre FHIR
SearchParameters Patient réellement retenus
Membre FHIR
Professionnels représentés par Practitioner ou PractitionerRole dans les données utilisées
Membre FHIR
Usage réel de Location / HealthcareService
Membre FHIR
Rendez-vous passés ou uniquement futurs
Groupe
Identifiant Appointment à considérer comme placer/filler
Membre HL7
Mapping exact Appointment.status → SCH-25
Membre HL7
Table finale des terminologies
Membres FHIR + HL7
Utilisation ou non de NTE
Groupe
Cas exact de déclenchement S12/S13/S14/S15
Groupe / membre HL7


35. Synthèse du contrat global
Le prototype devra respecter la chaîne suivante :
FHIR R4 4.0.1
       │
       ▼
Patient + Appointment
       │
       ▼
Résolution conditionnelle
Practitioner / PractitionerRole / Location / HealthcareService
       │
       ▼
Validation FHIR
       │
       ▼
Modèle métier normalisé
       │
       ├──────────────► Vue métier
       │
       ▼
Détermination du contexte événementiel
       │
       ▼
Mapping documenté
       │
       ▼
HL7 v2.5.1 SIU
       │
       ▼
Validation
       │
       ▼
SUCCESS / SUCCESS_WITH_WARNINGS / FAILED
Ce cahier des charges pose donc une séparation explicite entre quatre niveaux :
ce que le métier exige
 ce que FHIR représente
 ce que le serveur permet réellement
 ce que le profil HL7 v2 du prototype choisit de produire

