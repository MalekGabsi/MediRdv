# Contrat de représentation HL7

Version des règles : **medirdv-siu-1.0.0**. Source : **FHIR R4 4.0.1**. Cible de représentation : **HL7 v2.5.1**, `SIU^S12^SIU_S12`.

## Décisions locales du MVP

| Point ouvert du cahier des charges | Choix implémenté |
| --- | --- |
| Sous-version HL7 | 2.5.1, choix pédagogique à confirmer par l’enseignant. |
| Placer/filler | L’agenda source est considéré comme filler ; premier identifiant métier non ancien en SCH-2. |
| Événement | S12, scénario explicitement confirmé ; réservé aux rendez-vous `booked`. |
| État versus événement | Aucune déduction du trigger depuis le statut ; pas de reconstruction d’historique. |
| S13/S14/S15 | Options désactivées, contexte historique hors MVP. |
| Ressources multiples | Segments AIS/AIL/AIP répétés selon les données disponibles. |
| NTE/PV1 | Non produits. Descriptions et informations sans équivalent restent dans les sources avec avertissement. |
| Identifiants | Les valeurs métier sont conservées ; les ID FHIR n’en deviennent jamais des substituts. |
| Temps sans service | SCH-11 transporte début et fin même si AIS est absent. |
| Codages locaux | Conservation du système source dans CE.3 ; aucune conversion arbitraire vers un standard. |

## Portée de la validation

Il s’agit d’une **représentation pédagogique contrôlée selon un sous-ensemble local**, pas d’un message certifié conforme à toutes les obligations de SIU_S12. Le cahier des charges minimal ne fournit notamment pas systématiquement le contact filler de SCH-16, le type de ressource AIP-4 et les statuts de ressource AIS-10/AIL-12/AIP-12. Ces informations ne sont pas inventées. SCH-11, conservé pour compatibilité dans la version retenue, porte les horaires ; un contrat d’échange complet peut préférer TQ1.

L’interface annonce cette portée explicitement. Avant tout usage avec un destinataire réel, définir avec lui un profil complet, les autorités d’identifiants, les systèmes de codage acceptés et le contexte événementiel ; valider ensuite avec ses outils de conformité. `SUCCESS_WITH_WARNINGS` indique uniquement la réussite de la représentation locale avec pertes signalées.

## Structure produite

```text
MSH
SCH
PID
RGS
{AIS}
{AIL}
{AIP}
```

AIS, AIL et AIP sont facultatifs. L’ordre AIS → AIL → AIP suit l’organisation des groupes SIU_S12. Les segments se terminent par CR (`\r`), y compris le dernier. Les retours à la ligne affichés servent uniquement à la lisibilité. Le téléchargement et le presse-papier reçoivent la trame avec CR.

## Provenance des champs

| Champ | Source / règle |
| --- | --- |
| MSH-1/2 | Séparateurs fixes du standard. |
| MSH-3 | Nom technique configuré : MEDIRDV. |
| MSH-7 | Horloge applicative à la génération, UTC explicite. |
| MSH-9 | Scénario S12 confirmé par l’utilisateur. |
| MSH-10 | UUID technique généré ; distinct des identifiants métier. |
| MSH-11 | `P` demandé dans la consigne ; aucune transmission n’a lieu. |
| MSH-12/18 | Version 2.5.1, encodage UNICODE UTF-8. |
| SCH-2 | Premier Appointment.identifier non ancien ; valeur en EI.1, system en EI.2 selon convention locale. |
| SCH-6 | `NEW^Notification de nouvelle réservation^99MEDIRDV` : code explicitement local du scénario. |
| SCH-7 | Premier reasonCode ; sélection du premier Coding avec system et code. |
| SCH-8 | appointmentType, distinct de serviceType. |
| SCH-11 | TQ.4 = début, TQ.5 = fin, fuseau conservé. |
| SCH-25 | Appointment.status via table locale décrite ci-dessous. |
| PID-1 | Index local du patient sélectionné : 1. |
| PID-3 | Patient.identifier non anciens répétés en CX ; system en CX.4.1 selon convention locale. |
| PID-5 | Noms structurés répétés en XPN : famille, premier prénom, autres prénoms, suffixe, préfixe. |
| PID-7 | birthDate avec sa précision initiale : année, mois ou jour. |
| PID-8 | Table locale de genre administratif. |
| RGS-1 | Index du groupe du rendez-vous : 1. |
| AIS-1/3/4 | Index, serviceType ou HealthcareService.type directement participant, début du rendez-vous. |
| AIS-7/8 | Durée explicite ou calcul fiable ; unité `min^minute^UCUM`. |
| AIL-1/3/6 | Index, Location : description en PL.9, identifiants métier en PL.10 EI ; début du participant ou du rendez-vous. |
| AIP-1/3/6 | Index, Practitioner : premier identifiant non ancien et nom structuré en XCN ; début du participant ou du rendez-vous. |

Un système FHIR en namespace EI/HD ou en CE.3 est une **convention du prototype**, à négocier avec un récepteur. Il n’est pas remplacé par une autorité OID ou un code HL7 imaginé. Les champs d’adresse, de chambre, de lit ou d’établissement ne sont jamais déduits d’un nom libre de Location.

## Transcodages

Les valeurs cibles ci-dessous existent dans les tables HL7 correspondantes. Le choix de correspondance reste une règle locale du projet.

| FHIR AdministrativeGender | HL7 Administrative Sex, table 0001 |
| --- | --- |
| male | M |
| female | F |
| other | O |
| unknown | U |

Une valeur absente reste absente. Une valeur inconnue échoue. La différence sémantique entre genre administratif et Administrative Sex est signalée.

| FHIR Appointment.status | SCH-25, table 0278 |
| --- | --- |
| pending | Pending |
| booked | Booked |
| fulfilled | Complete |
| cancelled | Cancelled |
| waitlist | Waitlist |

Les autres statuts n’ont pas de correspondance retenue. En particulier, `arrived` et `checked-in` ne prouvent pas que l’activité a commencé ; `noshow` n’est pas une annulation. Le parcours S12 actuel n’accepte que `booked`, donc seule la correspondance Booked est produite dans ce scénario.

Les systèmes source sont `http://hl7.org/fhir/administrative-gender` et `http://hl7.org/fhir/appointmentstatus`. Les codes de service conservent leur couple system/code. Un concept sans ce couple ne peut produire qu’un texte en CE.2, accompagné d’un avertissement.

## Dates et durée

`2026-09-18T10:00:00+02:00` devient `20260918100000+0200`. Un `Z` devient `+0000`. Les fractions sont préservées jusqu’à quatre chiffres. Une précision supérieure, un instant sans fuseau ou une seconde intercalaire non prise en charge entraînent un refus explicite, sans troncature.

Le calendrier est contrôlé, dont les années bissextiles. L’ordre des dates et les durées sont calculés à une résolution de 0,1 ms pour préserver les quatre décimales prises en charge. `minutesDuration` a priorité sur l’intervalle début-fin : FHIR permet une durée d’activité différente de la plage réservée. La différence produit un avertissement.

## Données absentes et pertes

- Identifiant patient, identifiant rendez-vous, nom structuré, dates, rattachement ou contexte S12 absent : refus.
- Professionnel non résolu : AIP omis, avertissement. Un professionnel résolu sans identifiant peut être représenté par son nom structuré uniquement.
- Lieu sans identifiant métier : AIL omis, avertissement ; aucun ID de chambre inventé.
- Aucun service représentable : AIS omis ; horaires conservés dans SCH-11.
- Plusieurs codages ou motifs : stratégie de sélection explicite et avertissement.
- PractitionerRole : professionnel résolu, organisation consultable ; sémantique de rôle plus riche signalée comme perte.
- Extensions ordinaires : omission avec avertissement. ModifierExtension ou implicitRules non interprétés : refus.
- Statuts de participation, fins des périodes individuelles, usages/périodes des noms et informations hors contrat : pertes signalées.
- Participants ayant décliné : omis des ressources planifiées, avec avertissement.

L’échappement remplace `| ^ ~ \\ &` par les séquences HL7 correspondantes et encode les caractères de contrôle. Aucune concaténation de texte source non échappé ne peut introduire un segment supplémentaire.

## Audit

Chaque champ produit possède un chemin source ou une règle explicite, une règle de transformation et sa valeur résultante. Ces valeurs ne figurent que dans la vue d’audit en mémoire. L’export d’audit inclut corrélation, identifiants des ressources, versions, horodatage, scénario confirmé, résultat, avertissements et erreurs ; il n’exporte pas les valeurs patient ni la trame complète.

Références : [HL7 v2.5.1 chapitre 10](https://www.hl7.eu/HL7v2x/v251/std251/ch10.html), [table 0001 / PID](https://www.hl7.eu/HL7v2x/v251/std251/ch03.html), [types v2.5.1](https://www.hl7.eu/HL7v2x/v251/std251/ch02a.html). Les sources fournissent les définitions des champs ; les choix d’alignement et limites ci-dessus sont ceux du prototype.
