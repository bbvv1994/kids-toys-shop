const fs = require('fs');
const path = require('path');

function watchUploads() {
  const sourceDir = path.join(__dirname, 'backend', 'uploads');
  const targetDir = path.join(__dirname, 'uploads');
  
  console.log('👀 Запуск мониторинга папки uploads...');
  console.log('📁 Источник:', sourceDir);
  console.log('📁 Назначение:', targetDir);
  
  // Создаем целевую папку, если её нет
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('✅ Создана папка uploads');
  }
  
  // Синхронизируем существующие файлы
  function syncExistingFiles() {
    try {
      const files = fs.readdirSync(sourceDir);
      let copiedCount = 0;
      
      for (const file of files) {
        if (file === 'hd' || fs.statSync(path.join(sourceDir, file)).isDirectory()) {
          continue;
        }
        
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
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
        console.log(`📊 Синхронизировано ${copiedCount} файлов`);
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error.message);
    }
  }
  
  // Синхронизируем существующие файлы при запуске
  syncExistingFiles();
  
  // Мониторим изменения в папке
  try {
    fs.watch(sourceDir, (eventType, filename) => {
      if (filename && eventType === 'rename') {
        const sourcePath = path.join(sourceDir, filename);
        const targetPath = path.join(targetDir, filename);
        
        // Проверяем, что файл существует (не удален)
        if (fs.existsSync(sourcePath)) {
          const stats = fs.statSync(sourcePath);
          if (stats.isFile() && !filename.startsWith('.')) {
            try {
              fs.copyFileSync(sourcePath, targetPath);
              console.log(`🔄 Автоматически скопирован: ${filename}`);
            } catch (error) {
              console.log(`❌ Ошибка автокопирования ${filename}:`, error.message);
            }
          }
        }
      }
    });
    
    console.log('✅ Мониторинг запущен. Новые файлы будут автоматически копироваться.');
    console.log('💡 Нажмите Ctrl+C для остановки мониторинга.');
    
  } catch (error) {
    console.error('❌ Ошибка запуска мониторинга:', error.message);
  }
}

// Запускаем мониторинг
watchUploads();

// Обработка сигнала завершения
process.on('SIGINT', () => {
  console.log('\n👋 Мониторинг остановлен.');
  process.exit(0);
});

module.exports = watchUploads;
