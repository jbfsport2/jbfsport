import { Metadata } from 'next';


interface SubcategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ categoryslug: string; subcategory: string }>;
}

export async function generateMetadata({ params }: SubcategoryLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { categoryslug, subcategory } = resolvedParams;

  // Récupération des données depuis la base de données
  const { PrismaClient } = require('@prisma/client'); // eslint-disable-line @typescript-eslint/no-require-imports
  const prisma = new PrismaClient();

  try {
    const subcategoryData = await (prisma as any).subCategory.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { slug: subcategory },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    if (!subcategoryData) {
      return {
        title: 'Sous-catégorie non trouvée | JBF Sport',
        description: 'La sous-catégorie demandée n\'existe pas.',
      };
    }

    const title = `${subcategoryData.name} - ${subcategoryData.category.name} | JBF Sport`;
    const description = subcategoryData.description || 
      `Découvrez notre gamme de ${subcategoryData.name.toLowerCase()} dans la catégorie ${subcategoryData.category.name.toLowerCase()}. Équipements sportifs professionnels pour collectivités et clubs.`;

    return {
      title,
      description,
      keywords: [
        subcategoryData.name.toLowerCase(),
        subcategoryData.category.name.toLowerCase(),
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
        url: `https://jbfsport.com/${categoryslug}/${subcategory}`
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      },
      alternates: {
        canonical: `https://jbfsport.com/${categoryslug}/${subcategory}`
      }
    };
  } catch (error) {
    console.error('Erreur lors de la génération des métadonnées:', error);
    return {
      title: 'Sous-catégorie | JBF Sport',
      description: 'Découvrez notre gamme de matériel sportif professionnel.',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function SubcategoryLayout({ children }: SubcategoryLayoutProps) {
  return (
    <>
      <main>{children}</main>
    </>
  );
} 