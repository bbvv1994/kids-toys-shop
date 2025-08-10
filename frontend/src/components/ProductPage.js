import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getImageUrl } from '../config';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography, Container, Modal, Rating, TextField, Chip, IconButton, Breadcrumbs } from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import ProductCard from './ProductCard';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
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
export default function ProductPage({ onAddToCart, cart, user, onChangeCartQuantity, onEditProduct, dbCategories, productId }) {
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  
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
      'Раскраски': 'coloring'
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
  const handleChangeCartQuantity = onChangeCartQuantity; // Переименовываем для совместимости
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Функция для принудительного обновления данных товара
  const refreshProductData = async () => {
    try {
      console.log('ProductPage: Forcing refresh of product data...');
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      const data = await response.json();
      console.log('ProductPage: Refreshed product data:', data);
      setProduct(data);
    } catch (error) {
      console.error('ProductPage: Error refreshing product data:', error);
    }
  };
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationSubscribed, setNotificationSubscribed] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState('');
  const [cartAnimPlaying, setCartAnimPlaying] = useState(false);
  const [cartAnimKey, setCartAnimKey] = useState(0);
  const [wishlistAnimPlaying, setWishlistAnimPlaying] = useState(false);
  const [wishlistAnimKey, setWishlistAnimKey] = useState(0); // eslint-disable-line no-unused-vars

  // Состояния для вопросов о товарах
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);

  // Безопасно ищем товар в корзине только если product загружен
  const cartItem = product ? cart?.items?.find(item => item.product.id === product.id) : null;
  const inCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // Если товар в корзине, количество берём из корзины, иначе — из локального состояния
  const displayQuantity = inCart ? cartQuantity : quantity;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await response.json();
        console.log('ProductPage: Loaded product data:', data);
        console.log('ProductPage: Product category:', data.category);
        console.log('ProductPage: Product subcategory:', data.subcategory);
        setProduct(data);
        setGalleryIndex(0); // Сбрасываем индекс галереи при загрузке нового товара
        setLoading(false);
      } catch (error) {
        console.error('ProductPage: Error loading product:', error);
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]); // Убираем product?.updatedAt из зависимостей

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
          console.log('ProductPage: Product updated detected, refreshing...');
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
    console.log('ProductPage: Загружаем отзывы для товара ID:', id);
    fetch(`${API_BASE_URL}/api/reviews/product/${id}`)
      .then(res => {
        console.log('ProductPage: Ответ API отзывов:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('ProductPage: Полученные отзывы:', data);
        setReviews(data);
      })
      .catch(error => {
        console.error('ProductPage: Ошибка загрузки отзывов:', error);
      });
  }, [id, reviewSuccess]);

  useEffect(() => {
    console.log('ProductPage: Загружаем вопросы для товара ID:', id);
    const loadQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}/questions`);
        console.log('ProductPage: Ответ API вопросов:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('ProductPage: Полученные вопросы:', data);
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
        console.log('ProductPage: Пользователь не авторизован');
        return;
      }
      
      try {
        // Проверяем, покупал ли пользователь этот товар
        const res = await fetch(`${API_BASE_URL}/api/profile/orders`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (!res.ok) {
          console.log('ProductPage: Ошибка получения заказов');
          return;
        }
        
        const orders = await res.json();
        const bought = orders.some(order => 
          order.items && order.items.some(item => item.product && item.product.id === parseInt(id))
        );
        
        if (!bought) {
          console.log('ProductPage: Пользователь не покупал этот товар');
          return;
        }
        
        // Проверяем, не оставлял ли уже отзыв
        const reviewRes = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`);
        
        if (!reviewRes.ok) {
          console.log('ProductPage: Ошибка получения отзывов');
          return;
        }
        
        const allReviews = await reviewRes.json();
        const userReview = allReviews.find(r => r.user && r.user.id === user.id);
        
        if (userReview) {
          console.log('ProductPage: Пользователь уже оставил отзыв');
          setAlreadyReviewed(true);
          return;
        }
        
        console.log('ProductPage: Пользователь может оставить отзыв');
        setCanReview(true);
      } catch (error) {
        console.error('ProductPage: Ошибка проверки возможности отзыва:', error);
      }
    }
    
    checkCanReview();
  }, [id, user, reviewSuccess]);

  useEffect(() => {
    async function fetchWishlist() {
      if (!user || !user.token) return setWishlist([]);
      const res = await fetch(`${API_BASE_URL}/api/profile/wishlist`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok && data && data.items) {
        setWishlist(data.items.map(item => item.productId));
      } else {
        setWishlist([]);
      }
    }
    fetchWishlist();
  }, [user, id]);

  useEffect(() => {
          if (product && product.category) {
        const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || 'Без категории');
        fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(categoryName)}`)
        .then(res => res.json())
        .then(data => {
          // Исключаем текущий товар и перемешиваем
          const filtered = data.filter(p => p.id !== product.id);
          const shuffled = filtered.sort(() => 0.5 - Math.random());
          setSimilarProducts(shuffled.slice(0, 5));
        });
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    // Удалить дубликаты по id
    const filtered = viewed.filter(p => p.id !== product.id);
    // Добавить текущий товар в начало
    filtered.unshift({
      id: product.id,
      name: product.name,
      image: product.imageUrls && product.imageUrls[0],
      price: product.price,
      // Добавьте другие нужные поля для ProductCard
      ...(['brand','category','subcategory','ageGroup','quantity'].reduce((acc, key) => { if (product[key]) acc[key] = product[key]; return acc; }, {}))
    });
    // Ограничить до 40
    const limited = filtered.slice(0, 40);
    localStorage.setItem('viewedProducts', JSON.stringify(limited));
  }, [product]);

  const handleWishlistToggle = async (productId, isInWishlist) => {
    if (!user || !user.token) {
      alert('Войдите, чтобы использовать избранное!');
      return;
    }
    if (wishlistAnimPlaying) return;
    
    // Запускаем анимацию только при добавлении в избранное
    if (!isInWishlist) {
      setWishlistAnimKey(prev => prev + 1);
      setWishlistAnimPlaying(true);
      setTimeout(() => {
        setWishlistAnimPlaying(false);
      }, 800); // Уменьшили время анимации
    }
    
    if (isInWishlist) {
      await fetch(`${API_BASE_URL}/api/profile/wishlist/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ productId })
      });
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      await fetch(`${API_BASE_URL}/api/profile/wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ productId })
      });
      setWishlist([...wishlist, productId]);
    }
  };

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
        setReviewSuccess('Ваш отзыв отправлен на модерацию!');
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
        setQuestionSuccess('Ваш вопрос отправлен! Мы ответим на него в ближайшее время.');
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
    setTimeout(() => {
      setCartAnimPlaying(false);
    }, 800); // Уменьшили время анимации
    
    const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || 'Без категории');
    onAddToCart(product, categoryName, displayQuantity);
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

  // Функции для свайпа в галерее
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Свайп влево - следующее изображение
      const realImages = getRealImages();
      if (realImages.length > 1) {
        setGalleryIndex((galleryIndex + 1) % realImages.length);
      }
    } else if (isRightSwipe) {
      // Свайп вправо - предыдущее изображение
      const realImages = getRealImages();
      if (realImages.length > 1) {
        setGalleryIndex((galleryIndex - 1 + realImages.length) % realImages.length);
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
      setGalleryOpen(false);
    }
  };

  // Функция для подписки на уведомления о наличии
  const handleNotificationSubscribe = async (e) => {
    e.preventDefault();
    if (!notificationEmail.trim()) {
      setNotificationError('Введите email');
      return;
    }
    
    setNotificationLoading(true);
    setNotificationError('');
    setNotificationSuccess('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/notify-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify({ 
          email: notificationEmail,
          productId: parseInt(id)
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setNotificationSuccess('Вы подписались на уведомления!');
        setNotificationSubscribed(true);
        setNotificationEmail('');
      } else {
        setNotificationError(data.error || 'Ошибка подписки');
      }
    } catch (e) {
      setNotificationError('Ошибка подписки на уведомления');
    }
    
    setNotificationLoading(false);
  };

  if (loading) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><Typography variant="h4">Загрузка...</Typography></Container>;
  }
  if (!product) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><Typography variant="h4">Товар не найден</Typography></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 10 }}>
      {/* Хлебные крошки */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{
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
          {product.category && typeof product.category === 'string' && (
            <Link 
              to={`/category/${product.categoryId || product.category}`}
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
              {translateCategory(product.category)}
            </Link>
          )}
          {product.category && typeof product.category === 'object' && product.category?.name && (
            <Link 
              to={`/category/${product.category.id || product.categoryId || product.category?.name}`}
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
              {translateCategory(product.category?.name)}
            </Link>
          )}
          {product.subcategory && typeof product.subcategory === 'string' && (
            <Link 
              to={`/subcategory/${product.subcategoryId || product.subcategory}`}
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
              {translateSubcategory(getCategoryName(product.category), product.subcategory)}
            </Link>
          )}
          {product.subcategory && typeof product.subcategory === 'object' && product.subcategory.name && (
            <Link 
              to={`/subcategory/${product.subcategory.id || product.subcategoryId || product.subcategory.name}`}
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
              {translateSubcategory(getCategoryName(product.category), product.subcategory.name)}
            </Link>
          )}
          <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: '14px' }}>
            {product.name || 'Товар'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'white',
        borderRadius: 3,
        p: { xs: 2, md: 4 },
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'relative'
      }}>
        {/* Галерея и инфо-бокс в одной строке */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          alignItems: { md: 'flex-start' }
        }}>
          {/* Галерея фото */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
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
                      <img
                        src={imageSrc}
                        alt={product.name}
                        style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 12, cursor: 'pointer', background: '#f6f6f6' }}
                        onClick={() => setGalleryOpen(true)}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onKeyDown={handleGalleryKeyDown}
                        tabIndex={0}
                        onError={(e) => {
                          // Показываем заглушку вместо скрытия изображения
                          const container = e.target.parentElement;
                          if (container) {
                            container.innerHTML = `
                              <div style="
                                width: 100%; 
                                height: 100%; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center; 
                                background: #f6f6f6; 
                                border-radius: 12px;
                                flex-direction: column;
                                gap: 8px;
                                position: relative;
                              ">
                                <img 
                                  src="/photography.jpg" 
                                  alt="Нет фото" 
                                  style="
                                    width: 100%; 
                                    height: 100%; 
                                    object-fit: cover; 
                                    border-radius: 12px; 
                                    opacity: 0.7;
                                  "
                                />
                                <div style="
                                  color: #666; 
                                  text-align: center;
                                  position: absolute;
                                  bottom: 16px;
                                  left: 50%;
                                  transform: translateX(-50%);
                                  background: rgba(255,255,255,0.9);
                                  padding: 4px 12px;
                                  border-radius: 4px;
                                  z-index: 1;
                                  font-size: 14px;
                                ">
                                  Фото отсутствует
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                    );
                  }
                }
                
                // Если нет изображений или только заглушки, показываем нашу заглушку
                console.log('Showing placeholder - no real images found');
                return (
                  <div style={{ 
                    width: '100%', 
                    height: 400, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: '#f6f6f6', 
                    borderRadius: 12,
                    flexDirection: 'column',
                    gap: 2,
                    position: 'relative'
                  }}>
                    <img 
                      src="/photography.jpg" 
                      alt="Нет фото" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: 12, 
                        opacity: 0.7 
                      }} 
                    />
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
                      Фото отсутствует
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
                      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {realImages.map((url, idx) => (
                          <img
                            key={idx}
                            src={getImageUrl(url)}
                            alt={`Миниатюра ${idx+1}`}
                            style={{ 
                              width: 56, 
                              height: 56, 
                              objectFit: 'cover', 
                              borderRadius: 6, 
                              border: galleryIndex === idx ? '2px solid #4ECDC4' : '2px solid #eee', 
                              cursor: 'pointer', 
                              boxShadow: galleryIndex === idx ? '0 2px 8px #4ECDC455' : 'none' 
                            }}
                            onClick={() => setGalleryIndex(idx)}
                          />
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
                variant="h6" 
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
                {typeof product.name === 'string' ? product.name : 'Название товара'}
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
                    onClick={e => { e.stopPropagation(); handleWishlistToggle(product.id, wishlist.includes(product.id)); }}
                    disabled={wishlistAnimPlaying}
                    sx={{
                      p: 0.75,
                      color: wishlist.includes(product.id) ? '#e53e3e' : '#666',
                      background: 'none',
                      borderRadius: '50%',
                      transition: 'color 0.2s, transform 0.2s',
                      '&:hover': {
                        color: wishlist.includes(product.id) ? '#c53030' : '#e53e3e',
                      },
                      '&:active': {
                        transform: 'scale(0.95)'
                      }
                    }}
                    aria-label={wishlist.includes(product.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                  >
                    {!wishlistAnimPlaying && (
                      wishlist.includes(product.id)
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
                    <img src={ageIcons[product.ageGroup]} alt="" style={{ width: 28, height: 28, marginRight: 0, verticalAlign: 'middle' }} />
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
                  {product.gender === 'Мальчик' ? t('productCard.gender.boy') : product.gender === 'Девочка' ? t('productCard.gender.girl') : t('productCard.gender.unisex')}
                </span>
              )}
            </Box>
            {/* Характеристики товара */}
            {/* Категория */}
            {product.category && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: 2, width: 'auto', maxWidth: 'max-content' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem', color: '#1976d2', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, marginBottom: 2 }}>
                  <img src={getCategoryIcon(typeof product.category === 'object' ? product.category : { name: product.category })} alt="cat" style={{ width: 20, height: 20, marginRight: 6, verticalAlign: 'middle' }} />
                  {typeof product.category === 'object' ? (product.category.label || product.category?.name) : product.category}
                </span>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
              <Typography variant="body2"><b>{t('productCard.sku')}: {product.article || '—'}</b></Typography>
              <Typography variant="body2"><b>{t('productCard.brand')}:</b> {product.brand || '—'}</Typography>
              <Typography variant="body2"><b>{t('productCard.country')}:</b> {product.manufacturer || product.country || '—'}</Typography>
              <Typography variant="body2" dir="rtl" style={{ textAlign: 'right' }}>
                <b>{t('productCard.dimensions')}:</b> {product.height && product.length && product.width ? 
                  `${product.length}×${product.width}×${product.height} ${t('productCard.units.cm')}` : 
                  '—'}
              </Typography>
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
            <Typography sx={{ color: '#1976d2', fontWeight: 700, fontSize: 24 }}>{formatPrice(product.price)}</Typography>
            {/* Выбор количества */}
            {product.quantity > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Количество:</Typography>
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
                      ? 'В корзине'
                      : `В корзину (${displayQuantity} шт.)`}
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
            
            {/* Уведомления о наличии */}
            {product.quantity <= 0 && !notificationSubscribed && (
              <Box sx={{ mt: 3, p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3, color: 'white' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  🔔 Уведомить о поступлении
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Оставьте свой email, и мы сообщим вам, когда товар появится в наличии
                </Typography>
                <Box component="form" onSubmit={handleNotificationSubscribe} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    type="email"
                    placeholder="Ваш email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    sx={{
                      flex: 1,
                      minWidth: 250,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,1)'
                        }
                      }
                    }}
                    disabled={notificationLoading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={notificationLoading || !notificationEmail.trim()}
                    sx={{
                      background: 'linear-gradient(90deg, #FFD93D 0%, #FF6B6B 100%)',
                      color: 'white',
                      borderRadius: 2,
                      fontWeight: 600,
                      px: 3,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #FF6B6B 0%, #FFD93D 100%)',
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    {notificationLoading ? 'Подписка...' : 'Подписаться'}
                  </Button>
                </Box>
                {notificationError && (
                  <Typography sx={{ mt: 1, color: '#ffebee', fontSize: '0.875rem' }}>
                    {notificationError}
                  </Typography>
                )}
                {notificationSuccess && (
                  <Typography sx={{ mt: 1, color: '#c8e6c9', fontSize: '0.875rem' }}>
                    {notificationSuccess}
                  </Typography>
                )}
              </Box>
            )}
            
            {product.quantity <= 0 && notificationSubscribed && (
              <Box sx={{ mt: 3, p: 3, background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', borderRadius: 3, color: 'white' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  ✅ Вы подписаны на уведомления
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Мы сообщим вам, когда товар появится в наличии
                </Typography>
              </Box>
            )}
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
            Описание
          </Typography>
          <Typography variant="body1" sx={{ 
            lineHeight: 1.7, 
            color: '#555',
            fontSize: '1.05rem',
            textAlign: 'justify'
          }}>
            {product.description && typeof product.description === 'string' ? product.description : 'Описание отсутствует'}
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
          Отзывы о товаре
        </Typography>
        {reviews.length === 0 && <Typography>Пока нет отзывов.</Typography>}
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={review.rating} readOnly size="small" sx={{ color: '#FFD600' }} />
              <Typography sx={{ ml: 2, fontWeight: 'bold', color: '#333' }}>
                {review.user?.name || 'Пользователь'}
              </Typography>
              <Typography sx={{ ml: 2, color: '#888', fontSize: '0.9rem' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
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
              Оставить отзыв
            </Typography>
            <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} sx={{ mb: 1 }} />
            <TextField
              label="Ваш отзыв"
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
              Отправить
            </Button>
            {reviewError && <Typography color="error" sx={{ mt: 1 }}>{reviewError}</Typography>}
            {reviewSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{reviewSuccess}</Typography>}
          </Box>
        )}
        {user && user.token && alreadyReviewed && (
          <Typography sx={{ mt: 2, color: '#888' }}>Вы уже оставили отзыв на этот товар.</Typography>
        )}
        {user && user.token && !canReview && !alreadyReviewed && (
          <Typography sx={{ mt: 2, color: '#888' }}>Оставлять отзывы могут только покупатели этого товара.</Typography>
        )}
        {!user && (
          <Typography sx={{ mt: 2, color: '#888' }}>Войдите в аккаунт, чтобы оставить отзыв.</Typography>
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
          Вопросы о товаре ({questions.length})
        </Typography>
        {questions.length === 0 ? (
          <Typography sx={{ color: '#666', fontStyle: 'italic' }}>
            Пока нет вопросов о данном товаре. Будьте первым, кто задаст вопрос!
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
                  {question.user?.name || 'Пользователь'}
                </Typography>
                <Typography sx={{ ml: 2, color: '#888', fontSize: '0.9rem' }}>
                  {new Date(question.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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
                    <strong>Ответ:</strong> {question.answer}
                  </Typography>
                  {question.updatedAt && question.updatedAt !== question.createdAt && (
                    <Typography sx={{ 
                      color: '#666', 
                      fontSize: '0.8rem',
                      mt: 1,
                      fontStyle: 'italic'
                    }}>
                      Ответ дан: {new Date(question.updatedAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
              Задать вопрос
            </Typography>
            <TextField
              label="Ваш вопрос"
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
              Отправить
            </Button>
            {questionError && <Typography color="error" sx={{ mt: 1 }}>{questionError}</Typography>}
            {questionSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{questionSuccess}</Typography>}
          </Box>
        )}
        {!user && (
          <Typography sx={{ mt: 2, color: '#888' }}>Войдите в аккаунт, чтобы задать вопрос.</Typography>
        )}
      </Box>

      {/* Модальное окно для просмотра всех изображений товара */}
      <Modal 
        open={galleryOpen} 
        onClose={() => setGalleryOpen(false)}
        onKeyDown={handleGalleryKeyDown}
        tabIndex={0}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            bgcolor: 'background.paper', 
            boxShadow: 24, 
            p: 2, 
            borderRadius: 2, 
            outline: 'none', 
            maxWidth: 700, 
            width: '95%', 
            textAlign: 'center' 
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>Фотографии товара</Typography>
          {(() => {
            const realImages = getRealImages();
            
            if (realImages.length > 0 && galleryIndex < realImages.length && galleryIndex >= 0) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Button 
                    onClick={() => setGalleryIndex((galleryIndex - 1 + realImages.length) % realImages.length)} 
                    disabled={realImages.length < 2}
                    TouchRippleProps={{
                      style: {
                        transform: 'scale(0.5)'
                      }
                    }}
                    sx={{
                      background: 'transparent',
                      color: realImages.length < 2 ? '#ccc' : '#ff6600',
                      borderRadius: '50%',
                      fontWeight: 600,
                      fontSize: 36,
                      minWidth: 80,
                      height: 80,
                      '&:hover': {
                        background: 'transparent',
                        color: realImages.length < 2 ? '#ccc' : '#e55a00'
                      }
                    }}
                  >
                    ‹
                  </Button>
                  <img
                    src={getImageUrl(realImages[galleryIndex])}
                    alt={`Фото ${galleryIndex+1}`}
                    style={{ width: 500, height: 500, objectFit: 'contain', borderRadius: 8, margin: '0 16px', background: '#f6f6f6' }}
                  />
                  <Button 
                    onClick={() => setGalleryIndex((galleryIndex + 1) % realImages.length)} 
                    disabled={realImages.length < 2}
                    TouchRippleProps={{
                      style: {
                        transform: 'scale(0.5)'
                      }
                    }}
                    sx={{
                      background: 'transparent',
                      color: realImages.length < 2 ? '#ccc' : '#ff6600',
                      borderRadius: '50%',
                      fontWeight: 600,
                      fontSize: 36,
                      minWidth: 80,
                      height: 80,
                      '&:hover': {
                        background: 'transparent',
                        color: realImages.length < 2 ? '#ccc' : '#e55a00'
                      }
                    }}
                  >
                    ›
                  </Button>
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
          {(() => {
            const realImages = getRealImages();
            if (realImages.length > 1) {
              return (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2, flexWrap: 'wrap' }}>
                  {realImages.map((url, idx) => (
                                          <img
                        key={idx}
                        src={getImageUrl(url)}
                        alt={`Миниатюра ${idx+1}`}
                      style={{ 
                        width: 48, 
                        height: 48, 
                        objectFit: 'cover', 
                        borderRadius: 4, 
                        border: galleryIndex === idx ? '2px solid #4ECDC4' : '2px solid #eee', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => setGalleryIndex(idx)}
                    />
                  ))}
                </Box>
              );
            }
            return null;
          })()}
          <Button 
            onClick={() => setGalleryOpen(false)} 
            sx={{ 
              mt: 2,
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
            }}
          >
            Закрыть
          </Button>
        </Box>
      </Modal>
      {/* Блок похожих товаров */}
      {similarProducts.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Похожие товары</Typography>
          <Box sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 1,
            '::-webkit-scrollbar': { height: 8 },
            '::-webkit-scrollbar-thumb': { background: '#b2f7ef', borderRadius: 4 }
          }}>
            {similarProducts.map(similar => (
              <Box key={similar.id} sx={{ minWidth: 220, maxWidth: 260, flex: '0 0 220px' }}>
                <ProductCard
                  product={similar}
                  user={user}
                  cart={cart}
                  onAddToCart={onAddToCart}
                  inWishlist={wishlist.includes(similar.id)}
                  onWishlistToggle={() => handleWishlistToggle(similar.id, wishlist.includes(similar.id))}
                  onClick={() => navigate(`/product/${similar.id}`)}
                  viewMode="similar" // Добавляем специальный режим для похожих товаров
                  isAdmin={isAdmin}
                  onChangeCartQuantity={handleChangeCartQuantity}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}