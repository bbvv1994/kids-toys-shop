// Шаблоны писем на разных языках

const emailTemplates = {
  // Письмо подтверждения регистрации
  registrationConfirmation: {
    he: {
      subject: 'אישור הרשמה - סימבה מלך הצעצועים',
      html: (name, confirmUrl) => `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>אישור הרשמה</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; direction: rtl;">
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; direction: rtl;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://simba-tzatzuim.co.il/lion-logo.png..png" alt="סימבה מלך הצעצועים" style="max-width: 120px; height: auto;" />
              </div>
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3f51b5; margin: 0; font-size: 28px; direction: rtl;">🎉 ברוכים הבאים לסימבה מלך הצעצועים!</h1>
              </div>
              
              <div style="margin-bottom: 25px; direction: rtl;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; text-align: right;">
                  שלום ${name}!
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 10px 0 0 0; text-align: right;">
                  תודה רבה על ההרשמה לחנות הצעצועים שלנו. אנחנו שמחים לקבל אותך למשפחת סימבה!
                </p>
              </div>
              
              <div style="margin-bottom: 25px; direction: rtl;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; text-align: right;">
                  כדי להשלים את תהליך ההרשמה ולהפעיל את החשבון שלך, אנא אשר את כתובת האימייל שלך על ידי לחיצה על הכפתור למטה.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
                  ✅ אשר כתובת אימייל
                </a>
              </div>
              
              <div style="margin-top: 25px; padding: 20px; background-color: #e8f5e9; border-radius: 5px; border-right: 4px solid #4caf50; direction: rtl;">
                <p style="color: #2e7d32; font-size: 14px; margin: 0; text-align: right;">
                  <strong>💡 מה הלאה?</strong>
                </p>
                <p style="color: #2e7d32; font-size: 14px; margin: 10px 0 0 0; text-align: right;">
                  לאחר אישור האימייל תוכל להתחבר לחשבון האישי שלך, לקבל הצעות מיוחדות ולהתחיל לקנות מגוון רחב של צעצועים איכותיים לילדים.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; direction: rtl;">
                <p style="color: #999; font-size: 12px; margin: 5px 0;">
                  בברכה,
                </p>
                <p style="color: #3f51b5; font-size: 14px; margin: 5px 0; font-weight: bold;">
                  צוות סימבה מלך הצעצועים 🧸
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    },
    ru: {
      subject: 'Подтверждение регистрации - סימבה מלך הצעצועים',
      html: (name, confirmUrl) => `
        <!DOCTYPE html>
        <html dir="ltr" lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Подтверждение регистрации</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; direction: ltr;">
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; direction: ltr;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://simba-tzatzuim.co.il/lion-logo.png..png" alt="סימבה מלך הצעצועים" style="max-width: 120px; height: auto;" />
              </div>
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3f51b5; margin: 0; font-size: 28px; direction: ltr;">🎉 Добро пожаловать в סימבה מלך הצעצועים!</h1>
              </div>
              
              <div style="margin-bottom: 25px; direction: ltr;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                  Здравствуйте, ${name}!
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 10px 0 0 0; text-align: left;">
                  Спасибо большое за регистрацию в нашем магазине детских игрушек. Мы рады приветствовать вас в семье סימבה!
                </p>
              </div>
              
              <div style="margin-bottom: 25px; direction: ltr;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                  Для завершения процесса регистрации и активации вашего аккаунта, пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
                  ✅ Подтвердить email
                </a>
              </div>
              
              <div style="margin-top: 25px; padding: 20px; background-color: #e8f5e9; border-radius: 5px; border-left: 4px solid #4caf50; direction: ltr;">
                <p style="color: #2e7d32; font-size: 14px; margin: 0; text-align: left;">
                  <strong>💡 Что дальше?</strong>
                </p>
                <p style="color: #2e7d32; font-size: 14px; margin: 10px 0 0 0; text-align: left;">
                  После подтверждения email вы сможете войти в свой личный кабинет, получать специальные предложения и начать покупать широкий ассортимент качественных игрушек для детей.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; direction: ltr;">
                <p style="color: #999; font-size: 12px; margin: 5px 0;">
                  С уважением,
                </p>
                <p style="color: #3f51b5; font-size: 14px; margin: 5px 0; font-weight: bold;">
                  Команда סימבה מלך הצעצועים 🧸
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
  },

  // Письмо восстановления пароля
  passwordReset: {
    he: {
      subject: 'איפוס סיסמה - סימבה מלך הצעצועים',
      html: (name, resetUrl) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f44336; margin: 0; font-size: 28px;">🔐 איפוס סיסמה</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                שלום ${name}! קיבלנו בקשה לאיפוס הסיסמה שלך.
              </p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                אם אתה רוצה לאפס את הסיסמה, לחץ על הקישור למטה:
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);">
                🔑 אפס סיסמה
              </a>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background-color: #ffebee; border-radius: 5px;">
              <p style="color: #c62828; font-size: 14px; margin: 0;">
                <strong>אם לא ביקשת איפוס סיסמה, התעלם מההודעה הזו.</strong><br>
                הקישור יהיה תקף למשך 24 שעות בלבד.
              </p>
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                בברכה,<br>
                <strong>צוות סימבה מלך הצעצועים</strong>
              </p>
            </div>
          </div>
        </div>
      `
    },
    ru: {
      subject: 'Восстановление пароля - סימבה מלך הצעצועים',
      html: (name, resetUrl) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f44336; margin: 0; font-size: 28px;">🔐 Восстановление пароля</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Здравствуйте, ${name}! Мы получили запрос на восстановление вашего пароля.
              </p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Если вы хотите восстановить пароль, нажмите на ссылку ниже:
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);">
                🔑 Восстановить пароль
              </a>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background-color: #ffebee; border-radius: 5px;">
              <p style="color: #c62828; font-size: 14px; margin: 0;">
                <strong>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</strong><br>
                Ссылка действительна в течение 24 часов.
              </p>
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                С уважением,<br>
                <strong>Команда סימבה מלך הצעצועים</strong>
              </p>
            </div>
          </div>
        </div>
      `
    }
  },

  // Письмо подтверждения заказа
  orderConfirmation: {
    he: {
      subject: 'אישור הזמנה #{{orderId}} - סימבה מלך הצעצועים',
      html: (orderData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4caf50; margin: 0; font-size: 28px;">✅ הזמנה התקבלה!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                שלום ${orderData.customerName}! ההזמנה שלך התקבלה בהצלחה.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #3f51b5; margin: 0 0 15px 0; font-size: 18px;">📋 פרטי ההזמנה</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                <div><strong>מספר הזמנה:</strong> #${orderData.orderId}</div>
                <div><strong>תאריך הזמנה:</strong> ${new Date().toLocaleString('he-IL')}</div>
                <div><strong>איסוף מ:</strong> ${orderData.storeName}</div>
                <div><strong>אמצעי תשלום:</strong> ${orderData.paymentMethod === 'card' ? '💳 כרטיס' : '💰 מזומן או כרטיס'}</div>
              </div>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">📦 המוצרים שלך</h3>
              ${orderData.items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ffe0b2;">
                  <div style="flex: 1;">
                    <div style="font-weight: bold; color: #333;">${item.productName}</div>
                    <div style="font-size: 12px; color: #666;">כמות: ${item.quantity} יח'</div>
                  </div>
                  <div style="font-weight: bold; color: #e65100; font-size: 16px;">
                    ₪${item.price * item.quantity}
                  </div>
                </div>
              `).join('')}
              <div style="border-top: 2px solid #ff9800; margin-top: 15px; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #e65100;">
                  <span>סה"כ:</span>
                  <span>₪${orderData.total}</span>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                בברכה,<br>
                <strong>צוות סימבה מלך הצעצועים</strong>
              </p>
            </div>
          </div>
        </div>
      `
    },
    ru: {
      subject: 'Подтверждение заказа #{{orderId}} - סימבה מלך הצעצועים',
      html: (orderData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4caf50; margin: 0; font-size: 28px;">✅ Заказ принят!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Здравствуйте, ${orderData.customerName}! Ваш заказ успешно принят.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #3f51b5; margin: 0 0 15px 0; font-size: 18px;">📋 Детали заказа</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                <div><strong>Номер заказа:</strong> #${orderData.orderId}</div>
                <div><strong>Дата заказа:</strong> ${new Date().toLocaleString('ru-RU')}</div>
                <div><strong>Самовывоз из:</strong> ${orderData.storeName}</div>
                <div><strong>Способ оплаты:</strong> ${orderData.paymentMethod === 'card' ? '💳 Карта' : '💰 Наличными или картой'}</div>
              </div>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">📦 Ваши товары</h3>
              ${orderData.items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ffe0b2;">
                  <div style="flex: 1;">
                    <div style="font-weight: bold; color: #333;">${item.productName}</div>
                    <div style="font-size: 12px; color: #666;">Количество: ${item.quantity} шт.</div>
                  </div>
                  <div style="font-weight: bold; color: #e65100; font-size: 16px;">
                    ₪${item.price * item.quantity}
                  </div>
                </div>
              `).join('')}
              <div style="border-top: 2px solid #ff9800; margin-top: 15px; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #e65100;">
                  <span>Итого:</span>
                  <span>₪${orderData.total}</span>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                С уважением,<br>
                <strong>Команда סימבה מלך הצעצועים</strong>
              </p>
            </div>
          </div>
        </div>
      `
    }
  }
};

module.exports = emailTemplates;

