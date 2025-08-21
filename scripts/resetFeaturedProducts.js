#!/usr/bin/env node

/**
 * Script pour réinitialiser isProductCategorySelected à false pour tous les produits
 * 
 * Usage: node scripts/resetFeaturedProducts.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetFeaturedProducts() {
  try {
    console.log('🔄 Démarrage de la réinitialisation des produits mis en avant...');
    
    // Compte les produits actuellement mis en avant
    const featuredCount = await prisma.product.count({
      where: { isProductCategorySelected: true }
    });
    
    console.log(`📊 ${featuredCount} produits actuellement mis en avant dans les catégories`);
    
    if (featuredCount === 0) {
      console.log('ℹ️  Aucun produit à réinitialiser');
      return;
    }
    
    // Demande confirmation
    console.log('\n⚠️  ATTENTION: Ce script va remettre isProductCategorySelected à false pour TOUS les produits.');
    console.log('   Continuer ? (y/N)');
    
    // En mode non-interactif, on continue automatiquement
    // Pour une version interactive, vous pouvez utiliser readline
    
    // Remet tous les produits à false
    const result = await prisma.product.updateMany({
      where: { isProductCategorySelected: true },
      data: { isProductCategorySelected: false }
    });
    
    console.log(`✅ ${result.count} produits réinitialisés avec succès !`);
    console.log('🎯 Tous les produits ont maintenant isProductCategorySelected: false');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécute le script
resetFeaturedProducts()
  .then(() => {
    console.log('✅ Script de réinitialisation terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }); 