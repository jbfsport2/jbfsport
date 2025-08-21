const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateCategoryUrls() {
    try {
        console.log('🔍 Récupération des catégories depuis MongoDB...');
        
        // Récupère toutes les catégories avec leurs sous-catégories et sous-sous-catégories
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                subCategories: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        subSubCategories: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`✅ ${categories.length} catégories trouvées`);

        const categoryUrls = [];
        const subcategoryUrls = [];
        const subsubcategoryUrls = [];

        // Génère les URLs pour chaque niveau
        categories.forEach(category => {
            // URL de catégorie principale
            if (category.slug) {
                categoryUrls.push({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    url: `https://www.casalsport.com/fr/cas/${category.slug}`,
                    type: 'category'
                });
            }

            // URLs des sous-catégories
            if (category.subCategories) {
                category.subCategories.forEach(subcategory => {
                    if (subcategory.slug) {
                        subcategoryUrls.push({
                            id: subcategory.id,
                            name: subcategory.name,
                            slug: subcategory.slug,
                            parentCategory: category.name,
                            url: `https://www.casalsport.com/fr/cas/${subcategory.slug}`,
                            type: 'subcategory'
                        });
                    }

                    // URLs des sous-sous-catégories
                    if (subcategory.subSubCategories) {
                        subcategory.subSubCategories.forEach(subsubcategory => {
                            if (subsubcategory.slug) {
                                subsubcategoryUrls.push({
                                    id: subsubcategory.id,
                                    name: subsubcategory.name,
                                    slug: subsubcategory.slug,
                                    parentCategory: category.name,
                                    parentSubcategory: subcategory.name,
                                    url: `https://www.casalsport.com/fr/cas/${subsubcategory.slug}`,
                                    type: 'subsubcategory'
                                });
                            }
                        });
                    }
                });
            }
        });

        // Crée l'objet final avec toutes les URLs
        const allUrls = {
            generated_at: new Date().toISOString(),
            total_categories: categoryUrls.length,
            total_subcategories: subcategoryUrls.length,
            total_subsubcategories: subsubcategoryUrls.length,
            total_urls: categoryUrls.length + subcategoryUrls.length + subsubcategoryUrls.length,
            category_urls: categoryUrls,
            subcategory_urls: subcategoryUrls,
            subsubcategory_urls: subsubcategoryUrls,
            // URLs plates pour le scraper Python
            flat_urls: [
                ...categoryUrls.map(c => c.url),
                ...subcategoryUrls.map(s => s.url),
                ...subsubcategoryUrls.map(ss => ss.url)
            ]
        };

        // Sauvegarde en JSON
        const fs = require('fs');
        fs.writeFileSync('category_urls.json', JSON.stringify(allUrls, null, 2));
        
        console.log('\n📊 RÉSUMÉ DES URLs GÉNÉRÉES:');
        console.log(`   Catégories: ${categoryUrls.length}`);
        console.log(`   Sous-catégories: ${subcategoryUrls.length}`);
        console.log(`   Sous-sous-catégories: ${subsubcategoryUrls.length}`);
        console.log(`   Total URLs: ${allUrls.total_urls}`);
        
        console.log('\n💾 Fichier sauvegardé: category_urls.json');
        console.log('\n🔗 Exemples d\'URLs:');
        
        if (categoryUrls.length > 0) {
            console.log(`   Catégorie: ${categoryUrls[0].url}`);
        }
        if (subcategoryUrls.length > 0) {
            console.log(`   Sous-catégorie: ${subcategoryUrls[0].url}`);
        }
        if (subsubcategoryUrls.length > 0) {
            console.log(`   Sous-sous-catégorie: ${subsubcategoryUrls[0].url}`);
        }

        return allUrls;

    } catch (error) {
        console.error('❌ Erreur lors de la génération des URLs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Lance le script
if (require.main === module) {
    generateCategoryUrls()
        .then(() => {
            console.log('\n✅ Génération des URLs terminée avec succès!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur:', error);
            process.exit(1);
        });
}

module.exports = { generateCategoryUrls }; 