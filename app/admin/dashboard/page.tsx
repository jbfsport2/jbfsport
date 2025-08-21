"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FolderOpen, 
  Folder, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

interface Stats {
  categories: number;
  subCategories: number;
  subSubCategories: number;
  products: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ categories: 0, subCategories: 0, subSubCategories: 0, products: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérification de l'authentification
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Chargement des statistiques
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Administration JBF Sport</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Catégories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.categories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Folder className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sous-catégories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.subCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Package className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sous-sous-catégories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.subSubCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.products}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections de gestion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestion des catégories */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Catégories</h3>
              <Link
                href="/admin/categories"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Gérer
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Gérez les catégories principales de votre site
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                <span>Ajouter une catégorie</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Edit className="w-4 h-4 mr-2" />
                <span>Modifier les catégories</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Supprimer des catégories</span>
              </div>
            </div>
          </div>

          {/* Gestion des sous-catégories */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sous-catégories</h3>
              <Link
                href="/admin/subcategories"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Gérer
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Gérez les sous-catégories de vos catégories principales
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                <span>Ajouter une sous-catégorie</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Edit className="w-4 h-4 mr-2" />
                <span>Modifier les sous-catégories</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Supprimer des sous-catégories</span>
              </div>
            </div>
          </div>

          {/* Gestion des sous-sous-catégories */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sous-sous-catégories</h3>
              <Link
                href="/admin/subsubcategories"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Gérer
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Gérez les sous-sous-catégories de vos sous-catégories
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                <span>Ajouter une sous-sous-catégorie</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Edit className="w-4 h-4 mr-2" />
                <span>Modifier les sous-sous-catégories</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Supprimer des sous-sous-catégories</span>
              </div>
            </div>
          </div>

          {/* Gestion des produits */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Produits</h3>
              <Link
                href="/admin/products"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Gérer
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Gérez tous vos produits avec images et descriptions
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                <span>Ajouter un produit</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Edit className="w-4 h-4 mr-2" />
                <span>Modifier les produits</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Supprimer des produits</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 