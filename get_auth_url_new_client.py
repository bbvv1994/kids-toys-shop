#!/usr/bin/env python3
"""
Скрипт для получения URL аутентификации с новым Client ID
"""

import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive.file']
CREDENTIALS_FILE = 'credentials.json'

def get_auth_url():
    """Получает URL для аутентификации с новым Client ID"""
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Файл {CREDENTIALS_FILE} не найден")
        print("Скачайте новый credentials.json с Client ID: 285199364563-lljm6au9v9i4cbnpc1ku5filt60c5fgl")
        return None
    
    try:
        # Создаем flow для Web Application
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        
        # Используем redirect_uri, который работает
        flow.redirect_uri = 'http://localhost:8080'
        
        auth_url, _ = flow.authorization_url(
            prompt='consent',
            access_type='offline'
        )
        return auth_url
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return None

def main():
    print("🔐 Получение URL аутентификации с новым Client ID")
    print("=" * 60)
    print("Client ID: 285199364563-lljm6au9v9i4cbnpc1ku5filt60c5fgl")
    print("=" * 60)
    
    auth_url = get_auth_url()
    if not auth_url:
        return
    
    print("\n📋 ИНСТРУКЦИЯ:")
    print("1. Откройте этот URL в браузере:")
    print(f"   {auth_url}")
    print("\n2. Авторизуйтесь в Google")
    print("3. После авторизации вы будете перенаправлены на localhost:8080")
    print("4. Скопируйте код авторизации из адресной строки")
    print("5. Запустите: python3 enter_auth_code_new_client.py")

if __name__ == '__main__':
    main()

