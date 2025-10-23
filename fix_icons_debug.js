const fs = require('fs');
const filePath = 'frontend/src/components/AppContent.js';
let content = fs.readFileSync(filePath, 'utf8');

// обавляем подробные логи и исправляем пути
content = content.replace(
  /iconPath = getCategoryIcon\(cat\.name\) \|\| '\/toys\.png';\s*console\.log\('✅ AppContent: Fallback icon:', iconPath\);/g,
  'iconPath = \\\\;\n              console.log(" 🔍 AppContent Debug:\, {\n categoryName: cat.name,\n getCategoryIconResult: getCategoryIcon(cat.name),\n finalIconPath: iconPath,\n apiBaseUrl: API_BASE_URL\n });'
);

// справляем второе место без логов
content = content.replace(
 /iconPath = getCategoryIcon\(cat\.name\) \|\| '\/toys\.png';\s*}/g,
 'iconPath = \\\\;\n console.log(\🔍 AppContent Debug 2:\, {\n categoryName: cat.name,\n getCategoryIconResult: getCategoryIcon(cat.name),\n finalIconPath: iconPath,\n apiBaseUrl: API_BASE_URL\n });\n }'
);

fs.writeFileSync(filePath, content);
console.log('✅ AppContent.js исправлен с логами!');
