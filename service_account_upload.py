#!/usr/bin/env python3
"""
Скрипт для загрузки файлов на Google Drive через Service Account
"""

import os
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_drive_service():
    """Получение сервиса Google Drive через Service Account"""
    credentials_file = 'service-account-credentials.json'
    
    if not os.path.exists(credentials_file):
        print(f'❌ Файл {credentials_file} не найден')
        print('Скачайте файл Service Account из Google Cloud Console')
        return None
    
    try:
        credentials = service_account.Credentials.from_service_account_file(
            credentials_file, scopes=SCOPES)
        
        service = build('drive', 'v3', credentials=credentials)
        print('✅ Service Account аутентификация успешна!')
        return service
    except Exception as error:
        print(f'❌ Ошибка аутентификации: {error}')
        return None

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
        print("Использование: python3 service_account_upload.py <путь_к_файлу> [имя_файла]")
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

