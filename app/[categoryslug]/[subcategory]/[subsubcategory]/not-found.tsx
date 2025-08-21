import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

export default function SubSubCategoryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-gray-400 text-8xl mb-6">📁</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sous-sous-catégorie non trouvée
        </h1>
        
        <p className="text-gray-600 mb-8">
          La sous-sous-catégorie que vous recherchez n&apos;existe pas ou a été supprimée.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l&apos;accueil
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Retour en arrière
          </Link>
        </div>
      </div>
    </div>
  );
} 