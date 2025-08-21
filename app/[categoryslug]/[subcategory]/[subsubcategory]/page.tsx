import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductListing from '../../../components/ProductListing';

const prisma = new PrismaClient();

// Types étendus
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
    subsubcategory: string;
  }>;
}

async function getSubSubCategoryData(categorySlug: string, subCategorySlug: string, subSubCategorySlug: string): Promise<{
  category: { name: string; slug: string };
  subCategory: { name: string; slug: string };
  subSubCategory: ExtendedSubSubCategory;
  products: ExtendedProduct[];
} | null> {
  try {
    // Récupère la catégorie
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

    // Récupère la sous-catégorie
    const subCategory = await (prisma as any).subCategory.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { 
        slug: subCategorySlug,
        categoryId: category.id,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    if (!subCategory) return null;

    // Récupère la sous-sous-catégorie avec ses produits
    const subSubCategory = await (prisma as any).subSubCategory.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { 
        slug: subSubCategorySlug,
        subCategoryId: subCategory.id,
        isActive: true 
      },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!subSubCategory) return null;

    // Transforme les données
    const transformedSubSubCategory: ExtendedSubSubCategory = {
      id: subSubCategory.id,
      name: subSubCategory.name,
      slug: subSubCategory.slug,
      description: subSubCategory.description,
      order: subSubCategory.order,
      isActive: subSubCategory.isActive,
      products: subSubCategory.products || []
    };

    return {
      category,
      subCategory,
      subSubCategory: transformedSubSubCategory,
      products: transformedSubSubCategory.products
    };

  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-sous-catégorie:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Composant principal
export default async function SubSubCategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getSubSubCategoryData(
    resolvedParams.categoryslug, 
    resolvedParams.subcategory, 
    resolvedParams.subsubcategory
  );

  if (!data) {
    notFound();
  }

  const { category, subCategory, subSubCategory, products } = data;

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
            <Link 
              href={`/${category.slug}/${subCategory.slug}`} 
              className="hover:text-blue-600"
            >
              {subCategory.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {subSubCategory.name}
            </span>
          </nav>
        </div>
      </div>

      {/* En-tête de la sous-sous-catégorie */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {subSubCategory.name}
            </h1>
            {subSubCategory.description && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {subSubCategory.description}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {products.length} produit(s) disponible(s)
            </p>
          </div>
        </div>
      </div>

      {/* Section des produits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductListing 
          products={products} 
          navigationInfo={{
            categorySlug: category.slug,
            subCategorySlug: subCategory.slug,
            subSubCategorySlug: subSubCategory.slug
          }}
        />
      </div>
    </div>
  );
} 