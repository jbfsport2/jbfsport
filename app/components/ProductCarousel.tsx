"use client";

import { useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  sku: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  isProductCategorySelected: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

interface ProductCarouselProps {
  products: Product[];
  title: string;
  subtitle?: string;
  className?: string;
}

export default function ProductCarousel({ products, title, subtitle, className = "" }: ProductCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calcul des variables avant la vérification conditionnelle
  const productsPerView = 4; // Nombre de produits visibles à la fois
  const totalPages = products && products.length > 0 ? Math.ceil(products.length / productsPerView) : 0;

  // Défilement automatique - DOIT être avant le return conditionnel
  useEffect(() => {
    if (totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage(prevPage => {
        const nextPage = prevPage + 1;
        if (nextPage >= totalPages) {
          return 0; // Retour au début
        }
        return nextPage;
      });
    }, 4000); // Change toutes les 4 secondes

    return () => clearInterval(interval);
  }, [totalPages]);

  // Vérification de sécurité pour éviter l'erreur
  if (!products || products.length === 0) {
    return null;
  }

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête avec titre et navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

        </div>

        {/* Carousel */}
        <div className="relative">
          

          {/* Container du carousel */}
          <div className="overflow-hidden">
            <div
              ref={carouselRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                width: `${totalPages * 100}%`,
                transform: `translateX(-${currentPage * (100 / totalPages)}%)`
              }}
            >
              {Array.from({ length: totalPages }, (_, pageIndex) => (
                <div
                  key={pageIndex}
                  className="flex flex-shrink-0 px-4"
                  style={{ width: `${100 / totalPages}%` }}
                >
                  {products
                    .slice(pageIndex * productsPerView, (pageIndex + 1) * productsPerView)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex-shrink-0 px-2"
                        style={{ width: `${100 / productsPerView}%` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicateurs de position */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentPage === index
                      ? 'bg-blue-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  title={`Page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Compteur de position */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {totalPages > 1 && (
            <span>
              Page {currentPage + 1} sur {totalPages} | {products.length} produits
            </span>
          )}
        </div>
      </div>
    </section>
  );
} 