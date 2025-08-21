"use client";

import { useEffect, useState } from 'react';

interface StructuredDataProps {
  type: 'category' | 'subcategory' | 'subsubcategory' | 'product';
  slug: string;
  parentSlug?: string;
  grandParentSlug?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  sku: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  isProductCategorySelected: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

export default function StructuredData({ type, slug, parentSlug, grandParentSlug }: StructuredDataProps) {
  const [structuredData, setStructuredData] = useState<string>('');

  useEffect(() => {
    const generateStructuredData = async () => {
      try {
        let data: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
          "@context": "https://schema.org",
          "publisher": {
            "@type": "Organization",
            "name": "JBF Sport",
            "url": "https://jbfsport.com",
            "logo": "https://jbfsport.com/JBFSPORTLOGO.png"
          }
        };

        // Récupération des données depuis l'API
        let response;
        let products: Product[] = [];

        switch (type) {
          case 'category':
            response = await fetch(`/api/categories/${slug}/products/featured`);
            if (response.ok) {
              products = await response.json();
            }
            
            data = {
              ...data,
              "@type": "CollectionPage",
              "name": `Catégorie ${slug}`,
              "description": `Découvrez notre gamme de matériel sportif dans la catégorie ${slug}`,
              "url": `https://jbfsport.com/${slug}`,
              "mainEntity": {
                "@type": "ItemList",
                "name": `Produits de la catégorie ${slug}`,
                "numberOfItems": products.length,
                "itemListElement": products.map((product, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Product",
                    "name": product.name,
                    "description": product.shortDescription || product.description || "",
                    "sku": product.sku,
                    "image": product.images && product.images.length > 0 ? product.images[0] : "",
                    "offers": {
                      "@type": "Offer",
                      "price": product.salePrice || product.price,
                      "priceCurrency": "EUR",
                      "availability": "https://schema.org/InStock"
                    }
                  }
                }))
              }
            };
            break;

          case 'subcategory':
            response = await fetch(`/api/subcategories/${slug}/products/featured`);
            if (response.ok) {
              products = await response.json();
            }
            
            data = {
              ...data,
              "@type": "CollectionPage",
              "name": `Sous-catégorie ${slug}`,
              "description": `Découvrez notre gamme de matériel sportif dans la sous-catégorie ${slug}`,
              "url": `https://jbfsport.com/${grandParentSlug}/${slug}`,
              "mainEntity": {
                "@type": "ItemList",
                "name": `Produits de la sous-catégorie ${slug}`,
                "numberOfItems": products.length,
                "itemListElement": products.map((product, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Product",
                    "name": product.name,
                    "description": product.shortDescription || product.description || "",
                    "sku": product.sku,
                    "image": product.images && product.images.length > 0 ? product.images[0] : "",
                    "offers": {
                      "@type": "Offer",
                      "price": product.salePrice || product.price,
                      "priceCurrency": "EUR",
                      "availability": "https://schema.org/InStock"
                    }
                  }
                }))
              }
            };
            break;

          case 'subsubcategory':
            response = await fetch(`/api/subsubcategories/${slug}/products/featured`);
            if (response.ok) {
              products = await response.json();
            }
            
            data = {
              ...data,
              "@type": "CollectionPage",
              "name": `Sous-sous-catégorie ${slug}`,
              "description": `Découvrez notre gamme de matériel sportif dans la sous-sous-catégorie ${slug}`,
              "url": `https://jbfsport.com/${grandParentSlug}/${parentSlug}/${slug}`,
              "mainEntity": {
                "@type": "ItemList",
                "name": `Produits de la sous-sous-catégorie ${slug}`,
                "numberOfItems": products.length,
                "itemListElement": products.map((product, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Product",
                    "name": product.name,
                    "description": product.shortDescription || product.description || "",
                    "sku": product.sku,
                    "image": product.images && product.images.length > 0 ? product.images[0] : "",
                    "offers": {
                      "@type": "Offer",
                      "price": product.salePrice || product.price,
                      "priceCurrency": "EUR",
                      "availability": "https://schema.org/InStock"
                    }
                  }
                }))
              }
            };
            break;

          case 'product':
            response = await fetch(`/api/products/${slug}`);
            if (response.ok) {
              const product = await response.json();
              data = {
                ...data,
                "@type": "Product",
                "name": product.name,
                "description": product.shortDescription || product.description || "",
                "sku": product.sku,
                "image": product.images && product.images.length > 0 ? product.images[0] : "",
                "offers": {
                  "@type": "Offer",
                  "price": product.salePrice || product.price,
                  "priceCurrency": "EUR",
                  "availability": "https://schema.org/InStock"
                }
              };
            }
            break;
        }

        setStructuredData(JSON.stringify(data));
      } catch (error) {
        console.error('Erreur lors de la génération du JSON-LD:', error);
      }
    };

    generateStructuredData();
  }, [type, slug, parentSlug, grandParentSlug]);

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredData }}
    />
  );
} 