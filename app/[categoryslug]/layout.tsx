import { Metadata } from 'next';

interface CategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ categoryslug: string }>;
}

export async function generateMetadata({ params }: CategoryLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { categoryslug } = resolvedParams;

  // Récupération des données de la catégorie depuis la base de données
  const { PrismaClient } = require('@prisma/client'); // eslint-disable-line @typescript-eslint/no-require-imports
  const prisma = new PrismaClient();

  try {
    const category = await (prisma as any).category.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { slug: categoryslug },
      select: {
        name: true,
        description: true,
        categoryText: true,
        imageUrl: true
      }
    });

    if (!category) {
      return {
        title: 'Catégorie non trouvée | JBF Sport',
        description: 'La catégorie demandée n\'existe pas.',
      };
    }

    const title = `${category.name} - Matériel Sportif Professionnel | JBF Sport`;
    const description = category.description || category.categoryText?.substring(0, 160) || 
      `Découvrez notre gamme complète de ${category.name.toLowerCase()} pour collectivités, écoles et clubs sportifs. Qualité professionnelle garantie.`;

    return {
      title,
      description,
      keywords: [
        category.name.toLowerCase(),
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
        images: category.imageUrl ? [
          {
            url: category.imageUrl,
            width: 1200,
            height: 630,
            alt: `${category.name} - JBF Sport`
          }
        ] : undefined
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: category.imageUrl ? [category.imageUrl] : undefined
      },
      alternates: {
        canonical: `https://jbfsport.com/${categoryslug}`
      }
    };
  } catch (error) {
    console.error('Erreur lors de la génération des métadonnées:', error);
    return {
      title: 'Catégorie | JBF Sport',
      description: 'Découvrez notre gamme de matériel sportif professionnel.',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return (
    <>
      <main>{children}</main>
    </>
  );
} 