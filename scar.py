#!/usr/bin/env python3
"""
Scraper avancé pour CasalSport - Extraction complète des données produits
Génère un CSV avec: nom_produit,prix,imageurl,subcategory,subsubcategory,shortdesc,largedesc
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import csv
import json
import re
from collections import deque
import logging
from typing import List, Dict, Optional, Tuple
import os

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CasalSportProductScraper:
    def __init__(self, base_url="https://www.casalsport.com/fr/cas/", delay=1.5):
        self.base_url = base_url
        self.base_domain = urlparse(base_url).netloc
        self.delay = delay
        self.visited_urls = set()
        self.product_urls = set()
        self.products_data = []
        self.session = requests.Session()
        
        # URLs de catégories à ignorer
        self.category_urls_to_ignore = set()
        self.load_category_urls()
        
        # Charge les produits existants pour éviter les doublons
        self.load_existing_products()
        
        # Headers pour éviter d'être bloqué
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache'
        })

    def load_category_urls(self):
        """Charge les URLs de catégories depuis le fichier JSON généré par le script JS"""
        try:
            if os.path.exists('category_urls.json'):
                with open('category_urls.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.category_urls_to_ignore = set(data.get('flat_urls', []))
                    logger.info(f"✅ {len(self.category_urls_to_ignore)} URLs de catégories chargées et ignorées")
            else:
                logger.warning("⚠️ Fichier category_urls.json non trouvé - toutes les URLs seront crawlées")
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement des URLs de catégories: {e}")

    def load_existing_products(self):
        """Charge les produits existants depuis le fichier JSON pour éviter les doublons"""
        try:
            if os.path.exists('products_realtime.json'):
                with open('products_realtime.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    existing_products = data.get('products', [])
                    
                    # Ajoute les produits existants à la liste
                    self.products_data = existing_products
                    
                    # Crée un set des URLs et noms existants pour vérification rapide
                    self.existing_urls = {p.get('url', '') for p in existing_products if p.get('url')}
                    self.existing_names = {p.get('nom_produit', '') for p in existing_products if p.get('nom_produit')}
                    
                    logger.info(f"✅ {len(existing_products)} produits existants chargés pour éviter les doublons")
                    logger.info(f"   URLs existantes: {len(self.existing_urls)}")
                    logger.info(f"   Noms existants: {len(self.existing_names)}")
            else:
                self.existing_urls = set()
                self.existing_names = set()
                logger.info("📝 Aucun fichier existant trouvé, démarrage avec une liste vide")
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement des produits existants: {e}")
            self.existing_urls = set()
            self.existing_names = set()

    def is_category_url(self, url: str) -> bool:
        """Vérifie si une URL est une URL de catégorie à ignorer"""
        return url in self.category_urls_to_ignore

    def is_brand_url(self, url: str) -> bool:
        """Vérifie si une URL est une URL de marque à ignorer"""
        return '/brand/' in url

    def should_ignore_url(self, url: str) -> bool:
        """Vérifie si une URL doit être ignorée (catégorie ou marque)"""
        return self.is_category_url(url) or self.is_brand_url(url)

    def is_product_page(self, html_content: str) -> bool:
        """
        Détermine si une page est une page produit unique via la meta pageGroup
        Recherche: <meta name="pageGroup" content="Single">
        """
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Cherche la meta balise pageGroup avec content="Single"
            pagegroup_meta = soup.find('meta', {'name': 'pageGroup', 'content': 'Single'})
            
            # DEBUG: Affiche toutes les meta balises pour comprendre la structure
            if not pagegroup_meta:
                all_meta = soup.find_all('meta')
                meta_info = []
                for meta in all_meta:
                    name = meta.get('name', '')
                    content = meta.get('content', '')
                    if name and content:
                        meta_info.append(f"{name}={content}")
                
                if meta_info:
                    logger.info(f"Meta balises trouvées: {', '.join(meta_info[:10])}")  # Limite à 10 pour éviter le spam
                else:
                    logger.info("Aucune meta balise trouvée")
            
            return pagegroup_meta is not None
            
        except Exception as e:
            logger.error(f"Erreur vérification page produit: {e}")
            return False

    def is_potential_product_url(self, url: str) -> bool:
        """Vérifie si une URL pourrait être un produit (filtre rapide avant vérification complète)"""
        try:
            parsed = urlparse(url)
            return (parsed.netloc == self.base_domain and 
                    parsed.path.startswith('/fr/cas/') and
                    parsed.scheme in ['http', 'https'])
        except:
            return False

    def is_valid_category_url(self, url: str) -> bool:
        """Vérifie si l'URL est une page de catégorie valide à crawler"""
        try:
            parsed = urlparse(url)
            return (parsed.netloc == self.base_domain and 
                    parsed.path.startswith('/fr/cas/') and
                    parsed.scheme in ['http', 'https'])
        except:
            return False

    def get_page_content(self, url: str) -> Optional[str]:
        """Récupère le contenu d'une page avec gestion d'erreurs robuste"""
        try:
            logger.info(f"Récupération de: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la récupération de {url}: {e}")
            return None

    def extract_breadcrumb_info(self, soup: BeautifulSoup) -> Tuple[Optional[str], Optional[str], str]:
        """
        Extrait les informations du breadcrumb pour déterminer subcategory/subsubcategory
        Retourne: (subcategory, subsubcategory, product_name)
        """
        try:
            # Trouve tous les éléments breadcrumb
            breadcrumb_items = soup.find_all('span', class_='breadcrumb-text')
            
            if not breadcrumb_items:
                logger.warning("Aucun breadcrumb trouvé")
                return None, None, "Nom inconnu"
            
            # Extrait les textes du breadcrumb
            breadcrumb_texts = [item.get_text(strip=True) for item in breadcrumb_items]
            
            # Trouve aussi les positions pour confirmer la structure
            position_metas = soup.find_all('meta', {'itemprop': 'position'})
            max_position = 0
            if position_metas:
                max_position = max([int(meta.get('content', 0)) for meta in position_metas])
            
            logger.info(f"Breadcrumb: {' > '.join(breadcrumb_texts)} (position max: {max_position})")
            
            # Structure: Accueil > Catégorie > SousCategorie > [SousSousCategorie] > Produit
            # Position 4 = Accueil > Cat > SousCat > Produit  
            # Position 5 = Accueil > Cat > SousCat > SousSousCat > Produit
            
            if len(breadcrumb_texts) >= 3:
                if max_position == 4:  # Structure: SousCategorie > Produit
                    subcategory = breadcrumb_texts[-2] if len(breadcrumb_texts) >= 2 else None
                    subsubcategory = None
                    product_name = breadcrumb_texts[-1]
                elif max_position == 5:  # Structure: SousCategorie > SousSousCategorie > Produit
                    subcategory = breadcrumb_texts[-3] if len(breadcrumb_texts) >= 3 else None
                    subsubcategory = breadcrumb_texts[-2] if len(breadcrumb_texts) >= 2 else None
                    product_name = breadcrumb_texts[-1]
                else:
                    # Fallback basé sur la longueur
                    if len(breadcrumb_texts) == 4:  # Accueil > Cat > SousCat > Produit
                        subcategory = breadcrumb_texts[2]
                        subsubcategory = None
                        product_name = breadcrumb_texts[3]
                    elif len(breadcrumb_texts) >= 5:  # Accueil > Cat > SousCat > SousSousCat > Produit
                        subcategory = breadcrumb_texts[2]
                        subsubcategory = breadcrumb_texts[3]
                        product_name = breadcrumb_texts[4]
                    else:
                        subcategory = breadcrumb_texts[-2]
                        subsubcategory = None
                        product_name = breadcrumb_texts[-1]
            else:
                return None, None, breadcrumb_texts[-1] if breadcrumb_texts else "Nom inconnu"
                
            return subcategory, subsubcategory, product_name
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction du breadcrumb: {e}")
            return None, None, "Nom inconnu"

    def extract_product_name(self, soup: BeautifulSoup) -> str:
        """Extrait le nom du produit depuis le H1 ou le breadcrumb"""
        try:
            # Priorité au H1 avec class="t4 title"
            h1_title = soup.find('h1', class_='t4 title')
            if h1_title:
                return h1_title.get_text(strip=True)
            
            # Fallback: depuis le breadcrumb
            _, _, product_name = self.extract_breadcrumb_info(soup)
            return product_name
            
        except Exception as e:
            logger.error(f"Erreur extraction nom produit: {e}")
            return "Nom inconnu"

    def extract_price(self, soup: BeautifulSoup) -> str:
        """Extrait le prix depuis la div ProductPagePaymentBlock-InsidePrice"""
        try:
            # Trouve la div parent avec la classe spécifique
            price_block = soup.find('div', class_='ProductPagePaymentBlock-InsidePrice')
            if not price_block:
                return "Prix non disponible"
            
            # Cherche une div sans classe dans cette div parent
            price_div = price_block.find('div', class_=False)
            if price_div:
                price_text = price_div.get_text(strip=True)
                # Nettoie le texte du prix
                price_clean = re.sub(r'[^\d,€\s]', '', price_text).strip()
                return price_clean if price_clean else "Prix non disponible"
            
            return "Prix non disponible"
            
        except Exception as e:
            logger.error(f"Erreur extraction prix: {e}")
            return "Prix non disponible"

    def extract_image_url(self, soup: BeautifulSoup) -> str:
        """Extrait l'URL de l'image principale depuis <img id="productMainImage">"""
        try:
            # Priorité à l'image avec id="productMainImage"
            main_img = soup.find('img', id='productMainImage')
            if main_img and main_img.get('src'):
                img_url = main_img['src']
                # Convertit en URL absolue
                return urljoin(self.base_url, img_url)
            
            # Fallback: autres sélecteurs possibles
            selectors = [
                'img.product-image-main',
                'img[alt*="product"]',
                '.product-image img',
                '.ProductGallery img',
                'img[src*="product"]'
            ]
            
            for selector in selectors:
                img = soup.select_one(selector)
                if img and img.get('src'):
                    img_url = img['src']
                    return urljoin(self.base_url, img_url)
                
            return "Image non disponible"
            
        except Exception as e:
            logger.error(f"Erreur extraction image: {e}")
            return "Image non disponible"

    def extract_short_description(self, soup: BeautifulSoup) -> str:
        """Extrait la description courte depuis h3 id="product_shortdescription_*" """
        try:
            # Cherche un h3 avec un id qui commence par "product_shortdescription_"
            h3_elements = soup.find_all('h3', id=re.compile(r'^product_shortdescription_'))
            
            if h3_elements:
                short_desc = h3_elements[0].get_text(strip=True)
                return short_desc if short_desc else "Description courte non disponible"
            
            return "Description courte non disponible"
            
        except Exception as e:
            logger.error(f"Erreur extraction description courte: {e}")
            return "Description courte non disponible"

    def extract_large_description(self, soup: BeautifulSoup) -> str:
        """Extrait la description longue depuis div id="productBulletText_" ul li"""
        try:
            # Cherche la div avec id qui commence par "productBulletText_"
            bullet_div = soup.find('div', id=re.compile(r'^productBulletText_'))
            
            if not bullet_div:
                return "Description longue non disponible"
            
            # Trouve la liste ul dans cette div
            ul_element = bullet_div.find('ul')
            if not ul_element:
                return "Description longue non disponible"
            
            # Extrait tous les éléments li
            li_elements = ul_element.find_all('li')
            if not li_elements:
                return "Description longue non disponible"
            
            # Joint toutes les descriptions avec des separateurs
            descriptions = []
            for li in li_elements:
                desc_text = li.get_text(strip=True)
                if desc_text:
                    descriptions.append(desc_text)
            
            if descriptions:
                return " | ".join(descriptions)  # Sépare avec |
            else:
                return "Description longue non disponible"
                
        except Exception as e:
            logger.error(f"Erreur extraction description longue: {e}")
            return "Description longue non disponible"

    def extract_product_data(self, url: str) -> Optional[Dict]:
        """Extrait toutes les données d'un produit"""
        html_content = self.get_page_content(url)
        if not html_content:
            return None
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extrait toutes les informations
            subcategory, subsubcategory, breadcrumb_name = self.extract_breadcrumb_info(soup)
            product_name = self.extract_product_name(soup)
            price = self.extract_price(soup)
            image_url = self.extract_image_url(soup)
            short_desc = self.extract_short_description(soup)
            large_desc = self.extract_large_description(soup)
            
            # Préfère le nom du H1 au breadcrumb
            final_name = product_name if product_name != "Nom inconnu" else breadcrumb_name
            
            product_data = {
                'nom_produit': final_name,
                'prix': price,
                'imageurl': image_url,
                'subcategory': subcategory or "",
                'subsubcategory': subsubcategory or "",
                'shortdesc': short_desc,
                'largedesc': large_desc,
                'url': url  # Pour debug
            }
            
            logger.info(f"Produit extrait: {final_name}")
            return product_data
            
        except Exception as e:
            logger.error(f"Erreur extraction produit {url}: {e}")
            return None

    def is_duplicate_product(self, product_data: Dict) -> bool:
        """Vérifie si un produit est un doublon basé sur l'URL et le nom"""
        url = product_data.get('url', '')
        name = product_data.get('nom_produit', '')
        
        # Vérifie si l'URL existe déjà
        if url in self.existing_urls:
            logger.info(f"🚫 Doublon détecté (URL): {url}")
            return True
        
        # Vérifie si le nom existe déjà (avec tolérance pour les variations)
        if name in self.existing_names:
            logger.info(f"🚫 Doublon détecté (nom): {name}")
            return True
        
        # Vérifie les variations de nom (espaces, tirets, etc.)
        normalized_name = name.lower().replace(' ', '').replace('-', '').replace('_', '')
        for existing_name in self.existing_names:
            normalized_existing = existing_name.lower().replace(' ', '').replace('-', '').replace('_', '')
            if normalized_name == normalized_existing:
                logger.info(f"🚫 Doublon détecté (nom normalisé): {name} = {existing_name}")
                return True
        
        return False

    def find_product_links(self, start_url: str, max_depth: int = 3) -> None:
        """Trouve tous les liens de produits en crawlant le site et vérifiant la meta pageGroup"""
        queue = deque([(start_url, 0)])
        pages_crawled = 0
        
        while queue:
            current_url, depth = queue.popleft()
            
            if current_url in self.visited_urls or depth > max_depth:
                continue
                
            self.visited_urls.add(current_url)
            
            # IGNORE les URLs de catégories (pas de log, pas de crawl)
            if self.should_ignore_url(current_url):
                logger.info(f"🚫 URL ignorée: {current_url}")
                continue
            
            html_content = self.get_page_content(current_url)
            if not html_content:
                continue
            
            # Vérifie si la page actuelle est un produit via la meta pageGroup
            if self.is_product_page(html_content):
                self.product_urls.add(current_url)
                logger.info(f"✓ Produit confirmé: {current_url}")
                
                # EXTRACTION IMMÉDIATE du produit trouvé
                product_data = self.extract_product_data(current_url)
                if product_data:
                    if not self.is_duplicate_product(product_data):
                        self.products_data.append(product_data)
                        logger.info(f"✅ PRODUIT EXTRACTÉ: {product_data['nom_produit']}")
                        logger.info(f"   Prix: {product_data['prix']}")
                        logger.info(f"   Catégorie: {product_data['subcategory']}")
                        
                        # SAUVEGARDE IMMÉDIATE après chaque produit
                        self.save_debug_data("products_realtime.json")
                        logger.info(f"💾 JSON mis à jour avec {len(self.products_data)} produits")
                        
                        # Affiche le produit en temps réel
                        print(f"\n🎯 PRODUIT {len(self.products_data)} EXTRACTÉ:")
                        print(f"   Nom: {product_data['nom_produit']}")
                        print(f"   Prix: {product_data['prix']}")
                        print(f"   Image: {product_data['imageurl']}")
                        print(f"   Catégorie: {product_data['subcategory']}")
                        print(f"   Sous-catégorie: {product_data['subsubcategory']}")
                        print(f"   Description courte: {product_data['shortdesc'][:100]}...")
                        print(f"   Description longue: {product_data['largedesc'][:100]}...")
                        print(f"   URL: {current_url}")
                        print("-" * 80)
                    else:
                        logger.info(f"🚫 Produit ignoré (doublon): {current_url}")
                
                continue  # Si c'est un produit, pas besoin de chercher des liens dedans
                
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extrait tous les liens de cette page de catégorie
            for link in soup.find_all('a', href=True):
                href = link['href']
                absolute_url = urljoin(current_url, href)
                clean_url = absolute_url.split('#')[0].split('?')[0]  # Supprime fragments et params
                
                # IGNORE les URLs de catégories dans les liens trouvés
                if self.should_ignore_url(clean_url):
                    continue
                
                if self.is_potential_product_url(clean_url) and clean_url not in self.visited_urls:
                    queue.append((clean_url, depth + 1))
            
            pages_crawled += 1
            time.sleep(self.delay)
            logger.info(f"Page crawlée: {current_url} (depth: {depth})")
            logger.info(f"Produits confirmés: {len(self.product_urls)}")
            logger.info(f"Produits extraits: {len(self.products_data)}")
            logger.info(f"Pages restantes à vérifier: {len(queue)}")
            
            # Sauvegarde automatique toutes les 50 pages
            if pages_crawled % 50 == 0:
                logger.info(f"💾 Sauvegarde automatique après {pages_crawled} pages...")
                if self.product_urls:
                    self.save_debug_data(f"auto_save_{pages_crawled}.json")
                    logger.info(f"✓ Sauvegarde automatique effectuée - {len(self.products_data)} produits")

    def scrape_all_products(self):
        """Scrape tous les produits trouvés"""
        total_products = len(self.product_urls)
        logger.info(f"Début extraction de {total_products} produits")
        
        for i, product_url in enumerate(self.product_urls, 1):
            logger.info(f"Extraction produit {i}/{total_products}: {product_url}")
            
            product_data = self.extract_product_data(product_url)
            if product_data:
                if not self.is_duplicate_product(product_data):
                    self.products_data.append(product_data)
                    logger.info(f"✓ Produit ajouté: {product_data['nom_produit']}")
                else:
                    logger.info(f"🚫 Produit ignoré (doublon): {product_url}")
            else:
                logger.warning(f"✗ Échec extraction: {product_url}")
            
            # Affiche progression tous les 10 produits
            if i % 10 == 0:
                success_rate = len(self.products_data) / i * 100
                logger.info(f"📊 Progression: {i}/{total_products} ({success_rate:.1f}% succès)")
            
            time.sleep(self.delay)

    def save_to_csv(self, filename: str = "casalsport_products.csv"):
        """Sauvegarde les données en CSV"""
        if not self.products_data:
            logger.warning("Aucune donnée de produit à sauvegarder")
            return
        
        fieldnames = ['nom_produit', 'prix', 'imageurl', 'subcategory', 'subsubcategory', 'shortdesc', 'largedesc']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for product in self.products_data:
                # Supprime l'URL de debug avant sauvegarde
                row = {k: v for k, v in product.items() if k in fieldnames}
                writer.writerow(row)
        
        logger.info(f"Données sauvegardées dans {filename}")
        print(f"\n✓ CSV généré: {filename}")
        print(f"✓ {len(self.products_data)} produits extraits")

    def save_debug_data(self, filename: str = "debug_products.json"):
        """Sauvegarde les données complètes pour debug"""
        debug_data = {
            'total_products_extracted': len(self.products_data),
            'products': self.products_data  # TOUS les produits avec nom, prix, image, descriptions, catégories
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(debug_data, f, indent=2, ensure_ascii=False)
        
        # Met à jour les sets de vérification des doublons
        self.existing_urls = {p.get('url', '') for p in self.products_data if p.get('url')}
        self.existing_names = {p.get('nom_produit', '') for p in self.products_data if p.get('nom_produit')}
        
        logger.info(f"💾 JSON sauvegardé: {filename} avec {len(self.products_data)} produits")
        logger.info(f"📊 Produits extraits: {len(self.products_data)}")
        logger.info(f"🔄 Sets de vérification mis à jour: {len(self.existing_urls)} URLs, {len(self.existing_names)} noms")
        
        # Affiche un aperçu des produits sauvegardés
        if self.products_data:
            print(f"\n📋 PRODUITS SAUVEGARDÉS DANS {filename}:")
            for i, product in enumerate(self.products_data[-3:], 1):  # Affiche les 3 derniers
                print(f"   {i}. {product['nom_produit']} - {product['prix']}")
            if len(self.products_data) > 3:
                print(f"   ... et {len(self.products_data) - 3} autres produits")

    def print_summary(self):
        """Affiche un résumé des résultats"""
        print(f"\n{'='*60}")
        print(f"RÉSUMÉ DU SCRAPING CASALSPORT")
        print(f"{'='*60}")
        print(f"URLs de produits trouvées: {len(self.product_urls)}")
        print(f"Produits extraits avec succès: {len(self.products_data)}")
        print(f"Taux de succès: {len(self.products_data)/len(self.product_urls)*100:.1f}%" if self.product_urls else "N/A")
        
        if self.products_data:
            categories = set()
            subcategories = set()
            for product in self.products_data:
                if product['subcategory']:
                    categories.add(product['subcategory'])
                if product['subsubcategory']:
                    subcategories.add(product['subsubcategory'])
            
            print(f"Sous-catégories trouvées: {len(categories)}")
            print(f"Sous-sous-catégories trouvées: {len(subcategories)}")
        
        print(f"{'='*60}")

    def force_extract_all_urls(self):
        """Force l'extraction de toutes les URLs trouvées, même sans détection meta"""
        logger.info(f"🔄 Extraction forcée de {len(self.product_urls)} URLs trouvées...")
        
        for i, url in enumerate(self.product_urls, 1):
            logger.info(f"Extraction forcée {i}/{len(self.product_urls)}: {url}")
            
            # Vérifie si c'est vraiment une page produit
            html_content = self.get_page_content(url)
            if not html_content:
                continue
                
            # Extrait les données même sans vérification meta
            product_data = self.extract_product_data(url)
            if product_data:
                if not self.is_duplicate_product(product_data):
                    self.products_data.append(product_data)
                    logger.info(f"✅ Produit extrait: {product_data['nom_produit']}")
                    
                    # Sauvegarde après chaque produit
                    if i % 10 == 0:
                        self.save_debug_data("force_extract_progress.json")
                        logger.info(f"💾 Progression sauvegardée: {i}/{len(self.product_urls)}")
                else:
                    logger.info(f"🚫 Produit ignoré (doublon): {url}")
            else:
                logger.warning(f"❌ Échec extraction: {url}")
            
            time.sleep(self.delay)
        
        logger.info(f"🎯 Extraction forcée terminée: {len(self.products_data)} produits extraits")
        return len(self.products_data)


def main():
    """Fonction principale"""
    print("🚀 Démarrage du scraper avancé CasalSport...")
    print("📋 Extraction: nom_produit, prix, imageurl, subcategory, subsubcategory, shortdesc, largedesc")
    
    # Initialise le scraper
    scraper = CasalSportProductScraper(delay=1.5)
    
    try:
        # Phase 1: Trouve tous les liens produits
        print("\n🔍 Phase 1: Recherche des produits...")
        scraper.find_product_links(scraper.base_url, max_depth=3)
        
        if not scraper.product_urls:
            print("❌ Aucun produit trouvé!")
            print("🔍 Vérifiez que les balises meta sont correctes...")
            return
        
        # Phase 2: Extrait les données de chaque produit
        print(f"\n📦 Phase 2: Extraction de {len(scraper.product_urls)} produits...")
        scraper.scrape_all_products()
        
        # Phase 3: Sauvegarde
        print("\n💾 Phase 3: Sauvegarde des données...")
        scraper.save_to_csv()
        scraper.save_debug_data()
        
        # Résumé final
        scraper.print_summary()
        
        print("\n🎉 Scraping terminé avec succès!")
        print("📁 Fichiers générés:")
        print("  - casalsport_products.csv (données principales)")
        print("  - debug_products.json (données complètes + debug)")
        
    except KeyboardInterrupt:
        print("\n⚠️ Scraping interrompu par l'utilisateur")
        print("💾 Sauvegarde des données partielles...")
        
        # Sauvegarde immédiate des données trouvées
        if scraper.product_urls:
            scraper.save_debug_data("interrupted_products.json")
            print("✓ Données de debug sauvegardées dans 'interrupted_products.json'")
        
        if scraper.products_data:
            scraper.save_to_csv("interrupted_products.csv")
            print("✓ Données partielles sauvegardées dans 'interrupted_products.csv'")
        
        scraper.print_summary()
        print("\n💡 Vous pouvez relancer le scraper, il reprendra où il s'est arrêté")
        
    except Exception as e:
        logger.error(f"Erreur inattendue: {e}")
        print(f"❌ Erreur: {e}")
        
        # Sauvegarde d'urgence en cas d'erreur
        if scraper.product_urls or scraper.products_data:
            print("💾 Sauvegarde d'urgence des données...")
            if scraper.product_urls:
                scraper.save_debug_data("error_products.json")
            if scraper.products_data:
                scraper.save_to_csv("error_products.csv")
            print("✓ Données sauvegardées dans les fichiers d'erreur")


if __name__ == "__main__":
    main()