# **Prompt individuel 3 — Membre 3**

## **Architecture, ReEIF technique et transformation FHIR → HL7 v2**

&nbsp;

&nbsp;

*Prompt 1  :*&nbsp;

&nbsp;

Agis en tant qu'architecte d'interopérabilité en santé, expert HL7 v2, FHIR et intégration de systèmes d'information hospitaliers.

&nbsp;

\#\# CONTEXTE

&nbsp;

Nous réalisons en groupe de trois un projet universitaire d'interopérabilité.

&nbsp;

Sujet :

&nbsp;

\*\*« Rendez-vous / calendrier d'un patient »\*\*

&nbsp;

Le prototype devra :

1\. se connecter à un serveur FHIR ;

2\. récupérer des informations concernant un patient et ses rendez-vous ;

3\. les afficher ;

4\. permettre de représenter ou transformer les informations du rendez-vous dans le format cible \*\*HL7 v2\*\*.

&nbsp;

Le membre 1 traite le besoin métier et les critères d'acceptation.

Le membre 2 traite la modélisation des données, les ressources FHIR, profils, terminologies et requêtes FHIR.

&nbsp;

Je suis responsable de :

\- l'architecture d'intégration ;

\- les dimensions techniques du ReEIF ;

\- le choix précis de l'échange HL7 v2 ;

\- les règles de transformation FHIR → HL7 v2 ;

\- la gestion des erreurs ;

\- la traçabilité ;

\- les limites et pertes d'information.

&nbsp;

Nous sommes encore en phase de \*\*cahier des charges\*\*. Il ne faut pas développer l'application.

&nbsp;

\#\# OBJECTIF

&nbsp;

Produire une spécification technique qui permettra ensuite d'implémenter le prototype sans devoir inventer les règles d'intégration pendant le développement.

&nbsp;

\#\# TRAVAIL DEMANDÉ

&nbsp;

\#\#\# 1\. Architecture fonctionnelle et technique

&nbsp;

Propose une architecture simple et adaptée à un prototype académique.

&nbsp;

Elle doit faire apparaître au minimum :

\- utilisateur ;

\- interface applicative ;

\- couche/service d'accès FHIR ;

\- serveur FHIR ;

\- modèle ou couche de normalisation éventuelle ;

\- moteur de transformation ;

\- représentation/message HL7 v2.

&nbsp;

Indique le sens des flux.

&nbsp;

Évite toute architecture inutilement complexe.

&nbsp;

\#\#\# 2\. Analyse ReEIF — Infrastructure et Application

&nbsp;

Analyse principalement :

&nbsp;

\#\#\#\# Infrastructure

\- connectivité ;

\- HTTPS/TLS ;

\- authentification si nécessaire ;

\- disponibilité du serveur ;

\- gestion des secrets ;

\- journalisation ;

\- contraintes réseau.

&nbsp;

\#\#\#\# Application

\- API REST/FHIR côté source ;

\- modèle requête/réponse ;

\- HL7 v2 côté cible ;

\- gestion des erreurs ;

\- comportement en cas d'échec ;

\- éventuel rôle d'une couche de transformation.

&nbsp;

Fais aussi le lien avec les autres couches ReEIF lorsqu'une décision technique a une conséquence métier, informationnelle, organisationnelle ou juridique.

&nbsp;

\#\#\# 3\. Choix de la version HL7 v2

&nbsp;

Détermine quelle version de HL7 v2 doit être retenue.

&nbsp;

Ne choisis pas arbitrairement :

\- vérifie d'abord si l'énoncé impose une version ;

\- sinon propose une version adaptée et justifie-la ;

\- distingue clairement standard HL7 v2, message, structure et trigger event.

&nbsp;

\#\#\# 4\. Choix du message de rendez-vous

&nbsp;

Analyse la famille de messages HL7 v2 destinée au scheduling.

&nbsp;

Détermine quel type de message et quel trigger event conviennent au scénario retenu.

&nbsp;

Étudie notamment la famille SIU et les événements correspondant à :

\- création ;

\- modification ;

\- replanification ;

\- annulation.

&nbsp;

IMPORTANT :

explique la différence entre :

\- un \*\*état FHIR\*\* tel que \`Appointment.status\` ;

\- un \*\*événement métier HL7 v2\*\* tel qu'un trigger SIU.

&nbsp;

Ne déduis pas automatiquement un événement historique à partir d'un simple état courant si l'information nécessaire n'est pas disponible.

&nbsp;

Lorsque le scénario du prototype nécessite une hypothèse, formule-la explicitement.

&nbsp;

\#\#\# 5\. Structure du message HL7 v2

&nbsp;

Identifie les segments nécessaires au scénario de rendez-vous.

&nbsp;

Étudie notamment lorsque pertinent :

\- MSH ;

\- SCH ;

\- PID ;

\- PV1 ;

\- RGS ;

\- AIS ;

\- AIP ;

\- AIL ;

\- NTE si justifié.

&nbsp;

Pour chaque segment retenu :

\- explique son rôle ;

\- indique quelles catégories d'informations FHIR devront l'alimenter.

&nbsp;

N'ajoute pas un segment uniquement pour « faire plus complet ».

&nbsp;

\#\#\# 6\. Mapping FHIR → HL7 v2

&nbsp;

Construis une spécification de mapping détaillée sous forme de tableau :

&nbsp;

| Information métier | Source FHIR | Transformation | Cible HL7 v2 | Règle / condition | Perte potentielle |

&nbsp;

Couvre au minimum :

\- identifiant patient ;

\- nom/prénom ;

\- date de naissance si utilisée ;

\- sexe administratif si utilisé ;

\- identifiant du rendez-vous ;

\- début ;

\- fin/durée ;

\- type/service ;

\- professionnel ;

\- lieu ;

\- statut.

&nbsp;

Pour les champs HL7 v2, utilise des références précises du type :

\`PID-x\`, \`SCH-x\`, etc., uniquement après vérification dans la version HL7 v2 retenue.

&nbsp;

Ne fabrique jamais un numéro de champ de mémoire si tu n'es pas certain.

&nbsp;

\#\#\# 7\. Alignement terminologique

&nbsp;

Identifie les endroits où une simple copie de valeur est impossible.

&nbsp;

Pour chaque transformation de code :

\- source ;

\- système de codes source ;

\- système cible ;

\- règle de correspondance ;

\- valeur inconnue ;

\- comportement si aucun mapping n'existe.

&nbsp;

Distingue :

\- transcodage ;

\- changement de représentation ;

\- simple formatage.

&nbsp;

Exemple typique à analyser : valeurs administratives ou statuts.

&nbsp;

\#\#\# 8\. Transformation des dates et identifiants

&nbsp;

Définis les règles pour :

\- format des dates/heures FHIR ;

\- format HL7 v2 ;

\- fuseaux horaires ;

\- précision ;

\- valeurs absentes ;

\- identifiants et systèmes d'identifiants.

&nbsp;

Aucune information ne doit être inventée pour remplir un champ HL7.

&nbsp;

\#\#\# 9\. Gestion des erreurs

&nbsp;

Établis une stratégie différenciant :

\- erreur réseau ;

\- erreur HTTP ;

\- erreur FHIR / OperationOutcome ;

\- référence FHIR impossible à résoudre ;

\- donnée obligatoire absente ;

\- code inconnu ;

\- erreur de transformation ;

\- message HL7 invalide.

&nbsp;

Pour chaque catégorie :

\- comportement technique ;

\- message utilisateur éventuel ;

\- possibilité ou non de poursuivre la transformation.

&nbsp;

\#\#\# 10\. Traçabilité

&nbsp;

Spécifie les éléments techniques utiles pour pouvoir expliquer une transformation :

\- identifiant de la ressource source ;

\- version ou horodatage ;

\- règles de mapping utilisées ;

\- date de transformation ;

\- warnings ;

\- erreurs ;

\- version FHIR ;

\- version HL7 v2.

&nbsp;

Veille toutefois au principe de minimisation des données de santé dans les journaux.

&nbsp;

\#\#\# 11\. Limites et pertes d'information

&nbsp;

Analyse explicitement le fait qu'une transformation FHIR → HL7 v2 n'est pas nécessairement bijective.

&nbsp;

Identifie :

\- éléments FHIR sans équivalent direct ;

\- participants multiples ;

\- extensions ;

\- données codées plus riches ;

\- informations facultatives ;

\- informations qui nécessitent un choix de profil local ;

\- contexte qui peut être perdu.

&nbsp;

Pour chaque perte potentielle, choisir parmi :

\- mapping défini ;

\- information omise avec warning ;

\- blocage de la transformation ;

\- extension ou champ spécifique uniquement si justifié.

&nbsp;

\#\#\# 12\. Règles générales de transformation

&nbsp;

Termine par une liste normative du type :

&nbsp;

R1 — Une information absente dans FHIR ne doit pas être inventée.

R2 — Toute transformation terminologique doit être explicite.

R3 — ...

R4 — ...

&nbsp;

Ces règles constitueront le contrat utilisé pendant le développement.

&nbsp;

\#\# SOURCES ET VÉRIFICATION

&nbsp;

Utilise prioritairement :

\- documentation officielle HL7 v2 pour la version retenue ;

\- spécification officielle FHIR pour les éléments sources ;

\- supports du cours ;

\- éventuellement des guides d'implémentation officiels.

&nbsp;

Ne te fie pas uniquement à des exemples trouvés sur Internet.

&nbsp;

Pour les segments et champs HL7 v2 :

\- vérifie systématiquement la version ;

\- signale toute information incertaine ;

\- n'invente jamais un mapping.

&nbsp;

\#\# CONTRAINTES

&nbsp;

\- Français.

\- Pas de code.

\- Architecture proportionnée au prototype.

\- Hypothèses explicitement signalées.

\- Chaque choix doit être justifié.

\- Une transformation réussie ne doit jamais être assimilée automatiquement à une transformation sans perte.

\- Distinguer clairement :

&nbsp;&nbsp;\- syntaxe ;

&nbsp;&nbsp;\- sémantique ;

&nbsp;&nbsp;\- transport ;

&nbsp;&nbsp;\- événement métier.

&nbsp;

\#\# FORMAT DE SORTIE

&nbsp;

1\. Architecture proposée

2\. Analyse ReEIF Infrastructure/Application

3\. Version HL7 v2

4\. Message / trigger event

5\. Structure du message

6\. Mapping FHIR → HL7 v2

7\. Alignements terminologiques

8\. Dates et identifiants

9\. Gestion des erreurs

10\. Traçabilité

11\. Limites et pertes

12\. Règles normatives de transformation

13\. Hypothèses et points à valider

&nbsp;

&nbsp;

***Réponse :***&nbsp;

&nbsp;

# **1\. Architecture proposée**

L’architecture retenue doit rester simple, lisible et adaptée à un prototype académique. Le besoin ne justifie ni bus d’intégration complexe, ni microservices multiples, ni moteur d’interface hospitalier dédié.

L’architecture recommandée est la suivante :

Utilisateur

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Interface applicative

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Service d'accès FHIR

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Serveur FHIR R4

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Validation des ressources

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Couche de normalisation métier

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;├──────────────► Affichage applicatif

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Moteur de transformation FHIR → HL7 v2

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Validation du message HL7 v2

&nbsp;&nbsp;&nbsp;&nbsp;│

&nbsp;&nbsp;&nbsp;&nbsp;▼

Représentation HL7 v2

Le serveur FHIR utilisé dans la partie précédente est HAPI FHIR `baseR4`, qui expose FHIR R4 4.0.1.

## **Responsabilités**

| Composant | Responsabilité |
| ----- | ----- |
| Interface applicative | Permettre la sélection du patient, la consultation des rendez-vous et l’affichage du résultat HL7 |
| Service d’accès FHIR | Exécuter les requêtes et gérer les réponses FHIR |
| Serveur FHIR | Fournir les ressources Patient, Appointment et ressources associées |
| Validation FHIR | Contrôler structure, références et données nécessaires |
| Normalisation | Transformer les ressources FHIR en un modèle métier stable |
| Moteur de transformation | Appliquer les règles FHIR → HL7 v2 |
| Validation HL7 | Vérifier syntaxe, structure et contraintes locales |
| Représentation HL7 v2 | Présenter le message cible à l’utilisateur |

La couche de normalisation constitue une décision importante : le moteur HL7 v2 ne doit pas réinterpréter librement le JSON FHIR brut.

---

# **2\. Analyse ReEIF — Infrastructure / Application**

## **Infrastructure**

### **Connectivité**

Le prototype dépend d’un serveur FHIR distant. Toute indisponibilité réseau doit donc être considérée comme une condition normale à gérer et non comme une erreur applicative imprévue.

Le service d’accès doit différencier :

* serveur inaccessible ;  
* timeout ;  
* erreur HTTP ;  
* réponse FHIR valide mais vide ;  
* réponse FHIR en erreur.

### **HTTPS / TLS**

Le serveur retenu est exposé via HTTPS. La connexion doit utiliser cette URL sécurisée.

Dans un environnement clinique réel, la confidentialité et l’intégrité du transport seraient obligatoires. Pour le prototype, HTTPS reste également le mécanisme approprié.

### **Authentification**

Le serveur public HAPI utilisé pour la démonstration ne représente pas un système clinique sécurisé.

**Hypothèse :** aucune authentification n’est nécessaire dans le périmètre pédagogique actuel.

Si un futur serveur impose un token ou des identifiants :

* aucun secret ne doit être inscrit en dur dans le dépôt Git ;  
* aucun token ne doit apparaître dans les journaux ;  
* la configuration doit être externalisée.

### **Disponibilité**

Le serveur de démonstration étant externe, le prototype doit tolérer :

serveur disponible

serveur lent

serveur indisponible

jeu de données modifié

La disponibilité du serveur ne peut pas être considérée comme garantie.

### **Journalisation**

La journalisation doit permettre de diagnostiquer un échange sans recopier inutilement les données du patient.

À tracer de préférence :

* horodatage ;  
* type d’opération ;  
* ressource concernée ;  
* identifiant technique ;  
* code HTTP ;  
* résultat ;  
* warnings ;  
* identifiant de corrélation.

À éviter par défaut :

* nom complet ;  
* date de naissance ;  
* adresse ;  
* texte clinique ;  
* contenu intégral des ressources.

---

## **Application**

La source utilise le paradigme :

REST \+ ressources FHIR

alors que la cible HL7 v2 utilise un paradigme :

message événementiel structuré en segments

Cette différence justifie la présence d’une couche de transformation.

Le flux logique devient :

FHIR Resource

&nbsp;&nbsp;&nbsp;&nbsp;↓

validation

&nbsp;&nbsp;&nbsp;&nbsp;↓

normalisation

&nbsp;&nbsp;&nbsp;&nbsp;↓

contexte événementiel

&nbsp;&nbsp;&nbsp;&nbsp;↓

mapping

&nbsp;&nbsp;&nbsp;&nbsp;↓

HL7 v2

Cela évite de confondre :

* modèle source ;  
* modèle métier ;  
* modèle cible.

### **Impact sur les autres dimensions ReEIF**

**Métier :** une erreur de conversion ne doit pas modifier le sens d’un rendez-vous.

**Information :** les pertes de sémantique doivent être visibles.

**Organisation :** le prototype n’est pas la source de référence du rendez-vous.

**Juridique :** la traçabilité ne doit pas entraîner une duplication inutile de données patient.

---

# **3\. Version HL7 v2**

L’énoncé impose **HL7 v2**, mais ne précise pas de sous-version.

Je retiens donc comme **version candidate du prototype : HL7 v2.5.1**.

Cette version est adaptée car :

* elle définit la famille SIU pour le scheduling ;  
* elle possède une structure `SIU_S12` documentée ;  
* elle définit les segments `SCH`, `AIS`, `AIP`, `AIL`, etc. nécessaires au scénario ;  
* elle est suffisamment mature pour un exercice d’intégration.

HL7 v2.5.1 est une version finalisée du standard et documente la structure `SIU_S12`.

**Statut : RECOMMANDATION À VALIDER avec l’enseignant si les supports de cours imposent une autre version.**

Les supports fournis dans la conversation n’ont pas permis de confirmer automatiquement une sous-version HL7 v2 précise ; je ne les utilise donc pas comme preuve d’un choix de version.

Il faut distinguer quatre notions :

HL7 v2.5.1

\= version du standard

&nbsp;

SIU

\= type de message

&nbsp;

S12

\= trigger event

&nbsp;

SIU\_S12

\= structure de message

Dans HL7 v2.5.1, les événements S12 à S24 et S26 utilisent la structure `SIU_S12`.

---

# **4\. Message / trigger event**

La famille appropriée est :

> **SIU — Schedule Information Unsolicited**

Elle est destinée aux notifications relatives aux événements de planification.

Les événements principaux pertinents sont :

| Action métier | Trigger | Sens |
| ----- | ----- | ----- |
| Nouveau rendez-vous | `S12` | Notification of new appointment booking |
| Replanification | `S13` | Notification of appointment rescheduling |
| Modification | `S14` | Notification of appointment modification |
| Annulation | `S15` | Notification of appointment cancellation |

Ces significations sont explicitement documentées en HL7 v2.5.1.

## **État FHIR ≠ événement HL7**

Il faut impérativement distinguer :

Appointment.status

qui décrit **l’état courant** d’une ressource, de :

SIU^S12

SIU^S13

SIU^S14

SIU^S15

qui indiquent **l’événement métier ayant déclenché le message**.

Par exemple :

Appointment.status \= booked

ne permet pas de savoir si :

* le rendez-vous vient d’être créé ;  
* il vient d’être modifié ;  
* il a été replanifié auparavant.

De même :

Appointment.status \= cancelled

indique l’état courant, mais ne constitue pas à lui seul une preuve historique de l’événement ayant eu lieu.

### **Hypothèse de démonstration retenue**

Pour le MVP :

> lorsqu’un utilisateur demande explicitement la génération d’une représentation d’un rendez-vous existant dans le scénario « nouvelle réservation », le prototype produit un `SIU^S12`.

Cette hypothèse est nécessaire car le prototype lit un snapshot FHIR et ne dispose pas nécessairement de l’historique métier.

Les scénarios S13, S14 et S15 restent documentés, mais ne doivent être générés que si le contexte événementiel est connu.

---

# **5\. Structure du message**

En HL7 v2.5.1, la structure `SIU_S12` est :

MSH

SCH

\[ TQ1 \]

\[ NTE \]

\[ PATIENT

&nbsp;&nbsp;&nbsp;&nbsp;PID

&nbsp;&nbsp;&nbsp;&nbsp;\[PD1\]

&nbsp;&nbsp;&nbsp;&nbsp;\[PV1\]

&nbsp;&nbsp;&nbsp;&nbsp;\[PV2\]

&nbsp;&nbsp;&nbsp;&nbsp;...

\]

{

&nbsp;&nbsp;RESOURCES

&nbsp;&nbsp;&nbsp;&nbsp;RGS

&nbsp;&nbsp;&nbsp;&nbsp;\[ SERVICE

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AIS

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\[NTE\]

&nbsp;&nbsp;&nbsp;&nbsp;\]

&nbsp;&nbsp;&nbsp;&nbsp;\[ GENERAL\_RESOURCE

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AIG

&nbsp;&nbsp;&nbsp;&nbsp;\]

&nbsp;&nbsp;&nbsp;&nbsp;\[ LOCATION\_RESOURCE

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AIL

&nbsp;&nbsp;&nbsp;&nbsp;\]

&nbsp;&nbsp;&nbsp;&nbsp;\[ PERSONNEL\_RESOURCE

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AIP

&nbsp;&nbsp;&nbsp;&nbsp;\]

}

Pour notre prototype, le profil local minimal retenu est :

MSH

SCH

PID

RGS

\[AIS\]

\[AIP\]

\[AIL\]

`PV1` n’est pas retenu par défaut car notre sujet traite du rendez-vous, pas d’une visite/Encounter existante.

`NTE` n’est retenu que si le groupe décide de transporter un commentaire réellement nécessaire.

## **Rôle des segments**

| Segment | Rôle | Source FHIR principale |
| ----- | ----- | ----- |
| MSH | En-tête du message | métadonnées générées par l’application |
| SCH | Informations générales du rendez-vous | Appointment |
| PID | Identification du patient | Patient |
| RGS | Regroupement des ressources du rendez-vous | structure générée |
| AIS | Service prévu | Appointment.serviceType ou concept retenu |
| AIP | Ressource personnel | Practitioner / PractitionerRole |
| AIL | Ressource de localisation | Location |
| NTE | Note libre éventuelle | Appointment.comment ou instruction si explicitement retenue |

---

# **6\. Mapping FHIR → HL7 v2**

Le mapping ci-dessous est limité aux champs dont la sémantique a été vérifiée dans HL7 v2.5.1.

| Information métier | Source FHIR | Transformation | Cible HL7 v2 | Règle / condition | Perte potentielle |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Identifiant patient | `Patient.identifier` | Identifier → CX | `PID-3 Patient Identifier List` | Choisir un identifiant métier documenté, conserver le namespace | Plusieurs identifiants FHIR possibles |
| Nom / prénom | `Patient.name` | HumanName → XPN | `PID-5 Patient Name` | Choisir le nom pertinent selon règle locale | FHIR HumanName plus riche |
| Date naissance | `Patient.birthDate` | date → TS | `PID-7 Date/Time of Birth` | Utiliser seulement si présente | FHIR peut avoir précision partielle |
| Genre administratif | `Patient.gender` | transcodage | `PID-8 Administrative Sex` | Table explicite requise | Concepts/value sets différents |
| Identifiant RDV | `Appointment.identifier` | Identifier → EI | `SCH-1` ou `SCH-2` selon rôle placer/filler | Le rôle doit être défini localement | Ambiguïté placer/filler |
| Motif RDV | `Appointment.reasonCode` | CodeableConcept → CE | `SCH-7 Appointment Reason` | seulement si mapping pertinent | Multiples codings possibles |
| Type RDV | `Appointment.appointmentType` | CodeableConcept → CE | `SCH-8 Appointment Type` | ne pas utiliser serviceType ici | Réduction possible |
| Durée | `Appointment.minutesDuration` ou calcul start/end | numérique \+ unité | `SCH-9/10` ou durée sur segments ressource | SCH-9/10 sont backward-compatibility en 2.5.1 ; usage local à décider | Risque de redondance |
| Service | `Appointment.serviceType` | CodeableConcept → CE | `AIS-3 Universal Service Identifier` | mapping seulement si serviceType représente bien le service cible | Terminologie source différente |
| Début service | `Appointment.start` | instant → TS | `AIS-4` | si AIS utilisé | Même date répétée dans plusieurs segments |
| Durée service | durée | nombre \+ unité | `AIS-7` / `AIS-8` | si connue | approximation possible |
| Professionnel | Practitioner / PractitionerRole | normalisation identité → XCN | `AIP-3 Personnel Resource ID` | seulement si acteur professionnel résolu | perte d’informations PractitionerRole |
| Début personnel | Appointment.start | instant → TS | `AIP-6` | si AIP utilisé | redondance |
| Durée personnel | durée | NM \+ CE | `AIP-9/10` | si connue | approximation |
| Lieu | Location | mapping vers PL | `AIL-3 Location Resource ID` | seulement si Location résolue | structure Location plus riche |
| Début lieu | Appointment.start | instant → TS | `AIL-6` | si segment utilisé | redondance |
| Statut global | `Appointment.status` | **pas de copie directe automatique** | éventuellement `SCH-25 Filler Status Code` | mapping local à définir explicitement | forte différence sémantique |
| Événement | contexte métier | choix trigger | `MSH-9` | événement connu, pas seulement status | impossible avec snapshot seul |

`PID-3`, `PID-5`, `PID-7` et `PID-8` sont respectivement Patient Identifier List, Patient Name, Date/Time of Birth et Administrative Sex en v2.5.1.

Dans `SCH`, le champ 1 est Placer Appointment ID, le champ 2 Filler Appointment ID, le champ 7 Appointment Reason, le champ 8 Appointment Type et le champ 25 Filler Status Code.

Pour les ressources : `AIS-3` est Universal Service Identifier et `AIS-4` Start Date/Time ; `AIP-3` est Personnel Resource ID et `AIP-6` Start Date/Time.

---

# **7\. Alignements terminologiques**

Trois types de transformation sont distingués.

## **Simple formatage**

Le sens reste identique, seule la représentation change.

Exemple :

FHIR dateTime / instant

→ HL7 TS

## **Changement de représentation**

La structure du concept change mais pas nécessairement sa terminologie.

Exemple :

Patient.name

→ XPN

## **Transcodage**

Le concept passe d’un système de codes à un autre.

Exemple :

FHIR AdministrativeGender

→ HL7 v2 Table 0001

## **Genre administratif**

Une table locale peut être définie pour le prototype :

| FHIR | HL7 v2 administratif |
| ----- | ----- |
| `male` | `M` |
| `female` | `F` |
| `other` | `O` |
| `unknown` | `U` |

Cette table doit être marquée comme :

> **table de transcodage locale du prototype à valider contre les valeurs HL7 v2.5.1 réellement utilisées.**

Elle ne doit pas être généralisée à tous les concepts de sexe/genre.

## **Statut Appointment**

Le mapping :

Appointment.status → SCH-25

ne doit pas être une simple copie.

FHIR utilise des valeurs comme :

booked

cancelled

fulfilled

noshow

...

alors que `SCH-25` utilise un code de statut filler dans le contexte scheduling HL7 v2.

Une table de correspondance locale est donc nécessaire si le champ est utilisé.

En absence de correspondance validée :

> ne pas envoyer une valeur arbitraire ; produire un warning ou omettre le champ s’il est optionnel.

---

# **8\. Dates et identifiants**

## **Dates FHIR**

FHIR `Appointment.start` et `end` sont de type `instant` et comportent normalement un instant précis avec fuseau.

Exemple :

2026-09-18T10:00:00+02:00

## **Dates HL7 v2.5.1**

Les champs temporels de scheduling étudiés utilisent le type `TS` en v2.5.1, par exemple `AIS-4` et `AIP-6`.

Une représentation peut prendre une forme telle que :

20260918100000+0200

Règles :

* préserver le fuseau lorsque disponible ;  
* conserver la précision source ;  
* ne pas inventer secondes ou heure si elles n’existent pas ;  
* vérifier `start <= end` ;  
* calculer la durée à partir de start/end uniquement s’ils sont présents et cohérents ;  
* préférer `minutesDuration` si la politique locale le prévoit, tout en sachant que FHIR précise qu’il peut différer de l’intervalle start/end.

## **Identifiants**

Il faut distinguer :

### **`Resource.id`**

Identifiant logique technique FHIR.

Il ne doit pas être automatiquement utilisé comme identifiant métier du patient ou du rendez-vous.

### **`Identifier`**

Identifiant métier avec :

system

value

À privilégier pour le mapping métier.

### **Message Control ID**

Le message HL7 doit posséder son propre identifiant technique de message.

Cet identifiant **peut être généré**, car il identifie le message produit, et non une donnée clinique absente.

---

# **9\. Gestion des erreurs**

| Catégorie | Exemple | Comportement | Utilisateur | Transformation |
| ----- | ----- | ----- | ----- | ----- |
| Réseau | timeout / DNS | journaliser et arrêter le flux | « Serveur indisponible » | Impossible |
| HTTP | 404 / 500 | interpréter code | message fonctionnel | Selon cas |
| FHIR | OperationOutcome | analyser issue | message synthétique | Selon sévérité |
| Référence | Practitioner introuvable | warning si facultatif | information éventuellement absente | Possible |
| Donnée obligatoire | patient non rattachable | erreur bloquante | « données insuffisantes » | Impossible |
| Code inconnu | service non mappé | warning | donnée éventuellement affichée brute | Selon champ |
| Mapping | source/cible incompatibles | erreur ou warning | signaler échec de conversion | Selon criticité |
| HL7 invalide | segment/champ non conforme | rejeter le message produit | « conversion invalide » | Échec |

Trois résultats généraux sont recommandés :

SUCCESS

SUCCESS\_WITH\_WARNINGS

FAILED

---

# **10\. Traçabilité**

Pour chaque transformation, conserver au minimum :

| Élément | Utilité |
| ----- | ----- |
| correlationId | relier toutes les étapes |
| Appointment.id | retrouver la ressource source |
| Patient.id | vérifier le contexte si nécessaire |
| version FHIR | reproductibilité |
| version HL7 | reproductibilité |
| type message | ex. SIU |
| trigger event | ex. S12 |
| version des règles de mapping | expliquer le résultat |
| timestamp | dater la transformation |
| résultat | SUCCESS / WARNING / FAILED |
| warnings | pertes ou approximations |
| erreurs | causes d’échec |

Le contenu intégral du Patient ou de l’Appointment ne doit pas être dupliqué dans les logs sauf besoin explicitement justifié.

---

# **11\. Limites et pertes d’information**

Une transformation FHIR → HL7 v2 n’est **pas bijective**.

## **Participants multiples**

FHIR permet plusieurs participants de différents types dans `Appointment.participant`.

Ils doivent être répartis entre différents segments :

* personnel → AIP ;  
* lieu → AIL ;  
* service → AIS ;  
* autres participants → pas forcément représentables dans notre profil.

**Stratégie : mapping selon le type ; warning pour type non supporté.**

## **Plusieurs Coding**

FHIR `CodeableConcept` peut contenir plusieurs `Coding`.

Un champ CE HL7 v2 ne permet pas nécessairement de préserver toute cette richesse.

**Stratégie : sélectionner selon une règle explicite et tracer les codages omis.**

## **Extensions FHIR**

Les extensions peuvent contenir des informations sans équivalent HL7 v2 prévu.

**Stratégie : omission avec warning**, sauf extension explicitement prise en charge.

## **ReasonCode multiples**

Plusieurs motifs FHIR peuvent exister.

Le champ cible choisi peut ne pas préserver la répétition ou toute la sémantique.

**Stratégie : règle de sélection documentée ou omission avec warning.**

## **PractitionerRole**

FHIR permet de distinguer :

personne

rôle

organisation

spécialité

service

Un AIP simplifié peut ne pas préserver toutes ces dimensions.

**Stratégie : préserver l’identité principale ; tracer la perte des attributs non mappés.**

## **Commentaires et instructions**

`Appointment.comment` ou `patientInstruction` n’ont pas automatiquement vocation à être placés dans NTE.

**Stratégie : ne pas les exporter par défaut.**

NTE ne sera utilisé qu’après décision explicite sur la sémantique du contenu.

## **Historique**

Une ressource Appointment représente principalement un état courant, alors que SIU représente un événement.

La perte la plus importante peut donc être :

> **l’absence du contexte historique ayant conduit à cet état.**

Dans ce cas, aucun trigger historique ne doit être inventé.

---

# **12\. Règles normatives de transformation**

**R1 — Fidélité à la source :** une information absente dans FHIR ne doit jamais être inventée pour remplir un champ HL7 v2.

**R2 — Provenance :** toute information présente dans le message HL7 doit pouvoir être reliée à une donnée source ou à une métadonnée technique explicitement générée.

**R3 — Normalisation :** le moteur de mapping doit consommer un modèle métier normalisé et non interpréter directement les ressources FHIR de manière indépendante.

**R4 — État / événement :** un trigger event SIU ne doit pas être déduit automatiquement de `Appointment.status`.

**R5 — Contexte événementiel :** S12, S13, S14 ou S15 ne peuvent être sélectionnés que si le contexte métier correspondant est connu ou explicitement posé comme hypothèse de démonstration.

**R6 — Terminologie :** tout transcodage doit utiliser une table ou règle explicitement documentée.

**R7 — Codes locaux :** un code local sans mapping connu ne doit pas être converti arbitrairement en code standard.

**R8 — Coding :** `display` seul ne constitue pas un identifiant sémantique fiable ; `system` et `code` doivent être préservés lorsqu’ils existent.

**R9 — Références :** une référence facultative impossible à résoudre génère un warning et ne bloque pas automatiquement la transformation.

**R10 — Données obligatoires :** l’absence d’une donnée indispensable au profil local doit bloquer la génération du message.

**R11 — Identifiants :** un `Resource.id` ne doit pas être confondu automatiquement avec un identifiant métier.

**R12 — Message Control ID :** un identifiant technique du message peut être généré car il identifie la nouvelle instance de message.

**R13 — Dates :** le fuseau horaire et la précision doivent être préservés autant que possible.

**R14 — Durée :** aucune durée ne doit être inventée ; elle provient d’une donnée explicite ou d’un calcul fiable entre début et fin.

**R15 — Participants :** le type réel de participant détermine le traitement ; tous les participants ne sont pas des professionnels.

**R16 — Pertes :** toute perte sémantique significative doit être documentée ou signalée par un warning.

**R17 — Validation :** un message produit doit être validé syntaxiquement, structurellement et sémantiquement avant d’être présenté comme réussi.

**R18 — Résultat :** une transformation techniquement réussie ne signifie pas nécessairement une transformation sans perte.

**R19 — Logs :** la traçabilité doit minimiser les données patient.

**R20 — Reproductibilité :** la version FHIR, la version HL7 et la version des règles de mapping doivent être enregistrées pour chaque transformation.

---

# **13\. Hypothèses et points à valider**

| Point | Statut |
| ----- | ----- |
| HL7 v2.5.1 comme version cible | **À valider avec enseignant/supports de cours** |
| SIU comme famille de messages | Confirmé par la spécification scheduling |
| S12 pour le scénario « nouvelle réservation » | Confirmé si le contexte métier est explicitement posé |
| S13/S14/S15 | À utiliser uniquement avec événement connu |
| Rôle exact de `Appointment.identifier` comme placer ou filler ID | **À décider dans le profil local** |
| Usage de `SCH-25` pour Appointment.status | **Mapping terminologique à valider** |
| Table genre FHIR → HL7 Table 0001 | À valider comme table locale |
| `serviceType → AIS-3` | Pertinent, mais terminologie cible à définir |
| `Location → AIL-3` | Retenu si Location disponible |
| Practitioner vs PractitionerRole | Dépend des données du serveur |
| Usage de NTE | Non retenu par défaut |
| Usage de PV1 | Non retenu pour le MVP sauf besoin organisationnel ultérieur |
| Transport effectif du message HL7 | Le sujet demande une représentation/conversion ; aucun transport MLLP n’est imposé à ce stade |
| Profil HL7 local final | À figer après revue normative du deuxième prompt |

&nbsp;

&nbsp;

&nbsp;