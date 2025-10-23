// Шаблоны писем на разных языках

const emailTemplates = {
  // Письмо подтверждения регистрации
  registrationConfirmation: {
    he: {
      subject: 'אישור הרשמה - סימבה מלך הצעצועים',
      html: (name, confirmUrl) => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
<div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #3f51b5; margin: 0; font-size: 28px;">🎉 ברוכים הבאים לסימבה מלך הצעצועים!</h1>
</div>
<div style="margin-bottom: 25px;">
<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
שלום ${name}! תודה על ההרשמה בחנות הצעצועים שלנו.
</p>
</div>
<div style="margin-bottom: 25px;">
<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
כדי להשלים את ההרשמה ולהפעיל את החשבון שלך, אנא אשר את כתובת האימייל שלך.
</p>
</div>
<div style="text-align: center; margin: 30px 0;">
<a href="${confirmUrl}" style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
✅ אשר כתובת אימייל
</a>
</div>
<div style="margin-top: 25px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
<p style="color: #666; font-size: 14px; margin: 0;">
<strong>מה הלאה?</strong><br>
לאחר אישור האימייל תוכל להתחבר לחשבון שלך ולהתחיל לקנות בחנות הצעצועים שלנו.
</p>
</div>
<div style="margin-top: 25px; text-align: center;">
<p style="color: #999; font-size: 12px; margin: 0;">
בברכה,<br>
<strong>צוות סימבה מלך הצעצועים</strong>
</p>
</div>
</div>
</div>`
    },
    ru: {
      subject: 'Подтверждение регистрации - סימבה מלך הצעצועים',
      html: (name, confirmUrl) => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
<div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #3f51b5; margin: 0; font-size: 28px;">🎉 Добро пожаловать в סימבה מלך הצעצועים!</h1>
</div>
<div style="margin-bottom: 25px;">
<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
Здравствуйте, ${name}! Спасибо за регистрацию в нашем магазине детских игрушек.
</p>
</div>
<div style="margin-bottom: 25px;">
<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
Для завершения регистрации и активации вашего аккаунта, пожалуйста, подтвердите ваш email адрес.
</p>
</div>
<div style="text-align: center; margin: 30px 0;">
<a href="${confirmUrl}" style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
✅ Подтвердить email
</a>
</div>
<div style="margin-top: 25px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
<p style="color: #666; font-size: 14px; margin: 0;">
<strong>Что дальше?</strong><br>
После подтверждения email вы сможете войти в свой аккаунт и начать покупки в нашем магазине детских игрушек.
</p>
</div>
<div style="margin-top: 25px; text-align: center;">
<p style="color: #999; font-size: 12px; margin: 0;">
С уважением,<br>
<strong>Команда סימבה מלך הצעצועים</strong>
</p>
</div>
</div>
</div>`
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

