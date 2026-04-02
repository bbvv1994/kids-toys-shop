// Simple HTTP sitemap server
const http = require('http');
const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  if (req.url === '/sitemap.xml') {
    const xml = '<?xml version= 1.0 encoding=UTF-8?>\n<urlset xmlns=http://www.sitemaps.org/schemas/sitemap/0.9>\n  <url>\n    <loc>https://simba-tzatzuim.co.il/</loc>\n    <lastmod>2026-01-21</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://simba-tzatzuim.co.il/catalog</loc>\n    <lastmod>2026-01-21</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>';
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xml);
  } else if (req.url === '/sitemap-images.xml') {
    const xml = '<?xml version=1.0 encoding=UTF-8?>\n<urlset xmlns=http://www.sitemaps.org/schemas/sitemap/0.9 xmlns:image=http://www.google.com/schemas/sitemap-image/1.1>\n  <url>\n    <loc>https://simba-tzatzuim.co.il/products/1</loc>\n    <lastmod>2026-01-21</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <image:image>\n      <image:loc>https://simba-tzatzuim.co.il/uploads/test-image.webp</image:loc>\n      <image:caption>Test Product Image</image:caption>\n    </image:image>\n  </url>\n</urlset>';
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xml);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
});
