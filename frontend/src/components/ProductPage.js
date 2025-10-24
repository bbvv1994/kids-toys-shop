import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { API_BASE_URL, FRONTEND_URL, getImageUrl, getHdImageUrl } from '../config';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTranslatedName, getTranslatedDescription } from '../utils/translationUtils';
import { useDeviceType } from '../utils/deviceDetection';
import { Box, Button, Typography, Container, Modal, Rating, TextField, Chip, IconButton, Breadcrumbs, useMediaQuery, useTheme } from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import ProductCard from './ProductCard';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Lottie from 'lottie-react';
import addToCartAnim from '../lottie/cart checkout - fast.json';
import wishlistHeartAnim from '../lottie/wishlist-heart.json';
import { getCategoryIcon } from '../utils/categoryIcon';

const ageIcons = {
  '0-1 год': '/age-icons/0-1.png',
  '1-3 года': '/age-icons/1-3.png',
  '3-5 лет': '/age-icons/3-5.png',
  '5-7 лет': '/age-icons/5-7.png',
  '7-10 лет': '/age-icons/7-10.png',
  '10-12 лет': '/age-icons/10-12.png',
  '12-14 лет': '/age-icons/12-14.png',
  '14-16 лет': '/age-icons/14-16.png'
};

// Новый современный дизайн страницы товара
export default function ProductPage({ onAddToCart, cart, user, onChangeCartQuantity, onEditProduct, dbCategories, productId, wishlist, onWishlistToggle }) {
  const { t, i18n } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // до 900px
  
  // Функция для форматирования даты в зависимости от языка
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (i18n.language === 'he') {
      // Для иврита используем цифровой формат
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Для русского используем текстовый формат
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  

  

  
  // Функция для перевода категорий
  const translateCategory = (categoryName) => {
    const categoryMap = {
      'Игрушки': 'toys',
      'Конструкторы': 'constructors', 
      'Пазлы': 'puzzles',
      'Творчество': 'creativity',
      'Канцтовары': 'stationery',
      'Транспорт': 'transport',
      'Отдых на воде': 'water_recreation',
      'Настольные игры': 'board_games',
      'Развивающие игры': 'educational_games',
      'Акции': 'sales'
    };
    
    const categoryKey = categoryMap[categoryName];
    return categoryKey ? t(`categories.${categoryKey}`) : categoryName;
  };

  // Функция для перевода подкатегорий
  const translateSubcategory = (parentCategory, subcategoryName) => {
    const categoryMap = {
      'Игрушки': 'toys',
      'Конструкторы': 'constructors', 
      'Пазлы': 'puzzles',
      'Творчество': 'creativity',
      'Канцтовары': 'stationery',
      'Транспорт': 'transport',
      'Отдых на воде': 'water_recreation',
      'Настольные игры': 'board_games',
      'Развивающие игры': 'educational_games',
      'Акции': 'sales'
    };
    
    const subcategoryMap = {
      // Игрушки
      'Игрушки для самых маленьких': 'for_babies',
      'Куклы': 'dolls',
      'Оружие игрушечное': 'toy_weapons',
      'Треки, паркинги и жд': 'tracks_parking_railway',
      'Мягкие игрушки': 'soft_toys',
      'Игрушки - антистресс и сквиши': 'antistress_squishy',
      'Активные игры': 'active_games',
      'Тематические игровые наборы': 'thematic_sets',
      'Декоративная косметика и украшения': 'decorative_cosmetics',
      'Машинки и другой транспорт': 'cars_transport',
      'Роботы и трансформеры': 'robots_transformers',
      'Игровые фигурки': 'game_figures',
      'Игрушки для песочницы': 'sandbox_toys',
      'Шарики': 'balls',
      'Игрушки на радиоуправлении': 'radio_controlled',
      'Маленькие сюрпризы': 'small_surprises',
      // Конструкторы
      'Lego для мальчиков': 'lego_boys',
      'Lego для девочек': 'lego_girls',
      'Металлические конструкторы': 'metal_constructors',
      'Lego крупные блоки': 'lego_large_blocks',
      // Пазлы
      'Пазлы для взрослых': 'for_adults',
      'Пазлы для детей': 'for_children',
      'Магнитные пазлы': 'magnetic',
      'Пазлы напольные': 'floor',
      'Пазлы для малышей': 'for_babies',
      // Творчество
      'Наборы для лепки': 'modeling_sets',
      'Наклейки': 'stickers',
      'Лизуны и слаймы': 'slimes',
      'Кинетический песок': 'kinetic_sand',
      'Рисование': 'drawing',
      'Наборы для творчества': 'creativity_sets',
      'Раскраски': 'coloring',
      // Канцтовары
      'Портфели для школы': 'school_bags',
      'Портфели для детских садов': 'kindergarten_bags',
      'Пеналы': 'pencil_cases',
      'Ручки и карандаши': 'pens_pencils',
      'Точилки': 'sharpeners',
      'Фломастеры и маркеры': 'markers',
      'Краски': 'paints',
      'Кисточки и принадлежности': 'brushes_accessories',
      'Брелки': 'keychains',
      // Транспорт
      'Детские самокаты': 'scooters',
      'Велосипеды': 'bicycles',
      'Ходунки': 'walkers',
      'Беговелы': 'balance_bikes',
      // Отдых на воде
      'Бассейны': 'pools',
      'Матрасы и плотики': 'mattresses_floats',
      'Круги надувные': 'inflatable_circles',
      'Нарукавники и жилеты': 'armbands_vests',
      'Аксессуары для плавания': 'swimming_accessories',
      'Ракетки': 'rackets',
      'Пляжные мячи и игрушки для плавания': 'beach_balls',
      'Насосы для матрасов': 'pumps',
      // Настольные игры
      'Настольные игры': 'board_games',
      // Развивающие игры
      'Развивающие игры': 'educational_games',
      // Акции
      'Скидки недели': 'weekly_discounts',
      'Товары по акции': 'sale_items'
    };
    
    const parentKey = categoryMap[parentCategory];
    const subcategoryKey = subcategoryMap[subcategoryName];
    
    if (parentKey && subcategoryKey) {
      return t(`categories.subcategories.${parentKey}.${subcategoryKey}`);
    }
    
    return subcategoryName;
  };

  // Вспомогательная функция для получения имени категории
  const getCategoryName = (category) => {
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category?.name) return category.name;
    return null;
  };

  // Вспомогательная функция для получения ID категории
  const getCategoryId = (category) => {
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category?.id) return category.id;
    if (typeof category === 'object' && category?.name) return category.name;
    return null;
  };

  // Вспомогательная функция для получения имени подкатегории
  const getSubcategoryName = (subcategory) => {
    if (typeof subcategory === 'string') return subcategory;
    if (typeof subcategory === 'object' && subcategory?.name) return subcategory.name;
    return null;
  };

  // Вспомогательная функция для получения ID подкатегории
  const getSubcategoryId = (subcategory) => {
    if (typeof subcategory === 'string') return subcategory;
    if (typeof subcategory === 'object' && subcategory?.id) return subcategory.id;
    if (typeof subcategory === 'object' && subcategory?.name) return subcategory.name;
    return null;
  };

  // Умный алгоритм подбора похожих товаров
  const findSimilarProducts = (currentProduct, allProducts) => {
    const currentCategory = getCategoryName(currentProduct.category);
    const currentSubcategory = getSubcategoryName(currentProduct.subcategory);
    const currentGender = currentProduct.gender;
    const currentAgeGroup = currentProduct.ageGroup;
    const currentBrand = currentProduct.brand;

    const similarProducts = [];

    allProducts.forEach(product => {
      const productCategory = getCategoryName(product.category);
      const productSubcategory = getSubcategoryName(product.subcategory);
      const productGender = product.gender;
      const productAgeGroup = product.ageGroup;
      const productBrand = product.brand;

      const matches = {
        category: productCategory === currentCategory,
        subcategory: productSubcategory === currentSubcategory,
        gender: productGender === currentGender,
        ageGroup: productAgeGroup === currentAgeGroup,
        brand: productBrand === currentBrand
      };

      // Базовое правило: совпадают категория и подкатегория + (пол ИЛИ возраст)
      // Фоллбэк: если строгих совпадений мало, берём товары с >= 3 совпадениями
      const matchCount = Object.values(matches).filter(Boolean).length;
      if (
        (matches.category && matches.subcategory && (matches.gender || matches.ageGroup)) ||
        matchCount >= 3
      ) {
        similarProducts.push({
          product,
          matchCount,
          hasBrand: matches.brand // Дополнительное совпадение по бренду
        });
      }
    });

    // Сортируем по количеству совпадений (сначала больше совпадений)
    similarProducts.sort((a, b) => {
      if (a.matchCount !== b.matchCount) {
        return b.matchCount - a.matchCount;
      }
      // Если совпадений поровну, приоритет товарам с совпадением по бренду
      if (a.hasBrand !== b.hasBrand) {
        return b.hasBrand - a.hasBrand;
      }
      return 0;
    });

    return similarProducts.map(item => item.product);
  };

  const handleChangeCartQuantity = onChangeCartQuantity; // Переименовываем для совместимости
  const { id } = useParams();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  
  // Функция для принудительного обновления данных товара
  const refreshProductData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('ProductPage: Error refreshing product data:', error);
    }
  };
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  // SEO helpers
  const buildProductTitle = (p) => {
    if (!p) return 'סימבה מלך הצעצועים';
    const name = getTranslatedName(p, i18n.language) || p.nameHe || p.name || '';
    const brand = p.brand ? ` ${p.brand}` : '';
    return `${name}${brand} – סימבה מלך הצעצועים`;
  };

  const buildProductDescription = (p) => {
    if (!p) return 'חנות צעצועים לילדים בישראל – צעצועים איכותיים במחירים נוחים';
    const desc = getTranslatedDescription(p, i18n.language) || p.descriptionHe || p.description || '';
    return (desc || 'חנות צעצועים לילדים בישראל – צעצועים איכותיים במחירים נוחים').slice(0, 300);
  };

  const getFirstImage = (p) => {
    if (!p || !p.imageUrls || p.imageUrls.length === 0) return '/lion-logo.png';
    return p.imageUrls[0];
  };

  const toAbsolute = (url) => {
    if (!url) return '/lion-logo.png';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL || ''}${url}`;
  };
  
  // Dynamic Helmet on product load
  const seoTitle = buildProductTitle(product);
  const seoDescription = buildProductDescription(product);
  const seoImage = toAbsolute(getFirstImage(product));

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  // wishlist теперь передается как проп
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const [cartAnimPlaying, setCartAnimPlaying] = useState(false);

  const canonicalUrl = `${FRONTEND_URL || ''}/product/${id}`;

  const productJsonLd = (p) => {
    if (!p) return null;
    
    // Вычисляем средний рейтинг из отзывов
    const validReviews = (reviews || []).filter(r => r.rating && r.rating > 0);
    const avgRating = validReviews.length > 0 
      ? (validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1)
      : null;
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: getTranslatedName(p, i18n.language) || p.nameHe || p.name,
      description: getTranslatedDescription(p, i18n.language) || p.descriptionHe || p.description,
      image: [toAbsolute(getFirstImage(p))],
      sku: p.article || String(p.id),
      brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
      category: p.category || 'Toys',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'ILS',
        price: Number(p.price || 0),
        availability: (p.quantity || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: canonicalUrl,
        seller: {
          '@type': 'Organization',
          name: 'סימבה מלך הצעצועים',
          url: 'https://simba-tzatzuim.co.il'
        }
      }
    };
    
    // Добавляем aggregateRating только если есть отзывы
    if (avgRating && validReviews.length > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: validReviews.length,
        bestRating: '5',
        worstRating: '1'
      };
    }
    
    return schema;
  };
  const [cartAnimKey, setCartAnimKey] = useState(0);
  const [wishlistAnimPlaying, setWishlistAnimPlaying] = useState(false);
  const [wishlistAnimKey, setWishlistAnimKey] = useState(0); // eslint-disable-line no-unused-vars

  // Ref для галереи для правильной регистрации touch событий
  const galleryRef = useRef(null);

  // Состояния для вопросов о товарах
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  
  // Состояния для экранной лупы (только для десктопа)
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 }); // Начинаем с центра
  
  // Состояния для экранной лупы в галерее
  const desktopZoomLevel = 5; // Фиксированное значение зума 5x
  const [desktopZoomPosition, setDesktopZoomPosition] = useState({ x: 0, y: 0 });
  const [isDesktopZoomActive, setIsDesktopZoomActive] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Состояния для свайпа в галерее (для мобильных устройств)
  const [touchStart, setTouchStart] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  // Состояния для масштабирования и перемещения изображений
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseStartPos, setMouseStartPos] = useState({ x: 0, y: 0 });

  // Состояния для основного изображения
  const [mainImageScale, setMainImageScale] = useState(1);
  const [mainImageTranslateX, setMainImageTranslateX] = useState(0);
  const [mainImageTranslateY, setMainImageTranslateY] = useState(0);
  const [mainImageSwipeOffset, setMainImageSwipeOffset] = useState(0);
  const [mainImageIsAnimating, setMainImageIsAnimating] = useState(false);
  const [mainImageIsSwiping, setMainImageIsSwiping] = useState(false);
  const [mainImageIsZooming, setMainImageIsZooming] = useState(false);
  const [mainImageTouchStart, setMainImageTouchStart] = useState(null);
  const [mainImageTouchStartY, setMainImageTouchStartY] = useState(null);
  const [mainImageTouchEnd, setMainImageTouchEnd] = useState(null);
  const [mainImageInitialDistance, setMainImageInitialDistance] = useState(0);
  const [mainImageInitialScale, setMainImageInitialScale] = useState(1);
  const [mainImageIsMouseDown, setMainImageIsMouseDown] = useState(false);
  const [mainImageMouseStartPos, setMainImageMouseStartPos] = useState({ x: 0, y: 0 });

  // Состояния для модального окна галереи
  const [modalScale, setModalScale] = useState(1);
  const [modalTranslateX, setModalTranslateX] = useState(0);
  const [modalTranslateY, setModalTranslateY] = useState(0);
  const [modalSwipeOffset, setModalSwipeOffset] = useState(0);
  const [modalIsAnimating, setModalIsAnimating] = useState(false);
  const [modalIsSwiping, setModalIsSwiping] = useState(false);
  const [modalIsZooming, setModalIsZooming] = useState(false);
  const [modalTouchStart, setModalTouchStart] = useState(null);
  const [modalTouchStartY, setModalTouchStartY] = useState(null);
  const [modalTouchEnd, setModalTouchEnd] = useState(null);
  const [modalInitialDistance, setModalInitialDistance] = useState(0);
  const [modalInitialScale, setModalInitialScale] = useState(1);
  const [modalIsMouseDown, setModalIsMouseDown] = useState(false);
  const [modalMouseStartPos, setModalMouseStartPos] = useState({ x: 0, y: 0 });

  // Функции-геттеры для состояний в зависимости от контекста
  const getCurrentScale = () => galleryOpen ? modalScale : mainImageScale;
  const getCurrentTranslateX = () => galleryOpen ? modalTranslateX : mainImageTranslateX;
  const getCurrentTranslateY = () => galleryOpen ? modalTranslateY : mainImageTranslateY;
  const getCurrentSwipeOffset = () => galleryOpen ? modalSwipeOffset : mainImageSwipeOffset;
  const getCurrentIsAnimating = () => galleryOpen ? modalIsAnimating : mainImageIsAnimating;
  const getCurrentIsSwiping = () => galleryOpen ? modalIsSwiping : mainImageIsSwiping;
  const getCurrentIsZooming = () => galleryOpen ? modalIsZooming : mainImageIsZooming;
  const getCurrentTouchStart = () => galleryOpen ? modalTouchStart : mainImageTouchStart;
  const getCurrentTouchStartY = () => galleryOpen ? modalTouchStartY : mainImageTouchStartY;
  const getCurrentTouchEnd = () => galleryOpen ? modalTouchEnd : mainImageTouchEnd;
  const getCurrentInitialDistance = () => galleryOpen ? modalInitialDistance : mainImageInitialDistance;
  const getCurrentInitialScale = () => galleryOpen ? modalInitialScale : mainImageInitialScale;
  const getCurrentIsMouseDown = () => galleryOpen ? modalIsMouseDown : mainImageIsMouseDown;
  const getCurrentMouseStartPos = () => galleryOpen ? modalMouseStartPos : mainImageMouseStartPos;
  


  // Безопасно ищем товар в корзине только если product загружен
  const cartItem = product ? cart?.items?.find(item => item.product.id === product.id) : null;
  const inCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // Если товар в корзине, количество берём из корзины, иначе — из локального состояния
  const displayQuantity = inCart ? cartQuantity : quantity;

  const formatPrice = (price) => {
    return `₪${price}`;
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await response.json();

        setProduct(data);
        setGalleryIndex(0); // Сбрасываем индекс галереи при загрузке нового товара
        setLoading(false);
        
        // Прокручиваем к началу страницы при загрузке товара
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('ProductPage: Error loading product:', error);
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]); // Убираем product?.updatedAt из зависимостей

  // Определяем размер экрана при загрузке
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 900); // Изменено с 768 на 900
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Синхронизируем isDesktop с isSmallScreen
  useEffect(() => {
    setIsDesktop(!isSmallScreen);
  }, [isSmallScreen]);

  // Отладочная информация для отслеживания изменений galleryIndex
  useEffect(() => {

    // Сбрасываем zoom при смене изображения
    resetZoom();
    // Сбрасываем экранную лупу при смене изображения
    setIsDesktopZoomActive(false);
  }, [galleryIndex]);

  // Обработчики для touch событий (теперь через props, не addEventListener)
  const handleGalleryTouchStart = (e) => {
    console.log('📱 Gallery Touch Start (JSX)');
    // Не preventDefault если это кнопка
    if (!e.target.closest('button') && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
    }
    onGalleryTouchStart(e);
  };

  const handleGalleryTouchMove = (e) => {
    // Не preventDefault если это кнопка
    if (!e.target.closest('button') && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
    }
    onGalleryTouchMove(e);
  };

  const handleGalleryTouchEnd = (e) => {
    console.log('📱 Gallery Touch End (JSX)');
    onGalleryTouchEnd(e);
  };

  // Блокировка скролла страницы при открытии галереи
  useEffect(() => {
    if (galleryOpen) {
      // Блокируем скролл на мобильных устройствах
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.touchAction = 'none'; // Блокируем touch события
      
      // Дополнительная блокировка для iOS Safari
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';
      
      // Сбрасываем zoom при открытии галереи
      resetZoom();
    } else {
      // Восстанавливаем скролл
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.touchAction = '';
      
      // Восстанавливаем для iOS Safari
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      
      // Сбрасываем zoom при закрытии галереи
      resetZoom();
    }

    // Очистка при размонтировании компонента
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      resetZoom();
    };
  }, [galleryOpen]);

  // Проверяем обновления товара каждые 15 секунд с дополнительной защитой
  useEffect(() => {
    if (!product) return;
    
    let lastCheckTime = Date.now();
    let isChecking = false; // Флаг для предотвращения одновременных запросов
    
    const checkForUpdates = async () => {
      try {
        // Проверяем, прошло ли достаточно времени с последней проверки
        const now = Date.now();
        if (now - lastCheckTime < 12000 || isChecking) { // Минимум 12 секунд между запросами
          return;
        }
        
        // Проверяем, активна ли страница
        if (document.hidden) {
          return;
        }
        
        isChecking = true;
        lastCheckTime = now;
        
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const latestProduct = await response.json();
        
        // Если updatedAt изменился, обновляем данные
        if (latestProduct.updatedAt !== product.updatedAt) {

          setProduct(latestProduct);
        }
      } catch (error) {
        console.error('ProductPage: Error checking for updates:', error);
      } finally {
        isChecking = false;
      }
    };
    
    const interval = setInterval(checkForUpdates, 15000); // Увеличиваем интервал до 15 секунд
    return () => clearInterval(interval);
  }, [id, product?.updatedAt]);



  useEffect(() => {

    fetch(`${API_BASE_URL}/api/reviews/product/${id}`)
      .then(res => {
        return res.json();
      })
      .then(data => {
        setReviews(data);
      })
      .catch(error => {
        console.error('ProductPage: Ошибка загрузки отзывов:', error);
      });
  }, [id, reviewSuccess]);

  useEffect(() => {

    const loadQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}/questions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('ProductPage: Ошибка загрузки вопросов:', error);
        setQuestions([]);
      }
    };
    
    loadQuestions();
  }, [id]);

  useEffect(() => {
    async function checkCanReview() {
      setCanReview(false);
      setAlreadyReviewed(false);
      
      // Проверяем, что пользователь авторизован
      if (!user || !user.token) {

        return;
      }
      
      try {
        // Проверяем, покупал ли пользователь этот товар
        const res = await fetch(`${API_BASE_URL}/api/profile/orders`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (!res.ok) {

          return;
        }
        
        const orders = await res.json();
        const bought = orders.some(order => 
          order.items && order.items.some(item => item.product && item.product.id === parseInt(id))
        );
        
        if (!bought) {

          return;
        }
        
        // Проверяем, не оставлял ли уже отзыв
        const reviewRes = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`);
        
        if (!reviewRes.ok) {

          return;
        }
        
        const allReviews = await reviewRes.json();
        const userReview = allReviews.find(r => r.user && r.user.id === user.id);
        
        if (userReview) {

          setAlreadyReviewed(true);
          return;
        }
        

        setCanReview(true);
      } catch (error) {
        console.error('ProductPage: Ошибка проверки возможности отзыва:', error);
      }
    }
    
    checkCanReview();
  }, [id, user, reviewSuccess]);

  // wishlist теперь управляется из AppContent через ProductsContext

  useEffect(() => {
          if (product && product.category) {
        const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || t('productPage.noCategory'));
      
      // Загружаем все товары для умного подбора
      fetch(`${API_BASE_URL}/api/products`)
        .then(res => res.json())
        .then(data => {
          // Исключаем текущий товар
          const filtered = data.filter(p => p.id !== product.id);
          
          // Умный алгоритм подбора похожих товаров
          const similarProducts = findSimilarProducts(product, filtered);
          
          // Дополнительная рандомизация с использованием времени для разнообразия
          const timeSeed = Date.now() % 1000; // Используем время как seed
          const shuffled = similarProducts.sort((a, b) => {
            // Создаем псевдослучайное число на основе ID товара и времени
            const randomA = ((a.id * 9301 + timeSeed) % 233280) / 233280;
            const randomB = ((b.id * 9301 + timeSeed) % 233280) / 233280;
            return randomA - randomB;
          });
          
          setSimilarProducts(shuffled.slice(0, 8));
        })
        .catch(error => {
          console.error('Error loading similar products:', error);
          setSimilarProducts([]);
        });
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    // Удалить дубликаты по id
    const filtered = viewed.filter(p => p.id !== product.id);
    // Добавить текущий товар в начало с полными данными для перевода
    filtered.unshift({
      id: product.id,
      name: product.name,
      nameHe: product.nameHe,
      description: product.description,
      descriptionHe: product.descriptionHe,
      imageUrls: product.imageUrls,
      price: product.price,
      // Добавьте другие нужные поля для ProductCard
      ...(['brand','category','subcategory','ageGroup','quantity'].reduce((acc, key) => { if (product[key]) acc[key] = product[key]; return acc; }, {}))
    });
    // Ограничить до 40
    const limited = filtered.slice(0, 40);
    localStorage.setItem('viewedProducts', JSON.stringify(limited));
  }, [product]);

  // handleWishlistToggle теперь передается как проп из AppContent

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Дополнительные проверки на фронтенде
    if (!user || !user.token) {
      setReviewError('Необходимо войти в аккаунт для оставления отзыва');
      return;
    }
    
    if (!reviewText.trim()) {
      setReviewError('Пожалуйста, напишите отзыв');
      return;
    }
    
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Пожалуйста, поставьте оценку от 1 до 5');
      return;
    }
    
    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ rating: reviewRating, text: reviewText.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setReviewSuccess(t('productPage.reviewSent'));
        setReviewText('');
        setReviewRating(5);
        // Обновляем список отзывов
        setReviewSuccess(prev => prev + Date.now());
      } else {
        setReviewError(data.error || 'Ошибка отправки отзыва');
      }
    } catch (e) {
      console.error('ProductPage: Ошибка отправки отзыва:', e);
      setReviewError('Ошибка отправки отзыва. Попробуйте еще раз.');
    }
    
    setReviewLoading(false);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.token) {
      setQuestionError('Необходимо войти в аккаунт для задавания вопроса');
      return;
    }
    
    if (!questionText.trim()) {
      setQuestionError('Пожалуйста, напишите вопрос');
      return;
    }
    
    setQuestionError('');
    setQuestionSuccess('');
    setQuestionLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ question: questionText.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setQuestionSuccess(t('productPage.questionSent'));
        setQuestionText('');
        // Обновляем список вопросов
        setQuestions(prevQuestions => [...prevQuestions, data]);
      } else {
        setQuestionError(data.error || 'Ошибка отправки вопроса');
      }
    } catch (e) {
      console.error('ProductPage: Ошибка отправки вопроса:', e);
      setQuestionError('Ошибка отправки вопроса. Попробуйте еще раз.');
    }
    
    setQuestionLoading(false);
  };

  const handleAddToCartWithQuantity = () => {
    if (cart?.items?.some(item => item.product.id === product.id)) return;
    if (!product.quantity || product.quantity <= 0) return;
    
    // Запускаем анимацию
    setCartAnimKey(prev => prev + 1);
    setCartAnimPlaying(true);
    // Используем requestAnimationFrame для лучшей производительности
    const frameId = requestAnimationFrame(() => {
      setTimeout(() => {
        setCartAnimPlaying(false);
      }, 800); // Уменьшили время анимации
    });
    
    const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || t('productPage.noCategory'));
    onAddToCart(product, categoryName, displayQuantity);
    
    return () => cancelAnimationFrame(frameId);
  };

  const handleQuantityChange = (newQuantity) => {
    if (inCart) {
      if (newQuantity >= 1 && newQuantity <= product.quantity) {
        handleChangeCartQuantity(product.id, newQuantity);
      }
    } else {
      if (newQuantity >= 1 && newQuantity <= product.quantity) {
        setQuantity(newQuantity);
      }
    }
  };





  // Функция для получения реальных изображений
  const getRealImages = () => {
    const isDefaultCategoryIcon = url =>
      url && (
        url.includes('bear.png') ||
        url.includes('toys.png') ||
        url.includes('igrushki.webp') ||
        url.includes('photography.jpg') ||
        url.includes('lion-logo.png') ||
        url.includes('logo')
      );
    
    // Проверяем, есть ли у товара реальные изображения
    const hasRealImages = Array.isArray(product.imageUrls)
      ? product.imageUrls.some(url => url && url.trim() !== '' && !isDefaultCategoryIcon(url))
      : (typeof product.imageUrls === 'string' && product.imageUrls.trim() !== '' && !isDefaultCategoryIcon(product.imageUrls));
    
    // Если нет реальных изображений, возвращаем пустой массив
    if (!hasRealImages) {
      return [];
    }
    
    return Array.isArray(product.imageUrls)
      ? product.imageUrls.filter(url => url && url.trim() !== '' && !isDefaultCategoryIcon(url))
      : (typeof product.imageUrls === 'string' && product.imageUrls.trim() !== '' && !isDefaultCategoryIcon(product.imageUrls) ? [product.imageUrls] : []);
  };

  const handleGalleryKeyDown = (e) => {
    const realImages = getRealImages();
    if (e.key === 'ArrowLeft') {
      setGalleryIndex((galleryIndex - 1 + realImages.length) % realImages.length);
    } else if (e.key === 'ArrowRight') {
      setGalleryIndex((galleryIndex + 1) % realImages.length);
    } else if (e.key === 'Escape') {
      handleCloseGallery();
    }
  };

  // Функции для экранной лупы (только для десктопа)
  const handleMouseMove = (e) => {
    if (!isZoomEnabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Вычисляем процентные координаты для правильного позиционирования
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    setMousePosition({ x: xPercent, y: yPercent });
  };

  // Функция для обработки движения мыши в галерее (для десктопа)
  const handleGalleryMouseMove = (e) => {
    // Движение мыши работает только если изображение увеличено и зажата мышь
    if (scale <= 1 || window.innerWidth < 768 || !isMouseDown) return;
    
    // Если изображение увеличено на десктопе и зажата мышь, обрабатываем перемещение
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Вычисляем смещение от начальной позиции
    const deltaX = mouseX - mouseStartPos.x;
    const deltaY = mouseY - mouseStartPos.y;
    
    // Применяем смещение с правильным направлением и меньшей чувствительностью
    setTranslateX(prev => {
      const newX = prev + deltaX * 0.1; // Уменьшаем чувствительность
      return Math.max(-300, Math.min(300, newX));
    });
    setTranslateY(prev => {
      const newY = prev + deltaY * 0.1; // Уменьшаем чувствительность
      return Math.max(-300, Math.min(300, newY));
    });
    
    // Обновляем начальную позицию для следующего движения
    setMouseStartPos({ x: mouseX, y: mouseY });
  };

  // Функция для начала зажатия мыши
  const handleMouseDown = (e) => {
    // Мышь работает только если изображение увеличено и это десктоп
    if (scale <= 1 || window.innerWidth < 768) return;
    
    setIsMouseDown(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Функция для окончания зажатия мыши
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Функция для зума основного изображения
  const toggleMainImageZoom = () => {
    if (window.innerWidth >= 768) { // Только для десктопа
      // Для десктопа: клик увеличивает, повторный клик уменьшает
      if (mainImageScale > 1) {
        resetMainImageZoom();
      } else {
        setMainImageScale(2);
        // Сбрасываем позицию при увеличении
        setMainImageTranslateX(0);
        setMainImageTranslateY(0);
      }
    } else {
      // Для мобильных устройств используем новую систему zoom
      if (mainImageScale > 1) {
        resetMainImageZoom();
      } else {
        setMainImageScale(2);
      }
    }
  };

  // Функция для зума в модальном окне
  const toggleModalZoom = () => {
    if (window.innerWidth >= 768) { // Только для десктопа
      // Для десктопа: клик увеличивает, повторный клик уменьшает
      if (modalScale > 1) {
        resetModalZoom();
      } else {
        setModalScale(2);
        // Сбрасываем позицию при увеличении
        setModalTranslateX(0);
        setModalTranslateY(0);
      }
    } else {
      // Для мобильных устройств используем новую систему zoom
      if (modalScale > 1) {
        resetModalZoom();
      } else {
        setModalScale(2);
      }
    }
  };

  // Общая функция для зума (для обратной совместимости)
  const toggleZoom = () => {
    if (galleryOpen) {
      toggleModalZoom();
    } else {
      toggleMainImageZoom();
    }
  };

  // Функция для обработки колесика основного изображения
  const handleMainImageWheel = (e) => {
    if (window.innerWidth < 768) return; // Только для десктопа
    
    e.preventDefault();
    
    if (mainImageScale > 1) {
      // Если изображение уже увеличено, обрабатываем zoom колесиком
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newScale = Math.max(1, Math.min(4, mainImageScale + delta));
      setMainImageScale(newScale);
      
      // Если вернулись к нормальному размеру, сбрасываем позицию
      if (newScale <= 1) {
        setMainImageTranslateX(0);
        setMainImageTranslateY(0);
      }
    }
  };

  // Регистрируем обработчик wheel с passive: false для предотвращения ошибки preventDefault
  useEffect(() => {
    const mainImageElement = document.querySelector('.main-product-image');
    if (mainImageElement) {
      mainImageElement.addEventListener('wheel', handleMainImageWheel, { passive: false });
      return () => {
        mainImageElement.removeEventListener('wheel', handleMainImageWheel);
      };
    }
  }, [mainImageScale, mainImageTranslateX, mainImageTranslateY]);

  // Функция для обработки колесика в модальном окне
  const handleModalWheel = (e) => {
    if (window.innerWidth < 768) return; // Только для десктопа
    
    e.preventDefault();
    
    if (modalScale > 1) {
      // Если изображение уже увеличено, обрабатываем zoom колесиком
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newScale = Math.max(1, Math.min(4, modalScale + delta));
      setModalScale(newScale);
      
      // Если вернулись к нормальному размеру, сбрасываем позицию
      if (newScale <= 1) {
        setModalTranslateX(0);
        setModalTranslateY(0);
      }
    }
  };

  // Общая функция для обработки колесика (для обратной совместимости)
  const handleWheel = (e) => {
    if (galleryOpen) {
      handleModalWheel(e);
    } else {
      handleMainImageWheel(e);
    }
  };

  // Функции для свайпа в галерее (для мобильных устройств)
  const onGalleryTouchStart = (e) => {
    console.log('🟢 Touch Start:', e.targetTouches.length, 'touches, modalScale:', modalScale);
    
    // Предотвращаем стандартные touch события только если это не кнопка
    if (!e.target.closest('button') && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
    }
    
    if (e.targetTouches.length === 1) {
      // Если изображение увеличено, то движение - это pan, а не свайп
      if (modalScale > 1) {
        setIsSwiping(false);
        setIsZooming(false);
        setTouchStart(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);

      } else {
        // Один палец - свайп (только если изображение не увеличено)
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setIsSwiping(true);
        setIsZooming(false);
        // Сбрасываем смещение при начале нового свайпа
        setSwipeOffset(0);

      }
    } else if (e.targetTouches.length === 2) {
      // Два пальца - zoom
      setIsSwiping(false);
      setIsZooming(true);
      const distance = Math.hypot(
        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
        e.targetTouches[0].clientY - e.targetTouches[1].clientY
      );
      setInitialDistance(distance);
      setInitialScale(modalScale);

    }
  };

  const onGalleryTouchMove = (e) => {
    // Предотвращаем стандартные touch события только если это не кнопка
    if (!e.target.closest('button') && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
    }
    
    if (isSwiping && e.targetTouches.length === 1 && modalScale <= 1) {
      console.log('🔵 Swiping...');
      // Обработка свайпа с плавной анимацией в реальном времени (только если не увеличен)
      const currentTouch = e.targetTouches[0].clientX;
      setTouchEnd(currentTouch);
      
      // Вычисляем смещение для анимации с улучшенной плавностью
      if (touchStart) {
        const offset = currentTouch - touchStart;
        
        // Используем более плавный коэффициент и меньшее ограничение
        const maxOffset = 40; // Уменьшаем максимальное смещение
        const sensitivity = 0.15; // Уменьшаем чувствительность для плавности
        
        if (Math.abs(offset) > 5) { // Минимальный порог для начала анимации
          const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset * sensitivity));
          setSwipeOffset(limitedOffset);
        }
      }
    } else if (isZooming && e.targetTouches.length === 2) {
      console.log('🔵 Zooming with 2 fingers...');
      // Обработка zoom
      const currentDistance = Math.hypot(
        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
        e.targetTouches[0].clientY - e.targetTouches[1].clientY
      );
      
      if (initialDistance) {
        // Максимальный масштаб такой же, как при двойном тапе
        const maxScale = !isDesktop ? 3 : 2; // 3x для мобильных, 2x для десктопа
        const minScale = 1; // Минимальный масштаб - по ширине экрана
        const newScale = Math.max(minScale, Math.min(maxScale, (currentDistance / initialDistance) * initialScale));
        setModalScale(newScale);

      }
    } else if (modalScale > 1 && e.targetTouches.length === 1) {
      // Обработка pan (перемещения) при zoom
      const touch = e.targetTouches[0];
      
      // Используем сохраненные начальные координаты для вычисления delta
      if (touchStart !== null && touchStartY !== null) {
        const deltaX = touch.clientX - touchStart;
        const deltaY = touch.clientY - touchStartY;
        
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          // Вычисляем максимально допустимое смещение на основе масштаба
          // Горизонтальное перемещение более свободное, вертикальное - строго ограничено
          const maxOffsetX = Math.max(50, (modalScale - 1) * 80);
          const maxOffsetY = Math.max(20, (modalScale - 1) * 30); // Вертикальное ограничение в 2.5 раза строже
          
          setModalTranslateX(prev => {
            const newX = prev + deltaX * 0.3; // Увеличиваем чувствительность для быстрого движения
            // Ограничиваем перемещение, чтобы изображение не выходило за края
            return Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
          });
          setModalTranslateY(prev => {
            const newY = prev + deltaY * 0.2; // Увеличиваем вертикальную чувствительность
            // Ограничиваем перемещение, чтобы изображение не выходило за края
            return Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
          });
          
          // Обновляем начальные координаты для следующего движения
          setTouchStart(touch.clientX);
          setTouchStartY(touch.clientY);
        }
      }
    }
  };

  const onGalleryTouchEnd = (e) => {
    // Если изображение увеличено, не обрабатываем свайп
    if (modalScale > 1) {
      // Сбрасываем только состояния pan
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    
    if (isSwiping && touchStart && touchEnd) {
      // Обработка завершения свайпа (только если изображение не увеличено)
      const distance = touchStart - touchEnd;
      const minSwipeDistance = 15; // Очень чувствительные свайпы!
      const realImages = getRealImages();

      if (distance > minSwipeDistance) {
        // Свайп влево - следующее изображение
        if (realImages.length > 1) {
          animateSwipeTransition('next');
        }
      } else if (distance < -minSwipeDistance) {
        // Свайп вправо - предыдущее изображение
        if (realImages.length > 1) {
          animateSwipeTransition('prev');
        }
      } else {
        // Свайп недостаточен - возвращаем в исходное положение
        animateSwipeReturn();
      }
    }
    
    // Сбрасываем состояния
    setIsSwiping(false);
    setIsZooming(false);
    setInitialDistance(null);
    setInitialScale(1);
    setTouchStart(null);
    setTouchStartY(null);
    setTouchEnd(null);
  };

  // Функция для анимации перехода при свайпе
  const animateSwipeTransition = (direction) => {
    setIsAnimating(true);
    
    // Простая и плавная анимация
    const realImages = getRealImages();
    
    // Сначала плавно уводим текущее изображение
    const exitOffset = direction === 'next' ? -100 : 100;
    setSwipeOffset(exitOffset);
    
    // Через 150ms меняем изображение и плавно возвращаем в центр
    // Используем requestAnimationFrame для лучшей производительности
    const frameId = requestAnimationFrame(() => {
      setTimeout(() => {
        // Меняем изображение
        if (direction === 'next') {
          setGalleryIndex((galleryIndex + 1) % realImages.length);
        } else {
          setGalleryIndex((galleryIndex - 1 + realImages.length) % realImages.length);
        }
        
        // Сбрасываем zoom для галереи - возвращаем к масштабу 1 (по ширине экрана)
        resetModalZoom();
        
        // Плавно возвращаем в центр
        setSwipeOffset(0);
        
        // Завершаем анимацию
        const endFrameId = requestAnimationFrame(() => {
          setTimeout(() => {
            setIsAnimating(false);
          }, 150);
        });
        return () => cancelAnimationFrame(endFrameId);
      }, 150);
    });
    return () => cancelAnimationFrame(frameId);
  };

  // --- SEO Helmet ---
  const productLd = productJsonLd(product);
  
  // FAQ Schema.org для вопросов о товаре
  const faqLd = () => {
    if (!questions || questions.length === 0) return null;
    
    // Фильтруем только вопросы с ответами
    const answeredQuestions = questions.filter(q => q.answer && q.answer.trim() !== '');
    
    if (answeredQuestions.length === 0) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: answeredQuestions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    };
  };
  
  // Breadcrumb Schema.org
  const breadcrumbLd = () => {
    if (!product) return null;
    
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: 'https://simba-tzatzuim.co.il/'
      }
    ];
    
    // Добавляем категорию если есть
    if (product.category) {
      items.push({
        '@type': 'ListItem',
        position: 2,
        name: product.category.name || product.category,
        item: `https://simba-tzatzuim.co.il/category/${product.categoryId || product.category.id}`
      });
    }
    
    // Добавляем подкатегорию если есть
    if (product.subcategory) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: product.subcategory.name || product.subcategory,
        item: `https://simba-tzatzuim.co.il/subcategory/${product.subcategoryId || product.subcategory.id}`
      });
    }
    
    // Добавляем текущий товар
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: getTranslatedName(product, i18n.language) || product.nameHe || product.name,
      item: canonicalUrl
    });
    
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    };
  };

  // Функция для анимации возврата при недостаточном свайпе
  const animateSwipeReturn = () => {
    setIsAnimating(true);
    
    // Просто и плавно возвращаем в центр
    setSwipeOffset(0);
    
    // Используем requestAnimationFrame для лучшей производительности
    const frameId = requestAnimationFrame(() => {
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    });
    return () => cancelAnimationFrame(frameId);
  };

  // Функция для сброса zoom основного изображения
  const resetMainImageZoom = () => {
    setMainImageScale(1);
    setMainImageTranslateX(0);
    setMainImageTranslateY(0);
    setMainImageIsZooming(false);
    setMainImageTouchStart(null);
    setMainImageTouchStartY(null);
    setMainImageTouchEnd(null);
    setMainImageIsSwiping(false);
    setMainImageIsMouseDown(false);
  };

  // Функция для сброса zoom модального окна
  const resetModalZoom = () => {
    // Возвращаем к масштабу 1 (по ширине экрана) для всех устройств
    setModalScale(1);
    setModalTranslateX(0);
    setModalTranslateY(0);
    setModalIsZooming(false);
    setModalTouchStart(null);
    setModalTouchStartY(null);
    setModalTouchEnd(null);
    setModalIsSwiping(false);
    setModalIsMouseDown(false);
  };

  // Функция для открытия галереи с адаптивным масштабом
  const openGalleryWithHd = (index = 0) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
    // Открываем с масштабом 1 (по ширине экрана) для всех устройств
    setModalScale(1);
    setModalTranslateX(0);
    setModalTranslateY(0);

  };

  // Функция для сброса zoom (общая, для обратной совместимости)
  const resetZoom = () => {
    if (galleryOpen) {
      resetModalZoom();
    } else {
      resetMainImageZoom();
    }
  };

  // Функция для обработки перемещения изображения при zoom в модальном окне
  const onGalleryPan = (e) => {
    if (modalScale > 1 && e.targetTouches.length === 1) {
      e.preventDefault();
      const touch = e.targetTouches[0];
      
      if (touch.clientX !== undefined && touch.clientY !== undefined) {
        // Вычисляем максимально допустимое смещение на основе масштаба
        // Горизонтальное перемещение более свободное, вертикальное - строго ограничено
        const maxOffsetX = Math.max(50, (modalScale - 1) * 80);
        const maxOffsetY = Math.max(20, (modalScale - 1) * 30); // Вертикальное ограничение в 2.5 раза строже
        
        // Простое перемещение на основе текущих координат
        // Увеличиваем чувствительность для более быстрого движения
        // Вертикальная чувствительность в 2 раза меньше
        const moveX = (touch.clientX - window.innerWidth / 2) * 0.02;
        const moveY = (touch.clientY - window.innerHeight / 2) * 0.01;
        
        setModalTranslateX(prev => {
          const newX = prev + moveX;
          // Ограничиваем перемещение, чтобы изображение не выходило за края
          return Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
        });
        setModalTranslateY(prev => {
          const newY = prev + moveY;
          // Ограничиваем перемещение, чтобы изображение не выходило за края
          return Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
        });
      }
    }
  };

  // Глобальный обработчик для отпускания мыши
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (galleryOpen) {
        setModalIsMouseDown(false);
      } else {
        setMainImageIsMouseDown(false);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [galleryOpen]);

  // Функция для зума основного изображения (с проверкой модального окна)
  const handleMainImageZoom = () => {
    // Если открыто модальное окно, не обрабатываем зум на основном изображении
    if (galleryOpen) return;
    
    toggleZoom();
  };

  // Обработчики для основного изображения
  const handleMainImageDoubleClick = () => {
    if (galleryOpen) return;
    toggleMainImageZoom();
  };

  const handleMainImageTouchStart = (e) => {
    if (galleryOpen) return;
    const touch = e.touches[0];
    setMainImageTouchStart(touch);
    setMainImageTouchStartY(touch.clientY);
    setMainImageTouchEnd(null);
    setMainImageIsSwiping(false);
    setMainImageIsZooming(false);
  };

  const handleMainImageTouchMove = (e) => {
    if (galleryOpen) return;
    if (!mainImageTouchStart) return;
    
    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - mainImageTouchStartY);
    
    if (deltaY > 10) {
      setMainImageIsSwiping(true);
    }
  };

  const handleMainImageTouchEnd = () => {
    if (galleryOpen) return;
    setMainImageTouchStart(null);
    setMainImageTouchStartY(null);
    setMainImageTouchEnd(null);
    setMainImageIsSwiping(false);
  };

  const handleMainImageMouseMove = (e) => {
    if (galleryOpen) return;
    if (!mainImageIsMouseDown) return;
    
    const deltaX = e.clientX - mainImageMouseStartPos.x;
    const deltaY = e.clientY - mainImageMouseStartPos.y;
    
    // Вычисляем максимально допустимое смещение на основе масштаба
    // Горизонтальное перемещение более свободное, вертикальное - строго ограничено
    const maxOffsetX = Math.max(50, (mainImageScale - 1) * 80);
    const maxOffsetY = Math.max(20, (mainImageScale - 1) * 30); // Вертикальное ограничение в 2.5 раза строже
    
    setMainImageTranslateX(prev => {
      const newX = prev + deltaX * 0.5; // Увеличиваем чувствительность для быстрого движения
      // Ограничиваем перемещение, чтобы изображение не выходило за края
      return Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
    });
    setMainImageTranslateY(prev => {
      const newY = prev + deltaY * 0.5; // Увеличиваем вертикальную чувствительность
      // Ограничиваем перемещение, чтобы изображение не выходило за края
      return Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
    });
    setMainImageMouseStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMainImageMouseDown = (e) => {
    if (galleryOpen) return;
    setMainImageIsMouseDown(true);
    setMainImageMouseStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMainImageMouseUp = () => {
    if (galleryOpen) return;
    setMainImageIsMouseDown(false);
  };

  // Функции для экранной лупы на десктопе
  const handleDesktopZoomMouseMove = (e) => {
    if (!isDesktopZoomActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Вычисляем позицию для экранной лупы
    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;
    
    setDesktopZoomPosition({ x: zoomX, y: zoomY });
  };

  const handleDesktopZoomMouseEnter = () => {
    if (isDesktop) { // Только для десктопа
      setIsDesktopZoomActive(true);
    }
  };

  const handleDesktopZoomMouseLeave = () => {
    setIsDesktopZoomActive(false);
  };



  const handleCloseGallery = () => {
    setGalleryOpen(false);
    setIsDesktopZoomActive(false);
  };

  // Состояние для галереи


  if (loading) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><Typography variant="h4">Загрузка...</Typography></Container>;
  }
  if (!product) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><Typography variant="h4">Товар не найден</Typography></Container>;
  }

  return (
    <>
      <Helmet>
        <html lang="he" />
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content={seoTitle} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        {productLd && (
          <script type="application/ld+json">
            {JSON.stringify(productLd)}
          </script>
        )}
        {breadcrumbLd() && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbLd())}
          </script>
        )}
        {faqLd() && (
          <script type="application/ld+json">
            {JSON.stringify(faqLd())}
          </script>
        )}
      </Helmet>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 4 }, pt: { xs: 0, md: 7.5 } }}>
        {/* Хлебные крошки */}
      <Box sx={{ 
        mb: 3, 
        mt: { xs: 0.25, md: 0 }, // Очень маленький отступ сверху
        width: '100%', // На всю ширину
        pt: { xs: 1, md: 0 } // Отступ сверху для мобильных
      }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{
            position: 'relative',
            zIndex: 15,
            pl: { xs: 2, md: 3 }, // Отступ слева для хлебных крошек
            '& .MuiBreadcrumbs-separator': {
              color: '#4ECDC4'
            },
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'wrap'
            }
          }}
        >
          {/* Всегда показываем "Главная" */}
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.2s',
              fontSize: '14px',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.color = '#4ECDC4'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            <HomeIcon sx={{ fontSize: 18 }} />
            {t('breadcrumbs.home')}
          </Link>
          
          {/* Каталог */}
          <Link 
            to="/catalog"
            style={{ 
              textDecoration: 'none', 
              color: '#666',
              transition: 'color 0.2s',
              fontSize: '14px',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.color = '#4ECDC4'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            {t('breadcrumbs.catalog')}
          </Link>
          
          {/* Категория */}
          {product.category && getCategoryId(product.category) && (
            <Link 
              to={`/category/${getCategoryId(product.category)}`}
              style={{ 
                textDecoration: 'none', 
                color: '#666',
                transition: 'color 0.2s',
                fontSize: '14px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => e.target.style.color = '#4ECDC4'}
              onMouseLeave={(e) => e.target.style.color = '#666'}
            >
              {translateCategory(getCategoryName(product.category))}
            </Link>
          )}
          
          {/* Подкатегория */}
          {product.subcategory && getSubcategoryId(product.subcategory) && getCategoryName(product.category) && (
            <Link 
              to={`/subcategory/${getSubcategoryId(product.subcategory)}`}
              style={{ 
                textDecoration: 'none', 
                color: '#666',
                transition: 'color 0.2s',
                fontSize: '14px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => e.target.style.color = '#4ECDC4'}
              onMouseLeave={(e) => e.target.style.color = '#666'}
            >
              {translateSubcategory(getCategoryName(product.category), getSubcategoryName(product.subcategory))}
            </Link>
          )}
          
          {/* Название товара */}
          <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: '14px' }}>
            {getTranslatedName(product) || 'Товар'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, md: 4 },
        background: 'white',
        borderRadius: 3,
        p: { xs: 2, md: 4 },
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'relative',
        mt: -1.875
      }}>
        {/* Галерея и инфо-бокс в одной строке */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 },
          alignItems: { md: 'flex-start' }
        }}>
          {/* Галерея фото */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0
          }}>
            <Box sx={{ position: 'relative', mb: { xs: 1, md: 2 } }}>
              {(() => {
                // Проверяем, есть ли у товара изображения
                const hasImages = product.imageUrls && (
                  (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) ||
                  (typeof product.imageUrls === 'string' && product.imageUrls.trim() !== '')
                );
                
                if (hasImages) {
                  const realImages = getRealImages();
                  
                  if (realImages.length > 0 && galleryIndex < realImages.length && galleryIndex >= 0) {
                    const imageSrc = getImageUrl(realImages[galleryIndex]);
                    
                    return (
                                             <Box 
                         className="main-product-image"
                         sx={{ 
                         width: '100%', 
                         height: { xs: 280, sm: 320, md: 400 }, // Адаптивная высота для мобильных
                         background: { xs: 'white', md: '#f6f6f6' }, // Белый фон на мобильных, серый на десктопе
                         overflow: scale > 1 ? 'visible' : 'hidden',
                         cursor: 'pointer'
                       }}
                                             onClick={() => {
                                               // На десктопе не открываем модальное окно вообще
                                               if (isDesktop) {
                                                 return;
                                               }
                                               // Открываем галерею с текущим выбранным изображением
                                               openGalleryWithHd(galleryIndex);
                                             }}
                       onDoubleClick={handleMainImageDoubleClick}
                       onTouchStart={handleMainImageTouchStart}
                       onTouchMove={handleMainImageTouchMove}
                       onTouchEnd={handleMainImageTouchEnd}
                       onMouseMove={(e) => {
                         handleMainImageMouseMove(e);
                         handleDesktopZoomMouseMove(e);
                       }}
                       onMouseEnter={handleDesktopZoomMouseEnter}
                       onMouseLeave={handleDesktopZoomMouseLeave}
                       onMouseDown={handleMainImageMouseDown}
                       onMouseUp={handleMainImageMouseUp}
                       onKeyDown={handleGalleryKeyDown}
                      tabIndex={0}
                      >
                        {/* Основное изображение товара - используем тот же принцип, что и в корзине */}
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${imageSrc})`,
                          backgroundSize: scale > 1 ? 'contain' : (isDesktop ? 'cover' : 'contain'), // На мобильных используем contain
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          borderRadius: 2,
                          transform: `scale(${scale}) translate(${translateX + swipeOffset}px, ${translateY}px)`,
                          transition: isAnimating ? 'transform 0.3s ease-out' : (scale > 1 ? 'none' : 'transform 0.2s ease-out'),
                          transformOrigin: 'center center',
                          cursor: scale > 1 ? 'move' : 'pointer',
                          ...(scale > 1 && {
                            touchAction: 'none'
                          })
                        }} />
                        
                        {/* Кнопка сброса zoom для основной галереи */}
                        {scale > 1 && (
                          <Box sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 10
                          }}>
                            <Button
                              onClick={resetZoom}
                              sx={{
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                borderRadius: '50%',
                                minWidth: 40,
                                height: 40,
                                '&:hover': {
                                  background: 'rgba(0, 0, 0, 0.9)'
                                }
                              }}
                            >
                              <ZoomOutIcon />
                            </Button>
                          </Box>
                        )}





                        {/* Экранная лупа для десктопа */}
                        {isDesktopZoomActive && isDesktop && (
                          <Box sx={{
                            position: 'absolute',
                            top: 20,
                            right: -370,
                            width: 350,
                            height: 350,
                            borderRadius: 0,
                            border: '2px solid #4ECDC4',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                            zIndex: 1000,
                            background: '#fff'
                          }}>
                            <Box sx={{
                              width: '100%',
                              height: '100%',
                              backgroundImage: `url(${getHdImageUrl(imageSrc, '4x') || getImageUrl(imageSrc)})`,
                              backgroundSize: `${100 * desktopZoomLevel}%`,
                              backgroundPosition: `${desktopZoomPosition.x}% ${desktopZoomPosition.y}%`,
                              backgroundRepeat: 'no-repeat'
                            }} />
                          </Box>
                        )}
                      </Box>
                    );
                  }
                }
                
                // Если нет изображений или только заглушки, показываем нашу заглушку

                return (
                  <div 
                    className="main-product-image"
                    style={{ 
                      width: '100%', 
                      height: window.innerWidth < 768 ? 280 : 400, // Адаптивная высота для мобильных
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: window.innerWidth < 768 ? 'white' : '#f6f6f6', // Белый фон на мобильных, серый на десктопе
                      borderRadius: 12,
                      flexDirection: 'column',
                      gap: 2,
                      position: 'relative',
                      overflow: scale > 1 ? 'visible' : 'hidden'
                    }}
                    onClick={() => {
                      // На десктопе не открываем модальное окно вообще
                      if (isDesktop) {
                        return;
                      }
                      // Открываем галерею с текущим выбранным изображением
                      openGalleryWithHd(galleryIndex);
                    }}
                    onTouchStart={handleMainImageTouchStart}
                    onTouchMove={handleMainImageTouchMove}
                    onTouchEnd={handleMainImageTouchEnd}

                    onMouseMove={(e) => {
                      handleMainImageMouseMove(e);
                      handleDesktopZoomMouseMove(e);
                    }}
                    onMouseEnter={handleDesktopZoomMouseEnter}
                    onMouseLeave={handleDesktopZoomMouseLeave}
                    onMouseDown={handleMainImageMouseDown}
                    onMouseUp={handleMainImageMouseUp}
                    onDoubleClick={handleMainImageDoubleClick}
                  >
                    <img 
                      src="/photography.jpg" 
                      alt={t('productPage.noPhoto')} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: 12, 
                        opacity: 0.7,
                        transform: `scale(${scale}) translate(${translateX + swipeOffset}px, ${translateY}px)`,
                        transition: isAnimating ? 'transform 0.3s ease-out' : (scale > 1 ? 'none' : 'transform 0.2s ease-out'),
                        transformOrigin: 'center center'
                      }} 
                    />
                    
                    {scale > 1 && (
                      <Box sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 10
                      }}>
                        <Button
                          onClick={resetZoom}
                          sx={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            borderRadius: '50%',
                            minWidth: 40,
                            height: 40,
                            '&:hover': {
                              background: 'rgba(0, 0, 0, 0.9)'
                            }
                          }}
                        >
                          <ZoomOutIcon />
                        </Button>
                      </Box>
                    )}





                    {/* Экранная лупа для заглушки (только для десктопа) */}
                    {isDesktopZoomActive && isDesktop && (
                      <Box sx={{
                        position: 'absolute',
                        top: 20,
                        right: -370,
                        width: 350,
                        height: 350,
                        borderRadius: 0,
                        border: '2px solid #4ECDC4',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        zIndex: 1000,
                        background: '#fff'
                      }}>
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${getHdImageUrl('/photography.jpg', '4x')})`,
                          backgroundSize: `${100 * desktopZoomLevel}%`,
                          backgroundPosition: `${desktopZoomPosition.x}% ${desktopZoomPosition.y}%`,
                          backgroundRepeat: 'no-repeat'
                        }} />
                      </Box>
                    )}
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666', 
                        textAlign: 'center',
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255,255,255,0.9)',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        zIndex: 1
                      }}
                    >
                      {t('productPage.noPhoto')}
                    </Typography>
                  </div>
                );
              })()}
              

              
              {/* Миниатюры */}
              {(() => {
                const hasImages = product.imageUrls && (
                  (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) ||
                  (typeof product.imageUrls === 'string' && product.imageUrls.trim() !== '')
                );
                
                if (hasImages) {
                  const realImages = getRealImages();
                  if (realImages.length > 1) {
                    return (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mt: 2, 
                        justifyContent: { xs: 'center', md: 'center' }, 
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        {realImages.map((url, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 56,
                              height: 56,
                              background: '#f6f6f6',
                              borderRadius: 6,
                              border: galleryIndex === idx ? '2px solid #4ECDC4' : '2px solid #eee',
                              cursor: 'pointer', // Миниатюры кликабельны для переключения изображений
                              boxShadow: galleryIndex === idx ? '0 2px 8px #4ECDC455' : 'none',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onClick={() => {
                              // Переключаем изображение на основное, но не открываем галерею
                              setGalleryIndex(idx);
                            }}
                          >
                            {/* Миниатюра изображения - используем тот же принцип, что и в корзине */}
                            <Box sx={{
                              width: '100%',
                              height: '100%',
                              backgroundImage: `url(${getImageUrl(url)})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              transform: `scale(${scale}) translate(${(translateX + swipeOffset) * 0.1}px, ${translateY * 0.1}px)`,
                              transition: isAnimating ? 'transform 0.3s ease-out' : (scale > 1 ? 'none' : 'transform 0.2s ease-out'),
                              transformOrigin: 'center center'
                            }} />
                          </Box>
                        ))}
                      </Box>
                    );
                  }
                }
                return null;
              })()}
            </Box>
          </Box>
          
          {/* Инфоблок */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minHeight: '4.5rem' }}>
              <Typography 
                variant="h1" 
                component="h1"
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.3rem',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word'
                }}
              >
                {getTranslatedName(product) || 'Название товара'}
              </Typography>
            </Box>
            
            {/* Рейтинг сразу под названием */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating
                value={
                  reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    : 0
                }
                precision={0.1}
                readOnly
                size="medium"
                sx={{ color: '#FFD600' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                <RateReviewIcon sx={{ color: '#666', fontSize: 22 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{reviews.length}</Typography>
              </Box>
              {/* Кнопка избранного справа от рейтинга */}
              {user && product && (
                <Box sx={{ position: 'relative', ml: 'auto', width: 48, height: 48 }}>
                  {wishlistAnimPlaying && (
                    <Box sx={{ 
                      position: 'absolute', 
                      left: 'calc(50% - 3px)', 
                      top: 'calc(50% - 2px)', 
                      width: 120, 
                      height: 120, 
                      transform: 'translate(-50%,-50%)', 
                      pointerEvents: 'none', 
                      background: 'none', 
                      opacity: 1 
                    }}>
                      <Lottie
                        animationData={wishlistHeartAnim}
                        autoplay
                        loop={false}
                        style={{ 
                          width: 120, 
                          height: 120, 
                          pointerEvents: 'none', 
                          background: 'none', 
                          opacity: 1 
                        }}
                      />
                    </Box>
                  )}
                  <IconButton
                    size="medium"
                    onClick={e => { 
                      e.stopPropagation(); 
                      
                      // Запускаем анимацию только при добавлении в избранное
                      const isInWishlist = wishlist.includes(Number(product.id));
                      
                      if (!isInWishlist) {
                        setWishlistAnimKey(prev => prev + 1);
                        setWishlistAnimPlaying(true);
                        // Используем requestAnimationFrame для лучшей производительности
                        const frameId = requestAnimationFrame(() => {
                          setTimeout(() => {
                            setWishlistAnimPlaying(false);
                          }, 800); // Уменьшили время анимации
                        });
                      }
                      
                      onWishlistToggle(product.id, isInWishlist); 
                    }}
                    disabled={wishlistAnimPlaying}
                    sx={{
                      p: 0.75,
                      color: wishlist.includes(Number(product.id)) ? '#e53e3e' : '#666',
                      background: 'none',
                      borderRadius: '50%',
                      transition: 'color 0.2s, transform 0.2s',
                      '&:hover': {
                        color: wishlist.includes(Number(product.id)) ? '#c53030' : '#e53e3e',
                      },
                      '&:active': {
                        transform: 'scale(0.95)'
                      }
                    }}
                    aria-label={wishlist.includes(Number(product.id)) ? 'Убрать из избранного' : 'Добавить в избранное'}
                  >
                    {!wishlistAnimPlaying && (
                      wishlist.includes(Number(product.id))
                        ? <Favorite fontSize="inherit" sx={{ fontSize: '1.89rem' }} />
                        : <FavoriteBorder fontSize="inherit" sx={{ fontSize: '1.89rem' }} />
                    )}
                  </IconButton>
                </Box>
              )}
            </Box>
            
            {/* Возрастная группа и пол в стиле карточек */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {product.ageGroup && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  fontSize: '0.9rem', 
                  color: '#666', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  marginBottom: 2 
                }}>
                  {ageIcons[product.ageGroup] && (
                    <img src={ageIcons[product.ageGroup]} alt={`${product.ageGroup} - ${getTranslatedName(product)}`} style={{ width: 28, height: 28, marginRight: 0, verticalAlign: 'middle' }} />
                  )}
                </span>
              )}
              {product.gender && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.9rem',
                  color: '#666',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {product.gender === 'Для мальчиков' ? t('productCard.gender.boy') : product.gender === 'Для девочек' ? t('productCard.gender.girl') : t('productCard.gender.unisex')}
                </span>
              )}
            </Box>
            {/* Характеристики товара */}
            {/* Категория */}
            {product.category && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: 2, width: 'auto', maxWidth: 'max-content' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem', color: '#1976d2', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, marginBottom: 2 }}>
                  <img src={getCategoryIcon(typeof product.category === 'object' ? product.category : { name: product.category })} alt={`${typeof product.category === 'object' ? translateCategory(product.category.label || product.category?.name) : translateCategory(product.category)} - категория`} style={{ width: 20, height: 20, marginRight: 6, verticalAlign: 'middle' }} />
                  {typeof product.category === 'object' ? translateCategory(product.category.label || product.category?.name) : translateCategory(product.category)}
                </span>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
              <Typography variant="body2"><b>{i18n.language === 'he' ? `${product.article || '—'}: ${t('productCard.sku')}` : `${t('productCard.sku')}: ${product.article || '—'}`}</b></Typography>
              <Typography variant="body2"><b>{i18n.language === 'he' ? `${product.brand || '—'}: ${t('productCard.brand')}` : `${t('productCard.brand')}: ${product.brand || '—'}`}</b></Typography>
              <Typography variant="body2"><b>{i18n.language === 'he' ? `${product.manufacturer || product.country || '—'}: ${t('productCard.country')}` : `${t('productCard.country')}: ${product.manufacturer || product.country || '—'}`}</b></Typography>
              <Typography variant="body2"><b>{i18n.language === 'he' ? 
                `${product.height && product.length && product.width ? 
                  `${product.length}×${product.width}×${product.height} ${t('productCard.units.cm')}` : 
                  '—'}: ${t('productCard.dimensions')}` :
                `${t('productCard.dimensions')}: ${product.height && product.length && product.width ? 
                  `${product.length}×${product.width}×${product.height} ${t('productCard.units.cm')}` : 
                  '—'}`
              }</b></Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {isAdmin ? (
                <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                  На складе: {product.quantity}
                </Typography>
              ) : (
                product.quantity > 0 ? <Chip label={t('productCard.availability.inStock')} color="success" size="small" /> : <Chip label={t('productCard.availability.outOfStock')} color="default" size="small" />
              )}
            </Box>
            <Typography sx={{ color: '#000000', fontWeight: 700, fontSize: 24 }}>{formatPrice(product.price)}</Typography>
            {/* Выбор количества */}
            {product.quantity > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {i18n.language === 'ru' && (
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{t('productPage.quantity')}:</Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <button
                    style={{
                      border: '1px solid #ddd',
                      background: '#fff',
                      fontSize: 18,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (cart && cart.items?.some(item => item.product.id === product.id)) {
                        const cartItem = cart.items.find(item => item.product.id === product.id);
                        handleChangeCartQuantity(product.id, Math.max(1, cartItem.quantity - 1));
                      } else {
                        handleQuantityChange(Math.max(1, displayQuantity - 1));
                      }
                    }}
                    disabled={!product.quantity || product.quantity <= 0}
                  >-</button>
                  <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>
                    {cart?.items?.some(item => item.product.id === product.id) 
                      ? cart.items.find(item => item.product.id === product.id).quantity 
                      : displayQuantity}
                  </span>
                  <button
                    style={{
                      border: '1px solid #ddd',
                      background: '#fff',
                      fontSize: 18,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (cart && cart.items?.some(item => item.product.id === product.id)) {
                        const cartItem = cart.items.find(item => item.product.id === product.id);
                        handleChangeCartQuantity(product.id, cartItem.quantity + 1);
                      } else {
                        if (displayQuantity < product.quantity) handleQuantityChange(displayQuantity + 1);
                      }
                    }}
                    disabled={!product.quantity || product.quantity <= 0}
                  >+</button>
                </Box>
                {i18n.language === 'he' && (
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{t('productPage.quantity')}</Typography>
                )}
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {!isAdmin && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    <Box sx={{ position: 'relative', width: 41, height: 41, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(cart?.items?.some(item => item.product.id === product.id) && !cartAnimPlaying) ? (
                        <Lottie
                          animationData={addToCartAnim}
                          autoplay={false}
                          loop={false}
                          style={{ width: 41, height: 41 }}
                          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                          initialSegment={[100, 100]}
                        />
                      ) : (
                        <Lottie
                          key={cartAnimKey}
                          animationData={addToCartAnim}
                          autoplay={cartAnimPlaying}
                          loop={false}
                          style={{ width: 41, height: 41 }}
                          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                        />
                      )}
                    </Box>
                  }
                  sx={{
                    background: product.quantity <= 0
                      ? '#bdbdbd'
                      : '#5cb95d',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    borderRadius: 20,
                    textTransform: 'none',
                    boxShadow: product.quantity <= 0
                      ? '0 2px 4px rgba(189, 189, 189, 0.2)'
                      : '0 2px 4px rgba(72, 187, 120, 0.2)',
                    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      background: product.quantity <= 0
                        ? '#bdbdbd'
                        : '#4ca94d',
                      boxShadow: product.quantity <= 0
                        ? '0 4px 8px rgba(189, 189, 189, 0.3)'
                        : '0 4px 8px rgba(72, 187, 120, 0.3)',
                      transform: product.quantity <= 0 ? 'none' : 'scale(1.05)'
                    },
                    opacity: (!product.quantity || product.quantity <= 0) ? 0.7 : 1,
                    cursor: (!product.quantity || product.quantity <= 0) ? 'not-allowed' : 'pointer',
                    flex: 1,
                    '& .MuiButton-startIcon': { marginRight: 1 }
                  }}
                  onClick={handleAddToCartWithQuantity}
                  disabled={!product.quantity || product.quantity <= 0}
                >
                  {product.quantity <= 0 
                    ? t('productCard.availability.outOfStock') 
                    : (inCart && !cartAnimPlaying)
                      ? t('productCard.inCart')
                      : `${t('productCard.addToCart')} (${displayQuantity} ${t('productCard.units.pcs')})`}
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    minWidth: 0,
                    width: 160,
                    height: 32,
                    borderRadius: 6,
                    px: 2,
                    lineHeight: '32px',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => onEditProduct({ ...product, onSaveCallback: refreshProductData })}
                >
                  Редактировать
                </Button>
              )}
            </Box>
            

          </Box>
        </Box>
        
        {/* Описание товара */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          width: '100%'
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            fontWeight: 600, 
            color: '#333',
            fontSize: '1.1rem'
          }}>
            {t('productCard.description')}
          </Typography>
          <Typography variant="body1" sx={{ 
            lineHeight: 1.7, 
            color: '#555',
            fontSize: '1.05rem',
            textAlign: 'justify'
          }}>
            {getTranslatedDescription(product) || t('productPage.noDescription')}
          </Typography>
        </Box>
      </Box>
      
      {/* Отзывы о товаре */}
      <Box sx={{ 
        mt: 5, 
        background: 'white', 
        borderRadius: 3, 
        p: { xs: 2, md: 4 }, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #e9ecef'
      }}>
        <Typography variant="h5" sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: '#333',
          borderBottom: '2px solid #4ECDC4',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <RateReviewIcon sx={{ color: '#4ECDC4', fontSize: 28 }} />
          {t('productPage.reviews')}
        </Typography>
        {reviews.length === 0 && <Typography>{t('productPage.noReviews')}</Typography>}
        {reviews.map((review) => (
          <Box key={review.id} sx={{ 
            mb: 3, 
            p: 3, 
            background: '#f8f9fa', 
            borderRadius: 3,
            border: '1px solid #e9ecef',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                {review.user?.name || t('productPage.user')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={review.rating} readOnly size="small" sx={{ color: '#FFD600' }} />
                <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>
                  {formatDate(review.createdAt)}
              </Typography>
              </Box>
            </Box>
            <Typography sx={{ 
              color: '#555', 
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }}>
              {review.text}
            </Typography>
          </Box>
        ))}
        {/* Форма для отзыва */}
        {user && user.token && canReview && !alreadyReviewed && (
          <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 3, p: 2, background: '#fffbe7', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RateReviewIcon sx={{ color: '#4ECDC4', fontSize: 20 }} />
              {t('productPage.leaveReview')}
            </Typography>
            <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} sx={{ mb: 1 }} />
            <TextField
              label={t('productPage.reviewText')}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 1 }}
              required
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={reviewLoading || !reviewText}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {reviewLoading ? t('reviews.form.submitting') : t('productPage.submitReview')}
            </Button>
            {reviewError && <Typography color="error" sx={{ mt: 1 }}>{reviewError}</Typography>}
            {reviewSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{reviewSuccess}</Typography>}
          </Box>
        )}
        {user && user.token && alreadyReviewed && (
          <Typography sx={{ mt: 2, color: '#888' }}>{t('productPage.alreadyReviewed')}</Typography>
        )}
        {user && user.token && !canReview && !alreadyReviewed && (
          <Typography sx={{ mt: 2, color: '#888' }}>{t('productPage.onlyBuyersCanReview')}</Typography>
        )}
        {!user && (
          <Typography sx={{ mt: 2, color: '#888' }}>{t('productPage.loginToReview')}</Typography>
        )}
      </Box>

      {/* Вопросы о товаре */}
      <Box sx={{ 
        mt: 5, 
        background: 'white', 
        borderRadius: 3, 
        p: { xs: 2, md: 4 }, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #e9ecef'
      }}>
        <Typography variant="h5" sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: '#333',
          borderBottom: '2px solid #2196F3',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <HelpOutlineIcon sx={{ color: '#2196F3', fontSize: 28 }} />
          {t('productPage.questions')} ({questions.length})
        </Typography>
        {questions.length === 0 ? (
          <Typography sx={{ color: '#666', fontStyle: 'italic' }}>
            {t('productPage.noQuestions')}
          </Typography>
        ) : (
          questions.map((question) => (
            <Box key={question.id} sx={{ 
              mb: 3, 
              p: 3, 
              background: '#f8f9fa', 
              borderRadius: 3,
              border: '1px solid #e9ecef',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                  {question.user?.name || t('productPage.user')}
                </Typography>
                <Typography sx={{ ml: 2, color: '#888', fontSize: '0.9rem' }}>
                  {formatDate(question.createdAt)}
                </Typography>
              </Box>
              <Typography sx={{ 
                color: '#555', 
                lineHeight: 1.6,
                fontSize: '0.95rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1
              }}>
                <HelpOutlineIcon sx={{ color: '#2196F3', fontSize: 20, mt: 0.2 }} />
                {question.question}
              </Typography>
              {question.answer && (
                <Box sx={{ mt: 2, p: 2, background: '#e3f2fd', borderRadius: 2, borderLeft: '4px solid #2196F3' }}>
                  <Typography sx={{ 
                    color: '#1976d2', 
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1
                  }}>
                    <ChatBubbleOutlineIcon sx={{ color: '#1976d2', fontSize: 20, mt: 0.2 }} />
                    <strong>{t('productPage.answer')}</strong> {question.answer}
                  </Typography>
                  {question.updatedAt && question.updatedAt !== question.createdAt && (
                    <Typography sx={{ 
                      color: '#666', 
                      fontSize: '0.8rem',
                      mt: 1,
                      fontStyle: 'italic'
                    }}>
                      {formatDate(question.updatedAt)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ))
        )}
        {/* Форма для вопроса */}
        {user && user.token && (
          <Box component="form" onSubmit={handleQuestionSubmit} sx={{ mt: 3, p: 2, background: '#f3f8ff', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HelpOutlineIcon sx={{ color: '#2196F3', fontSize: 20 }} />
              {t('productPage.askQuestion')}
            </Typography>
            <TextField
              label={t('productPage.questionText')}
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 1 }}
              required
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={questionLoading || !questionText}
              sx={{
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {questionLoading ? t('reviews.form.submitting') : t('productPage.submitQuestion')}
            </Button>
            {questionError && <Typography color="error" sx={{ mt: 1 }}>{questionError}</Typography>}
            {questionSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{questionSuccess}</Typography>}
          </Box>
        )}
        {!user && (
          <Typography sx={{ mt: 2, color: '#888' }}>{t('productPage.loginToAskQuestion')}</Typography>
        )}
      </Box>

            {/* Модальное окно для просмотра всех изображений товара (только для мобильных устройств) */}
      {!isDesktop && (
        <Modal 
          open={galleryOpen} 
          onClose={handleCloseGallery}
          onKeyDown={handleGalleryKeyDown}
          tabIndex={0}
          sx={{
            zIndex: 99999,
            '& .MuiBackdrop-root': {
              backgroundColor: '#ffffff'
            }
          }}
        >
          <Box 
            sx={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              bgcolor: '#ffffff', 
              p: 0, 
              borderRadius: 0, 
              outline: 'none', 
              maxWidth: '100%', 
              width: '100%', 
              textAlign: 'center',
              maxHeight: '100vh',
              overflow: 'hidden',
              zIndex: 99999,
              border: 'none',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              overscrollBehavior: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(() => {
              const realImages = getRealImages();
              
              if (realImages.length > 0 && galleryIndex < realImages.length && galleryIndex >= 0) {
                return (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 2,
                    minHeight: 150,
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                                          <Box 
                        ref={galleryRef}
                        onTouchStart={handleGalleryTouchStart}
                        onTouchMove={handleGalleryTouchMove}
                        onTouchEnd={handleGalleryTouchEnd}
                        sx={{ 
                          width: '100vw', 
                          height: '100vh', 
                          margin: 0,
                          background: 'transparent',
                          overflow: modalScale > 1 ? 'visible' : 'hidden',
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          touchAction: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${getHdImageUrl(getImageUrl(realImages[galleryIndex]), '2x')})`,
                          backgroundSize: 'contain', // Всегда contain для правильного масштабирования
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          transform: `scale(${modalScale}) translate(${modalTranslateX + swipeOffset}px, ${modalTranslateY}px)`,
                          transition: isAnimating ? 'transform 0.3s ease-out' : (modalScale > 1 ? 'none' : 'transform 0.2s ease-out'),
                          overflow: modalScale > 1 ? 'visible' : 'hidden',
                          transformOrigin: 'center center',
                          cursor: modalScale > 1 ? 'move' : 'default'
                        }} />
                      </Box>
                  </Box>
                );
              } else {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, height: 400 }}>
                    <span style={{ color: '#bbb', fontSize: 18, textAlign: 'center' }}>Нет изображений для просмотра</span>
                  </Box>
                );
              }
            })()}
            
            {/* Кнопка закрытия для мобильных */}
            <Box sx={{ 
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100001,
              pointerEvents: 'auto',
              touchAction: 'auto'
            }}>
              <Button 
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseGallery();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseGallery();
                }}
                sx={{ 
                  background: '#f44336',
                  color: '#fff',
                  borderRadius: 25,
                  fontWeight: 600,
                  fontSize: 16,
                  px: 4,
                  py: 2,
                  height: 50,
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  textTransform: 'none',
                  minWidth: 140,
                  border: 'none',
                  touchAction: 'auto',
                  pointerEvents: 'auto',
                  '&:hover': {
                    background: '#d32f2f',
                    boxShadow: '0 6px 20px rgba(244, 67, 54, 0.5)',
                  },
                  '&:active': {
                    background: '#c62828',
                  }
                }}
              >
                {t('common.close')}
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
      {/* Блок похожих товаров */}
      {similarProducts.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Похожие товары</Typography>
          <Box sx={{
            display: {
              xs: 'flex',
              md: 'grid'
            },
            flexDirection: { xs: 'row', md: 'unset' },
            flexWrap: { xs: 'wrap', md: 'unset' },
            justifyContent: { xs: 'center', md: 'center' },
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 280px)',
              lg: 'repeat(4, 280px)'
            },
            '@media (min-width:1400px)': {
              gridTemplateColumns: 'repeat(5, 280px)',
              maxWidth: 'calc(5 * 280px + 4 * 16px)'
            },
            gap: { xs: 1, sm: 1.5, md: 2 },
            mb: 6,
            width: '100%',
            maxWidth: { 
              xs: '100%', 
              md: 'calc(3 * 280px + 2 * 16px)',
              lg: 'calc(4 * 280px + 3 * 16px)'
            },
            mx: 'auto',
            px: 0
          }}>
            {similarProducts.map(similar => (
              <Box key={similar.id}>
                <ProductCard
                  product={similar}
                  user={user}
                  cart={cart}
                  onAddToCart={onAddToCart}
                  inWishlist={wishlist.includes(Number(similar.id))}
                  onWishlistToggle={() => onWishlistToggle(similar.id, wishlist.includes(Number(similar.id)))}
                  onClick={() => navigate(`/product/${similar.id}`)}
                  viewMode={isMobile ? "carousel-mobile" : "grid"}
                  isAdmin={isAdmin}
                  onChangeCartQuantity={handleChangeCartQuantity}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
      </Container>
    </>
  );
}