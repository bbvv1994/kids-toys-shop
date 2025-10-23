#!/bin/bash
# Еженедельный бэкап на Google Drive через Service Account
BACKUP_DIR="/home/kids-toys/backups"
DATE=$(date +%Y%m%d_%H%M%S)
WEEK=$(date +%Y-W%U)

echo "Starting weekly backup: $DATE" >> /var/log/backup.log

# Создание директории для бэкапа
mkdir -p $BACKUP_DIR

# 1. Бэкап базы данных
echo "Creating database backup..." >> /var/log/backup.log
pg_dump -U kids_toys_user -h localhost kids_toys_db > $BACKUP_DIR/db_backup_$DATE.sql

# 2. Бэкап изображений
echo "Creating uploads backup..." >> /var/log/backup.log
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /home/kids-toys/app uploads/

# 3. Бэкап конфигурации
echo "Creating config backup..." >> /var/log/backup.log
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C /home/kids-toys/app backend/.env backend/prisma/

# 4. Создание полного архива
echo "Creating full archive..." >> /var/log/backup.log
tar -czf $BACKUP_DIR/full_backup_$WEEK.tar.gz -C $BACKUP_DIR db_backup_$DATE.sql uploads_backup_$DATE.tar.gz config_backup_$DATE.tar.gz

# 5. Загрузка на Google Drive через Service Account
echo "Uploading to Google Drive..." >> /var/log/backup.log
cd /home/kids-toys/google-drive-backup

# Проверяем наличие Service Account credentials
if [ ! -f "service-account-credentials.json" ]; then
    echo "❌ Service Account credentials не найдены!" >> /var/log/backup.log
    echo "Скачайте service-account-credentials.json из Google Cloud Console" >> /var/log/backup.log
    exit 1
fi

# Загружаем полный архив
python3 service_account_upload.py "$BACKUP_DIR/full_backup_$WEEK.tar.gz" "kids-toys-full-backup-$WEEK.tar.gz"

# Загружаем отдельные файлы
python3 service_account_upload.py "$BACKUP_DIR/db_backup_$DATE.sql" "db_backup_$DATE.sql"
python3 service_account_upload.py "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" "uploads_backup_$DATE.tar.gz"
python3 service_account_upload.py "$BACKUP_DIR/config_backup_$DATE.tar.gz" "config_backup_$DATE.tar.gz"

# 6. Очистка старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Weekly backup completed: $DATE" >> /var/log/backup.log

