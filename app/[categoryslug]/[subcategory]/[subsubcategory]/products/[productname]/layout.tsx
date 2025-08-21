import { Metadata } from 'next';

interface ProductSubSubcategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ categoryslug: string; subcategory: string; subsubcategory: string; productname: string }>;
}

export async function generateMetadata({ params }: ProductSubSubcategoryLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { categoryslug, subcategory, subsubcategory, productname } = resolvedParams;

  // Récupération des données du produit depuis la base de données
  const { PrismaClient } = require('@prisma/client'); // eslint-disable-line @typescript-eslint/no-require-imports
  const prisma = new PrismaClient();

  try {
    const product = await (prisma as any).product.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { sku: productname },
      include: {
        subSubCategory: {
          select: {
            name: true,
            slug: true,
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
        }
      }
    });

    if (!product) {
      return {
        title: 'Produit non trouvé | JBF Sport',
        description: 'Le produit demandé n\'existe pas.',
      };
    }

    const title = `${product.name} - ${product.subSubCategory.name} | JBF Sport`;
    const description = product.shortDescription || product.description || 
      `Découvrez ${product.name} dans la catégorie ${product.subSubCategory.subCategory.category.name} > ${product.subSubCategory.subCategory.name} > ${product.subSubCategory.name}. Équipement sportif professionnel de qualité.`;

    return {
      title,
      description,
      keywords: [
        product.name.toLowerCase(),
        product.subSubCategory.name.toLowerCase(),
        product.subSubCategory.subCategory.name.toLowerCase(),
        product.subSubCategory.subCategory.category.name.toLowerCase(),
        'matériel sportif',
        'équipement sportif',
        'produit sportif',
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
        url: `https://jbfsport.com/${categoryslug}/${subcategory}/${subsubcategory}/products/${productname}`,
        images: product.images && product.images.length > 0 ? [
          {
            url: product.images[0],
            width: 1200,
            height: 630,
            alt: `${product.name} - JBF Sport`
          }
        ] : undefined
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.images && product.images.length > 0 ? [product.images[0]] : undefined
      },
      alternates: {
        canonical: `https://jbfsport.com/${categoryslug}/${subcategory}/${subsubcategory}/products/${productname}`
      }
    };
  } catch (error) {
    console.error('Erreur lors de la génération des métadonnées:', error);
    return {
      title: 'Produit | JBF Sport',
      description: 'Découvrez notre gamme de matériel sportif professionnel.',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function ProductSubSubcategoryLayout({ children }: ProductSubSubcategoryLayoutProps) {
  return <>{children}</>;
} 