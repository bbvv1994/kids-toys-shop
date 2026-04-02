#!/bin/bash

# Скрипт для ежемесячной активации Brevo API ключа
# Отправляет тестовый email для поддержания активности ключа

echo "$(date): Starting Brevo API key activation..."

# Получаем API ключ из .env файла
BREVO_API_KEY=$(grep "BREVO_API_KEY" /home/kids-toys/app/backend/.env | cut -d'=' -f2)

if [ -z "$BREVO_API_KEY" ]; then
    echo "$(date): ERROR - BREVO_API_KEY not found in .env file"
    exit 1
fi

# Отправляем тестовый email
curl -X POST "https://api.brevo.com/v3/smtp/email" \
  -H "accept: application/json" \
  -H "api-key: $BREVO_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "sender": {
      "name": "Simba Toys System",
      "email": "system@simba-tzatzuim.co.il"
    },
    "to": [{
      "email": "wexkwasexort@gmail.com",
      "name": "Admin"
    }],
    "subject": "Monthly API Key Activation - Simba Toys",
    "htmlContent": "<html><body><h3>Monthly API Key Activation</h3><p>This is an automatic monthly test email to keep the Brevo API key active.</p><p>Date: '"$(date)"'</p><p>If you receive this email, the Brevo API is working correctly.</p></body></html>"
  }' \
  --max-time 30 \
  --silent \
  --show-error

if [ $? -eq 0 ]; then
    echo "$(date): SUCCESS - Test email sent successfully"
else
    echo "$(date): ERROR - Failed to send test email"
    exit 1
fi

echo "$(date): Brevo API key activation completed"