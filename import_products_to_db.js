const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importProductsToDb() {
    try {
        console.log('📥 Début de l\'import des produits vers MongoDB...');
        
        // Vérifie si le fichier existe
        if (!fs.existsSync('products_realtime.json')) {
            throw new Error('❌ Fichier products_realtime.json non trouvé!');
        }
        
        // Lit le fichier JSON
        const jsonData = fs.readFileSync('products_realtime.json', 'utf8');
        const data = JSON.parse(jsonData);
        
        const products = data.products || [];
        console.log(`📊 ${products.length} produits trouvés dans le fichier JSON`);
        
        if (products.length === 0) {
            console.log('⚠️ Aucun produit à importer');
            return;
        }
        
        let importedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        
        // Traite chaque produit
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            try {
                console.log(`\n🔄 Traitement du produit ${i + 1}/${products.length}: ${product.nom_produit}`);
                
                // Vérifie si le produit existe déjà (par nom)
                const existingProduct = await prisma.product.findFirst({
                    where: {
                        name: product.nom_produit
                    }
                });
                
                if (existingProduct) {
                    console.log(`   ⚠️ Produit déjà existant: ${product.nom_produit}`);
                    skippedCount++;
                    continue;
                }
                
                // Nettoie et convertit le prix
                let price = 0;
                let salePrice = null;
                
                if (product.prix && product.prix !== "Prix non disponible") {
                    // Extrait le prix numérique
                    const priceMatch = product.prix.match(/(\d+[,\d]*)/);
                    if (priceMatch) {
                        price = parseFloat(priceMatch[1].replace(',', '.'));
                    }
                }
                
                // Trouve ou crée la sous-catégorie
                let subCategoryId = null;
                if (product.subcategory && product.subcategory.trim()) {
                    let subCategory = await prisma.subCategory.findFirst({
                        where: {
                            name: {
                                contains: product.subcategory,
                                mode: 'insensitive'
                            }
                        }
                    });
                    
                    if (!subCategory) {
                        // Crée la sous-catégorie si elle n'existe pas
                        subCategory = await prisma.subCategory.create({
                            data: {
                                name: product.subcategory,
                                slug: product.subcategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                                description: `Sous-catégorie créée automatiquement pour: ${product.subcategory}`,
                                order: 0,
                                isActive: true,
                                categoryId: '000000000000000000000000' // ID temporaire, à ajuster selon votre structure
                            }
                        });
                        console.log(`   ✅ Sous-catégorie créée: ${product.subcategory}`);
                    }
                    subCategoryId = subCategory.id;
                }
                
                // Trouve ou crée la sous-sous-catégorie
                let subSubCategoryId = null;
                if (product.subsubcategory && product.subsubcategory.trim()) {
                    let subSubCategory = await prisma.subSubCategory.findFirst({
                        where: {
                            name: {
                                contains: product.subsubcategory,
                                mode: 'insensitive'
                            }
                        }
                    });
                    
                    if (!subSubCategory) {
                        // Crée la sous-sous-catégorie si elle n'existe pas
                        subSubCategory = await prisma.subSubCategory.create({
                            data: {
                                name: product.subsubcategory,
                                slug: product.subsubcategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                                description: `Sous-sous-catégorie créée automatiquement pour: ${product.subsubcategory}`,
                                order: 0,
                                isActive: true,
                                subCategoryId: subCategoryId || '000000000000000000000000' // ID temporaire si pas de sous-catégorie
                            }
                        });
                        console.log(`   ✅ Sous-sous-catégorie créée: ${product.subsubcategory}`);
                    }
                    subSubCategoryId = subSubCategory.id;
                }
                
                // Prépare les images
                const images = [];
                if (product.imageurl && product.imageurl !== "Image non disponible") {
                    images.push(product.imageurl);
                }
                
                // Crée le produit
                const newProduct = await prisma.product.create({
                    data: {
                        name: product.nom_produit,
                        description: product.largedesc !== "Description longue non disponible" ? product.largedesc : null,
                        shortDescription: product.shortdesc !== "Description courte non disponible" ? product.shortdesc : null,
                        sku: `CS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Génère un SKU unique
                        price: price,
                        salePrice: salePrice,
                        costPrice: null,
                        stock: 0, // Stock par défaut
                        minStock: 0,
                        weight: null,
                        dimensions: null,
                        images: images,
                        isActive: true,
                        isFeatured: false,
                        isOnSale: false,
                        tags: [],
                        specifications: {
                            source: 'scraper_casalsport',
                            original_price: product.prix,
                            subcategory: product.subcategory || null,
                            subsubcategory: product.subsubcategory || null
                        },
                        subCategoryId: subCategoryId,
                        subSubCategoryId: subSubCategoryId
                    }
                });
                
                console.log(`   ✅ Produit importé: ${newProduct.name} (ID: ${newProduct.id})`);
                importedCount++;
                
                // Affiche la progression
                if ((i + 1) % 10 === 0) {
                    console.log(`\n📊 Progression: ${i + 1}/${products.length} produits traités`);
                }
                
            } catch (error) {
                console.error(`   ❌ Erreur lors de l'import du produit "${product.nom_produit}":`, error.message);
                errorCount++;
            }
        }
        
        // Résumé final
        console.log('\n' + '='.repeat(60));
        console.log('📋 RÉSUMÉ DE L\'IMPORT');
        console.log('='.repeat(60));
        console.log(`✅ Produits importés avec succès: ${importedCount}`);
        console.log(`⚠️ Produits ignorés (déjà existants): ${skippedCount}`);
        console.log(`❌ Erreurs d'import: ${errorCount}`);
        console.log(`📊 Total traité: ${products.length}`);
        console.log('='.repeat(60));
        
        if (importedCount > 0) {
            console.log('\n🎉 Import terminé avec succès!');
            console.log('💾 Les produits sont maintenant dans votre base MongoDB');
        }
        
        return {
            imported: importedCount,
            skipped: skippedCount,
            errors: errorCount,
            total: products.length
        };
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Lance le script
if (require.main === module) {
    importProductsToDb()
        .then(() => {
            console.log('\n✅ Import terminé!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur:', error);
            process.exit(1);
        });
}

module.exports = { importProductsToDb }; 