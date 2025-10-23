#!/usr/bin/env python3
"""
Ручная аутентификация для Google Drive
Генерирует URL для аутентификации и позволяет ввести код вручную
"""

import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/drive.file']
CREDENTIALS_FILE = 'credentials.json'

def get_auth_url():
    """Получает URL для аутентификации"""
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Файл {CREDENTIALS_FILE} не найден")
        return None, None
    
    try:
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        auth_url, _ = flow.authorization_url(prompt='consent')
        return auth_url, flow
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return None, None

def main():
    print("🔐 Ручная аутентификация Google Drive")
    print("=" * 50)
    
    auth_url, flow = get_auth_url()
    if not auth_url:
        return
    
    print("\n📋 ИНСТРУКЦИЯ:")
    print("1. Откройте этот URL в браузере:")
    print(f"   {auth_url}")
    print("\n2. Авторизуйтесь в Google")
    print("3. Скопируйте код авторизации из адресной строки")
    print("4. Введите код ниже:")
    
    auth_code = input("\n🔑 Введите код авторизации: ").strip()
    
    if not auth_code:
        print("❌ Код не введен")
        return
    
    try:
        # Обмениваем код на токен
        flow.fetch_token(code=auth_code)
        creds = flow.credentials
        
        # Сохраняем токен
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
        
        print("✅ Аутентификация успешна!")
        print("✅ Токен сохранен в token.pickle")
        print("🎉 Теперь бэкапы будут работать автоматически!")
        
    except Exception as e:
        print(f"❌ Ошибка аутентификации: {e}")

if __name__ == '__main__':
    main()

