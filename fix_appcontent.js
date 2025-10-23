const fs = require('fs');
const filePath = 'frontend/src/components/AppContent.js';
let content = fs.readFileSync(filePath, 'utf8');

// аменяем getCategoryIcon(cat.name) на правильный путь
content = content.replace(
  /iconPath = getCategoryIcon\(cat\.name\) \|\| '\/toys\.png';/g,
  'iconPath = \\\\;'
);

fs.writeFileSync(filePath, content);
console.log('✅ AppContent.js исправлен!');
