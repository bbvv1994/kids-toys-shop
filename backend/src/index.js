const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const SibApiV3Sdk = require('sib-api-v3-sdk');
const TelegramBot = require('node-telegram-bot-api');
const ImageMiddleware = require('./imageMiddleware');
const BatchImageProcessor = require('./batchImageProcessor');
const ProductionUploadMiddleware = require('./productionUploadMiddleware');
const CloudinaryUploadMiddleware = require('./cloudinaryUploadMiddleware');
const FlexibleUploadMiddleware = require('./flexibleUploadMiddleware');

// Создаем один экземпляр ImageMiddleware для использования во всех маршрутах
const imageMiddleware = new ImageMiddleware();
const productionUploadMiddleware = new ProductionUploadMiddleware();
const cloudinaryUploadMiddleware = new CloudinaryUploadMiddleware();
const flexibleUploadMiddleware = new FlexibleUploadMiddleware();
require('dotenv').config();

// Настройка Brevo
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

// Настройка Telegram бота
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

// Функция для отправки уведомления в Telegram
async function sendTelegramNotification(message) {
  try {
    if (!telegramBot || !process.env.TELEGRAM_CHAT_ID) {
      console.log('Telegram bot not configured, skipping notification');
      return true;
    }
    
    await telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' });
    console.log('Telegram notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

// Функция для получения адреса магазина
function getStoreAddress(pickupStore) {
  const storeAddresses = {
    'store1': 'רוברט סולד 8 קריית ים',
    'store2': 'ויצמן 6 קריית מוצקין'
  };
  return storeAddresses[pickupStore] || 'כתובת לא צוינה';
}

// Функция для получения полной информации о магазине
function getStoreInfo(pickupStore) {
  const storeInfo = {
    'store1': { name: 'חנות קריית ים', address: 'רוברט סולד 8 קריית ים' },
    'store2': { name: 'חנות קריית מוצקין', address: 'ויצמן 6 קריית מוצקין' }
  };
  return storeInfo[pickupStore] || { name: 'חנות לא נמצאה', address: 'כתובת לא צוינה' };
}

// Функция для отправки email через Brevo
async function sendEmail(to, subject, htmlContent) {
  try {
    console.log('sendEmail called with:', { to, subject, hasHtmlContent: !!htmlContent });
    console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
    console.log('apiInstance exists:', !!apiInstance);
    
    // Если нет API ключа или экземпляра, используем fallback
    if (!process.env.BREVO_API_KEY || !apiInstance) {
      console.log('Brevo API not configured, skipping email send');
      return true;
    }
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { 
      name: 'Kids Toys Shop', 
      email: 'wexkwasexort@gmail.com' 
    };
    
    console.log('Sending email with sender:', sendSmtpEmail.sender);
    console.log('Email to:', to);
    console.log('Email subject:', subject);

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}


const app = express();
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {})
  .catch((err) => {
    console.error('Prisma failed to connect:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

// Настройка multer для production и development
let storage;
let upload;

if (process.env.NODE_ENV === 'production') {
  // В production используем память для загрузки файлов
  upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });
} else {
  // В development используем диск
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  upload = multer({ storage: storage });
  
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
}

// CORS настройки
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://192.168.31.156:3000',
      'http://192.168.31.156',
      'https://*.vercel.app',
      'https://*.netlify.app',
      'https://*.onrender.com',
      'https://vercel.app',
      'https://kids-toys-shop.vercel.app',
      'https://kids-toys-shop-git-main-bbvv1994.vercel.app',
      'https://kids-toys-shop-bbvv1994.vercel.app',
      // Добавляем все возможные Vercel домены
      'https://*.vercel.app',
      'https://vercel.app',
      // Добавляем все возможные Render домены
      'https://*.onrender.com',
      'https://onrender.com'
    ];
    
    // Проверяем точное совпадение
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Проверяем wildcard домены
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    // В production разрешаем все Vercel и Render домены
    if (process.env.NODE_ENV === 'production' && 
        (origin.includes('vercel.app') || origin.includes('onrender.com'))) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Добавляем middleware для правильной обработки UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(passport.initialize());

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
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

// Debug endpoint для проверки категорий
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

// Endpoint для импорта данных в Render базу данных
app.post('/api/debug/import-data', async (req, res) => {
  try {
    console.log('🚀 Начинаем импорт данных через API...');
    
    // Временно отключаем авторизацию для тестирования
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   return res.status(401).json({ error: 'Требуется авторизация' });
    // }
    
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    // if (!user || user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    // }
    
    // Создаем тестовые данные прямо в коде
    const testCategories = [
      { id: 1, name: 'Игрушки', active: true, order: 1, parentId: null },
      { id: 2, name: 'Конструкторы', active: true, order: 2, parentId: null },
      { id: 3, name: 'Пазлы', active: true, order: 3, parentId: null },
      { id: 4, name: 'Творчество', active: true, order: 4, parentId: null },
      { id: 5, name: 'Канцтовары', active: true, order: 5, parentId: null }
    ];
    
    const testProducts = [
      { id: 1, name: 'Кукла Барби', price: 299.99, description: 'Красивая кукла', categoryId: 1, active: true },
      { id: 2, name: 'Машинка радиоуправляемая', price: 599.99, description: 'Быстрая машинка', categoryId: 1, active: true },
      { id: 3, name: 'Пазл 100 деталей', price: 199.99, description: 'Развивающий пазл', categoryId: 3, active: true }
    ];
    
    console.log('📂 Импортируем тестовые категории...');
    for (const category of testCategories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`✅ Импортировано ${testCategories.length} категорий`);
    
    console.log('📦 Импортируем тестовые продукты...');
    for (const product of testProducts) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`✅ Импортировано ${testProducts.length} продуктов`);
    
    // Проверяем количество записей
    const categoriesCount = await prisma.category.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();
    const ordersCount = await prisma.order.count();
    const reviewsCount = await prisma.review.count();
    
    res.json({
      success: true,
      message: 'Данные успешно импортированы',
      stats: {
        categories: categoriesCount,
        products: productsCount,
        users: usersCount,
        orders: ordersCount,
        reviews: reviewsCount
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка при импорте данных:', error);
    res.status(500).json({ 
      error: 'Ошибка при импорте данных', 
      message: error.message 
    });
  }
});

// Функция для безопасного декодирования имени пользователя
function decodeUserName(name) {
  if (!name) return '';
  
  try {
    console.log('Original name for decoding:', name);
    
    // Проверяем, нужно ли декодировать
    let decoded = name;
    
    // Если имя содержит %XX кодировку, декодируем
    if (name.includes('%')) {
      decoded = decodeURIComponent(name);
      console.log('First decode:', decoded);
    }
    
    // Если результат содержит еще %XX, декодируем еще раз
    if (decoded.includes('%')) {
      decoded = decodeURIComponent(decoded);
      console.log('Second decode:', decoded);
    }
    
    // Проверяем, не является ли результат base64
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
    
    // Обработка специальных символов и эмодзи
    try {
      // Пробуем декодировать как JSON, если это возможно
      if (decoded.startsWith('"') && decoded.endsWith('"')) {
        const jsonDecoded = JSON.parse(decoded);
        if (jsonDecoded && typeof jsonDecoded === 'string') {
          decoded = jsonDecoded;
          console.log('JSON decode:', decoded);
        }
      }
    } catch (jsonError) {
      // Игнорируем ошибки JSON парсинга
    }
    
    // Дополнительная обработка для URL-encoded символов
    if (decoded.includes('+')) {
      decoded = decoded.replace(/\+/g, ' ');
    }
    
    // Убираем лишние пробелы и нормализуем
    decoded = decoded.trim().replace(/\s+/g, ' ');
    
    console.log('Final decoded name:', decoded);
    
    // Если результат пустой, возвращаем оригинальное имя
    return decoded || name;
  } catch (error) {
    console.error('Error decoding user name:', error);
    // В случае ошибки возвращаем оригинальное имя
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
    
    // Декодируем имя пользователя
    const decodedName = decodeUserName(profile.displayName);
    console.log('Decoded displayName:', decodedName);
    
    // Проверяем, есть ли пользователь с таким Google ID
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
    
    if (!user) {
      // Проверяем, есть ли пользователь с таким email
      const existingUser = await prisma.user.findUnique({ 
        where: { email: profile.emails[0].value } 
      });
      
      if (existingUser) {
        // Если пользователь существует, но не связан с Google, обновляем его
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            googleId: profile.id,
            emailVerified: true,
            name: decodedName || existingUser.name
          }
        });
      } else {
        // Создаем нового пользователя
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
      // Обновляем имя существующего пользователя, если оно изменилось
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
  flexibleUploadMiddleware.processUploadedFiles.bind(flexibleUploadMiddleware), 
  async (req, res) => {
  // Проверка роли admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  try {
    const { name, description, price, category, subcategory, ageGroup, gender, quantity, article, brand, country, length, width, height, isHidden } = req.body;
    
    // Используем URL из Cloudinary или локальные пути
    const imageUrls = req.files ? req.files.map((file, index) => {
      if (req.imageUrls && req.imageUrls[index]) {
        // Используем URL из Cloudinary
        return req.imageUrls[index];
      } else if (file.filename) {
        // Fallback для локальных файлов
        return `/uploads/${file.filename}`;
      } else {
        // Fallback для production
        return `/uploads/${Date.now()}_${file.originalname}`;
      }
    }) : [];

    // Отладочная информация


    // Получаем название категории по ID
    let categoryName = category;
    if (category && !isNaN(category)) {
      const categoryRecord = await prisma.category.findUnique({
        where: { id: parseInt(category) }
      });
      categoryName = categoryRecord ? categoryRecord.name : category;
    }

    // Получаем ID подкатегории
    let subcategoryId = null;
    if (subcategory) {
      // Если subcategory - это ID, используем его напрямую
      if (!isNaN(subcategory)) {
        subcategoryId = parseInt(subcategory);
      } else {
        // Если subcategory - это название, ищем по названию
        const subcategoryRecord = await prisma.category.findFirst({
          where: { 
            name: subcategory,
            parentId: parseInt(category)
          }
        });
        subcategoryId = subcategoryRecord ? subcategoryRecord.id : null;
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
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
        ...(isHidden !== undefined ? { isHidden: isHidden === 'true' || isHidden === true } : {})
      }
    });


    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, subcategoryId, admin } = req.query;
    
    let whereClause = {};
    
    if (category) {
      whereClause.categoryName = category;
    }
    
    if (subcategoryId) {
      whereClause.subcategoryId = parseInt(subcategoryId);
    }
    
    // Если запрос не от админа, скрываем товары с isHidden = true
    if (admin !== 'true') {
      whereClause.isHidden = false;
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Добавляем расчет рейтинга и количества отзывов для каждого товара
    const productsWithRating = products.map(product => {
      const reviews = product.reviews || [];
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      return {
        ...product,
        rating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака после запятой
        reviewCount: reviews.length
      };
    });

    res.json(productsWithRating);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { admin } = req.query;
    
    let whereClause = { id: parseInt(req.params.id) };
    
    // Если запрос не от админа, скрываем товары с isHidden = true
    if (admin !== 'true') {
      whereClause.isHidden = false;
    }
    
    const product = await prisma.product.findUnique({
      where: whereClause,
      include: {
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
      }
    });
    
    console.log('API: GET product data:', {
      id: product?.id,
      categoryId: product?.categoryId,
      category: product?.category,
      subcategoryId: product?.subcategoryId,
      subcategory: product?.subcategory
    });
    
    console.log('API: GET - Raw product from database:', product);
    
    // Проверяем, существуют ли связанные записи для GET
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
    
    // Проверяем, существуют ли связанные записи для GET
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
    
    // Добавляем расчет рейтинга и количества отзывов
    const reviews = product.reviews || [];
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    const productWithRating = {
      ...product,
      rating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака после запятой
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
    
    // Проверяем права администратора
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      console.log('DELETE /api/products/:id - Access denied: user is not admin');
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }

    const productId = parseInt(req.params.id);
    console.log('DELETE /api/products/:id - Product ID:', productId);
    
    // Сначала проверяем, существует ли товар
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!existingProduct) {
      console.log('DELETE /api/products/:id - Product not found');
      return res.status(404).json({ error: 'Товар не найден' });
    }

    console.log('DELETE /api/products/:id - Product found, starting deletion of related data');

    // Удаляем связанные данные (отзывы, элементы корзины, элементы заказов, избранное)
    try {
      console.log('DELETE /api/products/:id - Deleting hidden reviews...');
      // Сначала удаляем скрытые отзывы
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
      console.log('DELETE /api/products/:id - Deleting availability notifications...');
      await prisma.availabilityNotification.deleteMany({
        where: { productId: productId }
      });
      console.log('DELETE /api/products/:id - Availability notifications deleted successfully');
    } catch (notificationError) {
      console.error('DELETE /api/products/:id - Error deleting availability notifications:', notificationError);
    }

    // Проверяем, есть ли заказы с этим товаром и удаляем скрытые заказы
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

    // Теперь удаляем сам товар
    console.log('DELETE /api/products/:id - Deleting product...');
    const product = await prisma.product.delete({
      where: { id: productId }
    });
    console.log('DELETE /api/products/:id - Product deleted successfully');

    // Удаляем изображения с диска
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

// === Регистрация пользователя ===
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Пользователь уже существует' });
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log(`Создаем пользователя: ${email}, name: ${name}`);
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        name, 
        verificationToken,
        emailVerified: false // Явно указываем false
      }
    });
    console.log(`Пользователь создан с ID: ${user.id}, emailVerified: ${user.emailVerified}`);

    // Отправка письма с подтверждением через Brevo
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirm-email?token=${verificationToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3f51b5; margin: 0; font-size: 28px;">🎉 Добро пожаловать в Kids Toys Shop!</h1>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
              Здравствуйте! Спасибо за регистрацию в нашем магазине детских игрушек.
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
              Для завершения регистрации и активации вашего аккаунта, пожалуйста, подтвердите ваш email адрес.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="background-color: #3f51b5; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
              ✅ Подтвердить Email
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Если кнопка не работает, скопируйте эту ссылку в браузер:<br>
              <a href="${confirmUrl}" style="color: #3f51b5;">${confirmUrl}</a>
            </p>
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
              <strong>Команда Kids Toys Shop</strong>
            </p>
          </div>
        </div>
      </div>
    `;
    console.log(`Отправляем email подтверждения на: ${email}`);
    await sendEmail(email, 'Подтверждение регистрации - Kids Toys Shop', emailHtml);
    console.log('Email подтверждения отправлен успешно');
    res.json({ 
      message: 'Регистрация успешна! Письмо с подтверждением отправлено на email. Пожалуйста, подтвердите email перед входом в систему.',
      requiresEmailVerification: true,
      user: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// === Подтверждение email ===
app.get('/api/auth/confirm', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Нет токена' });
    
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      // Если токен не найден, возможно email уже подтвержден
      // Возвращаем успех вместо ошибки для лучшего UX
      return res.json({ message: 'Email уже подтверждён!' });
    }
    
    // Обновляем статус подтверждения
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    });
    
    // Генерируем JWT токен для автоматического входа
    const jwtToken = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    // Возвращаем данные для автоматического входа
    res.json({ 
      message: 'Email подтверждён!',
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
    res.status(500).json({ error: 'Ошибка подтверждения email' });
  }
});

// === Логин ===
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(`Попытка входа для email: ${email}, пользователь найден: ${!!user}, emailVerified: ${user?.emailVerified}`);
    
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    
    // Проверяем, что пользователь подтвердил email
    if (!user.emailVerified) {
      return res.status(400).json({ 
        error: 'Email не подтверждён. Пожалуйста, проверьте вашу почту и подтвердите email перед входом в систему.',
        requiresEmailVerification: true 
      });
    }
    
    // Если у пользователя есть Google ID (зарегистрирован через Google), но нет пароля
    if (user.googleId && !user.passwordHash) {
      return res.status(400).json({ 
        error: 'Этот аккаунт зарегистрирован через Google. Пожалуйста, используйте кнопку "Войти через Google" для входа.',
        requiresGoogleAuth: true 
      });
    }
    
    // Проверяем наличие пароля
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    
    // Проверяем пароль
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    
    // Генерируем JWT
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
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// === Google OAuth Routes ===
app.get('/api/auth/google', (req, res, next) => {
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/api/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  try {
    console.log('Google OAuth callback, user:', req.user);
    
    // Убеждаемся, что имя пользователя правильно декодировано
    const userName = decodeUserName(req.user.name);
    console.log('Final user name for JWT:', userName);
    
    // Генерируем JWT
    const token = jwt.sign({ 
      userId: req.user.id, 
      email: req.user.email, 
      name: userName, 
      role: req.user.role 
    }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    // Редирект на фронт с токеном
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

// Middleware для проверки JWT
function authMiddleware(req, res, next) {
  
  
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  
  const token = auth.slice(7);
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Некорректный токен' });
  }
}

// История заказов пользователя
app.get('/api/profile/orders', authMiddleware, async (req, res) => {
  try {
    // Получаем скрытые заказы пользователя
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
    
    // Добавляем расчет суммы для каждого заказа
    const ordersWithTotal = orders.map(order => ({
      ...order,
      total: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));
    
    res.json(ordersWithTotal);
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});

// Текущая корзина пользователя
app.get('/api/profile/cart', authMiddleware, async (req, res) => {
  try {
    // Сначала проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      console.error('Пользователь не найден при попытке получить корзину:', req.user.userId);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });
    
    if (!cart) {
      try {
        console.log(`Создаем корзину для пользователя ID: ${req.user.userId}`);
        await prisma.cart.create({ data: { userId: req.user.userId } });
        cart = await prisma.cart.findUnique({
          where: { userId: req.user.userId },
          include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
        });
        console.log(`Корзина создана успешно, ID: ${cart?.id}`);
  
      } catch (e) {
        console.error('Ошибка создания корзины:', e);
        return res.json({ items: [] });
      }
    }
    
    if (!cart) {
      console.log('Корзина не найдена после попытки создания');
      return res.json({ items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Ошибка получения корзины' });
  }
});

// === Редактирование профиля ===
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, surname, email, phone } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    
    let updateData = { 
      name: name || user.name,
      surname: surname || user.surname,
      phone: phone || user.phone,
    };
    
    if (email && email !== user.email) {
      // Если email меняется — просто обновляем без подтверждения
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
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

// === Удаление профиля ===
app.delete('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    
    // Удаляем все связанные данные пользователя
    await prisma.$transaction([
      // Удаляем корзину
      prisma.cart.deleteMany({ where: { userId: user.id } }),
      // Удаляем заказы
      prisma.order.deleteMany({ where: { userId: user.id } }),
      // Удаляем отзывы
      prisma.review.deleteMany({ where: { userId: user.id } }),
      // Удаляем избранное
      prisma.wishlist.deleteMany({ where: { userId: user.id } }),
      // Удаляем уведомления
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      // Удаляем самого пользователя
      prisma.user.delete({ where: { id: user.id } })
    ]);
    
    res.json({ message: 'Профиль успешно удален' });
  } catch (error) {
    console.error('Profile deletion error:', error);
    res.status(500).json({ error: 'Ошибка удаления профиля' });
  }
});

// === Восстановление пароля: запрос ===
app.post('/api/auth/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'Если email зарегистрирован, письмо отправлено' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: resetToken } });
    // Отправка письма
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3f51b5; margin: 0; font-size: 28px;">🔐 Восстановление пароля</h1>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
              Уважаемый(ая) <strong>${user.name || 'клиент'}</strong>!
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
              Мы получили запрос на восстановление пароля для вашего аккаунта в Kids Toys Shop.
            </p>
          </div>
          
          <div style="margin-bottom: 30px; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #3f51b5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
              🔑 Сбросить пароль
            </a>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
              Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
              Ссылка действительна в течение 24 часов.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              С уважением,<br>
              <strong>Команда Kids Toys Shop</strong>
            </p>
          </div>
        </div>
      </div>
    `;
    await sendEmail(email, 'Восстановление пароля - Kids Toys Shop', emailHtml);
    res.json({ message: 'Если email зарегистрирован, письмо отправлено' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Ошибка восстановления пароля' });
  }
});

// === Восстановление пароля: сброс ===
app.post('/api/auth/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Нет токена или пароля' });
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ error: 'Некорректный токен' });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, verificationToken: null } });
    res.json({ message: 'Пароль успешно сброшен' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Ошибка сброса пароля' });
  }
});

// === Профиль пользователя (имя, фамилия, email, роль, телефон, дата регистрации) ===
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
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
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
});

// === Добавить товар в корзину ===
app.post('/api/profile/cart/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId обязателен' });
    
    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      console.error('Пользователь не найден при попытке добавить товар в корзину:', req.user.userId);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) {
      console.log(`Создаем корзину для пользователя ID: ${req.user.userId}`);
      cart = await prisma.cart.create({ data: { userId: req.user.userId } });
      console.log(`Корзина создана, ID: ${cart.id}`);
    }
    let cartItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
    if (cartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + quantity }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity }
      });
    }
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });
    res.json(updatedCart);
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ error: 'Ошибка добавления в корзину' });
  }
});

// === Удалить товар из корзины ===
app.post('/api/profile/cart/remove', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId обязателен' });
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) return res.status(404).json({ error: 'Корзина не найдена' });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });
    res.json(updatedCart);
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ error: 'Ошибка удаления из корзины' });
  }
});

// === Изменить количество товара в корзине ===
app.post('/api/profile/cart/update', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity < 1) return res.status(400).json({ error: 'productId и quantity >= 1 обязательны' });
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) return res.status(404).json({ error: 'Корзина не найдена' });
    let cartItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
    if (!cartItem) return res.status(404).json({ error: 'Товар не найден в корзине' });
    cartItem = await prisma.cartItem.update({ where: { id: cartItem.id }, data: { quantity } });
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ error: 'Ошибка изменения количества' });
  }
});

// === Оформление заказа (checkout) ===
app.post('/api/profile/checkout', authMiddleware, async (req, res) => {
  try {

    
    const { customerInfo, pickupStore, paymentMethod, total, cartItems } = req.body;
    
    // Проверяем, есть ли cartItems в запросе
    if (cartItems && cartItems.length > 0) {
      console.log('📦 Using cartItems from request:', cartItems);
      
      // Проверяем наличие товара на складе
      for (const item of cartItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        if (!product) {
          return res.status(400).json({ error: `Товар не найден: ID ${item.productId}` });
        }
        
        if (item.quantity > product.quantity) {
          return res.status(400).json({ error: `Недостаточно товара: ${product.name}` });
        }
      }
      
      // Обновляем информацию о пользователе, если предоставлена
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
      
      // Создаём заказ с cartItems из запроса
      const order = await prisma.order.create({
        data: {
          userId: req.user.userId,
          status: 'pending',
          pickupStore,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { 
          items: { include: { product: true } },
          user: true 
        }
      });
      
      // Уменьшаем количество на складе
      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }
      
      // Очищаем корзину пользователя
      const cart = await prisma.cart.findUnique({
        where: { userId: req.user.userId },
        include: { items: true }
      });
      
      if (cart) {
        console.log(`Очищаем корзину ID: ${cart.id}`);
        
        // Сначала удаляем все элементы корзины
        const deletedItems = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        console.log(`Удалено ${deletedItems.count} элементов корзины для корзины ID: ${cart.id}`);
        
        // Удаляем саму корзину
        await prisma.cart.delete({ where: { id: cart.id } });
        console.log(`Удалена корзина ID: ${cart.id}`);
      }
      
      // Отправляем уведомления
      try {
        await sendTelegramNotification(`🛒 Новый заказ #${order.id} от ${order.user.name} ${order.user.surname}`);
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError);
      }
      
      // Отправляем email
      try {
        const orderItems = order.items.map(item => 
          `${item.product.name} - ${item.quantity} шт. x ₪${item.price}`
        ).join('\n');
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; text-align: center;">Подтверждение заказа #${order.id}</h2>
            <p style="color: #555; font-size: 16px;">Здравствуйте, ${order.user.name}!</p>
            <p style="color: #555; font-size: 16px;">Ваш заказ успешно оформлен.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Детали заказа:</h3>
              <p><strong>Номер заказа:</strong> #${order.id}</p>
              <p><strong>Статус:</strong> Ожидает подтверждения</p>
              <p><strong>Магазин самовывоза:</strong> ${getStoreInfo(pickupStore)}</p>
              <p><strong>Способ оплаты:</strong> ${paymentMethod}</p>
              <p><strong>Общая сумма:</strong> ₪${total}</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Товары:</h3>
              <div style="white-space: pre-line; color: #555;">${orderItems}</div>
            </div>
            
            <p style="color: #555; font-size: 16px;">Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-size: 16px;">
                Перейти в профиль
              </a>
            </p>
            
            <p style="color: #888; font-size: 14px; text-align: center; margin-top: 20px;">С уважением, Команда Kids Toys Shop</p>
          </div>
        `;
        
        await sendEmail(
          order.user.email,
          `Подтверждение заказа #${order.id} - Kids Toys Shop`,
          emailContent
        );
      } catch (emailError) {
        console.error('Ошибка отправки email:', emailError);
      }
      
      res.json({ 
        success: true, 
        order,
        message: 'Заказ успешно создан'
      });
      
    } else {
      // Fallback: получаем корзину пользователя из базы данных
      console.log('📦 Using cart from database');
      
      const cart = await prisma.cart.findUnique({
        where: { userId: req.user.userId },
        include: { items: { include: { product: true }, orderBy: { id: 'asc' } } }
      });
      
      if (!cart || !cart.items.length) {
        return res.status(400).json({ error: 'Корзина пуста' });
      }
    
    
    
    // Проверяем наличие товара на складе
    for (const item of cart.items) {
      
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({ error: `Недостаточно товара: ${item.product.name}` });
      }
    }
    
    // Обновляем информацию о пользователе, если предоставлена
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
    
    // Создаём заказ
    
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        status: 'pending',
        pickupStore,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: { 
        items: { include: { product: true } },
        user: true 
      }
    });
    
    
    // Уменьшаем количество на складе
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });
    }
    
    // Очищаем корзину
    try {
      console.log(`Очищаем корзину ID: ${cart.id}`);
      
      // Сначала удаляем все элементы корзины
      const deletedItems = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      console.log(`Удалено ${deletedItems.count} элементов корзины для корзины ID: ${cart.id}`);
      
      // Проверяем, что все элементы действительно удалены
      const remainingItems = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
      if (remainingItems.length > 0) {
        console.log(`Предупреждение: осталось ${remainingItems.length} элементов в корзине`);
        // Принудительно удаляем оставшиеся элементы
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
      
      // Проверяем, существует ли корзина перед удалением
      const cartExists = await prisma.cart.findUnique({ where: { id: cart.id } });
      if (cartExists) {
        await prisma.cart.delete({ where: { id: cart.id } });
        console.log(`Удалена корзина ID: ${cart.id}`);
      } else {
        console.log(`Корзина ID: ${cart.id} уже была удалена`);
      }
      
      // Дополнительная проверка - убеждаемся, что корзина действительно удалена
      const cartStillExists = await prisma.cart.findUnique({ where: { id: cart.id } });
      if (cartStillExists) {
        console.log(`ОШИБКА: Корзина ID: ${cart.id} все еще существует после удаления`);
        // Принудительно удаляем корзину
        await prisma.cart.delete({ where: { id: cart.id } });
      }
      
    } catch (clearError) {
      console.error('Ошибка при очистке корзины:', clearError);
      // Продолжаем выполнение, даже если очистка корзины не удалась
    }
    
    // Отправляем уведомление в Telegram
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      const telegramMessage = `
🛒 <b>Новый заказ #${order.id}</b>

👤 <b>Клиент:</b> ${user.name || customerInfo?.firstName || 'Не указано'}
📧 <b>Email:</b> ${user.email || customerInfo?.email || 'Не указано'}
📱 <b>Телефон:</b> ${user.phone || customerInfo?.phone || 'Не указано'}
🏬 <b>Самовывоз из:</b> ${getStoreInfo(pickupStore).name} (${getStoreInfo(pickupStore).address})
💳 <b>Оплата:</b> ${paymentMethod === 'card' ? 'Карта' : 'Наличные'}

📦 <b>Товары:</b>
${cart.items.map(item => `• ${item.product.name} x${item.quantity} - ${item.product.price * item.quantity} ₪`).join('\n')}

💰 <b>Итого:</b> ${totalAmount} ₪
📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}
      `.trim();
      await sendTelegramNotification(telegramMessage);
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
    }
    
    // Отправляем email подтверждения заказа покупателю
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      const emailSubject = `Подтверждение заказа #${order.id} - Kids Toys Shop`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3f51b5; margin: 0; font-size: 28px;">🛒 Заказ оформлен!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Уважаемый(ая) <strong>${user.name || customerInfo?.firstName || 'клиент'}</strong>!
              </p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Ваш заказ успешно оформлен и принят в обработку. Мы свяжемся с вами в ближайшее время для подтверждения.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #3f51b5; margin: 0 0 15px 0; font-size: 18px;">📋 Детали заказа</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                <div><strong>Номер заказа:</strong> #${order.id}</div>
                <div><strong>Дата заказа:</strong> ${new Date().toLocaleString('ru-RU')}</div>
                <div><strong>Самовывоз из:</strong> ${getStoreInfo(pickupStore).name}</div>
                <div><strong>Способ оплаты:</strong> ${paymentMethod === 'card' ? '💳 Карта' : '💰 Наличные'}</div>
              </div>
              <div style="margin-top: 10px; font-size: 14px;">
                <strong>Адрес магазина:</strong><br>
                ${getStoreInfo(pickupStore).address}
              </div>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">📦 Ваши товары</h3>
              <div style="margin-bottom: 15px;">
                ${order.items.map(item => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ffe0b2;">
                    <div style="flex: 1;">
                      <div style="font-weight: bold; color: #333;">${item.product.name}</div>
                      <div style="font-size: 12px; color: #666;">Количество: ${item.quantity} шт.</div>
                    </div>
                    <div style="font-weight: bold; color: #e65100; font-size: 16px;">
                      ${item.product.price * item.quantity} ₪
                    </div>
                  </div>
                `).join('')}
              </div>
              <div style="text-align: right; padding-top: 15px; border-top: 2px solid #ffcc02;">
                <div style="font-size: 20px; font-weight: bold; color: #e65100;">
                  Итого: ${totalAmount} ₪
                </div>
              </div>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">✅ Что дальше?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #2e7d32;">
                <li>Мы проверим наличие товаров</li>
                <li>Свяжемся с вами для подтверждения</li>
                <li>Сообщим о готовности к самовывозу</li>
                <li>Вы сможете забрать заказ в удобное время</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Спасибо за покупку в <strong>Kids Toys Shop</strong>! 🎉
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                Если у вас есть вопросы, свяжитесь с нами
              </p>
            </div>
          </div>
        </div>
      `;
      
      await sendEmail(user.email, emailSubject, emailHtml);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
    }
    
    // Возвращаем заказ и информацию о том, что корзина очищена
    res.json({
      order,
      cartCleared: true,
      message: 'Заказ успешно оформлен, корзина очищена'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Ошибка оформления заказа' });
  }
});

// === Оформление гостевого заказа (без авторизации) ===
app.post('/api/guest/checkout', async (req, res) => {
  try {
    console.log('🛒 Guest checkout request received:', req.body);
    const { customerInfo, pickupStore, paymentMethod, total, cartItems } = req.body;
    
    console.log('📋 Parsed data:', { customerInfo, pickupStore, paymentMethod, total, cartItems });
    
    // Валидация входных данных
    if (!customerInfo || !customerInfo.firstName || !customerInfo.lastName || 
        !customerInfo.email || !customerInfo.phone || !pickupStore || !cartItems || !cartItems.length) {
      console.log('❌ Validation failed:', { customerInfo, pickupStore, cartItems });
      return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля и добавить товары в корзину' });
    }
    
    // Проверяем наличие товара на складе
    console.log('🔍 Checking product availability...');
    for (const item of cartItems) {
      console.log('🔍 Checking product:', item);
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        console.log('❌ Product not found:', item.productId);
        return res.status(400).json({ error: `Товар не найден: ID ${item.productId}` });
      }
      if (item.quantity > product.quantity) {
        console.log('❌ Insufficient quantity:', { requested: item.quantity, available: product.quantity });
        return res.status(400).json({ error: `Недостаточно товара: ${product.name}` });
      }
      console.log('✅ Product available:', { productId: item.productId, quantity: product.quantity });
    }
    
    // Создаём гостевой заказ
    console.log('📝 Creating guest order...');
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
            price: item.price
          }))
        }
      },
      include: { 
        items: { include: { product: true } }
      }
    });
    
    // Уменьшаем количество на складе
    console.log('📦 Updating product quantities...');
    for (const item of cartItems) {
      console.log('📦 Updating product:', item.productId, 'quantity:', item.quantity);
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });
    }
    
    // Отправляем уведомление в Telegram
    console.log('📱 Sending Telegram notification...');
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const telegramMessage = `
🛒 <b>Новый гостевой заказ #${order.id}</b>

👤 <b>Клиент:</b> ${customerInfo.firstName} ${customerInfo.lastName}
📧 <b>Email:</b> ${customerInfo.email}
📱 <b>Телефон:</b> ${customerInfo.phone}
🏬 <b>Самовывоз из:</b> ${getStoreInfo(pickupStore).name} (${getStoreInfo(pickupStore).address})
💳 <b>Оплата:</b> ${paymentMethod === 'card' ? 'Карта' : 'Наличные'}

📦 <b>Товары:</b>
${cartItems.map(item => `• ${item.productName} x${item.quantity} - ${item.price * item.quantity} ₪`).join('\n')}

💰 <b>Итого:</b> ${totalAmount} ₪
📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}
      `.trim();
      await sendTelegramNotification(telegramMessage);
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
    }
    
    // Отправляем email подтверждения заказа гостю
    console.log('📧 Sending order confirmation email...');
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const emailSubject = `Подтверждение заказа #${order.id} - Kids Toys Shop`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3f51b5; margin: 0; font-size: 28px;">🛒 Заказ оформлен!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Уважаемый(ая) <strong>${customerInfo.firstName} ${customerInfo.lastName}</strong>!
              </p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Ваш заказ успешно оформлен и принят в обработку. Мы свяжемся с вами в ближайшее время для подтверждения.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #3f51b5; margin: 0 0 15px 0; font-size: 18px;">📋 Детали заказа</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                <div><strong>Номер заказа:</strong> #${order.id}</div>
                <div><strong>Дата заказа:</strong> ${new Date().toLocaleString('ru-RU')}</div>
                <div><strong>Самовывоз из:</strong> ${getStoreInfo(pickupStore).name}</div>
                <div><strong>Способ оплаты:</strong> ${paymentMethod === 'card' ? '💳 Карта' : '💰 Наличные'}</div>
              </div>
              <div style="margin-top: 10px; font-size: 14px;">
                <strong>Адрес магазина:</strong><br>
                ${getStoreInfo(pickupStore).address}
              </div>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">📦 Ваши товары</h3>
              <div style="margin-bottom: 15px;">
                ${cartItems.map(item => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ffe0b2;">
                    <div style="flex: 1;">
                      <div style="font-weight: bold; color: #333;">${item.productName}</div>
                      <div style="font-size: 12px; color: #666;">Количество: ${item.quantity} шт.</div>
                    </div>
                    <div style="font-weight: bold; color: #e65100; font-size: 16px;">
                      ${item.price * item.quantity} ₪
                    </div>
                  </div>
                `).join('')}
              </div>
              <div style="text-align: right; padding-top: 15px; border-top: 2px solid #ffcc02;">
                <div style="font-size: 20px; font-weight: bold; color: #e65100;">
                  Итого: ${totalAmount} ₪
                </div>
              </div>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">✅ Что дальше?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #2e7d32;">
                <li>Мы проверим наличие товаров</li>
                <li>Свяжемся с вами для подтверждения</li>
                <li>Сообщим о готовности к самовывозу</li>
                <li>Вы сможете забрать заказ в удобное время</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Спасибо за покупку в <strong>Kids Toys Shop</strong>! 🎉
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                Если у вас есть вопросы, свяжитесь с нами
              </p>
            </div>
          </div>
        </div>
      `;
      
      await sendEmail(customerInfo.email, emailSubject, emailHtml);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
    }
    
    console.log('✅ Guest order created successfully:', order.id);
    res.json({
      order,
      message: 'Гостевой заказ успешно оформлен'
    });
  } catch (error) {
    console.error('❌ Guest checkout error:', error);
    res.status(500).json({ error: 'Ошибка оформления гостевого заказа' });
  }
});

// === Получить конкретный заказ ===
app.get('/api/profile/orders/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Order fetch request:', { 
      orderId: req.params.id, 
      userId: req.user.userId,
      userRole: req.user.role 
    });
    
    // Проверяем, что orderId является числом
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      console.log('Invalid orderId:', req.params.id);
      return res.status(400).json({ error: 'Неверный ID заказа' });
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
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет доступа к заказу' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Ошибка получения заказа' });
  }
});

// === Отмена заказа ===
app.post('/api/profile/orders/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет доступа к отмене заказа' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Заказ уже отменён' });
    }
    // Возвращаем количество на склад
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } }
      });
    }
    // Меняем статус заказа
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' }
    });
    res.json({ message: 'Заказ отменён и количество возвращено на склад' });
  } catch (error) {
    console.error('Order cancel error:', error);
    res.status(500).json({ error: 'Ошибка отмены заказа' });
  }
});

// === Скрытие заказа пользователем ===
app.delete('/api/profile/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет доступа к скрытию заказа' });
    }
    
    // Проверяем, что заказ имеет статус "получен" или "отменен"
    if (order.status !== 'pickedup' && order.status !== 'cancelled') {
      return res.status(400).json({ error: 'Можно скрыть только заказы со статусом "Получен" или "Отменен"' });
    }
    
    // Скрываем заказ (добавляем в скрытые заказы пользователя)
    await prisma.userHiddenOrder.create({
      data: {
        userId: req.user.userId,
        orderId: order.id
      }
    });
    
    res.json({ message: 'Заказ скрыт из списка' });
  } catch (error) {
    console.error('Order hide error:', error);
    res.status(500).json({ error: 'Ошибка скрытия заказа' });
  }
});

// ВРЕМЕННАЯ МИГРАЦИЯ: переносим imageUrl в imageUrls
async function migrateImageUrls() {
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
}

migrateImageUrls().then(() => {
  
});

// Эндпоинт для изменения только поля isHidden
app.patch('/api/products/:id/hidden', authMiddleware, async (req, res) => {
  // Проверка роли admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
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

app.put('/api/products/:id', authMiddleware, upload.array('images', 7), 
  flexibleUploadMiddleware.processUploadedFiles.bind(flexibleUploadMiddleware), 
  async (req, res) => {
  // Проверка роли admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  try {
    const { name, description, price, category, subcategory, ageGroup, gender, quantity, article, brand, country, length, width, height, isHidden, removedImages, currentExistingImages, mainImageIndex } = req.body;
    
    console.log('API: Received product update data:', {
      name, description, price, category, subcategory, ageGroup, gender, quantity, article, brand, country, length, width, height, isHidden
    });
    
    // Получаем текущий товар для сохранения существующих изображений
    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!currentProduct) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Обрабатываем изображения
    let imageUrls = currentProduct.imageUrls || [];
    
    // Если передано текущее состояние существующих изображений, используем его
    if (currentExistingImages) {
      try {
        const parsedCurrentImages = JSON.parse(currentExistingImages);
        imageUrls = parsedCurrentImages;
      } catch (e) {
        console.error('Error parsing currentExistingImages:', e);
      }
    }
    
    // Добавляем новые изображения
    console.log('🖼️ PUT /api/products/:id - Обработка файлов');
    console.log('🖼️ PUT /api/products/:id - req.files =', req.files ? req.files.length : 'undefined');
    console.log('🖼️ PUT /api/products/:id - req.imageUrls =', req.imageUrls);
    
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file, index) => {
        console.log('🖼️ PUT /api/products/:id - Обработка файла:', file.originalname);
        console.log('🖼️ PUT /api/products/:id - file.filename =', file.filename);
        
        // Используем URL из Cloudinary или локальные пути
        if (req.imageUrls && req.imageUrls[index]) {
          // Используем URL из Cloudinary
          const url = req.imageUrls[index];
          console.log('🖼️ PUT /api/products/:id - Используем Cloudinary URL:', url);
          return url;
        } else if (file.filename) {
          // Fallback для локальных файлов
          const url = `/uploads/${file.filename}`;
          console.log('🖼️ PUT /api/products/:id - Используем file.filename:', url);
          return url;
        } else {
          // Fallback для production
          const url = `/uploads/${Date.now()}_${file.originalname}`;
          console.log('🖼️ PUT /api/products/:id - Fallback URL:', url);
          return url;
        }
      });
      imageUrls = [...imageUrls, ...newImageUrls];
      console.log('🖼️ PUT /api/products/:id - Итоговые imageUrls:', imageUrls);
    }
    
    // Переупорядочиваем изображения, если указан главный индекс
    if (mainImageIndex !== undefined && imageUrls.length > 0) {
      const mainIndex = parseInt(mainImageIndex);
      if (mainIndex >= 0 && mainIndex < imageUrls.length) {
        const mainImage = imageUrls[mainIndex];
        // Перемещаем главное изображение в начало массива
        imageUrls = [mainImage, ...imageUrls.filter((_, index) => index !== mainIndex)];
      }
    }
    
    // Получаем название категории по ID
    let categoryName = category;
    if (category && !isNaN(category)) {
      const categoryRecord = await prisma.category.findUnique({
        where: { id: parseInt(category) }
      });
      categoryName = categoryRecord ? categoryRecord.name : category;
      console.log('API: Category processing - category:', category, 'categoryName:', categoryName);
    }

    // Получаем ID подкатегории
    let subcategoryId = null;
    if (subcategory) {
      // Если subcategory - это ID, используем его напрямую
      if (!isNaN(subcategory)) {
        subcategoryId = parseInt(subcategory);
        console.log('API: Subcategory processing - subcategory ID:', subcategoryId);
      } else {
        // Если subcategory - это название, ищем по названию
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
    
    // Проверяем, существуют ли категории перед обновлением
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
    
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryName: categoryName,
        categoryId: category && !isNaN(category) ? parseInt(category) : null,
        subcategoryId: subcategoryId,
        ageGroup,
        gender,
        imageUrls,
        ...(quantity !== undefined ? { quantity: parseInt(quantity) } : {}),
        ...(isHidden !== undefined ? { isHidden: isHidden === 'true' || isHidden === true } : {}),
        // Дополнительные поля:
        article: article || null,
        brand: brand || null,
        country: country || null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null
      },
      include: {
        category: {
          select: { id: true, name: true }
        },
        subcategory: {
          select: { id: true, name: true }
        }
      }
    });
    
    console.log('API: Product updated successfully:', updated.id);
    console.log('API: Updated product category:', updated.category);
    console.log('API: Updated product subcategory:', updated.subcategory);
    console.log('API: Updated product categoryId:', updated.categoryId);
    console.log('API: Updated product subcategoryId:', updated.subcategoryId);
    
    // Проверяем, существуют ли связанные записи
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
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Удалить изображение товара
app.delete('/api/products/:id/images/:imageIndex', authMiddleware, async (req, res) => {
  // Проверка роли admin
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  
  try {
    const productId = parseInt(req.params.id);
    const imageIndex = parseInt(req.params.imageIndex);
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const imageUrls = product.imageUrls || [];
    if (imageIndex < 0 || imageIndex >= imageUrls.length) {
      return res.status(400).json({ error: 'Неверный индекс изображения' });
    }
    
    // Удаляем изображение из массива
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

// === Admin: получить все заказы ===
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Добавляем расчет суммы для каждого заказа и обрабатываем гостевые заказы
    const ordersWithTotal = orders.map(order => ({
      ...order,
      total: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      // Для гостевых заказов добавляем информацию о госте
      user: order.user || {
        name: order.guestName || 'Гостевой заказ',
        email: order.guestEmail || 'Не указано',
        phone: order.guestPhone || 'Не указано'
      }
    }));
    
    res.json(ordersWithTotal);
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});

// === Admin: изменить статус заказа ===
app.put('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  try {
    const { status } = req.body;

    
    // Получаем информацию о заказе и пользователе
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
    
    // Отправляем уведомление в Telegram об изменении статуса
    try {
              const statusText = {
          'pending': 'Ожидает подтверждения',
          'confirmed': 'Подтвержден',
          'ready': 'Готов к выдаче',
          'pickedup': 'Получен',
          'cancelled': 'Отменен'
        }[status] || status;
      
      const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const telegramMessage = `
🔄 <b>Статус заказа изменен</b>

📦 <b>Заказ #${order.id}</b>
👤 <b>Клиент:</b> ${order.user?.name || 'Не указано'}
📧 <b>Email:</b> ${order.user?.email || 'Не указано'}
🏬 <b>Магазин:</b> ${getStoreInfo(order.pickupStore).name} (${getStoreInfo(order.pickupStore).address})

💰 <b>Сумма:</b> ${totalAmount} ₪
📅 <b>Новый статус:</b> ${statusText}
⏰ <b>Время изменения:</b> ${new Date().toLocaleString('ru-RU')}
      `.trim();
      
      await sendTelegramNotification(telegramMessage);
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
    }
    
    // В endpoint смены статуса заказа (например, PUT /api/admin/orders/:id):
    // После успешного обновления статуса на 'delivered':
    
    if (status === 'pickedup') {
      
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'review_request',
            title: 'Оставьте отзыв о вашей покупке',
            message: 'Пожалуйста, уделите пару минут вашего времени, оцените магазин и товары. Ваше мнение важно для нас, и других покупателей!',
            actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/review-order?orderId=${order.id}`,
            actionText: 'Оставить отзыв'
          }
        });
        
      } catch (error) {
        console.error('Ошибка создания уведомления:', error);
      }
    } else {
      
    }
    
    
    res.json(updated);
  } catch (error) {
    console.error('Admin order status update error:', error);
    res.status(500).json({ error: 'Ошибка изменения статуса заказа' });
  }
});

// === Admin: удалить заказ ===
app.delete('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  try {
    const orderId = parseInt(req.params.id);
    
    console.log('DELETE /api/admin/orders/:id - Starting deletion process');
    console.log('DELETE /api/admin/orders/:id - Order ID:', orderId);
    
    // Сначала удаляем связанные данные
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
    
    // Теперь удаляем сам заказ
    console.log('DELETE /api/admin/orders/:id - Deleting order...');
    await prisma.order.delete({ 
      where: { id: orderId } 
    });
    console.log('DELETE /api/admin/orders/:id - Order deleted successfully');
    
    res.json({ message: 'Заказ удалён' });
  } catch (error) {
    console.error('DELETE /api/admin/orders/:id - Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ error: 'Ошибка удаления заказа' });
  }
});

// --- Магазины ---
app.get('/api/stores', async (req, res) => {
  try {
    const stores = [
      { id: 'store1', name: 'חנות קריית ים', address: 'רוברט סולד 8 קריית ים' },
      { id: 'store2', name: 'חנות קריית מוצקין', address: 'ויצמן 6 קריית מוצקין' }
    ];
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Ошибка получения списка магазинов' });
  }
});

// --- Категории ---
app.get('/api/categories', async (req, res) => {
  try {
    // Проверяем, является ли пользователь администратором
    const token = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        isAdmin = user?.role === 'admin';
      } catch (e) {
        // Токен недействителен, но это не критично для получения категорий
      }
    }
    
    // Если администратор - возвращаем все категории, иначе только активные
    let whereClause = isAdmin ? {} : { active: true };
    
    // Добавляем фильтрацию по parentId если указан
    if (req.query.parentId) {
      whereClause.parentId = parseInt(req.query.parentId);
    }
    
    const categories = await prisma.category.findMany({ 
      where: whereClause,
      orderBy: { order: 'asc' }
    });

    // Функция для получения fallback иконки по названию категории
    const getCategoryIcon = (categoryName) => {
      const iconMap = {
        'Игрушки': '/toys.png',
        'Конструкторы': '/constructor.png',
        'Пазлы': '/puzzle.png',
        'Творчество': '/creativity.png',
        'Канцтовары': '/stationery.png',
        'Транспорт': '/bicycle.png',
        'Отдых на воде': '/voda.png',
        'Настольные игры': '/nastolka.png',
        'Развивающие игры': '/edu_game.png',
        'Акции': '/sale.png'
      };
      return iconMap[categoryName] || '/toys.png';
    };

    // Добавляем fallback иконки для категорий без изображений
    const categoriesWithIcons = categories.map(category => ({
      ...category,
      image: category.image || getCategoryIcon(category.name)
    }));

    res.json(categoriesWithIcons);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
});

// Получить все категории (включая отключенные) для администраторов
app.get('/api/admin/categories', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });

    // Функция для получения fallback иконки по названию категории
    const getCategoryIcon = (categoryName) => {
      const iconMap = {
        'Игрушки': '/toys.png',
        'Конструкторы': '/constructor.png',
        'Пазлы': '/puzzle.png',
        'Творчество': '/creativity.png',
        'Канцтовары': '/stationery.png',
        'Транспорт': '/bicycle.png',
        'Отдых на воде': '/voda.png',
        'Настольные игры': '/nastolka.png',
        'Развивающие игры': '/edu_game.png',
        'Акции': '/sale.png'
      };
      return iconMap[categoryName] || '/toys.png';
    };

    // Добавляем fallback иконки для категорий без изображений
    const categoriesWithIcons = categories.map(category => ({
      ...category,
      image: category.image || getCategoryIcon(category.name)
    }));

    res.json(categoriesWithIcons);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
});

app.patch('/api/categories/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    
    const id = Number(req.params.id);
    console.log('API: Toggle категории ID:', id);
    
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      console.log('API: Категория не найдена ID:', id);
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    console.log('API: Текущее состояние категории:', category.name, 'active:', category.active);
    const newActiveState = !category.active;
    console.log('API: Новое состояние active:', newActiveState);
    
    const updated = await prisma.category.update({
      where: { id },
      data: { active: newActiveState }
    });
    
    console.log('API: Категория обновлена:', updated.name, 'active:', updated.active);
    
    // Проверяем, что обновление действительно произошло
    const verification = await prisma.category.findUnique({ where: { id } });
    console.log('API: Проверка после обновления:', verification.name, 'active:', verification.active);
    
    res.json(updated);
  } catch (e) {
    console.error('API: Ошибка toggle категории:', e);
    res.status(500).json({ error: 'Ошибка обновления категории' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: 'Категория не найдена' });
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка получения категории' });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка удаления категории' });
  }
});

// Обновление порядка категорий
app.put('/api/categories/reorder', authMiddleware, async (req, res) => {
  try {

    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {

      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    
    const { categoryIds } = req.body; // массив ID категорий в новом порядке
    
    
    if (!Array.isArray(categoryIds)) {
      
      return res.status(400).json({ error: 'categoryIds должен быть массивом' });
    }
    
    
    
    // Обновляем порядок категорий
    for (let i = 0; i < categoryIds.length; i++) {
      const categoryId = Number(categoryIds[i]);
      
      
      await prisma.category.update({
        where: { id: categoryId },
        data: { order: i }
      });
    }
    
    
    res.json({ success: true, message: 'Порядок категорий обновлен' });
  } catch (e) {
    console.error('Ошибка обновления порядка категорий:', e);
    res.status(500).json({ error: 'Ошибка обновления порядка категорий' });
  }
});

app.put('/api/categories/:id', authMiddleware, upload.single('image'), productionUploadMiddleware.processSingleImage.bind(productionUploadMiddleware), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    const id = Number(req.params.id);
    const { name, parentId } = req.body;
    const data = { name };
    if (parentId !== undefined && parentId !== null && parentId !== '') {
      data.parentId = Number(parentId);
    } else {
      data.parentId = null;
    }
    
    // Если загружено новое изображение, добавляем его в данные
    if (req.file) {
      data.image = req.file.filename;
      console.log('API: Обновление изображения категории:', req.file.filename);
    }
    
    console.log('API: Обновление категории ID:', id, 'Данные:', data);
    const updated = await prisma.category.update({ where: { id }, data });
    console.log('API: Категория обновлена:', updated);
    res.json(updated);
  } catch (e) {
    console.error('API: Ошибка редактирования категории:', e);
    res.status(500).json({ error: 'Ошибка редактирования категории' });
  }
});

app.post('/api/categories', authMiddleware, upload.single('image'), productionUploadMiddleware.processSingleImage.bind(productionUploadMiddleware), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    const { name, parentId } = req.body;
    const data = { name };
    if (parentId !== undefined && parentId !== null && parentId !== '') {
      data.parentId = Number(parentId);
    }
    
    // Если загружено изображение, добавляем его в данные
    if (req.file) {
      data.image = req.file.filename;
    }
    
    // Находим максимальный порядок для категорий того же уровня
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
    res.status(500).json({ error: 'Ошибка создания категории' });
  }
});

app.patch('/api/categories/:id/image', authMiddleware, upload.single('image'), imageMiddleware.processSingleImage.bind(imageMiddleware), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }
    
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Нет файла' });
    const updated = await prisma.category.update({
      where: { id },
      data: { image: req.file.filename }
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки изображения категории' });
  }
});

// Получить отзывы по товару (только published)
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

// Оставить отзыв (только если пользователь заказывал этот товар)
app.post('/api/products/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, text } = req.body;
    const productId = parseInt(req.params.id);
    const userId = req.user.userId;
    // Проверяем, был ли заказ этого товара этим пользователем
    const orderWithProduct = await prisma.order.findFirst({
      where: {
        userId,
        items: { some: { productId } }
      }
    });
    if (!orderWithProduct) {
      return res.status(403).json({ error: 'Вы можете оставить отзыв только после покупки этого товара.' });
    }
    // Проверяем, не оставлял ли уже отзыв
    const existing = await prisma.review.findFirst({ where: { productId, userId } });
    if (existing) {
      return res.status(400).json({ error: 'Вы уже оставили отзыв на этот товар.' });
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

// Получить все отзывы (для админа, с фильтрацией по статусу)
app.get('/api/admin/reviews', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
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

// Модерация отзыва (published/rejected)
app.put('/api/admin/reviews/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  try {
    const { status } = req.body; // 'published' или 'rejected'
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Некорректный статус' });
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

// === Получить избранное пользователя ===
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
    res.status(500).json({ error: 'Ошибка получения избранного' });
  }
});

// === Добавить товар в избранное ===
app.post('/api/profile/wishlist/add', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId обязателен' });
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: req.user.userId } });
    }
    const existing = await prisma.wishlistItem.findFirst({ where: { wishlistId: wishlist.id, productId } });
    if (existing) return res.status(400).json({ error: 'Товар уже в избранном' });
    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
    const updated = await prisma.wishlist.findUnique({ where: { id: wishlist.id }, include: { items: { include: { product: true } } } });
    res.json(updated);
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ error: 'Ошибка добавления в избранное' });
  }
});

// === Удалить товар из избранного ===
app.post('/api/profile/wishlist/remove', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId обязателен' });
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.userId } });
    if (!wishlist) return res.status(404).json({ error: 'Избранное не найдено' });
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
    const updated = await prisma.wishlist.findUnique({ where: { id: wishlist.id }, include: { items: { include: { product: true } } } });
    res.json(updated);
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ error: 'Ошибка удаления из избранного' });
  }
});

// === Смена пароля ===
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'Новый пароль обязателен' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем, есть ли у пользователя пароль (не OAuth пользователь)
    if (user.passwordHash) {
      // Пользователь с паролем - проверяем текущий пароль
      if (!currentPassword) {
        return res.status(400).json({ error: 'Текущий пароль обязателен для пользователей с паролем' });
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Неверный текущий пароль' });
      }
    } else {
      // OAuth пользователь (Google/Facebook) - не проверяем текущий пароль
      if (currentPassword) {
        return res.status(400).json({ error: 'Для пользователей с OAuth текущий пароль не требуется' });
      }
    }
    
    // Хешируем новый пароль
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });
    
    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Ошибка смены пароля' });
  }
});

// === Admin: получить всех пользователей ===
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// === Admin: удалить пользователя ===
app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  const userId = parseInt(req.params.id);
  if (userId === admin.id) {
    return res.status(400).json({ error: 'Нельзя удалить самого себя' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ error: 'Нельзя удалить другого администратора' });
  }
  try {
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({ error: 'Ошибка удаления пользователя' });
  }
});

// === Admin: отправить уведомление пользователю ===
app.post('/api/admin/users/:id/notify', authMiddleware, async (req, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  const userId = parseInt(req.params.id);
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Текст уведомления обязателен' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  // Создаём уведомление в базе
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'admin',
      title: 'Сообщение от администратора',
      message: message,
      isRead: false
    }
  });
  res.json({ success: true });
});

// === Получить уведомления пользователя ===
app.get('/api/profile/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    res.status(500).json({ error: 'Ошибка получения уведомлений' });
  }
});

// === Получить количество непрочитанных уведомлений пользователя ===
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
    console.error('Ошибка получения количества непрочитанных уведомлений:', error);
    res.status(500).json({ error: 'Ошибка получения количества непрочитанных уведомлений' });
  }
});

// === Удалить одно уведомление пользователя ===
app.delete('/api/profile/notifications/:id', authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Некорректный id уведомления' });
    }
    // Удаляем только если уведомление принадлежит пользователю
    const deleted = await prisma.notification.deleteMany({
      where: { id: notificationId, userId: req.user.userId }
    });
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления уведомления:', error);
    res.status(500).json({ error: 'Ошибка удаления уведомления' });
  }
});

// === Удалить все уведомления пользователя ===
app.delete('/api/profile/notifications', authMiddleware, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.userId }
    });
    res.json({ message: 'Все уведомления удалены' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Ошибка удаления уведомлений' });
  }
});

// === Подписка на уведомления о наличии товара ===
app.post('/api/products/:id/notify-availability', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { email, productId: bodyProductId } = req.body;
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Некорректный id товара' });
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email обязателен' });
    }
    
    // Проверяем, что товар существует
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Проверяем, что товар действительно отсутствует
    if (product.quantity > 0) {
      return res.status(400).json({ error: 'Товар уже в наличии' });
    }
    
    // Сохраняем подписку на уведомления
    await prisma.availabilityNotification.upsert({
      where: {
        email_productId: {
          email: email.toLowerCase().trim(),
          productId: productId
        }
      },
      update: {
        createdAt: new Date()
      },
      create: {
        email: email.toLowerCase().trim(),
        productId: productId,
        createdAt: new Date()
      }
    });
    
    res.json({ message: 'Подписка на уведомления успешно оформлена' });
  } catch (error) {
    console.error('Error subscribing to availability notifications:', error);
    res.status(500).json({ error: 'Ошибка подписки на уведомления' });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Server failed to start:', err);
  } else {
    
  }
});

process.on('SIGINT', async () => {

  await prisma.$disconnect();
  process.exit(0);
});

// POST /api/reviews/shop — создать отзыв о магазине
app.post('/api/reviews/shop', authMiddleware, async (req, res) => {
  try {
    const { orderId, rating, text } = req.body;
    console.log('Shop review request:', { orderId, rating, text, userId: req.user.userId });
    
    if (!orderId || !rating) {
      console.log('Missing required fields:', { orderId, rating });
      return res.status(400).json({ error: 'orderId и rating обязательны' });
    }
    
    // Преобразуем типы
    const parsedOrderId = parseInt(orderId);
    const parsedRating = parseInt(rating);
    
    console.log('Parsed values:', { parsedOrderId, parsedRating });
    
    // Проверяем, что пользователь действительно делал этот заказ
    const order = await prisma.order.findUnique({ where: { id: parsedOrderId } });
    console.log('Order found:', order ? { id: order.id, userId: order.userId } : null);
    
    if (!order || order.userId !== req.user.userId) {
      console.log('Access denied: order not found or user mismatch');
      return res.status(403).json({ error: 'Нет доступа к заказу' });
    }
    
    // Проверяем, что отзыв по этому заказу ещё не оставлен
    const existing = await prisma.shopReview.findFirst({ where: { orderId: parsedOrderId, userId: req.user.userId } });
    console.log('Existing shop review check:', existing ? { id: existing.id } : 'No existing review');
    
    if (existing) {
      console.log('Shop review already exists');
      return res.status(400).json({ error: 'Отзыв по этому заказу уже оставлен' });
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
    res.status(500).json({ error: 'Ошибка создания отзыва о магазине' });
  }
});

// GET /api/reviews/shop/published — получить только опубликованные отзывы о магазине
app.get('/api/reviews/shop/published', async (req, res) => {
  try {
    const reviews = await prisma.shopReview.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, surname: true } } }
    });

    res.json(reviews);
  } catch (error) {
    console.error('API: Ошибка получения опубликованных отзывов о магазине:', error);
    res.status(500).json({ error: 'Ошибка получения отзывов о магазине' });
  }
});

// GET /api/reviews/shop — получить все отзывы о магазине (для модерации)
app.get('/api/reviews/shop', async (req, res) => {
  try {
    // Проверяем, является ли пользователь админом
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
    console.error('API: Ошибка получения отзывов о магазине:', error);
    res.status(500).json({ error: 'Ошибка получения отзывов о магазине' });
  }
});

// PUT /api/admin/reviews/shop/:id — модерация отзыва о магазине
app.put('/api/admin/reviews/shop/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Shop review moderation request:', { 
      reviewId: req.params.id, 
      status: req.body.status, 
      body: req.body,
      userId: req.user.userId,
      userRole: req.user.role 
    });
    
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
    const { status } = req.body;
    console.log('Validating shop review status:', status, 'Valid statuses:', ['published', 'rejected', 'pending', 'hidden']);
    if (!['published', 'rejected', 'pending', 'hidden'].includes(status)) {
      console.log('Invalid shop review status:', status);
      return res.status(400).json({ error: 'Некорректный статус' });
    }
    
    const review = await prisma.shopReview.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    
    console.log('Shop review updated successfully:', { id: review.id, status: review.status });
    res.json(review);
  } catch (error) {
    console.error('Error updating shop review:', error);
    res.status(500).json({ error: 'Ошибка модерации отзыва о магазине' });
  }
});

// DELETE /api/admin/reviews/shop/:id — удаление отзыва о магазине
app.delete('/api/admin/reviews/shop/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
    await prisma.shopReview.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Отзыв о магазине удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления отзыва о магазине' });
  }
});

// POST /api/reviews/product — создать отзыв о товаре
app.post('/api/reviews/product', authMiddleware, async (req, res) => {
  try {
    const { orderId, productId, rating, text } = req.body;
    console.log('Product review request:', { orderId, productId, rating, text, userId: req.user.userId });
    
    if (!orderId || !productId || !rating) {
      console.log('Missing required fields:', { orderId, productId, rating });
      return res.status(400).json({ error: 'orderId, productId и rating обязательны' });
    }
    
    // Преобразуем типы
    const parsedOrderId = parseInt(orderId);
    const parsedProductId = parseInt(productId);
    const parsedRating = parseInt(rating);
    
    console.log('Parsed values:', { parsedOrderId, parsedProductId, parsedRating });
    
    // Проверяем, что пользователь действительно заказывал этот товар
    const order = await prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: { items: true }
    });
    
    console.log('Order found:', order ? { id: order.id, userId: order.userId, itemsCount: order.items.length } : null);
    
    if (!order || order.userId !== req.user.userId) {
      console.log('Access denied: order not found or user mismatch');
      return res.status(403).json({ error: 'Нет доступа к заказу' });
    }
    
    const hasProduct = order.items.some(item => item.productId === parsedProductId);
    console.log('Product check:', { hasProduct, orderItems: order.items.map(item => ({ productId: item.productId, quantity: item.quantity })) });
    
    if (!hasProduct) {
      console.log('Product not found in order');
      return res.status(400).json({ error: 'Товар не найден в заказе' });
    }
    
    // Проверяем, что отзыв по этому товару и заказу ещё не оставлен
    const existing = await prisma.review.findFirst({ 
      where: { orderId: parsedOrderId, productId: parsedProductId, userId: req.user.userId } 
    });
    
    console.log('Existing review check:', existing ? { id: existing.id } : 'No existing review');
    
    if (existing) {
      console.log('Review already exists');
      return res.status(400).json({ error: 'Отзыв по этому товару уже оставлен' });
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
    res.status(500).json({ error: 'Ошибка создания отзыва о товаре' });
  }
});

// GET /api/reviews/product/:productId — получить все опубликованные отзывы о товаре
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
    res.status(500).json({ error: 'Ошибка получения отзывов о товаре' });
  }
});

// GET /api/admin/reviews/product — получить все отзывы о товарах для CMS
app.get('/api/admin/reviews/product', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, surname: true, email: true } }, product: { select: { name: true } } }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения отзывов о товарах' });
  }
});

// PUT /api/admin/reviews/product/:id — модерация отзыва о товаре
app.put('/api/admin/reviews/product/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Product review moderation request:', { 
      reviewId: req.params.id, 
      status: req.body.status, 
      body: req.body,
      userId: req.user.userId,
      userRole: req.user.role 
    });
    
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
    const { status } = req.body;
    console.log('Validating product review status:', status, 'Valid statuses:', ['published', 'rejected', 'pending', 'hidden']);
    if (!['published', 'rejected', 'pending', 'hidden'].includes(status)) {
      console.log('Invalid product review status:', status);
      return res.status(400).json({ error: 'Некорректный статус' });
    }
    
    const review = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    
    console.log('Product review updated successfully:', { id: review.id, status: review.status });
    res.json(review);
  } catch (error) {
    console.error('Error updating product review:', error);
    res.status(500).json({ error: 'Ошибка модерации отзыва о товаре' });
  }
});

// DELETE /api/admin/reviews/product/:id — удаление отзыва о товаре
app.delete('/api/admin/reviews/product/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
    await prisma.review.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Отзыв о товаре удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления отзыва о товаре' });
  }
});

// GET /api/profile/reviews/shop — получить все отзывы пользователя о магазине (исключая скрытые)
app.get('/api/profile/reviews/shop', authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.shopReview.findMany({
      where: { 
        userId: req.user.userId,
        // Исключаем скрытые отзывы о магазине
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
    res.status(500).json({ error: 'Ошибка получения отзывов о магазине' });
  }
});

// GET /api/profile/reviews/product — получить все отзывы пользователя о товарах (исключая скрытые)
app.get('/api/profile/reviews/product', authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { 
        userId: req.user.userId,
        // Показываем все отзывы пользователя (не только опубликованные)
        // Исключаем скрытые отзывы
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
    res.status(500).json({ error: 'Ошибка получения отзывов о товарах' });
  }
});

// POST /api/profile/reviews/product/:id/hide — скрыть отзыв из списка пользователя
app.post('/api/profile/reviews/product/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // Проверяем, что отзыв принадлежит пользователю
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: req.user.userId
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    
    // Создаем запись о скрытом отзыве
    await prisma.hiddenReview.create({
      data: {
        userId: req.user.userId,
        reviewId: reviewId
      }
    });
    
    res.json({ message: 'Отзыв скрыт из списка' });
  } catch (error) {
    if (error.code === 'P2002') {
      // Отзыв уже скрыт
      res.json({ message: 'Отзыв уже скрыт' });
    } else {
      res.status(500).json({ error: 'Ошибка скрытия отзыва' });
    }
  }
});

// DELETE /api/profile/reviews/product/:id/hide — показать отзыв в списке пользователя
app.delete('/api/profile/reviews/product/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // Удаляем запись о скрытом отзыве
    await prisma.hiddenReview.deleteMany({
      where: {
        userId: req.user.userId,
        reviewId: reviewId
      }
    });
    
    res.json({ message: 'Отзыв показан в списке' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка показа отзыва' });
  }
});

// POST /api/profile/reviews/shop/:id/hide — скрыть отзыв о магазине из списка пользователя
app.post('/api/profile/reviews/shop/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // Проверяем, что отзыв принадлежит пользователю
    const review = await prisma.shopReview.findFirst({
      where: {
        id: reviewId,
        userId: req.user.userId
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    
    // Создаем запись о скрытом отзыве о магазине
    await prisma.hiddenShopReview.create({
      data: {
        userId: req.user.userId,
        shopReviewId: reviewId
      }
    });
    
    res.json({ message: 'Отзыв о магазине скрыт из списка' });
  } catch (error) {
    if (error.code === 'P2002') {
      // Отзыв уже скрыт
      res.json({ message: 'Отзыв о магазине уже скрыт' });
    } else {
      res.status(500).json({ error: 'Ошибка скрытия отзыва о магазине' });
    }
  }
});

// DELETE /api/profile/reviews/shop/:id/hide — показать отзыв о магазине в списке пользователя
app.delete('/api/profile/reviews/shop/:id/hide', authMiddleware, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // Удаляем запись о скрытом отзыве о магазине
    await prisma.hiddenShopReview.deleteMany({
      where: {
        userId: req.user.userId,
        shopReviewId: reviewId
      }
    });
    
    res.json({ message: 'Отзыв о магазине показан в списке' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка показа отзыва о магазине' });
  }
});

// POST /api/admin/clear-all-data — очистить все данные (только для администраторов)
app.post('/api/admin/clear-all-data', authMiddleware, async (req, res) => {
  try {
    // Проверяем, что пользователь является администратором
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }

    console.log('🧹 Администратор инициировал очистку всех данных...');

    // Очищаем данные в правильном порядке (сначала зависимые таблицы)
    const results = {};

    // Скрытые отзывы
    results.hiddenReviews = await prisma.hiddenReview.deleteMany({});
    
    // Отзывы о товарах
    results.reviews = await prisma.review.deleteMany({});
    
    // Отзывы о магазине
    results.shopReviews = await prisma.shopReview.deleteMany({});
    
    // Элементы заказов
    results.orderItems = await prisma.orderItem.deleteMany({});
    
    // Заказы
    results.orders = await prisma.order.deleteMany({});
    
    // Элементы корзины
    results.cartItems = await prisma.cartItem.deleteMany({});
    
    // Корзины
    results.carts = await prisma.cart.deleteMany({});
    
    // Элементы избранного
    results.wishlistItems = await prisma.wishlistItem.deleteMany({});
    
    // Списки избранного
    results.wishlists = await prisma.wishlist.deleteMany({});
    
    // Уведомления
    results.notifications = await prisma.notification.deleteMany({});
    
    // Уведомления о наличии товаров
    results.availabilityNotifications = await prisma.availabilityNotification.deleteMany({});

    console.log('✅ Очистка завершена успешно!');
    
    res.json({
      message: 'Все данные успешно очищены',
      statistics: results
    });

  } catch (error) {
    console.error('❌ Ошибка при очистке данных:', error);
    res.status(500).json({ error: 'Ошибка очистки данных' });
  }
});

// === Очистить старые уведомления с неправильными actionUrl ===
app.delete('/api/admin/notifications/cleanup', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  
  try {
    // Удаляем уведомления с actionUrl, содержащими 'latest'
    const deletedCount = await prisma.notification.deleteMany({
      where: {
        actionUrl: {
          contains: 'latest'
        }
      }
    });
    
    res.json({ 
      message: `Удалено ${deletedCount.count} уведомлений с неправильными ссылками`,
      deletedCount: deletedCount.count
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({ error: 'Ошибка очистки уведомлений' });
  }
});

// === Создать тестовое уведомление ===
app.post('/api/admin/notifications/test', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
  }
  
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'orderId обязателен' });
    }
    
    // Проверяем, что заказ существует
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    const notification = await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'review_request',
        title: 'Оставьте отзыв о вашей покупке (тест)',
        message: 'Пожалуйста, уделите пару минут вашего времени, оцените магазин и товары. Ваше мнение важно для нас, и других покупателей!',
        actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/review-order?orderId=${order.id}`,
        actionText: 'Оставить отзыв'
      }
    });
    
    res.json({ 
      message: 'Тестовое уведомление создано',
      notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: 'Ошибка создания тестового уведомления' });
  }
});

// === Очистить старые уведомления с неправильными actionUrl ===

// === Получить список всех заказов пользователя (для отладки) ===
app.get('/api/admin/orders/list', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
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
    res.status(500).json({ error: 'Ошибка при получении списка заказов' });
  }
});

// GET /api/reviews/product — получить все отзывы о товарах для модерации
app.get('/api/reviews/product', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
    
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true, surname: true } },
        product: { select: { name: true } }
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error('API: Ошибка получения отзывов о товарах:', error);
    res.status(500).json({ error: 'Ошибка получения отзывов о товарах' });
  }
});

// === API для статистики изображений ===
app.get('/api/admin/images/stats', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }

    const processor = new BatchImageProcessor();
    const stats = await processor.getImageStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting image stats:', error);
    res.status(500).json({ error: 'Ошибка получения статистики изображений' });
  }
});

// === API для пакетной обработки изображений ===
app.post('/api/admin/images/process', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }

    const processor = new BatchImageProcessor();
    
    // Получаем статистику до обработки
    const statsBefore = await processor.getImageStats();
    
    // Обрабатываем изображения
    const productResults = await processor.processAllProductImages();
    const categoryResults = await processor.processCategoryImages();
    
    // Получаем статистику после обработки
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
    res.status(500).json({ error: 'Ошибка обработки изображений' });
  }
});

// === API для исправления изображений категорий ===
app.post('/api/admin/fix-category-images', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: только для администратора' });
    }

    // Маппинг категорий на правильные fallback изображения
    const categoryImageMapping = {
      'Настольные игры': 'nastolka.png',
      'Рисование': 'creativity.png',
      'Наборы для творчества': 'creativity.png',
      'Раскраски': 'creativity.png',
      'Куклы': 'toys.png',
      'Мягкие игрушки': 'toys.png',
      'Активные игры': 'sport.png',
      'Декоративная косметика и украшения': 'toys.png',
      'Роботы и трансформеры': 'toys.png',
      'Игрушки на радиоуправлении': 'toys.png'
    };

    // Получаем все категории
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    let updatedCount = 0;
    const updatedCategories = [];

    // Проверяем каждую категорию
    for (const category of categories) {
      let needsUpdate = false;
      let newImage = category.image;

      // Если изображение начинается с цифр (загруженный файл), заменяем на fallback
      if (category.image && /^\d+/.test(category.image)) {
        needsUpdate = true;
        newImage = categoryImageMapping[category.name] || 'toys.png';
      }

      // Если изображение не соответствует маппингу, исправляем
      if (categoryImageMapping[category.name] && category.image !== categoryImageMapping[category.name]) {
        needsUpdate = true;
        newImage = categoryImageMapping[category.name];
      }

      // Обновляем категорию если нужно
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
      message: `Исправлено ${updatedCount} категорий`,
      updatedCount,
      updatedCategories
    });

  } catch (error) {
    console.error('Error fixing category images:', error);
    res.status(500).json({ error: 'Ошибка исправления изображений категорий' });
  }
});