#!/usr/bin/env python3
"""
Скрипт для получения URL аутентификации с правильным redirect_uri
"""

import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive.file']
CREDENTIALS_FILE = 'credentials.json'

def get_auth_url():
    """Получает URL для аутентификации с правильным redirect_uri"""
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Файл {CREDENTIALS_FILE} не найден")
        return None, None
    
    try:
        # Создаем flow с правильным redirect_uri
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        
        # Устанавливаем redirect_uri
        flow.redirect_uri = 'http://localhost:5000/api/auth/google/callback'
        
        auth_url, _ = flow.authorization_url(
            prompt='consent',
            access_type='offline'
        )
        return auth_url, flow
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return None, None

def main():
    print("🔐 Получение URL аутентификации с правильным redirect_uri")
    print("=" * 60)
    
    auth_url, flow = get_auth_url()
    if not auth_url:
        return
    
    print("\n📋 ИНСТРУКЦИЯ:")
    print("1. Откройте этот URL в браузере:")
    print(f"   {auth_url}")
    print("\n2. Авторизуйтесь в Google")
    print("3. Скопируйте код авторизации из адресной строки")
    print("4. Введите код ниже:")
    
    # Сохраняем flow для последующего использования
    import pickle
    with open('flow.pickle', 'wb') as f:
        pickle.dump(flow, f)
    
    print("\n✅ Flow сохранен в flow.pickle")

if __name__ == '__main__':
    main()

