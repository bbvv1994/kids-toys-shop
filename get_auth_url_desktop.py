#!/usr/bin/env python3
"""
Скрипт для получения URL аутентификации для Desktop приложений
"""

import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive.file']
CREDENTIALS_FILE = 'credentials.json'

def get_auth_url():
    """Получает URL для аутентификации для Desktop приложений"""
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Файл {CREDENTIALS_FILE} не найден")
        return None
    
    try:
        # Создаем flow для Desktop приложения
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        
        # Используем стандартный redirect_uri для Desktop приложений
        flow.redirect_uri = 'urn:ietf:wg:oauth:2.0:oob'
        
        auth_url, _ = flow.authorization_url(
            prompt='consent',
            access_type='offline'
        )
        return auth_url
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return None

def main():
    print("🔐 Получение URL аутентификации для Desktop приложений")
    print("=" * 60)
    
    auth_url = get_auth_url()
    if not auth_url:
        return
    
    print("\n📋 ИНСТРУКЦИЯ:")
    print("1. Откройте этот URL в браузере:")
    print(f"   {auth_url}")
    print("\n2. Авторизуйтесь в Google")
    print("3. Скопируйте код авторизации из адресной строки")
    print("4. Запустите: python3 enter_auth_code_desktop.py")

if __name__ == '__main__':
    main()

