




import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// Главный компонент приложения
function App() {
  const { i18n } = useTranslation();
  
  // Локальные состояния для устранения ошибок no-undef
  const [cart, setCart] = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const appBarRef = useRef(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
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
  
  // Делаем setUser доступным глобально для ConfirmEmailPage
  useEffect(() => {
    window.setUser = setUser;
    return () => {
      delete window.setUser;
    };
  }, []);

  // Отладчик переводов для production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Translation Debugger Active
    }
  }, [i18n.language]);

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
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Проверяем, что пользователь подтвердил email
        if (userData.emailVerified === false) {

          localStorage.removeItem('user');
          setUserLoading(false);
          return; // Не устанавливаем пользователя, если email не подтвержден
        }
        
        // Ensure the user object includes the token
        const userWithToken = {
          ...userData,
          token: userData.token || localStorage.getItem('token')
        };
        
        setUser(userWithToken);
      } catch (error) {
        console.error('Ошибка при загрузке пользователя из localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    
    // Устанавливаем загрузку в false после попытки загрузки
    setUserLoading(false);
  }, []);

  // Загрузка локальной корзины для гостей
  useEffect(() => {
    if (!user) {
      // Если пользователь не авторизован, загружаем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      setCart(localCart);
    }
  }, [user]);

  // Обработка подтверждения email через URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Подтверждаем email и автоматически входим в систему
      fetch(`${API_BASE_URL}/api/auth/confirm?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.token && data.user) {
            // Автоматически входим в систему
            const userData = {
              ...data.user,
              token: data.token
            };
            
            // Сохраняем в localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', data.token);
            
            // Устанавливаем пользователя
            setUser(userData);
            
            // Очищаем URL от токена
            window.history.replaceState({}, document.title, window.location.pathname);
            

          }
        })
        .catch(error => {
          console.error('Ошибка подтверждения email:', error);
        });
    }
  }, []);

  // Load cart when user is authenticated
  useEffect(() => {
    setCartLoading(true);
    if (user && user.token) {
      fetch(`${API_BASE_URL}/api/profile/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setCartLoading(false);
      })
      .catch(error => {
        console.error('Error loading cart:', error);
        setCart({ items: [] });
        setCartLoading(false);
      });
    } else {
      // Для незарегистрированных пользователей загружаем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      setCart(localCart);
      setCartLoading(false);
    }
  }, [user]);

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (user && user.token) {
      fetch(`${API_BASE_URL}/api/profile/wishlist`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
    
        // The wishlist API returns { items: [{ productId: number, product: {...} }] }
        const wishlistItems = data.items || [];
        setWishlist(wishlistItems);
      })
      .catch(error => {
        console.error('Error loading wishlist:', error);
        setWishlist([]);
      });
    } else {
      setWishlist([]);
    }
  }, [user]);

  // Функция для открытия бокового меню
  const onOpenSidebar = () => {
    setDrawerOpen(true);
  };

  // Функции для работы с корзиной
  const handleAddToCart = async (product, category, quantity = 1) => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей используем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      
      // Проверяем, есть ли уже такой товар в корзине
      const existingItem = localCart.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        localCart.items.push({
          id: Date.now() + Math.random(), // Уникальный ID для локального элемента
          product: product,
          quantity: quantity
        });
      }
      
      localStorage.setItem('localCart', JSON.stringify(localCart));
      setCart(localCart);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId: product.id, quantity: quantity })
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
    
      } else {
        console.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const handleChangeCartQuantity = async (productId, quantity) => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей обновляем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      const itemIndex = localCart.items.findIndex(item => item.product.id === productId);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          localCart.items.splice(itemIndex, 1);
        } else {
          localCart.items[itemIndex].quantity = quantity;
        }
        
        localStorage.setItem('localCart', JSON.stringify(localCart));
        setCart(localCart);
      }
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/cart/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей удаляем из локальной корзины
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      const itemIndex = localCart.items.findIndex(item => item.product.id === productId);
      
      if (itemIndex !== -1) {
        localCart.items.splice(itemIndex, 1);
        localStorage.setItem('localCart', JSON.stringify(localCart));
        setCart(localCart);
      }
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/cart/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId })
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Функция для очистки корзины после успешного заказа
  const handleClearCart = async () => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей очищаем локальную корзину
      localStorage.removeItem('localCart');
      setCart({ items: [] });

      return;
    }
    
    try {
      // Очищаем корзину на фронтенде
      setCart({ items: [] });
      
      // Обновляем корзину через API для синхронизации с сервером
      const response = await fetch(`${API_BASE_URL}/api/profile/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
      

    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Функция для работы с избранным
  const handleWishlistToggle = async (productId, isInWishlist) => {
    setLottiePlayingMap(prev => {
      const newMap = { ...prev, [Number(productId)]: true };
      return newMap;
    });
    setTimeout(() => {
      setLottiePlayingMap(prev => {
        const newMap = { ...prev, [Number(productId)]: false };
        return newMap;
      });
    }, 1200);
    if (!user || !user.token) {
      setAuthOpen(true);
      return;
    }
    
    try {
      const endpoint = isInWishlist ? 'remove' : 'add';
      const response = await fetch(`${API_BASE_URL}/api/profile/wishlist/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId: Number(productId) })
      });
      
      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist.items || []);
      } else {
        const errorData = await response.json();
        console.error('Wishlist API error:', errorData);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Функции для аутентификации
  const handleLogin = async (userData) => {
    // Проверяем, что пользователь подтвердил email
    if (userData && userData.emailVerified === false) {
      return; // Не входим в систему, если email не подтвержден
    }
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleRegister = async (userData) => {
    // При регистрации пользователь не должен сразу входить в систему
    // Показываем модальное окно с просьбой подтвердить email
    
    // Сохраняем данные для модального окна
    setEmailConfirmData({
      email: userData.email,
      name: userData.name
    });
    
    // Открываем модальное окно подтверждения
    setEmailConfirmModalOpen(true);
    
    // Закрываем окно авторизации
    setAuthOpen(false);
  };

  const handleLogout = () => {
    // Логика выхода
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('submittedReviews');
    localStorage.removeItem('completedNotifications');
    localStorage.removeItem('notificationsCleared');
    localStorage.removeItem('notificationsClearedAt');
    localStorage.removeItem('notificationsCountAtClear');
    localStorage.removeItem('clearNotificationsOnProfile');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleEditProduct = (product) => {
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
    if (!user || !user.token) {
      console.error('User not authenticated');
      return;
    }

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
      

      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;


      
      const response = await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const savedProduct = await response.json();
    
        setEditModalOpen(false);
        setEditingProduct(null);
        
        // Обновляем локальное состояние товаров
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === updatedProduct.id ? savedProduct : p)
        );
        
        // Принудительно обновляем данные товара на странице товара
        // Это заставит ProductPage перезагрузить данные
        const currentProduct = products.find(p => p.id === updatedProduct.id);
        if (currentProduct) {
          // Обновляем updatedAt, чтобы заставить useEffect в ProductPage перезагрузить данные
          const updatedProductWithNewTimestamp = {
            ...savedProduct,
            updatedAt: new Date().toISOString()
          };
          setProducts(prevProducts => 
            prevProducts.map(p => p.id === updatedProduct.id ? updatedProductWithNewTimestamp : p)
          );
        }
        
        // Вызываем callback для обновления списка товаров, если он передан
        if (updatedProduct.onSaveCallback) {
          updatedProduct.onSaveCallback();
        }
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
    if (!user || !user.token) {
      console.error('User not authenticated');
      return;
    }

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
      console.log('🔄 refreshAllProducts: Starting refresh...');
      
      // Загружаем товары для основного каталога (только видимые)
      const response = await fetch(`${API_BASE_URL}/api/products?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔄 refreshAllProducts: Updated main catalog with', data.length, 'products');
        setProducts(data);
      } else {
        console.error('🔄 refreshAllProducts: Failed to load main catalog products');
      }
      
      // Если пользователь авторизован и является админом, обновляем CMS товары
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?.token && currentUser?.role === 'admin') {
        console.log('🔄 refreshAllProducts: Updating CMS products for admin...');
        const cmsResponse = await fetch(`${API_BASE_URL}/api/products?admin=true&_t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (cmsResponse.ok) {
          const cmsData = await cmsResponse.json();
          console.log('🔄 refreshAllProducts: Updated CMS catalog with', cmsData.length, 'products');
          // Обновляем CMS товары, если они загружены
          if (window.cmsProductsSetter) {
            window.cmsProductsSetter(cmsData);
          }
        } else {
          console.error('🔄 refreshAllProducts: Failed to load CMS products');
        }
      } else {
        console.log('🔄 refreshAllProducts: User is not admin, skipping CMS update');
      }

      console.log('🔄 refreshAllProducts: Refresh completed');
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
    
        setProducts(data);
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
  const loadCategoriesFromAPI = async (forceRefresh = false) => {
    try {
      console.log('🔄 loadCategoriesFromAPI: Starting load...', { forceRefresh });
      
      const categoriesUrl = user?.role === 'admin' 
        ? `${API_BASE_URL}/api/admin/categories${forceRefresh ? `?_t=${Date.now()}` : ''}`
        : `${API_BASE_URL}/api/categories${forceRefresh ? `?_t=${Date.now()}` : ''}`;
      
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      
      const res = await fetch(categoriesUrl, { headers });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const response = await res.json();
      const data = response.value || response; // Поддерживаем оба формата
      
      console.log('🔄 loadCategoriesFromAPI: Categories loaded from API:', data.length, 'categories');
      
      // Преобразуем серверные категории в нужный формат
      // Обрабатываем все категории, а не только корневые
      const transformedCategories = data.map(cat => {
        // Улучшенная логика для определения пути к иконке
        let iconPath;
        if (cat.image) {
          // Если изображение содержит временную метку (175...), это загруженный файл
          if (cat.image.match(/^175\d+/)) {
            iconPath = `${API_BASE_URL}/uploads/${cat.image}?t=${Date.now()}`;
          } else {
            // Если это старый файл из public папки
            iconPath = `${API_BASE_URL}/public/${cat.image}?t=${Date.now()}`;
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
      
      console.log('🔄 loadCategoriesFromAPI: Transformed categories:', transformedCategories.length);
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
  }, [user]);

  // Делаем функцию loadCategoriesFromAPI доступной глобально
  useEffect(() => {
    window.loadCategoriesFromAPI = loadCategoriesFromAPI;
    return () => {
      delete window.loadCategoriesFromAPI;
    };
  }, [loadCategoriesFromAPI]);

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'none',
      }}>
        <Router>
          <AppContent 
            cart={cart}
            cartLoading={cartLoading}
            user={user}
            userLoading={userLoading}
            handleLogout={handleLogout}
            setAuthOpen={setAuthOpen}
            profileLoading={profileLoading}
            onOpenSidebar={onOpenSidebar}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            appBarRef={appBarRef}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}

            miniCartOpen={miniCartOpen}
            setMiniCartOpen={setMiniCartOpen}
            handleChangeCartQuantity={handleChangeCartQuantity}
            handleRemoveFromCart={handleRemoveFromCart}
            handleAddToCart={handleAddToCart}
            handleEditProduct={handleEditProduct}
            handleSaveProduct={handleSaveProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleWishlistToggle={handleWishlistToggle}
            handleClearCart={handleClearCart}
            wishlist={wishlist}
            products={products}
            dbCategories={dbCategories}
            authOpen={authOpen}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            
            editModalOpen={editModalOpen}
            setEditModalOpen={setEditModalOpen}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            loadCategoriesFromAPI={loadCategoriesFromAPI}
            selectedGenders={selectedGenders}
            onGendersChange={setSelectedGenders}
            selectedBrands={selectedBrands}
            selectedAgeGroups={selectedAgeGroups}
            setSelectedBrands={setSelectedBrands}
            setSelectedAgeGroups={setSelectedAgeGroups}
            handleUserUpdate={handleUserUpdate}
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
        </Router>
      </Box>
      {/* Кнопка возврата вверх на всех страницах */}
      <ScrollToTopButton />
    </ThemeProvider>
  );
}






export default App; 