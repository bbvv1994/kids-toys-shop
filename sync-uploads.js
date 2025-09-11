const fs = require('fs');
const path = require('path');

function syncUploads() {
  const sourceDir = path.join(__dirname, 'backend', 'uploads');
  const targetDir = path.join(__dirname, 'uploads');
  
  console.log('🔄 Синхронизация папок uploads...');
  console.log('📁 Источник:', sourceDir);
  console.log('📁 Назначение:', targetDir);
  
  try {
    // Создаем целевую папку, если её нет
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('✅ Создана папка uploads');
    }
    
    // Читаем файлы из backend/uploads
    const files = fs.readdirSync(sourceDir);
    console.log(`📋 Найдено ${files.length} файлов в backend/uploads`);
    
    let copiedCount = 0;
    let skippedCount = 0;
    
    for (const file of files) {
      if (file === 'hd' || fs.statSync(path.join(sourceDir, file)).isDirectory()) {
        console.log(`⏭️ Пропускаем папку: ${file}`);
        continue;
      }
      
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Проверяем, существует ли файл в целевой папке
      if (!fs.existsSync(targetPath)) {
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Скопирован: ${file}`);
          copiedCount++;
        } catch (error) {
          console.log(`❌ Ошибка копирования ${file}:`, error.message);
        }
      } else {
        console.log(`⏭️ Уже существует: ${file}`);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Результат:`);
    console.log(`   Скопировано: ${copiedCount}`);
    console.log(`   Пропущено: ${skippedCount}`);
    console.log(`   Всего: ${files.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error.message);
  }
}

syncUploads();
