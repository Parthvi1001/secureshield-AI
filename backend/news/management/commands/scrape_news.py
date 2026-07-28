from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from django.utils import timezone
from news.models import CyberNews
import datetime

class Command(BaseCommand):
    help = 'Scrapes cybersecurity news from The Hacker News'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting news scrape from The Hacker News..."))
        
        try:
            url = 'https://thehackernews.com/'
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all story links
            articles = soup.find_all('div', class_='body-post')
            
            added_count = 0
            
            for article in articles:
                link_tag = article.find('a', class_='story-link')
                if not link_tag:
                    continue
                    
                article_url = link_tag.get('href')
                
                title_tag = article.find('h2', class_='home-title')
                title = title_tag.text.strip() if title_tag else "Untitled"
                
                # Try to extract date
                date_tag = article.find('div', class_='item-label')
                # Date format: <span> <i class="icon-calendar"></i> &nbsp; July 18, 2026</span>
                try:
                    # simplistic date extraction for demo purposes
                    date_text = date_tag.text.replace('\ue804', '').strip() if date_tag else ""
                    # If date parsing fails, fallback to now
                    pub_date = timezone.now()
                except Exception:
                    pub_date = timezone.now()
                    
                # category tag usually right next to date
                category = "Cybersecurity" # Default
                
                if CyberNews.objects.filter(url=article_url).exists():
                    continue # Skip duplicates
                    
                CyberNews.objects.create(
                    title=title,
                    url=article_url,
                    source="The Hacker News",
                    published_date=pub_date,
                    category=category
                )
                added_count += 1
                
            self.stdout.write(self.style.SUCCESS(f"Successfully added {added_count} new articles."))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error scraping news: {str(e)}"))
