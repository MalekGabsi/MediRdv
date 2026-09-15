# Compte rendu de recette

Réalisation et vérification : **15 septembre 2026**. Les résultats ci-dessous décrivent les exécutions réellement effectuées dans l’environnement de développement.

## Vérifications automatisées

| Contrôle | Résultat |
| --- | --- |
| `npm test` | 45 tests réussis : 27 mapping/dates, 18 client FHIR/références. |
| `npm run build` | Compilation TypeScript stricte et bundle Vite réussis. |
| `npm run test:e2e` | 3 tests exécutés et réussis : sélection explicite/sources/conversion/alignements ; absence de résultat et reprise réseau ; écran mobile. Deux tests supplémentaires (aucun rendez-vous, refus sans identifiant) ont ensuite été ajoutés ; leur lancement n’a pas été autorisé dans cette session. |
| `npm run test:live` | Succès avec données découvertes dynamiquement sur HAPI, sans écriture. |
| `node scripts/browser-live-check.mjs` | Parcours complet dans Chrome contre HAPI, CORS compris ; aucune erreur JavaScript ; absence de débordement à 390 px. |

Les fixtures ne sont jamais chargées par l’application. Le test navigateur réel et le script d’intégration utilisent uniquement les ressources effectivement retournées par HAPI.

## Preuve de l’appel réel

Exécution du 15/09/2026 à **14:37:39 UTC**, avant ajout d’un avertissement supplémentaire sur les pertes de participation :

```text
GET metadata: 200
GET Appointment: 200
GET Patient/{id}: 200
GET Appointment: 200
GET Patient: 200

FHIR : 4.0.1
HL7 : 2.5.1
Règles : medirdv-siu-1.0.0
Rendez-vous chargés pour le patient : 3
Résultat : SUCCESS_WITH_WARNINGS
Segments produits : 5
Champs avec provenance : 21
Alignements appliqués : 2
```

Une vérification navigateur ultérieure a généré la trame sur le même contrat avec **8 avertissements**. Les cinq segments correspondent à MSH/SCH/PID/RGS/AIP : le service et le lieu absents ne sont pas inventés. Les noms, dates de naissance et contenus de trame ne sont pas copiés dans ce compte rendu.

HAPI annonce FHIR 4.0.1, la recherche `Appointment.patient`, les recherches `Patient.name` et `Patient.identifier`, ainsi que `_include=Appointment:actor`. Les réponses à une origine navigateur autorisent CORS. Le serveur fournit des liens de pagination à la base `/baseR4` sans slash final ; un test de non-régression couvre ce cas.

## Critères du cahier des charges

| Critère | Couverture |
| --- | --- |
| CA-01 Patient connu | Recherche live par nom, lecture par ID et sélection explicite. |
| CA-02 Plusieurs patients | Test navigateur : deux résultats, aucun patient choisi automatiquement. |
| CA-03 Patient avec rendez-vous | HAPI réel : trois rendez-vous récupérés et détail sélectionné. |
| CA-04 Aucun rendez-vous | Bundle vide traité comme liste vide ; test navigateur dédié ajouté, non exécuté. |
| CA-05 Rendez-vous complet | Fixtures complètes, positions des champs et ordre des sept segments vérifiés. |
| CA-06 Donnée facultative absente | Suppression service, lieu, professionnel, genre et naissance : succès avec avertissements. |
| CA-07 Professionnel absent | Référence non résolue : AIP absent, pas d’identité inventée. |
| CA-08 Source indisponible | HTTP, OperationOutcome, réseau, timeout et bouton Réessayer. |
| CA-09 Détail correspondant | Sélection explicite du rendez-vous puis inspection du JSON source. |
| CA-10 Conversion valide | Test unitaire, intégration HAPI et navigateur réel. |
| CA-11 Donnée obligatoire absente | FAILED et trame vide : tests de mapping réussis ; test navigateur dédié ajouté, non exécuté. |

## Autres cas vérifiés

- Fuseaux source, naissance partielle, bissextile, instant invalide, précision excessive et ordre submilliseconde.
- Identifiants techniques jamais utilisés comme identifiants métier.
- Aucun trigger reconstruit depuis booked ; refus de l’état incompatible.
- Codage local conservé ; display seul conservé comme texte, sans code inventé.
- Durée explicite différente de la plage horaire.
- Échappement des séparateurs et tentative d’injection de segment.
- Références de même ID sur un autre serveur, versions historiques, ressources contenues et PractitionerRole.
- Aucune valeur patient ou critère de recherche dans les traces techniques et l’export d’audit.

## Limites de la recette

La réussite ne constitue pas une certification de conformité HL7 v2 complète ou de profils FHIR. Aucun test de charge, contrôle d’accès hospitalier ou transport MLLP n’est annoncé. HAPI étant public et purgeable, les nombres et ressources disponibles peuvent évoluer ; les scripts de test live ne supposent aucun identifiant permanent.
