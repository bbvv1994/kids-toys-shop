const fs = require('fs');
const filePath = 'frontend/src/components/AppContent.js';
let content = fs.readFileSync(filePath, 'utf8');

// справляем главное меню - добавляем API_BASE_URL и логи
content = content.replace(
  /src={getCategoryIcon\(category\.name\)}/g,
  'src={\\\\}'
);

// обавляем логи перед img тегом в главном меню
content = content.replace(
  /(\s+)<img\s+src={\\\\}/g,
  '.log(" 🔍 Main Menu Icon Debug:\, {\n categoryName: category.name,\n getCategoryIconResult: getCategoryIcon(category.name),\n finalSrc: \\\\,\n apiBaseUrl: API_BASE_URL\n});\n<img src={\\\\}'
);

fs.writeFileSync(filePath, content);
console.log('✅ лавное меню исправлено!');
