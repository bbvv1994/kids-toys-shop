const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SITE_URL = 'https://simba-tzatzuim.co.il';

/**
 * Генератор sitemap.xml для SEO оптимизации
 */
class SitemapGenerator {
  /**
   * Форматирует дату в ISO формат для sitemap
   */
  formatDate(date) {
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Генерирует XML для одного URL
   */
  generateUrlEntry(loc, lastmod, changefreq, priority) {
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  /**
   * Получает все товары для sitemap
   */
  async getProducts() {
    try {
      const products = await prisma.product.findMany({
        where: {
          isHidden: false
        },
        select: {
          id: true,
          updatedAt: true,
          createdAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      return products;
    } catch (error) {
      console.error('Error fetching products for sitemap:', error);
      return [];
    }
  }

  /**
   * Получает все категории (родительские) для sitemap
   */
  async getCategories() {
    try {
      const categories = await prisma.category.findMany({
        where: {
          active: true,
          parentId: null  // Только родительские категории
        },
        select: {
          id: true,
          name: true
        }
      });
      return categories;
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
      return [];
    }
  }

  /**
   * Получает все подкатегории для sitemap
   */
  async getSubcategories() {
    try {
      const subcategories = await prisma.category.findMany({
        where: {
          active: true,
          parentId: { not: null }  // Только подкатегории
        },
        select: {
          id: true,
          name: true
        }
      });
      return subcategories;
    } catch (error) {
      console.error('Error fetching subcategories for sitemap:', error);
      return [];
    }
  }

  /**
   * Генерирует полный sitemap.xml
   */
  async generate() {
    try {
      console.log('🗺️ Generating sitemap.xml...');
      
      const now = this.formatDate(new Date());
      const urls = [];

      // 1. Главная страница (наивысший приоритет)
      urls.push(this.generateUrlEntry(
        SITE_URL,
        now,
        'daily',
        '1.0'
      ));

      // 2. Каталог
      urls.push(this.generateUrlEntry(
        `${SITE_URL}/catalog`,
        now,
        'daily',
        '0.9'
      ));

      // 3. Статические страницы
      const staticPages = [
        { url: '/about', priority: '0.7', changefreq: 'monthly' },
        { url: '/contact', priority: '0.7', changefreq: 'monthly' },
        { url: '/delivery', priority: '0.6', changefreq: 'monthly' },
        { url: '/returns', priority: '0.6', changefreq: 'monthly' },
        { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
        { url: '/terms', priority: '0.5', changefreq: 'yearly' }
      ];

      staticPages.forEach(page => {
        urls.push(this.generateUrlEntry(
          `${SITE_URL}${page.url}`,
          now,
          page.changefreq,
          page.priority
        ));
      });

      // 4. Категории
      const categories = await this.getCategories();
      console.log(`📁 Found ${categories.length} categories`);
      
      categories.forEach(category => {
        urls.push(this.generateUrlEntry(
          `${SITE_URL}/category/${category.id}`,
          now,  // У категорий нет updatedAt
          'weekly',
          '0.8'
        ));
      });

      // 5. Подкатегории
      const subcategories = await this.getSubcategories();
      console.log(`📂 Found ${subcategories.length} subcategories`);
      
      subcategories.forEach(subcategory => {
        urls.push(this.generateUrlEntry(
          `${SITE_URL}/subcategory/${subcategory.id}`,
          now,  // У подкатегорий нет updatedAt
          'weekly',
          '0.7'
        ));
      });

      // 6. Товары
      const products = await this.getProducts();
      console.log(`🎁 Found ${products.length} products`);
      
      products.forEach(product => {
        urls.push(this.generateUrlEntry(
          `${SITE_URL}/product/${product.id}`,
          this.formatDate(product.updatedAt),
          'weekly',
          '0.6'
        ));
      });

      // Генерируем финальный XML
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>`;

      console.log(`✅ Sitemap generated successfully with ${urls.length} URLs`);
      
      return sitemap;
    } catch (error) {
      console.error('❌ Error generating sitemap:', error);
      throw error;
    }
  }

  /**
   * Генерирует sitemap index (если нужно разбить на несколько файлов)
   */
  async generateIndex() {
    const now = this.formatDate(new Date());
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
  }
}

module.exports = SitemapGenerator;


