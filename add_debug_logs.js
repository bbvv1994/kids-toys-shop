const fs = require('fs');
const filePath = 'frontend/src/components/AppContent.js';
let content = fs.readFileSync(filePath, 'utf8');

// обавляем подробные логи перед существующими логами
content = content.replace(
  /console\.log\('✅ AppContent: Fallback icon:', iconPath\);/g,
  'console.log(" 🔍 AppContent Debug:\, {\n categoryName: cat.name,\n getCategoryIconResult: getCategoryIcon(cat.name),\n finalIconPath: iconPath,\n apiBaseUrl: API_BASE_URL\n });'
);

fs.writeFileSync(filePath, content);
console.log('✅ оги добавлены!');
