const fs = require('fs');
const filePath = 'frontend/src/components/AppContent.js';
let content = fs.readFileSync(filePath, 'utf8');

// справляем использование getCategoryIcon
content = content.replace(
  /iconPath = getCategoryIcon\(cat\.name\) \|\| '\/toys\.png';/g,
  'iconPath = \\\\;'
);

fs.writeFileSync(filePath, content);
console.log('✅ AppContent.js исправлен!');
