import Image from "next/image";
import Link from "next/link";
import { Truck, Home as HomeIcon, FileText } from "lucide-react";
import { GiFrance } from "react-icons/gi";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import ProductCarousel from './components/ProductCarousel';
import RandomCategories from './components/RandomCategories';
import TestimonialsCarousel from './components/TestimonialsCarousel';
import CategorySitemap from './components/CategorySitemap';



export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section Héro - Titre et Images */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          {/* Titre principal - Responsive */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 text-blue-600 px-4">
            Matériel sportif pour Collectivités, Collèges, Lycées, Écoles, Clubs Sportifs et Entreprises
          </h1>
          
          {/* Images côte à côte - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl mx-auto mb-8 md:mb-16">
            {/* Image principale - prend 2 colonnes sur desktop, 1 sur mobile */}
            <div className="md:col-span-2">
              <Link href="https://jbfsport.com/sports-raquettes" className="block w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg overflow-hidden">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/carousel/slider-sports-raquettes-v2.webp?frz-v=95" 
                  alt="JBF Sport" 
                  width={800} 
                  height={400} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
              </Link>
            </div>
            
            {/* Deux images à côté - responsive */}
            <div className="md:col-span-1 space-y-3 md:space-y-6">
              <Link href="https://jbfsport.com/fontaines-fontaineo" className="block w-full h-24 sm:h-32 md:h-36 lg:h-40 bg-gray-200 rounded-lg overflow-hidden">
                <Image 
                  src="/gradin-20-pieds-stade.webp" 
                  alt="JBF Sport" 
                  width={400} 
                  height={176} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
              </Link>
              <Link href="https://jbfsport.com/tribunes-containers" className="block w-full h-24 sm:h-32 md:h-36 lg:h-40 bg-gray-200 rounded-lg overflow-hidden">
                <Image 
                  src="/remorque-fontaine-trailo.webp" 
                  alt="JBF Sport" 
                  width={800} 
                  height={352} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
              </Link>
            </div>
          </div>
          
          {/* 6 icônes avec descriptions */}
          <div className="grid grid-cols-1 md:flex justify-center items-center gap-4">
            <div className="text-center flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <HomeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex flex-col ml-2">
              <p className="text-sm text-gray-600 mb-1">Plus de 70 000</p>
              <p className="text-sm font-medium text-gray-800">références en ligne</p>
              </div>
            </div>
            
            <div className="text-center flex items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex flex-col ml-2">
              <p className="text-sm text-gray-600 mb-1">Livraison offerte</p>
              <p className="text-sm font-medium text-gray-800">dès 200€ d&apos;achats HT</p>
              </div>
            </div>
            
            <div className="text-center flex items-center justify-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex flex-col ml-2">
              <p className="text-sm text-gray-600 mb-1">Devis gratuit</p>
              <p className="text-sm font-medium text-gray-800">sous 48H</p>
              </div>
            </div>
            
            <div className="text-center flex items-center justify-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TfiHeadphoneAlt className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex flex-col ml-2">
              <p className="text-sm text-gray-600 mb-1">Un projet ?</p>
              <p className="text-sm font-medium text-gray-800">Contactez-nous !</p>
              </div>
            </div>
            
            <div className="text-center flex items-center justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <GiFrance className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex flex-col ml-2">
              <p className="text-sm text-gray-600 mb-1">50 experts</p>
              <p className="text-sm font-medium text-gray-800">de proximité</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Plan 5000 équipements */}
      <section className="relative py-16 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/a-la-une/bg-5k.png?frz-v=95)' }}>
        {/* Overlay semi-transparent pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-white/10"></div>
        
        <div className="relative z-10 container mx-auto px-4">
          {/* Titre principal */}
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 px-4">
              PLAN DE SUBVENTION &quot;5000 ÉQUIPEMENTS - GÉNÉRATION 2024&quot; : 
              <span className="text-orange-600"> VOUS AVEZ UN PROJET ?</span>
            </h2>
            
            {/* Sous-titre */}
            <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed px-4">
              Le plan d&apos;État &quot;5000 équipements sportifs - Génération 2024&quot; agit dans la continuité du plan 
              <span className="text-orange-600 font-medium"> &quot;5000 terrains de sport&quot;</span> initié par le gouvernement. 
              Il prévoit la construction de 5000 équipements sportifs d&apos;ici 2026.
            </p>
            <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed mt-4 px-4">
              Vous avez un projet et vous souhaitez nous en faire part ? Nous sommes à votre écoute !
            </p>
          </div>
          
          {/* 3 Images avec textes et boutons - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-6 md:mb-8 px-4">
            {/* Première image */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/a-la-une/5000-equipements-projets.webp?frz-v=95" 
                  alt="Vous avez un PROJET ?" 
                  width={400} 
                  height={300} 
                  className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Overlay avec texte et bouton */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4 text-center">Vous avez un PROJET ?</h3>
                  <Link href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">
                    Contactez-nous
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Deuxième image */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/a-la-une/2-5k-offre.webp?frz-v=95" 
                  alt="Notre Offre" 
                  width={400} 
                  height={300} 
                  className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Overlay avec texte et bouton */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4 text-center">Notre Offre</h3>
                  <Link href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">
                    Feuilleter
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Troisième image */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/a-la-une/3-5k-multisports.webp?frz-v=95" 
                  alt="Les terrains multisports" 
                  width={400} 
                  height={300} 
                  className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Overlay avec texte et bouton */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4 text-center">Les terrains multisports</h3>
                  <Link href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">
                    Demander un Devis
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bouton Résumé Démarches Eligibilité - Responsive */}
          <div className="text-center px-4">
            <Link href="/contact" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors shadow-lg">
              Résumé Démarches Eligibilité
            </Link>
          </div>
        </div>
      </section>

      {/* Section Marques professionnelles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-800 px-4">
            LE CHOIX DES MEILLEURS MARQUES PROFESSIONNELLES
          </h2>
          
          {/* 4 premières marques principales - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
            <div className="text-center">
              <div className="w-full max-w-xs h-32 sm:h-40 md:h-48 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/lp_casal.webp?frz-v=95" 
                  alt="Casal Sport" 
                  width={500} 
                  height={500} 
                  className="max-w-full max-h-full object-contain rounded-lg hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-full max-w-xs h-32 sm:h-40 md:h-48 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/lp_ges.webp?frz-v=95" 
                  alt="GES" 
                  width={500} 
                  height={500} 
                  className="max-w-full max-h-full object-contain rounded-lg hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-full max-w-xs h-32 sm:h-40 md:h-48 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/lp_cornilleau2.webp?frz-v=95" 
                  alt="Cornilleau" 
                  width={500} 
                  height={500} 
                  className="max-w-full max-h-full object-contain rounded-lg hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-full max-w-xs h-32 sm:h-40 md:h-48 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/lp_sveltus.webp?frz-v=95" 
                  alt="Sveltus" 
                  width={500} 
                  height={500} 
                  className="max-w-full max-h-full object-contain rounded-lg hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>
          </div>
          
          {/* Autres marques sur une ligne - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Molten.png" 
                alt="Molten" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Yonex.png" 
                alt="Yonex" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Mikasa.png" 
                alt="Mikasa" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Dimasport.png" 
                alt="Dimasport" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Freetness.png" 
                alt="Freetness" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Petzl.png" 
                alt="Petzl" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Gymnova.png" 
                alt="Gymnova" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-full h-16 sm:h-20 flex items-center justify-center p-2">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Adidas.png" 
                alt="Adidas" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
          </div>
          
          {/* Bouton Découvrez nos partenaires - Responsive */}
          <div className="text-center px-4">
            <Link href="/marques" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">
              Découvrez nos partenaires
            </Link>
          </div>
        </div>
      </section>

      {/* Section Meilleures ventes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-800 px-4">
            Découvrez nos meilleures ventes pour faire les meilleurs choix
          </h2>
          
          {/* Carousel de produits */}
          <ProductCarousel 
            products={[]} 
            title="Nos Meilleures Ventes" 
            subtitle="Découvrez nos produits les plus populaires"
          />

          {/* Section des catégories aléatoires */}
          <RandomCategories />
        </div>
      </section>

      {/* Section Témoignages clients */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-800 px-4">
            Ce que disent nos clients
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Section Maillage interne - Catégories vedettes */}
      <section className="py-16 bg-white">
        <div className="w-full mx-auto px-4">
          <CategorySitemap />
        </div>
      </section>
    </div>
  );
}
