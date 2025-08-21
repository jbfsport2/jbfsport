import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    shortDescription?: string | null;
    images: string[];
    sku: string;
    // Ajout des informations de catégorie directement dans le produit
    subCategory?: {
      slug: string;
      category: {
        slug: string;
      };
    };
    subSubCategory?: {
      slug: string;
      subCategory: {
        slug: string;
        category: {
          slug: string;
        };
      };
    };
  };
  // Informations de navigation pour construire l'URL (optionnel)
  navigationInfo?: {
    categorySlug: string;
    subCategorySlug: string;
    subSubCategorySlug?: string;
  };
}

export default function ProductCard({ product, navigationInfo }: ProductCardProps) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;

  // Génère l'URL du produit selon la structure
  const generateProductUrl = () => {
    // Priorité 1 : navigationInfo (pour les pages spécifiques)
    if (navigationInfo) {
      const { categorySlug, subCategorySlug, subSubCategorySlug } = navigationInfo;
      
      if (subSubCategorySlug) {
        // Avec sous-sous-catégorie : utilise la route /products
        return `/${categorySlug}/${subCategorySlug}/${subSubCategorySlug}/products/${product.sku}`;
      } else {
        // Sans sous-sous-catégorie : utilise la route directe
        return `/${categorySlug}/${subCategorySlug}/products/${product.sku}`;
      }
    }
    
    // Priorité 2 : données du produit (pour les carousels génériques)
    if (product.subSubCategory) {
      // Produit dans une sous-sous-catégorie
      return `/${product.subSubCategory.subCategory.category.slug}/${product.subSubCategory.subCategory.slug}/${product.subSubCategory.slug}/products/${product.sku}`;
    } else if (product.subCategory) {
      // Produit directement dans une sous-catégorie
      return `/${product.subCategory.category.slug}/${product.subCategory.slug}/products/${product.sku}`;
    }
    
    // Fallback si aucune info disponible
    console.warn('ProductCard: Impossible de générer l\'URL pour', product.name);
    return '#';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-96">
      {/* Image du produit */}
      <div className="relative bg-gray-200 overflow-hidden flex-shrink-0">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            width={500}
            height={500}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Aucune image</span>
          </div>
        )}
        
        {/* Badge de réduction */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
          </div>
        )}
      </div>

      {/* Contenu du produit - Section flexible */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>


        {/* Section prix et bouton - Toujours en bas */}
        <div className="mt-auto space-y-3">
          {/* Prix */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">
              {displayPrice.toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {product.price.toFixed(2)} €
              </span>
            )}
          </div>

                  {/* Bouton d'action */}
        <Link
          href={generateProductUrl()}
          className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium group-hover:bg-blue-700"
        >
          Voir le produit
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
        </div>
      </div>
    </div>
  );
} 