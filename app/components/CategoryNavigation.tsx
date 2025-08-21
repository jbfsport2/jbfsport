"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface SubSubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  subSubCategories?: SubSubCategory[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  subCategories?: SubCategory[];
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryNavigation({ isOpen, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Erreur lors de la récupération des catégories');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

/*   const fetchProducts = async (subSubCategoryId: string) => {
    try {
      const response = await fetch(`/api/subsubcategories/${subSubCategoryId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Erreur lors de la récupération des produits');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      setError('Erreur de connexion');
    }
  }; */

  const handleClose = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setProducts([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />

      {/* Première sidebar - Catégories principales */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Catégories</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id}>
                  {category.subCategories && category.subCategories.length > 0 ? (
                    // Si la catégorie a des sous-catégories, afficher la flèche et permettre la navigation
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className="w-full text-left p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    // Si la catégorie n'a pas de sous-catégories, rediriger directement vers sa page
                    <Link
                      href={`/${category.slug}`}
                      className="w-full text-left p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 block"
                      onClick={onClose}
                    >
                      <span className="text-gray-700 hover:text-blue-600 transition-colors">
                        {category.name}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deuxième sidebar - Sous-catégories */}
      {selectedCategory && (
        <div
          className="fixed left-80 top-0 h-full w-80 bg-gray-50 shadow-lg"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              {/* Titre cliquable vers la catégorie principale */}
              <Link
                href={`/${selectedCategory.slug}`}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                onClick={onClose}
              >
                {selectedCategory.name}
              </Link>
              <button onClick={() => setSelectedCategory(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2">
              {selectedCategory.subCategories?.map((subCategory) => (
                <div key={subCategory.id}>
                  {subCategory.subSubCategories && subCategory.subSubCategories.length > 0 ? (
                    // Si la sous-catégorie a des sous-sous-catégories, afficher la flèche et permettre la navigation
                    <button
                      onClick={() => setSelectedSubCategory(subCategory)}
                      className="w-full text-left p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                        {subCategory.name}
                      </span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    // Si la sous-catégorie n'a pas de sous-sous-catégories, rediriger directement vers sa page
                    <Link
                      href={`/${selectedCategory.slug}/${subCategory.slug}`}
                      className="w-full text-left p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 block"
                      onClick={onClose}
                    >
                      <span className="text-gray-700 hover:text-blue-600 transition-colors">
                        {subCategory.name}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Troisième sidebar - Sous-sous-catégories */}
      {selectedSubCategory && (
        <div
          className="fixed left-160 top-0 h-full w-80 bg-white shadow-lg"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              {/* Titre cliquable vers la sous-catégorie */}
              <Link
                href={`/${selectedCategory?.slug}/${selectedSubCategory.slug}`}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                onClick={onClose}
              >
                {selectedSubCategory.name}
              </Link>
              <button onClick={() => setSelectedSubCategory(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2">
              {selectedSubCategory.subSubCategories?.map((subSubCategory) => (
                <Link
                  key={subSubCategory.id}
                  href={`/${selectedCategory?.slug}/${selectedSubCategory.slug}/${subSubCategory.slug}`}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 block"
                  onClick={onClose}
                >
                  <span className="text-gray-700 hover:text-blue-600 transition-colors">
                    {subSubCategory.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 