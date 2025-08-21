import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ChevronRight, Star, Truck, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{
    categoryslug: string;
    subcategory: string;
    productname: string;
  }>;
}

async function getProductData(categorySlug: string, subCategorySlug: string, productSku: string) {
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

    // Récupère le produit
    const product = await (prisma as any).product.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { 
        sku: productSku,
        subCategoryId: subCategory.id,
        isActive: true 
      },
      include: {
        subCategory: {
          include: {
            category: true
          }
        }
      }
    });

    if (!product) return null;

    return {
      category,
      subCategory,
      product
    };

  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getProductData(
    resolvedParams.categoryslug, 
    resolvedParams.subcategory, 
    resolvedParams.productname
  );

  if (!data) {
    notFound();
  }

  const { category, subCategory, product } = data;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;

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
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images du produit */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-lg">Aucune image</span>
              </div>
            )}
            
            {/* Galerie d'images (si plusieurs images) */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 2}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg">
                {product.description || product.shortDescription}
              </p>
            </div>

            {/* Prix */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-bold text-blue-600">
                  {displayPrice.toFixed(2)} €
                </span>
                {hasDiscount && (
                  <span className="text-2xl text-gray-500 line-through">
                    {product.price.toFixed(2)} €
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="inline-block bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                  -{Math.round(((product.price - product.salePrice!) / product.price) * 100)}% de réduction
                </div>
              )}
            </div>

            {/* Informations techniques */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Référence</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stock</span>
                <span className="font-medium text-green-600">
                  Disponible
                </span>
              </div>
              {product.isFeatured && (
                <div className="flex items-center justify-center text-yellow-600">
                  <Star className="w-5 h-5 mr-2 fill-current" />
                  <span className="font-medium">Produit mis en avant</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Demander un devis
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Nous contacter
              </button>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Livraison</h4>
                <p className="text-sm text-gray-600">Sur toute la France</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Garantie</h4>
                <p className="text-sm text-gray-600">2 ans minimum</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Support</h4>
                <p className="text-sm text-gray-600">Assistance technique</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description détaillée */}
        {product.description && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description détaillée</h2>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 