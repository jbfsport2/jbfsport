const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateCategoryUrlsForScraping() {
    try {
        console.log('🔍 Récupération des catégories principales depuis MongoDB...');
        
        // Récupère seulement les catégories principales (pas les sous-catégories)
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                slug: true
            },
            orderBy: { order: 'asc' }
        });

        console.log(`✅ ${categories.length} catégories trouvées`);

        // Génère les URLs pour le scraping
        const scrapingUrls = categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            url: `https://www.casalsport.com/fr/cas/${category.slug}`,
            status: 'pending' // Pour tracker le statut du scraping
        }));

        // Crée l'objet final
        const scrapingData = {
            generated_at: new Date().toISOString(),
            total_categories: categories.length,
            scraping_urls: scrapingUrls
        };

        // Sauvegarde en JSON
        const fs = require('fs');
        fs.writeFileSync('category_scraping_urls.json', JSON.stringify(scrapingData, null, 2));
        
        console.log('\n📊 RÉSUMÉ DES URLs POUR SCRAPING:');
        console.log(`   Catégories: ${categories.length}`);
        
        console.log('\n💾 Fichier sauvegardé: category_scraping_urls.json');
        console.log('\n🔗 Exemples d\'URLs:');
        
        if (scrapingUrls.length > 0) {
            console.log(`   ${scrapingUrls[0].name}: ${scrapingUrls[0].url}`);
            if (scrapingUrls.length > 1) {
                console.log(`   ${scrapingUrls[1].name}: ${scrapingUrls[1].url}`);
            }
        }

        return scrapingData;

    } catch (error) {
        console.error('❌ Erreur lors de la génération des URLs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Lance le script
if (require.main === module) {
    generateCategoryUrlsForScraping()
        .then(() => {
            console.log('\n✅ Génération des URLs terminée avec succès!');
            console.log('🚀 Prêt pour le scraping des images et textes!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur:', error);
            process.exit(1);
        });
}

module.exports = { generateCategoryUrlsForScraping }; 