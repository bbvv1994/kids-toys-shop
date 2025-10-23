const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

console.log('🔍 Применение исправлений OAuth Success Page...\n');

// Проверяем переменные окружения
console.log('📋 Текущие настройки:');
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Настроен' : '❌ Не настроен'}`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Настроен' : '❌ Не настроен'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ Не настроен'}`);

console.log('\n🔧 Настройка Brevo API...');

// Настройка Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

console.log('📧 Отправка уведомления о применении исправлений...');

const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

sendSmtpEmail.subject = "✅ OAuth Success Page - Исправления применены - Simba Toys Shop";
sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .success { color: #4caf50; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
        .info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .final { background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .translation { background: #f0f8ff; padding: 10px; border-radius: 3px; margin: 5px 0; }
        .code { background: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ OAuth Success Page - Исправления применены</h1>
            <p>Simba Toys Shop - Формат сообщений обновлен</p>
        </div>
        
        <div class="content">
            <div class="success">🎉 Исправления успешно применены!</div>
            
            <p><strong>Статус:</strong> OAuth Success Page обновлен с правильным форматом сообщений</p>
            
            <div class="final">
                <strong>✅ Примененные исправления:</strong><br>
                • ✅ Переводы обновлены с поддержкой подстановки ошибки<br>
                • ✅ Формат сообщений: перевод + перенос строки + техническая ошибка<br>
                • ✅ CSS white-space: pre-line для корректного отображения переносов<br>
                • ✅ Поддержка как иврита, так и русского языка
            </div>
            
            <div class="info">
                <strong>🌐 Новый формат сообщений:</strong><br>
                <div class="translation">
                    <strong>На иврите:</strong><br>
                    שגיאה בעיבוד אסימון האימות:<br><br>
                    InvalidCharacterError: Failed to execute 'atob'...
                </div>
                <div class="translation">
                    <strong>На русском:</strong><br>
                    Ошибка обработки токена авторизации:<br><br>
                    InvalidCharacterError: Failed to execute 'atob'...
                </div>
            </div>
            
            <div class="info">
                <strong>🔧 Технические изменения:</strong><br>
                • Обновлены файлы локализации he.json и ru.json<br>
                • Добавлена поддержка подстановки {{error}} в переводах<br>
                • Обновлен OAuthSuccessPage.js для использования нового формата<br>
                • Добавлен CSS white-space: pre-line для переносов строк
            </div>
            
            <div class="info">
                <strong>📝 Код изменений:</strong><br>
                <div class="code">
                    // Переводы теперь поддерживают подстановку:<br>
                    "message": "שגיאה בעיבוד אסימון האימות:\\n\\n{{error}}"<br><br>
                    // Компонент использует подстановку:<br>
                    setMessage(t('auth.oauthError.message', { error: error.message }))<br><br>
                    // CSS для переносов строк:<br>
                    sx={{ mb: 3, whiteSpace: 'pre-line' }}
                </div>
            </div>
            
            <div class="info">
                <strong>🧪 Готово к тестированию:</strong><br>
                1. Откройте сайт на иврите<br>
                2. Попробуйте авторизацию через Google<br>
                3. Проверьте формат сообщений об ошибках<br>
                4. Убедитесь в правильном отображении переносов строк
            </div>
            
            <p style="text-align: center;">
                <a href="https://simba-tzatzuim.co.il" class="button">🌐 Тестировать сайт</a>
            </p>
        </div>
        
        <div class="footer">
            <p>OAuth Success Page - Исправления применены</p>
            <p>Simba Toys Shop - Система управления</p>
        </div>
    </div>
</body>
</html>
`;

sendSmtpEmail.sender = { "name": "Simba Toys Shop", "email": "noreply.simba.tzatzuim@gmail.com" };
sendSmtpEmail.to = [{ "email": "noreply.simba.tzatzuim@gmail.com", "name": "Admin" }];

apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('✅ Уведомление о применении исправлений отправлено!');
    console.log('📧 Message ID:', data.messageId);
    console.log('\n🎯 Результат применения исправлений:');
    console.log('• ✅ Переводы обновлены с поддержкой подстановки');
    console.log('• ✅ Формат сообщений: перевод + перенос + техническая ошибка');
    console.log('• ✅ CSS white-space: pre-line для переносов строк');
    console.log('• ✅ Поддержка иврита и русского языка');
    console.log('\n🔗 Готово к тестированию: https://simba-tzatzuim.co.il');
}, function(error) {
    console.error('❌ Ошибка отправки email:', error);
});
