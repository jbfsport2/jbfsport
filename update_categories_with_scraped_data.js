const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function updateCategoriesWithScrapedData() {
    try {
        console.log('📥 Début de la mise à jour des catégories avec les données scrapées...');
        
        // Vérifie si le fichier existe
        if (!fs.existsSync('category_scraping_results.json')) {
            throw new Error('❌ Fichier category_scraping_results.json non trouvé!');
        }
        
        // Lit le fichier JSON
        const jsonData = fs.readFileSync('category_scraping_results.json', 'utf8');
        const data = JSON.parse(jsonData);
        
        const results = data.results || [];
        console.log(`📊 ${results.length} résultats de scraping trouvés`);
        
        if (results.length === 0) {
            console.log('⚠️ Aucun résultat à traiter');
            return;
        }
        
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        
        // Traite chaque résultat
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            
            try {
                console.log(`\n🔄 Traitement ${i + 1}/${results.length}: ${result.category_name}`);
                
                if (result.status !== 'success') {
                    console.log(`   ⚠️ Statut non réussi: ${result.status}`);
                    if (result.error) {
                        console.log(`   Erreur: ${result.error}`);
                    }
                    skippedCount++;
                    continue;
                }
                
                // Vérifie si la catégorie existe dans la DB
                const existingCategory = await prisma.category.findFirst({
                    where: {
                        name: result.category_name
                    }
                });
                
                if (!existingCategory) {
                    console.log(`   ❌ Catégorie non trouvée dans la DB: ${result.category_name}`);
                    errorCount++;
                    continue;
                }
                
                // Prépare les données de mise à jour
                const updateData = {};
                
                if (result.hero_image) {
                    updateData.imageUrl = result.hero_image;
                    console.log(`   🖼️ Image hero: ${result.hero_image}`);
                }
                
                if (result.seo_text) {
                    updateData.categoryText = result.seo_text;
                    console.log(`   📝 Texte SEO: ${result.seo_text.length} caractères`);
                }
                
                // Met à jour la catégorie si on a des données
                if (Object.keys(updateData).length > 0) {
                    const updatedCategory = await prisma.category.update({
                        where: {
                            id: existingCategory.id
                        },
                        data: updateData
                    });
                    
                    console.log(`   ✅ Catégorie mise à jour: ${updatedCategory.name}`);
                    updatedCount++;
                } else {
                    console.log(`   ⚠️ Aucune donnée à mettre à jour pour: ${result.category_name}`);
                    skippedCount++;
                }
                
                // Affiche la progression
                if ((i + 1) % 10 === 0) {
                    console.log(`\n📊 Progression: ${i + 1}/${results.length} catégories traitées`);
                }
                
            } catch (error) {
                console.error(`   ❌ Erreur lors de la mise à jour de "${result.category_name}":`, error.message);
                errorCount++;
            }
        }
        
        // Résumé final
        console.log('\n' + '='.repeat(60));
        console.log('📋 RÉSUMÉ DE LA MISE À JOUR');
        console.log('='.repeat(60));
        console.log(`✅ Catégories mises à jour: ${updatedCount}`);
        console.log(`⚠️ Catégories ignorées: ${skippedCount}`);
        console.log(`❌ Erreurs: ${errorCount}`);
        console.log(`📊 Total traité: ${results.length}`);
        console.log('='.repeat(60));
        
        if (updatedCount > 0) {
            console.log('\n🎉 Mise à jour terminée avec succès!');
            console.log('💾 Les catégories sont maintenant enrichies dans votre base MongoDB');
            
            // Affiche un aperçu des catégories mises à jour
            console.log('\n📋 CATÉGORIES MISES À JOUR:');
            const successfulResults = results.filter(r => r.status === 'success' && (r.hero_image || r.seo_text));
            for (let i = 0; i < Math.min(5, successfulResults.length); i++) {
                const result = successfulResults[i];
                console.log(`   ${i + 1}. ${result.category_name}`);
                if (result.hero_image) console.log(`      🖼️ Image: ${result.hero_image.substring(0, 50)}...`);
                if (result.seo_text) console.log(`      📝 Texte: ${result.seo_text.length} caractères`);
            }
            if (successfulResults.length > 5) {
                console.log(`   ... et ${successfulResults.length - 5} autres catégories`);
            }
        }
        
        return {
            updated: updatedCount,
            skipped: skippedCount,
            errors: errorCount,
            total: results.length
        };
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Fonction pour afficher les statistiques des données scrapées
async function showScrapingStats() {
    try {
        if (!fs.existsSync('category_scraping_results.json')) {
            console.log('❌ Fichier category_scraping_results.json non trouvé');
            return;
        }
        
        const jsonData = fs.readFileSync('category_scraping_results.json', 'utf8');
        const data = JSON.parse(jsonData);
        
        const results = data.results || [];
        const successful = results.filter(r => r.status === 'success');
        const failed = results.filter(r => r.status === 'error');
        
        console.log('\n📊 STATISTIQUES DES DONNÉES SCRAPÉES:');
        console.log('='.repeat(50));
        console.log(`Total résultats: ${results.length}`);
        console.log(`Scraping réussis: ${successful.length}`);
        console.log(`Scraping échoués: ${failed.length}`);
        
        if (successful.length > 0) {
            const withImage = successful.filter(r => r.hero_image).length;
            const withText = successful.filter(r => r.seo_text).length;
            console.log(`\n✅ Données extraites:`);
            console.log(`   Images hero: ${withImage}`);
            console.log(`   Textes SEO: ${withText}`);
        }
        
        if (failed.length > 0) {
            console.log(`\n❌ Échecs:`);
            failed.slice(0, 3).forEach(result => {
                console.log(`   - ${result.category_name}: ${result.error || 'Erreur inconnue'}`);
            });
            if (failed.length > 3) {
                console.log(`   ... et ${failed.length - 3} autres échecs`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la lecture des statistiques:', error);
    }
}

// Lance le script
if (require.main === module) {
    // Affiche d'abord les statistiques
    showScrapingStats().then(() => {
        // Puis lance la mise à jour
        return updateCategoriesWithScrapedData();
    }).then(() => {
        console.log('\n✅ Mise à jour terminée!');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
}

module.exports = { updateCategoriesWithScrapedData, showScrapingStats }; 