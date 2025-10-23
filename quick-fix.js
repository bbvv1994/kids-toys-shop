// Быстрое исправление проблемы с иконками категорий
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/src/index.js');

// Читаем файл
let content = fs.readFileSync(filePath, 'utf8');

// Заменяем проблемные строки
content = content.replace(
  /app\.get\('\/api\/images\/config', smartImageUploadMiddleware\.getConfigInfo\.bind\(smartImageUploadMiddleware\)\);/g,
  '// app.get(\'/api/images/config\', smartImageUploadMiddleware.getConfigInfo.bind(smartImageUploadMiddleware));'
);

content = content.replace(
  /app\.get\('\/api\/images\/hd-info\/:imageUrl', smartImageUploadMiddleware\.getHdImageInfo\.bind\(smartImageUploadMiddleware\)\);/g,
  '// app.get(\'/api/images/hd-info/:imageUrl\', smartImageUploadMiddleware.getHdImageInfo.bind(smartImageUploadMiddleware));'
);

content = content.replace(
  /app\.post\('\/api\/images\/hd-info\/bulk', smartImageUploadMiddleware\.getBulkHdImageInfo\.bind\(smartImageUploadMiddleware\)\);/g,
  '// app.post(\'/api/images/hd-info/bulk\', smartImageUploadMiddleware.getBulkHdImageInfo.bind(smartImageUploadMiddleware));'
);

content = content.replace(
  /app\.post\('\/api\/images\/switch-mode', smartImageUploadMiddleware\.switchMode\.bind\(smartImageUploadMiddleware\)\);/g,
  '// app.post(\'/api/images/switch-mode\', smartImageUploadMiddleware.switchMode.bind(smartImageUploadMiddleware));'
);

content = content.replace(
  /app\.post\('\/api\/images\/cleanup', smartImageUploadMiddleware\.cleanupUnusedHdVersions\.bind\(smartImageUploadMiddleware\)\);/g,
  '// app.post(\'/api/images/cleanup\', smartImageUploadMiddleware.cleanupUnusedHdVersions.bind(smartImageUploadMiddleware));'
);

// Записываем исправленный файл
fs.writeFileSync(filePath, content);

console.log('✅ Файл исправлен!');
