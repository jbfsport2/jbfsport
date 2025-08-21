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
  Upload
} from 'lucide-react';
import SearchAndPagination from '@/app/components/admin/SearchAndPagination';
import AdminPageWrapper from '@/app/components/admin/AdminPageWrapper';

interface SubCategory {
  id: string;
  name: string;
}

interface SubSubCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
  subCategoryId: string;
  subCategory: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface SubSubCategoryForm {
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  subCategoryId: string;
}

export default function SubSubCategoriesManagement() {
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingSubSubCategory, setEditingSubSubCategory] = useState<SubSubCategory | null>(null);
  const [formData, setFormData] = useState<SubSubCategoryForm>({
    name: '',
    description: '',
    order: 0,
    isActive: true,
    subCategoryId: ''
  });
  const [bulkImportData, setBulkImportData] = useState({
    subCategoryId: '',
    subSubCategories: '',
    order: 0
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
      
      const [subSubCategoriesResponse, subCategoriesResponse] = await Promise.all([
        fetch('/api/admin/subsubcategories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/subcategories', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (subSubCategoriesResponse.ok && subCategoriesResponse.ok) {
        const [subSubCategoriesData, subCategoriesData] = await Promise.all([
          subSubCategoriesResponse.json(),
          subCategoriesResponse.json()
        ]);
        
        setSubSubCategories(subSubCategoriesData);
        setSubCategories(subCategoriesData);
        
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
      const url = editingSubSubCategory 
        ? `/api/admin/subsubcategories/${editingSubSubCategory.id}`
        : '/api/admin/subsubcategories';
      
      const method = editingSubSubCategory ? 'PUT' : 'POST';

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
        setEditingSubSubCategory(null);
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

  const handleEdit = (subSubCategory: SubSubCategory) => {
    setEditingSubSubCategory(subSubCategory);
    setFormData({
      name: subSubCategory.name,
      description: subSubCategory.description,
      order: subSubCategory.order,
      isActive: subSubCategory.isActive,
      subCategoryId: subSubCategory.subCategoryId
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sous-sous-catégorie ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/subsubcategories/${id}`, {
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

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImportData.subCategoryId || !bulkImportData.subSubCategories.trim()) {
      alert('Veuillez sélectionner une sous-catégorie et saisir les sous-sous-catégories');
      return;
    }

    setIsBulkImporting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const subSubCategoryNames = bulkImportData.subSubCategories
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (subSubCategoryNames.length === 0) {
        alert('Aucune sous-sous-catégorie valide trouvée');
        return;
      }

      const response = await fetch('/api/admin/subsubcategories/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subCategoryId: bulkImportData.subCategoryId,
          subSubCategories: subSubCategoryNames,
          startOrder: bulkImportData.order
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.created} sous-sous-catégories créées avec succès !`);
        setShowBulkImport(false);
        setBulkImportData({ subCategoryId: '', subSubCategories: '', order: 0 });
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      order: 0,
      isActive: true,
      subCategoryId: subCategories.length > 0 ? subCategories[0].id : ''
    });
  };

  const resetBulkImportForm = () => {
    setBulkImportData({
      subCategoryId: subCategories.length > 0 ? subCategories[0].id : '',
      subSubCategories: '',
      order: 0
    });
  };

  const openNewForm = () => {
    setEditingSubSubCategory(null);
    resetForm();
    setShowForm(true);
  };

  const openBulkImportForm = () => {
    resetBulkImportForm();
    setShowBulkImport(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                className="flex items-center space-x-2 text-gray-800 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Sous-sous-catégories</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={openNewForm}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Sous-sous-catégorie
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
      <main className="max-w-80/100 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulaire d'import en masse */}
        {showBulkImport && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Import en masse de sous-sous-catégories
              </h2>
              <button
                onClick={() => setShowBulkImport(false)}
                className="text-gray-800 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bulkSubCategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-catégorie parente *
                  </label>
                  <select
                    id="bulkSubCategoryId"
                    required
                    value={bulkImportData.subCategoryId}
                    onChange={(e) => setBulkImportData({ ...bulkImportData, subCategoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bulkOrder" className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre de départ
                  </label>
                  <input
                    type="number"
                    id="bulkOrder"
                    value={bulkImportData.order}
                    onChange={(e) => setBulkImportData({ ...bulkImportData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bulkSubSubCategories" className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-sous-catégories (une par ligne) *
                </label>
                <textarea
                  id="bulkSubSubCategories"
                  rows={8}
                  required
                  value={bulkImportData.subSubCategories}
                  onChange={(e) => setBulkImportData({ ...bulkImportData, subSubCategories: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  placeholder="Sous-sous-catégorie 1&#10;Sous-sous-catégorie 2&#10;Sous-sous-catégorie 3&#10;..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Saisissez une sous-sous-catégorie par ligne. Les slugs seront générés automatiquement.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkImport(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

        {/* Formulaire existant */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingSubSubCategory ? 'Modifier la sous-sous-catégorie' : 'Nouvelle sous-sous-catégorie'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  />
                </div>

                <div>
                  <label htmlFor="subCategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-catégorie parente *
                  </label>
                  <select
                    id="subCategoryId"
                    required
                    value={formData.subCategoryId}
                    onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre
                  </label>
                  <input
                    type="number"
                    id="order"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Sous-sous-catégorie active
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

        {/* Liste des sous-sous-catégories avec recherche et pagination */}
        <AdminPageWrapper>
          <SearchAndPagination
            data={subSubCategories}
            searchFields={[
              'name',
              'slug',
              'description',
              (subSubCategory: SubSubCategory) => subSubCategory.subCategory.category.name,
              (subSubCategory: SubSubCategory) => subSubCategory.subCategory.name
            ]}
            placeholder="Rechercher par nom, slug, description, catégorie..."
            itemsPerPage={30}

          >
            {(paginatedSubSubCategories) => (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Liste des sous-sous-catégories</h3>
                </div>
                
                {paginatedSubSubCategories.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">
                      {subSubCategories.length === 0 ? 'Aucune sous-sous-catégorie trouvée' : 'Aucune sous-sous-catégorie ne correspond à votre recherche'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hiérarchie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ordre
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
                        {paginatedSubSubCategories.map((subSubCategory) => (
                          <tr key={subSubCategory.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{subSubCategory.name}</div>
                              <div className="text-sm text-gray-500">{subSubCategory.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="flex items-center space-x-1">
                                  <span className="text-blue-600 font-medium">{subSubCategory.subCategory.category.name}</span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-green-600 font-medium">{subSubCategory.subCategory.name}</span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-purple-600 font-medium">{subSubCategory.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {subSubCategory.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {subSubCategory.order}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                subSubCategory.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subSubCategory.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(subSubCategory)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(subSubCategory.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
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