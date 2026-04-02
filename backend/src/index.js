require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Р›РѕРіРёСЂРѕРІР°РЅРёРµ РґР»СЏ РґРёР°РіРЅРѕСЃС‚РёРєРё
console.log('рџљЂ Starting backend server...');
console.log('рџ”Ќ DEBUG: __dirname:', __dirname);
console.log('рџ”Ќ DEBUG: process.cwd():', process.cwd());
console.log('рџ”Ќ DEBUG: Node.js version:', process.version);
console.log('рџ”Ќ DEBUG: Platform:', process.platform);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const SibApiV3Sdk = require('sib-api-v3-sdk');
const emailTemplates = require('./emailTemplates');
const TelegramBot = require('node-telegram-bot-api');
const ImageMiddleware = require('./imageMiddleware');
const BatchImageProcessor = require('./batchImageProcessor');
const ProductionUploadMiddleware = require('./productionUploadMiddleware');
const CloudinaryUploadMiddleware = require('./cloudinaryUploadMiddleware');
const FlexibleUploadMiddleware = require('./flexibleUploadMiddleware');
const SmartImageUploadMiddleware = require('./smartImageUploadMiddleware');
const DualStorageUploadMiddleware = require('./dualStorageUploadMiddleware');
const TranslationService = require('./services/translationService');
const SafeMigration = require('../safe-migration');
const { COLOR_PALETTE } = require('./colorPalette');

// РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РєСЌС€РёСЂРѕРІР°РЅРёСЏ
const cacheManager = require('./cache');
const { cacheMiddleware, smartInvalidateCache, invalidateCache, CACHE_PATTERNS } = require('./cacheMiddleware');

// РџРѕРґРєР»СЋС‡РµРЅРёРµ Рє Redis
cacheManager.connect().then(() => {
  console.log('вњ… РљСЌС€РёСЂРѕРІР°РЅРёРµ РёРЅРёС†РёР°Р»РёР·РёСЂРѕРІР°РЅРѕ');
}).catch(err => {
  console.log('вќЊ РћС€РёР±РєР° РёРЅРёС†РёР°Р»РёР·Р°С†РёРё РєСЌС€РёСЂРѕРІР°РЅРёСЏ:', err.message);
});
// РЎРѕР·РґР°РµРј РѕРґРёРЅ СЌРєР·РµРјРїР»СЏСЂ ImageMiddleware РґР»СЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ РІРѕ РІСЃРµС… РјР°СЂС€СЂСѓС‚Р°С…
const imageMiddleware = new ImageMiddleware();
const productionUploadMiddleware = new ProductionUploadMiddleware();
const cloudinaryUploadMiddleware = new CloudinaryUploadMiddleware();
const flexibleUploadMiddleware = new FlexibleUploadMiddleware();
const smartImageUploadMiddleware = new SmartImageUploadMiddleware();
// РСЃРїРѕР»СЊР·СѓРµРј DualStorage РґР»СЏ С‚СЂРѕР№РЅРѕРіРѕ СЃРѕС…СЂР°РЅРµРЅРёСЏ (Cloudinary + HD + compressed)
const dualStorageUploadMiddleware = new DualStorageUploadMiddleware();
console.log('рџЋЇ РђРєС‚РёРІРЅС‹Р№ РѕР±СЂР°Р±РѕС‚С‡РёРє РёР·РѕР±СЂР°Р¶РµРЅРёР№: DualStorage (Triple Storage)');

// РќР°СЃС‚СЂРѕР№РєР° Brevo
// Brevo API initialization
let apiInstance = null;
console.log('Initializing Brevo API...');
console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
if (process.env.BREVO_API_KEY) {
  try {
    console.log('Creating Brevo API client...');
    const apiClient = new SibApiV3Sdk.ApiClient();
    console.log('Setting API key...');
    apiClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
    console.log('Creating TransactionalEmailsApi instance...');
    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi(apiClient);
    console.log('Brevo API initialized successfully');
  } catch (error) {
    console.error('Error initializing Brevo API:', error);
    apiInstance = null;
  }
} else {
  console.log('BREVO_API_KEY not found in environment variables');
}

// РќР°СЃС‚СЂРѕР№РєР° Telegram Р±РѕС‚Р°
let telegramBot = null;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
  try {
    telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    console.log('Telegram bot initialized successfully');
  } catch (error) {
    console.error('Error initializing Telegram bot:', error);
    telegramBot = null;
  }
}

// Р¤СѓРЅРєС†РёСЏ РґР»СЏ РѕС‚РїСЂР°РІРєРё СѓРІРµРґРѕРјР»РµРЅРёСЏ РІ Telegram
async function sendTelegramNotification(message) {
  try {
    console.log('рџ”Ќ Telegram notification function called');
    console.log('рџ“± Telegram bot exists:', !!telegramBot);
    console.log('рџ”‘ TELEGRAM_BOT_TOKEN exists:', !!process.env.TELEGRAM_BOT_TOKEN);
    console.log('рџ’¬ TELEGRAM_CHAT_ID exists:', !!process.env.TELEGRAM_CHAT_ID);
    console.log('рџ‘Ґ TELEGRAM_CHAT_IDS exists:', !!process.env.TELEGRAM_CHAT_IDS);
    console.log('рџ“ќ Message to send:', message.substring(0, 100) + '...');
    
    if (!telegramBot) {
      console.log('вќЊ Telegram bot not configured, skipping notification');
      return true;
    }
    
    // РџРѕР»СѓС‡Р°РµРј СЃРїРёСЃРѕРє Chat ID РёР· РїРµСЂРµРјРµРЅРЅРѕР№ РѕРєСЂСѓР¶РµРЅРёСЏ
    let chatIds = [];
    
    if (process.env.TELEGRAM_CHAT_IDS) {
      console.log('рџ“‹ Using TELEGRAM_CHAT_IDS:', process.env.TELEGRAM_CHAT_IDS);
      chatIds = process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim());
    } else if (process.env.TELEGRAM_CHAT_ID) {
      console.log('рџ“‹ Using TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID);
      chatIds = [process.env.TELEGRAM_CHAT_ID];
    }
    
    console.log('рџЋЇ Chat IDs to send to:', chatIds);
    
    if (chatIds.length === 0) {
      console.log('вќЊ No Telegram chat IDs configured, skipping notification');
      console.log('рџ’Ў Available environment variables:');
      console.log('   - TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID);
      console.log('   - TELEGRAM_CHAT_IDS:', process.env.TELEGRAM_CHAT_IDS);
      return true;
    }
    
    // РћС‚РїСЂР°РІР»СЏРµРј СЃРѕРѕР±С‰РµРЅРёРµ РІСЃРµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏРј
    const sendPromises = chatIds.map(chatId => 
      telegramBot.sendMessage(chatId, message, { parse_mode: 'HTML' })
        .then(() => {
          console.log(`вњ… Telegram notification sent successfully to chat ID: ${chatId}`);
          return true;
        })
        .catch(error => {
          console.error(`вќЊ Error sending Telegram notification to chat ID ${chatId}:`, error.message);
          return false;
        })
    );
    
    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
    
    console.log(`рџ“Љ Telegram notifications summary: ${successCount}/${chatIds.length} successful`);
    return successCount > 0;
  } catch (error) {
    console.error('рџ’Ґ Error in sendTelegramNotification function:', error);
    return false;
  }
}

// Р¤СѓРЅРєС†РёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°РґСЂРµСЃР° РјР°РіР°Р·РёРЅР°
function getStoreAddress(pickupStore) {
  const storeAddresses = {
    'store1': 'ЧЁЧ•Ч‘ЧЁЧ ЧЎЧ•ЧњЧ“ 8 Ч§ЧЁЧ™Ч™ЧЄ Ч™Чќ',
    'store2': 'Ч•Ч™Ч¦ЧћЧџ 6 Ч§ЧЁЧ™Ч™ЧЄ ЧћЧ•Ч¦Ч§Ч™Чџ'
  };
  return storeAddresses[pickupStore] || 'Ч›ЧЄЧ•Ч‘ЧЄ ЧњЧђ Ч¦Ч•Ч™Ч Ч”';
}

// Р¤СѓРЅРєС†РёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїРѕР»РЅРѕР№ РёРЅС„РѕСЂРјР°С†РёРё Рѕ РјР°РіР°Р·РёРЅРµ
function getStoreInfo(pickupStore) {
  const storeInfo = {
    'store1': { name: 'Ч—Ч Ч•ЧЄ Ч§ЧЁЧ™Ч™ЧЄ Ч™Чќ', address: 'ЧЁЧ•Ч‘ЧЁЧ ЧЎЧ•ЧњЧ“ 8 Ч§ЧЁЧ™Ч™ЧЄ Ч™Чќ' },
    'store2': { name: 'Ч—Ч Ч•ЧЄ Ч§ЧЁЧ™Ч™ЧЄ ЧћЧ•Ч¦Ч§Ч™Чџ', address: 'Ч•Ч™Ч¦ЧћЧџ 6 Ч§ЧЁЧ™Ч™ЧЄ ЧћЧ•Ч¦Ч§Ч™Чџ' }
  };
  return storeInfo[pickupStore] || { name: 'Ч—Ч Ч•ЧЄ ЧњЧђ Ч ЧћЧ¦ЧђЧ”', address: 'Ч›ЧЄЧ•Ч‘ЧЄ ЧњЧђ Ч¦Ч•Ч™Ч Ч”' };
}

// Р¤СѓРЅРєС†РёСЏ РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕРіРѕ РїРѕР»СѓС‡РµРЅРёСЏ РїРѕР»РµР№ РїРµСЂРµРІРѕРґРѕРІ
async function getTranslationFields() {
  try {
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Product' 
      AND column_name IN ('nameHe', 'descriptionHe')
    `;
    return tableInfo.map(col => col.column_name);
  } catch (error) {
    console.log('вљ пёЏ РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРѕРІРµСЂРёС‚СЊ РїРѕР»СЏ РїРµСЂРµРІРѕРґРѕРІ:', error.message);
    return [];
  }
}

// Р¤СѓРЅРєС†РёСЏ РґР»СЏ РѕС‚РїСЂР°РІРєРё email С‡РµСЂРµР· Brevo СЃ РїРѕРґРґРµСЂР¶РєРѕР№ Р»РѕРєР°Р»РёР·Р°С†РёРё
async function sendEmail(to, subject, htmlContent, language = 'he') {
  try {
    console.log('рџ“§ sendEmail called with:', { 
      to, 
      subject, 
      hasHtmlContent: !!htmlContent, 
      htmlLength: htmlContent?.length || 0,
      language 
    });
    console.log('рџ”‘ BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
    console.log('рџ”Њ apiInstance exists:', !!apiInstance);
    
    // РџСЂРѕРІРµСЂСЏРµРј С‡С‚Рѕ HTML РєРѕРЅС‚РµРЅС‚ РЅРµ РїСѓСЃС‚РѕР№
    if (!htmlContent || htmlContent.length < 50) {
      console.error('вќЊ HTML content is empty or too short:', htmlContent?.length || 0);
      throw new Error('Email HTML content is empty or invalid');
    }
    
    // Р•СЃР»Рё РЅРµС‚ API РєР»СЋС‡Р° РёР»Рё СЌРєР·РµРјРїР»СЏСЂР°, Р»РѕРіРёСЂСѓРµРј РЅРѕ РїСЂРѕРґРѕР»Р¶Р°РµРј
    if (!process.env.BREVO_API_KEY || !apiInstance) {
      console.warn('вљ пёЏ Brevo API not configured, email will not be sent');
      console.log('рџ“‹ Email would have been sent:', { to, subject, language });
      return true; // Р’РѕР·РІСЂР°С‰Р°РµРј true РґР»СЏ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ Р±РµР· API
    }
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { 
      name: 'ЧЎЧ™ЧћЧ‘Ч” ЧћЧњЧљ Ч”Ч¦ЧўЧ¦Ч•ЧўЧ™Чќ', // Р’СЃРµРіРґР° РЅР° РёРІСЂРёС‚Рµ
      email: 'noreply.simba.tzatzuim@gmail.com' 
    };
    
    console.log('рџ“¤ Sending email with params:', {
      sender: sendSmtpEmail.sender,
      to: to,
      subject: subject,
      language: language,
      htmlContentLength: htmlContent.length
    });

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('вњ… Email sent successfully via Brevo:', {
      messageId: result?.messageId || 'unknown',
      to: to
    });
    return true;
  } catch (error) {
    console.error('вќЊ Error sending email:', {
      error: error.message,
      to: to,
      subject: subject,
      statusCode: error.response?.statusCode,
      body: error.response?.body
    });
    
    // Р•СЃР»Рё СЌС‚Рѕ РѕС€РёР±РєР° РѕС‚ Brevo API, РІС‹РІРѕРґРёРј РґРµС‚Р°Р»Рё
    if (error.response) {
      console.error('Brevo API error details:', {
        status: error.response.statusCode,
        text: error.response.text,
        body: error.response.body
      });
    }
    
    // Р‘СЂРѕСЃР°РµРј РѕС€РёР±РєСѓ РґР°Р»СЊС€Рµ, С‡С‚РѕР±С‹ РІС‹Р·С‹РІР°СЋС‰РёР№ РєРѕРґ Р·РЅР°Р» Рѕ РїСЂРѕР±Р»РµРјРµ
    throw error;
  }
}


const app = express();
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Р›РѕРіРёСЂРѕРІР°РЅРёРµ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё Prisma
console.log('рџ”§ Initializing Prisma Client...');
console.log('рџ“Љ DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
console.log('рџ”‘ JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');

// РўРµСЃС‚РёСЂСѓРµРј РїРѕРґРєР»СЋС‡РµРЅРёРµ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
prisma.$connect()
  .then(() => {
    console.log('вњ… Prisma connected to database successfully');
  })
  .catch((error) => {
    console.error('вќЊ Prisma connection failed:', error);
    console.error('вќЊ Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  });

prisma.$connect()
  .then(() => {})
  .catch((err) => {
    console.error('Prisma failed to connect:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5001;

// РќР°СЃС‚СЂРѕР№РєР° multer РґР»СЏ production Рё development
let storage;
let upload;

// Р’СЃРµРіРґР° РёСЃРїРѕР»СЊР·СѓРµРј РїР°РјСЏС‚СЊ РґР»СЏ Р·Р°РіСЂСѓР·РєРё С„Р°Р№Р»РѕРІ, С‡С‚РѕР±С‹ РјРѕР¶РЅРѕ Р±С‹Р»Рѕ РѕР±СЂР°Р±Р°С‚С‹РІР°С‚СЊ РёС…
upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// РЎРѕР·РґР°РµРј РїР°РїРєСѓ uploads РµСЃР»Рё РµС‘ РЅРµС‚
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// CORS РЅР°СЃС‚СЂРѕР№РєРё
const corsOptions = {
  origin: function (origin, callback) {
    console.log('рџЊђ CORS check - Origin:', origin);
    
    // Р Р°Р·СЂРµС€Р°РµРј Р·Р°РїСЂРѕСЃС‹ Р±РµР· origin (РЅР°РїСЂРёРјРµСЂ, Postman)
    if (!origin) {
      console.log('вњ… CORS allowed - No origin (Postman, etc.)');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://192.168.31.156:3000',
      'http://192.168.31.156',
      'http://192.168.31.103:3000',
      'http://192.168.31.103:3001',
      'http://192.168.31.103',
      'http://91.99.85.48',
      'http://91.99.85.48:80',
      'http://91.99.85.48:3000',
      // РџСЂРѕРґР°РєС€РµРЅ РґРѕРјРµРЅ
      'https://simba-tzatzuim.co.il',
      'https://www.simba-tzatzuim.co.il',
      'http://simba-tzatzuim.co.il',
      'http://www.simba-tzatzuim.co.il',
    ];
    
    // РџСЂРѕРІРµСЂСЏРµРј С‚РѕС‡РЅРѕРµ СЃРѕРІРїР°РґРµРЅРёРµ
    if (allowedOrigins.includes(origin)) {
      console.log('вњ… CORS allowed origin:', origin);
      return callback(null, true);
    }
    
    // Р Р°Р·СЂРµС€Р°РµРј РІСЃРµ Р»РѕРєР°Р»СЊРЅС‹Рµ IP Р°РґСЂРµСЃР° (РґР»СЏ РјРѕР±РёР»СЊРЅРѕРіРѕ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ)
    if (origin.includes('192.168.') || origin.includes('10.') || origin.includes('172.')) {
      console.log('вњ… CORS allowed local network origin:', origin);
      return callback(null, true);
    }
    
    // Р’ production СЂР°Р·СЂРµС€Р°РµРј РІСЃРµ РґРѕРјРµРЅС‹
    if (process.env.NODE_ENV === 'production') {
      console.log('вњ… CORS allowed production origin:', origin);
      return callback(null, true);
    }
    
    
    console.log('вќЊ CORS blocked origin:', origin);
    console.log('вќЊ Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// РќР°СЃС‚СЂРѕР№РєР° body-parser СЃ РїСЂР°РІРёР»СЊРЅРѕР№ РєРѕРґРёСЂРѕРІРєРѕР№
const bodyParser = require('body-parser');
app.use(bodyParser.json({ 
  limit: '100mb'
}));
app.use(bodyParser.urlencoded({ 
  extended: true, 
  limit: '100mb'
}));

// Р”РѕР±Р°РІР»СЏРµРј РґРµС‚Р°Р»СЊРЅРѕРµ Р»РѕРіРёСЂРѕРІР°РЅРёРµ РґР»СЏ РІСЃРµС… Р·Р°РїСЂРѕСЃРѕРІ
app.use((req, res, next) => {
  console.log(`\nрџ”Ќ [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('рџ“‹ Headers:', JSON.stringify(req.headers, null, 2));
  console.log('рџ“Љ Body size:', req.headers['content-length'] || 'unknown');
  console.log('рџЊђ User-Agent:', req.headers['user-agent'] || 'unknown');
  console.log('рџ”ђ Content-Type:', req.headers['content-type'] || 'unknown');
  console.log('рџ”‘ Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
  
  // Р›РѕРіРёСЂСѓРµРј body РґР»СЏ POST/PUT Р·Р°РїСЂРѕСЃРѕРІ
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('рџ“ќ Request body preview:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Middleware РґР»СЏ РїСЂР°РІРёР»СЊРЅРѕР№ РѕР±СЂР°Р±РѕС‚РєРё UTF-8 С‚РѕР»СЊРєРѕ РґР»СЏ JSON РѕС‚РІРµС‚РѕРІ
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(obj) {
    console.log(`рџ“¤ [${new Date().toISOString()}] Sending JSON response:`, JSON.stringify(obj, null, 2));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, obj);
  };
  next();
});

// Middleware РґР»СЏ Р»РѕРіРёСЂРѕРІР°РЅРёСЏ РѕС€РёР±РѕРє
app.use((err, req, res, next) => {
  console.error(`\nвќЊ [${new Date().toISOString()}] ERROR in ${req.method} ${req.url}:`);
  console.error('рџљЁ Error message:', err.message);
  console.error('рџ“Љ Error stack:', err.stack);
  console.error('рџ”Ќ Request body:', req.body);
  console.error('рџ“‹ Request headers:', req.headers);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Р›РѕРіРёСЂРѕРІР°РЅРёРµ РґР»СЏ РґРёР°РіРЅРѕСЃС‚РёРєРё СЃС‚Р°С‚РёС‡РµСЃРєРёС… С„Р°Р№Р»РѕРІ
const uploadsPath = path.join(__dirname, '..', '..', 'backend', 'uploads');
const hdUploadsPath = path.join(__dirname, '..', '..', 'backend', 'uploads', 'hd');

console.log('рџ”Ќ DEBUG: Uploads path:', uploadsPath);
console.log('рџ”Ќ DEBUG: HD uploads path:', hdUploadsPath);
console.log('рџ”Ќ DEBUG: Uploads directory exists:', require('fs').existsSync(uploadsPath));
console.log('рџ”Ќ DEBUG: HD uploads directory exists:', require('fs').existsSync(hdUploadsPath));

// Middleware РґР»СЏ Р»РѕРіРёСЂРѕРІР°РЅРёСЏ Р·Р°РїСЂРѕСЃРѕРІ Рє СЃС‚Р°С‚РёС‡РµСЃРєРёРј С„Р°Р№Р»Р°Рј
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsPath, req.path);
  console.log('рџ”Ќ DEBUG: Static file request:', req.path);
  console.log('рџ”Ќ DEBUG: Full file path:', filePath);
  console.log('рџ”Ќ DEBUG: File exists:', require('fs').existsSync(filePath));
  
  if (require('fs').existsSync(filePath)) {
    const stats = require('fs').statSync(filePath);
    console.log('рџ”Ќ DEBUG: File size:', stats.size, 'bytes');
    console.log('рџ”Ќ DEBUG: File permissions:', stats.mode.toString(8));
  } else {
    console.log('вќЊ DEBUG: File not found:', filePath);
  }
  
  next();
}, express.static(uploadsPath, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

app.use('/uploads/hd', (req, res, next) => {
  const filePath = path.join(hdUploadsPath, req.path);
  console.log('рџ”Ќ DEBUG: HD static file request:', req.path);
  console.log('рџ”Ќ DEBUG: HD full file path:', filePath);
  console.log('рџ”Ќ DEBUG: HD file exists:', require('fs').existsSync(filePath));
  next();
}, express.static(hdUploadsPath, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(passport.initialize());

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

// РўРµСЃС‚РѕРІС‹Р№ endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё JSON РїР°СЂСЃРёРЅРіР°
app.post('/api/test-json', (req, res) => {
  console.log('Test JSON endpoint called');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  res.json({ 
    message: 'JSON parsing works!', 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// РўРµСЃС‚РѕРІС‹Р№ endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё raw РґР°РЅРЅС‹С…
app.post('/api/test-raw', (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    console.log('Raw body:', body);
    console.log('Body length:', body.length);
    console.log('Body type:', typeof body);
    res.json({ 
      message: 'Raw data received!', 
      rawData: body,
      length: body.length,
      timestamp: new Date().toISOString()
    });
  });
});

// РџСЂРѕСЃС‚РѕР№ endpoint РґР»СЏ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ Р±РµР· body-parser
app.post('/api/test-simple', (req, res) => {
  console.log('Test simple endpoint called');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  res.json({ 
    message: 'Simple test works!', 
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Sitemap.xml endpoint РґР»СЏ SEO
const SitemapGenerator = require('./sitemapGenerator');
app.get('/sitemap.xml', async (req, res) => {
  try {
    console.log('рџ“Ќ Sitemap.xml requested');
    const generator = new SitemapGenerator();
    const sitemap = await generator.generate();
    
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600'); // РљСЌС€РёСЂРѕРІР°С‚СЊ РЅР° 1 С‡Р°СЃ
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt endpoint РґР»СЏ SEO
app.get('/robots.txt', (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://simba-tzatzuim.co.il/sitemap.xml

# Disallow admin pages
Disallow: /admin
Disallow: /cms
Disallow: /api/admin

# Allow all other pages
Allow: /catalog
Allow: /product
Allow: /category
Allow: /subcategory
`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400'); // РљСЌС€ РЅР° 24 С‡Р°СЃР°
  res.send(robotsTxt);
});

// РўРµСЃС‚РѕРІС‹Р№ endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё СЃС‚Р°С‚РёС‡РµСЃРєРёС… С„Р°Р№Р»РѕРІ
app.get('/api/test-static', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadsPath = path.join(__dirname, '..', '..', 'backend', 'uploads');
  const hdPath = path.join(__dirname, '..', '..', 'backend', 'uploads', 'hd');
  
  try {
    const uploadsExists = fs.existsSync(uploadsPath);
    const hdExists = fs.existsSync(hdPath);
    
    let uploadsFiles = [];
    let hdFiles = [];
    
    if (uploadsExists) {
      uploadsFiles = fs.readdirSync(uploadsPath).slice(0, 5); // РџРµСЂРІС‹Рµ 5 С„Р°Р№Р»РѕРІ
    }
    
    if (hdExists) {
      hdFiles = fs.readdirSync(hdPath).slice(0, 5); // РџРµСЂРІС‹Рµ 5 С„Р°Р№Р»РѕРІ
    }
    
    res.json({
      success: true,
      uploadsPath,
      hdPath,
      uploadsExists,
      hdExists,
      uploadsFiles,
      hdFiles,
      currentDir: __dirname,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      uploadsPath,
      hdPath,
      currentDir: __dirname
    });
  }
});

// Debug endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё РєР°С‚РµРіРѕСЂРёР№
app.get('/api/debug/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ 
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 5
    });
    
    res.json({ 
      total: categories.length,
      categories: categories,
      message: 'Debug endpoint working'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Debug endpoint error', 
      message: error.message 
    });
  }
});

// Endpoint РґР»СЏ РёРјРїРѕСЂС‚Р° РґР°РЅРЅС‹С… РІ Render Р±Р°Р·Сѓ РґР°РЅРЅС‹С…
app.post('/api/debug/import-data', async (req, res) => {
  try {
    console.log('рџљЂ РќР°С‡РёРЅР°РµРј РёРјРїРѕСЂС‚ РґР°РЅРЅС‹С… С‡РµСЂРµР· API...');
    
    // Р’СЂРµРјРµРЅРЅРѕ РѕС‚РєР»СЋС‡Р°РµРј Р°РІС‚РѕСЂРёР·Р°С†РёСЋ РґР»СЏ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   return res.status(401).json({ error: 'РўСЂРµР±СѓРµС‚СЃСЏ Р°РІС‚РѕСЂРёР·Р°С†РёСЏ' });
    // }
    
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    // if (!user || user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    // }
    
    // РЎРѕР·РґР°РµРј С‚РµСЃС‚РѕРІС‹Рµ РґР°РЅРЅС‹Рµ РїСЂСЏРјРѕ РІ РєРѕРґРµ
    const testCategories = [
      { id: 1, name: 'РРіСЂСѓС€РєРё', active: true, order: 1, parentId: null },
      { id: 2, name: 'РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂС‹', active: true, order: 2, parentId: null },
      { id: 3, name: 'РџР°Р·Р»С‹', active: true, order: 3, parentId: null },
      { id: 4, name: 'РўРІРѕСЂС‡РµСЃС‚РІРѕ', active: true, order: 4, parentId: null },
      { id: 5, name: 'РљР°РЅС†С‚РѕРІР°СЂС‹', active: true, order: 5, parentId: null }
    ];
    
    const testProducts = [
      { id: 1, name: 'РљСѓРєР»Р° Р‘Р°СЂР±Рё', price: 299.99, description: 'РљСЂР°СЃРёРІР°СЏ РєСѓРєР»Р°', categoryId: 1, active: true },
      { id: 2, name: 'РњР°С€РёРЅРєР° СЂР°РґРёРѕСѓРїСЂР°РІР»СЏРµРјР°СЏ', price: 599.99, description: 'Р‘С‹СЃС‚СЂР°СЏ РјР°С€РёРЅРєР°', categoryId: 1, active: true },
      { id: 3, name: 'РџР°Р·Р» 100 РґРµС‚Р°Р»РµР№', price: 199.99, description: 'Р Р°Р·РІРёРІР°СЋС‰РёР№ РїР°Р·Р»', categoryId: 3, active: true }
    ];
    
    console.log('рџ“‚ РРјРїРѕСЂС‚РёСЂСѓРµРј С‚РµСЃС‚РѕРІС‹Рµ РєР°С‚РµРіРѕСЂРёРё...');
    for (const category of testCategories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`вњ… РРјРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ ${testCategories.length} РєР°С‚РµРіРѕСЂРёР№`);
    
    console.log('рџ“¦ РРјРїРѕСЂС‚РёСЂСѓРµРј С‚РµСЃС‚РѕРІС‹Рµ РїСЂРѕРґСѓРєС‚С‹...');
    for (const product of testProducts) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`вњ… РРјРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ ${testProducts.length} РїСЂРѕРґСѓРєС‚РѕРІ`);
    
    // РџСЂРѕРІРµСЂСЏРµРј РєРѕР»РёС‡РµСЃС‚РІРѕ Р·Р°РїРёСЃРµР№
    const categoriesCount = await prisma.category.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();
    const ordersCount = await prisma.order.count();
    const reviewsCount = await prisma.review.count();
    
    res.json({
      success: true,
      message: 'Р”Р°РЅРЅС‹Рµ СѓСЃРїРµС€РЅРѕ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅС‹',
      stats: {
        categories: categoriesCount,
        products: productsCount,
        users: usersCount,
        orders: ordersCount,
        reviews: reviewsCount
      }
    });
    
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РїСЂРё РёРјРїРѕСЂС‚Рµ РґР°РЅРЅС‹С…:', error);
    res.status(500).json({ 
      error: 'РћС€РёР±РєР° РїСЂРё РёРјРїРѕСЂС‚Рµ РґР°РЅРЅС‹С…', 
      message: error.message 
    });
  }
});

// Р¤СѓРЅРєС†РёСЏ РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕРіРѕ РґРµРєРѕРґРёСЂРѕРІР°РЅРёСЏ РёРјРµРЅРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
function decodeUserName(name) {
  if (!name) return '';
  
  try {
    console.log('Original name for decoding:', name);
    
    // РџСЂРѕРІРµСЂСЏРµРј, РЅСѓР¶РЅРѕ Р»Рё РґРµРєРѕРґРёСЂРѕРІР°С‚СЊ
    let decoded = name;
    
    // Р•СЃР»Рё РёРјСЏ СЃРѕРґРµСЂР¶РёС‚ %XX РєРѕРґРёСЂРѕРІРєСѓ, РґРµРєРѕРґРёСЂСѓРµРј
    if (name.includes('%')) {
      decoded = decodeURIComponent(name);
      console.log('First decode:', decoded);
    }
    
    // Р•СЃР»Рё СЂРµР·СѓР»СЊС‚Р°С‚ СЃРѕРґРµСЂР¶РёС‚ РµС‰Рµ %XX, РґРµРєРѕРґРёСЂСѓРµРј РµС‰Рµ СЂР°Р·
    if (decoded.includes('%')) {
      decoded = decodeURIComponent(decoded);
      console.log('Second decode:', decoded);
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, РЅРµ СЏРІР»СЏРµС‚СЃСЏ Р»Рё СЂРµР·СѓР»СЊС‚Р°С‚ base64
    if (decoded && /^[A-Za-z0-9+/]*={0,2}$/.test(decoded)) {
      try {
        const base64Decoded = Buffer.from(decoded, 'base64').toString('utf8');
        if (base64Decoded && base64Decoded.length > 0) {
          decoded = base64Decoded;
          console.log('Base64 decode:', decoded);
        }
      } catch (base64Error) {
        console.log('Not base64 encoded');
      }
    }
    
    // РћР±СЂР°Р±РѕС‚РєР° СЃРїРµС†РёР°Р»СЊРЅС‹С… СЃРёРјРІРѕР»РѕРІ Рё СЌРјРѕРґР·Рё
    try {
      // РџСЂРѕР±СѓРµРј РґРµРєРѕРґРёСЂРѕРІР°С‚СЊ РєР°Рє JSON, РµСЃР»Рё СЌС‚Рѕ РІРѕР·РјРѕР¶РЅРѕ
      if (decoded.startsWith('"') && decoded.endsWith('"')) {
        const jsonDecoded = JSON.parse(decoded);
        if (jsonDecoded && typeof jsonDecoded === 'string') {
          decoded = jsonDecoded;
          console.log('JSON decode:', decoded);
        }
      }
    } catch (jsonError) {
      // РРіРЅРѕСЂРёСЂСѓРµРј РѕС€РёР±РєРё JSON РїР°СЂСЃРёРЅРіР°
    }
    
    // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ РѕР±СЂР°Р±РѕС‚РєР° РґР»СЏ URL-encoded СЃРёРјРІРѕР»РѕРІ
    if (decoded.includes('+')) {
      decoded = decoded.replace(/\+/g, ' ');
    }
    
    // РЈР±РёСЂР°РµРј Р»РёС€РЅРёРµ РїСЂРѕР±РµР»С‹ Рё РЅРѕСЂРјР°Р»РёР·СѓРµРј
    decoded = decoded.trim().replace(/\s+/g, ' ');
    
    console.log('Final decoded name:', decoded);
    
    // Р•СЃР»Рё СЂРµР·СѓР»СЊС‚Р°С‚ РїСѓСЃС‚РѕР№, РІРѕР·РІСЂР°С‰Р°РµРј РѕСЂРёРіРёРЅР°Р»СЊРЅРѕРµ РёРјСЏ
    return decoded || name;
  } catch (error) {
    console.error('Error decoding user name:', error);
    // Р’ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё РІРѕР·РІСЂР°С‰Р°РµРј РѕСЂРёРіРёРЅР°Р»СЊРЅРѕРµ РёРјСЏ
    return name;
  }
}

// === Google OAuth Strategy ===
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile:', profile);
    console.log('Original displayName:', profile.displayName);
    
    // Р”РµРєРѕРґРёСЂСѓРµРј РёРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    const decodedName = decodeUserName(profile.displayName);
    console.log('Decoded displayName:', decodedName);
    
    // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј Google ID
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
    
    if (!user) {
      // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј email
      const existingUser = await prisma.user.findUnique({ 
        where: { email: profile.emails[0].value } 
      });
      
      if (existingUser) {
        // Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃСѓС‰РµСЃС‚РІСѓРµС‚, РЅРѕ РЅРµ СЃРІСЏР·Р°РЅ СЃ Google, РѕР±РЅРѕРІР»СЏРµРј РµРіРѕ
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            googleId: profile.id,
            emailVerified: true,
            name: decodedName || existingUser.name
          }
        });
      } else {
        // РЎРѕР·РґР°РµРј РЅРѕРІРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: decodedName,
            googleId: profile.id,
            emailVerified: true,
            role: 'user'
          }
        });
      }
    } else {
      // РћР±РЅРѕРІР»СЏРµРј РёРјСЏ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ, РµСЃР»Рё РѕРЅРѕ РёР·РјРµРЅРёР»РѕСЃСЊ
      if (user.name !== decodedName) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: decodedName }
        });
      }
    }
    
    console.log('Google OAuth user:', user);
    return done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return done(err, null);
  }
}));

// === Facebook OAuth Strategy ===
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'FACEBOOK_APP_ID',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'FACEBOOK_APP_SECRET',
  callbackURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { facebookId: profile.id } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
          name: profile.displayName,
          facebookId: profile.id,
          emailVerified: true
        }
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

app.post('/api/products', authMiddleware, upload.array('images', 7), 
  dualStorageUploadMiddleware.processUploadedFiles.bind(dualStorageUploadMiddleware), 
  async (req, res) => {
  // РџСЂРѕРІРµСЂРєР° СЂРѕР»Рё admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    console.log('рџ“¦ РЎРѕР·РґР°РЅРёРµ РЅРѕРІРѕРіРѕ С‚РѕРІР°СЂР°...');
    console.log('рџ“Ґ РџРѕР»СѓС‡РµРЅРЅС‹Рµ РґР°РЅРЅС‹Рµ:', JSON.stringify(req.body, null, 2));
    console.log('рџ”Ќ РџСЂРѕРІРµСЂРєР° РїРѕР»РµР№ РїРµСЂРµРІРѕРґРѕРІ:');
    console.log('  - nameHe:', req.body.nameHe);
    console.log('  - descriptionHe:', req.body.descriptionHe);
    console.log('  - name:', req.body.name);
    console.log('  - description:', req.body.description);
    
    const { name, description, nameHe, descriptionHe, price, category, subcategory, ageGroup, gender, quantity, article, brand, country, length, width, height, isHidden, availableColors, inputLanguage = 'ru' } = req.body;
    
    // РџР°СЂСЃРёРј С†РІРµС‚Р° РµСЃР»Рё РѕРЅРё РїРµСЂРµРґР°РЅС‹
    let colorsData = null;
    if (availableColors) {
      try {
        colorsData = typeof availableColors === 'string' ? JSON.parse(availableColors) : availableColors;
        console.log('рџЋЁ Parsed availableColors (with indices):', colorsData);
      } catch (e) {
        console.error('вќЊ Error parsing availableColors:', e);
      }
    }
    
    // РСЃРїРѕР»СЊР·СѓРµРј URL РёР· Cloudinary РёР»Рё Р»РѕРєР°Р»СЊРЅС‹Рµ РїСѓС‚Рё
    const imageUrls = req.files ? req.files.map((file, index) => {
      if (req.imageUrls && req.imageUrls[index]) {
        // РСЃРїРѕР»СЊР·СѓРµРј URL РёР· Cloudinary
        return req.imageUrls[index];
      } else if (file.filename) {
        // Fallback РґР»СЏ Р»РѕРєР°Р»СЊРЅС‹С… С„Р°Р№Р»РѕРІ
        return `/uploads/${file.filename}`;
      } else {
        // Fallback РґР»СЏ production
        return `/uploads/${Date.now()}_${file.originalname}`;
      }
    }) : [];

    // РџСЂРµРѕР±СЂР°Р·СѓРµРј imageIndex РІ СЂРµР°Р»СЊРЅС‹Рµ imageUrl РїРѕСЃР»Рµ Р·Р°РіСЂСѓР·РєРё РёР·РѕР±СЂР°Р¶РµРЅРёР№
    if (colorsData && Array.isArray(colorsData) && imageUrls.length > 0) {
      colorsData = colorsData.map(colorData => {
        const imageIndex = colorData.imageIndex;
        if (imageIndex !== null && imageIndex !== undefined && imageUrls[imageIndex]) {
          return {
            colorId: colorData.colorId,
            imageUrl: imageUrls[imageIndex]
          };
        }
        return {
          colorId: colorData.colorId,
          imageUrl: null
        };
      });
      console.log('рџЋЁ Transformed availableColors (with URLs):', colorsData);
    }

    // РћС‚Р»Р°РґРѕС‡РЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ


    // РџРѕР»СѓС‡Р°РµРј РЅР°Р·РІР°РЅРёРµ РєР°С‚РµРіРѕСЂРёРё РїРѕ ID
    let categoryName = category;
    if (category && !isNaN(category)) {
      const categoryRecord = await prisma.category.findUnique({
        where: { id: parseInt(category) }
      });
      categoryName = categoryRecord ? categoryRecord.name : category;
    }

    // РџРѕР»СѓС‡Р°РµРј ID РїРѕРґРєР°С‚РµРіРѕСЂРёРё
    let subcategoryId = null;
    if (subcategory) {
      // Р•СЃР»Рё subcategory - СЌС‚Рѕ ID, РёСЃРїРѕР»СЊР·СѓРµРј РµРіРѕ РЅР°РїСЂСЏРјСѓСЋ
      if (!isNaN(subcategory)) {
        subcategoryId = parseInt(subcategory);
      } else {
        // Р•СЃР»Рё subcategory - СЌС‚Рѕ РЅР°Р·РІР°РЅРёРµ, РёС‰РµРј РїРѕ РЅР°Р·РІР°РЅРёСЋ
        const subcategoryRecord = await prisma.category.findFirst({
          where: { 
            name: subcategory,
            parentId: parseInt(category)
          }
        });
        subcategoryId = subcategoryRecord ? subcategoryRecord.id : null;
      }
    }

    // РЎРѕР·РґР°РµРј РґР°РЅРЅС‹Рµ С‚РѕРІР°СЂР° СЃ РїРѕРґРґРµСЂР¶РєРѕР№ СЂСѓС‡РЅС‹С… РїРµСЂРµРІРѕРґРѕРІ
    const productData = {
      name,
      description,
      nameHe: nameHe || null,
      descriptionHe: descriptionHe || null,
      price: parseFloat(price),
      categoryName: categoryName,
      categoryId: category && !isNaN(category) ? parseInt(category) : null,
      subcategoryId: subcategoryId,
      ageGroup,
      gender,
      imageUrls,
      quantity: quantity ? parseInt(quantity) : 0,
      article: article || null,
      brand: brand || null,
      country: country || null,
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      availableColors: colorsData || null,
      ...(isHidden !== undefined ? { isHidden: isHidden === 'true' || isHidden === true } : {})
    };

    const product = await prisma.product.create({
      data: productData
    });


    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/api/products', cacheMiddleware(300), smartInvalidateCache, async (req, res) => {
  try {
    const { category, categoryId, subcategoryId, admin } = req.query;
    
    let whereClause = {};
    
    if (category) {
      whereClause.categoryName = category;
    }
    
    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    }
    
    if (subcategoryId) {
      whereClause.subcategoryId = parseInt(subcategoryId);
    }
    
    // Р•СЃР»Рё Р·Р°РїСЂРѕСЃ РЅРµ РѕС‚ Р°РґРјРёРЅР°, СЃРєСЂС‹РІР°РµРј С‚РѕРІР°СЂС‹ СЃ isHidden = true
    if (admin !== 'true') {
      whereClause.isHidden = false;
    }
    
    const selectFields = {
      id: true,
      name: true,
      description: true,
      nameHe: true,
      descriptionHe: true,
      price: true,
      ageGroup: true,
      createdAt: true,
      updatedAt: true,
      imageUrls: true,
      quantity: true,
      article: true,
      brand: true,
      country: true,
      height: true,
      length: true,
      width: true,
      subcategoryId: true,
      isHidden: true,
      gender: true,
      categoryId: true,
      categoryName: true,
      availableColors: true,
      reviews: {
        where: { status: 'published' },
        select: { rating: true }
      },
      category: {
        select: { name: true }
      },
      subcategory: {
        select: { name: true }
      }
    };
    
    const products = await prisma.product.findMany({
      where: whereClause,
      select: selectFields,
      orderBy: { createdAt: 'desc' }
    });

    console.log('рџ”§ API /products - First product sample:', products[0] ? {
      id: products[0].id,
      name: products[0].name,
      hasNameHe: !!products[0].nameHe,
      nameHe: products[0].nameHe
    } : 'No products');

    // Р”РѕР±Р°РІР»СЏРµРј СЂР°СЃС‡РµС‚ СЂРµР№С‚РёРЅРіР° Рё РєРѕР»РёС‡РµСЃС‚РІР° РѕС‚Р·С‹РІРѕРІ РґР»СЏ РєР°Р¶РґРѕРіРѕ С‚РѕРІР°СЂР°
    const productsWithRating = products.map(product => {
      const reviews = product.reviews || [];
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      return {
        ...product,
        rating: Math.round(averageRating * 10) / 10, // РћРєСЂСѓРіР»СЏРµРј РґРѕ 1 Р·РЅР°РєР° РїРѕСЃР»Рµ Р·Р°РїСЏС‚РѕР№
        reviewCount: reviews.length
      };
    });

    res.json(productsWithRating);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// === Р’РћРџР РћРЎР« Рћ РўРћР’РђР РђРҐ ===

// РџРѕР»СѓС‡РёС‚СЊ РІРѕРїСЂРѕСЃС‹ РїРѕ С‚РѕРІР°СЂСѓ (С‚РѕР»СЊРєРѕ published)
app.get('/api/products/:id/questions', async (req, res) => {
  try {
    const questions = await prisma.productQuestion.findMany({
      where: { productId: parseInt(req.params.id), status: 'published' },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Р—Р°РґР°С‚СЊ РІРѕРїСЂРѕСЃ Рѕ С‚РѕРІР°СЂРµ
app.post('/api/products/:id/questions', authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;
    const productId = parseInt(req.params.id);
    const userId = req.user.userId;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Р’РѕРїСЂРѕСЃ РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    }

    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ С‚РѕРІР°СЂ СЃСѓС‰РµСЃС‚РІСѓРµС‚
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });
    }

    const productQuestion = await prisma.productQuestion.create({
      data: { 
        productId, 
        userId, 
        question: question.trim(), 
        status: 'pending' 
      },
      include: { user: { select: { id: true, name: true } } }
    });

    // РћС‚РїСЂР°РІР»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёРµ РІ Telegram
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const telegramMessage = `
вќ“ <b>РќРѕРІС‹Р№ РІРѕРїСЂРѕСЃ Рѕ С‚РѕРІР°СЂРµ</b>

рџ›ЌпёЏ <b>РўРѕРІР°СЂ:</b> ${product.name}${product.article ? `\nрџ“‹ <b>РђСЂС‚РёРєСѓР»:</b> ${product.article}` : ''}
рџ‘¤ <b>РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ:</b> ${user?.name || 'РќРµ СѓРєР°Р·Р°РЅРѕ'}
рџ“§ <b>Email:</b> ${user?.email || 'РќРµ СѓРєР°Р·Р°РЅРѕ'}
вќ“ <b>Р’РѕРїСЂРѕСЃ:</b> ${question.trim()}
рџ“… <b>Р”Р°С‚Р°:</b> ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' })}
      `.trim();
      console.log('рџљЂ About to send Telegram notification for product question');
      await sendTelegramNotification(telegramMessage);
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
    }

    res.status(201).json(productQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// РўРµСЃС‚РѕРІС‹Р№ endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё СЂР°Р±РѕС‚С‹ API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// РўРµСЃС‚РѕРІС‹Р№ endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё Р±Р°Р·С‹ РґР°РЅРЅС‹С…
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful');
    
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё С‚Р°Р±Р»РёС†Р° ProductQuestion
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ProductQuestion'
      );
    `;
    
    console.log('ProductQuestion table exists:', tableExists[0]?.exists);
    
    res.json({ 
      message: 'Database connection successful',
      productQuestionTableExists: tableExists[0]?.exists,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      error: 'Database test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// РўРµСЃС‚РѕРІС‹Р№ endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё
app.get('/api/test-auth', authMiddleware, async (req, res) => {
  try {
    console.log('Testing authentication...');
    console.log('User ID from token:', req.user.userId);
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    console.log('Found user:', user ? { id: user.id, role: user.role } : 'User not found');
    
    res.json({ 
      message: 'Authentication successful',
      user: user ? { id: user.id, role: user.role } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Authentication test failed:', error);
    res.status(500).json({ 
      error: 'Authentication test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// РџРѕР»СѓС‡РёС‚СЊ РІСЃРµ РІРѕРїСЂРѕСЃС‹ (РґР»СЏ Р°РґРјРёРЅР°, СЃ С„РёР»СЊС‚СЂР°С†РёРµР№ РїРѕ СЃС‚Р°С‚СѓСЃСѓ)
app.get('/api/admin/questions', authMiddleware, async (req, res) => {
  try {
    console.log('Admin questions endpoint: Starting request');
    console.log('User ID from token:', req.user.userId);
    
    // Р›РѕРіРёСЂСѓРµРј РїРµСЂРµРјРµРЅРЅС‹Рµ РѕРєСЂСѓР¶РµРЅРёСЏ (Р±РµР· СЃРµРєСЂРµС‚РЅС‹С… РґР°РЅРЅС‹С…)
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    // РџСЂРѕРІРµСЂСЏРµРј РїРѕРґРєР»СЋС‡РµРЅРёРµ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    console.log('Found user:', user ? { id: user.id, role: user.role } : 'User not found');
    
    if (!user || user.role !== 'admin') {
      console.log('Access denied: user is not admin');
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    console.log('User is admin, proceeding with query');
    const { status } = req.query;
    console.log('Filter status:', status);
    
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё С‚Р°Р±Р»РёС†Р° ProductQuestion
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ProductQuestion'
        );
      `;
      console.log('ProductQuestion table exists:', tableExists[0]?.exists);
    } catch (tableError) {
      console.error('Error checking table existence:', tableError);
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј РґРѕСЃС‚СѓРїРЅРѕСЃС‚СЊ РјРѕРґРµР»Рё ProductQuestion
    try {
      console.log('Checking if ProductQuestion model is available...');
      console.log('Prisma client methods:', Object.keys(prisma).filter(key => key.includes('Question')));
    } catch (modelError) {
      console.error('Error checking ProductQuestion model:', modelError);
    }
    
    const questions = await prisma.productQuestion.findMany({
      where: status ? { status } : {},
      include: { 
        product: { select: { id: true, name: true, imageUrls: true } }, 
        user: { select: { id: true, name: true, email: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${questions.length} questions`);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching all questions:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// РџРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ РІРѕРїСЂРѕСЃС‹ (РїСѓР±Р»РёС‡РЅС‹Р№ РґРѕСЃС‚СѓРї)
app.get('/api/questions', cacheMiddleware(300), smartInvalidateCache, async (req, res) => {
  try {
    const questions = await prisma.productQuestion.findMany({
      where: { status: 'published' },
      include: { 
        product: { select: { id: true, name: true, imageUrls: true } }, 
        user: { select: { id: true, name: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching public questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// РћС‚РІРµС‚РёС‚СЊ РЅР° РІРѕРїСЂРѕСЃ (РґР»СЏ Р°РґРјРёРЅР°)
app.put('/api/admin/questions/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const { answer, status } = req.body;
    
    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'РћС‚РІРµС‚ РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    }

    if (!['pending', 'published', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ СЃС‚Р°С‚СѓСЃ' });
    }

    const question = await prisma.productQuestion.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        answer: answer.trim(),
        status,
        updatedAt: new Date()
      },
      include: { 
        product: { select: { id: true, name: true } }, 
        user: { select: { id: true, name: true, email: true } } 
      }
    });

    // РЈРІРµРґРѕРјР»РµРЅРёСЏ РІ Telegram РѕС‚РєР»СЋС‡РµРЅС‹ - С‚РѕР»СЊРєРѕ РґР»СЏ РЅРѕРІС‹С… РІРѕРїСЂРѕСЃРѕРІ

    res.json(question);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

// РЈРґР°Р»РёС‚СЊ РІРѕРїСЂРѕСЃ (РґР»СЏ Р°РґРјРёРЅР°)
app.delete('/api/admin/questions/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const questionId = parseInt(req.params.id);
    
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё РІРѕРїСЂРѕСЃ
    const question = await prisma.productQuestion.findUnique({
      where: { id: questionId },
      include: { product: { select: { name: true } }, user: { select: { name: true } } }
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Р’РѕРїСЂРѕСЃ РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    // РЈРґР°Р»СЏРµРј РІРѕРїСЂРѕСЃ
    await prisma.productQuestion.delete({
      where: { id: questionId }
    });
    
    console.log(`Admin deleted question #${questionId} about product "${question.product?.name}" from user "${question.user?.name}"`);
    
    res.json({ message: 'Р’РѕРїСЂРѕСЃ СѓСЃРїРµС€РЅРѕ СѓРґР°Р»РµРЅ', id: questionId });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { admin } = req.query;
    
    let whereClause = { id: parseInt(req.params.id) };
    
    // Р•СЃР»Рё Р·Р°РїСЂРѕСЃ РЅРµ РѕС‚ Р°РґРјРёРЅР°, СЃРєСЂС‹РІР°РµРј С‚РѕРІР°СЂС‹ СЃ isHidden = true
    if (admin !== 'true') {
      whereClause.isHidden = false;
    }
    
    const selectFields = {
      id: true,
      name: true,
      description: true,
      nameHe: true,
      descriptionHe: true,
      price: true,
      ageGroup: true,
      createdAt: true,
      updatedAt: true,
      imageUrls: true,
      quantity: true,
      article: true,
      brand: true,
      country: true,
      height: true,
      length: true,
      width: true,
      subcategoryId: true,
      isHidden: true,
      gender: true,
      categoryId: true,
      categoryName: true,
      availableColors: true,
      reviews: {
        where: { status: 'published' },
        select: { rating: true }
      },
      category: {
        select: { id: true, name: true }
      },
      subcategory: {
        select: { id: true, name: true }
      }
    };
    
    const product = await prisma.product.findUnique({
      where: whereClause,
      select: selectFields
    });
    
    console.log('API: GET product data:', {
      id: product?.id,
      categoryId: product?.categoryId,
      category: product?.category,
      subcategoryId: product?.subcategoryId,
      subcategory: product?.subcategory
    });
    
    console.log('API: GET - Raw product from database:', product);
    
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓСЋС‚ Р»Рё СЃРІСЏР·Р°РЅРЅС‹Рµ Р·Р°РїРёСЃРё РґР»СЏ GET
    if (product?.categoryId) {
      const categoryCheck = await prisma.category.findUnique({
        where: { id: product.categoryId }
      });
      console.log('API: GET Category check result:', categoryCheck);
      
      if (!categoryCheck) {
        console.log('API: GET WARNING - Category with ID', product.categoryId, 'does not exist!');
      }
    }
    
    if (product?.subcategoryId) {
      const subcategoryCheck = await prisma.category.findUnique({
        where: { id: product.subcategoryId }
      });
      console.log('API: GET Subcategory check result:', subcategoryCheck);
      
      if (!subcategoryCheck) {
        console.log('API: GET WARNING - Subcategory with ID', product.subcategoryId, 'does not exist!');
      }
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓСЋС‚ Р»Рё СЃРІСЏР·Р°РЅРЅС‹Рµ Р·Р°РїРёСЃРё РґР»СЏ GET
    if (product?.categoryId) {
      const categoryCheck = await prisma.category.findUnique({
        where: { id: product.categoryId }
      });
      console.log('API: GET Category check result:', categoryCheck);
    }
    
    if (product?.subcategoryId) {
      const subcategoryCheck = await prisma.category.findUnique({
        where: { id: product.subcategoryId }
      });
      console.log('API: GET Subcategory check result:', subcategoryCheck);
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Р”РѕР±Р°РІР»СЏРµРј СЂР°СЃС‡РµС‚ СЂРµР№С‚РёРЅРіР° Рё РєРѕР»РёС‡РµСЃС‚РІР° РѕС‚Р·С‹РІРѕРІ
    const reviews = product.reviews || [];
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    const productWithRating = {
      ...product,
      rating: Math.round(averageRating * 10) / 10, // РћРєСЂСѓРіР»СЏРµРј РґРѕ 1 Р·РЅР°РєР° РїРѕСЃР»Рµ Р·Р°РїСЏС‚РѕР№
      reviewCount: reviews.length
    };
    
    res.json(productWithRating);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    console.log('DELETE /api/products/:id - Starting deletion process');
    
    // РџСЂРѕРІРµСЂСЏРµРј РїСЂР°РІР° Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      console.log('DELETE /api/products/:id - Access denied: user is not admin');
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }

    const productId = parseInt(req.params.id);
    console.log('DELETE /api/products/:id - Product ID:', productId);
    
    // РЎРЅР°С‡Р°Р»Р° РїСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё С‚РѕРІР°СЂ
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!existingProduct) {
      console.log('DELETE /api/products/:id - Product not found');
      return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });
    }

    console.log('DELETE /api/products/:id - Product found, starting deletion of related data');

    // РЈРґР°Р»СЏРµРј СЃРІСЏР·Р°РЅРЅС‹Рµ РґР°РЅРЅС‹Рµ (РѕС‚Р·С‹РІС‹, СЌР»РµРјРµРЅС‚С‹ РєРѕСЂР·РёРЅС‹, СЌР»РµРјРµРЅС‚С‹ Р·Р°РєР°Р·РѕРІ, РёР·Р±СЂР°РЅРЅРѕРµ)
    try {
      console.log('DELETE /api/products/:id - Deleting hidden reviews...');
      // РЎРЅР°С‡Р°Р»Р° СѓРґР°Р»СЏРµРј СЃРєСЂС‹С‚С‹Рµ РѕС‚Р·С‹РІС‹
      const reviews = await prisma.review.findMany({
        where: { productId: productId },
        select: { id: true }
      });
      
      if (reviews.length > 0) {
        const reviewIds = reviews.map(review => review.id);
        await prisma.hiddenReview.deleteMany({
          where: { reviewId: { in: reviewIds } }
        });
        console.log('DELETE /api/products/:id - Hidden reviews deleted successfully');
      }
      
      console.log('DELETE /api/products/:id - Deleting reviews...');
      await prisma.review.deleteMany({
        where: { productId: productId }
      });
      console.log('DELETE /api/products/:id - Reviews deleted successfully');
    } catch (reviewError) {
      console.error('DELETE /api/products/:id - Error deleting reviews:', reviewError);
    }

    try {
      console.log('DELETE /api/products/:id - Deleting cart items...');
      await prisma.cartItem.deleteMany({
        where: { productId: productId }
      });
      console.log('DELETE /api/products/:id - Cart items deleted successfully');
    } catch (cartError) {
      console.error('DELETE /api/products/:id - Error deleting cart items:', cartError);
    }

    try {
      console.log('DELETE /api/products/:id - Deleting order items...');
      await prisma.orderItem.deleteMany({
        where: { productId: productId }
      });
      console.log('DELETE /api/products/:id - Order items deleted successfully');
    } catch (orderError) {
      console.error('DELETE /api/products/:id - Error deleting order items:', orderError);
    }

    try {
      console.log('DELETE /api/products/:id - Deleting wishlist items...');
      await prisma.wishlistItem.deleteMany({
        where: { productId: productId }
      });
      console.log('DELETE /api/products/:id - Wishlist items deleted successfully');
    } catch (wishlistError) {
      console.error('DELETE /api/products/:id - Error deleting wishlist items:', wishlistError);
    }

    try {
      console.log('DELETE /api/products/:id - Deleting product questions...');
      await prisma.productQuestion.deleteMany({
        where: { productId: productId }
      });
      console.log('DELETE /api/products/:id - Product questions deleted successfully');
    } catch (questionError) {
      console.error('DELETE /api/products/:id - Error deleting product questions:', questionError);
    }

    // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё Р·Р°РєР°Р·С‹ СЃ СЌС‚РёРј С‚РѕРІР°СЂРѕРј Рё СѓРґР°Р»СЏРµРј СЃРєСЂС‹С‚С‹Рµ Р·Р°РєР°Р·С‹
    try {
      console.log('DELETE /api/products/:id - Checking for hidden orders...');
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: productId },
        select: { orderId: true }
      });
      
      if (orderItems.length > 0) {
        const orderIds = [...new Set(orderItems.map(item => item.orderId))];
        await prisma.userHiddenOrder.deleteMany({
          where: { orderId: { in: orderIds } }
        });
        console.log('DELETE /api/products/:id - Hidden orders deleted successfully');
      }
    } catch (hiddenOrderError) {
      console.error('DELETE /api/products/:id - Error deleting hidden orders:', hiddenOrderError);
    }

    // РўРµРїРµСЂСЊ СѓРґР°Р»СЏРµРј СЃР°Рј С‚РѕРІР°СЂ
    console.log('DELETE /api/products/:id - Deleting product...');
    const product = await prisma.product.delete({
      where: { id: productId }
    });
    console.log('DELETE /api/products/:id - Product deleted successfully');

    // РЈРґР°Р»СЏРµРј РёР·РѕР±СЂР°Р¶РµРЅРёСЏ СЃ РґРёСЃРєР°
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      console.log('DELETE /api/products/:id - Deleting image files...');
      product.imageUrls.forEach(imageUrl => {
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          const imagePath = path.join(__dirname, '..', imageUrl);
          if (fs.existsSync(imagePath)) {
            try {
              fs.unlinkSync(imagePath);
              console.log('DELETE /api/products/:id - Image file deleted:', imagePath);
            } catch (fsError) {
              console.error('DELETE /api/products/:id - Error deleting image file:', fsError);
            }
          }
        }
      });
    }

    console.log('DELETE /api/products/:id - Deletion completed successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/products/:id - Error deleting product:', error);
    console.error('DELETE /api/products/:id - Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// === Р РµРіРёСЃС‚СЂР°С†РёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ===
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, language: frontendLanguage } = req.body;
    const acceptLanguage = req.headers['accept-language'] || '';
    const language = frontendLanguage || (acceptLanguage.includes('ru') ? 'ru' : 'he');
    
    console.log('рџЊђ Language detection:', {
      frontendLanguage,
      acceptLanguage,
      detectedLanguage: language,
      headers: req.headers['accept-language']
    });

    if (!email || !password) return res.status(400).json({ error: 'Email Рё РїР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚' });
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log(`РЎРѕР·РґР°РµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ: ${email}, name: ${name}, language: ${language}`);
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        name, 
        verificationToken,
        emailVerified: false // РЇРІРЅРѕ СѓРєР°Р·С‹РІР°РµРј false
      }
    });
    console.log(`РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃРѕР·РґР°РЅ СЃ ID: ${user.id}, emailVerified: ${user.emailVerified}`);

    // РћС‚РїСЂР°РІРєР° РїРёСЃСЊРјР° СЃ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј С‡РµСЂРµР· Brevo
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirm-email?token=${verificationToken}`;
    const template = emailTemplates.registrationConfirmation[language];
    
    console.log('рџ“§ Email template selection:', {
      language,
      templateExists: !!template,
      templateSubject: template?.subject,
      templateHtmlLength: template?.html?.length
    });
    
    const emailSubject = typeof template.subject === 'function' ? template.subject(name) : template.subject;
    const emailHtml = template.html(name || email, confirmUrl);
    
    console.log(`РћС‚РїСЂР°РІР»СЏРµРј email РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РЅР°: ${email} (СЏР·С‹Рє: ${language})`);
    console.log('рџ“§ Email subject:', emailSubject);
    console.log('DEBUG: Email confirmation link for ' + email + ': ' + confirmUrl);
    
    // Р’СЂРµРјРµРЅРЅРѕ РѕС‚РєР»СЋС‡Р°РµРј РѕС‚РїСЂР°РІРєСѓ email РёР·-Р·Р° РїСЂРѕР±Р»РµРј СЃ Brevo API
    try {
      await sendEmail(email, emailSubject, emailHtml, language);
      console.log('Email РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РѕС‚РїСЂР°РІР»РµРЅ СѓСЃРїРµС€РЅРѕ');
    } catch (emailError) {
      console.log('вљ пёЏ Email РЅРµ РѕС‚РїСЂР°РІР»РµРЅ РёР·-Р·Р° РѕС€РёР±РєРё API, РЅРѕ СЃСЃС‹Р»РєР° РґР»СЏ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РґРѕСЃС‚СѓРїРЅР° РІ Р»РѕРіР°С…');
      console.log('DEBUG: Email confirmation link for ' + email + ': ' + confirmUrl);
    }
    
    const successMessage = language === 'ru' 
      ? 'Р РµРіРёСЃС‚СЂР°С†РёСЏ СѓСЃРїРµС€РЅР°! РџРёСЃСЊРјРѕ СЃ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј РѕС‚РїСЂР°РІР»РµРЅРѕ РЅР° email. РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РїРѕРґС‚РІРµСЂРґРёС‚Рµ email РїРµСЂРµРґ РІС…РѕРґРѕРј РІ СЃРёСЃС‚РµРјСѓ.'
      : 'Ч”ЧЁЧ©ЧћЧ” Ч”Ч•Ч©ЧњЧћЧ” Ч‘Ч”Ч¦ЧњЧ—Ч”! Ч Ч©ЧњЧ— ЧњЧљ ЧђЧ™ЧћЧ™Ч™Чњ ЧњЧђЧ™Ч©Ч•ЧЁ. ЧђЧ Чђ ЧђЧ©ЧЁ ЧђЧЄ Ч›ЧЄЧ•Ч‘ЧЄ Ч”ЧђЧ™ЧћЧ™Ч™Чњ ЧњЧ¤Ч Ч™ Ч”Ч”ЧЄЧ—Ч‘ЧЁЧ•ЧЄ.';
    
    res.json({ 
      message: successMessage,
      requiresEmailVerification: true,
      user: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЂРµРіРёСЃС‚СЂР°С†РёРё' });
  }
});

// === РџРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ email ===
app.get('/api/auth/confirm', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'РќРµС‚ С‚РѕРєРµРЅР°' });
    
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      // Р•СЃР»Рё С‚РѕРєРµРЅ РЅРµ РЅР°Р№РґРµРЅ, РІРѕР·РјРѕР¶РЅРѕ email СѓР¶Рµ РїРѕРґС‚РІРµСЂР¶РґРµРЅ
      // Р’РѕР·РІСЂР°С‰Р°РµРј СѓСЃРїРµС… РІРјРµСЃС‚Рѕ РѕС€РёР±РєРё РґР»СЏ Р»СѓС‡С€РµРіРѕ UX
      return res.json({ message: 'Email СѓР¶Рµ РїРѕРґС‚РІРµСЂР¶РґС‘РЅ!' });
    }
    
    // РћР±РЅРѕРІР»СЏРµРј СЃС‚Р°С‚СѓСЃ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    });
    
    // Р“РµРЅРµСЂРёСЂСѓРµРј JWT С‚РѕРєРµРЅ РґР»СЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРіРѕ РІС…РѕРґР°
    const jwtToken = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    // Р’РѕР·РІСЂР°С‰Р°РµРј РґР°РЅРЅС‹Рµ РґР»СЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРіРѕ РІС…РѕРґР°
    res.json({ 
      message: 'Email РїРѕРґС‚РІРµСЂР¶РґС‘РЅ!',
      token: jwtToken,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Email confirm error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ email' });
  }
});

// === Р›РѕРіРёРЅ ===
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(`РџРѕРїС‹С‚РєР° РІС…РѕРґР° РґР»СЏ email: ${email}, РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅР°Р№РґРµРЅ: ${!!user}, emailVerified: ${user?.emailVerified}`);
    
    if (!user) {
      return res.status(400).json({ error: 'РќРµРІРµСЂРЅС‹Р№ email РёР»Рё РїР°СЂРѕР»СЊ' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РїРѕРґС‚РІРµСЂРґРёР» email
    if (!user.emailVerified) {
      return res.status(400).json({ 
        error: 'Email РЅРµ РїРѕРґС‚РІРµСЂР¶РґС‘РЅ. РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РїСЂРѕРІРµСЂСЊС‚Рµ РІР°С€Сѓ РїРѕС‡С‚Сѓ Рё РїРѕРґС‚РІРµСЂРґРёС‚Рµ email РїРµСЂРµРґ РІС…РѕРґРѕРј РІ СЃРёСЃС‚РµРјСѓ.',
        requiresEmailVerification: true 
      });
    }
    
    // Р•СЃР»Рё Сѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РµСЃС‚СЊ Google ID (Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ С‡РµСЂРµР· Google), РЅРѕ РЅРµС‚ РїР°СЂРѕР»СЏ
    if (user.googleId && !user.passwordHash) {
      return res.status(400).json({ 
        error: 'Р­С‚РѕС‚ Р°РєРєР°СѓРЅС‚ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ С‡РµСЂРµР· Google. РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РёСЃРїРѕР»СЊР·СѓР№С‚Рµ РєРЅРѕРїРєСѓ "Р’РѕР№С‚Рё С‡РµСЂРµР· Google" РґР»СЏ РІС…РѕРґР°.',
        requiresGoogleAuth: true 
      });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј РЅР°Р»РёС‡РёРµ РїР°СЂРѕР»СЏ
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'РќРµРІРµСЂРЅС‹Р№ email РёР»Рё РїР°СЂРѕР»СЊ' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј РїР°СЂРѕР»СЊ
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'РќРµРІРµСЂРЅС‹Р№ email РёР»Рё РїР°СЂРѕР»СЊ' });
    }
    
    // Р“РµРЅРµСЂРёСЂСѓРµРј JWT
    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    const responseData = { 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    };
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РІС…РѕРґР°' });
  }
});

// === Google OAuth Routes ===
app.get('/api/auth/google', (req, res, next) => {
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/api/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  try {
    console.log('Google OAuth callback, user:', req.user);
    
    // РЈР±РµР¶РґР°РµРјСЃСЏ, С‡С‚Рѕ РёРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїСЂР°РІРёР»СЊРЅРѕ РґРµРєРѕРґРёСЂРѕРІР°РЅРѕ
    const userName = decodeUserName(req.user.name);
    console.log('Final user name for JWT:', userName);
    
    // Р“РµРЅРµСЂРёСЂСѓРµРј JWT
    const token = jwt.sign({ 
      userId: req.user.id, 
      email: req.user.email, 
      name: userName, 
      role: req.user.role 
    }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    // Р РµРґРёСЂРµРєС‚ РЅР° С„СЂРѕРЅС‚ СЃ С‚РѕРєРµРЅРѕРј
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-error?error=authentication_failed`);
  }
});

// === Facebook OAuth Routes ===
app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/api/auth/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
  const token = jwt.sign({ userId: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?token=${token}`);
});

// Middleware РґР»СЏ РїСЂРѕРІРµСЂРєРё JWT
function authMiddleware(req, res, next) {
  console.log('\nрџ”ђ Auth middleware: Starting authentication check');
  console.log('рџ”Ќ Request URL:', req.url);
  console.log('рџ”Ќ Request method:', req.method);
  
  const auth = req.headers.authorization;
  console.log('рџ”‘ Authorization header:', auth ? 'Present' : 'Missing');
  console.log('рџ”‘ Authorization value:', auth ? auth.substring(0, 20) + '...' : 'None');
  
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('вќЊ Auth middleware: No valid Bearer token');
    return res.status(401).json({ error: 'РќРµС‚ С‚РѕРєРµРЅР°' });
  }
  
  const token = auth.slice(7);
  console.log('рџЋ« Token extracted, length:', token.length);
  console.log('рџЋ« Token preview:', token.substring(0, 20) + '...');
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('вњ… Token verified successfully');
    console.log('рџ‘¤ User ID:', payload.userId);
    console.log('рџ‘¤ User email:', payload.email);
    console.log('рџ‘¤ User role:', payload.role);
    req.user = payload;
    next();
  } catch (error) {
    console.error('вќЊ Token verification failed:', error.message);
    console.error('вќЊ Error details:', error);
    return res.status(401).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ С‚РѕРєРµРЅ' });
  }
}

// РСЃС‚РѕСЂРёСЏ Р·Р°РєР°Р·РѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
app.get('/api/profile/orders', authMiddleware, async (req, res) => {
  try {
    // РџРѕР»СѓС‡Р°РµРј СЃРєСЂС‹С‚С‹Рµ Р·Р°РєР°Р·С‹ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    const hiddenOrders = await prisma.userHiddenOrder.findMany({
      where: { userId: req.user.userId },
      select: { orderId: true }
    });
    
    const hiddenOrderIds = hiddenOrders.map(ho => ho.orderId);
    
    const orders = await prisma.order.findMany({
      where: { 
        userId: req.user.userId,
        id: { notIn: hiddenOrderIds }
      },
      include: {
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Р”РѕР±Р°РІР»СЏРµРј СЂР°СЃС‡РµС‚ СЃСѓРјРјС‹ РґР»СЏ РєР°Р¶РґРѕРіРѕ Р·Р°РєР°Р·Р°
    const ordersWithTotal = orders.map(order => ({
      ...order,
      total: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));
    
    res.json(ordersWithTotal);
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°РєР°Р·РѕРІ' });
  }
});

// РўРµРєСѓС‰Р°СЏ РєРѕСЂР·РёРЅР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
app.get('/api/profile/cart', authMiddleware, async (req, res) => {
  try {
    // РЎРЅР°С‡Р°Р»Р° РїСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      console.error('РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ РїСЂРё РїРѕРїС‹С‚РєРµ РїРѕР»СѓС‡РёС‚СЊ РєРѕСЂР·РёРЅСѓ:', req.user.userId);
      return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });
    
    if (!cart) {
      try {
        console.log(`РЎРѕР·РґР°РµРј РєРѕСЂР·РёРЅСѓ РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ID: ${req.user.userId}`);
        await prisma.cart.create({ data: { userId: req.user.userId } });
        cart = await prisma.cart.findUnique({
          where: { userId: req.user.userId },
          include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
        });
        console.log(`РљРѕСЂР·РёРЅР° СЃРѕР·РґР°РЅР° СѓСЃРїРµС€РЅРѕ, ID: ${cart?.id}`);
  
      } catch (e) {
        console.error('РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ РєРѕСЂР·РёРЅС‹:', e);
        return res.json({ items: [] });
      }
    }
    
    if (!cart) {
      console.log('РљРѕСЂР·РёРЅР° РЅРµ РЅР°Р№РґРµРЅР° РїРѕСЃР»Рµ РїРѕРїС‹С‚РєРё СЃРѕР·РґР°РЅРёСЏ');
      return res.json({ items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєРѕСЂР·РёРЅС‹' });
  }
});

// === Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїСЂРѕС„РёР»СЏ ===
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, surname, email, phone } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
    
    let updateData = { 
      name: name || user.name,
      surname: surname || user.surname,
      phone: phone || user.phone,
    };
    
    if (email && email !== user.email) {
      // Р•СЃР»Рё email РјРµРЅСЏРµС‚СЃСЏ вЂ” РїСЂРѕСЃС‚Рѕ РѕР±РЅРѕРІР»СЏРµРј Р±РµР· РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ
      updateData.email = email;
    }
    
    const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });
    res.json({ 
      user: { 
        id: updated.id, 
        email: updated.email, 
        name: updated.name, 
        surname: updated.surname,
        phone: updated.phone,
        emailVerified: updated.emailVerified,
        googleId: updated.googleId,
        facebookId: updated.facebookId,
        hasPassword: !!updated.passwordHash
      } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ РїСЂРѕС„РёР»СЏ' });
  }
});

// === РЈРґР°Р»РµРЅРёРµ РїСЂРѕС„РёР»СЏ ===
app.delete('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
    
    // РЈРґР°Р»СЏРµРј РІСЃРµ СЃРІСЏР·Р°РЅРЅС‹Рµ РґР°РЅРЅС‹Рµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    await prisma.$transaction([
      // РЈРґР°Р»СЏРµРј РєРѕСЂР·РёРЅСѓ
      prisma.cart.deleteMany({ where: { userId: user.id } }),
      // РЈРґР°Р»СЏРµРј Р·Р°РєР°Р·С‹
      prisma.order.deleteMany({ where: { userId: user.id } }),
      // РЈРґР°Р»СЏРµРј РѕС‚Р·С‹РІС‹
      prisma.review.deleteMany({ where: { userId: user.id } }),
      // РЈРґР°Р»СЏРµРј РёР·Р±СЂР°РЅРЅРѕРµ
      prisma.wishlist.deleteMany({ where: { userId: user.id } }),
      // РЈРґР°Р»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёСЏ
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      // РЈРґР°Р»СЏРµРј СЃР°РјРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      prisma.user.delete({ where: { id: user.id } })
    ]);
    
    res.json({ message: 'РџСЂРѕС„РёР»СЊ СѓСЃРїРµС€РЅРѕ СѓРґР°Р»РµРЅ' });
  } catch (error) {
    console.error('Profile deletion error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РїСЂРѕС„РёР»СЏ' });
  }
});

// === Р’РѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ РїР°СЂРѕР»СЏ: Р·Р°РїСЂРѕСЃ ===
app.post('/api/auth/forgot', async (req, res) => {
  try {
    const { email, language: frontendLanguage } = req.body;
    
    const acceptLanguage = req.headers['accept-language'] || '';
    const language = frontendLanguage || (acceptLanguage.includes('ru') ? 'ru' : 'he');
    
    console.log('рџ”ђ Password reset request for:', email);
    console.log('рџЊђ Language detection:', { frontendLanguage, acceptLanguage, finalLanguage: language });
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'Р•СЃР»Рё email Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ, РїРёСЃСЊРјРѕ РѕС‚РїСЂР°РІР»РµРЅРѕ' });
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: resetToken } });
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('рџ”— Reset URL generated:', resetUrl);
    
    const template = emailTemplates.passwordReset[language];
    console.log('рџ“§ Email template selection:', { 
      language, 
      hasTemplate: !!template,
      hasSubject: !!template?.subject,
      hasHtmlFunction: typeof template?.html === 'function'
    });
    
    if (!template || !template.html) {
      console.error('вќЊ Email template not found for language:', language);
      throw new Error(`Email template not found for language: ${language}`);
    }
    
    const emailSubject = typeof template.subject === 'function' ? template.subject(user.name) : template.subject;
    const emailHtml = template.html(user.name || email, resetUrl);
    console.log('рџ“ќ Email HTML generated, length:', emailHtml?.length || 0);
    console.log('рџ“§ Email subject:', emailSubject);
    
    if (!emailHtml || emailHtml.length < 100) {
      console.error('вќЊ Email HTML is empty or too short!');
      throw new Error('Failed to generate email HTML');
    }
    
    console.log('рџ“¤ Attempting to send email to:', email);
    const emailSent = await sendEmail(email, emailSubject, emailHtml, language);
    
    if (emailSent) {
      console.log('вњ… Password reset email sent successfully to:', email);
    } else {
      console.warn('вљ пёЏ Email sending returned false, but no error thrown');
    }
    
    res.json({ message: language === 'ru' ? 'Р•СЃР»Рё email Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ, РїРёСЃСЊРјРѕ РѕС‚РїСЂР°РІР»РµРЅРѕ' : 'ЧђЧќ Ч”ЧђЧ™ЧћЧ™Ч™Чњ ЧЁЧ©Ч•Чќ Ч‘ЧћЧўЧЁЧ›ЧЄ, Ч Ч©ЧњЧ— ЧњЧљ ЧђЧ™ЧћЧ™Ч™Чњ ЧњЧ©Ч—Ч–Ч•ЧЁ Ч”ЧЎЧ™ЧЎЧћЧ”' });
  } catch (error) {
    console.error('вќЊ Forgot password error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'РћС€РёР±РєР° РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ РїР°СЂРѕР»СЏ' });
  }
});
// === Р’РѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ РїР°СЂРѕР»СЏ: СЃР±СЂРѕСЃ ===
app.post('/api/auth/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'РќРµС‚ С‚РѕРєРµРЅР° РёР»Рё РїР°СЂРѕР»СЏ' });
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ С‚РѕРєРµРЅ' });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, verificationToken: null } });
    res.json({ message: 'РџР°СЂРѕР»СЊ СѓСЃРїРµС€РЅРѕ СЃР±СЂРѕС€РµРЅ' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃР±СЂРѕСЃР° РїР°СЂРѕР»СЏ' });
  }
});

// === РџСЂРѕС„РёР»СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ (РёРјСЏ, С„Р°РјРёР»РёСЏ, email, СЂРѕР»СЊ, С‚РµР»РµС„РѕРЅ, РґР°С‚Р° СЂРµРіРёСЃС‚СЂР°С†РёРё) ===
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        surname: user.surname,
        phone: user.phone,
        createdAt: user.createdAt,
        role: user.role,
        googleId: user.googleId,
        facebookId: user.facebookId,
        hasPassword: !!user.passwordHash
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РїСЂРѕС„РёР»СЏ' });
  }
});

// === Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ РІ РєРѕСЂР·РёРЅСѓ ===
app.post('/api/profile/cart/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1, selectedColor = null } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    
    // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      console.error('РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ РїСЂРё РїРѕРїС‹С‚РєРµ РґРѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ РІ РєРѕСЂР·РёРЅСѓ:', req.user.userId);
      return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) {
      console.log(`РЎРѕР·РґР°РµРј РєРѕСЂР·РёРЅСѓ РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ID: ${req.user.userId}`);
      cart = await prisma.cart.create({ data: { userId: req.user.userId } });
      console.log(`РљРѕСЂР·РёРЅР° СЃРѕР·РґР°РЅР°, ID: ${cart.id}`);
    }
    // РС‰РµРј С‚РѕРІР°СЂ СЃ СѓС‡РµС‚РѕРј С†РІРµС‚Р° (РѕРґРёРЅ С‚РѕРІР°СЂ СЂР°Р·РЅС‹С… С†РІРµС‚РѕРІ - СЂР°Р·РЅС‹Рµ РїРѕР·РёС†РёРё РІ РєРѕСЂР·РёРЅРµ)
    const whereClause = { cartId: cart.id, productId };
    if (selectedColor) {
      whereClause.selectedColor = selectedColor;
    }
    let cartItem = await prisma.cartItem.findFirst({ where: whereClause });
    if (cartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + quantity }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, selectedColor }
      });
    }
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });
    res.json(updatedCart);
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РґРѕР±Р°РІР»РµРЅРёСЏ РІ РєРѕСЂР·РёРЅСѓ' });
  }
});

// === РЈРґР°Р»РёС‚СЊ С‚РѕРІР°СЂ РёР· РєРѕСЂР·РёРЅС‹ ===
app.post('/api/profile/cart/remove', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) return res.status(404).json({ error: 'РљРѕСЂР·РёРЅР° РЅРµ РЅР°Р№РґРµРЅР°' });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });
    res.json(updatedCart);
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РёР· РєРѕСЂР·РёРЅС‹' });
  }
});

// === РР·РјРµРЅРёС‚СЊ РєРѕР»РёС‡РµСЃС‚РІРѕ С‚РѕРІР°СЂР° РІ РєРѕСЂР·РёРЅРµ ===
app.post('/api/profile/cart/update', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity < 1) return res.status(400).json({ error: 'productId Рё quantity >= 1 РѕР±СЏР·Р°С‚РµР»СЊРЅС‹' });
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) return res.status(404).json({ error: 'РљРѕСЂР·РёРЅР° РЅРµ РЅР°Р№РґРµРЅР°' });
    let cartItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
    if (!cartItem) return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ РІ РєРѕСЂР·РёРЅРµ' });
    cartItem = await prisma.cartItem.update({ where: { id: cartItem.id }, data: { quantity } });
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РёР·РјРµРЅРµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР°' });
  }
});

// === РћС„РѕСЂРјР»РµРЅРёРµ Р·Р°РєР°Р·Р° (checkout) ===
app.post('/api/profile/checkout', authMiddleware, async (req, res) => {
  try {
    // РћРїСЂРµРґРµР»СЏРµРј СЏР·С‹Рє РґР»СЏ email С‚Р°Рє Р¶Рµ, РєР°Рє РІ СЂРµРіРёСЃС‚СЂР°С†РёРё
    const { language: frontendLanguage } = req.body;
    const acceptLanguage = req.headers['accept-language'] || '';
    const language = frontendLanguage || (acceptLanguage.includes('ru') ? 'ru' : 'he');
    
    const { customerInfo, pickupStore, paymentMethod, total, cartItems } = req.body;
    
    // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё cartItems РІ Р·Р°РїСЂРѕСЃРµ
    if (cartItems && cartItems.length > 0) {
      console.log('рџ“¦ Using cartItems from request:', cartItems);
      
      // РџСЂРѕРІРµСЂСЏРµРј РЅР°Р»РёС‡РёРµ С‚РѕРІР°СЂР° РЅР° СЃРєР»Р°РґРµ
      for (const item of cartItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        if (!product) {
          return res.status(400).json({ error: `РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ: ID ${item.productId}` });
        }
        
        if (item.quantity > product.quantity) {
          return res.status(400).json({ error: `РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ С‚РѕРІР°СЂР°: ${product.name}` });
        }
      }
      
      // РћР±РЅРѕРІР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ РїРѕР»СЊР·РѕРІР°С‚РµР»Рµ, РµСЃР»Рё РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅР°
      if (customerInfo) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: {
            name: customerInfo.firstName,
            surname: customerInfo.lastName,
            phone: customerInfo.phone
          }
        });
      }
      
      // РЎРѕР·РґР°С‘Рј Р·Р°РєР°Р· СЃ cartItems РёР· Р·Р°РїСЂРѕСЃР°
      const order = await prisma.order.create({
        data: {
          userId: req.user.userId,
          status: 'pending',
          pickupStore,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              selectedColor: item.selectedColor || null
            }))
          }
        },
        include: { 
          items: { include: { product: true } },
          user: true 
        }
      });
      
      // РЈРјРµРЅСЊС€Р°РµРј РєРѕР»РёС‡РµСЃС‚РІРѕ РЅР° СЃРєР»Р°РґРµ
      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }
      
      // РћС‡РёС‰Р°РµРј РєРѕСЂР·РёРЅСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const cart = await prisma.cart.findUnique({
        where: { userId: req.user.userId },
        include: { items: true }
      });
      
      if (cart) {
        console.log(`РћС‡РёС‰Р°РµРј РєРѕСЂР·РёРЅСѓ ID: ${cart.id}`);
        
        // РЎРЅР°С‡Р°Р»Р° СѓРґР°Р»СЏРµРј РІСЃРµ СЌР»РµРјРµРЅС‚С‹ РєРѕСЂР·РёРЅС‹
        const deletedItems = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        console.log(`РЈРґР°Р»РµРЅРѕ ${deletedItems.count} СЌР»РµРјРµРЅС‚РѕРІ РєРѕСЂР·РёРЅС‹ РґР»СЏ РєРѕСЂР·РёРЅС‹ ID: ${cart.id}`);
        
        // РЈРґР°Р»СЏРµРј СЃР°РјСѓ РєРѕСЂР·РёРЅСѓ
        await prisma.cart.delete({ where: { id: cart.id } });
        console.log(`РЈРґР°Р»РµРЅР° РєРѕСЂР·РёРЅР° ID: ${cart.id}`);
      }
      
      // Р’С‹С‡РёСЃР»СЏРµРј РѕР±С‰СѓСЋ СЃСѓРјРјСѓ Р·Р°РєР°Р·Р°
        const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
      // РћС‚РїСЂР°РІР»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёСЏ
      try {
        const telegramMessage = `
рџ›’ <b>РќРѕРІС‹Р№ Р·Р°РєР°Р· #${order.id}</b>

рџ‘¤ <b>РљР»РёРµРЅС‚:</b> ${(order.user.name || order.user.surname || '').trim() || 'РќРµ СѓРєР°Р·Р°РЅРѕ'}
рџ“§ <b>Email:</b> ${order.user.email || 'РќРµ СѓРєР°Р·Р°РЅРѕ'}
рџ“± <b>РўРµР»РµС„РѕРЅ:</b> ${order.user.phone || 'РќРµ СѓРєР°Р·Р°РЅРѕ'}
рџЏ¬ <b>РЎР°РјРѕРІС‹РІРѕР· РёР·:</b> ${getStoreInfo(pickupStore).name} (${getStoreInfo(pickupStore).address})
рџ’і <b>РћРїР»Р°С‚Р°:</b> ${paymentMethod === 'card' ? 'РљР°СЂС‚Р°' : 'РќР°Р»РёС‡РЅС‹РјРё РёР»Рё РєР°СЂС‚РѕР№'}

  рџ“¦ <b>РўРѕРІР°СЂС‹:</b>
${order.items.map(item => {
  const productName = item.product.nameHe || item.product.name;
  let itemText = `вЂў ${productName} x${item.quantity} - в‚Є${item.price * item.quantity}`;
  if (item.product.article) {
    itemText += `\n  рџ“‹ РђСЂС‚РёРєСѓР»: ${item.product.article}`;
  }
  if (item.selectedColor) {
    const colorInfo = COLOR_PALETTE.find(c => c.id === item.selectedColor);
    if (colorInfo) {
      itemText += `\n  рџЋЁ Р¦РІРµС‚: ${colorInfo.nameRu}`;
    }
  }
  return itemText;
}).join('\n')}

рџ’° <b>РС‚РѕРіРѕ:</b> в‚Є${totalAmount}
рџ“… <b>Р”Р°С‚Р°:</b> ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' })}
        `.trim();
        await sendTelegramNotification(telegramMessage);
      } catch (telegramError) {
        console.error('РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё РІ Telegram:', telegramError);
      }
      
      // РћС‚РїСЂР°РІР»СЏРµРј email СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С€Р°Р±Р»РѕРЅР°
      try {
        // РџРѕРґРіРѕС‚Р°РІР»РёРІР°РµРј РґР°РЅРЅС‹Рµ РґР»СЏ email СЃ РёРЅС„РѕСЂРјР°С†РёРµР№ Рѕ С†РІРµС‚Р°С…
        const orderData = {
          orderId: order.id,
          customerName: order.user.name || order.user.surname || (language === 'he' ? 'ЧњЧ§Ч•Ч—' : 'РєР»РёРµРЅС‚'),
          storeName: getStoreInfo(pickupStore).name,
          storeAddress: getStoreInfo(pickupStore).address,
          paymentMethod: paymentMethod,
          total: totalAmount,
          items: order.items.map(item => {
            const itemData = {
              productName: language === 'he' ? (item.product.nameHe || item.product.name) : item.product.name,
              quantity: item.quantity,
              price: item.price
            };
            
            // Р”РѕР±Р°РІР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ С†РІРµС‚Рµ РµСЃР»Рё РµСЃС‚СЊ
            if (item.selectedColor) {
              const colorInfo = COLOR_PALETTE.find(c => c.id === item.selectedColor);
              if (colorInfo) {
                itemData.colorNameHe = colorInfo.nameHe;
                itemData.colorNameRu = colorInfo.nameRu;
              }
            }
            
            return itemData;
          })
        };
        
        const template = emailTemplates.orderConfirmation[language];
        const emailSubject = template.subject(orderData);
        const emailHtml = template.html(orderData);
        
        await sendEmail(order.user.email, emailSubject, emailHtml);
      } catch (emailError) {
        console.error('РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё email:', emailError);
      }
      
      res.json({ 
        success: true, 
        order,
        message: 'Р—Р°РєР°Р· СѓСЃРїРµС€РЅРѕ СЃРѕР·РґР°РЅ'
      });
      
    } else {
      // Fallback: РїРѕР»СѓС‡Р°РµРј РєРѕСЂР·РёРЅСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РёР· Р±Р°Р·С‹ РґР°РЅРЅС‹С…
      console.log('рџ“¦ Using cart from database');
      
      const cart = await prisma.cart.findUnique({
        where: { userId: req.user.userId },
        include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
      });
      
      if (!cart || !cart.items.length) {
        return res.status(400).json({ error: 'РљРѕСЂР·РёРЅР° РїСѓСЃС‚Р°' });
      }
    
    
    
    // РџСЂРѕРІРµСЂСЏРµРј РЅР°Р»РёС‡РёРµ С‚РѕРІР°СЂР° РЅР° СЃРєР»Р°РґРµ
    for (const item of cart.items) {
      
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({ error: `РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ С‚РѕРІР°СЂР°: ${item.product.name}` });
      }
    }
    
    // РћР±РЅРѕРІР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ РїРѕР»СЊР·РѕРІР°С‚РµР»Рµ, РµСЃР»Рё РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅР°
    if (customerInfo) {

      await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          name: customerInfo.firstName,
          surname: customerInfo.lastName,
          phone: customerInfo.phone
        }
      });
    }
    
    // РЎРѕР·РґР°С‘Рј Р·Р°РєР°Р·
    
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        status: 'pending',
        pickupStore,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            selectedColor: item.selectedColor || null
          }))
        }
      },
      include: { 
        items: { include: { product: true } },
        user: true 
      }
    });
    
    
    // РЈРјРµРЅСЊС€Р°РµРј РєРѕР»РёС‡РµСЃС‚РІРѕ РЅР° СЃРєР»Р°РґРµ
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });
    }
    
    // РћС‡РёС‰Р°РµРј РєРѕСЂР·РёРЅСѓ
    try {
      console.log(`РћС‡РёС‰Р°РµРј РєРѕСЂР·РёРЅСѓ ID: ${cart.id}`);
      
      // РЎРЅР°С‡Р°Р»Р° СѓРґР°Р»СЏРµРј РІСЃРµ СЌР»РµРјРµРЅС‚С‹ РєРѕСЂР·РёРЅС‹
      const deletedItems = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      console.log(`РЈРґР°Р»РµРЅРѕ ${deletedItems.count} СЌР»РµРјРµРЅС‚РѕРІ РєРѕСЂР·РёРЅС‹ РґР»СЏ РєРѕСЂР·РёРЅС‹ ID: ${cart.id}`);
      
      // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РІСЃРµ СЌР»РµРјРµРЅС‚С‹ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ СѓРґР°Р»РµРЅС‹
      const remainingItems = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
      if (remainingItems.length > 0) {
        console.log(`РџСЂРµРґСѓРїСЂРµР¶РґРµРЅРёРµ: РѕСЃС‚Р°Р»РѕСЃСЊ ${remainingItems.length} СЌР»РµРјРµРЅС‚РѕРІ РІ РєРѕСЂР·РёРЅРµ`);
        // РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ СѓРґР°Р»СЏРµРј РѕСЃС‚Р°РІС€РёРµСЃСЏ СЌР»РµРјРµРЅС‚С‹
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
      
      // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё РєРѕСЂР·РёРЅР° РїРµСЂРµРґ СѓРґР°Р»РµРЅРёРµРј
      const cartExists = await prisma.cart.findUnique({ where: { id: cart.id } });
      if (cartExists) {
        await prisma.cart.delete({ where: { id: cart.id } });
        console.log(`РЈРґР°Р»РµРЅР° РєРѕСЂР·РёРЅР° ID: ${cart.id}`);
      } else {
        console.log(`РљРѕСЂР·РёРЅР° ID: ${cart.id} СѓР¶Рµ Р±С‹Р»Р° СѓРґР°Р»РµРЅР°`);
      }
      
      // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° - СѓР±РµР¶РґР°РµРјСЃСЏ, С‡С‚Рѕ РєРѕСЂР·РёРЅР° РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ СѓРґР°Р»РµРЅР°
      const cartStillExists = await prisma.cart.findUnique({ where: { id: cart.id } });
      if (cartStillExists) {
        console.log(`РћРЁРР‘РљРђ: РљРѕСЂР·РёРЅР° ID: ${cart.id} РІСЃРµ РµС‰Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚ РїРѕСЃР»Рµ СѓРґР°Р»РµРЅРёСЏ`);
        // РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ СѓРґР°Р»СЏРµРј РєРѕСЂР·РёРЅСѓ
        await prisma.cart.delete({ where: { id: cart.id } });
      }
      
    } catch (clearError) {
      console.error('РћС€РёР±РєР° РїСЂРё РѕС‡РёСЃС‚РєРµ РєРѕСЂР·РёРЅС‹:', clearError);
      // РџСЂРѕРґРѕР»Р¶Р°РµРј РІС‹РїРѕР»РЅРµРЅРёРµ, РґР°Р¶Рµ РµСЃР»Рё РѕС‡РёСЃС‚РєР° РєРѕСЂР·РёРЅС‹ РЅРµ СѓРґР°Р»Р°СЃСЊ
    }
    

    
    // РћС‚РїСЂР°РІР»СЏРµРј email РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ Р·Р°РєР°Р·Р° РїРѕРєСѓРїР°С‚РµР»СЋ
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      // РџРѕРґРіРѕС‚Р°РІР»РёРІР°РµРј РґР°РЅРЅС‹Рµ РґР»СЏ email СЃ РёРЅС„РѕСЂРјР°С†РёРµР№ Рѕ С†РІРµС‚Р°С…
      const orderData = {
        orderId: order.id,
        customerName: user.name || customerInfo?.firstName || (language === 'he' ? 'ЧњЧ§Ч•Ч—' : 'РєР»РёРµРЅС‚'),
        storeName: getStoreInfo(pickupStore).name,
        storeAddress: getStoreInfo(pickupStore).address,
        paymentMethod: paymentMethod,
        total: totalAmount,
        items: order.items.map(item => {
          const itemData = {
            productName: language === 'he' ? (item.product.nameHe || item.product.name) : item.product.name,
            quantity: item.quantity,
            price: item.product.price
          };
          
          // Р”РѕР±Р°РІР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ С†РІРµС‚Рµ РµСЃР»Рё РµСЃС‚СЊ
          if (item.selectedColor) {
            const colorInfo = COLOR_PALETTE.find(c => c.id === item.selectedColor);
            if (colorInfo) {
              itemData.colorNameHe = colorInfo.nameHe;
              itemData.colorNameRu = colorInfo.nameRu;
            }
          }
          
          return itemData;
        })
      };
      
      const template = emailTemplates.orderConfirmation[language];
      const emailSubject = template.subject(orderData);
      const emailHtml = template.html(orderData);
      
      await sendEmail(order.user.email, emailSubject, emailHtml);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
    }
    
    // Р’РѕР·РІСЂР°С‰Р°РµРј Р·Р°РєР°Р· Рё РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ С‚РѕРј, С‡С‚Рѕ РєРѕСЂР·РёРЅР° РѕС‡РёС‰РµРЅР°
    res.json({
      order,
      cartCleared: true,
      message: 'Р—Р°РєР°Р· СѓСЃРїРµС€РЅРѕ РѕС„РѕСЂРјР»РµРЅ, РєРѕСЂР·РёРЅР° РѕС‡РёС‰РµРЅР°'
    });
    } // Closing brace for the else block
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС„РѕСЂРјР»РµРЅРёСЏ Р·Р°РєР°Р·Р°' });
  }
});

// === РћС„РѕСЂРјР»РµРЅРёРµ РіРѕСЃС‚РµРІРѕРіРѕ Р·Р°РєР°Р·Р° (Р±РµР· Р°РІС‚РѕСЂРёР·Р°С†РёРё) ===
app.post('/api/guest/checkout', async (req, res) => {
  try {
    console.log('рџ›’ Guest checkout request received:', req.body);
    // РћРїСЂРµРґРµР»СЏРµРј СЏР·С‹Рє РґР»СЏ email
    const { language: frontendLanguage } = req.body;
    const acceptLanguage = req.headers['accept-language'] || '';
    const language = frontendLanguage || (acceptLanguage.includes('ru') ? 'ru' : 'he');
    
    const { customerInfo, pickupStore, paymentMethod, total, cartItems } = req.body;
    
    console.log('рџ“‹ Parsed data:', { customerInfo, pickupStore, paymentMethod, total, cartItems });
    
    // Р’Р°Р»РёРґР°С†РёСЏ РІС…РѕРґРЅС‹С… РґР°РЅРЅС‹С…
    if (!customerInfo || !customerInfo.firstName || !customerInfo.lastName || 
        !customerInfo.email || !customerInfo.phone || !pickupStore || !cartItems || !cartItems.length) {
      console.log('вќЊ Validation failed:', { customerInfo, pickupStore, cartItems });
      return res.status(400).json({ error: 'РќРµРѕР±С…РѕРґРёРјРѕ Р·Р°РїРѕР»РЅРёС‚СЊ РІСЃРµ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Рµ РїРѕР»СЏ Рё РґРѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂС‹ РІ РєРѕСЂР·РёРЅСѓ' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј РЅР°Р»РёС‡РёРµ С‚РѕРІР°СЂР° РЅР° СЃРєР»Р°РґРµ
    console.log('рџ”Ќ Checking product availability...');
    for (const item of cartItems) {
      console.log('рџ”Ќ Checking product:', item);
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        console.log('вќЊ Product not found:', item.productId);
        return res.status(400).json({ error: `РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ: ID ${item.productId}` });
      }
      if (item.quantity > product.quantity) {
        console.log('вќЊ Insufficient quantity:', { requested: item.quantity, available: product.quantity });
        return res.status(400).json({ error: `РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ С‚РѕРІР°СЂР°: ${product.name}` });
      }
      console.log('вњ… Product available:', { productId: item.productId, quantity: product.quantity });
    }
    
    // РЎРѕР·РґР°С‘Рј РіРѕСЃС‚РµРІРѕР№ Р·Р°РєР°Р·
    console.log('рџ“ќ Creating guest order...');
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        pickupStore,
        guestName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        guestEmail: customerInfo.email,
        guestPhone: customerInfo.phone,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor || null
          }))
        }
      },
      include: { 
        items: { include: { product: true } }
      }
    });
    
    // РЈРјРµРЅСЊС€Р°РµРј РєРѕР»РёС‡РµСЃС‚РІРѕ РЅР° СЃРєР»Р°РґРµ
    console.log('рџ“¦ Updating product quantities...');
    for (const item of cartItems) {
      console.log('рџ“¦ Updating product:', item.productId, 'quantity:', item.quantity);
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });
    }
    
    // РћС‚РїСЂР°РІР»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёРµ РІ Telegram
    console.log('рџ“± Sending Telegram notification...');
    try {
      const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const telegramMessage = `
рџ›’ <b>РќРѕРІС‹Р№ РіРѕСЃС‚РµРІРѕР№ Р·Р°РєР°Р· #${order.id}</b>

рџ‘¤ <b>РљР»РёРµРЅС‚:</b> ${(customerInfo.firstName || '').trim()} ${(customerInfo.lastName || '').trim()}
рџ“§ <b>Email:</b> ${customerInfo.email}
рџ“± <b>РўРµР»РµС„РѕРЅ:</b> ${customerInfo.phone}
рџЏ¬ <b>РЎР°РјРѕРІС‹РІРѕР· РёР·:</b> ${getStoreInfo(pickupStore).name} (${getStoreInfo(pickupStore).address})
рџ’і <b>РћРїР»Р°С‚Р°:</b> ${paymentMethod === 'card' ? 'РљР°СЂС‚Р°' : 'РќР°Р»РёС‡РЅС‹РјРё РёР»Рё РєР°СЂС‚РѕР№'}

рџ“¦ <b>РўРѕРІР°СЂС‹:</b>
${order.items.map(item => {
  const productName = item.product.nameHe || item.product.name;
  let itemText = `вЂў ${productName} x${item.quantity} - в‚Є${item.price * item.quantity}`;
  if (item.product.article) {
    itemText += `\n  рџ“‹ РђСЂС‚РёРєСѓР»: ${item.product.article}`;
  }
  if (item.selectedColor) {
    const colorInfo = COLOR_PALETTE.find(c => c.id === item.selectedColor);
    if (colorInfo) {
      itemText += `\n  рџЋЁ Р¦РІРµС‚: ${colorInfo.nameRu}`;
    }
  }
  return itemText;
}).join('\n')}

рџ’° <b>РС‚РѕРіРѕ:</b> в‚Є${totalAmount}
рџ“… <b>Р”Р°С‚Р°:</b> ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' })}
      `.trim();
      await sendTelegramNotification(telegramMessage);
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
    }
    
    // РћС‚РїСЂР°РІР»СЏРµРј email РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ Р·Р°РєР°Р·Р° РіРѕСЃС‚СЋ
    console.log('рџ“§ Sending order confirmation email...');
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // РџРѕРґРіРѕС‚Р°РІР»РёРІР°РµРј РґР°РЅРЅС‹Рµ РґР»СЏ email СЃ РёРЅС„РѕСЂРјР°С†РёРµР№ Рѕ С†РІРµС‚Р°С…
      const orderData = {
        orderId: order.id,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        storeName: getStoreInfo(pickupStore).name,
        storeAddress: getStoreInfo(pickupStore).address,
        paymentMethod: paymentMethod,
        total: totalAmount,
        items: order.items.map(item => {
          const itemData = {
            productName: language === 'he' ? (item.product.nameHe || item.product.name) : item.product.name,
            quantity: item.quantity,
            price: item.price
          };
          
          // Р”РѕР±Р°РІР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ С†РІРµС‚Рµ РµСЃР»Рё РµСЃС‚СЊ
          if (item.selectedColor) {
            const colorInfo = COLOR_PALETTE.find(c => c.id === item.selectedColor);
            if (colorInfo) {
              itemData.colorNameHe = colorInfo.nameHe;
              itemData.colorNameRu = colorInfo.nameRu;
            }
          }
          
          return itemData;
        })
      };
      
      const template = emailTemplates.orderConfirmation[language];
      const emailSubject = template.subject(orderData);
      const emailHtml = template.html(orderData);
      
      await sendEmail(customerInfo.email, emailSubject, emailHtml);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
    }
    
    console.log('вњ… Guest order created successfully:', order.id);
    res.json({
      order,
      message: 'Р“РѕСЃС‚РµРІРѕР№ Р·Р°РєР°Р· СѓСЃРїРµС€РЅРѕ РѕС„РѕСЂРјР»РµРЅ'
    });
  } catch (error) {
    console.error('вќЊ Guest checkout error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС„РѕСЂРјР»РµРЅРёСЏ РіРѕСЃС‚РµРІРѕРіРѕ Р·Р°РєР°Р·Р°' });
  }
});

// === РџРѕР»СѓС‡РёС‚СЊ РєРѕРЅРєСЂРµС‚РЅС‹Р№ Р·Р°РєР°Р· ===
app.get('/api/profile/orders/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Order fetch request:', { 
      orderId: req.params.id, 
      userId: req.user.userId,
      userRole: req.user.role 
    });
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ orderId СЏРІР»СЏРµС‚СЃСЏ С‡РёСЃР»РѕРј
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      console.log('Invalid orderId:', req.params.id);
      return res.status(400).json({ error: 'РќРµРІРµСЂРЅС‹Р№ ID Р·Р°РєР°Р·Р°' });
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { 
          include: { 
            product: { 
              select: { 
                id: true, 
                name: true, 
                nameHe: true,
                imageUrls: true 
              } 
            } 
          } 
        },
        user: true
      }
    });
    
    console.log('Order found:', order ? { id: order.id, userId: order.userId } : null);
    
    if (!order) {
      return res.status(404).json({ error: 'Р—Р°РєР°Р· РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР° Рє Р·Р°РєР°Р·Сѓ' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°РєР°Р·Р°' });
  }
});

// === РћС‚РјРµРЅР° Р·Р°РєР°Р·Р° ===
app.post('/api/profile/orders/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ error: 'Р—Р°РєР°Р· РЅРµ РЅР°Р№РґРµРЅ' });
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР° Рє РѕС‚РјРµРЅРµ Р·Р°РєР°Р·Р°' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Р—Р°РєР°Р· СѓР¶Рµ РѕС‚РјРµРЅС‘РЅ' });
    }
    // Р’РѕР·РІСЂР°С‰Р°РµРј РєРѕР»РёС‡РµСЃС‚РІРѕ РЅР° СЃРєР»Р°Рґ
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } }
      });
    }
    // РњРµРЅСЏРµРј СЃС‚Р°С‚СѓСЃ Р·Р°РєР°Р·Р°
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' }
    });
    res.json({ message: 'Р—Р°РєР°Р· РѕС‚РјРµРЅС‘РЅ Рё РєРѕР»РёС‡РµСЃС‚РІРѕ РІРѕР·РІСЂР°С‰РµРЅРѕ РЅР° СЃРєР»Р°Рґ' });
  } catch (error) {
    console.error('Order cancel error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС‚РјРµРЅС‹ Р·Р°РєР°Р·Р°' });
  }
});

// === РЎРєСЂС‹С‚РёРµ Р·Р°РєР°Р·Р° РїРѕР»СЊР·РѕРІР°С‚РµР»РµРј ===
app.delete('/api/profile/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ error: 'Р—Р°РєР°Р· РЅРµ РЅР°Р№РґРµРЅ' });
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР° Рє СЃРєСЂС‹С‚РёСЋ Р·Р°РєР°Р·Р°' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ Р·Р°РєР°Р· РёРјРµРµС‚ СЃС‚Р°С‚СѓСЃ "РїРѕР»СѓС‡РµРЅ" РёР»Рё "РѕС‚РјРµРЅРµРЅ"
    if (order.status !== 'pickedup' && order.status !== 'cancelled') {
      return res.status(400).json({ error: 'РњРѕР¶РЅРѕ СЃРєСЂС‹С‚СЊ С‚РѕР»СЊРєРѕ Р·Р°РєР°Р·С‹ СЃРѕ СЃС‚Р°С‚СѓСЃРѕРј "РџРѕР»СѓС‡РµРЅ" РёР»Рё "РћС‚РјРµРЅРµРЅ"' });
    }
    
    // РЎРєСЂС‹РІР°РµРј Р·Р°РєР°Р· (РґРѕР±Р°РІР»СЏРµРј РІ СЃРєСЂС‹С‚С‹Рµ Р·Р°РєР°Р·С‹ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ)
    await prisma.userHiddenOrder.create({
      data: {
        userId: req.user.userId,
        orderId: order.id
      }
    });
    
    res.json({ message: 'Р—Р°РєР°Р· СЃРєСЂС‹С‚ РёР· СЃРїРёСЃРєР°' });
  } catch (error) {
    console.error('Order hide error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃРєСЂС‹С‚РёСЏ Р·Р°РєР°Р·Р°' });
  }
});

// Р’Р Р•РњР•РќРќРђРЇ РњРР“Р РђР¦РРЇ: РїРµСЂРµРЅРѕСЃРёРј imageUrl РІ imageUrls
async function migrateImageUrls() {
  try {
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓСЋС‚ Р»Рё РїРѕР»СЏ РїРµСЂРµРІРѕРґРѕРІ
    const translationFields = await getTranslationFields();
    
    if (translationFields.length === 0) {
      console.log('вљ пёЏ РџРѕР»СЏ РїРµСЂРµРІРѕРґРѕРІ РµС‰Рµ РЅРµ СЃРѕР·РґР°РЅС‹. РџСЂРѕРїСѓСЃРєР°РµРј РјРёРіСЂР°С†РёСЋ РёР·РѕР±СЂР°Р¶РµРЅРёР№.');
      return;
    }
    
    const products = await prisma.product.findMany();
    for (const product of products) {
      if (product.imageUrl && (!product.imageUrls || product.imageUrls.length === 0)) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            imageUrls: [product.imageUrl],
            imageUrl: null
          }
        });
      }
    }
    console.log('вњ… РњРёРіСЂР°С†РёСЏ РёР·РѕР±СЂР°Р¶РµРЅРёР№ Р·Р°РІРµСЂС€РµРЅР°');
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РјРёРіСЂР°С†РёРё РёР·РѕР±СЂР°Р¶РµРЅРёР№:', error.message);
  }
}

// Р—Р°РїСѓСЃРєР°РµРј РјРёРіСЂР°С†РёСЋ РёР·РѕР±СЂР°Р¶РµРЅРёР№ С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ РїСЂРѕРІРµСЂРєРё РіРѕС‚РѕРІРЅРѕСЃС‚Рё Р±Р°Р·С‹
setTimeout(() => {
  migrateImageUrls();
}, 5000); // Р—Р°РґРµСЂР¶РєР° 5 СЃРµРєСѓРЅРґ РґР»СЏ РїСЂРёРјРµРЅРµРЅРёСЏ РјРёРіСЂР°С†РёР№

// Р­РЅРґРїРѕРёРЅС‚ РґР»СЏ РёР·РјРµРЅРµРЅРёСЏ С‚РѕР»СЊРєРѕ РїРѕР»СЏ isHidden
app.patch('/api/products/:id/hidden', authMiddleware, async (req, res) => {
  // РџСЂРѕРІРµСЂРєР° СЂРѕР»Рё admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const { isHidden } = req.body;
    
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isHidden: isHidden === 'true' || isHidden === true }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating product visibility:', error);
    res.status(500).json({ error: 'Failed to update product visibility' });
  }
});

app.put('/api/products/:id', 
  authMiddleware, 
  upload.array('images', 7), 
  dualStorageUploadMiddleware.processUploadedFiles.bind(dualStorageUploadMiddleware), 
  invalidateCache([CACHE_PATTERNS.PRODUCTS, CACHE_PATTERNS.CATEGORIES, CACHE_PATTERNS.SEARCH]),
  async (req, res) => {
  try {
    console.log('рџ“ќ РћР±РЅРѕРІР»РµРЅРёРµ С‚РѕРІР°СЂР° ID:', req.params.id);
    
    // РџСЂРѕРІРµСЂРєР° СЂРѕР»Рё admin
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    const { name, description, nameHe, descriptionHe, price, category, subcategory, ageGroup, gender, quantity, article, brand, country, length, width, height, isHidden, removedImages, currentExistingImages, mainImageIndex, availableColors, inputLanguage = 'ru' } = req.body;
    
    // РџР°СЂСЃРёРј С†РІРµС‚Р° РµСЃР»Рё РѕРЅРё РїРµСЂРµРґР°РЅС‹
    let colorsData = null;
    if (availableColors) {
      try {
        colorsData = typeof availableColors === 'string' ? JSON.parse(availableColors) : availableColors;
        console.log('рџЋЁ Parsed availableColors (with indices):', colorsData);
      } catch (e) {
        console.error('вќЊ Error parsing availableColors:', e);
      }
    }
    
    console.log('рџ“ќ РџРѕР»СѓС‡РµРЅС‹ РґР°РЅРЅС‹Рµ РґР»СЏ РѕР±РЅРѕРІР»РµРЅРёСЏ:', { name, price, ageGroup, gender, category, subcategory });
    
    // РџРѕР»СѓС‡Р°РµРј С‚РµРєСѓС‰РёР№ С‚РѕРІР°СЂ РґР»СЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёС… РёР·РѕР±СЂР°Р¶РµРЅРёР№
    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!currentProduct) {
      return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    // РћР±СЂР°Р±Р°С‚С‹РІР°РµРј РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
    let imageUrls = currentProduct.imageUrls || [];
    
    // Р•СЃР»Рё РїРµСЂРµРґР°РЅРѕ С‚РµРєСѓС‰РµРµ СЃРѕСЃС‚РѕСЏРЅРёРµ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёС… РёР·РѕР±СЂР°Р¶РµРЅРёР№, РёСЃРїРѕР»СЊР·СѓРµРј РµРіРѕ
    if (currentExistingImages) {
      try {
        const parsedCurrentImages = JSON.parse(currentExistingImages);
        imageUrls = parsedCurrentImages;
      } catch (e) {
        console.error('Error parsing currentExistingImages:', e);
      }
    }
    
    // Р”РѕР±Р°РІР»СЏРµРј РЅРѕРІС‹Рµ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
    console.log('рџ–јпёЏ PUT /api/products/:id - РћР±СЂР°Р±РѕС‚РєР° С„Р°Р№Р»РѕРІ');
    console.log('рџ–јпёЏ PUT /api/products/:id - req.files =', req.files ? req.files.length : 'undefined');
    console.log('рџ–јпёЏ PUT /api/products/:id - req.imageUrls =', req.imageUrls);
    
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file, index) => {
        console.log('рџ–јпёЏ PUT /api/products/:id - РћР±СЂР°Р±РѕС‚РєР° С„Р°Р№Р»Р°:', file.originalname);
        console.log('рџ–јпёЏ PUT /api/products/:id - file.filename =', file.filename);
        
        // РСЃРїРѕР»СЊР·СѓРµРј URL РёР· Cloudinary РёР»Рё Р»РѕРєР°Р»СЊРЅС‹Рµ РїСѓС‚Рё
        if (req.imageUrls && req.imageUrls[index]) {
          // РСЃРїРѕР»СЊР·СѓРµРј URL РёР· Cloudinary
          const url = req.imageUrls[index];
          console.log('рџ–јпёЏ PUT /api/products/:id - РСЃРїРѕР»СЊР·СѓРµРј Cloudinary URL:', url);
          return url;
        } else if (file.filename) {
          // Fallback РґР»СЏ Р»РѕРєР°Р»СЊРЅС‹С… С„Р°Р№Р»РѕРІ
          const url = `/uploads/${file.filename}`;
          console.log('рџ–јпёЏ PUT /api/products/:id - РСЃРїРѕР»СЊР·СѓРµРј file.filename:', url);
          return url;
        } else {
          // Fallback РґР»СЏ production
          const url = `/uploads/${Date.now()}_${file.originalname}`;
          console.log('рџ–јпёЏ PUT /api/products/:id - Fallback URL:', url);
          return url;
        }
      });
      imageUrls = [...imageUrls, ...newImageUrls];
      console.log('рџ–јпёЏ PUT /api/products/:id - РС‚РѕРіРѕРІС‹Рµ imageUrls:', imageUrls);
    }
    
    // РџРµСЂРµСѓРїРѕСЂСЏРґРѕС‡РёРІР°РµРј РёР·РѕР±СЂР°Р¶РµРЅРёСЏ, РµСЃР»Рё СѓРєР°Р·Р°РЅ РіР»Р°РІРЅС‹Р№ РёРЅРґРµРєСЃ
    if (mainImageIndex !== undefined && imageUrls.length > 0) {
      const mainIndex = parseInt(mainImageIndex);
      if (mainIndex >= 0 && mainIndex < imageUrls.length) {
        const mainImage = imageUrls[mainIndex];
        // РџРµСЂРµРјРµС‰Р°РµРј РіР»Р°РІРЅРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ РІ РЅР°С‡Р°Р»Рѕ РјР°СЃСЃРёРІР°
        imageUrls = [mainImage, ...imageUrls.filter((_, index) => index !== mainIndex)];
      }
    }

    // РџСЂРµРѕР±СЂР°Р·СѓРµРј imageIndex РІ СЂРµР°Р»СЊРЅС‹Рµ imageUrl РїРѕСЃР»Рµ Р·Р°РіСЂСѓР·РєРё РёР·РѕР±СЂР°Р¶РµРЅРёР№
    if (colorsData && Array.isArray(colorsData) && imageUrls.length > 0) {
      colorsData = colorsData.map(colorData => {
        const imageIndex = colorData.imageIndex;
        if (imageIndex !== null && imageIndex !== undefined && imageUrls[imageIndex]) {
          return {
            colorId: colorData.colorId,
            imageUrl: imageUrls[imageIndex]
          };
        }
        return {
          colorId: colorData.colorId,
          imageUrl: null
        };
      });
      console.log('рџЋЁ Transformed availableColors (with URLs):', colorsData);
    }
    
    // РџРѕР»СѓС‡Р°РµРј РЅР°Р·РІР°РЅРёРµ РєР°С‚РµРіРѕСЂРёРё РїРѕ ID
    let categoryName = category;
    if (category && !isNaN(category)) {
      const categoryRecord = await prisma.category.findUnique({
        where: { id: parseInt(category) }
      });
      categoryName = categoryRecord ? categoryRecord.name : category;
      console.log('API: Category processing - category:', category, 'categoryName:', categoryName);
    }

    // РџРѕР»СѓС‡Р°РµРј ID РїРѕРґРєР°С‚РµРіРѕСЂРёРё
    let subcategoryId = null;
    if (subcategory) {
      // Р•СЃР»Рё subcategory - СЌС‚Рѕ ID, РёСЃРїРѕР»СЊР·СѓРµРј РµРіРѕ РЅР°РїСЂСЏРјСѓСЋ
      if (!isNaN(subcategory)) {
        subcategoryId = parseInt(subcategory);
        console.log('API: Subcategory processing - subcategory ID:', subcategoryId);
      } else {
        // Р•СЃР»Рё subcategory - СЌС‚Рѕ РЅР°Р·РІР°РЅРёРµ, РёС‰РµРј РїРѕ РЅР°Р·РІР°РЅРёСЋ
        const subcategoryRecord = await prisma.category.findFirst({
          where: { 
            name: subcategory,
            parentId: parseInt(category)
          }
        });
        subcategoryId = subcategoryRecord ? subcategoryRecord.id : null;
        console.log('API: Subcategory processing - subcategory name:', subcategory, 'found ID:', subcategoryId);
      }
    }

    console.log('API: Final update data - categoryId:', category && !isNaN(category) ? parseInt(category) : null, 'subcategoryId:', subcategoryId);
    console.log('API: About to update product with include...');
    
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓСЋС‚ Р»Рё РєР°С‚РµРіРѕСЂРёРё РїРµСЂРµРґ РѕР±РЅРѕРІР»РµРЅРёРµРј
    if (category && !isNaN(category)) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(category) }
      });
      console.log('API: Category exists check:', categoryExists);
      
      if (!categoryExists) {
        console.log('API: WARNING - Category with ID', parseInt(category), 'does not exist!');
      }
    }
    
    if (subcategoryId) {
      const subcategoryExists = await prisma.category.findUnique({
        where: { id: subcategoryId }
      });
      console.log('API: Subcategory exists check:', subcategoryExists);
      
      if (!subcategoryExists) {
        console.log('API: WARNING - Subcategory with ID', subcategoryId, 'does not exist!');
      }
    }
    
    // РЎРѕР·РґР°РµРј РґР°РЅРЅС‹Рµ С‚РѕРІР°СЂР° СЃ РїРѕРґРґРµСЂР¶РєРѕР№ СЂСѓС‡РЅС‹С… РїРµСЂРµРІРѕРґРѕРІ
    const productData = {
      name,
      description,
      nameHe: nameHe || null,
      descriptionHe: descriptionHe || null,
      price: parseFloat(price),
      categoryName: categoryName,
      categoryId: category && !isNaN(category) ? parseInt(category) : null,
      subcategoryId: subcategoryId,
      ageGroup,
      gender,
      imageUrls,
      ...(quantity !== undefined ? { quantity: parseInt(quantity) } : {}),
      ...(isHidden !== undefined ? { isHidden: isHidden === 'true' || isHidden === true } : {}),
      // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РїРѕР»СЏ:
      article: article || null,
      brand: brand || null,
      country: country || null,
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      ...(colorsData !== null ? { availableColors: colorsData } : {})
    };

    console.log('рџ“ќ API: РћР±РЅРѕРІР»СЏРµРј С‚РѕРІР°СЂ РІ Р‘Р” СЃ РґР°РЅРЅС‹РјРё:', productData);
    
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: productData,
      include: {
        category: {
          select: { id: true, name: true }
        },
        subcategory: {
          select: { id: true, name: true }
        }
      }
    });
    
    console.log('вњ… API: РўРѕРІР°СЂ СѓСЃРїРµС€РЅРѕ РѕР±РЅРѕРІР»РµРЅ РІ Р‘Р”:', updated);
    
    console.log('API: Product updated successfully:', updated.id);
    console.log('API: Updated product category:', updated.category);
    console.log('API: Updated product subcategory:', updated.subcategory);
    console.log('API: Updated product categoryId:', updated.categoryId);
    console.log('API: Updated product subcategoryId:', updated.subcategoryId);
    
    // РџСЂРѕРІРµСЂСЏРµРј, СЃСѓС‰РµСЃС‚РІСѓСЋС‚ Р»Рё СЃРІСЏР·Р°РЅРЅС‹Рµ Р·Р°РїРёСЃРё
    if (updated.categoryId) {
      const categoryCheck = await prisma.category.findUnique({
        where: { id: updated.categoryId }
      });
      console.log('API: Category check result:', categoryCheck);
    }
    
    if (updated.subcategoryId) {
      const subcategoryCheck = await prisma.category.findUnique({
        where: { id: updated.subcategoryId }
      });
      console.log('API: Subcategory check result:', subcategoryCheck);
    }
    
    console.log('вњ… РўРѕРІР°СЂ СѓСЃРїРµС€РЅРѕ РѕР±РЅРѕРІР»РµРЅ:', updated.id);
    res.json(updated);
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ С‚РѕРІР°СЂР°:', error);
    console.error('вќЊ Р”РµС‚Р°Р»Рё РѕС€РёР±РєРё:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message,
      code: error.code
    });
  }
});

// РЈРґР°Р»РёС‚СЊ РёР·РѕР±СЂР°Р¶РµРЅРёРµ С‚РѕРІР°СЂР°
app.delete('/api/products/:id/images/:imageIndex', authMiddleware, async (req, res) => {
  // РџСЂРѕРІРµСЂРєР° СЂРѕР»Рё admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  
  try {
    const productId = parseInt(req.params.id);
    const imageIndex = parseInt(req.params.imageIndex);
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    const imageUrls = product.imageUrls || [];
    if (imageIndex < 0 || imageIndex >= imageUrls.length) {
      return res.status(400).json({ error: 'РќРµРІРµСЂРЅС‹Р№ РёРЅРґРµРєСЃ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ' });
    }
    
    // РЈРґР°Р»СЏРµРј РёР·РѕР±СЂР°Р¶РµРЅРёРµ РёР· РјР°СЃСЃРёРІР°
    const updatedImageUrls = imageUrls.filter((_, index) => index !== imageIndex);
    
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { imageUrls: updatedImageUrls }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ error: 'Failed to delete product image' });
  }
});

// === API РґР»СЏ РїРµСЂРµРІРѕРґРѕРІ С‚РѕРІР°СЂРѕРІ ===

// РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ РїРµСЂРµРІРѕРґ С‚РѕРІР°СЂР°
app.post('/api/products/:id/translate', authMiddleware, async (req, res) => {
  // РџСЂРѕРІРµСЂРєР° СЂРѕР»Рё admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  
  try {
    const productId = parseInt(req.params.id);
    const translatedProduct = await TranslationService.autoTranslateProduct(productId);
    
    res.json({
      success: true,
      message: 'РўРѕРІР°СЂ СѓСЃРїРµС€РЅРѕ РїРµСЂРµРІРµРґРµРЅ',
      product: translatedProduct
    });
  } catch (error) {
    console.error('Error translating product:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРµСЂРµРІРѕРґР° С‚РѕРІР°СЂР°' });
  }
});

// РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ РїРµСЂРµРІРѕРґ РІСЃРµС… С‚РѕРІР°СЂРѕРІ
app.post('/api/products/translate-all', authMiddleware, async (req, res) => {
  // РџСЂРѕРІРµСЂРєР° СЂРѕР»Рё admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  
  try {
    const translatedCount = await TranslationService.translateAllProducts();
    
    res.json({
      success: true,
      message: `РџРµСЂРµРІРµРґРµРЅРѕ ${translatedCount} С‚РѕРІР°СЂРѕРІ`,
      translatedCount
    });
  } catch (error) {
    console.error('Error translating all products:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРµСЂРµРІРѕРґР° С‚РѕРІР°СЂРѕРІ' });
  }
});

// РџРѕР»СѓС‡РёС‚СЊ С‚РѕРІР°СЂС‹ СЃ РїРµСЂРµРІРѕРґР°РјРё РґР»СЏ СѓРєР°Р·Р°РЅРЅРѕРіРѕ СЏР·С‹РєР°
app.get('/api/products/with-translations', async (req, res) => {
  try {
    const { language = 'ru' } = req.query;
    const products = await TranslationService.getAllProductsWithTranslations(language);
    
    res.json(products);
  } catch (error) {
    console.error('Error getting products with translations:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ С‚РѕРІР°СЂРѕРІ СЃ РїРµСЂРµРІРѕРґР°РјРё' });
  }
});

// РћР±РЅРѕРІРёС‚СЊ РїРµСЂРµРІРѕРґС‹ С‚РѕРІР°СЂР° РІСЂСѓС‡РЅСѓСЋ
app.put('/api/products/:id/translations', authMiddleware, async (req, res) => {
  // РџСЂРѕРІРµСЂРєР° СЂРѕР»Рё admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  
  try {
    const productId = parseInt(req.params.id);
    const { nameHe, descriptionHe } = req.body;
    
    // РџСЂРѕРІРµСЂСЏРµРј РґРѕСЃС‚СѓРїРЅРѕСЃС‚СЊ РїРѕР»РµР№ РїРµСЂРµРІРѕРґРѕРІ
    const translationFields = await getTranslationFields();
    if (translationFields.length === 0) {
      return res.status(400).json({ 
        error: 'РџРѕР»СЏ РїРµСЂРµРІРѕРґРѕРІ РµС‰Рµ РЅРµ СЃРѕР·РґР°РЅС‹. РџСЂРёРјРµРЅРёС‚Рµ РјРёРіСЂР°С†РёРё Р±Р°Р·С‹ РґР°РЅРЅС‹С….' 
      });
    }
    
    const updatedProduct = await TranslationService.updateProductTranslations(
      productId, 
      nameHe, 
      descriptionHe
    );
    
    res.json({
      success: true,
      message: 'РџРµСЂРµРІРѕРґС‹ РѕР±РЅРѕРІР»РµРЅС‹',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product translations:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ РїРµСЂРµРІРѕРґРѕРІ' });
  }
});

// === Admin: РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ Р·Р°РєР°Р·С‹ ===
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Р”РѕР±Р°РІР»СЏРµРј СЂР°СЃС‡РµС‚ СЃСѓРјРјС‹ РґР»СЏ РєР°Р¶РґРѕРіРѕ Р·Р°РєР°Р·Р° Рё РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј РіРѕСЃС‚РµРІС‹Рµ Р·Р°РєР°Р·С‹
    const ordersWithTotal = orders.map(order => ({
      ...order,
      total: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      // Р”Р»СЏ РіРѕСЃС‚РµРІС‹С… Р·Р°РєР°Р·РѕРІ РґРѕР±Р°РІР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ РіРѕСЃС‚Рµ
      user: order.user || {
        name: order.guestName || 'Р“РѕСЃС‚РµРІРѕР№ Р·Р°РєР°Р·',
        email: order.guestEmail || 'РќРµ СѓРєР°Р·Р°РЅРѕ',
        phone: order.guestPhone || 'РќРµ СѓРєР°Р·Р°РЅРѕ'
      }
    }));
    
    res.json(ordersWithTotal);
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°РєР°Р·РѕРІ' });
  }
});

// === Admin: РёР·РјРµРЅРёС‚СЊ СЃС‚Р°С‚СѓСЃ Р·Р°РєР°Р·Р° ===
app.put('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const { status } = req.body;

    
    // РџРѕР»СѓС‡Р°РµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ Р·Р°РєР°Р·Рµ Рё РїРѕР»СЊР·РѕРІР°С‚РµР»Рµ
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        user: true,
        items: { include: { product: true } }
      }
    });
    
    const updated = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { 
        user: true,
        items: { include: { product: true } }
      }
    });
    
    // РЈРІРµРґРѕРјР»РµРЅРёСЏ РІ Telegram РѕС‚РєР»СЋС‡РµРЅС‹ - С‚РѕР»СЊРєРѕ РґР»СЏ РЅРѕРІС‹С… Р·Р°РєР°Р·РѕРІ Рё РЅРѕРІС‹С… РІРѕРїСЂРѕСЃРѕРІ
    
    // Р’ endpoint СЃРјРµРЅС‹ СЃС‚Р°С‚СѓСЃР° Р·Р°РєР°Р·Р° (РЅР°РїСЂРёРјРµСЂ, PUT /api/admin/orders/:id):
    // РџРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ РѕР±РЅРѕРІР»РµРЅРёСЏ СЃС‚Р°С‚СѓСЃР° РЅР° 'delivered':
    
    if (status === 'pickedup') {
      
      try {
        // РЎРѕР·РґР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ С‚РѕР»СЊРєРѕ РµСЃР»Рё РµСЃС‚СЊ userId (РЅРµ РіРѕСЃС‚РµРІРѕР№ Р·Р°РєР°Р·)
        if (order.userId) {
          const notification = await prisma.notification.create({
            data: {
              userId: order.userId,
              type: 'review_request',
              title: 'reviews.notification.title',
              message: 'reviews.notification.message',
              actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/review-order?orderId=${order.id}`,
              actionText: 'reviews.notification.actionText'
            }
          });
          console.log('вњ… РЈРІРµРґРѕРјР»РµРЅРёРµ Рѕ РѕС‚Р·С‹РІРµ СЃРѕР·РґР°РЅРѕ РґР»СЏ Р·Р°РєР°Р·Р°:', order.id);
        } else {
          console.log('в„№пёЏ РџСЂРѕРїСѓСЃРєР°РµРј СЃРѕР·РґР°РЅРёРµ СѓРІРµРґРѕРјР»РµРЅРёСЏ РґР»СЏ РіРѕСЃС‚РµРІРѕРіРѕ Р·Р°РєР°Р·Р°:', order.id);
        }
        
      } catch (error) {
        console.error('РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ СѓРІРµРґРѕРјР»РµРЅРёСЏ:', error);
      }
    } else {
      
    }
    
    
    res.json(updated);
  } catch (error) {
    console.error('Admin order status update error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РёР·РјРµРЅРµРЅРёСЏ СЃС‚Р°С‚СѓСЃР° Р·Р°РєР°Р·Р°' });
  }
});

// === Admin: СѓРґР°Р»РёС‚СЊ Р·Р°РєР°Р· ===
app.delete('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const orderId = parseInt(req.params.id);
    
    console.log('DELETE /api/admin/orders/:id - Starting deletion process');
    console.log('DELETE /api/admin/orders/:id - Order ID:', orderId);
    
    // РЎРЅР°С‡Р°Р»Р° СѓРґР°Р»СЏРµРј СЃРІСЏР·Р°РЅРЅС‹Рµ РґР°РЅРЅС‹Рµ
    try {
      console.log('DELETE /api/admin/orders/:id - Deleting order items...');
      await prisma.orderItem.deleteMany({
        where: { orderId: orderId }
      });
      console.log('DELETE /api/admin/orders/:id - Order items deleted successfully');
    } catch (orderItemsError) {
      console.error('DELETE /api/admin/orders/:id - Error deleting order items:', orderItemsError);
    }
    
    try {
      console.log('DELETE /api/admin/orders/:id - Deleting hidden orders...');
      await prisma.userHiddenOrder.deleteMany({
        where: { orderId: orderId }
      });
      console.log('DELETE /api/admin/orders/:id - Hidden orders deleted successfully');
    } catch (hiddenOrdersError) {
      console.error('DELETE /api/admin/orders/:id - Error deleting hidden orders:', hiddenOrdersError);
    }
    
    // РўРµРїРµСЂСЊ СѓРґР°Р»СЏРµРј СЃР°Рј Р·Р°РєР°Р·
    console.log('DELETE /api/admin/orders/:id - Deleting order...');
    await prisma.order.delete({ 
      where: { id: orderId } 
    });
    console.log('DELETE /api/admin/orders/:id - Order deleted successfully');
    
    res.json({ message: 'Р—Р°РєР°Р· СѓРґР°Р»С‘РЅ' });
  } catch (error) {
    console.error('DELETE /api/admin/orders/:id - Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ Р·Р°РєР°Р·Р°' });
  }
});

// --- РњР°РіР°Р·РёРЅС‹ ---
app.get('/api/stores', async (req, res) => {
  try {
    const stores = [
      { id: 'store1', name: 'Ч—Ч Ч•ЧЄ Ч§ЧЁЧ™Ч™ЧЄ Ч™Чќ', address: 'ЧЁЧ•Ч‘ЧЁЧ ЧЎЧ•ЧњЧ“ 8 Ч§ЧЁЧ™Ч™ЧЄ Ч™Чќ' },
      { id: 'store2', name: 'Ч—Ч Ч•ЧЄ Ч§ЧЁЧ™Ч™ЧЄ ЧћЧ•Ч¦Ч§Ч™Чџ', address: 'Ч•Ч™Ч¦ЧћЧџ 6 Ч§ЧЁЧ™Ч™ЧЄ ЧћЧ•Ч¦Ч§Ч™Чџ' }
    ];
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ СЃРїРёСЃРєР° РјР°РіР°Р·РёРЅРѕРІ' });
  }
});

// --- РљР°С‚РµРіРѕСЂРёРё ---
app.get('/api/categories', cacheMiddleware(300), smartInvalidateCache, async (req, res) => {
  try {
    // РџСЂРѕРІРµСЂСЏРµРј, СЏРІР»СЏРµС‚СЃСЏ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂРѕРј
    const token = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        isAdmin = user?.role === 'admin';
      } catch (e) {
        // РўРѕРєРµРЅ РЅРµРґРµР№СЃС‚РІРёС‚РµР»РµРЅ, РЅРѕ СЌС‚Рѕ РЅРµ РєСЂРёС‚РёС‡РЅРѕ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёР№
      }
    }
    
    // Р•СЃР»Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ - РІРѕР·РІСЂР°С‰Р°РµРј РІСЃРµ РєР°С‚РµРіРѕСЂРёРё, РёРЅР°С‡Рµ С‚РѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹Рµ
    let whereClause = isAdmin ? {} : { active: true };
    
    // Р”РѕР±Р°РІР»СЏРµРј С„РёР»СЊС‚СЂР°С†РёСЋ РїРѕ parentId РµСЃР»Рё СѓРєР°Р·Р°РЅ
    if (req.query.parentId) {
      whereClause.parentId = parseInt(req.query.parentId);
    }
    
    const categories = await prisma.category.findMany({ 
      where: whereClause,
      orderBy: { order: 'asc' }
    });

    // Р¤СѓРЅРєС†РёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ fallback РёРєРѕРЅРєРё РїРѕ РЅР°Р·РІР°РЅРёСЋ РєР°С‚РµРіРѕСЂРёРё
    const getCategoryIcon = (categoryName) => {
      const iconMap = {
        'РРіСЂСѓС€РєРё': '/toys.png',
        'РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂС‹': '/constructor.png',
        'РџР°Р·Р»С‹': '/puzzle.png',
        'РўРІРѕСЂС‡РµСЃС‚РІРѕ': '/creativity.png',
        'РљР°РЅС†С‚РѕРІР°СЂС‹': '/stationery.png',
        'РўСЂР°РЅСЃРїРѕСЂС‚': '/bicycle.png',
        'РћС‚РґС‹С… РЅР° РІРѕРґРµ': '/voda.png',
        'РќР°СЃС‚РѕР»СЊРЅС‹Рµ РёРіСЂС‹': '/nastolka.png',
        'Р Р°Р·РІРёРІР°СЋС‰РёРµ РёРіСЂС‹': '/edu_game.png',
        'РђРєС†РёРё': '/sale.png'
      };
      return iconMap[categoryName] || '/toys.png';
    };

    // Р”РѕР±Р°РІР»СЏРµРј fallback РёРєРѕРЅРєРё РґР»СЏ РєР°С‚РµРіРѕСЂРёР№ Р±РµР· РёР·РѕР±СЂР°Р¶РµРЅРёР№
    const categoriesWithIcons = categories.map(category => ({
      ...category,
      image: category.image || getCategoryIcon(category.name)
    }));

    res.json(categoriesWithIcons);
  } catch (e) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёР№' });
  }
});

// РџРѕР»СѓС‡РёС‚СЊ РїР°Р»РёС‚СЂСѓ С†РІРµС‚РѕРІ РґР»СЏ С‚РѕРІР°СЂРѕРІ
app.get('/api/color-palette', (req, res) => {
  try {
    res.json(COLOR_PALETTE);
  } catch (error) {
    console.error('Error getting color palette:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РїР°Р»РёС‚СЂС‹ С†РІРµС‚РѕРІ' });
  }
});

// РџРѕР»СѓС‡РёС‚СЊ РІСЃРµ РєР°С‚РµРіРѕСЂРёРё (РІРєР»СЋС‡Р°СЏ РѕС‚РєР»СЋС‡РµРЅРЅС‹Рµ) РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂРѕРІ
app.get('/api/admin/categories', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });

    // Р¤СѓРЅРєС†РёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ fallback РёРєРѕРЅРєРё РїРѕ РЅР°Р·РІР°РЅРёСЋ РєР°С‚РµРіРѕСЂРёРё
    const getCategoryIcon = (categoryName) => {
      const iconMap = {
        'РРіСЂСѓС€РєРё': '/toys.png',
        'РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂС‹': '/constructor.png',
        'РџР°Р·Р»С‹': '/puzzle.png',
        'РўРІРѕСЂС‡РµСЃС‚РІРѕ': '/creativity.png',
        'РљР°РЅС†С‚РѕРІР°СЂС‹': '/stationery.png',
        'РўСЂР°РЅСЃРїРѕСЂС‚': '/bicycle.png',
        'РћС‚РґС‹С… РЅР° РІРѕРґРµ': '/voda.png',
        'РќР°СЃС‚РѕР»СЊРЅС‹Рµ РёРіСЂС‹': '/nastolka.png',
        'Р Р°Р·РІРёРІР°СЋС‰РёРµ РёРіСЂС‹': '/edu_game.png',
        'РђРєС†РёРё': '/sale.png'
      };
      return iconMap[categoryName] || '/toys.png';
    };

    // Р”РѕР±Р°РІР»СЏРµРј fallback РёРєРѕРЅРєРё РґР»СЏ РєР°С‚РµРіРѕСЂРёР№ Р±РµР· РёР·РѕР±СЂР°Р¶РµРЅРёР№
    const categoriesWithIcons = categories.map(category => ({
      ...category,
      image: category.image || getCategoryIcon(category.name)
    }));

    res.json(categoriesWithIcons);
  } catch (e) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёР№' });
  }
});

app.patch('/api/categories/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    const id = Number(req.params.id);
    console.log('API: Toggle РєР°С‚РµРіРѕСЂРёРё ID:', id);
    
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      console.log('API: РљР°С‚РµРіРѕСЂРёСЏ РЅРµ РЅР°Р№РґРµРЅР° ID:', id);
      return res.status(404).json({ error: 'РљР°С‚РµРіРѕСЂРёСЏ РЅРµ РЅР°Р№РґРµРЅР°' });
    }
    
    console.log('API: РўРµРєСѓС‰РµРµ СЃРѕСЃС‚РѕСЏРЅРёРµ РєР°С‚РµРіРѕСЂРёРё:', category.name, 'active:', category.active);
    const newActiveState = !category.active;
    console.log('API: РќРѕРІРѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ active:', newActiveState);
    
    const updated = await prisma.category.update({
      where: { id },
      data: { active: newActiveState }
    });
    
    console.log('API: РљР°С‚РµРіРѕСЂРёСЏ РѕР±РЅРѕРІР»РµРЅР°:', updated.name, 'active:', updated.active);
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РѕР±РЅРѕРІР»РµРЅРёРµ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ РїСЂРѕРёР·РѕС€Р»Рѕ
    const verification = await prisma.category.findUnique({ where: { id } });
    console.log('API: РџСЂРѕРІРµСЂРєР° РїРѕСЃР»Рµ РѕР±РЅРѕРІР»РµРЅРёСЏ:', verification.name, 'active:', verification.active);
    
    res.json(updated);
  } catch (e) {
    console.error('API: РћС€РёР±РєР° toggle РєР°С‚РµРіРѕСЂРёРё:', e);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёРё' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: 'РљР°С‚РµРіРѕСЂРёСЏ РЅРµ РЅР°Р№РґРµРЅР°' });
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёРё' });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёРё' });
  }
});

// РћР±РЅРѕРІР»РµРЅРёРµ РїРѕСЂСЏРґРєР° РєР°С‚РµРіРѕСЂРёР№
app.put('/api/categories/reorder', authMiddleware, async (req, res) => {
  try {

    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {

      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    const { categoryIds } = req.body; // РјР°СЃСЃРёРІ ID РєР°С‚РµРіРѕСЂРёР№ РІ РЅРѕРІРѕРј РїРѕСЂСЏРґРєРµ
    
    
    if (!Array.isArray(categoryIds)) {
      
      return res.status(400).json({ error: 'categoryIds РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјР°СЃСЃРёРІРѕРј' });
    }
    
    
    
    // РћР±РЅРѕРІР»СЏРµРј РїРѕСЂСЏРґРѕРє РєР°С‚РµРіРѕСЂРёР№
    for (let i = 0; i < categoryIds.length; i++) {
      const categoryId = Number(categoryIds[i]);
      
      
      await prisma.category.update({
        where: { id: categoryId },
        data: { order: i }
      });
    }
    
    
    res.json({ success: true, message: 'РџРѕСЂСЏРґРѕРє РєР°С‚РµРіРѕСЂРёР№ РѕР±РЅРѕРІР»РµРЅ' });
  } catch (e) {
    console.error('РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ РїРѕСЂСЏРґРєР° РєР°С‚РµРіРѕСЂРёР№:', e);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ РїРѕСЂСЏРґРєР° РєР°С‚РµРіРѕСЂРёР№' });
  }
});

app.put('/api/categories/:id', authMiddleware, upload.single('image'), productionUploadMiddleware.processSingleImage.bind(productionUploadMiddleware), async (req, res) => {
  try {
    console.log('рџљЂрџљЂрџљЂ PUT /api/categories/:id - РќР°С‡Р°Р»Рѕ РѕР±СЂР°Р±РѕС‚РєРё Р·Р°РїСЂРѕСЃР°');
    console.log('рџ“Ґ req.body:', req.body);
    console.log('рџ“Ѓ req.file:', req.file);
    console.log('рџ–јпёЏ req.processedFile:', req.processedFile);
    console.log('рџ”— req.imageUrl:', req.imageUrl);
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      console.log('вќЊ Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ Р°РґРјРёРЅ');
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    const id = Number(req.params.id);
    const { name, parentId } = req.body;
    const data = { name };
    
    if (parentId !== undefined && parentId !== null && parentId !== '') {
      data.parentId = Number(parentId);
    } else {
      data.parentId = null;
    }
    
    // Р•СЃР»Рё Р·Р°РіСЂСѓР¶РµРЅРѕ РЅРѕРІРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ, РґРѕР±Р°РІР»СЏРµРј РµРіРѕ РІ РґР°РЅРЅС‹Рµ
    if (req.file) {
      data.image = req.file.filename;
      console.log('вњ… API: РћР±РЅРѕРІР»РµРЅРёРµ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёРё:', req.file.filename);
    } else {
      console.log('вљ пёЏ API: РќРµС‚ РЅРѕРІРѕРіРѕ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РґР»СЏ РѕР±РЅРѕРІР»РµРЅРёСЏ');
    }
    
    console.log('рџ“ќ API: РћР±РЅРѕРІР»РµРЅРёРµ РєР°С‚РµРіРѕСЂРёРё ID:', id, 'Р”Р°РЅРЅС‹Рµ:', data);
    
    const updated = await prisma.category.update({ where: { id }, data });
    console.log('вњ… API: РљР°С‚РµРіРѕСЂРёСЏ РѕР±РЅРѕРІР»РµРЅР° РІ Р‘Р”:', updated);
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РґР°РЅРЅС‹Рµ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ СЃРѕС…СЂР°РЅРёР»РёСЃСЊ
    const verification = await prisma.category.findUnique({ where: { id } });
    console.log('рџ”Ќ API: РџСЂРѕРІРµСЂРєР° РїРѕСЃР»Рµ РѕР±РЅРѕРІР»РµРЅРёСЏ:', verification);
    
    res.json(updated);
  } catch (e) {
    console.error('вќЊ API: РћС€РёР±РєР° СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ РєР°С‚РµРіРѕСЂРёРё:', e);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ РєР°С‚РµРіРѕСЂРёРё' });
  }
});

app.post('/api/categories', authMiddleware, upload.single('image'), productionUploadMiddleware.processSingleImage.bind(productionUploadMiddleware), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    const { name, parentId } = req.body;
    const data = { name };
    if (parentId !== undefined && parentId !== null && parentId !== '') {
      data.parentId = Number(parentId);
    }
    
    // Р•СЃР»Рё Р·Р°РіСЂСѓР¶РµРЅРѕ РёР·РѕР±СЂР°Р¶РµРЅРёРµ, РґРѕР±Р°РІР»СЏРµРј РµРіРѕ РІ РґР°РЅРЅС‹Рµ
    if (req.file) {
      data.image = req.file.filename;
    }
    
    // РќР°С…РѕРґРёРј РјР°РєСЃРёРјР°Р»СЊРЅС‹Р№ РїРѕСЂСЏРґРѕРє РґР»СЏ РєР°С‚РµРіРѕСЂРёР№ С‚РѕРіРѕ Р¶Рµ СѓСЂРѕРІРЅСЏ
    const maxOrder = await prisma.category.findFirst({
      where: { parentId: data.parentId || null },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    
    const newOrder = (maxOrder?.order || -1) + 1;
    data.order = newOrder;
    
    const category = await prisma.category.create({ data });
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ РєР°С‚РµРіРѕСЂРёРё' });
  }
});

app.patch('/api/categories/:id/image', authMiddleware, upload.single('image'), productionUploadMiddleware.processSingleImage.bind(productionUploadMiddleware), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }
    
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'РќРµС‚ С„Р°Р№Р»Р°' });
    const updated = await prisma.category.update({
      where: { id },
      data: { image: req.file.filename }
    });
    res.json(updated);
  } catch (e) {
    console.error('API: РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёРё:', e);
    res.status(500).json({ error: 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РєР°С‚РµРіРѕСЂРёРё' });
  }
});

// РџРѕР»СѓС‡РёС‚СЊ РѕС‚Р·С‹РІС‹ РїРѕ С‚РѕРІР°СЂСѓ (С‚РѕР»СЊРєРѕ published)
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(req.params.id), status: 'published' },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// РћСЃС‚Р°РІРёС‚СЊ РѕС‚Р·С‹РІ (С‚РѕР»СЊРєРѕ РµСЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р·Р°РєР°Р·С‹РІР°Р» СЌС‚РѕС‚ С‚РѕРІР°СЂ)
app.post('/api/products/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, text } = req.body;
    const productId = parseInt(req.params.id);
    const userId = req.user.userId;
    // РџСЂРѕРІРµСЂСЏРµРј, Р±С‹Р» Р»Рё Р·Р°РєР°Р· СЌС‚РѕРіРѕ С‚РѕРІР°СЂР° СЌС‚РёРј РїРѕР»СЊР·РѕРІР°С‚РµР»РµРј
    const orderWithProduct = await prisma.order.findFirst({
      where: {
        userId,
        items: { some: { productId } }
      }
    });
    if (!orderWithProduct) {
      return res.status(403).json({ error: 'Р’С‹ РјРѕР¶РµС‚Рµ РѕСЃС‚Р°РІРёС‚СЊ РѕС‚Р·С‹РІ С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ РїРѕРєСѓРїРєРё СЌС‚РѕРіРѕ С‚РѕРІР°СЂР°.' });
    }
    // РџСЂРѕРІРµСЂСЏРµРј, РЅРµ РѕСЃС‚Р°РІР»СЏР» Р»Рё СѓР¶Рµ РѕС‚Р·С‹РІ
    const existing = await prisma.review.findFirst({ where: { productId, userId } });
    if (existing) {
      return res.status(400).json({ error: 'Р’С‹ СѓР¶Рµ РѕСЃС‚Р°РІРёР»Рё РѕС‚Р·С‹РІ РЅР° СЌС‚РѕС‚ С‚РѕРІР°СЂ.' });
    }
    const review = await prisma.review.create({
      data: { productId, userId, rating, text, status: 'pending' }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// РџРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕС‚Р·С‹РІС‹ (РґР»СЏ Р°РґРјРёРЅР°, СЃ С„РёР»СЊС‚СЂР°С†РёРµР№ РїРѕ СЃС‚Р°С‚СѓСЃСѓ)
app.get('/api/admin/reviews', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const { status } = req.query;
    const reviews = await prisma.review.findMany({
      where: status ? { status } : {},
      include: { product: true, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// РњРѕРґРµСЂР°С†РёСЏ РѕС‚Р·С‹РІР° (published/rejected)
app.put('/api/admin/reviews/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const { status } = req.body; // 'published' РёР»Рё 'rejected'
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ СЃС‚Р°С‚СѓСЃ' });
    }
    const review = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    res.json(review);
  } catch (error) {
    console.error('Error moderating review:', error);
    res.status(500).json({ error: 'Failed to moderate review' });
  }
});

// === РџРѕР»СѓС‡РёС‚СЊ РёР·Р±СЂР°РЅРЅРѕРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ===
app.get('/api/profile/wishlist', authMiddleware, async (req, res) => {
  try {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.userId },
      include: { items: { include: { product: true } } }
    });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: req.user.userId } });
      wishlist.items = [];
    }
    res.json(wishlist);
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РёР·Р±СЂР°РЅРЅРѕРіРѕ' });
  }
});

// === Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ РІ РёР·Р±СЂР°РЅРЅРѕРµ ===
app.post('/api/profile/wishlist/add', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: req.user.userId } });
    }
    const existing = await prisma.wishlistItem.findFirst({ where: { wishlistId: wishlist.id, productId } });
    if (existing) return res.status(400).json({ error: 'РўРѕРІР°СЂ СѓР¶Рµ РІ РёР·Р±СЂР°РЅРЅРѕРј' });
    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
    const updated = await prisma.wishlist.findUnique({ where: { id: wishlist.id }, include: { items: { include: { product: true } } } });
    res.json(updated);
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РґРѕР±Р°РІР»РµРЅРёСЏ РІ РёР·Р±СЂР°РЅРЅРѕРµ' });
  }
});

// === РЈРґР°Р»РёС‚СЊ С‚РѕРІР°СЂ РёР· РёР·Р±СЂР°РЅРЅРѕРіРѕ ===
app.post('/api/profile/wishlist/remove', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.userId } });
    if (!wishlist) return res.status(404).json({ error: 'РР·Р±СЂР°РЅРЅРѕРµ РЅРµ РЅР°Р№РґРµРЅРѕ' });
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
    const updated = await prisma.wishlist.findUnique({ where: { id: wishlist.id }, include: { items: { include: { product: true } } } });
    res.json(updated);
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РёР· РёР·Р±СЂР°РЅРЅРѕРіРѕ' });
  }
});

// === РћС‡РёСЃС‚РёС‚СЊ РІРµСЃСЊ СЃРїРёСЃРѕРє РёР·Р±СЂР°РЅРЅРѕРіРѕ ===
app.post('/api/profile/wishlist/clear', authMiddleware, async (req, res) => {
  try {
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.userId } });
    if (!wishlist) {
      // Р•СЃР»Рё wishlist РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚, СЃРѕР·РґР°РµРј РїСѓСЃС‚РѕР№
      wishlist = await prisma.wishlist.create({ data: { userId: req.user.userId } });
    } else {
      // РЈРґР°Р»СЏРµРј РІСЃРµ С‚РѕРІР°СЂС‹ РёР· wishlist
      await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });
    }
    
    // Р’РѕР·РІСЂР°С‰Р°РµРј РїСѓСЃС‚РѕР№ wishlist
    const updated = await prisma.wishlist.findUnique({ 
      where: { id: wishlist.id }, 
      include: { items: { include: { product: true } } } 
    });
    res.json(updated);
  } catch (error) {
    console.error('Wishlist clear error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС‡РёСЃС‚РєРё РёР·Р±СЂР°РЅРЅРѕРіРѕ' });
  }
});

// === РЎРјРµРЅР° РїР°СЂРѕР»СЏ ===
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'РќРѕРІС‹Р№ РїР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'РќРѕРІС‹Р№ РїР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј 6 СЃРёРјРІРѕР»РѕРІ' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё Сѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїР°СЂРѕР»СЊ (РЅРµ OAuth РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ)
    if (user.passwordHash) {
      // РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ РїР°СЂРѕР»РµРј - РїСЂРѕРІРµСЂСЏРµРј С‚РµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ
      if (!currentPassword) {
        return res.status(400).json({ error: 'РўРµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»РµРЅ РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ СЃ РїР°СЂРѕР»РµРј' });
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'РќРµРІРµСЂРЅС‹Р№ С‚РµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ' });
      }
    } else {
      // OAuth РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ (Google/Facebook) - РЅРµ РїСЂРѕРІРµСЂСЏРµРј С‚РµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ
      if (currentPassword) {
        return res.status(400).json({ error: 'Р”Р»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ СЃ OAuth С‚РµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ РЅРµ С‚СЂРµР±СѓРµС‚СЃСЏ' });
      }
    }
    
    // РҐРµС€РёСЂСѓРµРј РЅРѕРІС‹Р№ РїР°СЂРѕР»СЊ
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // РћР±РЅРѕРІР»СЏРµРј РїР°СЂРѕР»СЊ
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });
    
    res.json({ message: 'РџР°СЂРѕР»СЊ СѓСЃРїРµС€РЅРѕ РёР·РјРµРЅРµРЅ' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃРјРµРЅС‹ РїР°СЂРѕР»СЏ' });
  }
});

// === Admin: РїРѕР»СѓС‡РёС‚СЊ РІСЃРµС… РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ ===
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№' });
  }
});

// === Admin: СѓРґР°Р»РёС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ===
app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  const userId = parseInt(req.params.id);
  if (userId === admin.id) {
    return res.status(400).json({ error: 'РќРµР»СЊР·СЏ СѓРґР°Р»РёС‚СЊ СЃР°РјРѕРіРѕ СЃРµР±СЏ' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ error: 'РќРµР»СЊР·СЏ СѓРґР°Р»РёС‚СЊ РґСЂСѓРіРѕРіРѕ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  try {
    console.log(`рџ—‘пёЏ Admin: Starting deletion of user ${userId}`);
    
    // РЈРґР°Р»СЏРµРј РІСЃРµ СЃРІСЏР·Р°РЅРЅС‹Рµ Р·Р°РїРёСЃРё РІ РїСЂР°РІРёР»СЊРЅРѕРј РїРѕСЂСЏРґРєРµ
    
    // 1. РЈРґР°Р»СЏРµРј СЌР»РµРјРµРЅС‚С‹ РєРѕСЂР·РёРЅС‹
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: userId
        }
      }
    });
    console.log(`рџ—‘пёЏ Admin: Deleted cart items for user ${userId}`);
    
    // 2. РЈРґР°Р»СЏРµРј РєРѕСЂР·РёРЅСѓ
    await prisma.cart.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted cart for user ${userId}`);
    
    // 3. РЈРґР°Р»СЏРµРј СЌР»РµРјРµРЅС‚С‹ wishlist
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlist: {
          userId: userId
        }
      }
    });
    console.log(`рџ—‘пёЏ Admin: Deleted wishlist items for user ${userId}`);
    
    // 4. РЈРґР°Р»СЏРµРј wishlist
    await prisma.wishlist.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted wishlist for user ${userId}`);
    
    // 5. РЈРґР°Р»СЏРµРј СЃРєСЂС‹С‚С‹Рµ РѕС‚Р·С‹РІС‹ (HiddenReview)
    await prisma.hiddenReview.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted hidden reviews for user ${userId}`);
    
    // 6. РЈРґР°Р»СЏРµРј СЃРєСЂС‹С‚С‹Рµ РѕС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ (HiddenShopReview)
    await prisma.hiddenShopReview.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted hidden shop reviews for user ${userId}`);
    
    // 7. РЈРґР°Р»СЏРµРј СЃРєСЂС‹С‚С‹Рµ Р·Р°РєР°Р·С‹ (UserHiddenOrder)
    await prisma.userHiddenOrder.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted hidden orders for user ${userId}`);
    
    // 8. РЈРґР°Р»СЏРµРј РѕС‚Р·С‹РІС‹ Рѕ С‚РѕРІР°СЂР°С…
    await prisma.review.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted product reviews for user ${userId}`);
    
    // 9. РЈРґР°Р»СЏРµРј РІРѕРїСЂРѕСЃС‹ Рѕ С‚РѕРІР°СЂР°С…
    await prisma.productQuestion.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted product questions for user ${userId}`);
    
    // 10. РЈРґР°Р»СЏРµРј РѕС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ
    await prisma.shopReview.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted shop reviews for user ${userId}`);
    
    // 11. РЈРґР°Р»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёСЏ
    await prisma.notification.deleteMany({ where: { userId: userId } });
    console.log(`рџ—‘пёЏ Admin: Deleted notifications for user ${userId}`);
    
    // 12. РћР±РЅСѓР»СЏРµРј userId РІ Р·Р°РєР°Р·Р°С… (Р·Р°РєР°Р·С‹ РѕСЃС‚Р°РІР»СЏРµРј РґР»СЏ РёСЃС‚РѕСЂРёРё)
    await prisma.order.updateMany({
      where: { userId: userId },
      data: { userId: null }
    });
    console.log(`рџ—‘пёЏ Admin: Nullified userId in orders for user ${userId}`);
    
    // 13. РќР°РєРѕРЅРµС†, СѓРґР°Р»СЏРµРј СЃР°РјРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    await prisma.user.delete({ where: { id: userId } });
    console.log(`вњ… Admin: Successfully deleted user ${userId}`);
    
    res.json({ message: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СѓРґР°Р»С‘РЅ' });
  } catch (error) {
    console.error('вќЊ Admin user delete error:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ: ' + error.message });
  }
});

// === Admin: РѕС‚РїСЂР°РІРёС‚СЊ СѓРІРµРґРѕРјР»РµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ ===
app.post('/api/admin/users/:id/notify', authMiddleware, async (req, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  const userId = parseInt(req.params.id);
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'РўРµРєСЃС‚ СѓРІРµРґРѕРјР»РµРЅРёСЏ РѕР±СЏР·Р°С‚РµР»РµРЅ' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ' });
  }
  // РЎРѕР·РґР°С‘Рј СѓРІРµРґРѕРјР»РµРЅРёРµ РІ Р±Р°Р·Рµ
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'admin',
      title: 'РЎРѕРѕР±С‰РµРЅРёРµ РѕС‚ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°',
      message: message,
      isRead: false
    }
  });
  res.json({ success: true });
});

// === РџРѕР»СѓС‡РёС‚СЊ СѓРІРµРґРѕРјР»РµРЅРёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ===
app.get('/api/profile/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error('РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ СѓРІРµРґРѕРјР»РµРЅРёР№:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ СѓРІРµРґРѕРјР»РµРЅРёР№' });
  }
});

// === РџРѕР»СѓС‡РёС‚СЊ РєРѕР»РёС‡РµСЃС‚РІРѕ РЅРµРїСЂРѕС‡РёС‚Р°РЅРЅС‹С… СѓРІРµРґРѕРјР»РµРЅРёР№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ===
app.get('/api/profile/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { 
        userId: req.user.userId,
        isRead: false
      }
    });
    res.json({ count });
  } catch (error) {
    console.error('РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° РЅРµРїСЂРѕС‡РёС‚Р°РЅРЅС‹С… СѓРІРµРґРѕРјР»РµРЅРёР№:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° РЅРµРїСЂРѕС‡РёС‚Р°РЅРЅС‹С… СѓРІРµРґРѕРјР»РµРЅРёР№' });
  }
});

// === РЈРґР°Р»РёС‚СЊ РѕРґРЅРѕ СѓРІРµРґРѕРјР»РµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ===
app.delete('/api/profile/notifications/:id', authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ id СѓРІРµРґРѕРјР»РµРЅРёСЏ' });
    }
    // РЈРґР°Р»СЏРµРј С‚РѕР»СЊРєРѕ РµСЃР»Рё СѓРІРµРґРѕРјР»РµРЅРёРµ РїСЂРёРЅР°РґР»РµР¶РёС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ
    const deleted = await prisma.notification.deleteMany({
      where: { id: notificationId, userId: req.user.userId }
    });
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'РЈРІРµРґРѕРјР»РµРЅРёРµ РЅРµ РЅР°Р№РґРµРЅРѕ' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ СѓРІРµРґРѕРјР»РµРЅРёСЏ:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ СѓРІРµРґРѕРјР»РµРЅРёСЏ' });
  }
});

// === РЈРґР°Р»РёС‚СЊ РІСЃРµ СѓРІРµРґРѕРјР»РµРЅРёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ ===
app.delete('/api/profile/notifications', authMiddleware, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.userId }
    });
    res.json({ message: 'Р’СЃРµ СѓРІРµРґРѕРјР»РµРЅРёСЏ СѓРґР°Р»РµРЅС‹' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ СѓРІРµРґРѕРјР»РµРЅРёР№' });
  }
});





process.on('SIGINT', async () => {

  await prisma.$disconnect();
  process.exit(0);
});

// POST /api/reviews/shop вЂ” СЃРѕР·РґР°С‚СЊ РѕС‚Р·С‹РІ Рѕ РјР°РіР°Р·РёРЅРµ
app.post('/api/reviews/shop', authMiddleware, async (req, res) => {
  try {
    const { orderId, rating, text } = req.body;
    console.log('Shop review request:', { orderId, rating, text, userId: req.user.userId });
    
    if (!orderId || !rating) {
      console.log('Missing required fields:', { orderId, rating });
      return res.status(400).json({ error: 'orderId Рё rating РѕР±СЏР·Р°С‚РµР»СЊРЅС‹' });
    }
    
    // РџСЂРµРѕР±СЂР°Р·СѓРµРј С‚РёРїС‹
    const parsedOrderId = parseInt(orderId);
    const parsedRating = parseInt(rating);
    
    console.log('Parsed values:', { parsedOrderId, parsedRating });
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ РґРµР»Р°Р» СЌС‚РѕС‚ Р·Р°РєР°Р·
    const order = await prisma.order.findUnique({ where: { id: parsedOrderId } });
    console.log('Order found:', order ? { id: order.id, userId: order.userId } : null);
    
    if (!order || order.userId !== req.user.userId) {
      console.log('Access denied: order not found or user mismatch');
      return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР° Рє Р·Р°РєР°Р·Сѓ' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РѕС‚Р·С‹РІ РїРѕ СЌС‚РѕРјСѓ Р·Р°РєР°Р·Сѓ РµС‰С‘ РЅРµ РѕСЃС‚Р°РІР»РµРЅ
    const existing = await prisma.shopReview.findFirst({ where: { orderId: parsedOrderId, userId: req.user.userId } });
    console.log('Existing shop review check:', existing ? { id: existing.id } : 'No existing review');
    
    if (existing) {
      console.log('Shop review already exists');
      return res.status(400).json({ error: 'РћС‚Р·С‹РІ РїРѕ СЌС‚РѕРјСѓ Р·Р°РєР°Р·Сѓ СѓР¶Рµ РѕСЃС‚Р°РІР»РµРЅ' });
    }
    
    const review = await prisma.shopReview.create({
      data: {
        userId: req.user.userId,
        orderId: parsedOrderId,
        rating: parsedRating,
        text: text,
        status: 'pending'
      }
    });
    
    console.log('Shop review created successfully:', { id: review.id });
    res.json(review);
  } catch (error) {
    console.error('Error creating shop review:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ РѕС‚Р·С‹РІР° Рѕ РјР°РіР°Р·РёРЅРµ' });
  }
});

// GET /api/reviews/shop/published вЂ” РїРѕР»СѓС‡РёС‚СЊ С‚РѕР»СЊРєРѕ РѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ РѕС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ
app.get('/api/reviews/shop/published', async (req, res) => {
  try {
    const reviews = await prisma.shopReview.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, surname: true } } }
    });

    res.json(reviews);
  } catch (error) {
    console.error('API: РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹С… РѕС‚Р·С‹РІРѕРІ Рѕ РјР°РіР°Р·РёРЅРµ:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ РјР°РіР°Р·РёРЅРµ' });
  }
});

// GET /api/reviews/shop вЂ” РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ (РґР»СЏ РјРѕРґРµСЂР°С†РёРё)
app.get('/api/reviews/shop', async (req, res) => {
  try {
    // РџСЂРѕРІРµСЂСЏРµРј, СЏРІР»СЏРµС‚СЃСЏ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р°РґРјРёРЅРѕРј
    const token = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        isAdmin = user?.role === 'admin';
      } catch (error) {
        console.log('Token verification failed:', error.message);
      }
    }

    const whereClause = isAdmin ? {} : { status: 'published' };
    
    const reviews = await prisma.shopReview.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, surname: true } } }
    });

    res.json(reviews);
  } catch (error) {
    console.error('API: РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ РјР°РіР°Р·РёРЅРµ:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ РјР°РіР°Р·РёРЅРµ' });
  }
});

// PUT /api/admin/reviews/shop/:id вЂ” РјРѕРґРµСЂР°С†РёСЏ РѕС‚Р·С‹РІР° Рѕ РјР°РіР°Р·РёРЅРµ
app.put('/api/admin/reviews/shop/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Shop review moderation request:', { 
      reviewId: req.params.id, 
      status: req.body.status, 
      body: req.body,
      userId: req.user.userId,
      userRole: req.user.role 
    });
    
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР°' });
    const { status } = req.body;
    console.log('Validating shop review status:', status, 'Valid statuses:', ['published', 'rejected', 'pending', 'hidden']);
    if (!['published', 'rejected', 'pending', 'hidden'].includes(status)) {
      console.log('Invalid shop review status:', status);
      return res.status(400).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ СЃС‚Р°С‚СѓСЃ' });
    }
    
    const review = await prisma.shopReview.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    
    console.log('Shop review updated successfully:', { id: review.id, status: review.status });
    res.json(review);
  } catch (error) {
    console.error('Error updating shop review:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РјРѕРґРµСЂР°С†РёРё РѕС‚Р·С‹РІР° Рѕ РјР°РіР°Р·РёРЅРµ' });
  }
});

// DELETE /api/admin/reviews/shop/:id вЂ” СѓРґР°Р»РµРЅРёРµ РѕС‚Р·С‹РІР° Рѕ РјР°РіР°Р·РёРЅРµ
app.delete('/api/admin/reviews/shop/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР°' });
    await prisma.shopReview.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'РћС‚Р·С‹РІ Рѕ РјР°РіР°Р·РёРЅРµ СѓРґР°Р»РµРЅ' });
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РѕС‚Р·С‹РІР° Рѕ РјР°РіР°Р·РёРЅРµ' });
  }
});

// POST /api/reviews/product вЂ” СЃРѕР·РґР°С‚СЊ РѕС‚Р·С‹РІ Рѕ С‚РѕРІР°СЂРµ
app.post('/api/reviews/product', authMiddleware, async (req, res) => {
  try {
    const { orderId, productId, rating, text } = req.body;
    console.log('Product review request:', { orderId, productId, rating, text, userId: req.user.userId });
    
    if (!orderId || !productId || !rating) {
      console.log('Missing required fields:', { orderId, productId, rating });
      return res.status(400).json({ error: 'orderId, productId Рё rating РѕР±СЏР·Р°С‚РµР»СЊРЅС‹' });
    }
    
    // РџСЂРµРѕР±СЂР°Р·СѓРµРј С‚РёРїС‹
    const parsedOrderId = parseInt(orderId);
    const parsedProductId = parseInt(productId);
    const parsedRating = parseInt(rating);
    
    console.log('Parsed values:', { parsedOrderId, parsedProductId, parsedRating });
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ Р·Р°РєР°Р·С‹РІР°Р» СЌС‚РѕС‚ С‚РѕРІР°СЂ
    const order = await prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: { items: true }
    });
    
    console.log('Order found:', order ? { id: order.id, userId: order.userId, itemsCount: order.items.length } : null);
    
    if (!order || order.userId !== req.user.userId) {
      console.log('Access denied: order not found or user mismatch');
      return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР° Рє Р·Р°РєР°Р·Сѓ' });
    }
    
    const hasProduct = order.items.some(item => item.productId === parsedProductId);
    console.log('Product check:', { hasProduct, orderItems: order.items.map(item => ({ productId: item.productId, quantity: item.quantity })) });
    
    if (!hasProduct) {
      console.log('Product not found in order');
      return res.status(400).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ РІ Р·Р°РєР°Р·Рµ' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РѕС‚Р·С‹РІ РїРѕ СЌС‚РѕРјСѓ С‚РѕРІР°СЂСѓ Рё Р·Р°РєР°Р·Сѓ РµС‰С‘ РЅРµ РѕСЃС‚Р°РІР»РµРЅ
    const existing = await prisma.review.findFirst({ 
      where: { orderId: parsedOrderId, productId: parsedProductId, userId: req.user.userId } 
    });
    
    console.log('Existing review check:', existing ? { id: existing.id } : 'No existing review');
    
    if (existing) {
      console.log('Review already exists');
      return res.status(400).json({ error: 'РћС‚Р·С‹РІ РїРѕ СЌС‚РѕРјСѓ С‚РѕРІР°СЂСѓ СѓР¶Рµ РѕСЃС‚Р°РІР»РµРЅ' });
    }
    
    const review = await prisma.review.create({
      data: {
        userId: req.user.userId,
        productId: parsedProductId,
        orderId: parsedOrderId,
        rating: parsedRating,
        text: text,
        status: 'pending'
      }
    });
    
    console.log('Review created successfully:', { id: review.id });
    res.json(review);
  } catch (error) {
    console.error('Error creating product review:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ РѕС‚Р·С‹РІР° Рѕ С‚РѕРІР°СЂРµ' });
  }
});

// GET /api/reviews/product/:productId вЂ” РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ РѕС‚Р·С‹РІС‹ Рѕ С‚РѕРІР°СЂРµ
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const reviews = await prisma.review.findMany({
      where: { productId, status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, surname: true } } }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ С‚РѕРІР°СЂРµ' });
  }
});

// GET /api/admin/reviews/product вЂ” РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕС‚Р·С‹РІС‹ Рѕ С‚РѕРІР°СЂР°С… РґР»СЏ CMS
app.get('/api/admin/reviews/product', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР°' });
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, surname: true, email: true } }, product: { select: { name: true } } }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ С‚РѕРІР°СЂР°С…' });
  }
});

// PUT /api/admin/reviews/product/:id вЂ” РјРѕРґРµСЂР°С†РёСЏ РѕС‚Р·С‹РІР° Рѕ С‚РѕРІР°СЂРµ
app.put('/api/admin/reviews/product/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Product review moderation request:', { 
      reviewId: req.params.id, 
      status: req.body.status, 
      body: req.body,
      userId: req.user.userId,
      userRole: req.user.role 
    });
    
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР°' });
    const { status } = req.body;
    console.log('Validating product review status:', status, 'Valid statuses:', ['published', 'rejected', 'pending', 'hidden']);
    if (!['published', 'rejected', 'pending', 'hidden'].includes(status)) {
      console.log('Invalid product review status:', status);
      return res.status(400).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ СЃС‚Р°С‚СѓСЃ' });
    }
    
    const review = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    
    console.log('Product review updated successfully:', { id: review.id, status: review.status });
    res.json(review);
  } catch (error) {
    console.error('Error updating product review:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РјРѕРґРµСЂР°С†РёРё РѕС‚Р·С‹РІР° Рѕ С‚РѕРІР°СЂРµ' });
  }
});

// DELETE /api/admin/reviews/product/:id вЂ” СѓРґР°Р»РµРЅРёРµ РѕС‚Р·С‹РІР° Рѕ С‚РѕРІР°СЂРµ
app.delete('/api/admin/reviews/product/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР°' });
    await prisma.review.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'РћС‚Р·С‹РІ Рѕ С‚РѕРІР°СЂРµ СѓРґР°Р»РµРЅ' });
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РѕС‚Р·С‹РІР° Рѕ С‚РѕРІР°СЂРµ' });
  }
});

// GET /api/profile/reviews/shop вЂ” РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕС‚Р·С‹РІС‹ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ Рѕ РјР°РіР°Р·РёРЅРµ (РёСЃРєР»СЋС‡Р°СЏ СЃРєСЂС‹С‚С‹Рµ)
app.get('/api/profile/reviews/shop', authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.shopReview.findMany({
      where: { 
        userId: req.user.userId,
        // РСЃРєР»СЋС‡Р°РµРј СЃРєСЂС‹С‚С‹Рµ РѕС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ
        NOT: {
          hiddenBy: {
            some: {
              userId: req.user.userId
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ РјР°РіР°Р·РёРЅРµ' });
  }
});

// GET /api/profile/reviews/product вЂ” РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕС‚Р·С‹РІС‹ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ Рѕ С‚РѕРІР°СЂР°С… (РёСЃРєР»СЋС‡Р°СЏ СЃРєСЂС‹С‚С‹Рµ)
app.get('/api/profile/reviews/product', authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { 
        userId: req.user.userId,
        // РџРѕРєР°Р·С‹РІР°РµРј РІСЃРµ РѕС‚Р·С‹РІС‹ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ (РЅРµ С‚РѕР»СЊРєРѕ РѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ)
        // РСЃРєР»СЋС‡Р°РµРј СЃРєСЂС‹С‚С‹Рµ РѕС‚Р·С‹РІС‹
        NOT: {
          hiddenBy: {
            some: {
              userId: req.user.userId
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true, imageUrls: true } } }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ С‚РѕРІР°СЂР°С…' });
  }
});

// POST /api/profile/reviews/product/:id/hide вЂ” СЃРєСЂС‹С‚СЊ РѕС‚Р·С‹РІ РёР· СЃРїРёСЃРєР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
app.post('/api/profile/reviews/product/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РѕС‚Р·С‹РІ РїСЂРёРЅР°РґР»РµР¶РёС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: req.user.userId
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'РћС‚Р·С‹РІ РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    // РЎРѕР·РґР°РµРј Р·Р°РїРёСЃСЊ Рѕ СЃРєСЂС‹С‚РѕРј РѕС‚Р·С‹РІРµ
    await prisma.hiddenReview.create({
      data: {
        userId: req.user.userId,
        reviewId: reviewId
      }
    });
    
    res.json({ message: 'РћС‚Р·С‹РІ СЃРєСЂС‹С‚ РёР· СЃРїРёСЃРєР°' });
  } catch (error) {
    if (error.code === 'P2002') {
      // РћС‚Р·С‹РІ СѓР¶Рµ СЃРєСЂС‹С‚
      res.json({ message: 'РћС‚Р·С‹РІ СѓР¶Рµ СЃРєСЂС‹С‚' });
    } else {
      res.status(500).json({ error: 'РћС€РёР±РєР° СЃРєСЂС‹С‚РёСЏ РѕС‚Р·С‹РІР°' });
    }
  }
});

// DELETE /api/profile/reviews/product/:id/hide вЂ” РїРѕРєР°Р·Р°С‚СЊ РѕС‚Р·С‹РІ РІ СЃРїРёСЃРєРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
app.delete('/api/profile/reviews/product/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // РЈРґР°Р»СЏРµРј Р·Р°РїРёСЃСЊ Рѕ СЃРєСЂС‹С‚РѕРј РѕС‚Р·С‹РІРµ
    await prisma.hiddenReview.deleteMany({
      where: {
        userId: req.user.userId,
        reviewId: reviewId
      }
    });
    
    res.json({ message: 'РћС‚Р·С‹РІ РїРѕРєР°Р·Р°РЅ РІ СЃРїРёСЃРєРµ' });
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕРєР°Р·Р° РѕС‚Р·С‹РІР°' });
  }
});

// POST /api/profile/reviews/shop/:id/hide вЂ” СЃРєСЂС‹С‚СЊ РѕС‚Р·С‹РІ Рѕ РјР°РіР°Р·РёРЅРµ РёР· СЃРїРёСЃРєР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
app.post('/api/profile/reviews/shop/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РѕС‚Р·С‹РІ РїСЂРёРЅР°РґР»РµР¶РёС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ
    const review = await prisma.shopReview.findFirst({
      where: {
        id: reviewId,
        userId: req.user.userId
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'РћС‚Р·С‹РІ РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    // РЎРѕР·РґР°РµРј Р·Р°РїРёСЃСЊ Рѕ СЃРєСЂС‹С‚РѕРј РѕС‚Р·С‹РІРµ Рѕ РјР°РіР°Р·РёРЅРµ
    await prisma.hiddenShopReview.create({
      data: {
        userId: req.user.userId,
        shopReviewId: reviewId
      }
    });
    
    res.json({ message: 'РћС‚Р·С‹РІ Рѕ РјР°РіР°Р·РёРЅРµ СЃРєСЂС‹С‚ РёР· СЃРїРёСЃРєР°' });
  } catch (error) {
    if (error.code === 'P2002') {
      // РћС‚Р·С‹РІ СѓР¶Рµ СЃРєСЂС‹С‚
      res.json({ message: 'РћС‚Р·С‹РІ Рѕ РјР°РіР°Р·РёРЅРµ СѓР¶Рµ СЃРєСЂС‹С‚' });
    } else {
      res.status(500).json({ error: 'РћС€РёР±РєР° СЃРєСЂС‹С‚РёСЏ РѕС‚Р·С‹РІР° Рѕ РјР°РіР°Р·РёРЅРµ' });
    }
  }
});

// DELETE /api/profile/reviews/shop/:id/hide вЂ” РїРѕРєР°Р·Р°С‚СЊ РѕС‚Р·С‹РІ Рѕ РјР°РіР°Р·РёРЅРµ РІ СЃРїРёСЃРєРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
app.delete('/api/profile/reviews/shop/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // РЈРґР°Р»СЏРµРј Р·Р°РїРёСЃСЊ Рѕ СЃРєСЂС‹С‚РѕРј РѕС‚Р·С‹РІРµ Рѕ РјР°РіР°Р·РёРЅРµ
    await prisma.hiddenShopReview.deleteMany({
      where: {
        userId: req.user.userId,
        shopReviewId: reviewId
      }
    });
    
    res.json({ message: 'РћС‚Р·С‹РІ Рѕ РјР°РіР°Р·РёРЅРµ РїРѕРєР°Р·Р°РЅ РІ СЃРїРёСЃРєРµ' });
  } catch (error) {
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕРєР°Р·Р° РѕС‚Р·С‹РІР° Рѕ РјР°РіР°Р·РёРЅРµ' });
  }
});

// GET /api/profile/questions вЂ” РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ РІРѕРїСЂРѕСЃС‹ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ Рѕ С‚РѕРІР°СЂР°С…
app.get('/api/profile/questions', authMiddleware, async (req, res) => {
  try {
    const questions = await prisma.productQuestion.findMany({
      where: { 
        userId: req.user.userId,
        // РџРѕРєР°Р·С‹РІР°РµРј С‚РѕР»СЊРєРѕ РІРѕРїСЂРѕСЃС‹ СЃ РѕС‚РІРµС‚Р°РјРё (РѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ)
        status: 'published',
        answer: { not: null }
      },
      include: { 
        product: { select: { id: true, name: true, imageUrls: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(questions);
  } catch (error) {
    console.error('РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РІРѕРїСЂРѕСЃРѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РІРѕРїСЂРѕСЃРѕРІ' });
  }
});

// POST /api/admin/clear-all-data вЂ” РѕС‡РёСЃС‚РёС‚СЊ РІСЃРµ РґР°РЅРЅС‹Рµ (С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂРѕРІ)
app.post('/api/admin/clear-all-data', authMiddleware, async (req, res) => {
  try {
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЏРІР»СЏРµС‚СЃСЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂРѕРј
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }

    console.log('рџ§№ РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ РёРЅРёС†РёРёСЂРѕРІР°Р» РѕС‡РёСЃС‚РєСѓ РІСЃРµС… РґР°РЅРЅС‹С…...');

    // РћС‡РёС‰Р°РµРј РґР°РЅРЅС‹Рµ РІ РїСЂР°РІРёР»СЊРЅРѕРј РїРѕСЂСЏРґРєРµ (СЃРЅР°С‡Р°Р»Р° Р·Р°РІРёСЃРёРјС‹Рµ С‚Р°Р±Р»РёС†С‹)
    const results = {};

    // РЎРєСЂС‹С‚С‹Рµ РѕС‚Р·С‹РІС‹
    results.hiddenReviews = await prisma.hiddenReview.deleteMany({});
    
    // РћС‚Р·С‹РІС‹ Рѕ С‚РѕРІР°СЂР°С…
    results.reviews = await prisma.review.deleteMany({});
    
    // РћС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ
    results.shopReviews = await prisma.shopReview.deleteMany({});
    
    // Р­Р»РµРјРµРЅС‚С‹ Р·Р°РєР°Р·РѕРІ
    results.orderItems = await prisma.orderItem.deleteMany({});
    
    // Р—Р°РєР°Р·С‹
    results.orders = await prisma.order.deleteMany({});
    
    // Р­Р»РµРјРµРЅС‚С‹ РєРѕСЂР·РёРЅС‹
    results.cartItems = await prisma.cartItem.deleteMany({});
    
    // РљРѕСЂР·РёРЅС‹
    results.carts = await prisma.cart.deleteMany({});
    
    // Р­Р»РµРјРµРЅС‚С‹ РёР·Р±СЂР°РЅРЅРѕРіРѕ
    results.wishlistItems = await prisma.wishlistItem.deleteMany({});
    
    // РЎРїРёСЃРєРё РёР·Р±СЂР°РЅРЅРѕРіРѕ
    results.wishlists = await prisma.wishlist.deleteMany({});
    
    // РЈРІРµРґРѕРјР»РµРЅРёСЏ
    results.notifications = await prisma.notification.deleteMany({});
    
    // РЈРІРµРґРѕРјР»РµРЅРёСЏ Рѕ РЅР°Р»РёС‡РёРё С‚РѕРІР°СЂРѕРІ
    results.availabilityNotifications = await prisma.availabilityNotification.deleteMany({});

    console.log('вњ… РћС‡РёСЃС‚РєР° Р·Р°РІРµСЂС€РµРЅР° СѓСЃРїРµС€РЅРѕ!');
    
    res.json({
      message: 'Р’СЃРµ РґР°РЅРЅС‹Рµ СѓСЃРїРµС€РЅРѕ РѕС‡РёС‰РµРЅС‹',
      statistics: results
    });

  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РїСЂРё РѕС‡РёСЃС‚РєРµ РґР°РЅРЅС‹С…:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС‡РёСЃС‚РєРё РґР°РЅРЅС‹С…' });
  }
});

// === РћС‡РёСЃС‚РёС‚СЊ СЃС‚Р°СЂС‹Рµ СѓРІРµРґРѕРјР»РµРЅРёСЏ СЃ РЅРµРїСЂР°РІРёР»СЊРЅС‹РјРё actionUrl ===
app.delete('/api/admin/notifications/cleanup', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  
  try {
    // РЈРґР°Р»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёСЏ СЃ actionUrl, СЃРѕРґРµСЂР¶Р°С‰РёРјРё 'latest'
    const deletedCount = await prisma.notification.deleteMany({
      where: {
        actionUrl: {
          contains: 'latest'
        }
      }
    });
    
    res.json({ 
      message: `РЈРґР°Р»РµРЅРѕ ${deletedCount.count} СѓРІРµРґРѕРјР»РµРЅРёР№ СЃ РЅРµРїСЂР°РІРёР»СЊРЅС‹РјРё СЃСЃС‹Р»РєР°РјРё`,
      deletedCount: deletedCount.count
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС‡РёСЃС‚РєРё СѓРІРµРґРѕРјР»РµРЅРёР№' });
  }
});

// === РЎРѕР·РґР°С‚СЊ С‚РµСЃС‚РѕРІРѕРµ СѓРІРµРґРѕРјР»РµРЅРёРµ ===
app.post('/api/admin/notifications/test', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'orderId РѕР±СЏР·Р°С‚РµР»РµРЅ' });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ Р·Р°РєР°Р· СЃСѓС‰РµСЃС‚РІСѓРµС‚
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Р—Р°РєР°Р· РЅРµ РЅР°Р№РґРµРЅ' });
    }
    
    const notification = await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'review_request',
        title: 'reviews.notification.title',
        message: 'reviews.notification.message',
        actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/review-order?orderId=${order.id}`,
        actionText: 'reviews.notification.actionText'
      }
    });
    
    res.json({ 
      message: 'РўРµСЃС‚РѕРІРѕРµ СѓРІРµРґРѕРјР»РµРЅРёРµ СЃРѕР·РґР°РЅРѕ',
      notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ С‚РµСЃС‚РѕРІРѕРіРѕ СѓРІРµРґРѕРјР»РµРЅРёСЏ' });
  }
});

// === РћС‡РёСЃС‚РёС‚СЊ СЃС‚Р°СЂС‹Рµ СѓРІРµРґРѕРјР»РµРЅРёСЏ СЃ РЅРµРїСЂР°РІРёР»СЊРЅС‹РјРё actionUrl ===

// === РџРѕР»СѓС‡РёС‚СЊ СЃРїРёСЃРѕРє РІСЃРµС… Р·Р°РєР°Р·РѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ (РґР»СЏ РѕС‚Р»Р°РґРєРё) ===
app.get('/api/admin/orders/list', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
  }
  
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      orders: orders.map(order => ({
        id: order.id,
        userId: order.userId,
        userName: order.user.name,
        userEmail: order.user.email,
        status: order.status,
        totalAmount: order.totalAmount,
        itemsCount: order.items.length,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё СЃРїРёСЃРєР° Р·Р°РєР°Р·РѕРІ' });
  }
});

// GET /api/reviews/product вЂ” РїРѕР»СѓС‡РёС‚СЊ РІСЃРµ РѕС‚Р·С‹РІС‹ Рѕ С‚РѕРІР°СЂР°С… РґР»СЏ РјРѕРґРµСЂР°С†РёРё
app.get('/api/reviews/product', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'РќРµС‚ РґРѕСЃС‚СѓРїР°' });
    
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true, surname: true } },
        product: { select: { name: true } }
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error('API: РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ С‚РѕРІР°СЂР°С…:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚Р·С‹РІРѕРІ Рѕ С‚РѕРІР°СЂР°С…' });
  }
});

// === API РґР»СЏ СЃС‚Р°С‚РёСЃС‚РёРєРё РёР·РѕР±СЂР°Р¶РµРЅРёР№ ===
app.get('/api/admin/images/stats', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }

    const processor = new BatchImageProcessor();
    const stats = await processor.getImageStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting image stats:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ СЃС‚Р°С‚РёСЃС‚РёРєРё РёР·РѕР±СЂР°Р¶РµРЅРёР№' });
  }
});

// === API РґР»СЏ РїР°РєРµС‚РЅРѕР№ РѕР±СЂР°Р±РѕС‚РєРё РёР·РѕР±СЂР°Р¶РµРЅРёР№ ===
app.post('/api/admin/images/process', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }

    const processor = new BatchImageProcessor();
    
    // РџРѕР»СѓС‡Р°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ РґРѕ РѕР±СЂР°Р±РѕС‚РєРё
    const statsBefore = await processor.getImageStats();
    
    // РћР±СЂР°Р±Р°С‚С‹РІР°РµРј РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
    const productResults = await processor.processAllProductImages();
    const categoryResults = await processor.processCategoryImages();
    
    // РџРѕР»СѓС‡Р°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ РїРѕСЃР»Рµ РѕР±СЂР°Р±РѕС‚РєРё
    const statsAfter = await processor.getImageStats();
    
    const totalSaved = productResults.totalSaved + categoryResults.totalSaved;
    const totalProcessed = productResults.totalProcessed + categoryResults.totalProcessed;
    const totalErrors = productResults.errors.length + categoryResults.errors.length;
    
    res.json({
      success: true,
      statsBefore,
      statsAfter,
      results: {
        products: productResults,
        categories: categoryResults,
        total: {
          processed: totalProcessed,
          saved: totalSaved,
          errors: totalErrors
        }
      }
    });
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕР±СЂР°Р±РѕС‚РєРё РёР·РѕР±СЂР°Р¶РµРЅРёР№' });
  }
});

// === API РґР»СЏ РёСЃРїСЂР°РІР»РµРЅРёСЏ РёР·РѕР±СЂР°Р¶РµРЅРёР№ РєР°С‚РµРіРѕСЂРёР№ ===
app.post('/api/admin/fix-category-images', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ: С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°' });
    }

    // РњР°РїРїРёРЅРі РєР°С‚РµРіРѕСЂРёР№ РЅР° РїСЂР°РІРёР»СЊРЅС‹Рµ fallback РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
    const categoryImageMapping = {
      'РќР°СЃС‚РѕР»СЊРЅС‹Рµ РёРіСЂС‹': 'nastolka.png',
      'Р РёСЃРѕРІР°РЅРёРµ': 'creativity.png',
      'РќР°Р±РѕСЂС‹ РґР»СЏ С‚РІРѕСЂС‡РµСЃС‚РІР°': 'creativity.png',
      'Р Р°СЃРєСЂР°СЃРєРё': 'creativity.png',
      'РљСѓРєР»С‹': 'toys.png',
      'РњСЏРіРєРёРµ РёРіСЂСѓС€РєРё': 'toys.png',
      'РђРєС‚РёРІРЅС‹Рµ РёРіСЂС‹': 'sport.png',
      'Р”РµРєРѕСЂР°С‚РёРІРЅР°СЏ РєРѕСЃРјРµС‚РёРєР° Рё СѓРєСЂР°С€РµРЅРёСЏ': 'toys.png',
      'Р РѕР±РѕС‚С‹ Рё С‚СЂР°РЅСЃС„РѕСЂРјРµСЂС‹': 'toys.png',
      'РРіСЂСѓС€РєРё РЅР° СЂР°РґРёРѕСѓРїСЂР°РІР»РµРЅРёРё': 'toys.png'
    };

    // РџРѕР»СѓС‡Р°РµРј РІСЃРµ РєР°С‚РµРіРѕСЂРёРё
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    let updatedCount = 0;
    const updatedCategories = [];

    // РџСЂРѕРІРµСЂСЏРµРј РєР°Р¶РґСѓСЋ РєР°С‚РµРіРѕСЂРёСЋ
    for (const category of categories) {
      let needsUpdate = false;
      let newImage = category.image;

      // Р•СЃР»Рё РёР·РѕР±СЂР°Р¶РµРЅРёРµ РЅР°С‡РёРЅР°РµС‚СЃСЏ СЃ С†РёС„СЂ (Р·Р°РіСЂСѓР¶РµРЅРЅС‹Р№ С„Р°Р№Р»), Р·Р°РјРµРЅСЏРµРј РЅР° fallback
      if (category.image && /^\d+/.test(category.image)) {
        needsUpdate = true;
        newImage = categoryImageMapping[category.name] || 'toys.png';
      }

      // Р•СЃР»Рё РёР·РѕР±СЂР°Р¶РµРЅРёРµ РЅРµ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓРµС‚ РјР°РїРїРёРЅРіСѓ, РёСЃРїСЂР°РІР»СЏРµРј
      if (categoryImageMapping[category.name] && category.image !== categoryImageMapping[category.name]) {
        needsUpdate = true;
        newImage = categoryImageMapping[category.name];
      }

      // РћР±РЅРѕРІР»СЏРµРј РєР°С‚РµРіРѕСЂРёСЋ РµСЃР»Рё РЅСѓР¶РЅРѕ
      if (needsUpdate) {
        await prisma.category.update({
          where: { id: category.id },
          data: { image: newImage }
        });
        updatedCategories.push({
          id: category.id,
          name: category.name,
          oldImage: category.image,
          newImage: newImage
        });
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `РСЃРїСЂР°РІР»РµРЅРѕ ${updatedCount} РєР°С‚РµРіРѕСЂРёР№`,
      updatedCount,
      updatedCategories
    });

  } catch (error) {
    console.error('Error fixing category images:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РёСЃРїСЂР°РІР»РµРЅРёСЏ РёР·РѕР±СЂР°Р¶РµРЅРёР№ РєР°С‚РµРіРѕСЂРёР№' });
  }
});

// === Р­РєСЃРїРѕСЂС‚ РґР°РЅРЅС‹С… ===
app.get('/api/export-data', async (req, res) => {
  try {
    console.log('рџ“¤ Р­РєСЃРїРѕСЂС‚ РґР°РЅРЅС‹С… С‡РµСЂРµР· API...');
    
    const exportData = {
      categories: [],
      products: [],
      users: [],
      orders: [],
      productQuestions: [],
      reviews: [],
      shopReviews: [],
      wishlists: [],
      notifications: [],
      exportDate: new Date().toISOString()
    };

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј РєР°С‚РµРіРѕСЂРёРё
    try {
      const categories = await prisma.category.findMany();
      exportData.categories = categories;
      console.log(`вњ… РљР°С‚РµРіРѕСЂРёРё СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${categories.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° РєР°С‚РµРіРѕСЂРёР№:', error.message);
      exportData.categories = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј С‚РѕРІР°СЂС‹
    try {
      const products = await prisma.product.findMany();
      exportData.products = products;
      console.log(`вњ… РўРѕРІР°СЂС‹ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${products.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° С‚РѕРІР°СЂРѕРІ:', error.message);
      exportData.products = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ (Р±РµР· РїР°СЂРѕР»РµР№)
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true
        }
      });
      exportData.users = users;
      console.log(`вњ… РџРѕР»СЊР·РѕРІР°С‚РµР»Рё СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${users.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№:', error.message);
      exportData.users = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј Р·Р°РєР°Р·С‹
    try {
      const orders = await prisma.order.findMany();
      exportData.orders = orders;
      console.log(`вњ… Р—Р°РєР°Р·С‹ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${orders.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° Р·Р°РєР°Р·РѕРІ:', error.message);
      exportData.orders = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј РІРѕРїСЂРѕСЃС‹
    try {
      const productQuestions = await prisma.productQuestion.findMany();
      exportData.productQuestions = productQuestions;
      console.log(`вњ… Р’РѕРїСЂРѕСЃС‹ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${productQuestions.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° РІРѕРїСЂРѕСЃРѕРІ:', error.message);
      exportData.productQuestions = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј РѕС‚Р·С‹РІС‹
    try {
      const reviews = await prisma.review.findMany();
      exportData.reviews = reviews;
      console.log(`вњ… РћС‚Р·С‹РІС‹ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${reviews.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° РѕС‚Р·С‹РІРѕРІ:', error.message);
      exportData.reviews = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј РѕС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ
    try {
      const shopReviews = await prisma.shopReview.findMany();
      exportData.shopReviews = shopReviews;
      console.log(`вњ… РћС‚Р·С‹РІС‹ Рѕ РјР°РіР°Р·РёРЅРµ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${shopReviews.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° РѕС‚Р·С‹РІРѕРІ Рѕ РјР°РіР°Р·РёРЅРµ:', error.message);
      exportData.shopReviews = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј РёР·Р±СЂР°РЅРЅРѕРµ
    try {
      const wishlists = await prisma.wishlist.findMany();
      exportData.wishlists = wishlists;
      console.log(`вњ… РР·Р±СЂР°РЅРЅРѕРµ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ: ${wishlists.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° РёР·Р±СЂР°РЅРЅРѕРіРѕ:', error.message);
      exportData.wishlists = [];
    }

    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј СѓРІРµРґРѕРјР»РµРЅРёСЏ
    try {
      const notifications = await prisma.notification.findMany();
      exportData.notifications = notifications;
      console.log(`вњ… РЈРІРµРґРѕРјР»РµРЅРёСЏ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹: ${notifications.length}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° СЌРєСЃРїРѕСЂС‚Р° СѓРІРµРґРѕРјР»РµРЅРёР№:', error.message);
      exportData.notifications = [];
    }

    console.log(`вњ… Р”Р°РЅРЅС‹Рµ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹:`, {
      categories: exportData.categories.length,
      products: exportData.products.length,
      users: exportData.users.length,
      orders: exportData.orders.length,
      productQuestions: exportData.productQuestions.length,
      reviews: exportData.reviews.length,
      shopReviews: exportData.shopReviews.length,
      wishlists: exportData.wishlists.length,
      notifications: exportData.notifications.length
    });

    res.json(exportData);
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РїСЂРё СЌРєСЃРїРѕСЂС‚Рµ РґР°РЅРЅС‹С…:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїСЂРё СЌРєСЃРїРѕСЂС‚Рµ РґР°РЅРЅС‹С…', details: error.message });
  }
});

// === РўРµСЃС‚РѕРІС‹Р№ endpoint ===
app.get('/api/test-export', async (req, res) => {
  try {
    console.log('рџ§Є РўРµСЃС‚РѕРІС‹Р№ endpoint РґР»СЏ СЌРєСЃРїРѕСЂС‚Р°...');
    
    // РџСЂРѕСЃС‚Р°СЏ РїСЂРѕРІРµСЂРєР° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
    const testData = {
      message: 'РўРµСЃС‚РѕРІС‹Р№ endpoint СЂР°Р±РѕС‚Р°РµС‚',
      timestamp: new Date().toISOString(),
      database: 'connected'
    };

    // РџРѕРїСЂРѕР±СѓРµРј РїРѕР»СѓС‡РёС‚СЊ РєРѕР»РёС‡РµСЃС‚РІРѕ С‚РѕРІР°СЂРѕРІ
    try {
      const productCount = await prisma.product.count();
      testData.productCount = productCount;
      console.log(`вњ… РљРѕР»РёС‡РµСЃС‚РІРѕ С‚РѕРІР°СЂРѕРІ: ${productCount}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° РїРѕРґСЃС‡РµС‚Р° С‚РѕРІР°СЂРѕРІ:', error.message);
      testData.productCount = 'error';
    }

    // РџРѕРїСЂРѕР±СѓРµРј РїРѕР»СѓС‡РёС‚СЊ РєРѕР»РёС‡РµСЃС‚РІРѕ РєР°С‚РµРіРѕСЂРёР№
    try {
      const categoryCount = await prisma.category.count();
      testData.categoryCount = categoryCount;
      console.log(`вњ… РљРѕР»РёС‡РµСЃС‚РІРѕ РєР°С‚РµРіРѕСЂРёР№: ${categoryCount}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° РїРѕРґСЃС‡РµС‚Р° РєР°С‚РµРіРѕСЂРёР№:', error.message);
      testData.categoryCount = 'error';
    }

    // РџРѕРїСЂРѕР±СѓРµРј РїРѕР»СѓС‡РёС‚СЊ РєРѕР»РёС‡РµСЃС‚РІРѕ РІРѕРїСЂРѕСЃРѕРІ
    try {
      const questionCount = await prisma.productQuestion.count();
      testData.questionCount = questionCount;
      console.log(`вњ… РљРѕР»РёС‡РµСЃС‚РІРѕ РІРѕРїСЂРѕСЃРѕРІ: ${questionCount}`);
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° РїРѕРґСЃС‡РµС‚Р° РІРѕРїСЂРѕСЃРѕРІ:', error.message);
      testData.questionCount = 'error';
    }

    res.json(testData);
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РІ С‚РµСЃС‚РѕРІРѕРј endpoint:', error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РІ С‚РµСЃС‚РѕРІРѕРј endpoint', details: error.message });
  }
});

// POST /api/migrate - Р±РµР·РѕРїР°СЃРЅРѕРµ РїСЂРёРјРµРЅРµРЅРёРµ РјРёРіСЂР°С†РёР№
app.post('/api/migrate', async (req, res) => {
  try {
    console.log('рџ”„ Р—Р°РїСѓСЃРє Р±РµР·РѕРїР°СЃРЅРѕР№ РјРёРіСЂР°С†РёРё С‡РµСЂРµР· API...');
    
    const migration = new SafeMigration();
    const result = await migration.run();
    
    if (result.success) {
      console.log('вњ… Р‘РµР·РѕРїР°СЃРЅР°СЏ РјРёРіСЂР°С†РёСЏ Р·Р°РІРµСЂС€РµРЅР° СѓСЃРїРµС€РЅРѕ');
      res.json({ 
        success: true, 
        message: result.message,
        details: 'РњРёРіСЂР°С†РёСЏ РІС‹РїРѕР»РЅРµРЅР° СЃ СЂРµР·РµСЂРІРЅС‹Рј РєРѕРїРёСЂРѕРІР°РЅРёРµРј Рё РїСЂРѕРІРµСЂРєР°РјРё'
      });
    } else {
      console.log('вќЊ Р‘РµР·РѕРїР°СЃРЅР°СЏ РјРёРіСЂР°С†РёСЏ РЅРµ СѓРґР°Р»Р°СЃСЊ');
      res.status(500).json({ 
        success: false,
        error: result.error,
        message: result.message,
        details: 'РњРёРіСЂР°С†РёСЏ РЅРµ СѓРґР°Р»Р°СЃСЊ, РЅРѕ РґР°РЅРЅС‹Рµ Р·Р°С‰РёС‰РµРЅС‹ СЂРµР·РµСЂРІРЅРѕР№ РєРѕРїРёРµР№'
      });
    }
  } catch (error) {
    console.error('вќЊ РљСЂРёС‚РёС‡РµСЃРєР°СЏ РѕС€РёР±РєР° РјРёРіСЂР°С†РёРё:', error);
    res.status(500).json({ 
      success: false,
      error: 'РљСЂРёС‚РёС‡РµСЃРєР°СЏ РѕС€РёР±РєР° РјРёРіСЂР°С†РёРё', 
      details: error.message 
    });
  }
});

// POST /api/contact - РѕР±СЂР°Р±РѕС‚РєР° С„РѕСЂРјС‹ РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    console.log('рџ“§ РџРѕР»СѓС‡РµРЅРѕ СЃРѕРѕР±С‰РµРЅРёРµ СЃ С„РѕСЂРјС‹ РєРѕРЅС‚Р°РєС‚РѕРІ:', { name, email, phone, message });
    
    // Р’Р°Р»РёРґР°С†РёСЏ
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'РќРµРѕР±С…РѕРґРёРјРѕ Р·Р°РїРѕР»РЅРёС‚СЊ РёРјСЏ, email Рё СЃРѕРѕР±С‰РµРЅРёРµ' 
      });
    }
    
    // РџСЂРѕРІРµСЂРєР° С„РѕСЂРјР°С‚Р° email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'РќРµРІРµСЂРЅС‹Р№ С„РѕСЂРјР°С‚ email' 
      });
    }
    
    // Р¤РѕСЂРјРёСЂСѓРµРј СЃРѕРѕР±С‰РµРЅРёРµ РґР»СЏ Telegram
    const telegramMessage = `
рџ“§ <b>РќРћР’РћР• РЎРћРћР‘Р©Р•РќРР• РЎ РЎРђР™РўРђ</b>

рџ‘¤ <b>РРјСЏ:</b> ${name}
рџ“§ <b>Email:</b> ${email}
рџ“± <b>РўРµР»РµС„РѕРЅ:</b> ${phone || 'РќРµ СѓРєР°Р·Р°РЅ'}
рџ’¬ <b>РЎРѕРѕР±С‰РµРЅРёРµ:</b>

${message}

вЏ° <b>Р’СЂРµРјСЏ:</b> ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' })}
рџЊђ <b>РСЃС‚РѕС‡РЅРёРє:</b> Р¤РѕСЂРјР° РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё
    `.trim();
    
    // РћС‚РїСЂР°РІР»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёРµ РІ Telegram
    try {
      await sendTelegramNotification(telegramMessage);
      console.log('вњ… РЎРѕРѕР±С‰РµРЅРёРµ СЃ С„РѕСЂРјС‹ РєРѕРЅС‚Р°РєС‚РѕРІ РѕС‚РїСЂР°РІР»РµРЅРѕ РІ Telegram');
    } catch (telegramError) {
      console.error('вќЊ РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё РІ Telegram:', telegramError);
      // РќРµ РїСЂРµСЂС‹РІР°РµРј РІС‹РїРѕР»РЅРµРЅРёРµ, РµСЃР»Рё Telegram РЅРµРґРѕСЃС‚СѓРїРµРЅ
    }
    
    console.log('вњ… РЎРѕРѕР±С‰РµРЅРёРµ СЃ С„РѕСЂРјС‹ РєРѕРЅС‚Р°РєС‚РѕРІ РѕР±СЂР°Р±РѕС‚Р°РЅРѕ СѓСЃРїРµС€РЅРѕ');
    res.json({ 
      success: true, 
      message: 'РЎРѕРѕР±С‰РµРЅРёРµ РѕС‚РїСЂР°РІР»РµРЅРѕ! РњС‹ РѕС‚РІРµС‚РёРј РІР°Рј РІ Р±Р»РёР¶Р°Р№С€РµРµ РІСЂРµРјСЏ.' 
    });
    
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РѕР±СЂР°Р±РѕС‚РєРё С„РѕСЂРјС‹ РєРѕРЅС‚Р°РєС‚РѕРІ:', error);
    res.status(500).json({ 
      error: 'Р’РЅСѓС‚СЂРµРЅРЅСЏСЏ РѕС€РёР±РєР° СЃРµСЂРІРµСЂР°' 
    });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  } else {
    console.log(`рџљЂ РЎРµСЂРІРµСЂ Р·Р°РїСѓС‰РµРЅ РЅР° РїРѕСЂС‚Сѓ ${PORT}`);
    console.log('рџ”Ќ DEBUG: Final uploads path check:', path.join(__dirname, '..', '..', '..', 'uploads'));
    console.log('рџ”Ќ DEBUG: Final uploads directory exists:', fs.existsSync(path.join(__dirname, '..', '..', '..', 'uploads')));
    const uploadsPath = path.join(__dirname, '..', '..', 'backend', 'uploads');
    if (fs.existsSync(uploadsPath)) {
      console.log('рџ”Ќ DEBUG: Final uploads directory contents:', fs.readdirSync(uploadsPath).slice(0, 5));
    } else {
      console.log('рџ”Ќ DEBUG: Uploads directory does not exist, creating it...');
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('вњ… Uploads directory created successfully');
    }
    startSafeMigration();
  }
});

// Р¤СѓРЅРєС†РёСЏ РґР»СЏ Р·Р°РїСѓСЃРєР° Р±РµР·РѕРїР°СЃРЅРѕР№ РјРёРіСЂР°С†РёРё
function startSafeMigration() {
  // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё РїСЂРёРјРµРЅСЏРµРј Р±РµР·РѕРїР°СЃРЅСѓСЋ РјРёРіСЂР°С†РёСЋ РїСЂРё Р·Р°РїСѓСЃРєРµ
  setTimeout(async () => {
    try {
      console.log('рџ”„ Р—Р°РїСѓСЃРє Р±РµР·РѕРїР°СЃРЅРѕР№ РјРёРіСЂР°С†РёРё РїСЂРё СЃС‚Р°СЂС‚Рµ СЃРµСЂРІРµСЂР°...');
      
      const migration = new SafeMigration();
      const result = await migration.run();
      
      if (result.success) {
        console.log('вњ… Р‘РµР·РѕРїР°СЃРЅР°СЏ РјРёРіСЂР°С†РёСЏ Р·Р°РІРµСЂС€РµРЅР°:', result.message);
      } else {
        console.log('вљ пёЏ РњРёРіСЂР°С†РёСЏ РЅРµ СѓРґР°Р»Р°СЃСЊ:', result.message);
      }
      
    } catch (error) {
      console.error('вќЊ РћС€РёР±РєР° Р±РµР·РѕРїР°СЃРЅРѕР№ РјРёРіСЂР°С†РёРё:', error.message);
    }
  }, 5000); // Р—Р°РґРµСЂР¶РєР° 5 СЃРµРєСѓРЅРґ РґР»СЏ РїРѕР»РЅРѕР№ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё
}

// Diagnostic endpoint РґР»СЏ РїСЂРѕРІРµСЂРєРё СЃС‚СЂСѓРєС‚СѓСЂС‹ Р±Р°Р·С‹ РґР°РЅРЅС‹С…
app.get('/api/debug/database-structure', async (req, res) => {
  try {
    console.log('рџ”Ќ РџСЂРѕРІРµСЂРєР° СЃС‚СЂСѓРєС‚СѓСЂС‹ Р±Р°Р·С‹ РґР°РЅРЅС‹С…...');
    
    // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ С‚Р°Р±Р»РёС†С‹ Product
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Product'
      );
    `;
    
    // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ РїРѕР»РµР№ РїРµСЂРµРІРѕРґРѕРІ
    const columnsExist = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'Product'
      AND column_name IN ('nameHe', 'descriptionHe', 'name', 'description')
      ORDER BY column_name;
    `;
    
    // РџСЂРѕРІРµСЂСЏРµРј РєРѕР»РёС‡РµСЃС‚РІРѕ РїСЂРѕРґСѓРєС‚РѕРІ СЃ РїРµСЂРµРІРѕРґР°РјРё
    const productsWithTranslations = await prisma.product.findMany({
      where: {
        OR: [
          { nameHe: { not: null } },
          { descriptionHe: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        nameHe: true,
        description: true,
        descriptionHe: true
      },
      take: 5
    });
    
    // РћР±С‰РµРµ РєРѕР»РёС‡РµСЃС‚РІРѕ РїСЂРѕРґСѓРєС‚РѕРІ
    const totalProducts = await prisma.product.count();
    
    res.json({
      success: true,
      tableExists: tableExists[0]?.exists || false,
      translationColumns: columnsExist,
      productsWithTranslations: {
        count: productsWithTranslations.length,
        samples: productsWithTranslations
      },
      totalProducts,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РїСЂРё РїСЂРѕРІРµСЂРєРµ СЃС‚СЂСѓРєС‚СѓСЂС‹ Р‘Р”:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// рџ–јпёЏ API СЂРѕСѓС‚С‹ РґР»СЏ СѓРјРЅРѕР№ СЃРёСЃС‚РµРјС‹ HD-РёР·РѕР±СЂР°Р¶РµРЅРёР№
// API endpoints РґР»СЏ РёРЅС„РѕСЂРјР°С†РёРё РѕР± РёР·РѕР±СЂР°Р¶РµРЅРёСЏС… (РёСЃРїРѕР»СЊР·СѓРµРј DualStorage)
app.get('/api/images/config', (req, res) => {
  const config = dualStorageUploadMiddleware.imageHandler.getConfigInfo();
  res.json(config);
});

// РЎС‚Р°СЂС‹Рµ endpoints РґР»СЏ РѕР±СЂР°С‚РЅРѕР№ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё
app.get('/api/images/hd-info/:imageUrl', smartImageUploadMiddleware.getHdImageInfo.bind(smartImageUploadMiddleware));
app.post('/api/images/hd-info/bulk', smartImageUploadMiddleware.getBulkHdImageInfo.bind(smartImageUploadMiddleware));
app.post('/api/images/switch-mode', smartImageUploadMiddleware.switchMode.bind(smartImageUploadMiddleware));
app.post('/api/images/cleanup', smartImageUploadMiddleware.cleanupUnusedHdVersions.bind(smartImageUploadMiddleware));

// рџ–јпёЏ Endpoint РґР»СЏ СЃРѕР·РґР°РЅРёСЏ HD РІРµСЂСЃРёР№ РІ РїСЂРѕРґР°РєС€РµРЅРµ
app.get('/api/images/hd', async (req, res) => {
  try {
    const { path: imagePath, quality = '4x' } = req.query;
    
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing image path parameter'
      });
    }
    
    console.log(`рџ”§ Р—Р°РїСЂРѕСЃ HD РІРµСЂСЃРёРё: ${imagePath}, РєР°С‡РµСЃС‚РІРѕ: ${quality}`);
    
    // РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ СЌС‚Рѕ Р»РѕРєР°Р»СЊРЅРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ
    if (!imagePath.startsWith('/uploads/') && !imagePath.includes('/uploads/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image path. Must start with /uploads/'
      });
    }
    
    // РћРїСЂРµРґРµР»СЏРµРј СЂР°Р·РјРµСЂ РґР»СЏ HD РІРµСЂСЃРёРё
    const size = quality === '4x' ? 2400 : 1200;
    
    // РЎРѕР·РґР°РµРј HD РІРµСЂСЃРёСЋ С‡РµСЂРµР· Sharp
    const sharp = require('sharp');
    const path = require('path');
    const fs = require('fs').promises;
    
    // РџСѓС‚СЊ Рє РѕСЂРёРіРёРЅР°Р»СЊРЅРѕРјСѓ С„Р°Р№Р»Сѓ
    const originalPath = path.join(__dirname, '..', '..', imagePath);
    
    // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ С„Р°Р№Р»Р°
    try {
      await fs.access(originalPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Original image not found'
      });
    }
    
    // РЎРѕР·РґР°РµРј HD РІРµСЂСЃРёСЋ
    const hdBuffer = await sharp(originalPath)
      .resize(size, size, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 90,
        effort: 5 
      })
      .toBuffer();
    
    // РћС‚РїСЂР°РІР»СЏРµРј HD РІРµСЂСЃРёСЋ
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // РљСЌС€РёСЂСѓРµРј РЅР° РіРѕРґ
    res.send(hdBuffer);
    
    console.log(`вњ… HD ${quality} РІРµСЂСЃРёСЏ СЃРѕР·РґР°РЅР° Рё РѕС‚РїСЂР°РІР»РµРЅР°`);
    
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ HD РІРµСЂСЃРёРё:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Diagnostic endpoint РґР»СЏ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ СЃРѕР·РґР°РЅРёСЏ РїСЂРѕРґСѓРєС‚Р° СЃ РїРµСЂРµРІРѕРґР°РјРё
app.post('/api/debug/test-translations', async (req, res) => {
  try {
    console.log('рџ§Є РўРµСЃС‚РёСЂРѕРІР°РЅРёРµ СЃРѕР·РґР°РЅРёСЏ РїСЂРѕРґСѓРєС‚Р° СЃ РїРµСЂРµРІРѕРґР°РјРё...');
    console.log('рџ“Ґ РџРѕР»СѓС‡РµРЅРЅС‹Рµ РґР°РЅРЅС‹Рµ:', JSON.stringify(req.body, null, 2));
    
    const { name, description, nameHe, descriptionHe, price = 100 } = req.body;
    
    // РЎРѕР·РґР°РµРј С‚РµСЃС‚РѕРІС‹Р№ РїСЂРѕРґСѓРєС‚
    const testProduct = await prisma.product.create({
      data: {
        name: name || 'Test Product',
        description: description || 'Test Description',
        nameHe: nameHe || null,
        descriptionHe: descriptionHe || null,
        price: parseFloat(price),
        quantity: 1,
        categoryName: 'Test Category'
      }
    });
    
    console.log('вњ… РўРµСЃС‚РѕРІС‹Р№ РїСЂРѕРґСѓРєС‚ СЃРѕР·РґР°РЅ:', testProduct);
    
    // РџРѕР»СѓС‡Р°РµРј СЃРѕР·РґР°РЅРЅС‹Р№ РїСЂРѕРґСѓРєС‚ РґР»СЏ РїСЂРѕРІРµСЂРєРё
    const createdProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    });
    
    res.json({
      success: true,
      createdProduct,
      receivedData: req.body,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('вќЊ РћС€РёР±РєР° РїСЂРё С‚РµСЃС‚РёСЂРѕРІР°РЅРёРё РїРµСЂРµРІРѕРґРѕРІ:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
