const fs = require('fs');
const filePath = 'frontend/src/components/AppContent.js';
let content = fs.readFileSync(filePath, 'utf8');

// справляем поврежденную строку
content = content.replace(
  /iconPath = \\\\;/g,
  'iconPath = \\\\;'
);

fs.writeFileSync(filePath, content);
console.log('✅ AppContent.js исправлен!');
