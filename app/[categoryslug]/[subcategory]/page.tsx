import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductListing from '../../components/ProductListing';

const prisma = new PrismaClient();

// Types étendus
interface ExtendedSubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
  products: ExtendedProduct[];
  subSubCategories: ExtendedSubSubCategory[];
}

interface ExtendedSubSubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
  products: ExtendedProduct[];
}

interface ExtendedProduct {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  images: string[];
  isProductCategorySelected: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

interface PageProps {
  params: Promise<{
    categoryslug: string;
    subcategory: string;
  }>;
}

async function getSubCategoryData(categorySlug: string, subCategorySlug: string): Promise<{
  category: { name: string; slug: string };
  subCategory: ExtendedSubCategory;
  allProducts: ExtendedProduct[];
  hasSubSubCategories: boolean;
} | null> {
  try {
    // Récupère la catégorie et la sous-catégorie
    const category = await (prisma as any).category.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { 
        slug: categorySlug,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    if (!category) return null;

    const subCategory = await (prisma as any).subCategory.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any 
      where: { 
        slug: subCategorySlug,
        categoryId: category.id,
        isActive: true 
      },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        subSubCategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            products: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!subCategory) return null;

    // Détermine si la sous-catégorie a des sous-sous-catégories
    const hasSubSubCategories = subCategory.subSubCategories.length > 0;

    // Récupère tous les produits selon le cas
    let allProducts: ExtendedProduct[] = [];

    if (hasSubSubCategories) {
      // Cas 1: Avec sous-sous-catégories → mélange tous les produits
      allProducts = subCategory.subSubCategories.flatMap((ssc: any) => // eslint-disable-line @typescript-eslint/no-explicit-any  
        (ssc.products || []).map((product: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          ...product,
          // Ajoute l'info de la sous-sous-catégorie pour le breadcrumb
          subSubCategoryName: ssc.name
        }))
      );
    } else {
      // Cas 2: Sans sous-sous-catégories → produits directs
      allProducts = subCategory.products || [];
    }

    // Transforme les données
    const transformedSubCategory: ExtendedSubCategory = {
      id: subCategory.id,
      name: subCategory.name,
      slug: subCategory.slug,
      description: subCategory.description,
      order: subCategory.order,
      isActive: subCategory.isActive,
      products: subCategory.products || [],
      subSubCategories: subCategory.subSubCategories || []
    };

    return {
      category,
      subCategory: transformedSubCategory,
      allProducts,
      hasSubSubCategories
    };

  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}



// Composant principal
export default async function SubCategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getSubCategoryData(resolvedParams.categoryslug, resolvedParams.subcategory);

  if (!data) {
    notFound();
  }

  const { category, subCategory, allProducts, hasSubSubCategories } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href={`/${category.slug}`} 
              className="hover:text-blue-600"
            >
              {category.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {subCategory.name}
            </span>
          </nav>
        </div>
      </div>

      {/* En-tête de la sous-catégorie */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {subCategory.name}
            </h1>
            {subCategory.description && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {subCategory.description}
              </p>
            )}
            {hasSubSubCategories && (
              <p className="text-sm text-gray-500 mt-2">
                {subCategory.subSubCategories.length} sous-catégories disponibles
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section des sous-sous-catégories (si elles existent) */}
      {hasSubSubCategories && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Sous-catégories disponibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subCategory.subSubCategories.map((ssc) => (
                <Link
                  key={ssc.id}
                  href={`/${category.slug}/${subCategory.slug}/${ssc.slug}`}
                  className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {ssc.name}
                  </h3>
                  {ssc.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {ssc.description}
                    </p>
                  )}
                  <p className="text-blue-600 text-sm font-medium mt-3">
                    {ssc.products.length} produit(s)
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section des produits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductListing 
          products={allProducts} 
          navigationInfo={{
            categorySlug: category.slug,
            subCategorySlug: subCategory.slug
          }}
        />
      </div>
    </div>
  );
} 