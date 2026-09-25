# LMPHARMA — Netlify + Decap CMS

## Déploiement
1. Créez un dépôt Git (GitHub/GitLab/Bitbucket) et envoyez ce projet.
2. Importez le dépôt dans Netlify.
3. Dans Netlify, activez **Identity** puis **Git Gateway** si vous utilisez le backend `git-gateway`.
4. Ouvrez `/admin/` pour accéder au CMS.
5. Modifiez `assets/js/app.js` et remplacez `waNumber` par votre numéro WhatsApp au format international sans `+`.

## Produits
Le CMS enregistre les produits dans `content/products/`. Le site statique fourni contient aussi un petit catalogue de démonstration dans `assets/js/app.js`.

Pour un vrai catalogue piloté automatiquement par Decap CMS, une étape de build (ou génération JSON) est recommandée. Cette version sert de base immédiatement déployable.

## Formulaire
Le formulaire de contact utilise Netlify Forms (`data-netlify="true"`).

## Important
- Vérifiez les exigences légales applicables aux produits de santé/parapharmacie et à la vente en ligne avant mise en production.
- Remplacez les textes juridiques modèles par vos mentions réelles.
- Remplacez le numéro WhatsApp de démonstration.
