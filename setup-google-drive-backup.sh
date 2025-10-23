#!/bin/bash

# 🚀 Настройка автоматических бэкапов на Google Drive
# Этот скрипт настраивает еженедельные бэкапы базы данных и файлов на Google Drive

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Проверка, что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then
    error "Пожалуйста, запустите скрипт от root: sudo bash setup-google-drive-backup.sh"
fi

APP_USER="kids-toys"
APP_DIR="/home/$APP_USER/app"
BACKUP_DIR="/home/$APP_USER/backups"
GOOGLE_DRIVE_DIR="/home/$APP_USER/google-drive-backup"

log "🚀 Настройка автоматических бэкапов на Google Drive"
echo "=================================================="

# Шаг 1: Установка зависимостей
log "Шаг 1: Установка зависимостей для Google Drive API"
apt update
apt install -y python3 python3-pip curl wget

# Установка Google Drive API
pip3 install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib

# Шаг 2: Создание директорий
log "Шаг 2: Создание директорий"
mkdir -p $GOOGLE_DRIVE_DIR
mkdir -p $BACKUP_DIR
chown -R $APP_USER:$APP_USER $GOOGLE_DRIVE_DIR
chown -R $APP_USER:$APP_USER $BACKUP_DIR

# Шаг 3: Создание скрипта аутентификации Google Drive
log "Шаг 3: Создание скрипта аутентификации Google Drive"
cat > $GOOGLE_DRIVE_DIR/google_drive_auth.py << 'EOF'
#!/usr/bin/env python3
"""
Скрипт для аутентификации в Google Drive API
Запустите этот скрипт один раз для настройки аутентификации
"""

import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Если изменить эти области, удалите файл token.pickle
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def authenticate():
    """Аутентификация и возврат сервиса Google Drive"""
    creds = None
    
    # Файл token.pickle хранит токены доступа и обновления пользователя
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # Если нет (действительных) учетных данных, позволить пользователю войти в систему
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                print("❌ Файл credentials.json не найден!")
                print("📋 Инструкции по получению credentials.json:")
                print("1. Перейдите в https://console.developers.google.com/")
                print("2. Создайте новый проект или выберите существующий")
                print("3. Включите Google Drive API")
                print("4. Создайте учетные данные OAuth 2.0")
                print("5. Скачайте JSON файл и переименуйте его в credentials.json")
                print("6. Поместите файл в папку:", os.getcwd())
                return None
                
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Сохранить учетные данные для следующего запуска
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    try:
        service = build('drive', 'v3', credentials=creds)
        print("✅ Аутентификация в Google Drive успешна!")
        return service
    except HttpError as error:
        print(f"❌ Ошибка аутентификации: {error}")
        return None

if __name__ == '__main__':
    service = authenticate()
    if service:
        print("🎉 Google Drive API готов к использованию!")
    else:
        print("❌ Не удалось настроить Google Drive API")
EOF

# Шаг 4: Создание скрипта загрузки на Google Drive
log "Шаг 4: Создание скрипта загрузки на Google Drive"
cat > $GOOGLE_DRIVE_DIR/upload_to_drive.py << 'EOF'
#!/usr/bin/env python3
"""
Скрипт для загрузки файлов на Google Drive
"""

import os
import sys
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_drive_service():
    """Получение сервиса Google Drive"""
    creds = None
    
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("❌ Требуется повторная аутентификация. Запустите google_drive_auth.py")
            return None
    
    return build('drive', 'v3', credentials=creds)

def find_or_create_folder(service, folder_name, parent_id=None):
    """Поиск или создание папки на Google Drive"""
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder'"
    if parent_id:
        query += f" and '{parent_id}' in parents"
    else:
        query += " and 'root' in parents"
    
    results = service.files().list(q=query, fields="files(id, name)").execute()
    items = results.get('files', [])
    
    if items:
        return items[0]['id']
    else:
        # Создаем папку
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent_id:
            file_metadata['parents'] = [parent_id]
        
        folder = service.files().create(body=file_metadata, fields='id').execute()
        return folder.get('id')

def upload_file(service, file_path, folder_id, file_name=None):
    """Загрузка файла на Google Drive"""
    if not os.path.exists(file_path):
        print(f"❌ Файл не найден: {file_path}")
        return False
    
    if not file_name:
        file_name = os.path.basename(file_path)
    
    # Проверяем, существует ли файл с таким именем
    query = f"name='{file_name}' and '{folder_id}' in parents"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    items = results.get('files', [])
    
    if items:
        # Обновляем существующий файл
        file_id = items[0]['id']
        media = MediaFileUpload(file_path, resumable=True)
        file = service.files().update(fileId=file_id, media_body=media).execute()
        print(f"✅ Файл обновлен: {file_name}")
    else:
        # Создаем новый файл
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        media = MediaFileUpload(file_path, resumable=True)
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        print(f"✅ Файл загружен: {file_name}")
    
    return True

def main():
    if len(sys.argv) < 2:
        print("Использование: python3 upload_to_drive.py <путь_к_файлу> [имя_файла]")
        sys.exit(1)
    
    file_path = sys.argv[1]
    file_name = sys.argv[2] if len(sys.argv) > 2 else None
    
    service = get_drive_service()
    if not service:
        sys.exit(1)
    
    # Создаем структуру папок
    kids_toys_folder = find_or_create_folder(service, "Kids-Toys-Shop-Backups")
    weekly_folder = find_or_create_folder(service, "Weekly-Backups", kids_toys_folder)
    
    # Загружаем файл
    if upload_file(service, file_path, weekly_folder, file_name):
        print("🎉 Файл успешно загружен на Google Drive!")
    else:
        print("❌ Ошибка при загрузке файла")
        sys.exit(1)

if __name__ == '__main__':
    main()
EOF

# Шаг 5: Создание скрипта еженедельного бэкапа
log "Шаг 5: Создание скрипта еженедельного бэкапа"
cat > $GOOGLE_DRIVE_DIR/weekly_backup.sh << 'EOF'
#!/bin/bash

# 🗓️ Еженедельный бэкап на Google Drive
# Этот скрипт создает полный бэкап и загружает его на Google Drive

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Переменные
BACKUP_DIR="/home/kids-toys/backups"
GOOGLE_DRIVE_DIR="/home/kids-toys/google-drive-backup"
DATE=$(date +%Y%m%d_%H%M%S)
WEEK=$(date +%Y-W%U)

log "🗓️ Начало еженедельного бэкапа"
log "📅 Дата: $(date)"
log "📊 Неделя: $WEEK"

# Создание директории для бэкапа
mkdir -p $BACKUP_DIR

# 1. Бэкап базы данных
log "📊 Создание бэкапа базы данных..."
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
pg_dump -U kids_toys_user -h localhost kids_toys_db > $DB_BACKUP_FILE

if [ -f "$DB_BACKUP_FILE" ] && [ -s "$DB_BACKUP_FILE" ]; then
    log "✅ Бэкап базы данных создан: $(du -h $DB_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания бэкапа базы данных"
fi

# 2. Бэкап изображений
log "🖼️ Создание бэкапа изображений..."
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"
tar -czf $UPLOADS_BACKUP_FILE -C /home/kids-toys/app uploads/

if [ -f "$UPLOADS_BACKUP_FILE" ] && [ -s "$UPLOADS_BACKUP_FILE" ]; then
    log "✅ Бэкап изображений создан: $(du -h $UPLOADS_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания бэкапа изображений"
fi

# 3. Бэкап конфигурации
log "⚙️ Создание бэкапа конфигурации..."
CONFIG_BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"
tar -czf $CONFIG_BACKUP_FILE -C /home/kids-toys/app backend/.env backend/prisma/

if [ -f "$CONFIG_BACKUP_FILE" ] && [ -s "$CONFIG_BACKUP_FILE" ]; then
    log "✅ Бэкап конфигурации создан: $(du -h $CONFIG_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания бэкапа конфигурации"
fi

# 4. Создание полного архива
log "📦 Создание полного архива..."
FULL_BACKUP_FILE="$BACKUP_DIR/full_backup_$WEEK.tar.gz"
tar -czf $FULL_BACKUP_FILE -C $BACKUP_DIR db_backup_$DATE.sql uploads_backup_$DATE.tar.gz config_backup_$DATE.tar.gz

if [ -f "$FULL_BACKUP_FILE" ] && [ -s "$FULL_BACKUP_FILE" ]; then
    log "✅ Полный архив создан: $(du -h $FULL_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания полного архива"
fi

# 5. Загрузка на Google Drive
log "☁️ Загрузка на Google Drive..."
cd $GOOGLE_DRIVE_DIR

# Загружаем полный архив
python3 upload_to_drive.py "$FULL_BACKUP_FILE" "kids-toys-full-backup-$WEEK.tar.gz"

# Загружаем отдельные файлы
python3 upload_to_drive.py "$DB_BACKUP_FILE" "db_backup_$DATE.sql"
python3 upload_to_drive.py "$UPLOADS_BACKUP_FILE" "uploads_backup_$DATE.tar.gz"
python3 upload_to_drive.py "$CONFIG_BACKUP_FILE" "config_backup_$DATE.tar.gz"

# 6. Очистка старых бэкапов (старше 30 дней)
log "🧹 Очистка старых бэкапов..."
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

log "✅ Еженедельный бэкап завершен!"
log "📊 Статистика:"
echo "   - База данных: $(du -h $DB_BACKUP_FILE | cut -f1)"
echo "   - Изображения: $(du -h $UPLOADS_BACKUP_FILE | cut -f1)"
echo "   - Конфигурация: $(du -h $CONFIG_BACKUP_FILE | cut -f1)"
echo "   - Полный архив: $(du -h $FULL_BACKUP_FILE | cut -f1)"
echo "   - Всего загружено на Google Drive: 4 файла"

# 7. Отправка уведомления (если настроен Telegram)
if [ ! -z "$TELEGRAM_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_CHAT_ID" ]; then
    log "📱 Отправка уведомления в Telegram..."
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d chat_id="$TELEGRAM_CHAT_ID" \
        -d text="✅ Еженедельный бэкап Kids Toys Shop завершен!
📅 Дата: $(date)
📊 Неделя: $WEEK
💾 Размер архива: $(du -h $FULL_BACKUP_FILE | cut -f1)
☁️ Загружено на Google Drive: 4 файла"
fi

log "🎉 Бэкап успешно завершен!"
EOF

# Шаг 6: Создание скрипта восстановления с Google Drive
log "Шаг 6: Создание скрипта восстановления с Google Drive"
cat > $GOOGLE_DRIVE_DIR/download_from_drive.py << 'EOF'
#!/usr/bin/env python3
"""
Скрипт для скачивания файлов с Google Drive
"""

import os
import sys
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError
import io

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_drive_service():
    """Получение сервиса Google Drive"""
    creds = None
    
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("❌ Требуется повторная аутентификация. Запустите google_drive_auth.py")
            return None
    
    return build('drive', 'v3', credentials=creds)

def find_file(service, file_name, folder_id=None):
    """Поиск файла на Google Drive"""
    query = f"name='{file_name}'"
    if folder_id:
        query += f" and '{folder_id}' in parents"
    else:
        query += " and 'root' in parents"
    
    results = service.files().list(q=query, fields="files(id, name, size)").execute()
    items = results.get('files', [])
    
    if items:
        return items[0]
    return None

def download_file(service, file_id, file_name, download_path):
    """Скачивание файла с Google Drive"""
    try:
        request = service.files().get_media(fileId=file_id)
        file = io.BytesIO()
        downloader = MediaIoBaseDownload(file, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            print(f"Скачивание: {int(status.progress() * 100)}%")
        
        with open(download_path, 'wb') as f:
            f.write(file.getvalue())
        
        print(f"✅ Файл скачан: {file_name}")
        return True
    except HttpError as error:
        print(f"❌ Ошибка скачивания: {error}")
        return False

def list_backups(service):
    """Список доступных бэкапов"""
    kids_toys_folder = find_file(service, "Kids-Toys-Shop-Backups")
    if not kids_toys_folder:
        print("❌ Папка Kids-Toys-Shop-Backups не найдена")
        return
    
    weekly_folder = find_file(service, "Weekly-Backups", kids_toys_folder['id'])
    if not weekly_folder:
        print("❌ Папка Weekly-Backups не найдена")
        return
    
    results = service.files().list(
        q=f"'{weekly_folder['id']}' in parents",
        fields="files(id, name, size, createdTime)"
    ).execute()
    
    files = results.get('files', [])
    if not files:
        print("❌ Бэкапы не найдены")
        return
    
    print("📋 Доступные бэкапы:")
    for i, file in enumerate(files, 1):
        size_mb = int(file['size']) / (1024 * 1024) if 'size' in file else 0
        print(f"{i}. {file['name']} ({size_mb:.1f} MB) - {file['createdTime']}")
    
    return files

def main():
    service = get_drive_service()
    if not service:
        sys.exit(1)
    
    if len(sys.argv) < 2:
        print("Использование:")
        print("  python3 download_from_drive.py list                    # Список бэкапов")
        print("  python3 download_from_drive.py download <имя_файла>    # Скачать файл")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "list":
        list_backups(service)
    elif command == "download":
        if len(sys.argv) < 3:
            print("❌ Укажите имя файла для скачивания")
            sys.exit(1)
        
        file_name = sys.argv[2]
        kids_toys_folder = find_file(service, "Kids-Toys-Shop-Backups")
        if not kids_toys_folder:
            print("❌ Папка Kids-Toys-Shop-Backups не найдена")
            sys.exit(1)
        
        weekly_folder = find_file(service, "Weekly-Backups", kids_toys_folder['id'])
        if not weekly_folder:
            print("❌ Папка Weekly-Backups не найдена")
            sys.exit(1)
        
        file_info = find_file(service, file_name, weekly_folder['id'])
        if not file_info:
            print(f"❌ Файл {file_name} не найден")
            sys.exit(1)
        
        download_path = f"/home/kids-toys/backups/{file_name}"
        if download_file(service, file_info['id'], file_name, download_path):
            print(f"🎉 Файл сохранен: {download_path}")
        else:
            print("❌ Ошибка скачивания файла")
            sys.exit(1)
    else:
        print("❌ Неизвестная команда")
        sys.exit(1)

if __name__ == '__main__':
    main()
EOF

# Шаг 7: Создание скрипта восстановления
log "Шаг 7: Создание скрипта восстановления с Google Drive"
cat > $GOOGLE_DRIVE_DIR/restore_from_drive.sh << 'EOF'
#!/bin/bash

# 🔄 Восстановление с Google Drive
# Этот скрипт скачивает и восстанавливает данные с Google Drive

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

GOOGLE_DRIVE_DIR="/home/kids-toys/google-drive-backup"
BACKUP_DIR="/home/kids-toys/backups"

log "🔄 Восстановление с Google Drive"
echo "=================================================="

# Переход в директорию Google Drive
cd $GOOGLE_DRIVE_DIR

# Показать список доступных бэкапов
log "📋 Доступные бэкапы:"
python3 download_from_drive.py list

echo ""
read -p "Введите имя файла для восстановления (например: kids-toys-full-backup-2025-W01.tar.gz): " BACKUP_FILE

if [ -z "$BACKUP_FILE" ]; then
    error "❌ Имя файла не указано"
fi

# Скачивание файла
log "📥 Скачивание файла $BACKUP_FILE..."
python3 download_from_drive.py download "$BACKUP_FILE"

# Проверка скачанного файла
DOWNLOADED_FILE="$BACKUP_DIR/$BACKUP_FILE"
if [ ! -f "$DOWNLOADED_FILE" ]; then
    error "❌ Файл не скачан: $DOWNLOADED_FILE"
fi

log "✅ Файл скачан: $(du -h $DOWNLOADED_FILE | cut -f1)"

# Распаковка архива
log "📦 Распаковка архива..."
cd $BACKUP_DIR
tar -xzf "$BACKUP_FILE"

# Восстановление базы данных
DB_FILE=$(ls db_backup_*.sql | head -1)
if [ -f "$DB_FILE" ]; then
    log "📊 Восстановление базы данных из $DB_FILE..."
    
    # Остановка приложения
    sudo -u kids-toys pm2 stop kids-toys-backend
    
    # Восстановление базы данных
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS kids_toys_db;"
    sudo -u postgres psql -c "CREATE DATABASE kids_toys_db;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kids_toys_db TO kids_toys_user;"
    
    sudo -u postgres psql kids_toys_db < "$DB_FILE"
    
    # Запуск приложения
    sudo -u kids-toys pm2 start kids-toys-backend
    
    log "✅ База данных восстановлена"
else
    warning "⚠️ Файл базы данных не найден"
fi

# Восстановление изображений
UPLOADS_FILE=$(ls uploads_backup_*.tar.gz | head -1)
if [ -f "$UPLOADS_FILE" ]; then
    log "🖼️ Восстановление изображений из $UPLOADS_FILE..."
    
    # Создание резервной копии существующих uploads
    if [ -d "/home/kids-toys/app/uploads" ]; then
        mv /home/kids-toys/app/uploads /home/kids-toys/app/uploads_backup_$(date +%Y%m%d_%H%M%S)
    fi
    
    # Распаковка изображений
    tar -xzf "$UPLOADS_FILE" -C /home/kids-toys/app/
    chown -R kids-toys:kids-toys /home/kids-toys/app/uploads
    chmod -R 755 /home/kids-toys/app/uploads
    
    log "✅ Изображения восстановлены"
else
    warning "⚠️ Файл изображений не найден"
fi

# Восстановление конфигурации
CONFIG_FILE=$(ls config_backup_*.tar.gz | head -1)
if [ -f "$CONFIG_FILE" ]; then
    log "⚙️ Восстановление конфигурации из $CONFIG_FILE..."
    
    # Создание резервной копии существующей конфигурации
    if [ -f "/home/kids-toys/app/backend/.env" ]; then
        cp /home/kids-toys/app/backend/.env /home/kids-toys/app/backend/.env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Распаковка конфигурации
    tar -xzf "$CONFIG_FILE" -C /home/kids-toys/app/
    chown -R kids-toys:kids-toys /home/kids-toys/app/backend/.env
    chmod 600 /home/kids-toys/app/backend/.env
    
    log "✅ Конфигурация восстановлена"
else
    warning "⚠️ Файл конфигурации не найден"
fi

# Очистка временных файлов
log "🧹 Очистка временных файлов..."
rm -f db_backup_*.sql uploads_backup_*.tar.gz config_backup_*.tar.gz

log "✅ Восстановление завершено!"
log "🔄 Перезапуск приложения..."
sudo -u kids-toys pm2 restart kids-toys-backend

log "🎉 Восстановление успешно завершено!"
log "📋 Проверьте работу приложения:"
echo "   - Откройте http://YOUR_SERVER_IP в браузере"
echo "   - Проверьте отображение товаров и изображений"
echo "   - Проверьте работу корзины и заказов"
EOF

# Шаг 8: Настройка прав доступа
log "Шаг 8: Настройка прав доступа"
chown -R $APP_USER:$APP_USER $GOOGLE_DRIVE_DIR
chmod +x $GOOGLE_DRIVE_DIR/*.py
chmod +x $GOOGLE_DRIVE_DIR/*.sh

# Шаг 9: Настройка cron для еженедельных бэкапов
log "Шаг 9: Настройка cron для еженедельных бэкапов"
cat > /etc/cron.d/kids-toys-backup << EOF
# Еженедельный бэкап Kids Toys Shop на Google Drive
# Каждое воскресенье в 2:00 утра
0 2 * * 0 kids-toys /home/kids-toys/google-drive-backup/weekly_backup.sh >> /home/kids-toys/backups/backup.log 2>&1
EOF

# Шаг 10: Создание инструкций
log "Шаг 10: Создание инструкций"
cat > $GOOGLE_DRIVE_DIR/README.md << 'EOF'
# 🗓️ Автоматические бэкапы на Google Drive

## 📋 Настройка (выполнить один раз)

### 1. Получение credentials.json
1. Перейдите в [Google Cloud Console](https://console.developers.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Drive API
4. Создайте учетные данные OAuth 2.0
5. Скачайте JSON файл и переименуйте его в `credentials.json`
6. Поместите файл в папку `/home/kids-toys/google-drive-backup/`

### 2. Аутентификация
```bash
cd /home/kids-toys/google-drive-backup
python3 google_drive_auth.py
```

## 🚀 Использование

### Автоматические бэкапы
- Бэкапы создаются автоматически каждое воскресенье в 2:00 утра
- Логи сохраняются в `/home/kids-toys/backups/backup.log`

### Ручной бэкап
```bash
sudo -u kids-toys /home/kids-toys/google-drive-backup/weekly_backup.sh
```

### Восстановление
```bash
sudo -u kids-toys /home/kids-toys/google-drive-backup/restore_from_drive.sh
```

### Просмотр бэкапов
```bash
cd /home/kids-toys/google-drive-backup
python3 download_from_drive.py list
```

## 📊 Что включают бэкапы

1. **База данных** - полный дамп PostgreSQL
2. **Изображения** - папка uploads со всеми файлами
3. **Конфигурация** - .env файл и схема Prisma
4. **Полный архив** - все вышеперечисленное в одном файле

## 🔧 Управление

### Просмотр логов
```bash
tail -f /home/kids-toys/backups/backup.log
```

### Проверка cron
```bash
sudo systemctl status cron
```

### Ручной запуск cron
```bash
sudo systemctl restart cron
```

## 🆘 Устранение неполадок

### Проблемы с аутентификацией
```bash
cd /home/kids-toys/google-drive-backup
rm token.pickle
python3 google_drive_auth.py
```

### Проблемы с правами доступа
```bash
sudo chown -R kids-toys:kids-toys /home/kids-toys/google-drive-backup
sudo chmod +x /home/kids-toys/google-drive-backup/*.py
sudo chmod +x /home/kids-toys/google-drive-backup/*.sh
```

### Проблемы с cron
```bash
sudo systemctl restart cron
sudo systemctl enable cron
```
EOF

log "✅ Настройка автоматических бэкапов на Google Drive завершена!"
log "📋 Следующие шаги:"
echo "1. Получите credentials.json из Google Cloud Console"
echo "2. Поместите файл в /home/kids-toys/google-drive-backup/"
echo "3. Запустите аутентификацию:"
echo "   cd /home/kids-toys/google-drive-backup"
echo "   python3 google_drive_auth.py"
echo "4. Протестируйте бэкап:"
echo "   sudo -u kids-toys /home/kids-toys/google-drive-backup/weekly_backup.sh"

log "📖 Подробные инструкции: /home/kids-toys/google-drive-backup/README.md"
log "🗓️ Автоматические бэкапы настроены на каждое воскресенье в 2:00 утра"

echo "=================================================="
log "🎉 Система бэкапов готова к работе!"

