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
          {/* Titre principal */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-blue-600">
            Matériel sportif pour Collectivités, Collèges, Lycées, Écoles, Clubs Sportifs et Entreprises
          </h1>
          
          {/* Images côte à côte */}
          <div className="grid md:grid-cols-3 gap-6 w-fit mx-auto mb-16">
            {/* Image principale - prend 2 colonnes */}
            <div className="md:col-span-2">
              <Link href="https://jbfsport.com/sports-raquettes" className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden flex justify-center items-center">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/carousel/slider-sports-raquettes-v2.webp?frz-v=95" 
                  alt="JBF Sport" 
                  width={800} 
                  height={400} 
                  className="w-full h-full object-cover" 
                />
              </Link>
            </div>
            
            {/* Deux images à côté - chacune prend 1 colonne */}
            <div className="md:col-span-1 space-y-6">
              <Link href="https://jbfsport.com/fontaines-fontaineo" className="w-full h-54 bg-gray-200 rounded-lg overflow-hidden flex justify-center items-center">
                <Image 
                  src="/gradin-20-pieds-stade.webp" 
                  alt="JBF Sport" 
                  width={400} 
                  height={176} 
                  className="w-full h-full object-cover" 
                />
              </Link>
              <Link href="https://jbfsport.com/tribunes-containers" className="w-full h-54 bg-gray-200 rounded-lg overflow-hidden flex justify-center items-center">
                <Image 
                  src="/remorque-fontaine-trailo.webp" 
                  alt="JBF Sport" 
                  width={800} 
                  height={352} 
                  className="w-full h-full object-cover" 
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
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              PLAN DE SUBVENTION &quot;5000 ÉQUIPEMENTS - GÉNÉRATION 2024&quot; : 
              <span className="text-orange-600"> VOUS AVEZ UN PROJET ?</span>
            </h2>
            
            {/* Sous-titre */}
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Le plan d&apos;État &quot;5000 équipements sportifs - Génération 2024&quot; agit dans la continuité du plan 
              <span className="text-orange-600 font-medium"> &quot;5000 terrains de sport&quot;</span> initié par le gouvernement. 
              Il prévoit la construction de 5000 équipements sportifs d&apos;ici 2026.
            </p>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed mt-4">
              Vous avez un projet et vous souhaitez nous en faire part ? Nous sommes à votre écoute !
            </p>
          </div>
          
          {/* 3 Images avec textes et boutons */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
            {/* Première image */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="https://www.casalsport.com/fstrz/r/s/www.casalsport.com/contentCAS/images/homepage/a-la-une/5000-equipements-projets.webp?frz-v=95" 
                  alt="Vous avez un PROJET ?" 
                  width={400} 
                  height={300} 
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Overlay avec texte et bouton */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="text-xl font-bold mb-4 text-center">Vous avez un PROJET ?</h3>
                  <Link href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
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
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Overlay avec texte et bouton */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="text-xl font-bold mb-4 text-center">Notre Offre</h3>
                  <Link href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
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
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Overlay avec texte et bouton */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="text-xl font-bold mb-4 text-center">Les terrains multisports</h3>
                  <Link href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Demander un Devis
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bouton Résumé Démarches Eligibilité */}
          <div className="text-center">
            <Link href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
              Résumé Démarches Eligibilité
            </Link>
          </div>
        </div>
      </section>

      {/* Section Marques professionnelles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            LE CHOIX DES MEILLEURS MARQUES PROFESSIONNELLES
          </h2>
          
          {/* 4 premières marques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="text-center">
              <div className="w-96 h-64 mx-auto mb-4 flex items-center justify-center">
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
              <div className="w-96 h-64 mx-auto mb-4 flex items-center justify-center">
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
              <div className="w-96 h-64 mx-auto mb-4 flex items-center justify-center">
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
              <div className="w-96 h-64 mx-auto mb-4 flex items-center justify-center">
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
          
          {/* Autres marques sur une ligne */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Molten.png" 
                alt="Molten" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Yonex.png" 
                alt="Yonex" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Mikasa.png" 
                alt="Mikasa" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Dimasport.png" 
                alt="Dimasport" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Freetness.png" 
                alt="Freetness" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Petzl.png" 
                alt="Petzl" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Gymnova.png" 
                alt="Gymnova" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            <div className="w-24 h-16 flex items-center justify-center">
              <Image 
                src="https://www.manutan.fr/GRP/LOGO/Adidas.png" 
                alt="Adidas" 
                width={96} 
                height={64} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
          </div>
          
          {/* Bouton Découvrez nos partenaires */}
          <div className="text-center">
            <Link href="/marques" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Découvrez nos partenaires
            </Link>
          </div>
        </div>
      </section>

      {/* Section Meilleures ventes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
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
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Ce que disent nos clients
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Section Maillage interne - Catégories vedettes */}
      <section className="py-16 bg-white">
        <div className="w-90/100 mx-auto px-4">
          <CategorySitemap />
        </div>
      </section>
    </div>
  );
}
