# Prompts individuels :

## **3\. Conversion HL7, terminologies et traçabilité**

### **Sous-prompt 3.1 — Contrat de conversion et segments principaux**

Tu es ingénieur spécialisé dans HL7 v2.5.1.

À partir du modèle normalisé du projet, définis le contrat de représentation pédagogique SIU^S12^SIU_S12 et implémente hl7Mapper.ts.

Exige une confirmation explicite du scénario de nouvelle réservation et vérifie les données obligatoires : rattachement patient, identifiants métier, identité structurée et dates compatibles.

Construis les segments MSH, SCH, PID et RGS.

Ajoute la conversion des dates avec conservation du fuseau, l’échappement des séparateurs et la terminaison CR.

Associe chaque champ produit à une source ou une règle. En cas d’échec, retourne FAILED et une trame vide.

### **Sous-prompt 3.2 — Enrichissement et alignements terminologiques**

Complète le moteur de conversion développé précédemment.

Ajoute les segments facultatifs AIS, AIL et AIP pour les services, lieux et professionnels représentables. Respecte leur ordre et les répétitions nécessaires.

Implémente les tables explicites de transcodage du genre administratif et du statut. Conserve les codes locaux avec leur système source.

Signale les données absentes, les références non résolues et les pertes liées aux codages multiples.

Ajoute hl7Validator.ts pour contrôler la structure, les champs exigés et les contraintes du profil local.

Retourne SUCCESS, SUCCESS_WITH_WARNINGS ou FAILED et teste les conversions, les omissions et les refus.

### **Sous-prompt 3.3 — Prévisualisation, audit et restitution**

Intègre le moteur de conversion et les alignements réalisés précédemment dans l’interface.

Développe HL7Preview avec confirmation du scénario S12, génération explicite, affichage des segments, résultat de validation, copie et téléchargement.

Ajoute la vue code source → code cible avec les systèmes terminologiques et les règles appliquées.

Présente l’audit : corrélation, ressources concernées, versions, horodatage, avertissements, erreurs et provenance des champs.

Prévois un export d’audit minimisant les données personnelles.

Vérifie le parcours complet depuis le rendez-vous sélectionné jusqu’au message. Documente les règles de mapping, les pertes et la portée exacte de la validation pédagogique.
