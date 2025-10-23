#!/usr/bin/env python3
"""
Скрипт для аутентификации через Service Account
Работает полностью автоматически без браузера
"""

import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_service_account_service():
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

if __name__ == '__main__':
    service = get_service_account_service()
    if service:
        print('🎉 Google Drive API готов к использованию!')
    else:
        print('❌ Не удалось настроить Google Drive API')

