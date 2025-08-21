"use client";

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SearchAndPaginationProps<T> {
  data: T[];
  searchFields: (string | ((item: T) => string))[];
  placeholder?: string;
  itemsPerPage?: number;
  children: (filteredData: T[]) => React.ReactNode;
}

export default function SearchAndPagination<T>({
  data,
  searchFields,
  placeholder = "Rechercher...",
  itemsPerPage = 20,
  children
}: SearchAndPaginationProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtre les données selon le terme de recherche
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        let searchValue = '';
        
        if (typeof field === 'string') {
          // Recherche par clé directe
          const value = (item as any)[field]; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (value === null || value === undefined) return false;
          
          // Gère les objets imbriqués (ex: "subCategory.category.name")
          if (typeof value === 'object' && value !== null) {
            searchValue = Object.values(value).map(val => String(val)).join(' ');
          } else {
            searchValue = String(value);
          }
        } else if (typeof field === 'function') {
          // Recherche par fonction personnalisée
          searchValue = field(item);
        }
        
        return searchValue.toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchTerm, searchFields]);

  // Calcule la pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Supprimé le callback pour éviter les boucles infinies

  // Reset la page courante quand la recherche change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Statistiques de recherche */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          {searchTerm ? (
            <span>
              {filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''} sur {data.length} total
            </span>
          ) : (
            <span>{data.length} élément{data.length !== 1 ? 's' : ''} au total</span>
          )}
        </div>
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="text-orange-600 hover:text-orange-800 transition-colors"
          >
            Effacer la recherche
          </button>
        )}
      </div>

      {/* Contenu de la table */}
      {children(paginatedData)}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Boutons de navigation */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Première page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Numéros de pages */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      pageNum === currentPage
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Dernière page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 