const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Image sitemap route
router.get('/sitemap-images.xml', async (req, res) => {
  try {
    // Get all products with images
    const products = await prisma.product.findMany({
      where: {
        images: {
          not: null,
          not: []
        },
        inStock: true
      },
      select: {
        id: true,
        name: true,
        images: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // Build XML sitemap
    let xml = '<?xml version= 1.0 encoding=UTF-8?>\n';
    xml += '<urlset xmlns=http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        xmlns:image=http://www.google.com/schemas/sitemap-image/1.1>\n';

    for (const product of products) {
      if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        continue;
      }

      xml += '  <url>\n';
      xml +=     <loc>https://simba-tzatzuim.co.il/products/</loc>\n;
      xml +=     <lastmod></lastmod>\n;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';

      // Add images
      for (const image of product.images) {
        const imageUrl = image.startsWith('http') ? image : https://simba-tzatzuim.co.il;
        xml += '    <image:image>\n';
        xml +=       <image:loc></image:loc>\n;
        xml +=       <image:caption> - </image:caption>\n;
        xml += '    </image:image>\n';
      }

      xml += '  </url>\n';
    }

    xml += '</urlset>\n';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);

  } catch (error) {
    console.error('Error generating image sitemap:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
