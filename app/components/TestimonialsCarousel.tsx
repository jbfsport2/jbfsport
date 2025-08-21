"use client";

import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    title: "Achat simple tarif intéressant",
    content: "Simplicité, nombre de références disponibles, délai respecté, qualité des produits et service client réactif.",
    author: "Marc D.",
    date: "15/12/2024"
  },
  {
    id: 2,
    title: "Service client exceptionnel",
    content: "Équipe très professionnelle, conseils pertinents et livraison dans les délais annoncés. Prix compétitifs.",
    author: "Sophie L.",
    date: "08/12/2024"
  },
  {
    id: 3,
    title: "Large gamme de produits",
    content: "Catalogue très complet avec des marques reconnues. Commande facile et suivi en temps réel.",
    author: "Pierre M.",
    date: "01/12/2024"
  },
  {
    id: 4,
    title: "Livraison rapide et soignée",
    content: "Colis bien emballés, matériel conforme aux descriptions. Prix attractifs et délais respectés.",
    author: "Marie C.",
    date: "25/11/2024"
  },
  {
    id: 5,
    title: "Expertise technique reconnue",
    content: "Conseils techniques de qualité, produits adaptés à nos besoins. Équipe à l'écoute et réactive.",
    author: "Thomas R.",
    date: "18/11/2024"
  },
  {
    id: 6,
    title: "Satisfaction client maximale",
    content: "Commande traitée rapidement, produits de qualité et service impeccable. Prix HT très intéressants.",
    author: "Claire B.",
    date: "10/11/2024"
  },
  {
    id: 7,
    title: "Qualité professionnelle",
    content: "Matériel de haute qualité, livraison dans les délais et service après-vente efficace. Très satisfait.",
    author: "Laurent F.",
    date: "05/11/2024"
  },
  {
    id: 8,
    title: "Prix compétitifs",
    content: "Tarifs professionnels très attractifs pour du matériel de qualité. Recommande vivement.",
    author: "Nathalie P.",
    date: "28/10/2024"
  },
  {
    id: 9,
    title: "Conseils personnalisés",
    content: "Équipe à l'écoute de nos besoins, conseils adaptés et produits parfaitement adaptés.",
    author: "David M.",
    date: "20/10/2024"
  },
  {
    id: 10,
    title: "Livraison express",
    content: "Commande urgente traitée en priorité, livraison express respectée. Service client au top.",
    author: "Isabelle R.",
    date: "15/10/2024"
  },
  {
    id: 11,
    title: "Gamme complète",
    content: "Tous nos besoins couverts en un seul endroit. Économies de temps et d'argent garanties.",
    author: "François L.",
    date: "10/10/2024"
  },
  {
    id: 12,
    title: "Installation incluse",
    content: "Service d'installation professionnel inclus, montage parfait et formation du personnel.",
    author: "Caroline D.",
    date: "05/10/2024"
  },
  {
    id: 13,
    title: "Garantie étendue",
    content: "Garantie 3 ans sur tous les produits, service technique réactif et pièces détachées disponibles.",
    author: "Michel B.",
    date: "30/09/2024"
  },
  {
    id: 14,
    title: "Formation incluse",
    content: "Formation du personnel incluse, documentation complète et support technique permanent.",
    author: "Anne-Marie S.",
    date: "25/09/2024"
  },
  {
    id: 15,
    title: "Maintenance préventive",
    content: "Contrat de maintenance préventive, interventions programmées et suivi qualité rigoureux.",
    author: "Jean-Luc T.",
    date: "20/09/2024"
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Nombre de témoignages visibles selon la taille d'écran
  const getTestimonialsPerView = () => {
    if (isMobile) return 1;
    if (isTablet) return 3;
    return 5;
  };

  const testimonialsPerView = getTestimonialsPerView();

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + testimonialsPerView;
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      });
    }, 6000); // Change toutes les 6 secondes

    return () => clearInterval(interval);
  }, [testimonialsPerView]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + testimonialsPerView;
      return nextIndex >= testimonials.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const prevIndexNew = prevIndex - testimonialsPerView;
      return prevIndexNew < 0 ? Math.max(0, testimonials.length - testimonialsPerView) : prevIndexNew;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index * testimonialsPerView);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg 
        key={i} 
        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" 
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
    ));
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + testimonialsPerView);

  return (
    <div className="relative max-w-full mx-auto">
      {/* Boutons de navigation - Masqués sur mobile */}
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Carousel avec témoignages visibles selon la taille d'écran */}
      <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-hidden px-4 sm:px-8 lg:px-20">
        {visibleTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="flex-shrink-0 w-full sm:w-72 lg:w-80 bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center mb-3 sm:mb-4">
              {renderStars()}
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 text-center">
              {testimonial.title}
            </h3>
            
            <div className="mb-3 sm:mb-4">
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed italic text-center">
                &quot;{testimonial.content}&quot;
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">{testimonial.author}</span>
                <span className="mx-2">•</span>
                <span>{testimonial.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicateurs de pagination */}
      <div className="flex justify-center space-x-2 mt-6 sm:mt-8">
        {Array.from({ length: Math.ceil(testimonials.length / testimonialsPerView) }, (_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-200 ${
              Math.floor(currentIndex / testimonialsPerView) === i ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 