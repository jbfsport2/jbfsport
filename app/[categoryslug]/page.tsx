import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import ProductCarousel from '../components/ProductCarousel';
import StructuredData from '../components/StructuredData';

// Types étendus pour inclure les champs personnalisés
interface ExtendedCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  categoryText: string | null;
  isActive: boolean;
  subCategories: ExtendedSubCategory[];
}

interface ExtendedSubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
  subSubCategories: ExtendedSubSubCategory[];
  products: ExtendedProduct[];
}

interface ExtendedSubSubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isCategorySelected: boolean;
  isActive: boolean;
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
  // Informations de catégorie pour générer les URLs
  subCategory?: {
    slug: string;
    category: {
      slug: string;
    };
  };
}

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{
    categoryslug: string;
  }>;
}

async function getCategoryData(slug: string): Promise<ExtendedCategory | null> {
  try {
    const category = await (prisma as any).category.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { 
        slug: slug,
        isActive: true 
      },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            subSubCategories: {
              where: { 
                isActive: true,
                isCategorySelected: true // Seulement les sélectionnés
              },
              orderBy: { order: 'asc' }
            },
            products: {
              where: { 
                isActive: true,
                isProductCategorySelected: true // Seulement les sélectionnés
              },
              orderBy: { createdAt: 'desc' },
              take: 6 // Limite à 6 produits
            }
          }
        }
      }
    });

    if (!category) return null;

    // Transforme les données pour correspondre aux types étendus
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: (category as any).imageUrl || null, // eslint-disable-line @typescript-eslint/no-explicit-any
      categoryText: (category as any).categoryText || null, // eslint-disable-line @typescript-eslint/no-explicit-any
      isActive: category.isActive,
      subCategories: (category as any).subCategories?.map((sub: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        order: sub.order,
        isActive: sub.isActive,
        subSubCategories: (sub.subSubCategories || []).map((ssc: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: ssc.id,
          name: ssc.name,
          slug: ssc.slug,
          description: ssc.description,
          order: ssc.order,
          isCategorySelected: ssc.isCategorySelected || false,
          isActive: ssc.isActive
        })),
        products: (sub.products || []).map((product: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: product.id,
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          sku: product.sku,
          price: product.price,
          salePrice: product.salePrice,
          images: product.images,
          isProductCategorySelected: product.isProductCategorySelected || false,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          // Ajout des informations de catégorie pour générer les URLs
          subCategory: {
            slug: sub.slug,
            category: {
              slug: category.slug
            }
          }
        }))
      })) || []
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function CategoryPage({ params }: PageProps) {
  // Attend les params pour Next.js 15+
  const resolvedParams = await params;
  const category = await getCategoryData(resolvedParams.categoryslug);

  if (!category) {
    notFound();
  }

  // DEBUG: Affiche les données de la catégorie
  console.log('🔍 Données de la catégorie:', {
    name: category.name,
    imageUrl: category.imageUrl,
    hasCategoryText: !!category.categoryText,
    categoryTextLength: category.categoryText?.length || 0
  });

  // Récupère tous les produits sélectionnés de la catégorie
  const selectedProducts = category.subCategories
    ?.flatMap(sub => sub.products || [])
    .filter(Boolean) || [];

  // Récupère toutes les sous-sous-catégories sélectionnées
  const selectedSubSubCategories = category.subCategories
    ?.flatMap(sub => sub.subSubCategories || [])
    .filter(Boolean) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 bg-white">
        {category.imageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url("${category.imageUrl}")`
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl max-w-2xl mx-auto">{category.description}</p>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="absolute bottom-4 left-4 z-20">
          <nav className="flex items-center space-x-2 text-white/80">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{category.name}</span>
          </nav>
        </div>
      </section>

      {/* Section Produits Mis en Avant dans la Catégorie - Carousel */}
      {selectedProducts.length > 0 && (
        <ProductCarousel
          products={selectedProducts}
          title="Nos Produits Phares"
          subtitle="Découvrez nos produits vedettes spécialement sélectionnés pour cette catégorie"
          className="bg-gray-50"
        />
      )}

      {/* Section "Notre Sélection" */}
      {selectedSubSubCategories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Notre Sélection
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez nos meilleures sous-catégories soigneusement sélectionnées pour vous
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {selectedSubSubCategories.slice(0, 3).map((subSubCategory) => {
                // Trouve la sous-catégorie parente
                const parentSubCategory = category.subCategories?.find(sub => 
                  sub.subSubCategories?.some(ssc => ssc.id === subSubCategory.id)
                );
                
                return (
                  <div key={subSubCategory.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <Star className="w-5 h-5 text-yellow-400 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {subSubCategory.name}
                        </h3>
                      </div>
                      {subSubCategory.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {subSubCategory.description}
                        </p>
                      )}
                      {parentSubCategory && (
                        <Link
                          href={`/${category.slug}/${parentSubCategory.slug}/${subSubCategory.slug}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Découvrir
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Section Maillage Interne - Sous-catégories */}
      {category.subCategories && category.subCategories.length > 0 && (
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Toutes nos sous-catégories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explorez notre gamme complète organisée par sous-catégories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.subCategories.map((subCategory) => (
                <div key={subCategory.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {subCategory.name}
                  </h3>
                  {subCategory.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {subCategory.description}
                    </p>
                  )}
                  <Link
                    href={`/${category.slug}/${subCategory.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Voir les produits
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Maillage Interne - Produits Sélectionnés */}
      
      {/* Section Texte Personnalisé */}
      {category.categoryText && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700">
              <ReactMarkdown 
                components={{
                  h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-6">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                  li: ({children}) => <li className="text-gray-700 mb-2 ml-4">{children}</li>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-800">{children}</em>
                }}
              >
                {category.categoryText}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}
      
      {/* JSON-LD Structuré pour le SEO */}
      <StructuredData 
        type="category" 
        slug={category.slug} 
      />
    </div>
  );
} 