#!/usr/bin/env node

/**
 * Script pour mettre automatiquement les 4 premiers produits de chaque catégorie
 * avec isProductCategorySelected: true
 * 
 * Usage: node scripts/setFeaturedProducts.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setFeaturedProducts() {
  try {
    console.log('🚀 Démarrage du script de mise en avant des produits...');
    
    // Récupère toutes les catégories principales
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 4 // Prend les 4 premiers produits
            },
            subSubCategories: {
              where: { isActive: true },
              include: {
                products: {
                  where: { isActive: true },
                  orderBy: { createdAt: 'desc' },
                  take: 4 // Prend les 4 premiers produits
                }
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    console.log(`📊 ${categories.length} catégories trouvées`);

    let totalProductsUpdated = 0;
    let totalProductsProcessed = 0;

    for (const category of categories) {
      console.log(`\n🏷️  Catégorie: ${category.name}`);
      
      // Traite les sous-catégories directes
      for (const subCategory of category.subCategories) {
        console.log(`  📁 Sous-catégorie: ${subCategory.name}`);
        
        // Met en avant les 4 premiers produits de la sous-catégorie
        for (const product of subCategory.products) {
          totalProductsProcessed++;
          if (!product.isProductCategorySelected) {
            await prisma.product.update({
              where: { id: product.id },
              data: { isProductCategorySelected: true }
            });
            totalProductsUpdated++;
            console.log(`    ✅ Produit mis en avant: ${product.name}`);
          } else {
            console.log(`    ℹ️  Déjà en avant: ${product.name}`);
          }
        }

        // Traite les sous-sous-catégories
        for (const subSubCategory of subCategory.subSubCategories) {
          console.log(`    📂 Sous-sous-catégorie: ${subSubCategory.name}`);
          
          // Met en avant les 4 premiers produits de la sous-sous-catégorie
          for (const product of subSubCategory.products) {
            totalProductsProcessed++;
            if (!product.isProductCategorySelected) {
              await prisma.product.update({
                where: { id: product.id },
                data: { isProductCategorySelected: true }
              });
              totalProductsUpdated++;
              console.log(`      ✅ Produit mis en avant: ${product.name}`);
            } else {
              console.log(`      ℹ️  Déjà en avant: ${product.name}`);
            }
          }
        }
      }
    }

    console.log(`\n🎉 Script terminé avec succès !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Produits traités: ${totalProductsProcessed}`);
    console.log(`   - Produits mis en avant: ${totalProductsUpdated}`);
    console.log(`   - Produits déjà en avant: ${totalProductsProcessed - totalProductsUpdated}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécute le script
setFeaturedProducts()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }); 