#!/usr/bin/env python3
"""
Скрипт для ввода кода авторизации OAuth 2.0 с правильным redirect_uri
"""

import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive.file']
CREDENTIALS_FILE = 'credentials.json'

def main():
    print("🔐 Ввод кода авторизации Google Drive")
    print("=" * 50)
    
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Файл {CREDENTIALS_FILE} не найден")
        return
    
    # Проверяем наличие сохраненного flow
    if not os.path.exists('flow.pickle'):
        print("❌ Файл flow.pickle не найден. Сначала запустите get_auth_url_fixed.py")
        return
    
    # Загружаем flow
    with open('flow.pickle', 'rb') as f:
        flow = pickle.load(f)
    
    # Получаем код от пользователя
    auth_code = input("🔑 Введите код авторизации: ").strip()
    
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
        
        # Удаляем временный файл
        os.remove('flow.pickle')
        
    except Exception as e:
        print(f"❌ Ошибка аутентификации: {e}")
        print("Проверьте правильность кода и попробуйте снова")

if __name__ == '__main__':
    main()

