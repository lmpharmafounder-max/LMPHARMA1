# LMPHARMA — Netlify Store + Admin

## Déploiement
1. Créez un dépôt Git (GitHub/GitLab/Bitbucket) et envoyez ce projet.
2. Importez le dépôt dans Netlify.
3. Dans Netlify Identity, invitez le premier administrateur et attribuez-lui le rôle `admin`.
4. Ouvrez `/admin/` pour accéder au tableau de bord.
5. Modifiez `assets/js/app.js` et remplacez `waNumber` par votre numéro WhatsApp au format international sans `+`.

## Administration
Les produits, catégories, commandes, clients et paramètres sont stockés dans Netlify Database. Les images produit sont conservées dans Netlify Blobs. Les routes d'administration sont protégées par Netlify Identity et le rôle `admin`.

## Formulaire
Le formulaire de contact utilise Netlify Forms (`data-netlify="true"`).

## Important
- Vérifiez les exigences légales applicables aux produits de santé/parapharmacie et à la vente en ligne avant mise en production.
- Remplacez les textes juridiques modèles par vos mentions réelles.
- Remplacez le numéro WhatsApp de démonstration.
