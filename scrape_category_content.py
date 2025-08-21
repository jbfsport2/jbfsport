#!/usr/bin/env python3
"""
Scraper simple pour CasalSport - Extraction des images et textes des pages catégories
Extrait: imageUrl depuis <div class="hero-block"> et categoryText depuis <div class="seo-container">
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import logging
from typing import Dict, List, Optional
import os

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CasalSportCategoryScraper:
    def __init__(self, delay=2.0):
        self.delay = delay
        self.session = requests.Session()
        
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

    def get_page_content(self, url: str) -> Optional[str]:
        """Récupère le contenu d'une page avec gestion d'erreurs"""
        try:
            logger.info(f"Récupération de: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la récupération de {url}: {e}")
            return None

    def extract_hero_image(self, soup: BeautifulSoup) -> Optional[str]:
        """Extrait l'image du hero depuis <div class="hero-block">"""
        try:
            # Cherche la div hero-block
            hero_block = soup.find('div', class_='hero-block')
            if not hero_block:
                logger.warning("Aucune div hero-block trouvée")
                return None
            
            # Cherche la balise picture avec source srcset
            picture = hero_block.find('picture')
            if picture:
                source = picture.find('source', srcset=True)
                if source and source.get('srcset'):
                    image_url = source['srcset']
                    logger.info(f"Image hero trouvée: {image_url}")
                    return image_url
            
            # Fallback: cherche une image directement
            img = hero_block.find('img', src=True)
            if img and img.get('src'):
                image_url = img['src']
                logger.info(f"Image hero trouvée (fallback): {image_url}")
                return image_url
            
            logger.warning("Aucune image hero trouvée dans hero-block")
            return None
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de l'image hero: {e}")
            return None

    def extract_seo_text(self, soup: BeautifulSoup) -> Optional[str]:
        """Extrait tout le texte depuis <div class="seo-container">"""
        try:
            # Cherche la div seo-container
            seo_container = soup.find('div', class_='seo-container')
            if not seo_container:
                logger.warning("Aucune div seo-container trouvée")
                return None
            
            # Extrait tous les éléments textuels
            text_elements = []
            
            # Parcourt tous les éléments enfants
            for element in seo_container.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'li']):
                text = element.get_text(strip=True)
                if text and len(text) > 10:  # Filtre les textes trop courts
                    # Détermine le type d'élément
                    tag_name = element.name
                    if tag_name.startswith('h'):
                        text_elements.append(f"## {text}")
                    elif tag_name == 'p':
                        text_elements.append(text)
                    elif tag_name == 'li':
                        text_elements.append(f"• {text}")
                    else:
                        text_elements.append(text)
            
            if text_elements:
                # Joint tous les textes avec des sauts de ligne
                full_text = '\n\n'.join(text_elements)
                logger.info(f"Texte SEO extrait: {len(text_elements)} éléments, {len(full_text)} caractères")
                return full_text
            else:
                logger.warning("Aucun texte trouvé dans seo-container")
                return None
                
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction du texte SEO: {e}")
            return None

    def scrape_category_page(self, url: str, category_name: str) -> Dict:
        """Scrape une page de catégorie pour extraire image et texte"""
        html_content = self.get_page_content(url)
        if not html_content:
            return {
                'url': url,
                'category_name': category_name,
                'status': 'error',
                'error': 'Impossible de récupérer le contenu'
            }
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extrait l'image hero
            hero_image = self.extract_hero_image(soup)
            
            # Extrait le texte SEO
            seo_text = self.extract_seo_text(soup)
            
            result = {
                'url': url,
                'category_name': category_name,
                'status': 'success',
                'hero_image': hero_image,
                'seo_text': seo_text,
                'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            logger.info(f"✅ Page scrapée avec succès: {category_name}")
            if hero_image:
                logger.info(f"   Image: {hero_image}")
            if seo_text:
                logger.info(f"   Texte: {len(seo_text)} caractères")
            
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping de {url}: {e}")
            return {
                'url': url,
                'category_name': category_name,
                'status': 'error',
                'error': str(e)
            }

    def scrape_all_categories(self, input_file: str = "category_scraping_urls.json"):
        """Scrape toutes les catégories depuis le fichier JSON"""
        try:
            # Vérifie si le fichier d'entrée existe
            if not os.path.exists(input_file):
                logger.error(f"❌ Fichier {input_file} non trouvé!")
                logger.info("💡 Lancez d'abord le script JavaScript: node generate_category_urls_simple.js")
                return
            
            # Lit le fichier d'entrée
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            scraping_urls = data.get('scraping_urls', [])
            total_categories = len(scraping_urls)
            
            logger.info(f"🚀 Début du scraping de {total_categories} catégories...")
            
            results = []
            
            for i, category_data in enumerate(scraping_urls, 1):
                logger.info(f"\n📊 Progression: {i}/{total_categories}")
                logger.info(f"🎯 Scraping: {category_data['name']}")
                
                # Scrape la page
                result = self.scrape_category_page(category_data['url'], category_data['name'])
                results.append(result)
                
                # Sauvegarde progressive
                if i % 5 == 0:
                    self.save_results(results, f"scraping_progress_{i}.json")
                    logger.info(f"💾 Sauvegarde progressive effectuée ({i}/{total_categories})")
                
                # Pause entre les requêtes
                if i < total_categories:
                    logger.info(f"⏳ Pause de {self.delay}s...")
                    time.sleep(self.delay)
            
            # Sauvegarde finale
            self.save_results(results, "category_scraping_results.json")
            
            # Résumé
            self.print_summary(results)
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du scraping: {e}")
            return []

    def save_results(self, results: List[Dict], filename: str):
        """Sauvegarde les résultats en JSON"""
        output_data = {
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_categories': len(results),
            'successful_scrapes': len([r for r in results if r['status'] == 'success']),
            'failed_scrapes': len([r for r in results if r['status'] == 'error']),
            'results': results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"💾 Résultats sauvegardés dans {filename}")

    def print_summary(self, results: List[Dict]):
        """Affiche un résumé des résultats"""
        successful = [r for r in results if r['status'] == 'success']
        failed = [r for r in results if r['status'] == 'error']
        
        print(f"\n{'='*60}")
        print(f"📋 RÉSUMÉ DU SCRAPING DES CATÉGORIES")
        print(f"{'='*60}")
        print(f"Total catégories: {len(results)}")
        print(f"Scraping réussis: {len(successful)}")
        print(f"Scraping échoués: {len(failed)}")
        print(f"Taux de succès: {len(successful)/len(results)*100:.1f}%" if results else "N/A")
        
        if successful:
            categories_with_image = [r for r in successful if r.get('hero_image')]
            categories_with_text = [r for r in successful if r.get('seo_text')]
            print(f"Catégories avec image: {len(categories_with_image)}")
            print(f"Catégories avec texte: {len(categories_with_text)}")
        
        if failed:
            print(f"\n❌ Échecs:")
            for result in failed[:3]:  # Affiche les 3 premiers échecs
                print(f"   - {result['category_name']}: {result.get('error', 'Erreur inconnue')}")
            if len(failed) > 3:
                print(f"   ... et {len(failed) - 3} autres échecs")
        
        print(f"{'='*60}")


def main():
    """Fonction principale"""
    print("🚀 Démarrage du scraper de catégories CasalSport...")
    print("📋 Extraction: images hero et textes SEO des pages catégories")
    
    # Initialise le scraper
    scraper = CasalSportCategoryScraper(delay=2.0)
    
    try:
        # Lance le scraping
        results = scraper.scrape_all_categories()
        
        if results:
            print("\n🎉 Scraping terminé avec succès!")
            print("📁 Fichiers générés:")
            print("  - category_scraping_results.json (résultats complets)")
            print("  - scraping_progress_X.json (sauvegardes progressives)")
        else:
            print("\n❌ Aucun résultat obtenu")
            
    except KeyboardInterrupt:
        print("\n⚠️ Scraping interrompu par l'utilisateur")
    except Exception as e:
        logger.error(f"Erreur inattendue: {e}")
        print(f"❌ Erreur: {e}")


if __name__ == "__main__":
    main() 