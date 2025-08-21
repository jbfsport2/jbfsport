import { Metadata } from 'next';


interface SubSubcategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ categoryslug: string; subcategory: string; subsubcategory: string }>;
}

export async function generateMetadata({ params }: SubSubcategoryLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { categoryslug, subcategory, subsubcategory } = resolvedParams;

  // Récupération des données depuis la base de données
  const { PrismaClient } = require('@prisma/client'); // eslint-disable-line @typescript-eslint/no-require-imports
  const prisma = new PrismaClient();

  try {
    const subSubcategoryData = await (prisma as any).subSubCategory.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { slug: subsubcategory },
      include: {
        subCategory: {
          select: {
            name: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!subSubcategoryData) {
      return {
        title: 'Sous-sous-catégorie non trouvée | JBF Sport',
        description: 'La sous-sous-catégorie demandée n\'existe pas.',
      };
    }

    const title = `${subSubcategoryData.name} - ${subSubcategoryData.subCategory.name} | JBF Sport`;
    const description = subSubcategoryData.description || 
      `Découvrez notre gamme de ${subSubcategoryData.name.toLowerCase()} dans la catégorie ${subSubcategoryData.subCategory.category.name.toLowerCase()} > ${subSubcategoryData.subCategory.name.toLowerCase()}. Équipements sportifs professionnels.`;

    return {
      title,
      description,
      keywords: [
        subSubcategoryData.name.toLowerCase(),
        subSubcategoryData.subCategory.name.toLowerCase(),
        subSubcategoryData.subCategory.category.name.toLowerCase(),
        'matériel sportif',
        'équipement sportif',
        'collectivités',
        'écoles',
        'clubs sportifs',
        'professionnel',
        'JBF Sport'
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'fr_FR',
        siteName: 'JBF Sport',
        url: `https://jbfsport.com/${categoryslug}/${subcategory}/${subsubcategory}`
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      },
      alternates: {
        canonical: `https://jbfsport.com/${categoryslug}/${subcategory}/${subsubcategory}`
      }
    };
  } catch (error) {
    console.error('Erreur lors de la génération des métadonnées:', error);
    return {
      title: 'Sous-sous-catégorie | JBF Sport',
      description: 'Découvrez notre gamme de matériel sportif professionnel.',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function SubSubcategoryLayout({ children }: SubSubcategoryLayoutProps) {
  return (
    <>
      <main>{children}</main>
    </>
  );
} 