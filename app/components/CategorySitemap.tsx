"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories: SubCategory[];
}

export default function CategorySitemap() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoriesPerPage = 5;
  const totalPages = Math.ceil(categories.length / categoriesPerPage);
  const startIndex = currentPage * categoriesPerPage;
  const visibleCategories = categories.slice(startIndex, startIndex + categoriesPerPage);

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des catégories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Aucune catégorie disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Découvrez nos catégories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez notre gamme complète de produits organisés par catégories pour trouver facilement ce que vous cherchez.
          </p>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>

        {/* Carousel avec 5 catégories visibles */}
        <div className="flex gap-6 overflow justify-center px-20">
          {visibleCategories.map((category) => (
            <div key={category.id} className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="mb-4">
                <Link 
                  href={`/${category.slug}`}
                  className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200 block mb-2"
                >
                  {category.name}
                </Link>
              </div>
              
              {category.subCategories.length > 0 && (
                <div className="space-y-2">
                  <ul className="space-y-1">
                    {category.subCategories.slice(0, 6).map((subCategory) => (
                      <li key={subCategory.id}>
                        <Link 
                          href={`/${category.slug}/${subCategory.slug}`}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 block py-1 hover:bg-gray-50 rounded px-2"
                        >
                          • {subCategory.name}
                        </Link>
                      </li>
                    ))}
                    {category.subCategories.length > 6 && (
                      <li className="text-xs text-gray-500 italic px-2">
                        + {category.subCategories.length - 6} autres...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Indicateurs de pagination */}
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                i === currentPage ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 