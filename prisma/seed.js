const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Création des catégories principales
  const categories = [
    {
      name: "Aménagement intérieur - Gymnases et locaux",
      slug: "amenagement-interieur-gymnases-locaux",
      description: "Équipements et aménagements pour les gymnases et locaux sportifs intérieurs",
      order: 1,
      subCategories: [
        { name: "Marquage au sol Gymnases", slug: "marquage-sol-gymnases", order: 1 },
        { name: "Mobilier Vestiaires et Gymnases", slug: "mobilier-vestiaires-gymnases", order: 2 },
        { name: "Affichage", slug: "affichage", order: 3 },
        { name: "Mobilier de Bureau", slug: "mobilier-bureau", order: 4 },
        { name: "Electroménager, Restauration", slug: "electromenager-restauration", order: 5 },
        { name: "Revêtements de sols Intérieurs", slug: "revetements-sols-interieurs", order: 6 },
        { name: "Mâts, Cordes à grimper", slug: "mats-cordes-grimper", order: 7 },
        { name: "Espaliers", slug: "espaliers", order: 8 },
        { name: "Gradins, Tribunes", slug: "gradins-tribunes", order: 9 },
        { name: "Bancs de gymnase", slug: "bancs-gymnase", order: 10 },
        { name: "Tables de marque", slug: "tables-marque", order: 11 },
        { name: "Séparations de salle", slug: "separations-salle", order: 12 },
        { name: "Tableaux d'affichage, Scores", slug: "tableaux-affichage-scores", order: 13 },
        { name: "Fixations et équipements en hauteur", slug: "fixations-equipements-hauteur", order: 14 },
        { name: "Fontaines à eau", slug: "fontaines-eau", order: 15 }
      ]
    },
    {
      name: "Aménagement extérieur - Stades, Aires de jeux",
      slug: "amenagement-exterieur-stades-aires-jeux",
      description: "Équipements et aménagements pour les stades et aires de jeux extérieurs",
      order: 2,
      subCategories: [
        { name: "Revêtements de sol extérieur", slug: "revetements-sol-exterieur", order: 1 },
        { name: "Buts multisports", slug: "buts-multisports", order: 2 },
        { name: "Abris de touche", slug: "abris-touche", order: 3 },
        { name: "Pare-ballons", slug: "pare-ballons", order: 4 },
        { name: "Accès infrastructures", slug: "acces-infrastructures", order: 5 },
        { name: "Brosses à chaussures", slug: "brosses-chaussures", order: 6 },
        { name: "Traçage et délimitation de terrain", slug: "tracage-delimitation-terrain", order: 7 },
        { name: "Aires de jeux exterieur", slug: "aires-jeux-exterieur", order: 8 },
        { name: "Parcours sportif", slug: "parcours-sportif", order: 9 },
        { name: "Stations de Fitness et Musculation extérieures", slug: "stations-fitness-musculation-exterieures", order: 10 },
        { name: "Mobilier urbain", slug: "mobilier-urbain", order: 11 },
        { name: "Propreté des espaces extérieurs", slug: "proprete-espaces-exterieurs", order: 12 }
      ]
    },
    {
      name: "Equipement multisport",
      slug: "equipement-multisport",
      description: "Équipements polyvalents pour tous types de sports",
      order: 3,
      subCategories: [
        { name: "Matériel Entraînement sportif", slug: "materiel-entrainement-sportif", order: 1 },
        { name: "Arbitrage, Coaching", slug: "arbitrage-coaching", order: 2 },
        { name: "Récompenses sportives", slug: "recompenses-sportives", order: 3 },
        { name: "Transport et Rangement", slug: "transport-rangement", order: 4 },
        { name: "Gonflage et entretien des ballons", slug: "gonflage-entretien-ballons", order: 5 },
        { name: "Pharmacie du sportif", slug: "pharmacie-sportif", order: 6 },
        { name: "Organisation événement sportif", slug: "organisation-evenement-sportif", order: 7 },
        { name: "EPI, Hygiène & Aménagement", slug: "epi-hygiene-amenagement", order: 8 },
        { name: "Piles", slug: "piles", order: 9 }
      ]
    },
    {
      name: "Sports collectifs",
      slug: "sports-collectifs",
      description: "Équipements pour tous les sports d'équipe",
      order: 4,
      subCategories: [
        { name: "Football", slug: "football", order: 1 },
        { name: "Basketball", slug: "basketball", order: 2 },
        { name: "Handball", slug: "handball", order: 3 },
        { name: "Volleyball", slug: "volleyball", order: 4 },
        { name: "Rugby", slug: "rugby", order: 5 },
        { name: "Baseball et Softball", slug: "baseball-softball", order: 6 },
        { name: "Sports de crosse", slug: "sports-crosse", order: 7 },
        { name: "Ultimate", slug: "ultimate", order: 8 },
        { name: "Autres Sports collectifs", slug: "autres-sports-collectifs", order: 9 },
        { name: "Mini buts", slug: "mini-buts", order: 10 }
      ]
    },
    {
      name: "Sports de raquettes",
      slug: "sports-raquettes",
      description: "Équipements pour tous les sports de raquette",
      order: 5,
      subCategories: [
        { name: "Badminton", slug: "badminton", order: 1 },
        { name: "Tennis de table", slug: "tennis-table", order: 2 },
        { name: "Tennis", slug: "tennis", order: 3 },
        { name: "Padel", slug: "padel", order: 4 },
        { name: "Squash", slug: "squash", order: 5 },
        { name: "Speed-Badminton", slug: "speed-badminton", order: 6 },
        { name: "Pelote basque", slug: "pelote-basque", order: 7 },
        { name: "Peteca Indiaka", slug: "peteca-indiaka", order: 8 },
        { name: "Pickleball", slug: "pickleball", order: 9 }
      ]
    },
    {
      name: "Gymnastique",
      slug: "gymnastique",
      description: "Équipements spécialisés pour la gymnastique",
      order: 6,
      subCategories: [
        { name: "Agrès de Gymnastique", slug: "agres-gymnastique", order: 1 },
        { name: "Equipement Gymnastique indispensable", slug: "equipement-gymnastique-indispensable", order: 2 },
        { name: "Engins de GR - Gymnastique Rythmique", slug: "engins-gr-gymnastique-rythmique", order: 3 },
        { name: "Cirque et Jonglage", slug: "cirque-jonglage", order: 4 },
        { name: "Equipement salle de Danse", slug: "equipement-salle-danse", order: 5 },
        { name: "Gymnastique urbaine, parkour", slug: "gymnastique-urbaine-parkour", order: 6 }
      ]
    },
    {
      name: "Musculation et Fitness",
      slug: "musculation-fitness",
      description: "Équipements pour la musculation et le fitness",
      order: 7,
      subCategories: [
        { name: "Equipement de musculation", slug: "equipement-musculation", order: 1 },
        { name: "Haltères, Barres, Disques, Poids", slug: "halteres-barres-disques-poids", order: 2 },
        { name: "Equipement de Fitness et Cross training", slug: "equipement-fitness-cross-training", order: 3 },
        { name: "Appareils Fitness et Cardio training", slug: "appareils-fitness-cardio-training", order: 4 },
        { name: "Pilate, Gym douce et Yoga", slug: "pilate-gym-douce-yoga", order: 5 },
        { name: "Aménagement salle de Musculation", slug: "amenagement-salle-musculation", order: 6 },
        { name: "Protections Musculation", slug: "protections-musculation", order: 7 }
      ]
    },
    {
      name: "Éveil, Jeux et Motricité",
      slug: "eveil-jeux-motricite",
      description: "Équipements pour l'éveil et le développement moteur des enfants",
      order: 8,
      subCategories: [
        { name: "Jeux de société, Babyfoot", slug: "jeux-societe-babyfoot", order: 1 },
        { name: "Draisiennes, Tricycles, Vélos", slug: "draisiennes-tricycles-velos", order: 2 },
        { name: "Apprentissage scolaire de la Sécurité routière", slug: "apprentissage-scolaire-securite-routiere", order: 3 },
        { name: "Activités gymniques", slug: "activites-gymniques", order: 4 },
        { name: "Equilibre, Coordination", slug: "equilibre-coordination", order: 5 },
        { name: "Activités collectives", slug: "activites-collectives", order: 6 },
        { name: "Jeux coopératifs", slug: "jeux-cooperatifs", order: 7 },
        { name: "Activités artistiques", slug: "activites-artistiques", order: 8 },
        { name: "Mobilier enfant collectivités", slug: "mobilier-enfant-collectivites", order: 9 }
      ]
    },
    {
      name: "Sports outdoor",
      slug: "sports-outdoor",
      description: "Équipements pour les sports de plein air",
      order: 9,
      subCategories: [
        { name: "Escalade", slug: "escalade", order: 1 },
        { name: "Mobilité Urbaine", slug: "mobilite-urbaine", order: 2 },
        { name: "Randonnée et Camping", slug: "randonnee-camping", order: 3 },
        { name: "Archerie et Tir", slug: "archerie-tir", order: 4 },
        { name: "Sports de Précision", slug: "sports-precision", order: 5 },
        { name: "Sports de Vent", slug: "sports-vent", order: 6 },
        { name: "Loisirs et Jeux", slug: "loisirs-jeux", order: 7 },
        { name: "Sports d'hiver", slug: "sports-hiver", order: 8 },
        { name: "Course d'orientation", slug: "course-orientation", order: 9 }
      ]
    },
    {
      name: "Sports de Combat",
      slug: "sports-combat",
      description: "Équipements pour tous les sports de combat",
      order: 10,
      subCategories: [
        { name: "Aménagement Dojo, Salles de Boxe, Rings", slug: "amenagement-dojo-salles-boxe-rings", order: 1 },
        { name: "Arts Martiaux", slug: "arts-martiaux", order: 2 },
        { name: "Boxe, MMA", slug: "boxe-mma", order: 3 },
        { name: "Self défense, Krav Maga", slug: "self-defense-krav-maga", order: 4 },
        { name: "Escrime", slug: "escrime", order: 5 },
        { name: "Protections Boxe et Arts Martiaux", slug: "protections-boxe-arts-martiaux", order: 6 }
      ]
    },
    {
      name: "Sports Aquatiques",
      slug: "sports-aquatiques",
      description: "Équipements pour tous les sports nautiques",
      order: 11,
      subCategories: [
        { name: "Snorkeling", slug: "snorkeling", order: 1 },
        { name: "Bébés Nageurs", slug: "bebes-nageurs", order: 2 },
        { name: "Natation", slug: "natation", order: 3 },
        { name: "Aquagym et Aquabike", slug: "aquagym-aquabike", order: 4 },
        { name: "Equipement piscine, jeux aquatiques", slug: "equipement-piscine-jeux-aquatiques", order: 5 },
        { name: "Water-polo", slug: "water-polo", order: 6 },
        { name: "Sports de Pagaies", slug: "sports-pagaies", order: 7 },
        { name: "Sports de Voile", slug: "sports-voile", order: 8 },
        { name: "Sports de Glisse", slug: "sports-glisse", order: 9 }
      ]
    },
    {
      name: "Athlétisme",
      slug: "athletisme",
      description: "Équipements spécialisés pour l'athlétisme",
      order: 12,
      subCategories: [
        { name: "Marche Nordique", slug: "marche-nordique", order: 1 },
        { name: "Matériel de Course à pied", slug: "materiel-course-pied", order: 2 },
        { name: "Lancer Athlétisme", slug: "lancer-athletisme", order: 3 },
        { name: "Saut Athlétisme", slug: "saut-athletisme", order: 4 },
        { name: "Instruments de mesure Athlétisme", slug: "instruments-mesure-athletisme", order: 5 },
        { name: "Kits initiation Athlétisme", slug: "kits-initiation-athletisme", order: 6 }
      ]
    },
    {
      name: "Textile et bagagerie",
      slug: "textile-bagagerie",
      description: "Vêtements sportifs et accessoires de bagagerie",
      order: 13,
      subCategories: [
        { name: "Vêtements, tenues Gardien multisports", slug: "vetements-tenues-gardien-multisports", order: 1 },
        { name: "Tenue Arbitre", slug: "tenue-arbitre", order: 2 },
        { name: "Tee-shirts personnalisables", slug: "tee-shirts-personnalisables", order: 3 },
        { name: "Bagagerie", slug: "bagagerie", order: 4 },
        { name: "Accessoires textile", slug: "accessoires-textile", order: 5 },
        { name: "Textile Multisport", slug: "textile-multisport", order: 6 }
      ]
    }
  ];

  // Création des catégories et sous-catégories
  for (const categoryData of categories) {
    const { subCategories, ...categoryFields } = categoryData;
    
    const category = await prisma.category.create({
      data: categoryFields
    });

    console.log(`✅ Catégorie créée: ${category.name}`);

    // Création des sous-catégories pour cette catégorie
    for (const subCategoryData of subCategories) {
      await prisma.subCategory.create({
        data: {
          ...subCategoryData,
          categoryId: category.id
        }
      });
    }

    console.log(`✅ ${subCategories.length} sous-catégories créées pour ${category.name}`);
  }

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 