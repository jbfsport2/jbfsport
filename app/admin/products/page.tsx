"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  Square,
  CheckSquare
} from 'lucide-react';
import SearchAndPagination from '@/app/components/admin/SearchAndPagination';
import AdminPageWrapper from '@/app/components/admin/AdminPageWrapper';
import Image from 'next/image';

interface SubCategory {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
}

interface SubSubCategory {
  id: string;
  name: string;
  subCategory: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  priceHT: number;
  priceTTC: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  isProductCategorySelected: boolean;
  stock: number;
  sku: string;
  subCategoryId: string | null;
  subSubCategoryId: string | null;
  subCategory: SubCategory | null;
  subSubCategory: SubSubCategory | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductForm {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  priceHT: number;
  priceTTC: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  isProductCategorySelected: boolean;
  stock: number;
  sku: string;
  subCategoryId: string;
  subSubCategoryId: string;
}

interface BulkImportData {
  subCategoryId: string;
  subSubCategoryId: string;
  products: string;
  price: number;
  stock: number;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    priceHT: 0,
    priceTTC: 0,
    imageUrl: '',
    isActive: true,
    isFeatured: false,
    isProductCategorySelected: false,
    stock: 0,
    sku: '',
    subCategoryId: '',
    subSubCategoryId: ''
  });
  const [bulkImportData, setBulkImportData] = useState<BulkImportData>({
    subCategoryId: '',
    subSubCategoryId: '',
    products: '',
    price: 0,
    stock: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const router = useRouter();



  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchData();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const [productsResponse, subCategoriesResponse, subSubCategoriesResponse] = await Promise.all([
        fetch('/api/admin/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/subcategories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/subsubcategories', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (productsResponse.ok && subCategoriesResponse.ok && subSubCategoriesResponse.ok) {
        const [productsData, subCategoriesData, subSubCategoriesData] = await Promise.all([
          productsResponse.json(),
          subCategoriesResponse.json(),
          subSubCategoriesResponse.json()
        ]);
        
        console.log('📊 Données récupérées:', {
          products: productsData.length,
          sampleProduct: productsData[0],
          isProductCategorySelected: productsData[0]?.isProductCategorySelected
        });
        
        // Debug spécifique pour isProductCategorySelected
        console.log('🔍 Debug isProductCategorySelected:');
        productsData.forEach((product: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          if (index < 30) { // Affiche seulement les 5 premiers pour éviter le spam
            console.log(`  Produit ${index + 1}: "${product.name}" - isProductCategorySelected: ${product.isProductCategorySelected}`);
          }
        });
        
        setProducts(productsData);
        setSubCategories(subCategoriesData);
        setSubSubCategories(subSubCategoriesData);
        
        if (subCategoriesData.length > 0 && !formData.subCategoryId) {
          setFormData(prev => ({ ...prev, subCategoryId: subCategoriesData[0].id }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de l\'opération');
      }
    } catch (error) {
      console.error('Erreur lors de l\'opération:', error);
      alert('Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImportData.subCategoryId || !bulkImportData.products.trim()) {
      alert('Veuillez sélectionner une catégorie et saisir les produits');
      return;
    }

    setIsBulkImporting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const productNames = bulkImportData.products
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (productNames.length === 0) {
        alert('Aucun produit valide trouvé');
        return;
      }

      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subCategoryId: bulkImportData.subCategoryId,
          subSubCategoryId: bulkImportData.subSubCategoryId || null,
          products: productNames,
          price: bulkImportData.price,
          stock: bulkImportData.stock
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.created} produits créés avec succès !`);
        setShowBulkImport(false);
        setBulkImportData({ subCategoryId: '', subSubCategoryId: '', products: '', price: 0, stock: 0 });
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de l\'import en masse');
      }
    } catch (error) {
      console.error('Erreur lors de l\'import en masse:', error);
      alert('Erreur lors de l\'import en masse');
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price,
      priceHT: product.priceHT || 0,
      priceTTC: product.priceTTC || 0,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isProductCategorySelected: product.isProductCategorySelected || false,
      stock: product.stock,
      sku: product.sku || '',
      subCategoryId: product.subCategoryId || '',
      subSubCategoryId: product.subSubCategoryId || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Toggle pour mettre en avant sur la page principale
  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      // Trouve le produit existant pour récupérer tous les champs
      const existingProduct = products.find(p => p.id === id);
      if (!existingProduct) {
        alert('Produit non trouvé');
        return;
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: existingProduct.name,
          description: existingProduct.description || '',
          shortDescription: existingProduct.shortDescription || '',
          price: existingProduct.price,
          priceHT: existingProduct.priceHT || 0,
          priceTTC: existingProduct.priceTTC || 0,
          imageUrl: existingProduct.imageUrl || '',
          isActive: existingProduct.isActive,
          isFeatured: isFeatured, // Nouvelle valeur
          isProductCategorySelected: existingProduct.isProductCategorySelected || false,
          stock: existingProduct.stock,
          sku: existingProduct.sku || '',
          subCategoryId: existingProduct.subCategoryId || '',
          subSubCategoryId: existingProduct.subSubCategoryId || ''
        })
      });

      if (response.ok) {
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  // Toggle pour mettre en avant dans la catégorie
  const handleToggleCategoryFeatured = async (id: string, isProductCategorySelected: boolean) => {
    try {
      // Trouve le produit existant pour récupérer tous les champs
      const existingProduct = products.find(p => p.id === id);
      if (!existingProduct) {
        alert('Produit non trouvé');
        return;
      }

      console.log('🔄 Toggle catégorie:', {
        id,
        currentValue: existingProduct.isProductCategorySelected,
        newValue: isProductCategorySelected
      });

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: existingProduct.name,
          description: existingProduct.description || '',
          shortDescription: existingProduct.shortDescription || '',
          price: existingProduct.price,
          priceHT: existingProduct.priceHT || 0,
          priceTTC: existingProduct.priceTTC || 0,
          imageUrl: existingProduct.imageUrl || '',
          isActive: existingProduct.isActive,
          isFeatured: existingProduct.isFeatured,
          isProductCategorySelected: isProductCategorySelected, // Nouvelle valeur
          stock: existingProduct.stock,
          sku: existingProduct.sku || '',
          subCategoryId: existingProduct.subCategoryId || '',
          subSubCategoryId: existingProduct.subSubCategoryId || ''
        })
      });

      if (response.ok) {
        console.log('✅ API mise à jour réussie, rafraîchissement des données...');
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        alert(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('❌ Erreur toggle catégorie:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      priceHT: 0,
      priceTTC: 0,
      imageUrl: '',
      isActive: true,
      isFeatured: false,
      isProductCategorySelected: false,
      stock: 0,
      sku: '',
      subCategoryId: subCategories.length > 0 ? subCategories[0].id : '',
      subSubCategoryId: ''
    });
  };

  const resetBulkImportForm = () => {
    setBulkImportData({
      subCategoryId: subCategories.length > 0 ? subCategories[0].id : '',
      subSubCategoryId: '',
      products: '',
      price: 0,
      stock: 0
    });
  };

  const openNewForm = () => {
    setEditingProduct(null);
    resetForm();
    setShowForm(true);
  };

  const openBulkImportForm = () => {
    resetBulkImportForm();
    setShowBulkImport(true);
  };

  const getFilteredSubSubCategories = (subCategoryId: string) => {
    return subSubCategories.filter(ssc => ssc.subCategory.id === subCategoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={openNewForm}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Produit
              </button>
              <button
                onClick={openBulkImportForm}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import en masse
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-90/100 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulaire d'import en masse */}
        {showBulkImport && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Import en masse de produits
              </h2>
              <button
                onClick={() => setShowBulkImport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="bulkSubCategoryId" className="block text-sm font-medium text-gray-900 mb-1">
                    Sous-catégorie *
                  </label>
                  <select
                    id="bulkSubCategoryId"
                    required
                    value={bulkImportData.subCategoryId}
                    onChange={(e) => {
                      setBulkImportData({ ...bulkImportData, subCategoryId: e.target.value, subSubCategoryId: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.category.name} → {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bulkSubSubCategoryId" className="block text-sm font-medium text-gray-900 mb-1">
                    Sous-sous-catégorie (optionnel)
                  </label>
                  <select
                    id="bulkSubSubCategoryId"
                    value={bulkImportData.subSubCategoryId}
                    onChange={(e) => setBulkImportData({ ...bulkImportData, subSubCategoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Aucune (produit direct dans sous-catégorie)</option>
                    {getFilteredSubSubCategories(bulkImportData.subCategoryId).map((subSubCategory) => (
                      <option key={subSubCategory.id} value={subSubCategory.id}>
                        {subSubCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bulkPrice" className="block text-sm font-medium text-gray-900 mb-1">
                    Prix par défaut (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="bulkPrice"
                    value={bulkImportData.price}
                    onChange={(e) => setBulkImportData({ ...bulkImportData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bulkStock" className="block text-sm font-medium text-gray-900 mb-1">
                    Stock par défaut
                  </label>
                  <input
                    type="number"
                    id="bulkStock"
                    value={bulkImportData.stock}
                    onChange={(e) => setBulkImportData({ ...bulkImportData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bulkProducts" className="block text-sm font-medium text-gray-900 mb-1">
                  Produits (un par ligne) *
                </label>
                <textarea
                  id="bulkProducts"
                  rows={8}
                  required
                  value={bulkImportData.products}
                  onChange={(e) => setBulkImportData({ ...bulkImportData, products: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Produit 1&#10;Produit 2&#10;Produit 3&#10;..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Saisissez un produit par ligne. Les slugs et SKUs seront générés automatiquement.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkImport(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isBulkImporting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isBulkImporting ? 'Import en cours...' : 'Importer en masse'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulaire de produit */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-900 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="subCategoryId" className="block text-sm font-medium text-gray-900 mb-1">
                    Sous-catégorie *
                  </label>
                  <select
                    id="subCategoryId"
                    required
                    value={formData.subCategoryId}
                    onChange={(e) => {
                      setFormData({ ...formData, subCategoryId: e.target.value, subSubCategoryId: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.category.name} → {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subSubCategoryId" className="block text-sm font-medium text-gray-900 mb-1">
                    Sous-sous-catégorie (optionnel)
                  </label>
                  <select
                    id="subSubCategoryId"
                    value={formData.subSubCategoryId}
                    onChange={(e) => setFormData({ ...formData, subSubCategoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Aucune (produit direct dans sous-catégorie)</option>
                    {getFilteredSubSubCategories(formData.subCategoryId).map((subSubCategory) => (
                      <option key={subSubCategory.id} value={subSubCategory.id}>
                        {subSubCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-900 mb-1">
                    URL de l&apos;image
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-900 mb-1">
                    Prix TTC (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="priceHT" className="block text-sm font-medium text-gray-900 mb-1">
                    Prix HT (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="priceHT"
                    value={formData.priceHT}
                    onChange={(e) => setFormData({ ...formData, priceHT: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-900 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-900 mb-1">
                  Description courte
                </label>
                <input
                  type="text"
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
                  Description complète
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Produit actif
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                    Produit mis en avant (page principale)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isProductCategorySelected"
                    checked={formData.isProductCategorySelected}
                    onChange={(e) => setFormData({ ...formData, isProductCategorySelected: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isProductCategorySelected" className="ml-2 block text-sm text-gray-900">
                    Mis en avant dans la catégorie
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des produits avec recherche et pagination */}
        <AdminPageWrapper>
          <SearchAndPagination
            data={products}
            searchFields={[
              'name',
              'sku',
              (product: Product) => product.subCategory?.category?.name || '',
              (product: Product) => product.subSubCategory?.name || '',
              (product: Product) => product.subCategory?.name || ''
            ]}
            placeholder="Rechercher par nom, SKU, catégorie..."
            itemsPerPage={25}

          >
            {(paginatedProducts) => (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Liste des produits</h3>
                </div>
                
                {paginatedProducts.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">
                      {products.length === 0 ? 'Aucun produit trouvé' : 'Aucun produit ne correspond à votre recherche'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  {product.imageUrl ? (
                                    <Image
                                      className="h-12 w-12 rounded-md object-cover"
                                      src={product.imageUrl}
                                      alt={product.name}
                                      width={500}
                                      height={500}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                                      <ImageIcon className="h-6 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.sku || 'Aucun SKU'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.subSubCategory ? (
                                  <div>
                                    <div className="text-blue-600">{product.subSubCategory.subCategory.category.name}</div>
                                    <div className="text-green-600">→ {product.subSubCategory.subCategory.name}</div>
                                    <div className="text-purple-600">→ {product.subSubCategory.name}</div>
                                  </div>
                                ) : product.subCategory ? (
                                  <div>
                                    <div className="text-blue-600">{product.subCategory.category.name}</div>
                                    <div className="text-green-600">→ {product.subCategory.name}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Non catégorisé</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">{product.price}€ TTC</div>
                                {product.priceHT > 0 && (
                                  <div className="text-gray-500">{product.priceHT}€ HT</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>{product.stock}</div>
                                <div className="text-xs text-gray-500">
                                  Cat: {product.isProductCategorySelected ? '✅' : '❌'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {product.isFeatured && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                    Mis en avant (page principale)
                                  </span>
                                )}
                                {product.isProductCategorySelected && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Mis en avant (catégorie)
                                  </span>
                                )}
                              </div>
                            </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {/* Shortcut pour mettre en avant dans la page principale */}
                          <button
                            onClick={() => handleToggleFeatured(product.id, !product.isFeatured)}
                            className={`transition-colors ${
                              product.isFeatured 
                                ? 'text-orange-600 hover:text-orange-800' 
                                : 'text-gray-400 hover:text-orange-600'
                            }`}
                            title={product.isFeatured ? 'Retirer de la page principale' : 'Mettre en avant sur la page principale'}
                          >
                            {product.isFeatured ? (
                              <Star className="w-4 h-4 fill-current" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </button>
                          
                          {/* Shortcut pour mettre en avant dans la catégorie */}
                          <button
                            onClick={() => handleToggleCategoryFeatured(product.id, !product.isProductCategorySelected)}
                            className={`transition-colors ${
                              product.isProductCategorySelected 
                                ? 'text-purple-600 hover:text-purple-800' 
                                : 'text-gray-400 hover:text-purple-600'
                            }`}
                            title={product.isProductCategorySelected ? 'Retirer de la catégorie' : 'Mettre en avant dans la catégorie'}
                          >
                            {product.isProductCategorySelected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </SearchAndPagination>
        </AdminPageWrapper>
      </main>
    </div>
  );
} 