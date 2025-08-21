import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-300 text-black">
      <div className="container mx-auto px-4 py-12">
        {/* Sections principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Section Aide */}
          <div>
            <h3 className="text-lg font-bold mb-4">Aide</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-black hover:text-blue-600 transition-colors duration-200">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-black hover:text-blue-600 transition-colors duration-200">
                  Gestion des cookies
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-black hover:text-blue-600 transition-colors duration-200">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-black hover:text-blue-600 transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-black hover:text-blue-600 transition-colors duration-200">
                  Voir toutes les catégories
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="font-semibold">JBF SPORT</p>
              <p>123 Avenue des Sports</p>
              <p>75001 Paris, France</p>
              <p className="text-sm">SIRET : 123 456 789 00012</p>
              <p className="text-sm">N° TVA : FR12345678900</p>
              <p className="mt-3">
                <span className="font-semibold">Tél : </span>
                <Link href="tel:0672145474" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  06 72 14 54 74
                </Link>
              </p>
              <p className="mt-3">
                <Link href="/contact" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium">
                  Nous contacter →
                </Link>
              </p>
            </div>
          </div>

          {/* Section A Propos */}
          <div>
            <h3 className="text-lg font-bold mb-4">À Propos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/qui-sommes-nous" className="text-black hover:text-blue-600 transition-colors duration-200">
                  Qui sommes-nous ?
                </Link>
              </li>
              <li>
                <Link href="/partenaires" className="text-black hover:text-blue-600 transition-colors duration-200">
                  Nos Partenaires
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-400 pt-8 mb-6"></div>

        {/* Mentions légales */}
        <div className="text-center text-sm">
          <p className="mb-2">
            © 2025 JBF SPORT. Tous droits réservés. Prix affichés en euros et hors TVA.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/mentions-legales" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
              Mentions légales
            </Link>
            <span className="text-gray-600">-</span>
            <Link href="/cookies" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
              Gestion des cookies
            </Link>
          </div>
        </div>

        {/* Crédit Oxelya - discret */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">  
            <Link 
              href="https://www.oxelya.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 underline"
            >
              Site internet créé par Oxelya
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
} 