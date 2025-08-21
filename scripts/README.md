# Scripts de Gestion des Produits Mis en Avant

Ce dossier contient des scripts pour automatiser la gestion des produits mis en avant dans les catégories.

## 📁 Fichiers

### `setFeaturedProducts.js`
**Objectif** : Met automatiquement les 4 premiers produits de chaque catégorie avec `isProductCategorySelected: true`

**Fonctionnement** :
- Parcourt toutes les catégories actives
- Pour chaque sous-catégorie : met en avant les 4 premiers produits
- Pour chaque sous-sous-catégorie : met en avant les 4 premiers produits
- Évite les doublons (ne modifie pas les produits déjà en avant)

**Usage** :
```bash
node scripts/setFeaturedProducts.js
```

### `resetFeaturedProducts.js`
**Objectif** : Remet tous les produits avec `isProductCategorySelected: false`

**Fonctionnement** :
- Compte les produits actuellement mis en avant
- Remet tous les produits à `isProductCategorySelected: false`
- Utile pour repartir de zéro

**Usage** :
```bash
node scripts/resetFeaturedProducts.js
```

## 🚀 Utilisation Recommandée

### 1. Première configuration
```bash
# Met en avant les 4 premiers produits de chaque catégorie
node scripts/setFeaturedProducts.js
```

### 2. Réinitialisation (si besoin)
```bash
# Remet tout à zéro
node scripts/resetFeaturedProducts.js

# Puis remet en avant
node scripts/setFeaturedProducts.js
```

### 3. Vérification
- Allez dans `/admin/products`
- Vérifiez que les boutons carrés sont bien en `☑️` (violet) pour les produits mis en avant
- Vérifiez les badges "Mis en avant (catégorie)" dans la colonne des statuts

## 📊 Logs

Les scripts affichent des logs détaillés :
- 🏷️ Catégories traitées
- 📁 Sous-catégories traitées  
- 📂 Sous-sous-catégories traitées
- ✅ Produits mis en avant
- ℹ️ Produits déjà en avant
- 📊 Résumé final

## ⚠️ Précautions

- **Sauvegarde** : Faites une sauvegarde de votre base de données avant d'exécuter
- **Test** : Testez d'abord sur un environnement de développement
- **Vérification** : Vérifiez les résultats dans l'admin après exécution

## 🔧 Personnalisation

Pour modifier le nombre de produits mis en avant par catégorie, changez la valeur `take: 4` dans `setFeaturedProducts.js`.

## 📝 Notes

- Les scripts ne traitent que les produits actifs (`isActive: true`)
- Les scripts respectent l'ordre des catégories (`order: 'asc'`)
- Les produits sont triés par date de création (`createdAt: 'desc'`) 