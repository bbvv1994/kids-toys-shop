const fs = require('fs');
const path = require('path');

function autoSyncUploads() {
  const sourceDir = path.join(__dirname, 'backend', 'uploads');
  const targetDir = path.join(__dirname, 'uploads');
  
  console.log('🔄 Автоматическая синхронизация uploads...');
  
  try {
    // Создаем целевую папку, если её нет
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('✅ Создана папка uploads');
    }
    
    // Читаем файлы из backend/uploads
    const files = fs.readdirSync(sourceDir);
    let copiedCount = 0;
    
    for (const file of files) {
      if (file === 'hd' || fs.statSync(path.join(sourceDir, file)).isDirectory()) {
        continue;
      }
      
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Копируем только если файл не существует в целевой папке
      if (!fs.existsSync(targetPath)) {
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Скопирован: ${file}`);
          copiedCount++;
        } catch (error) {
          console.log(`❌ Ошибка копирования ${file}:`, error.message);
        }
      }
    }
    
    if (copiedCount > 0) {
      console.log(`📊 Скопировано ${copiedCount} новых файлов`);
    } else {
      console.log('📊 Новых файлов для копирования не найдено');
    }
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error.message);
  }
}

// Запускаем синхронизацию
autoSyncUploads();

// Экспортируем функцию для использования в других скриптах
module.exports = autoSyncUploads;
