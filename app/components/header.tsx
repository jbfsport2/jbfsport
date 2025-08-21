"use client"
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Search, ShoppingCart, Truck, Star, Clock, Headphones } from 'lucide-react';
import { useState } from 'react';
import CategoryNavigation from './CategoryNavigation';
import { FaPhone } from 'react-icons/fa';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen] = useState(false);
  const [isCategoryNavOpen, setIsCategoryNavOpen] = useState(false);

  return (
    <>
      {/* Barre supérieure grise avec informations */}
      <div className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">3,9/5 Avis clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Devis gratuit sous 24h</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="font-medium">Livraison offerte dès 200 € HT</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Service client à votre écoute</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="px-4">
          {/* Barre principale avec logo et navigation */}
          <div className="flex justify-between items-center container mx-auto">
            {/* Logo - plus grand */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity h-24 w-36 overflow-hidden">
              <Image src="/JBFSPORT4.png" alt="JBF Sport" width={500} height={500} className=""/>
            </Link>

            {/* Barre de recherche - corrigée avec un fond visible et bien alignée */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Chercher un produit..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Boutons de droite */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/contact" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaPhone className="w-6 h-6" />
              </Link>
              <Link href="/contact" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
              </Link>
            </div>

            {/* Bouton menu mobile */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Barre de recherche mobile - corrigée */}
          {isSearchOpen && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Chercher un produit..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Navigation principale */}
          <nav className="hidden md:block">
            <div className="flex justify-between py-4 container mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-2">
                    <button
                    onClick={() => setIsCategoryNavOpen(true)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-2 font-bold"
                    title="Ouvrir les catégories"
                    >
                    <Menu className="w-4 h-4" />

                    Tous nos produits
                    </button>
                </div>
                <Link href="/promotions" className="text-orange-600 hover:text-orange-700 font-bold transition-colors flex items-center space-x-2">
                    Promotions
                </Link>
                <Link href="/offre-responsable" className="text-green-600 hover:text-green-700 font-bold transition-colors flex items-center space-x-2">
                    Offre responsable
                </Link>
              </div>
              <div className="flex items-center space-x-2">
              <Link href="/essentiels" className="text-blue-700 hover:text-blue-600 font-bold transition-colors flex items-center space-x-2">
                Les Essentiels
              </Link>
              <Link href="/devis" className="text-gray-700 hover:text-gray-600 font-bold transition-colors flex items-center space-x-2">
                Devis & Commande rapide
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-bold transition-colors flex items-center space-x-2">
                Contactez-nous
              </Link>
              </div>
            </div>
          </nav>

          {/* Barre de contact grise */}
          <div className="hidden md:block bg-gray-100 border-t border-gray-200 w-full">
            <div className="flex justify-center items-center px-4">
              <div className="text-center">
                <span className="text-gray-700 font-medium text-sm">Nous contacter</span>
                <span className="text-gray-600 mx-2">•</span>
                <span className="text-gray-600">Nos équipes sont à votre écoute du lundi au vendredi 09H-12h30 et 13h30-17H au </span>
                <span className="text-blue-600 font-semibold">06 72 14 54 74</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <nav className="space-y-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCategoryNavOpen(true);
                    }}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                  <Link 
                    href="/produits" 
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tous nos produits
                  </Link>
                </div>
                <Link 
                  href="/promotions" 
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Promotions
                </Link>
                <Link 
                  href="/offre-responsable" 
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Offre responsable
                </Link>
                <Link 
                  href="/essentiels" 
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Les Essentiels
                </Link>
                <Link 
                  href="/devis" 
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Devis & Commande rapide
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contactez-nous
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Navigation par catégories */}
      <CategoryNavigation 
        isOpen={isCategoryNavOpen} 
        onClose={() => setIsCategoryNavOpen(false)} 
      />
    </>
  );
} 