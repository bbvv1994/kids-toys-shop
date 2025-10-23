#!/usr/bin/env python3
import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive.file']

print('Создание URL для аутентификации...')
flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
auth_url, _ = flow.authorization_url(prompt='consent')

print('')
print('=== ИНСТРУКЦИЯ ПО АУТЕНТИФИКАЦИИ ===')
print('1. Откройте этот URL в браузере:')
print(auth_url)
print('')
print('2. Авторизуйтесь в Google')
print('3. Скопируйте код авторизации из адресной строки')
print('4. Введите код ниже:')
print('')

