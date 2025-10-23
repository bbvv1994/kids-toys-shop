#!/usr/bin/env python3
"""
Скрипт для ввода кода авторизации OAuth 2.0
"""

import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/drive.file']
CREDENTIALS_FILE = 'credentials.json'

def main():
    print("🔐 Ввод кода авторизации Google Drive")
    print("=" * 50)
    
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Файл {CREDENTIALS_FILE} не найден")
        return
    
    # Получаем код от пользователя
    auth_code = input("🔑 Введите код авторизации: ").strip()
    
    if not auth_code:
        print("❌ Код не введен")
        return
    
    try:
        # Создаем flow
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        
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
        print("Проверьте правильность кода и попробуйте снова")

if __name__ == '__main__':
    main()

