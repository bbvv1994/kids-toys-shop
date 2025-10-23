




import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ProductCard from './components/ProductCard';
import AdminShopReviews from './components/AdminShopReviews';
import AdminProductReviews from './components/AdminProductReviews';
import CustomerReviews from './components/CustomerReviews';
import LanguageSwitcher from './components/LanguageSwitcher';
import CustomSelect from './components/CustomSelect';
import BannerSlider from './components/BannerSlider';
import BoysToysPage from './components/BoysToysPage';
import GirlsToysPage from './components/GirlsToysPage';
import CMSProducts from './components/cms/CMSProducts';
import CMSCategories from './components/cms/CMSCategories';
import CMSPage from './components/cms/CMSPage';
import CMSOrders from './components/cms/CMSOrders';
import CategoryPage from './components/CategoryPage';
import SubcategoryPage from './components/SubcategoryPage';
import UserCabinetPage from './components/UserCabinetPage';
import HomePage from './components/HomePage';
import CatalogPage from './components/CatalogPage';
import ConfirmEmailPage from './components/ConfirmEmailPage';
import OAuthSuccessPage from './components/OAuthSuccessPage';
import AppContent from './components/AppContent';
import { useDeviceType } from './utils/deviceDetection';
import { CartProvider } from './contexts/CartContext';
import { UserProvider } from './contexts/UserContext';
import { ProductsProvider, useProducts } from './contexts/ProductsContext';
import { getImageUrl, API_BASE_URL } from './config';
import { getTranslatedName, forceLanguageUpdate, checkTranslationsAvailable } from './utils/translationUtils';
import TranslationDebugger from './components/TranslationDebugger';
import { getSpeechRecognitionLanguage, getSpeechRecognitionErrorMessage, isSpeechRecognitionSupported } from './utils/speechRecognitionUtils';
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Container, 
  Box, 
  Typography, 
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
  createTheme,
  TextField,
  InputAdornment,
  Modal,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  CircularProgress,
  Alert,
  Slider,
  Checkbox,
  FormControlLabel,
  Menu,
  Divider,
  ListItemIcon,
  ListItemText as MuiListItemText,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Breadcrumbs,
  Chip,
  Link,
} from '@mui/material';
import { 
  Home, 
  Close,
  Add as AddIcon,
  RateReview,
  ContactMail,
  Info,
  Search as SearchIcon,
  FormatListBulleted,
  Category as CategoryIcon,
  Favorite,
  FavoriteBorder,
  AdminPanelSettings,
  Star,
  KeyboardArrowDown,
  CloudUpload,
  DragIndicator,
  Close as CloseIcon,
  ChevronRight,
  ExpandMore,
  NoPhotography,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  FilterList,
  FilterAltRounded,
  ViewModule,
  ViewList,
  Menu as MenuIcon,
  Mic as MicIcon,
  Lock,
  Google,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Facebook,
  Security,
  AccountCircle,
  NavigateNext,
  Clear,
  LocalShipping,
  Category,
  Instagram,
  WhatsApp,
  Phone,
  Email
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import Lenis from 'lenis';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import categoriesData from './categoriesData';
import { transformCategoriesForNavigation } from './utils/categoryIcon';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import Grow from '@mui/material/Grow';
import Collapse from '@mui/material/Collapse';
import Pagination from '@mui/material/Pagination';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ElegantProductCarousel from './components/ElegantProductCarousel';
import ScrollToTopButton from './components/ScrollToTopButton';
import AboutPage from './components/AboutPage';
import ReviewsPage from './components/ReviewsPage';
import TestReviews from './components/TestReviews';
import TestProductReviews from './components/TestProductReviews';
import ContactsPage from './components/ContactsPage';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminUsers from './components/AdminUsers';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderSuccessPage from './components/OrderSuccessPage';
import WishlistPage from './components/WishlistPage';
import AttributionPage from './components/AttributionPage';
import SearchResultsPage from './components/SearchResultsPage';
import AuthModal from './components/AuthModal';
import EditProductModal from './components/EditProductModal';
import ReviewForm from './components/ReviewForm';
import ReviewPage from './components/ReviewPage';
import AdminCategories from './components/AdminCategories';
import AdminQuestions from './components/AdminQuestions';
import PublicQuestions from './components/PublicQuestions';
import BulkImportProducts from './components/BulkImportProducts';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { searchInProductNames } from './utils/translationUtils';

// Централизованный менеджер блокировки скролла
let scrollLockCount = 0;
let scrollEventListeners = null;

const lockScroll = () => {
  scrollLockCount++;
  
  if (scrollLockCount === 1) {
    document.body.style.overflow = 'hidden';
    // Сохраняем минимальную ширину для горизонтального скролла
    document.body.style.minWidth = '1200px';
    
    // Блокируем события прокрутки на window
    const preventScroll = (e) => {
      // Проверяем, что событие не происходит в полях ввода
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return;
      }
      
      // Проверяем, что событие не происходит внутри модального окна
      let element = e.target;
      while (element && element !== document.body) {
        if (element.classList && (
          element.classList.contains('MuiDialog-root') ||
          element.classList.contains('MuiDialogContent-root') ||
          element.classList.contains('MuiBox-root') ||
          element.classList.contains('MuiDialog-paper') ||
          element.classList.contains('MuiDialog-container') ||
          element.classList.contains('MuiModal-root') ||
          element.classList.contains('MuiModal-backdrop') ||
          element.tagName === 'DIALOG' ||
          element.getAttribute('role') === 'dialog' ||
          element.getAttribute('aria-modal') === 'true'
        )) {
          return;
        }
        element = element.parentElement;
      }
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', (e) => {
      // Проверяем, что событие не происходит в полях ввода
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
      }
    });
    
    scrollEventListeners = { preventScroll };
  }
};

const unlockScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  
  if (scrollLockCount === 0) {
    document.body.style.overflow = '';
    // Восстанавливаем горизонтальный скролл
    document.body.style.overflowX = 'auto';
    
    // Удаляем обработчики событий прокрутки
    if (scrollEventListeners) {
      window.removeEventListener('wheel', scrollEventListeners.preventScroll, { passive: false });
      window.removeEventListener('touchmove', scrollEventListeners.preventScroll, { passive: false });
      scrollEventListeners = null;
    }
  }
};

// Делаем функции доступными глобально
window.lockScroll = lockScroll;
window.unlockScroll = unlockScroll;

// Глобальный маппинг русских названий на русские названия для фильтра по полу
const genderMapping = {
  'Мальчики': 'Для мальчиков',
  'Девочки': 'Для девочек', 
  'Универсальный': 'Универсальный',
  // Также поддерживаем английские коды для совместимости
  'boy': 'Для мальчиков',
  'girl': 'Для девочек', 
  'unisex': 'Универсальный'
};

// Создаем яркую тему для детского магазина
const theme = createTheme({
  palette: {
    primary: {
      main: '#FFB300', // Ярко-жёлтый (солнечный)
    },
    secondary: {
      main: '#4FC3F7', // Голубой (небо)
    },
    background: {
      default: '#FFFDE7', // Очень светло-жёлтый
      paper: '#FFFFFF',
    },
    success: {
      main: '#81C784', // Зелёный (трава)
    },
    error: {
      main: '#E57373', // Красный (ягоды)
    },
    warning: {
      main: '#FFD54F', // Светло-оранжевый
    },
    info: {
      main: '#BA68C8', // Сиреневый (игрушки)
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 'bold',
      color: '#FFB300',
    },
    h2: {
      fontWeight: 'bold',
      color: '#4FC3F7',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          padding: '10px 24px',
          background: '#4FC3F7',
          color: '#fff',
          boxShadow: '0 2px 12px 0 rgba(79,195,247,0.10)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1), background 0.3s',
          outline: 'none',
          '&:hover': {
            background: '#039BE5',
            boxShadow: '0 4px 18px 0 rgba(79,195,247,0.18)',
            transform: 'scale(1.04)',
          },
          '&:active': {
            transform: 'scale(0.96)',
            boxShadow: '0 2px 8px 0 rgba(79,195,247,0.10)',
          },
          '&:focus-visible': {
            outline: '2px solid #039BE5',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

// Компонент с доступом к ProductsContext
function AppWithProducts() {
  const { i18n } = useTranslation();
  const { refreshCategories, setProducts: setContextProducts, refreshProducts } = useProducts();
  const location = useLocation();
  
  // Локальные состояния для устранения ошибок no-undef
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const appBarRef = useRef(null);
  const [submenuTimeout, setSubmenuTimeout] = useState(null);
  
  // Поддержка RTL для иврита - только для текста, не для компоновки
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Принудительная инициализация переводов для production
  useEffect(() => {
    const initializeTranslations = async () => {
      try {
        // Проверяем доступность переводов
        const translationsAvailable = checkTranslationsAvailable();
        
        if (!translationsAvailable) {
          console.warn('⚠️ Translations not available, forcing initialization...');
          // Принудительно устанавливаем язык
          forceLanguageUpdate('ru');
        }
        
        // Проверяем текущий язык
        const currentLang = i18n.language || localStorage.getItem('i18nextLng') || 'ru';
        if (!currentLang.match(/^(ru|he)$/)) {
          console.warn('⚠️ Invalid language detected, forcing to Russian');
          forceLanguageUpdate('ru');
        }
        

      } catch (error) {
        console.error('❌ Error initializing app translations:', error);
        // Fallback на русский
        forceLanguageUpdate('ru');
      }
    };
    
    // Запускаем инициализацию с небольшой задержкой для надежности
    const timer = setTimeout(initializeTranslations, 100);
    return () => clearTimeout(timer);
  }, [i18n.language]);
  

  // Отладчик переводов для production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Translation Debugger Active
    }
  }, [i18n.language]);

  // Прокрутка в начало страницы при изменении маршрута
  useEffect(() => {
    // Немедленная прокрутка
    window.scrollTo(0, 0);
    
    // Агрессивные попытки прокрутки для надежности
    const timers = [
      setTimeout(() => window.scrollTo(0, 0), 10),
      setTimeout(() => window.scrollTo(0, 0), 50),
      setTimeout(() => window.scrollTo(0, 0), 100),
      setTimeout(() => window.scrollTo(0, 0), 200),
      setTimeout(() => window.scrollTo(0, 0), 300),
      setTimeout(() => window.scrollTo(0, 0), 500),
      setTimeout(() => window.scrollTo(0, 0), 750),
      setTimeout(() => window.scrollTo(0, 0), 1000),
      setTimeout(() => window.scrollTo(0, 0), 1500)
    ];
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [location.pathname]);

  // Дополнительная прокрутка при загрузке приложения
  useEffect(() => {
    // Прокрутка при первой загрузке
    window.scrollTo(0, 0);
    
    const timers = [
      setTimeout(() => window.scrollTo(0, 0), 100),
      setTimeout(() => window.scrollTo(0, 0), 500),
      setTimeout(() => window.scrollTo(0, 0), 1000),
      setTimeout(() => window.scrollTo(0, 0), 2000)
    ];
    
    // Обработчик для прокрутки при обновлении страницы
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Только при первой загрузке

  const [editingProduct, setEditingProduct] = useState(null);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filtersMenuOpen, setFiltersMenuOpen] = useState(false);
  const desktopSearchBarRef = useRef(null);
  
  // Состояние для формы отзывов
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    productId: null,
    productName: null,
    productImage: null
  });

  // Состояние для модального окна подтверждения email
  const [emailConfirmModalOpen, setEmailConfirmModalOpen] = useState(false);
  const [emailConfirmData, setEmailConfirmData] = useState({
    email: '',
    name: ''
  });

  const subcategoriesPanelRef = useRef(null);
  const lenisSubcatRef = useRef(null);

  // Найдите начало компонента App (function App() { ... ) и добавьте:
  const [lottiePlayingMap, setLottiePlayingMap] = React.useState({});

  // Отладочный лог для addProductOpen
  // useEffect(() => {
  //   console.log('App: addProductOpen changed to', addProductOpen);
  // }, [addProductOpen]);

  // Загрузка пользователя из localStorage при инициализации





  // Функция для открытия бокового меню
  const onOpenSidebar = () => {
    setDrawerOpen(true);
  };


  // Функции для аутентификации

  const handleEditProduct = (product) => {
    console.log('🚀 handleEditProduct вызвана с товаром:', product?.id, product?.name);
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  // Функция для открытия формы отзывов
  const handleOpenReviewForm = (productId = null, productName = null, productImage = null) => {
    setReviewFormData({
      productId,
      productName,
      productImage
    });
    setReviewFormOpen(true);
  };
  // Сохранить изменения товара
  const handleSaveProduct = async (updatedProduct) => {
    // Аутентификация будет проверяться в AppContent через контексты
    console.log('🚀 handleSaveProduct вызвана с товаром:', updatedProduct?.id, updatedProduct?.name);
    try {
      const formData = new FormData();
      formData.append('name', updatedProduct.name);
      formData.append('nameHe', updatedProduct.nameHe || '');
      formData.append('description', updatedProduct.description);
      formData.append('descriptionHe', updatedProduct.descriptionHe || '');
      formData.append('price', updatedProduct.price);
      formData.append('category', updatedProduct.category);
  
      formData.append('subcategory', updatedProduct.subcategory || '');
      formData.append('ageGroup', updatedProduct.ageGroup);
      formData.append('quantity', updatedProduct.quantity);
      formData.append('article', updatedProduct.article || '');
      formData.append('brand', updatedProduct.brand || '');
      formData.append('country', updatedProduct.country || '');
      formData.append('length', updatedProduct.length || '');
      formData.append('width', updatedProduct.width || '');
      formData.append('height', updatedProduct.height || '');
      formData.append('gender', updatedProduct.gender || '');
      formData.append('isHidden', updatedProduct.isHidden || false);

      // Добавляем новые изображения, если они есть
      if (updatedProduct.newImages && updatedProduct.newImages.length > 0) {
        updatedProduct.newImages.forEach(image => {
          formData.append('images', image);
        });
      }

      // Добавляем информацию об удаленных изображениях
      if (updatedProduct.removedExistingImages && updatedProduct.removedExistingImages.length > 0) {
        formData.append('removedImages', JSON.stringify(updatedProduct.removedExistingImages));
      }

      // Добавляем текущее состояние существующих изображений
      if (updatedProduct.currentExistingImages) {
        formData.append('currentExistingImages', JSON.stringify(updatedProduct.currentExistingImages));
      }

      // Добавляем информацию о главном изображении
      if (updatedProduct.mainImageIndex !== undefined) {
        formData.append('mainImageIndex', updatedProduct.mainImageIndex.toString());
      }

      // Добавляем язык ввода для автоматического перевода
      if (updatedProduct.inputLanguage) {
        formData.append('inputLanguage', updatedProduct.inputLanguage);
      }

      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;
      
      console.log('🚀 Отправляем запрос на сервер:', `${API_BASE_URL}/api/products/${updatedProduct.id}`);
      console.log('🚀 Токен авторизации:', token ? 'есть' : 'нет');
      
      const response = await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('🚀 Получен ответ от сервера:', response.status, response.statusText);
      
      if (response.ok) {
        const savedProduct = await response.json();
    
        setEditModalOpen(false);
        setEditingProduct(null);
        
        // Обновляем локальное состояние товаров
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === updatedProduct.id ? savedProduct : p)
        );
        
        // Обновляем ProductsContext
        setContextProducts(prevProducts => 
          prevProducts.map(p => p.id === updatedProduct.id ? savedProduct : p)
        );
        
        // Принудительно обновляем товары из сервера для синхронизации
        await refreshProducts();
        
        // Вызываем callback для обновления списка товаров, если он передан
        if (updatedProduct.onSaveCallback) {
          updatedProduct.onSaveCallback();
        }
        
        console.log('✅ Товар успешно обновлен в локальном состоянии и контексте');
      } else {
        const error = await response.json();
        console.error('Error updating product:', error);
        throw new Error(error.message || 'Ошибка обновления товара');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Удалить товар
  const handleDeleteProduct = async (productId) => {
    // Аутентификация будет проверяться в AppContent через контексты

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Удаляем товар из локального состояния
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        
        // Удаляем товар из ProductsContext
        setContextProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        
        // Принудительно обновляем товары из сервера для синхронизации
        await refreshProducts();
        
        setEditModalOpen(false);
        setEditingProduct(null);
        
        // Вызываем callback для обновления списка товаров, если он передан
        if (editingProduct && editingProduct.onDeleteCallback) {
          editingProduct.onDeleteCallback();
        }
      } else {
        const error = await response.json();
        console.error('Error deleting product:', error);
        throw new Error(error.message || 'Ошибка удаления товара');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };



  // Функция плавного скролла
  const smoothScrollTo = (targetY, duration = 1200) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Функция плавности (easeOutCubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startY + distance * easeOutCubic);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  };

  const categories = [
    {
      id: 1,
      name: 'Игрушки',
      label: 'Игрушки',
      icon: '/toys.png',
      active: true,
      sub: [
        'Игрушки для самых маленьких',
        'Куклы',
        'Оружие игрушечное',
        'Треки, паркинги и жд',
        'Мягкие игрушки',
        'Игрушки - антистресс и сквиши',
        'Активные игры',
        'Тематические игровые наборы',
        'Декоративная косметика и украшения',
        'Машинки и другой транспорт',
        'Роботы и трансформеры',
        'Игровые фигурки',
        'Игрушки для песочницы',
        'Шарики',
        'Игрушки на радиоуправлении'
      ]
    },
    {
      id: 2,
      name: 'Конструкторы',
      label: 'Конструкторы',
      icon: '/constructor.png',
      active: true,
      sub: [
        'Lego для мальчиков',
        'Lego для девочек',
        'Металлические конструкторы',
        'Lego крупные блоки'
      ]
    },
    {
      id: 3,
      name: 'Пазлы',
      label: 'Пазлы',
      icon: '/puzzle.png',
      active: true,
      sub: [
        'Пазлы для взрослых',
        'Пазлы для детей',
        'Магнитные пазлы',
        'Пазлы напольные',
        'Пазлы для малышей'
      ]
    },
    {
      id: 4,
      name: 'Творчество',
      label: 'Творчество',
      icon: '/creativity.png',
      active: true,
      sub: [
        'Наборы для лепки',
        'Наклейки',
        'Лизуны и слаймы',
        'Кинетический песок',
        'Рисование',
        'Наборы для творчества',
        'Раскраски'
      ]
    },
    {
      id: 5,
      name: 'Канцтовары',
      label: 'Канцтовары',
      icon: '/stationery.png',
      active: true,
      sub: [
        'Портфели для школы',
        'Портфели для детских садов',
        'Пеналы',
        'Ручки и карандаши',
        'Точилки',
        'Фломастеры и маркеры',
        'Краски',
        'Кисточки и принадлежности',
        'Брелки'
      ]
    },
    {
      id: 6,
      name: 'Транспорт',
      label: 'Транспорт',
      icon: '/bicycle.png',
      active: true,
      sub: [
        'Детские самокаты',
        'Велосипеды',
        'Ходунки',
        'Беговелы'
      ]
    },
    {
      id: 7,
      name: 'Отдых на воде',
      label: 'Отдых на воде',
      icon: '/voda.png',
      active: true,
      sub: [
        'Бассейны',
        'Матрасы и плотики',
        'Круги надувные',
        'Нарукавники и жилеты',
        'Аксессуары для плавания',
        'Ракетки',
        'Пляжные мячи и игрушки для плавания',
        'Насосы для матрасов'
      ]
    },
    {
      id: 8,
      name: 'Настольные игры',
      label: 'Настольные игры',
      icon: '/nastolka.png',
      active: true,
      sub: [
        'Настольные игры'
      ]
    },
    {
      id: 9,
      name: 'Развивающие игры',
      label: 'Развивающие игры',
      icon: '/edu_game.png',
      active: true,
      sub: [
        'Развивающие игры'
      ]
    },
    {
      id: 10,
      name: 'Акции',
      label: 'Акции',
      icon: '/sale.png',
      active: true,
      sub: [
        'Скидки недели',
        'Товары по акции'
      ]
    }
  ];

  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState(categories);
  
  // Функция для загрузки категорий из localStorage
  const loadCategoriesFromStorage = () => {
    try {
      const saved = localStorage.getItem('adminCategories');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDbCategories(parsed);
        return true;
      }
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
    }
    return false;
  };

  // Функция для сохранения категорий в localStorage
  const saveCategoriesToStorage = (updatedCategories) => {
    try {
      localStorage.setItem('adminCategories', JSON.stringify(updatedCategories));
      setDbCategories(updatedCategories);
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  };

  // При первой загрузке используем статические категории с подкатегориями
  useEffect(() => {
    // Всегда используем статические категории с подкатегориями
    setDbCategories(categories);
  }, []); // Убираем зависимость от categories, чтобы не перезаписывать при изменениях


  // Отдельный массив для каталога (только 10 основных категорий без подкатегорий)
  // const catalogCategories = [
  //   { label: 'Игрушки', icon: '/igrushki.webp' },
  //   { label: 'Конструкторы', icon: '/lego1.webp' },
  //   { label: 'Пазлы', icon: '/puzzle.webp' },
  //   { label: 'Творчество', icon: '/tvorchestvo.webp' },
  //   { label: 'Канцтовары', icon: '/karandash.webp' },
  //   { label: 'Транспорт', icon: '/samokat.webp' },
  //   { label: 'Отдых на воде', icon: '/voda.webp' },
  //   { label: 'Настольные игры', icon: '/nastolnie-igri.webp' },
  //   { label: 'Развивающие игры', icon: '/razvitie.webp' },
  //   { label: 'Акции', icon: '/sale.webp' }
  // ];

  useEffect(() => {
    const backgroundUrl = getImageUrl('background.png');
    document.body.style.background = `url('${backgroundUrl}') no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
    return () => {
      document.body.style.background = "";
      document.body.style.backgroundSize = "";
    };
  }, []);

  // Функция для обновления всех состояний товаров
  const refreshAllProducts = async () => {
    try {
      
      // Загружаем товары для основного каталога (только видимые)
      const response = await fetch(`${API_BASE_URL}/api/products?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('🔄 refreshAllProducts: Failed to load main catalog products');
      }
      
      // Если пользователь авторизован и является админом, обновляем CMS товары
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?.token && currentUser?.role === 'admin') {
        const cmsResponse = await fetch(`${API_BASE_URL}/api/products?admin=true&_t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (cmsResponse.ok) {
          const cmsData = await cmsResponse.json();
          // Обновляем CMS товары, если они загружены
          if (window.cmsProductsSetter) {
            window.cmsProductsSetter(cmsData);
          }
        } else {
          console.error('🔄 refreshAllProducts: Failed to load CMS products');
        }
      } else {
      }

    } catch (error) {
      console.error('🔄 refreshAllProducts: Error refreshing all products:', error);
    }
  };

  // Делаем функцию доступной глобально
  React.useEffect(() => {
    window.refreshAllProducts = refreshAllProducts;
    return () => {
      delete window.refreshAllProducts;
    };
  }, []);

  // Загрузка данных из API
  useEffect(() => {
    // Загрузка товаров (без аутентификации)
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => {
        if (!res.ok) {
          console.error('Products API error:', res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Фильтруем undefined/null продукты
        const validProducts = Array.isArray(data) ? data.filter(product => product && product.id) : [];
        setProducts(validProducts);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setProducts([]);
      });
    
    // Используем статические категории с подкатегориями
    setDbCategories(categories);
  }, []); // Убираем user из зависимостей

  // Функция для получения иконки по названию категории (для loadCategoriesFromAPI)
  const getCategoryIconForAPI = (categoryName) => {
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

  // Функция для загрузки категорий из API
  const loadCategoriesFromAPI = async (forceRefresh = false, headers = {}) => {
    try {
      
      const categoriesUrl = `${API_BASE_URL}/api/categories?_t=${Date.now()}`;
      
      const res = await fetch(categoriesUrl, { headers });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const response = await res.json();
      const data = response.value || response; // Поддерживаем оба формата
      
      
      // Преобразуем серверные категории в нужный формат
      // Обрабатываем все категории, а не только корневые
      const transformedCategories = data.map(cat => {
        // Улучшенная логика для определения пути к иконке
        let iconPath;
        const imagePath = cat.image || cat.icon;
        if (imagePath) {
          // Если изображение содержит временную метку (175...), это загруженный файл
          if (imagePath.match(/^175\d+/)) {
            iconPath = `${API_BASE_URL}/uploads/${imagePath}?t=${Date.now()}`;
          } else {
            // Если это старый файл из public папки
            iconPath = `${API_BASE_URL}/public/${imagePath}?t=${Date.now()}`;
          }
        } else {
          // Если нет изображения, используем fallback
          iconPath = `${API_BASE_URL}/public${getCategoryIconForAPI(cat.name)}?t=${Date.now()}`;
        }
        
        return {
          id: cat.id,
          label: cat.name,
          name: cat.name,
          icon: iconPath,
          image: cat.image, // сохраняем оригинальное поле image
          active: cat.active !== false, // по умолчанию true, если active не false
          parentId: cat.parentId // сохраняем parentId для построения дерева
        };
      });
      
      setDbCategories(transformedCategories);
      
      return transformedCategories;
    } catch (error) {
      console.error('❌ loadCategoriesFromAPI: Error loading categories:', error);
      setDbCategories(categories);
      return categories;
    }
  };

  // Загрузка категорий из API (только если нужно)
  useEffect(() => {
    // Очищаем localStorage для принудительной загрузки категорий
    localStorage.removeItem('adminCategories');
    loadCategoriesFromAPI();
  }, []); // Зависимость user будет обрабатываться в AppContent через контексты

  // Делаем функцию loadCategoriesFromAPI доступной глобально
  useEffect(() => {
    window.loadCategoriesFromAPI = loadCategoriesFromAPI;
    window.refreshProductsContextCategories = refreshCategories;
    return () => {
      delete window.loadCategoriesFromAPI;
      delete window.refreshProductsContextCategories;
    };
  }, [loadCategoriesFromAPI, refreshCategories]);


  // Инициализация Lenis для плавного скролла
  const [lenis, setLenis] = useState(null);
  
  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      smooth: true,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
    });
    
    setLenis(lenisInstance);
    // Делаем Lenis доступным глобально
    window.lenis = lenisInstance;
    
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
    
    return () => {
      lenisInstance.destroy();
      delete window.lenis;
    };
  }, []);

  useEffect(() => {
    if (lenis) {
      if (miniCartOpen || authOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
    // Блокируем скролл body только для miniCart
    if (miniCartOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => {
      unlockScroll();
    };
  }, [miniCartOpen, authOpen, lenis]);

  useEffect(() => {
    const hasLoadedFromStorage = loadCategoriesFromStorage();
    if (!hasLoadedFromStorage) {
      // Если в localStorage нет данных, используем исходные категории
      setDbCategories(categories);
    }
  }, []); // Убираем зависимость от categories, чтобы не перезаписывать при изменениях



  return (
    <AppContent 
      editModalOpen={editModalOpen}
      setEditModalOpen={setEditModalOpen}
      authOpen={authOpen}
      setAuthOpen={setAuthOpen}
      authLoading={authLoading}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      hoveredCategory={hoveredCategory}
      setHoveredCategory={setHoveredCategory}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      appBarRef={appBarRef}
      submenuTimeout={submenuTimeout}
      setSubmenuTimeout={setSubmenuTimeout}
      onOpenSidebar={onOpenSidebar}
      handleEditProduct={handleEditProduct}
      handleSaveProduct={handleSaveProduct}
      handleDeleteProduct={handleDeleteProduct}
      // TODO: Use UserContext for authentication
      // handleLogin and handleRegister are now in UserContext
      editingProduct={editingProduct}
      setEditingProduct={setEditingProduct}
      loadCategoriesFromAPI={loadCategoriesFromAPI}
      selectedGenders={selectedGenders}
      onGendersChange={setSelectedGenders}
      selectedBrands={selectedBrands}
      selectedAgeGroups={selectedAgeGroups}
      setSelectedBrands={setSelectedBrands}
      setSelectedAgeGroups={setSelectedAgeGroups}
      // TODO: Use UserContext for user updates
      // handleUserUpdate is now in UserContext
      handleOpenReviewForm={handleOpenReviewForm}
      reviewFormOpen={reviewFormOpen}
      setReviewFormOpen={setReviewFormOpen}
      reviewFormData={reviewFormData}
      emailConfirmModalOpen={emailConfirmModalOpen}
      setEmailConfirmModalOpen={setEmailConfirmModalOpen}
      emailConfirmData={emailConfirmData}
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      filtersMenuOpen={filtersMenuOpen}
      setFiltersMenuOpen={setFiltersMenuOpen}
      desktopSearchBarRef={desktopSearchBarRef}
    />
  );
}






// Главный компонент приложения
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <html lang="he" />
        <title>סימבה מלך הצעצועים | חנות צעצועים לילדים בישראל</title>
        <meta name="description" content="חנות צעצועים לילדים בישראל – צעצועים איכותיים, משחקי קופסה, לגו, יצירה ועוד. איכות מעולה במחירים נוחים." />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="סימבה מלך הצעצועים" />
        <meta property="og:description" content="חנות צעצועים לילדים בישראל – מגוון ענק במחירים נוחים" />
        <meta property="og:image" content="/lion-logo.png" />
        <meta property="og:image:alt" content="סימבה מלך הצעצועים" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="alternate" hrefLang="he" href="https://simba-tzatzuim.co.il/" />
        <link rel="alternate" hrefLang="ru" href="https://simba-tzatzuim.co.il/" />
        <link rel="alternate" hrefLang="x-default" href="https://simba-tzatzuim.co.il/" />
        <link rel="canonical" href="https://simba-tzatzuim.co.il/" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "סימבה מלך הצעצועים",
            "url": "https://simba-tzatzuim.co.il/",
            "logo": "/lion-logo.png",
            "sameAs": [
              "https://www.facebook.com/simbakingoftoys",
              "https://www.instagram.com/simbaking_oftoys"
            ],
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+972-53-377-4509",
              "contactType": "customer service",
              "areaServed": "IL",
              "availableLanguage": ["he", "ru"]
            }]
          }
        `}</script>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "סימבה מלך הצעצועים",
            "url": "https://simba-tzatzuim.co.il/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://simba-tzatzuim.co.il/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        `}</script>
      </Helmet>
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'none',
      }}>
        <Router>
          <UserProvider>
            <ProductsProvider>
              <CartProvider>
                <AppWithProducts />
              </CartProvider>
            </ProductsProvider>
          </UserProvider>
        </Router>
      </Box>
      {/* Кнопка возврата вверх на всех страницах */}
      <ScrollToTopButton />
    </ThemeProvider>
  );
}

export default App; 