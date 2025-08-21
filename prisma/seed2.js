const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding des sous-sous-catégories...');

  try {
    // Récupérer les catégories et sous-catégories existantes
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true
      }
    });

    // Données des sous-sous-catégories à ajouter
    const subSubCategoriesData = [
      {
        categoryName: "Aménagement intérieur - Gymnases et locaux",
        subCategoryName: "Mobilier Vestiaires et Gymnases",
        subSubCategories: [
          "Bancs Vestiaire et Patères",
          "Vestiaires Multicases",
          "Casiers vestiaires et vestiaires sport",
          "Accessoires Vestiaires",
          "Cadenas, antivols"
        ]
      },
      {
        categoryName: "Aménagement intérieur - Gymnases et locaux",
        subCategoryName: "Affichage",
        subSubCategories: [
          "Vitrines d'affichage",
          "Panneaux liège, tableaux blancs",
          "Accessoires Tableaux, Vitrines"
        ]
      },
      {
        categoryName: "Aménagement intérieur - Gymnases et locaux",
        subCategoryName: "Mobilier de Bureau",
        subSubCategories: [
          "Bureaux",
          "Tables de réunion",
          "Chaises de bureau",
          "Coffre-fort, Lampes, Porte manteaux, Horloges",
          "Armoires, Caissons de bureau"
        ]
      },
      {
        categoryName: "Aménagement intérieur - Gymnases et locaux",
        subCategoryName: "Electroménager, Restauration",
        subSubCategories: [
          "Mobilier de restauration",
          "Arts de la table"
        ]
      },
      {
        categoryName: "Aménagement extérieur - Stades, Aires de jeux",
        subCategoryName: "Traçage et délimitation de terrain",
        subSubCategories: [
          "Délimitation de terrain",
          "Peintures pour gazon",
          "Traceuses pour gazon"
        ]
      },
      {
        categoryName: "Aménagement extérieur - Stades, Aires de jeux",
        subCategoryName: "Aires de jeux extérieures",
        subSubCategories: [
          "Trampolines Extérieurs",
          "Dalles amortissantes Jeux extérieurs",
          "Jeux sur ressort",
          "Balançoires",
          "Cabanes",
          "Jeux de grimpe, filets",
          "Panneaux d'informations",
          "Structures de jeux enfants",
          "Jeux rotatifs, équilibre",
          "Bacs à sable",
          "Toboggans"
        ]
      },
      {
        categoryName: "Aménagement extérieur - Stades, Aires de jeux",
        subCategoryName: "Parcours sportif",
        subSubCategories: [
          "Matériel de Street Workout",
          "Matériel pour parcours du combattant",
          "Matériel pour parcours de Ninja",
          "Parcours de Santé"
        ]
      },
      {
        categoryName: "Aménagement extérieur - Stades, Aires de jeux",
        subCategoryName: "Mobilier urbain",
        subSubCategories: [
          "Bancs d'extérieur",
          "Tables extérieures"
        ]
      },
      {
        categoryName: "Aménagement extérieur - Stades, Aires de jeux",
        subCategoryName: "Propreté des espaces extérieurs",
        subSubCategories: [
          "Abris Fumeurs",
          "Cendriers extérieurs",
          "Poubelles extérieures",
          "Bennes, Conteneurs",
          "Poubelles de tri extérieures",
          "Accessoires Poubelles extérieures"
        ]
      }
    ];

    // Traiter chaque groupe de sous-sous-catégories
    for (const data of subSubCategoriesData) {
      console.log(`\n📁 Traitement de ${data.categoryName} > ${data.subCategoryName}...`);
      
      // Trouver la catégorie
      const category = categories.find(cat => cat.name === data.categoryName);
      if (!category) {
        console.log(`❌ Catégorie "${data.categoryName}" non trouvée`);
        continue;
      }

      // Trouver la sous-catégorie
      const subCategory = category.subCategories.find(sub => sub.name === data.subCategoryName);
      if (!subCategory) {
        console.log(`❌ Sous-catégorie "${data.subCategoryName}" non trouvée`);
        continue;
      }

      console.log(`✅ Sous-catégorie trouvée: ${subCategory.name}`);

      // Ajouter les sous-sous-catégories
      for (const subSubCategoryName of data.subSubCategories) {
        // Vérifier si la sous-sous-catégorie existe déjà
        const existingSubSubCategory = await prisma.subSubCategory.findFirst({
          where: {
            name: subSubCategoryName,
            subCategoryId: subCategory.id
          }
        });

        if (existingSubSubCategory) {
          console.log(`⏭️  Sous-sous-catégorie "${subSubCategoryName}" existe déjà, ignorée`);
        } else {
          // Créer la sous-sous-catégorie
          const newSubSubCategory = await prisma.subSubCategory.create({
            data: {
              name: subSubCategoryName,
              slug: subSubCategoryName.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-'),
              description: `Sous-sous-catégorie: ${subSubCategoryName}`,
              order: 0,
              isActive: true,
              subCategoryId: subCategory.id
            }
          });
          console.log(`✅ Sous-sous-catégorie créée: ${newSubSubCategory.name}`);
        }
      }
    }

    console.log('\n🎉 Seeding des sous-sous-catégories terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 