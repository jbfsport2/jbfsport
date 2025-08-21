"use client";

import { useState, useMemo } from 'react';
import { Grid, List } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
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

interface ProductListingProps {
  products: Product[];
  initialViewMode?: 'grid' | 'list';
  // Informations de navigation pour les URLs des produits
  navigationInfo?: {
    categorySlug: string;
    subCategorySlug: string;
    subSubCategorySlug?: string;
  };
}

export default function ProductListing({ products, initialViewMode = 'grid', navigationInfo }: ProductListingProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Filtre les produits par prix
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const price = product.salePrice || product.price;
      
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      
      return true;
    });
  }, [products, minPrice, maxPrice]);

  // Réinitialise les filtres
  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
  };

  // Formate le prix pour l'affichage
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Calcule les statistiques de prix
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const prices = products.map(p => p.salePrice || p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    return { min, max, avg };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* En-tête avec compteur et options de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Produits
          </h2>
          <span className="text-gray-500">
            {filteredProducts.length} produit(s) trouvé(s)
            {minPrice || maxPrice ? ` sur ${products.length} total` : ''}
          </span>
        </div>
        
        {/* Options de vue (grille/liste) */}
        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Vue grille"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Vue liste"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Statistiques de prix */}
      {products.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-blue-600 font-medium">Prix minimum</div>
              <div className="text-lg font-bold text-blue-900">{formatPrice(priceStats.min)}</div>
            </div>
            <div>
              <div className="text-sm text-blue-600 font-medium">Prix maximum</div>
              <div className="text-lg font-bold text-blue-900">{formatPrice(priceStats.max)}</div>
            </div>
            <div>
              <div className="text-sm text-blue-600 font-medium">Prix moyen</div>
              <div className="text-lg font-bold text-blue-900">{formatPrice(priceStats.avg)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres de prix */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtres par prix</h3>
          {(minPrice || maxPrice) && (
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Réinitialiser
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix minimum (€)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`${priceStats.min.toFixed(2)}`}
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix maximum (€)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`${priceStats.max.toFixed(2)}`}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Affichage des produits */}
      {filteredProducts.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredProducts.map((product) => (
            <div key={product.id} className={viewMode === 'list' ? 'bg-white p-4 rounded-lg shadow-sm border' : ''}>
              <ProductCard product={product} navigationInfo={navigationInfo} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-500 mb-4">
            {minPrice || maxPrice 
              ? 'Aucun produit ne correspond à vos critères de prix.'
              : 'Aucun produit disponible dans cette catégorie.'
            }
          </p>
          {(minPrice || maxPrice) && (
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
} 