

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from './components/ProductCard';
import AdminShopReviews from './components/AdminShopReviews';
import AdminProductReviews from './components/AdminProductReviews';
import CustomerReviews from './components/CustomerReviews';
import LanguageSwitcher from './components/LanguageSwitcher';
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
import CustomSelect from './components/CustomSelect';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ProductCarousel from './components/ProductCarousel';
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

// Глобальный маппинг английских кодов на русские названия для фильтра по полу
const genderMapping = {
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

  // Компонент навигации
  function Navigation({ cartCount, user, handleLogout, setAuthOpen, profileLoading, onOpenSidebar, mobileOpen, setMobileOpen, appBarRef, drawerOpen, setDrawerOpen, miniCartOpen, setMiniCartOpen, cart, onChangeCartQuantity, onRemoveFromCart, dbCategories, selectedGenders, onGendersChange, products, selectedBrands, setSelectedBrands, selectedAgeGroups, setSelectedAgeGroups, mobileFiltersOpen, setMobileFiltersOpen, priceRange, setPriceRange, filtersMenuOpen, setFiltersMenuOpen, desktopSearchBarRef }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const deviceType = useDeviceType();
  // Viewport-based breakpoints
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  const isNarrow = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [submenuTimeout, setSubmenuTimeout] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceLimits, setPriceLimits] = useState([0, 10000]);
  const [touchedCategory, setTouchedCategory] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState(null);
  const cartIconRef = useRef(null);
  const drawerListRef = useRef(null); // ref для списка категорий внутри Drawer

  const lenisDrawerRef = useRef(null); // Lenis instance для Drawer

  const [searchValue, setSearchValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef(null);
  const isHome = location.pathname === '/';
  const isCatalog = location.pathname === '/catalog';
  const shouldShowDesktopSearch = isHome || isCatalog;
  const drawerPaperRef = useRef(null); // ref для Drawer-пейпера
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [openCatIdx, setOpenCatIdx] = React.useState(null);

  const categoryBtnRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuAnchorPos, setMenuAnchorPos] = React.useState({ top: 0, left: 0 });
  const popperRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const mainMenuRef = useRef(null);
  const lenisMainMenuRef = useRef(null);
  const subcategoriesMenuRef = useRef(null);
  const lenisSubcategoriesMenuRef = useRef(null);
  const [instantClose, setInstantClose] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = React.useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  
  // Автоматическая прокрутка наверх при изменении маршрута
  useEffect(() => {
    // Плавная прокрутка наверх при переходе на новую страницу
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  // Определение сенсорного устройства
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouchScreen);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => {
      window.removeEventListener('resize', checkTouchDevice);
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
    };
  }, [touchTimeout]);

  // Закрытие мобильного меню категорий при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileCategoriesOpen) {
        const button = document.querySelector('[data-mobile-categories-button]');
        const popper = document.querySelector('[role="tooltip"]');
        
        if (button && !button.contains(event.target) && 
            popper && !popper.contains(event.target)) {
          setMobileCategoriesOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileCategoriesOpen]);

  // Закрытие сенсорного меню категорий при клике вне его
  useEffect(() => {
    const handleTouchOutside = (event) => {
      if (touchedCategory && isTouchDevice) {
        const menuElement = document.querySelector('.category-dropdown-submenu');
        const categoryList = document.querySelector('[data-category-list]');
        const arrowElements = document.querySelectorAll('[data-category-list] span');
        
        // Проверяем, был ли клик по стрелочке
        const isArrowClick = Array.from(arrowElements).some(arrow => 
          arrow.contains(event.target) || event.target === arrow
        );
        
        if (!isArrowClick && menuElement && !menuElement.contains(event.target) && 
            categoryList && !categoryList.contains(event.target)) {
          setTouchedCategory(null);
        }
      }
    };

    if (isTouchDevice) {
      document.addEventListener('touchstart', handleTouchOutside);
      document.addEventListener('mousedown', handleTouchOutside);
      return () => {
        document.removeEventListener('touchstart', handleTouchOutside);
        document.removeEventListener('mousedown', handleTouchOutside);
      };
    }
  }, [touchedCategory, isTouchDevice]);

  // Сброс состояния открытых категорий при открытии мобильного меню
  useEffect(() => {
    if (mobileCategoriesOpen) {
      setOpenCatIdx(null);
    }
  }, [mobileCategoriesOpen]);

  // Закрытие десктопных фильтров при клике вне их области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersMenuOpen) {
        const filtersPanel = filtersPanelRef?.current;
        const searchBar = desktopSearchBarRef?.current;
        
        // Проверяем, был ли клик по кнопке фильтров в поисковой строке
        const filterButton = event.target.closest('[data-filter-button]');
        
        if (filtersPanel && !filtersPanel.contains(event.target) && 
            searchBar && !searchBar.contains(event.target) && 
            !filterButton) {
          setFiltersMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filtersMenuOpen]);

  // Функции для управления контекстным меню профиля
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleProfileMenuClick = (section) => {
    handleProfileMenuClose();
    if (section === 'logout') {
      handleLogout();
    } else {
      navigate('/profile');
      // Устанавливаем выбранную секцию в localStorage для передачи в профиль
      localStorage.setItem('selectedProfileSection', section);
      // Принудительно обновляем состояние через небольшую задержку
      setTimeout(() => {
        const event = new CustomEvent('profileSectionChanged', { detail: section });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  const [notificationsCleared, setNotificationsCleared] = useState(() => {
    // Инициализируем из localStorage
    return localStorage.getItem('notificationsCleared') === 'true';
  });
  // ВРЕМЕННЫЕ состояния для фильтров (только для визуала)
  const [filterAgeGroup, setFilterAgeGroup] = React.useState('all');
  const [filterGender, setFilterGender] = React.useState([]);
  const [sortBy, setSortBy] = React.useState('newest');
  const [pageSize, setPageSize] = React.useState(24);
  const [page, setPage] = React.useState(1);
  // ВРЕМЕННЫЕ состояния и списки для фильтров
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const categories = ['Игрушки', 'Конструкторы', 'Пазлы', 'Творчество', 'Канцтовары', 'Транспорт', 'Отдых на воде', 'Настольные игры', 'Развивающие игры', 'Акции'];
  const ageGroups = [
    t('catalog.ageGroups.0-1_year'),
    t('catalog.ageGroups.1-3_years'),
    t('catalog.ageGroups.3-5_years'),
    t('catalog.ageGroups.5-7_years'),
    t('catalog.ageGroups.7-10_years'),
    t('catalog.ageGroups.10-12_years'),
    t('catalog.ageGroups.12-14_years'),
    t('catalog.ageGroups.14-16_years')
  ];
  const genderOptions = [
    { value: 'boy', label: t('catalog.genderOptions.boy') },
    { value: 'girl', label: t('catalog.genderOptions.girl') },
    { value: 'unisex', label: t('catalog.genderOptions.unisex') }
  ];

  // Функция для загрузки количества непрочитанных уведомлений
  const loadUnreadNotificationsCount = async () => {
    if (!user || !user.token) {
      setUnreadNotificationsCount(0);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const totalCount = data.count || 0;
        
        // Проверяем, был ли счетчик обнулен пользователем
        const notificationsClearedFlag = localStorage.getItem('notificationsCleared');
        const clearedAt = localStorage.getItem('notificationsClearedAt');
        const clearedCount = parseInt(localStorage.getItem('notificationsCountAtClear') || '0');
        
        if (notificationsClearedFlag === 'true' && clearedAt) {
          // Если счетчик был обнулен, показываем только новые уведомления после обнуления
          const newCount = Math.max(0, totalCount - clearedCount);
          setUnreadNotificationsCount(newCount);
        } else {
          // Если счетчик не был обнулен, показываем все уведомления
          setUnreadNotificationsCount(totalCount);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки количества непрочитанных уведомлений:', error);
    }
  };

  // Загружаем количество непрочитанных уведомлений при изменении пользователя
  useEffect(() => {
    // Проверяем, не является ли это обновлением с перезагрузкой
    const skipReload = localStorage.getItem('skipReload');
    if (skipReload) {
      // Если это перезагрузка для переключения на уведомления, обнуляем счетчик
      setUnreadNotificationsCount(0);
      localStorage.removeItem('skipReload');
      return;
    }
    
    // НЕ сбрасываем флаги при изменении пользователя - они должны сохраняться
    // Только загружаем количество уведомлений
    loadUnreadNotificationsCount();
    
    // Обновляем каждые 30 секунд, но только если счетчик не был обнулен пользователем
    const interval = setInterval(() => {
      // Проверяем, не был ли счетчик обнулен пользователем
      const notificationsClearedFlag = localStorage.getItem('notificationsCleared');
      if (notificationsClearedFlag !== 'true') {
        loadUnreadNotificationsCount();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Обработчик события для немедленного обновления счетчика уведомлений
  useEffect(() => {
    const handleUpdateNotificationsCount = () => {
      // Обновляем счетчик при появлении новых уведомлений
      // НЕ сбрасываем флаги обнуления - они должны сохраняться
      loadUnreadNotificationsCount();
    };

    const handleClearNotificationsCount = () => {
      // Обнуляем счетчик уведомлений и запоминаем время обнуления
      setUnreadNotificationsCount(0);
      localStorage.setItem('notificationsCleared', 'true');
      localStorage.setItem('notificationsClearedAt', Date.now().toString());
      
      // Сохраняем текущее количество уведомлений для расчета новых
      // Используем актуальное количество из API, а не из состояния
      fetch(`${API_BASE_URL}/api/profile/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        const currentCount = data.count || 0;
        localStorage.setItem('notificationsCountAtClear', currentCount.toString());
      })
      .catch(error => {
        console.error('Ошибка при получении количества уведомлений для обнуления:', error);
        localStorage.setItem('notificationsCountAtClear', '0');
      });
    };

    window.addEventListener('updateNotificationsCount', handleUpdateNotificationsCount);
    window.addEventListener('clearNotificationsCount', handleClearNotificationsCount);
    
    return () => {
      window.removeEventListener('updateNotificationsCount', handleUpdateNotificationsCount);
      window.removeEventListener('clearNotificationsCount', handleClearNotificationsCount);
    };
  }, [user]);

  // Функция для получения иконки по названию категории
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
  // Функция для преобразования dbCategories в формат для Navigation (локально вычисленная)
  const navCategoriesComputed = useMemo(() => {
    // Функция для перевода категорий
    const translateCategory = (categoryName) => {
      const categoryMap = {
        'Игрушки': t('categories.toys'),
        'Конструкторы': t('categories.constructors'),
        'Пазлы': t('categories.puzzles'),
        'Творчество': t('categories.creativity'),
        'Канцтовары': t('categories.stationery'),
        'Транспорт': t('categories.transport'),
        'Отдых на воде': t('categories.water_recreation'),
        'Настольные игры': t('categories.board_games'),
        'Развивающие игры': t('categories.educational_games'),
        'Акции': t('categories.sales')
      };
      return categoryMap[categoryName] || categoryName;
    };

    // Функция для перевода подкатегорий
    const translateSubcategory = (categoryName, subcategoryName) => {
      const subcategoryMap = {
        'Игрушки': {
          'Игрушки для самых маленьких': t('categories.subcategories.toys.for_babies'),
          'Куклы': t('categories.subcategories.toys.dolls'),
          'Оружие игрушечное': t('categories.subcategories.toys.toy_weapons'),
          'Треки, паркинги и жд': t('categories.subcategories.toys.tracks_parking_railway'),
          'Мягкие игрушки': t('categories.subcategories.toys.soft_toys'),
          'Игрушки - антистресс и сквиши': t('categories.subcategories.toys.antistress_squishy'),
          'Активные игры': t('categories.subcategories.toys.active_games'),
          'Тематические игровые наборы': t('categories.subcategories.toys.thematic_sets'),
          'Декоративная косметика и украшения': t('categories.subcategories.toys.decorative_cosmetics'),
          'Машинки и другой транспорт': t('categories.subcategories.toys.cars_transport'),
          'Роботы и трансформеры': t('categories.subcategories.toys.robots_transformers'),
          'Игровые фигурки': t('categories.subcategories.toys.game_figures'),
          'Игрушки для песочницы': t('categories.subcategories.toys.sandbox_toys'),
          'Шарики': t('categories.subcategories.toys.balls'),
          'Игрушки на радиоуправлении': t('categories.subcategories.toys.radio_controlled')
        },
        'Конструкторы': {
          'Lego для мальчиков': t('categories.subcategories.constructors.lego_boys'),
          'Lego для девочек': t('categories.subcategories.constructors.lego_girls'),
          'Металлические конструкторы': t('categories.subcategories.constructors.metal_constructors'),
          'Lego крупные блоки': t('categories.subcategories.constructors.lego_large_blocks')
        },
        'Пазлы': {
          'Пазлы для взрослых': t('categories.subcategories.puzzles.for_adults'),
          'Пазлы для детей': t('categories.subcategories.puzzles.for_children'),
          'Магнитные пазлы': t('categories.subcategories.puzzles.magnetic'),
          'Пазлы напольные': t('categories.subcategories.puzzles.floor'),
          'Пазлы для малышей': t('categories.subcategories.puzzles.for_babies')
        },
        'Творчество': {
          'Наборы для лепки': t('categories.subcategories.creativity.modeling_sets'),
          'Наклейки': t('categories.subcategories.creativity.stickers'),
          'Лизуны и слаймы': t('categories.subcategories.creativity.slimes'),
          'Кинетический песок': t('categories.subcategories.creativity.kinetic_sand'),
          'Рисование': t('categories.subcategories.creativity.drawing'),
          'Наборы для творчества': t('categories.subcategories.creativity.creativity_sets'),
          'Раскраски': t('categories.subcategories.creativity.coloring')
        },
        'Канцтовары': {
          'Портфели для школы': t('categories.subcategories.stationery.school_bags'),
          'Портфели для детских садов': t('categories.subcategories.stationery.kindergarten_bags'),
          'Пеналы': t('categories.subcategories.stationery.pencil_cases'),
          'Ручки и карандаши': t('categories.subcategories.stationery.pens_pencils'),
          'Точилки': t('categories.subcategories.stationery.sharpeners'),
          'Фломастеры и маркеры': t('categories.subcategories.stationery.markers'),
          'Краски': t('categories.subcategories.stationery.paints'),
          'Кисточки и принадлежности': t('categories.subcategories.stationery.brushes_accessories'),
          'Брелки': t('categories.subcategories.stationery.keychains')
        },
        'Транспорт': {
          'Детские самокаты': t('categories.subcategories.transport.scooters'),
          'Велосипеды': t('categories.subcategories.transport.bicycles'),
          'Ходунки': t('categories.subcategories.transport.walkers'),
          'Беговелы': t('categories.subcategories.transport.balance_bikes')
        },
        'Отдых на воде': {
          'Бассейны': t('categories.subcategories.water_recreation.pools'),
          'Матрасы и плотики': t('categories.subcategories.water_recreation.mattresses_floats'),
          'Круги надувные': t('categories.subcategories.water_recreation.inflatable_circles'),
          'Нарукавники и жилеты': t('categories.subcategories.water_recreation.armbands_vests'),
          'Аксессуары для плавания': t('categories.subcategories.water_recreation.swimming_accessories'),
          'Ракетки': t('categories.subcategories.water_recreation.rackets'),
          'Пляжные мячи и игрушки для плавания': t('categories.subcategories.water_recreation.beach_balls'),
          'Насосы для матрасов': t('categories.subcategories.water_recreation.pumps')
        },
        'Настольные игры': {
          'Настольные игры': t('categories.subcategories.board_games.board_games')
        },
        'Развивающие игры': {
          'Развивающие игры': t('categories.subcategories.educational_games.educational_games')
        },
        'Акции': {
          'Скидки недели': t('categories.subcategories.sales.weekly_discounts'),
          'Товары по акции': t('categories.subcategories.sales.sale_items')
        }
      };
      
      const categorySubs = subcategoryMap[categoryName];
      if (categorySubs && categorySubs[subcategoryName]) {
        return categorySubs[subcategoryName];
      }
      return subcategoryName;
    };

    // Убеждаемся, что dbCategories - это массив
    if (!dbCategories || !Array.isArray(dbCategories)) {
      return [
        {
          id: 1,
          name: translateCategory('Игрушки'),
          label: translateCategory('Игрушки'),
          icon: '/toys.png',
          active: true,
          sub: [
            translateSubcategory('Игрушки', 'Игрушки для самых маленьких'),
            translateSubcategory('Игрушки', 'Куклы'),
            translateSubcategory('Игрушки', 'Оружие игрушечное'),
            translateSubcategory('Игрушки', 'Треки, паркинги и жд'),
            translateSubcategory('Игрушки', 'Мягкие игрушки'),
            translateSubcategory('Игрушки', 'Игрушки - антистресс и сквиши'),
            translateSubcategory('Игрушки', 'Активные игры'),
            translateSubcategory('Игрушки', 'Тематические игровые наборы'),
            translateSubcategory('Игрушки', 'Декоративная косметика и украшения'),
            translateSubcategory('Игрушки', 'Машинки и другой транспорт'),
            translateSubcategory('Игрушки', 'Роботы и трансформеры'),
            translateSubcategory('Игрушки', 'Игровые фигурки'),
            translateSubcategory('Игрушки', 'Игрушки для песочницы'),
            translateSubcategory('Игрушки', 'Шарики'),
            translateSubcategory('Игрушки', 'Игрушки на радиоуправлении')
          ]
        },
        {
          id: 2,
          name: translateCategory('Конструкторы'),
          label: translateCategory('Конструкторы'),
          icon: '/constructor.png',
          active: true,
          sub: [
            translateSubcategory('Конструкторы', 'Lego для мальчиков'),
            translateSubcategory('Конструкторы', 'Lego для девочек'),
            translateSubcategory('Конструкторы', 'Металлические конструкторы'),
            translateSubcategory('Конструкторы', 'Lego крупные блоки')
          ]
        },
        {
          id: 3,
          name: translateCategory('Пазлы'),
          label: translateCategory('Пазлы'),
          icon: '/puzzle.png',
          active: true,
          sub: [
            translateSubcategory('Пазлы', 'Пазлы для взрослых'),
            translateSubcategory('Пазлы', 'Пазлы для детей'),
            translateSubcategory('Пазлы', 'Магнитные пазлы'),
            translateSubcategory('Пазлы', 'Пазлы напольные'),
            translateSubcategory('Пазлы', 'Пазлы для малышей')
          ]
        },
        {
          id: 4,
          name: translateCategory('Творчество'),
          label: translateCategory('Творчество'),
          icon: '/creativity.png',
          active: true,
          sub: [
            translateSubcategory('Творчество', 'Наборы для лепки'),
            translateSubcategory('Творчество', 'Наклейки'),
            translateSubcategory('Творчество', 'Лизуны и слаймы'),
            translateSubcategory('Творчество', 'Кинетический песок'),
            translateSubcategory('Творчество', 'Рисование'),
            translateSubcategory('Творчество', 'Наборы для творчества'),
            translateSubcategory('Творчество', 'Раскраски')
          ]
        },
        {
          id: 5,
          name: translateCategory('Канцтовары'),
          label: translateCategory('Канцтовары'),
          icon: '/stationery.png',
          active: true,
          sub: [
            translateSubcategory('Канцтовары', 'Портфели для школы'),
            translateSubcategory('Канцтовары', 'Портфели для детских садов'),
            translateSubcategory('Канцтовары', 'Пеналы'),
            translateSubcategory('Канцтовары', 'Ручки и карандаши'),
            translateSubcategory('Канцтовары', 'Точилки'),
            translateSubcategory('Канцтовары', 'Фломастеры и маркеры'),
            translateSubcategory('Канцтовары', 'Краски'),
            translateSubcategory('Канцтовары', 'Кисточки и принадлежности'),
            translateSubcategory('Канцтовары', 'Брелки')
          ]
        },
        {
          id: 6,
          name: translateCategory('Транспорт'),
          label: translateCategory('Транспорт'),
          icon: '/bicycle.png',
          active: true,
          sub: [
            translateSubcategory('Транспорт', 'Детские самокаты'),
            translateSubcategory('Транспорт', 'Велосипеды'),
            translateSubcategory('Транспорт', 'Ходунки'),
            translateSubcategory('Транспорт', 'Беговелы')
          ]
        },
        {
          id: 7,
          name: translateCategory('Отдых на воде'),
          label: translateCategory('Отдых на воде'),
          icon: '/voda.png',
          active: true,
          sub: [
            translateSubcategory('Отдых на воде', 'Бассейны'),
            translateSubcategory('Отдых на воде', 'Матрасы и плотики'),
            translateSubcategory('Отдых на воде', 'Круги надувные'),
            translateSubcategory('Отдых на воде', 'Нарукавники и жилеты'),
            translateSubcategory('Отдых на воде', 'Аксессуары для плавания'),
            translateSubcategory('Отдых на воде', 'Ракетки'),
            translateSubcategory('Отдых на воде', 'Пляжные мячи и игрушки для плавания'),
            translateSubcategory('Отдых на воде', 'Насосы для матрасов')
          ]
        },
        {
          id: 8,
          name: translateCategory('Настольные игры'),
          label: translateCategory('Настольные игры'),
          icon: '/nastolka.png',
          active: true,
          sub: [
            translateSubcategory('Настольные игры', 'Настольные игры')
          ]
        },
        {
          id: 9,
          name: translateCategory('Развивающие игры'),
          label: translateCategory('Развивающие игры'),
          icon: '/edu_game.png',
          active: true,
          sub: [
            translateSubcategory('Развивающие игры', 'Развивающие игры')
          ]
        },
        {
          id: 10,
          name: translateCategory('Акции'),
          label: translateCategory('Акции'),
          icon: '/sale.png',
          active: true,
          sub: [
            translateSubcategory('Акции', 'Скидки недели'),
            translateSubcategory('Акции', 'Товары по акции')
          ]
        }
      ];
    }
    
    const categories = dbCategories?.value || dbCategories;
    
    if (!categories || categories.length === 0) {
      // Fallback на статические категории, если dbCategories пустые
      return [
        {
          id: 1,
          name: translateCategory('Игрушки'),
          label: translateCategory('Игрушки'),
          icon: '/toys.png',
          active: true,
          sub: [
            translateSubcategory('Игрушки', 'Игрушки для самых маленьких'),
            translateSubcategory('Игрушки', 'Куклы'),
            translateSubcategory('Игрушки', 'Оружие игрушечное'),
            translateSubcategory('Игрушки', 'Треки, паркинги и жд'),
            translateSubcategory('Игрушки', 'Мягкие игрушки'),
            translateSubcategory('Игрушки', 'Игрушки - антистресс и сквиши'),
            translateSubcategory('Игрушки', 'Активные игры'),
            translateSubcategory('Игрушки', 'Тематические игровые наборы'),
            translateSubcategory('Игрушки', 'Декоративная косметика и украшения'),
            translateSubcategory('Игрушки', 'Машинки и другой транспорт'),
            translateSubcategory('Игрушки', 'Роботы и трансформеры'),
            translateSubcategory('Игрушки', 'Игровые фигурки'),
            translateSubcategory('Игрушки', 'Игрушки для песочницы'),
            translateSubcategory('Игрушки', 'Шарики'),
            translateSubcategory('Игрушки', 'Игрушки на радиоуправлении')
          ]
        },
        {
          id: 2,
          name: translateCategory('Конструкторы'),
          label: translateCategory('Конструкторы'),
          icon: '/constructor.png',
          active: true,
          sub: [
            translateSubcategory('Конструкторы', 'Lego для мальчиков'),
            translateSubcategory('Конструкторы', 'Lego для девочек'),
            translateSubcategory('Конструкторы', 'Металлические конструкторы'),
            translateSubcategory('Конструкторы', 'Lego крупные блоки')
          ]
        },
        {
          id: 3,
          name: translateCategory('Пазлы'),
          label: translateCategory('Пазлы'),
          icon: '/puzzle.png',
          active: true,
          sub: [
            translateSubcategory('Пазлы', 'Пазлы для взрослых'),
            translateSubcategory('Пазлы', 'Пазлы для детей'),
            translateSubcategory('Пазлы', 'Магнитные пазлы'),
            translateSubcategory('Пазлы', 'Пазлы напольные'),
            translateSubcategory('Пазлы', 'Пазлы для малышей')
          ]
        },
        {
          id: 4,
          name: translateCategory('Творчество'),
          label: translateCategory('Творчество'),
          icon: '/creativity.png',
          active: true,
          sub: [
            translateSubcategory('Творчество', 'Наборы для лепки'),
            translateSubcategory('Творчество', 'Наклейки'),
            translateSubcategory('Творчество', 'Лизуны и слаймы'),
            translateSubcategory('Творчество', 'Кинетический песок'),
            translateSubcategory('Творчество', 'Рисование'),
            translateSubcategory('Творчество', 'Наборы для творчества'),
            translateSubcategory('Творчество', 'Раскраски')
          ]
        },
        {
          id: 5,
          name: translateCategory('Канцтовары'),
          label: translateCategory('Канцтовары'),
          icon: '/stationery.png',
          active: true,
          sub: [
            translateSubcategory('Канцтовары', 'Портфели для школы'),
            translateSubcategory('Канцтовары', 'Портфели для детских садов'),
            translateSubcategory('Канцтовары', 'Пеналы'),
            translateSubcategory('Канцтовары', 'Ручки и карандаши'),
            translateSubcategory('Канцтовары', 'Точилки'),
            translateSubcategory('Канцтовары', 'Фломастеры и маркеры'),
            translateSubcategory('Канцтовары', 'Краски'),
            translateSubcategory('Канцтовары', 'Кисточки и принадлежности'),
            translateSubcategory('Канцтовары', 'Брелки')
          ]
        },
        {
          id: 6,
          name: translateCategory('Транспорт'),
          label: translateCategory('Транспорт'),
          icon: '/bicycle.png',
          active: true,
          sub: [
            translateSubcategory('Транспорт', 'Детские самокаты'),
            translateSubcategory('Транспорт', 'Велосипеды'),
            translateSubcategory('Транспорт', 'Ходунки'),
            translateSubcategory('Транспорт', 'Беговелы')
          ]
        },
        {
          id: 7,
          name: translateCategory('Отдых на воде'),
          label: translateCategory('Отдых на воде'),
          icon: '/voda.png',
          active: true,
          sub: [
            translateSubcategory('Отдых на воде', 'Бассейны'),
            translateSubcategory('Отдых на воде', 'Матрасы и плотики'),
            translateSubcategory('Отдых на воде', 'Круги надувные'),
            translateSubcategory('Отдых на воде', 'Нарукавники и жилеты'),
            translateSubcategory('Отдых на воде', 'Аксессуары для плавания'),
            translateSubcategory('Отдых на воде', 'Ракетки'),
            translateSubcategory('Отдых на воде', 'Пляжные мячи и игрушки для плавания'),
            translateSubcategory('Отдых на воде', 'Насосы для матрасов')
          ]
        },
        {
          id: 8,
          name: translateCategory('Настольные игры'),
          label: translateCategory('Настольные игры'),
          icon: '/nastolka.png',
          active: true,
          sub: [
            translateSubcategory('Настольные игры', 'Настольные игры')
          ]
        },
        {
          id: 9,
          name: translateCategory('Развивающие игры'),
          label: translateCategory('Развивающие игры'),
          icon: '/edu_game.png',
          active: true,
          sub: [
            translateSubcategory('Развивающие игры', 'Развивающие игры')
          ]
        },
        {
          id: 10,
          name: translateCategory('Акции'),
          label: translateCategory('Акции'),
          icon: '/sale.png',
          active: true,
          sub: [
            translateSubcategory('Акции', 'Скидки недели'),
            translateSubcategory('Акции', 'Товары по акции')
          ]
        }
      ];
    }

    // Если уже дерево (есть sub), рекурсивно обрабатываем и добавляем переводы
    if (categories[0] && categories[0].sub) {
      const processTree = (cats) => {
        if (!Array.isArray(cats)) return [];
        return cats.map(cat => {
          // Упрощенная логика для определения пути к иконке
          let iconPath;
          
          if (cat.image) {
            // Если изображение содержит временную метку (175...), это загруженный файл
            if (cat.image.match(/^175\d+/)) {
              iconPath = `${API_BASE_URL}/uploads/${cat.image}`;
            } else {
              // Если это старый файл из public папки или fallback иконка
              iconPath = `/${cat.image}`;
            }
          } else {
            // Если нет изображения, используем fallback
            iconPath = getCategoryIcon(cat.name) || '/toys.png';
          }
          
          return {
            ...cat,
            label: translateCategory(cat.name),
            icon: iconPath,
            sub: Array.isArray(cat.sub)
              ? cat.sub.map(subcat => {
                  if (typeof subcat === 'string') {
                    return { id: null, name: subcat, label: translateSubcategory(cat.name, subcat) };
                  }
                  const subName = subcat.name || subcat.label || 'Подкатегория';
                  return { ...subcat, label: translateSubcategory(cat.name, subName) };
                })
              : []
          };
        });
      };
      return processTree(categories);
    }

    // Плоский массив — строим дерево
    const rootCategories = categories.filter(cat => !cat.parentId && cat.active !== false);
    
    const result = rootCategories.map(cat => {
      const subcategories = categories.filter(subcat => subcat.parentId === cat.id && subcat.active !== false);
      
      // Упрощенная логика для определения пути к иконке
      let iconPath;
      
      if (cat.image) {
        // Если изображение содержит временную метку (175...), это загруженный файл
        if (cat.image.match(/^175\d+/)) {
          iconPath = `${API_BASE_URL}/uploads/${cat.image}`;
        } else {
          // Если это старый файл из public папки или fallback иконка
          iconPath = `/${cat.image}`;
        }
      } else {
        // Если нет изображения, используем fallback
        iconPath = getCategoryIcon(cat.name) || '/toys.png';
      }
      
      return {
        id: cat.id,
        name: cat.name,
        label: translateCategory(cat.name),
        icon: iconPath,
        image: cat.image, // сохраняем оригинальное поле image
        sub: Array.isArray(subcategories)
          ? subcategories.map(subcat => ({
              id: subcat.id,
              name: subcat.name,
              label: translateSubcategory(cat.name, subcat.name)
            }))
          : []
      };
    });
    
    return Array.isArray(result) ? result : [];
  }, [dbCategories, t, i18n.language]);

  // Получаем категории в нужном формате для Navigation
  const navCategories = navCategoriesComputed;
  
  // Дополнительная проверка безопасности
  const safeCategories = Array.isArray(navCategories) ? navCategories : [];

  // Определяем, нужно ли скрыть кнопку меню категорий для определенных страниц (только для десктопа)
  const shouldHideCategories = (location.pathname === '/privacy' || location.pathname === '/terms' || location.pathname === '/attribution') && isDesktop;
  
  const navItems = [
    { text: t('navigation.home'), path: '/', icon: <Home /> },
    { text: t('navigation.catalog'), path: '/catalog', icon: <FormatListBulleted /> },
    { text: t('navigation.reviews'), path: '/reviews', icon: <RateReview /> },
    { text: t('navigation.contacts'), path: '/contacts', icon: <ContactMail /> },
    { text: t('navigation.about'), path: '/about', icon: <Info /> },
  ];


  
  // Lenis для Drawer
  
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      console.log('Navigation: Speech recognition not supported');
      return;
    }
    
    // Очищаем предыдущий объект распознавания
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Navigation: Error stopping previous recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        if (finalTranscript) {
          setSearchValue(finalTranscript);
          setInterimTranscript("");
          setIsListening(false);
          setTimeout(() => {
            document.getElementById('appbar-search-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }, 100);
        } else {
          setInterimTranscript(interim);
        }
      };
      recognitionRef.current.onerror = (event) => { 
        console.error('Navigation: Speech recognition error:', event.error);
        setIsListening(false); 
        setInterimTranscript(""); 
      };
      recognitionRef.current.onend = () => { 
        console.log('Navigation: Speech recognition ended');
        setIsListening(false); 
        setInterimTranscript(""); 
      };
      
      console.log('Navigation: Speech recognition initialized with language:', getSpeechRecognitionLanguage(i18n.language));
    } catch (error) {
      console.error('Navigation: Error initializing speech recognition:', error);
    }
  }, [i18n.language]);

  const handleMicClick = () => {
    console.log('Navigation: handleMicClick called, isListening:', isListening);
    
    if (recognitionRef.current) {
      try {
        // Убеждаемся, что язык установлен правильно перед запуском
        recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
        console.log('Navigation: Setting speech recognition language to:', recognitionRef.current.lang);
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Navigation: Error in handleMicClick:', error);
        setIsListening(false);
      }
    } else {
      console.log('Navigation: No recognition object available');
      alert(getSpeechRecognitionErrorMessage(i18n.language));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchValue.trim())}`);
      // setSearchValue(""); // Больше не очищаем поле после поиска
    } else {
      navigate('/catalog');
    }
  };

  useEffect(() => {
    if (drawerOpen) {
      setTimeout(() => {
        // Найти Drawer-пейпер
        const paper = document.querySelector('.MuiDrawer-paper');
        let scrollable = paper;
        if (paper) {
          // Найти первый вложенный элемент с overflowY: auto
          const descendants = paper.querySelectorAll('*');
          for (let el of descendants) {
            const style = window.getComputedStyle(el);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
              scrollable = el;
              break;
            }
          }
          // Логируем для отладки
          if (scrollable !== paper) {
            console.log('Lenis wrapper for Drawer:', scrollable);
          } else {
            console.log('Lenis wrapper for Drawer: Drawer paper');
          }
          drawerPaperRef.current = scrollable;
          lenisDrawerRef.current = new Lenis({
            wrapper: scrollable,
            duration: 1.2,
            smooth: true,
            gestureOrientation: 'vertical',
            syncTouch: true,
          });
          function raf(time) {
            lenisDrawerRef.current?.raf(time);
            if (drawerOpen) requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);
        }
      }, 0);
      return () => {
        lenisDrawerRef.current?.destroy();
        lenisDrawerRef.current = null;
        drawerPaperRef.current = null;
      };
    } else {
      lenisDrawerRef.current?.destroy();
      lenisDrawerRef.current = null;
      drawerPaperRef.current = null;
    }
  }, [drawerOpen]);

  // Получаем только корневые категории (используем уже преобразованные и переведенные)
  const rootCategories = (safeCategories || []).filter(cat => !cat.parentId && cat.active !== false || cat.parentId === undefined);
  // Для поиска подкатегорий из преобразованной структуры
  const getSubcategories = (cat) => Array.isArray(cat?.sub) ? cat.sub : [];

  // Получаем дерево категорий с подкатегориями-объектами
  const treeCategories = transformCategoriesForNavigation(dbCategories || []);

  const handleCategoryBtnClick = () => {
    if (!menuOpen) setFiltersMenuOpen(false);
    if (!isHome) setMenuOpen(o => !o); // На главной странице не даём закрывать/открывать меню вручную
  };

  React.useEffect(() => {
    if (menuOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollYRef.current}px`;
      // Компенсация исчезновения скроллбара
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = scrollbarWidth ? `${scrollbarWidth}px` : '';
      
      function handleClickOutside(event) {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target) &&
          categoryBtnRef.current &&
          !categoryBtnRef.current.contains(event.target)
          && !(document.querySelector('.category-dropdown-submenu') && document.querySelector('.category-dropdown-submenu').contains(event.target))
        ) {
          if (!isHome) setMenuOpen(false); // Не закрывать меню на главной странице
        }
      }
      
      // Добавляем обработчик для предотвращения прокрутки фона
      const preventScroll = (e) => {
        if (menuRef.current?.contains(e.target)) {
          return; // Разрешаем прокрутку внутри меню
        }
        
        e.preventDefault();
        e.stopPropagation();
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.paddingRight = '';
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    } else {
      // Восстанавливаем прокрутку
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollYRef.current || 0);
    }
    
    return () => {
      // Очистка при размонтировании
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isHome && mainMenuRef.current) {
      if (lenisMainMenuRef.current) {
        lenisMainMenuRef.current.destroy();
        lenisMainMenuRef.current = null;
      }
      lenisMainMenuRef.current = new Lenis({
        wrapper: mainMenuRef.current,
        duration: 1.2,
        smooth: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        syncTouch: true,
      });
      function raf(time) {
        lenisMainMenuRef.current?.raf(time);
        if (isHome) requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      return () => {
        lenisMainMenuRef.current?.destroy();
        lenisMainMenuRef.current = null;
      };
    }
  }, [isHome]);

  useEffect(() => {
    if (isHome && hoveredCategory && subcategoriesMenuRef.current) {
      if (lenisSubcategoriesMenuRef.current) {
        lenisSubcategoriesMenuRef.current.destroy();
        lenisSubcategoriesMenuRef.current = null;
      }
      lenisSubcategoriesMenuRef.current = new Lenis({
        wrapper: subcategoriesMenuRef.current,
        duration: 1.2,
        smooth: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        syncTouch: true,
      });
      function raf(time) {
        lenisSubcategoriesMenuRef.current?.raf(time);
        if (isHome && hoveredCategory) requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      return () => {
        lenisSubcategoriesMenuRef.current?.destroy();
        lenisSubcategoriesMenuRef.current = null;
      };
    } else {
      if (lenisSubcategoriesMenuRef.current) {
        lenisSubcategoriesMenuRef.current.destroy();
        lenisSubcategoriesMenuRef.current = null;
      }
    }
  }, [isHome, hoveredCategory]);

  React.useEffect(() => {
    if (instantClose) setActiveSub(null);
  }, [instantClose]);

  // Мгновенно закрываем меню при переходе на страницу профиля
  React.useEffect(() => {
    if (location.pathname === '/profile' && (menuOpen || isHome)) {
      setInstantClose(true);
      // Также закрываем фиксированное меню категорий на главной странице
      if (isHome) {
        setMenuOpen(false);
      }
      // Закрываем меню фильтров
      setFiltersMenuOpen(false);
    } else {
      setInstantClose(false);
    }
  }, [location.pathname, menuOpen, isHome]);

  // Закрываем меню фильтров при переходе на страницы без кнопок фильтров
  React.useEffect(() => {
    if (location.pathname === '/about' || 
        location.pathname === '/contacts' || 
        location.pathname === '/reviews' || 
        location.pathname === '/cart') {
      setFiltersMenuOpen(false);
    }
  }, [location.pathname]);

  // 1. В начало компонента Navigation добавь:
  const filtersPanelRef = useRef(null);
  const lenisFiltersRef = useRef(null);
  // 2. Добавь useEffect для инициализации Lenis на фильтрах:
  useEffect(() => {
    if (filtersMenuOpen && filtersPanelRef.current) {
      if (lenisFiltersRef.current) {
        lenisFiltersRef.current.destroy();
        lenisFiltersRef.current = null;
      }
      lenisFiltersRef.current = new Lenis({
        wrapper: filtersPanelRef.current,
        duration: 1.2,
        smooth: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        syncTouch: true,
      });
      function raf(time) {
        lenisFiltersRef.current?.raf(time);
        if (filtersMenuOpen) requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      return () => {
        if (lenisFiltersRef.current) {
          lenisFiltersRef.current.destroy();
          lenisFiltersRef.current = null;
        }
      };
    } else {
      if (lenisFiltersRef.current) {
        lenisFiltersRef.current.destroy();
        lenisFiltersRef.current = null;
      }
    }
  }, [filtersMenuOpen]);

 

  // 2. Получить список брендов из products (если products есть в Navigation, иначе пробросить как проп):
  const brandOptions = Array.from(new Set((products || []).map(p => p.brand).filter(Boolean)));

  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map(p => Number(p.price)).filter(Boolean);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceLimits([min, max]);
      setPriceRange([min, max]);
    } else {
      setPriceLimits([0, 10000]);
      setPriceRange([0, 10000]);
    }
  }, [products]);

  // Определяем валюту по товарам (если есть поле currency, иначе ILS)
  const currency = products && products.length > 0
    ? (products.find(p => p.currency)?.currency || 'ILS')
    : 'ILS';

  const scrollYRef = React.useRef(0);

  // ЛОГ cart перед Navigation
  // console.log('cart перед Navigation:', cart);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <AppBar 
          ref={appBarRef}
          position="fixed" 
          sx={{ 
            width: '100%',
            left: 0,
            zIndex: 1401,
            background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url("/appbar.png") center center / cover no-repeat',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundPosition: '0 -64px',
            backgroundSize: 'cover',
          }}
        >
          <Toolbar sx={{ 
            width: '100%', 
            minHeight: { xs: '64px', lg: '96px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            gap: { xs: 0.25, sm: 0.5, md: 1 },
            px: { xs: 0.5, sm: 1, md: 2 },
            position: 'relative'
          }}>
            {/* Левая секция: Логотип и кнопка меню */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 0.5, sm: 1, md: 2 } }}>
                <img src="/lion-logo.png..png" alt="Логотип магазина" style={{ width: isDesktop ? 96 : (isNarrow ? 68 : 56), height: isDesktop ? 96 : (isNarrow ? 68 : 56) }} />
              </Box>
              {/* Кнопка меню при узком вьюпорте (и на мобильных) - справа от логотипа */}
              {(isNarrow || isMobile) && (
                <IconButton
                  color="inherit"
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ 
                    color: 'white',
                    mr: { xs: 0.25, sm: 0.5, md: 1, lg: 2 },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

            {/* Центральная секция: Кнопка категорий для мобильных и средних экранов */}
            {(isMobile || isNarrow) && (
              <Box sx={{ 
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2
              }}>
                <IconButton
                  color="inherit"
                  onClick={() => setMobileCategoriesOpen(true)}
                  data-mobile-categories-button
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  <CategoryIcon sx={{ mr: { xs: 0.25, sm: 0.5, md: 1 } }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {t('catalog.categoriesButton')}
                  </Typography>
                </IconButton>
              </Box>
            )}
            
            {/* Кнопки навигации: все пункты */}
            {isDesktop && (
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                flexWrap: 'nowrap',
                overflow: 'hidden',
                minWidth: 0,
                flexShrink: 0
              }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    sx={{
                      backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                      borderRadius: 25,
                      whiteSpace: 'nowrap',
                      fontSize: '0.97rem',
                      padding: '8px 18px',
                      minWidth: 'fit-content',
                      flexShrink: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        transform: 'none',
                      },
                      '&:active': {
                        transform: 'none',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
            
            
            {/* Корзина и профиль - Desktop */}
            <Box sx={{ marginLeft: 'auto', display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 3, flexShrink: 0 }}>
              {/* Кнопка CMS для админа */}
              {user?.role === 'admin' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', mt: 2.5 }}>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      navigate('/cms');
                      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }}
                    sx={{ 
                      minWidth: 0, 
                      p: 0, 
                      overflow: 'hidden',
                    }}
                    title="CMS"
                  >
                    <AdminPanelSettings sx={{ fontSize: 32, color: '#FFD700' }} />
                  </IconButton>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#FFD700', mt: 0.5, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    CMS
                  </Typography>
                </Box>
              )}
              {/* Уведомления */}
              {user && user.role !== 'admin' && (
                <Box sx={{ display: 'flex', alignItems: 'center', height: 56, mr: 1, position: 'relative' }}>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/profile"
                    onClick={(e) => {
                      e.preventDefault();
                      
                      // Мгновенно закрываем меню при переходе на профиль
                      setInstantClose(true);
                      // Также закрываем фиксированное меню категорий на главной странице
                      if (isHome) {
                        setMenuOpen(false);
                      }
                      // Закрываем меню фильтров
                      setFiltersMenuOpen(false);
                      
                      // Всегда используем localStorage для передачи информации о вкладке
                      localStorage.setItem('activeProfileTab', 'notifications');
                      
                      // Устанавливаем флаг для перехода на вкладку уведомлений
                      localStorage.setItem('openNotificationsTab', 'true');
                      
                      // Если уже на странице профиля, принудительно обновляем состояние
                      if (location.pathname === '/profile') {
                        // Устанавливаем флаг для предотвращения повторной обработки
                        localStorage.setItem('skipReload', 'true');
                        // Принудительно обновляем страницу для применения изменений
                        setTimeout(() => {
                          window.location.reload();
                        }, 100);
                      } else {
                        // Если не на странице профиля, переходим на профиль
                        navigate('/profile');
                      }
                    }}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      overflow: 'visible',
                      backgroundColor: 'transparent',
                      border: '2px solid #fff',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: '#ffe066',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 24, color: 'white' }} />
                  </Button>
                  {/* Badge поверх кнопки */}
                  {unreadNotificationsCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '-2px',
                        backgroundColor: '#ff0844',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 11,
                        minWidth: 18,
                        height: 18,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(255,8,68,0.3)',
                        zIndex: 1,
                      }}
                    >
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </Box>
                  )}
                </Box>
              )}
              {/* Профиль/Войти */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 100, justifyContent: 'center', pt: 3.1 }}>
                {user ? (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/profile"
                    onClick={() => {
                      // Мгновенно закрываем меню при переходе на профиль
                      setInstantClose(true);
                      // Также закрываем фиксированное меню категорий на главной странице
                      if (isHome) {
                        setMenuOpen(false);
                      }
                      // Закрываем меню фильтров
                      setFiltersMenuOpen(false);
                    }}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                      border: '2px solid #fff',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: '#ffe066',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8.5" r="4" stroke="white" strokeWidth="2" fill="none" />
                      <path d="M4 20c0-3.3137 3.134-6 7-6s7 2.6863 7 6" stroke="white" strokeWidth="2" fill="none" />
                    </svg>
                  </Button>
                ) : (
                  <Button
                    color="inherit"
                    onClick={() => setAuthOpen(true)}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                      border: '2px solid #fff',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: '#ffe066',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8.5" r="4" stroke="white" strokeWidth="2" fill="none" />
                      <path d="M4 20c0-3.3137 3.134-6 7-6s7 2.6863 7 6" stroke="white" strokeWidth="2" fill="none" />
                    </svg>
                  </Button>
                )}
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#fff', mt: 0.5, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user ? (user.name && user.name.trim().length > 0 ? user.name : user.email) : t('header.login')}
                </Typography>
              </Box>
              {/* Корзина */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 80, justifyContent: 'center', mt: 2.125 }}>
                <IconButton
                  color="inherit"
                  onClick={() => {
                    navigate('/cart');
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  ref={cartIconRef}
                >
                  <Badge
     badgeContent={(() => {
       const totalItems = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
       return totalItems > 0 ? totalItems : null;
     })()}
     sx={{
       '& .MuiBadge-badge': {
         backgroundColor: '#5cb95d',
         color: '#fff',
         fontWeight: 700,
         fontSize: 15,
         minWidth: 24,
         height: 24,
         borderRadius: '50%',
         boxShadow: '0 2px 6px rgba(92,185,93,0.18)',
       }
     }}
   >
     <img src="/pocket.png" alt="cart" style={{ width: 32, height: 32, display: 'block', filter: 'brightness(0) invert(1)', objectFit: 'contain', position: 'relative', top: '7px' }} />
   </Badge>
                </IconButton>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#fff', mt: 0.5, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t('navigation.cart')}
                </Typography>
              </Box>
              {/* Переключатель языка */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 80, justifyContent: 'center', mt: 2.125 }}>
                <Box sx={{ mt: '7px' }}>
                  <LanguageSwitcher />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#fff', mt: 0.5, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t('header.language')}
                </Typography>
              </Box>
            </Box>
            

            {/* Корзина и язык для мобильных - справа */}
            {(isNarrow || isMobile) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: 'auto' }}>
                {/* Кнопка профиля для мобильных */}
                <IconButton
                  color="inherit"
                  onClick={(event) => {
                    if (user) {
                      handleProfileMenuOpen(event);
                    } else {
                      setAuthOpen(true);
                    }
                  }}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <PersonIcon sx={{ fontSize: 24 }} />
                </IconButton>
                
                {/* Корзина для мобильных */}
                <IconButton
                  color="inherit"
                  onClick={() => {
                    navigate('/cart');
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  ref={cartIconRef}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <Badge
                    badgeContent={(() => {
                      const totalItems = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                      return totalItems > 0 ? totalItems : null;
                    })()}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#5cb95d',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        minWidth: 18,
                        height: 18,
                        borderRadius: '50%',
                        boxShadow: '0 2px 6px rgba(92,185,93,0.18)',
                      }
                    }}
                  >
                    <img src="/pocket.png" alt="cart" style={{ width: 24, height: 24, display: 'block', filter: 'brightness(0) invert(1)', objectFit: 'contain' }} />
                  </Badge>
                </IconButton>
                
                {/* Переключатель языка для мобильных */}
                <LanguageSwitcher mobile={true} />
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Контекстное меню профиля */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2,
              '& .MuiMenuItem-root': {
                py: 1.5,
                px: 2,
                fontSize: 14,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#FFF3E0',
                },
              },
            },
          }}
        >
          <MenuItem onClick={() => handleProfileMenuClick('myprofile')}>
            <PersonIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.myProfile')}
          </MenuItem>
          <MenuItem onClick={() => handleProfileMenuClick('notifications')}>
            <NotificationsIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.notifications')}
          </MenuItem>
          <MenuItem onClick={() => handleProfileMenuClick('orders')}>
            <ShoppingCartIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.orders')}
          </MenuItem>
          <MenuItem onClick={() => handleProfileMenuClick('wishlist')}>
            <FavoriteIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.wishlist')}
          </MenuItem>
          <MenuItem onClick={() => handleProfileMenuClick('viewed')}>
            <VisibilityIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.viewed')}
          </MenuItem>
          <MenuItem onClick={() => handleProfileMenuClick('profile')}>
            <PersonIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.personalData')}
          </MenuItem>
          <MenuItem onClick={() => handleProfileMenuClick('reviews')}>
            <QuestionAnswerIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.reviews')}
          </MenuItem>
          <MenuItem onClick={() => handleProfileMenuClick('auth')}>
            <SettingsIcon sx={{ mr: 2, color: '#FF9800' }} />
            {t('profile.menu.authSettings')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleProfileMenuClick('logout')}>
            <ExitToAppIcon sx={{ mr: 2, color: '#f44336' }} />
            {t('profile.menu.logout')}
          </MenuItem>
        </Menu>

        {/* Кнопка категорий под AppBar */}
        
        {location.pathname !== '/profile' && 
         location.pathname !== '/about' && 
         location.pathname !== '/contacts' && 
         location.pathname !== '/reviews' && 
         location.pathname !== '/cart' && 
         location.pathname !== '/checkout' && 
         location.pathname !== '/order-success' && 
         !shouldHideCategories && 
         user?.role !== 'admin' && isDesktop && (
          <>
          <Box sx={{ 
            position: 'fixed',
            top: '100px',
            left: 0,
            zIndex: 1402,
            width: 250,
          }}>
            <button
              ref={categoryBtnRef}
              onClick={handleCategoryBtnClick}
              style={{
                width: 250,
                height: 44,
                background: menuOpen ? '#fff' : '#FFB300',
                color: menuOpen ? '#FFB300' : '#fff',
                fontWeight: 'bold',
                fontSize: 20,
                border: 'none',
                borderRadius: 0,
                boxShadow: menuOpen ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, border-radius 0.2s',
                margin: 0,
                padding: 0,
              }}
            >
              <CategoryIcon sx={{ fontSize: 28, color: 'inherit', mr: 1 }} />
              {t('catalog.categoriesButton')}
            </button>
          </Box>
          {/* Выпадающее меню фильтров */}
          {filtersMenuOpen && (
            <Paper
              ref={filtersPanelRef}
              sx={{
                position: 'fixed',
                top: desktopSearchBarRef?.current ? 
                  desktopSearchBarRef.current.getBoundingClientRect().bottom + 5 : 184,
                left: desktopSearchBarRef?.current ? 
                  desktopSearchBarRef.current.getBoundingClientRect().right - 250 : 0,
                width: 250,
                zIndex: 2000,
                m: 0,
                p: 2,
                borderRadius: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                background: '#fff',
                maxHeight: 520,
                overflowY: 'auto',
              }}
              onWheel={e => { e.stopPropagation(); /* wheel-событие не блокируется, скролл работает */ }}
            >
              {/* Заголовок Фильтры */}
              <Box sx={{ 
                background: '#FFB300', 
                color: '#fff', 
                fontWeight: 'bold', 
                fontSize: 18, 
                textAlign: 'center', 
                py: 1,
                mb: 2,
                borderRadius: 1
              }}>
                {t('filters.title')}
              </Box>
              {/* Фильтры */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Цена */}
                <Box>
                  <span style={{ fontWeight: 500, marginRight: 4 }}>{t('common.price')}:</span>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue)}
                    valueLabelDisplay="auto"
                    min={priceLimits[0]}
                    max={priceLimits[1]}
                    sx={{ width: '90%', ml: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', mt: -1 }}>
                    <span>{new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(priceRange[0])}</span>
                    <span>{new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(priceRange[1])}</span>
                  </Box>
                </Box>
                {/* Возраст */}
                <Box>
                  <span style={{ fontWeight: 500, marginRight: 4 }}>{t('catalog.ageGroup')}:</span>
                  <Box sx={{ pl: 1 }}>
                    {ageGroups.map(age => (
                      <FormControlLabel
                        key={age}
                        control={
                          <Checkbox
                            checked={selectedAgeGroups.includes(age)}
                            onChange={e => {
                              if (e.target.checked) setSelectedAgeGroups([...selectedAgeGroups, age]);
                              else setSelectedAgeGroups(selectedAgeGroups.filter(a => a !== age));
                            }}
                          />
                        }
                        label={age}
                        sx={{ display: 'block', fontSize: 14 }}
                      />
                    ))}
                  </Box>
                </Box>
                {/* Пол */}
                <Box>
                  <span style={{ fontWeight: 500, marginRight: 4 }}>{t('catalog.gender')}:</span>
                  <Box sx={{ pl: 1 }}>
                    {genderOptions.map(opt => (
                      <FormControlLabel
                        key={opt.value}
                        control={
                          <Checkbox
                            checked={selectedGenders.includes(opt.value)}
                            onChange={e => {
                              if (e.target.checked) {
                                onGendersChange([...selectedGenders, opt.value]);
                              } else {
                                onGendersChange(selectedGenders.filter(g => g !== opt.value));
                              }
                            }}
                          />
                        }
                        label={opt.label}
                        sx={{ display: 'block', fontSize: 14 }}
                      />
                    ))}
                  </Box>
                </Box>
                {/* Бренды */}
                {brandOptions.length > 0 && (
                  <Box>
                    <span style={{ fontWeight: 500, marginRight: 4 }}>{t('catalog.brands')}:</span>
                    <Box sx={{ pl: 1 }}>
                      {brandOptions.map(brand => (
                        <FormControlLabel
                          key={brand}
                          control={
                            <Checkbox
                              checked={selectedBrands.includes(brand)}
                              onChange={e => {
                                if (e.target.checked) setSelectedBrands([...selectedBrands, brand]);
                                else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                              }}
                            />
                          }
                          label={brand}
                          sx={{ display: 'block', fontSize: 14 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
          </>
        )}
        {/* Меню категорий с position: fixed */}
        {isDesktop && !instantClose && !shouldHideCategories && (
          <Paper
            ref={menuRef}
            className="category-dropdown-menu"
            sx={{
              position: 'fixed',
              top: isHome ? 100 : 144,
              left: 0,
              width: 250,
              zIndex: 2000,
              m: 0,
              p: 0,
              borderRadius: 0,
              boxShadow: menuOpen ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              background: '#fff',
              // Унифицированная высота для всех случаев
              maxHeight: (menuOpen || isHome) ? '540px' : '0px',
              transition: 'none',
              overflow: 'auto',
            }}
          >
            {/* Надпись "Категории" на главной странице */}
            {isHome && (
              <Box sx={{ 
                background: '#FFB300', 
                color: '#fff', 
                fontWeight: 'bold', 
                fontSize: 20, 
                textAlign: 'center', 
                py: 1,
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                <CategoryIcon sx={{ fontSize: 24, color: 'inherit' }} />
                {t('catalog.categoriesButton')}
              </Box>
            )}
            <List sx={{ pt: '8px', background: '#fff', height: '100%' }} data-category-list>
              {rootCategories.map((cat, idx) => (
                <ListItem
                  key={cat.label || cat.id}
                  onMouseEnter={() => {
                    if (!isTouchDevice) {
                      setActiveSub(cat.id);
                      setTouchedCategory(null);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isTouchDevice) {
                      setActiveSub(null);
                    }
                  }}
                  onTouchStart={(e) => {
                    if (isTouchDevice) {
                      // Очищаем предыдущий таймаут
                      if (touchTimeout) {
                        clearTimeout(touchTimeout);
                      }
                      
                      // Проверяем, было ли касание по стрелочке
                      const isArrowTouch = e.target.textContent === '>' || 
                                         e.target.closest('span')?.textContent === '>';
                      
                      if (isArrowTouch) {
                        // Касание по стрелочке - показываем подкатегории
                        const timeout = setTimeout(() => {
                          setTouchedCategory(touchedCategory === cat.id ? null : cat.id);
                          setActiveSub(null);
                        }, 150);
                        setTouchTimeout(timeout);
                      } else {
                        // Касание по категории - не делаем ничего, ждем onClick
                        setTouchTimeout(null);
                      }
                    }
                  }}
                  onClick={(e) => {
                    // Проверяем, был ли клик по стрелочке
                    const isArrowClick = e.target.textContent === '>' || 
                                       e.target.closest('span')?.textContent === '>';
                    
                    if (isTouchDevice && getSubcategories(cat).length > 0 && isArrowClick) {
                      // На сенсорном устройстве клик по стрелочке - показываем подкатегории
                      e.stopPropagation();
                      setTouchedCategory(touchedCategory === cat.id ? null : cat.id);
                      setActiveSub(null);
                    } else {
                      // Клик по категории (не по стрелочке) - переходим к категории
                      setInstantClose(true);
                      navigate(`/category/${cat.id}`);
                      if (!isHome) setMenuOpen(false);
                      setTouchedCategory(null);
                      setActiveSub(null);
                      setTimeout(() => setInstantClose(false), 0);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    pr: 0,
                    paddingLeft: '20px',
                    mb: 0,
                    position: 'relative',
                    borderRadius: 2,
                    background: (activeSub === cat.id || touchedCategory === cat.id) ? '#FFF3E0' : '#fff',
                    '&:hover': { backgroundColor: '#FFF3E0' },
                    cursor: 'pointer',
                  }}
                >
                  <img src={cat.icon} alt="" style={{ width: 32, height: 32, marginRight: 20, borderRadius: 0, objectFit: 'cover' }} />
                  <MuiListItemText primary={cat.label || cat.name} sx={{ fontWeight: 600, color: '#2c3e50', fontSize: 16, lineHeight: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                  {getSubcategories(cat).length > 0 && (
                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#FFB300', height: '21px', lineHeight: '21px' }}>{'>'}</span>
                  )}
                </ListItem>
              ))}
            </List>
            {/* Универсальная панель подкатегорий */}
            {(activeSub || hoveredCategory || touchedCategory) && (() => {
              // Определяем категорию и подкатегории
              let cat, subcats;
              
              if (activeSub) {
                // Для основного меню (activeSub) - десктоп
                 cat = rootCategories.find(c => c.id === activeSub);
                 subcats = cat ? getSubcategories(cat) : [];
              } else if (hoveredCategory) {
                // Для мобильного меню (hoveredCategory)
                cat = safeCategories.find(c => c.label === hoveredCategory);
                subcats = cat && Array.isArray(cat.sub) ? cat.sub : [];
              } else if (touchedCategory) {
                // Для сенсорного устройства (touchedCategory)
                cat = rootCategories.find(c => c.id === touchedCategory);
                subcats = cat ? getSubcategories(cat) : [];
              }
              
              if (!cat || !subcats.length) return null;
              
              return (
                <Box
                  className="category-dropdown-submenu"
                  ref={el => {
                    if (el) {
                      if (window.lenisCategorySubmenu) {
                        window.lenisCategorySubmenu.destroy();
                        window.lenisCategorySubmenu = null;
                      }
                      window.lenisCategorySubmenu = new Lenis({
                        wrapper: el,
                        duration: 1.2,
                        smooth: true,
                        easing: (t) => 1 - Math.pow(1 - t, 3),
                        syncTouch: true,
                      });
                      function raf(time) {
                        window.lenisCategorySubmenu?.raf(time);
                        if (activeSub || hoveredCategory || touchedCategory) requestAnimationFrame(raf);
                      }
                      requestAnimationFrame(raf);
                    } else {
                      if (window.lenisCategorySubmenu) {
                        window.lenisCategorySubmenu.destroy();
                        window.lenisCategorySubmenu = null;
                      }
                    }
                  }}
                  sx={{
                    position: 'fixed',
                    top: 100,
                    left: 250,
                    width: 250,
                    height: 'calc(100vh - 100px - 67px + 4px)',
                    background: '#fff',
                    zIndex: 2100,
                    boxShadow: '0 8px 16px -8px rgba(0,0,0,0.08)',
                    borderLeft: 'none',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    pt: '44px',
                    overflowY: 'auto',
                  }}
                  onMouseEnter={() => {
                    if (!isTouchDevice) {
                      if (activeSub) setActiveSub(activeSub);
                      if (hoveredCategory) setHoveredCategory(hoveredCategory);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isTouchDevice) {
                      if (activeSub) setActiveSub(null);
                      if (hoveredCategory) setHoveredCategory(null);
                    }
                  }}
                  onWheel={e => e.stopPropagation()}
                >
                  {subcats.map((subcat, i) => (
                    <Box
                      key={subcat.id || i}
                       onClick={() => {
                        setInstantClose(true);
                        
                        if (activeSub) {
                          // Для основного меню (десктоп)
                           if (subcat && subcat.id) {
                             navigate(`/subcategory/${subcat.id}`);
                           } else {
                             // Fallback если нет id
                             navigate(`/category/${cat.id}`);
                           }
                          setActiveSub(null);
                          if (!isHome) setMenuOpen(false);
                        } else if (hoveredCategory) {
                          // Для мобильного меню
                          if (dbCategories && dbCategories.length > 0) {
                            const parentCat = dbCategories.find(c => c.name === cat.name && !c.parentId);
                            if (parentCat) {
                              const dbSubcat = dbCategories.find(c => c.name === subcat && c.parentId === parentCat.id);
                              if (dbSubcat) {
                                navigate(`/subcategory/${dbSubcat.id}`);
                                setDrawerOpen(false);
                                setHoveredCategory(null);
                                setTimeout(() => setInstantClose(false), 0);
                                return;
                              }
                            }
                          }
                          // Fallback - используем индекс как ID
                          navigate(`/subcategory/${i + 1}`);
                          setDrawerOpen(false);
                          setHoveredCategory(null);
                        } else if (touchedCategory) {
                          // Для сенсорного устройства
                          if (subcat && subcat.id) {
                            navigate(`/subcategory/${subcat.id}`);
                          } else {
                            // Fallback если нет id
                            navigate(`/category/${cat.id}`);
                          }
                          setTouchedCategory(null);
                          if (!isHome) setMenuOpen(false);
                        }
                        
                        setTimeout(() => setInstantClose(false), 0);
                      }}
                      sx={{
                        px: 3,
                        py: 2,
                        fontWeight: 500,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: '#2c3e50',
                        borderRadius: 2,
                        lineHeight: 0.95,
                        '&:hover': {
                          backgroundColor: '#FFF3E0',
                          color: '#FFB300',
                        },
                      }}
                    >
                      {subcat.label || subcat.name || subcat}
                    </Box>
                  ))}
                </Box>
              );
            })()}
          </Paper>
        )}


        {/* Мобильный Drawer с категориями */}
        {(isNarrow || isMobile) && location.pathname !== '/profile' && 
         location.pathname !== '/checkout' && 
         location.pathname !== '/order-success' && (
      <Drawer
        anchor="left"
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ className: 'catalog-sidebar-categories' }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            background: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)',
          },
        }}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<CategoryIcon sx={{ fontSize: 28, color: 'inherit', mr: 1 }} />}
            sx={{ mb: 2, borderRadius: 2, fontWeight: 'bold' }}
            disabled
          >
            {t('catalog.categoriesButton')}
          </Button>
          <List className="catalog-sidebar-categories">
            {navItems.map((item) => (
              <ListItem
                key={item.text}
                component={RouterLink}
                to={item.path}
                onClick={() => {
                  setMobileOpen(false);
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }}
                sx={{
                  backgroundColor: location.pathname === item.path ? '#FFF3E0' : 'transparent',
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: '#FFF3E0',
                  },
                }}
              >
                <Box sx={{ mr: 2, color: '#FF9800' }}>{item.icon}</Box>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 'bold',
                      color: location.pathname === item.path ? '#FF9800' : '#333'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
        )}
        
        {/* Мобильное меню */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '280px',
              background: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)',
              top: '60px',
              height: 'calc(100vh - 60px)',
              overflow: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              overflowX: 'hidden'
            },
          }}
        >
          <Box sx={{ p: 2, pt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                {t('navigation.menu')}
              </Typography>
              <IconButton onClick={() => setMobileMenuOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            

            
            {/* Навигационные пункты */}
            <List>
              {navItems.map((item) => (
                <ListItem
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  sx={{
                    backgroundColor: location.pathname === item.path ? '#FFF3E0' : 'transparent',
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#FFF3E0',
                    },
                  }}
                >
                  <Box sx={{ mr: 2, color: '#FF9800' }}>{item.icon}</Box>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: 'bold',
                        color: location.pathname === item.path ? '#FF9800' : '#333'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        
        {/* Мобильные фильтры */}
        <Drawer
          anchor="right"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '280px',
              background: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)',
              top: '60px',
              height: 'calc(100vh - 60px)',
              overflow: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              overflowX: 'hidden'
            },
          }}
        >
          <Box sx={{ p: 2, pt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {t('catalog.filters')}
              </Typography>
              <IconButton onClick={() => setMobileFiltersOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            {/* Фильтр по полу */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('catalog.gender')}
              </Typography>
              {genderOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={selectedGenders.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onGendersChange([...selectedGenders, option.value]);
                        } else {
                          onGendersChange(selectedGenders.filter(g => g !== option.value));
                        }
                      }}
                    />
                  }
                  label={option.label}
                  sx={{ display: 'block', mb: 0.5 }}
                />
              ))}
            </Box>
            
            {/* Фильтр по цене */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('common.price')}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={priceLimits[0]}
                max={priceLimits[1]}
                sx={{ width: '100%', mt: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', mt: 1 }}>
                <span>{new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(priceRange[0])}</span>
                <span>{new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(priceRange[1])}</span>
              </Box>
            </Box>
            
            {/* Фильтр по возрасту */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('catalog.ageGroup')}
              </Typography>
              {ageGroups.map((ageGroup) => (
                <FormControlLabel
                  key={ageGroup}
                  control={
                    <Checkbox
                      checked={selectedAgeGroups.includes(ageGroup)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAgeGroups([...selectedAgeGroups, ageGroup]);
                        } else {
                          setSelectedAgeGroups(selectedAgeGroups.filter(ag => ag !== ageGroup));
                        }
                      }}
                    />
                  }
                  label={ageGroup}
                  sx={{ display: 'block', mb: 0.5 }}
                />
              ))}
            </Box>
            
            {/* Фильтр по брендам */}
            {products && products.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {t('catalog.brands')}
                </Typography>
                {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).slice(0, 10).map((brand) => (
                  <FormControlLabel
                    key={brand}
                    control={
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }
                        }}
                      />
                    }
                    label={brand}
                    sx={{ display: 'block', mb: 0.5 }}
                  />
                ))}
              </Box>
            )}
            
            {/* Кнопки сброса и применения */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  onGendersChange([]);
                  setSelectedAgeGroups([]);
                  setSelectedBrands([]);
                  setPriceRange(priceLimits);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 15,
                  py: 1.5,
                  height: 44,
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ef5350 0%, #f44336 100%)',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                }}
              >
                {t('catalog.clearFilters')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setMobileFiltersOpen(false)}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 15,
                  py: 1.5,
                  height: 44,
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                }}
              >
                {t('catalog.applyFilters')}
              </Button>
            </Box>
          </Box>
        </Drawer>
        
        {/* Мобильное меню категорий */}
        <Drawer
          anchor="top"
          open={mobileCategoriesOpen}
          onClose={() => setMobileCategoriesOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              background: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)',
              top: 'var(--appbar-height)',
              height: 'calc(100vh - var(--appbar-height))',
              overflow: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFB300' }}>
                {t('catalog.categoriesButton')}
              </Typography>
              <IconButton 
                size="small"
                onClick={() => setMobileCategoriesOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            {/* Список категорий с раскрывающимися подкатегориями */}
            <List sx={{ py: 0 }}>
              {navCategories && navCategories.map((category) => {
                // Функции перевода для мобильного меню
                const translateCategory = (categoryName) => {
                  const categoryMap = {
                    'Игрушки': t('categories.toys'),
                    'Конструкторы': t('categories.constructors'),
                    'Пазлы': t('categories.puzzles'),
                    'Творчество': t('categories.creativity'),
                    'Канцтовары': t('categories.stationery'),
                    'Транспорт': t('categories.transport'),
                    'Отдых на воде': t('categories.water_recreation'),
                    'Настольные игры': t('categories.board_games'),
                    'Развивающие игры': t('categories.educational_games'),
                    'Акции': t('categories.sales')
                  };
                  return categoryMap[categoryName] || categoryName;
                };

                const translateSubcategory = (categoryName, subcategoryName) => {
                  const subcategoryMap = {
                    'Игрушки': {
                      'Игрушки для самых маленьких': t('categories.subcategories.toys.for_babies'),
                      'Куклы': t('categories.subcategories.toys.dolls'),
                      'Оружие игрушечное': t('categories.subcategories.toys.toy_weapons'),
                      'Треки, паркинги и жд': t('categories.subcategories.toys.tracks_parking_railway'),
                      'Мягкие игрушки': t('categories.subcategories.toys.soft_toys'),
                      'Игрушки - антистресс и сквиши': t('categories.subcategories.toys.antistress_squishy'),
                      'Активные игры': t('categories.subcategories.toys.active_games'),
                      'Тематические игровые наборы': t('categories.subcategories.toys.thematic_sets'),
                      'Декоративная косметика и украшения': t('categories.subcategories.toys.decorative_cosmetics'),
                      'Машинки и другой транспорт': t('categories.subcategories.toys.cars_transport'),
                      'Роботы и трансформеры': t('categories.subcategories.toys.robots_transformers'),
                      'Игровые фигурки': t('categories.subcategories.toys.game_figures'),
                      'Игрушки для песочницы': t('categories.subcategories.toys.sandbox_toys'),
                      'Шарики': t('categories.subcategories.toys.balls'),
                      'Игрушки на радиоуправлении': t('categories.subcategories.toys.radio_controlled')
                    },
                    'Конструкторы': {
                      'Lego для мальчиков': t('categories.subcategories.constructors.lego_boys'),
                      'Lego для девочек': t('categories.subcategories.constructors.lego_girls'),
                      'Металлические конструкторы': t('categories.subcategories.constructors.metal_constructors'),
                      'Lego крупные блоки': t('categories.subcategories.constructors.lego_large_blocks')
                    },
                    'Пазлы': {
                      'Пазлы для взрослых': t('categories.subcategories.puzzles.for_adults'),
                      'Пазлы для детей': t('categories.subcategories.puzzles.for_children'),
                      'Магнитные пазлы': t('categories.subcategories.puzzles.magnetic'),
                      'Пазлы напольные': t('categories.subcategories.puzzles.floor'),
                      'Пазлы для малышей': t('categories.subcategories.puzzles.for_babies')
                    },
                      'Творчество': {
                        'Наборы для лепки': t('categories.subcategories.creativity.modeling_sets'),
                        'Наклейки': t('categories.subcategories.creativity.stickers'),
                        'Лизуны и слаймы': t('categories.subcategories.creativity.slimes'),
                        'Кинетический песок': t('categories.subcategories.creativity.kinetic_sand'),
                        'Рисование': t('categories.subcategories.creativity.drawing'),
                        'Наборы для творчества': t('categories.subcategories.creativity.creativity_sets'),
                        'Раскраски': t('categories.subcategories.creativity.coloring')
                      },
                      'Канцтовары': {
                        'Портфели для школы': t('categories.subcategories.stationery.school_bags'),
                        'Портфели для детских садов': t('categories.subcategories.stationery.kindergarten_bags'),
                        'Пеналы': t('categories.subcategories.stationery.pencil_cases'),
                        'Ручки и карандаши': t('categories.subcategories.stationery.pens_pencils'),
                        'Точилки': t('categories.subcategories.stationery.sharpeners'),
                        'Фломастеры и маркеры': t('categories.subcategories.stationery.markers'),
                        'Краски': t('categories.subcategories.stationery.paints'),
                        'Кисточки и принадлежности': t('categories.subcategories.stationery.brushes_accessories'),
                        'Брелки': t('categories.subcategories.stationery.keychains')
                      },
                      'Транспорт': {
                        'Детские самокаты': t('categories.subcategories.transport.scooters'),
                        'Велосипеды': t('categories.subcategories.transport.bicycles'),
                        'Ходунки': t('categories.subcategories.transport.walkers'),
                        'Беговелы': t('categories.subcategories.transport.balance_bikes')
                      },
                      'Отдых на воде': {
                        'Бассейны': t('categories.subcategories.water_recreation.pools'),
                        'Матрасы и плотики': t('categories.subcategories.water_recreation.mattresses_floats'),
                        'Круги надувные': t('categories.subcategories.water_recreation.inflatable_circles'),
                        'Нарукавники и жилеты': t('categories.subcategories.water_recreation.armbands_vests'),
                        'Аксессуары для плавания': t('categories.subcategories.water_recreation.swimming_accessories'),
                        'Ракетки': t('categories.subcategories.water_recreation.rackets'),
                        'Пляжные мячи и игрушки для плавания': t('categories.subcategories.water_recreation.beach_balls'),
                        'Насосы для матрасов': t('categories.subcategories.water_recreation.pumps')
                      },
                      'Настольные игры': {
                        'Настольные игры': t('categories.subcategories.board_games.board_games')
                      },
                      'Развивающие игры': {
                        'Развивающие игры': t('categories.subcategories.educational_games.educational_games')
                      },
                      'Акции': {
                        'Скидки недели': t('categories.subcategories.sales.weekly_discounts'),
                        'Товары по акции': t('categories.subcategories.sales.sale_items')
                      }
                    };
                    
                    const categorySubs = subcategoryMap[categoryName];
                    if (categorySubs && categorySubs[subcategoryName]) {
                      return categorySubs[subcategoryName];
                    }
                    return subcategoryName;
                  };

                  return (
                    <React.Fragment key={category.id}>
                      <ListItem
                        component="div"
                        onClick={() => {
                          navigate(`/category/${category.id}`);
                          setMobileCategoriesOpen(false);
                        }}
                        sx={{
                          backgroundColor: 'transparent',
                          borderRadius: 2,
                          mb: 1,
                          cursor: 'pointer',
                          width: '100%',
                          minHeight: '48px',
                          '&:hover': {
                            backgroundColor: '#FFF3E0',
                          },
                        }}
                      >
                        <Box sx={{ mr: 2, color: '#FFB300' }}>
                          <img 
                            src={getCategoryIcon(category.name)} 
                            alt={category.name}
                            style={{ width: 24, height: 24, objectFit: 'contain' }}
                          />
                        </Box>
                        <ListItemText
                          primary={translateCategory(category.name)}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: 'bold',
                              color: '#333'
                            }
                          }}
                        />
                        {category.sub && category.sub.length > 0 && (
                          <IconButton
                            size="medium"
                            onClick={(e) => {
                              e.stopPropagation(); // Предотвращаем всплытие события
                              const newOpenCatIdx = openCatIdx === category.id ? null : category.id;
                              setOpenCatIdx(newOpenCatIdx);
                            }}
                            sx={{ 
                              color: '#FFB300',
                              padding: 0,
                              minWidth: 'auto',
                              '&:hover': {
                                backgroundColor: 'transparent',
                              }
                            }}
                          >
                            {openCatIdx === category.id ? <ExpandMore /> : <ChevronRight />}
                          </IconButton>
                        )}

                      </ListItem>
                      
                      {/* Подкатегории */}
                      {category.sub && category.sub.length > 0 && (
                        <Collapse in={openCatIdx === category.id} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {category.sub.map((subcategory) => (
                              <ListItem
                                key={subcategory.id}
                                component="div"
                                onClick={() => {
                                  navigate(`/subcategory/${subcategory.id}`);
                                  setMobileCategoriesOpen(false);
                                }}
                                sx={{
                                  pl: 4,
                                  backgroundColor: 'transparent',
                                  borderRadius: 2,
                                  mb: 0.5,
                                  cursor: 'pointer',
                                  width: '100%',
                                  minHeight: '40px',
                                  '&:hover': {
                                    backgroundColor: '#FFF3E0',
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={translateSubcategory(category.name, subcategory.name)}
                                  sx={{
                                    '& .MuiListItemText-primary': {
                                      fontSize: '0.875rem',
                                      color: '#666'
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
            </Box>
          </Drawer>
      </Box>
    </>
  );
}

// Главная страница
function HomePage({ products, onAddToCart, cart, user, onWishlistToggle, onChangeCartQuantity, onEditProduct, wishlist }) {
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  // Новинки — сортировка по дате создания (createdAt), самые новые первые
  const newProducts = React.useMemo(() =>
    [...(products || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12),
    [products]
  );
  // Популярное — сортировка по рейтингу (rating), самые популярные первые
  const popularProducts = React.useMemo(() =>
    [...(products || [])].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12),
    [products]
  );

  return (
    <Box sx={{ minHeight: '80vh', pt: 4, flexDirection: 'column' }}>
      <ProductCarousel
        title={t('home.newArrivals')}
        products={newProducts}
        onAddToCart={onAddToCart}
        cart={cart}
        user={user}
        onWishlistToggle={onWishlistToggle}
        onChangeCartQuantity={onChangeCartQuantity}
        onEditProduct={onEditProduct}
        wishlist={wishlist}
        isAdmin={isAdmin}
      />
      <ProductCarousel
        title={t('home.popular')}
        products={popularProducts}
        onAddToCart={onAddToCart}
        cart={cart}
        user={user}
        onWishlistToggle={onWishlistToggle}
        onChangeCartQuantity={onChangeCartQuantity}
        onEditProduct={onEditProduct}
        wishlist={wishlist}
        isAdmin={isAdmin}
      />
      {/* Здесь может быть дополнительный контент главной страницы */}
    </Box>
  );
}
// Каталог
function CatalogPage({ products, onAddToCart, cart, handleChangeCartQuantity, user, wishlist, onWishlistToggle, onEditProduct, dbCategories, selectedGenders, selectedBrands, selectedAgeGroups, priceRange }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('lg'));
  // Фильтры каталога
  const [filterAgeGroup, setFilterAgeGroup] = useState('all');
  const [filterGender, setFilterGender] = useState([]); // массив: ['Для мальчиков', 'Для девочек', 'Универсальный']
  const [sortBy, setSortBy] = useState('popular');
  const [pageSize, setPageSize] = useState(24);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  
  // Автоматически переключаем на grid view на мобильных устройствах
  useEffect(() => {
   if ((isNarrow || isMobile) && viewMode === 'list') {
      setViewMode('grid');
    }
 }, [isNarrow, isMobile, viewMode]);
  
  // Определяем валюту по товарам (если есть поле currency, иначе ILS)
  const currency = products && products.length > 0
    ? (products.find(p => p.currency)?.currency || 'ILS')
    : 'ILS';
  
  // Синхронизируем searchQuery с query-параметром ?search=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchQuery(search);
  }, [location.search]);
  
  // Базовые категории каталога (ключ + оригинальное имя в БД + иконка)
  const baseCatalogCategories = [
    { key: 'toys', baseName: 'Игрушки', icon: '/igrushki.webp' },
    { key: 'constructors', baseName: 'Конструкторы', icon: '/lego1.webp' },
    { key: 'puzzles', baseName: 'Пазлы', icon: '/puzzle.webp' },
    { key: 'creativity', baseName: 'Творчество', icon: '/tvorchestvo.webp' },
    { key: 'stationery', baseName: 'Канцтовары', icon: '/karandash.webp' },
    { key: 'transport', baseName: 'Транспорт', icon: '/samokat.webp' },
    { key: 'water_recreation', baseName: 'Отдых на воде', icon: '/voda.webp' },
    { key: 'board_games', baseName: 'Настольные игры', icon: '/nastolnie-igri.webp' },
    { key: 'educational_games', baseName: 'Развивающие игры', icon: '/razvitie.webp' },
    { key: 'sales', baseName: 'Акции', icon: '/sale.webp' }
  ];

  // Локализованные категории для отображения
  const catalogCategories = React.useMemo(() =>
    baseCatalogCategories.map(cat => ({
      ...cat,
      label: t(`categories.${cat.key}`)
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  );

  // Статические категории для fallback
  const staticCategories = [
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
  
  // Инициализация распознавания речи
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setSearchQuery(finalTranscript);
          setInterimTranscript('');
          setIsListening(false);
        } else {
          setInterimTranscript(interimTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    }
  }, [i18n.language]);

  // Функция для начала голосового ввода
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        // Убеждаемся, что язык установлен правильно перед запуском
        recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
        console.log('CatalogPage: Setting speech recognition language to:', recognitionRef.current.lang);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    } else {
      alert(getSpeechRecognitionErrorMessage(i18n.language));
    }
  };

  // Функция для остановки голосового ввода
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Фильтрация товаров по поисковому запросу

  const filteredProducts = products.filter(product => {
    // Фильтр по брендам
    if (selectedBrands && selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
    // Фильтр по возрасту
    if (selectedAgeGroups && selectedAgeGroups.length > 0 && !selectedAgeGroups.includes(product.ageGroup)) return false;
    // Фильтр по полу
    if (selectedGenders && selectedGenders.length > 0) {
      // Преобразуем выбранные английские коды в русские названия
      const selectedRussianGenders = selectedGenders.map(code => genderMapping[code]);
      if (!selectedRussianGenders.includes(product.gender)) {
        return false;
      }
          }
      // Фильтр по цене
      const productPrice = Number(product.price);
      if (productPrice < priceRange[0] || productPrice > priceRange[1]) return false;
      // Поиск (если есть)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = product.name?.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
      const categoryMatch = (() => {
        if (typeof product.category === 'object' && product.category !== null) {
          return (product.category.name || '').toLowerCase().includes(searchLower);
        }
        return (product.category || '').toLowerCase().includes(searchLower);
      })();
      
      if (!nameMatch && !descriptionMatch && !categoryMatch) return false;
    }
    return true;
  });
  
  // Сортировка товаров
  const sortedProducts = React.useMemo(() => {
    let arr = [...filteredProducts];
    switch (sortBy) {
      case 'popular':
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'price-low':
        return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name-az':
        return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-za':
        return arr.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return arr;
    }
  }, [filteredProducts, sortBy]);

  // Пагинация
  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;
  const pagedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [sortBy, pageSize, filteredProducts]);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Container maxWidth={false} sx={{ py: { xs: 2, md: 0.25 }, px: { xs: 2, md: 4 },
        pl: { md: '270px' }
      }}>
        <Box sx={{ mb: 4, pt: { xs: 0, md: 0 } }}>
          <Typography variant="h2" sx={{ 
            textAlign: 'center', 
            mb: 4,
            fontWeight: 800, 
            color: '#ff6600',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            fontSize: '3rem',
            textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {t('catalog.title')}
          </Typography>
          {/* Плитки категорий каталога */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
            justifyItems: 'center',
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'start' },
            maxWidth: 1100,
            margin: '0 auto',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            mb: 4
          }}>
            {catalogCategories.map(cat => (
              <Box
                key={cat.key}
                className="category-tile"
                onClick={() => {
                  if (dbCategories && dbCategories.length > 0) {
                    const dbCat = dbCategories.find(c => c.name === cat.baseName && !c.parentId);
                    if (dbCat) {
                      navigate(`/category/${dbCat.id}`);
                      return;
                    }
                  }
                  const staticCat = staticCategories.find(c => c.label === cat.baseName);
                  if (staticCat) {
                    navigate(`/category/${staticCat.id}`);
                  }
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  width: { xs: '320px', sm: '100%' },
                  height: { xs: 156, sm: 160 },
                  p: 0,
                  background: '#f7fafc',
                  borderRadius: 3,
                  border: '1px solid #e3f2fd',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderColor: '#4FC3F7'
                  }
                }}
              >
                <img
                  src={cat.icon}
                  alt={cat.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    background: '#fff'
                  }}
                  loading="lazy"
                />
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-1px',
                  background: 'rgba(255,255,255,0.82)',
                  py: 1,
                  px: 2,
                  textAlign: 'center',
                }}>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#222',
                    textAlign: 'center',
                    m: 0,
                    p: 0,
                  }}>
                    {cat.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          
          {/* Строка поиска удалена по просьбе пользователя */}
{searchQuery && !isListening && (
            <Typography sx={{ 
              mt: 2, 
              textAlign: 'center', 
              color: '#666',
              fontSize: '1rem',
              fontWeight: 500
            }}>
              {t('catalog.foundProducts', { count: filteredProducts.length })}
            </Typography>
          )}
          {/* Блок сортировки, количества и вида — как на скриншоте */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1, md: 3 },
            mb: 5,
            mt: 2,
            flexWrap: 'wrap',
            maxWidth: 1100,
            margin: '0 auto',
          }}>
            {/* Сортировка и количество — слева */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#222', mr: 1 }}>{t('catalog.sortBy')}:</Typography>
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                width={180}
                options={[
                  { value: 'popular', label: t('catalog.sortOptions.popular') },
                  { value: 'newest', label: t('catalog.sortOptions.newest') },
                  { value: 'price-low', label: t('catalog.sortOptions.priceLow') },
                  { value: 'price-high', label: t('catalog.sortOptions.priceHigh') },
                  { value: 'name-az', label: t('catalog.sortOptions.nameAZ') },
                  { value: 'name-za', label: t('catalog.sortOptions.nameZA') },
                ]}
                sx={{ minWidth: 160 }}
              />
              <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#222', ml: 3, mr: 1 }}>{t('catalog.itemsPerPage')}:</Typography>
              <CustomSelect
                value={pageSize}
                onChange={v => setPageSize(Number(v))}
                width={100}
                options={[
                  { value: 24, label: '24' },
                  { value: 48, label: '48' },
                  { value: 96, label: '96' },
                ]}
                sx={{ minWidth: 60 }}
              />
            </Box>
            {/* Переключатель вида — справа */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              ml: 'auto',
              // Скрываем кнопки переключения в горизонтальном положении на мобильных
              display: { xs: 'none', sm: 'flex' }
            }}>
              <IconButton
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
                sx={{ border: viewMode === 'grid' ? '2px solid #ff6600' : '2px solid transparent', background: viewMode === 'grid' ? '#fff7f0' : 'transparent', borderRadius: 2, p: 0.5 }}
                title={t('catalog.viewMode.grid')}
              >
                <ViewModule sx={{ fontSize: 28, color: viewMode === 'grid' ? '#ff6600' : '#888' }} />
              </IconButton>
              <IconButton
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  border: viewMode === 'list' ? '2px solid #ff6600' : '2px solid transparent', 
                  background: viewMode === 'list' ? '#fff7f0' : 'transparent', 
                  borderRadius: 2, 
                  p: 0.5 
                }}
                title={t('catalog.viewMode.list')}
              >
                <ViewList sx={{ fontSize: 28, color: viewMode === 'list' ? '#ff6600' : '#888' }} />
              </IconButton>
            </Box>
          </Box>
          {/* Отступ между сортировкой и товарами через mb */}
          <Box sx={{ mb: 5 }} />
          {/* Сетка или список товаров каталога */}
          {viewMode === 'grid' ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
              mt: 8,
              mb: 6,
              maxWidth: 1100,
              margin: '0 auto',
              justifyItems: { xs: 'center', sm: 'start' }
            }}>
              {pagedProducts.length > 0 ? (
                pagedProducts.map(product => (
                  <Box key={product.id} sx={{ width: { xs: '320px', sm: '100%' }, minWidth: 0, maxWidth: '100%' }}>
                    <ProductCard
                      product={product}
                      user={user}
                      inWishlist={wishlist?.some ? wishlist.some(item => item.productId === product.id) : false}
                      onWishlistToggle={onWishlistToggle}
                      onAddToCart={onAddToCart}
                      cart={cart}
                      onChangeCartQuantity={handleChangeCartQuantity}
                      onEditProduct={onEditProduct}
                     viewMode={(isNarrow || isMobile) && window.innerWidth > window.innerHeight ? "carousel" : "grid"}
                      isAdmin={user?.role === 'admin'}
                    />
                  </Box>
                ))
              ) : (
                <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 20 }}>
                  {searchQuery ? t('catalog.noResults.search', { query: searchQuery }) : t('catalog.noResults.default')}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 6, mb: 6, maxWidth: 1100, margin: '0 auto', alignItems: { xs: 'center', sm: 'stretch' } }}>
              {pagedProducts.length > 0 ? (
                pagedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    user={user}
                    inWishlist={wishlist?.some ? wishlist.some(item => item.productId === product.id) : false}
                    onWishlistToggle={onWishlistToggle}
                    onAddToCart={onAddToCart}
                    cart={cart}
                    onChangeCartQuantity={handleChangeCartQuantity}
                    onEditProduct={onEditProduct}
                    viewMode="list"
                    isAdmin={user?.role === 'admin'}
                  />
                ))
              ) : (
                <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 20 }}>
                  {searchQuery ? t('catalog.noResults.search', { query: searchQuery }) : t('catalog.noResults.noItems')}
                </Typography>
              )}
            </Box>
          )}
          {/* Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 4 }}>
              <Button variant="outlined" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('catalog.pagination.prev')}</Button>
              <Typography sx={{ fontWeight: 500, fontSize: 16 }}>{t('catalog.pagination.page', { current: page, total: totalPages })}</Typography>
              <Button variant="outlined" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{t('catalog.pagination.next')}</Button>
            </Box>
          )}
        </Box>
      </Container>
      {/* Кнопка возврата вверх */}
      {showScrollTop && (
        <Box
          onClick={handleScrollTop}
          sx={{
            position: 'fixed',
            right: { xs: 16, md: 32 },
            bottom: { xs: 24, md: 40 },
            zIndex: 1500,
            bgcolor: '#fff',
            border: '2px solid #ff6600',
            borderRadius: '50%',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            width: 52,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
            '&:hover': {
              bgcolor: '#fff7f0',
              boxShadow: '0 8px 24px rgba(255,102,0,0.12)',
            },
          }}
          title={t('catalog.scrollToTop')}
        >
          <KeyboardArrowUpIcon sx={{ color: '#ff6600', fontSize: 36 }} />
        </Box>
      )}
    </Box>
  );
}

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

// === Страница подтверждения email ===
function ConfirmEmailPage() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Некорректная ссылка подтверждения');
      return;
    }

    // Отправляем запрос на подтверждение
    fetch(`${API_BASE_URL}/api/auth/confirm?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatus('success');
          setMessage(data.message);
          
          // Если есть токен и данные пользователя, автоматически входим в аккаунт
          if (data.token && data.user) {
            // Сохраняем токен в localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Обновляем состояние приложения (если есть доступ к setUser)
            if (window.setUser) {
              window.setUser(data.user);
            }
            
            // Перенаправляем на главную через 2 секунды
            setTimeout(() => {
              navigate('/');
              // Перезагружаем страницу для обновления состояния
              window.location.reload();
            }, 2000);
          } else {
            // Если нет токена, просто перенаправляем
            setTimeout(() => navigate('/'), 3000);
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Ошибка подтверждения');
        }
      })
      .catch(error => {
        console.error('Confirm email error:', error);
        setStatus('error');
        setMessage('Ошибка подтверждения email');
      });
  }, [navigate, location]);

  return (
    <Container maxWidth="sm" sx={{ mt: 16, textAlign: 'center' }}>
      <Box sx={{ 
        p: 4, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: 'white'
      }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Подтверждение email...</Typography>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
              Email подтверждён!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Вы автоматически войдёте в аккаунт и будете перенаправлены на главную страницу...
            </Typography>
          </>
        )}
        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error.main" sx={{ mb: 2 }}>
              Ошибка подтверждения
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button 
              onClick={() => navigate('/')}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                minWidth: 120,
                height: 44,
                mr: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              На главную
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Попробовать снова
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}

// === Страница успешной OAuth авторизации ===
function OAuthSuccessPage() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Некорректная ссылка авторизации');
      return;
    }

    // Декодируем JWT токен для получения данных пользователя
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Дополнительное декодирование имени пользователя
      let userName = payload.name;
      console.log('Original user name from JWT:', userName);
      
      if (userName) {
        try {
          // Проверяем, нужно ли декодировать
          let decoded = userName;
          
          // Если имя содержит %XX кодировку, декодируем
          if (userName.includes('%')) {
            decoded = decodeURIComponent(userName);
            console.log('Decoded user name:', decoded);
          }
          
          // Если результат содержит еще %XX, декодируем еще раз
          if (decoded.includes('%')) {
            decoded = decodeURIComponent(decoded);
            console.log('Second decode attempt:', decoded);
          }
          
          // Очищаем и нормализуем имя
          userName = decoded.trim().replace(/\s+/g, ' ') || userName;
          console.log('Final user name:', userName);
        } catch (error) {
          console.error('Error decoding user name on frontend:', error);
          // В случае ошибки оставляем оригинальное имя
        }
      }
      
      const userData = {
        id: payload.userId,
        email: payload.email,
        name: userName,
        role: payload.role,
        token: token,
        emailVerified: true
      };
      
      // Сохраняем данные пользователя
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      // Обновляем состояние приложения
      if (window.setUser) {
        window.setUser(userData);
      }
      
      setStatus('success');
      setMessage('Авторизация через Google успешна!');
      
      // Перенаправляем на главную через 2 секунды
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('OAuth success error:', error);
      setStatus('error');
      setMessage('Ошибка обработки токена авторизации');
    }
  }, [navigate, location]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ 
        p: 4, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: 'white'
      }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Обработка авторизации...</Typography>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
              Авторизация успешна!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Вы автоматически войдёте в аккаунт и будете перенаправлены на главную страницу...
            </Typography>
          </>
        )}
        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error.main" sx={{ mb: 2 }}>
              Ошибка авторизации
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              На главную
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}

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
        
        console.log('✅ App translations initialized. Current language:', i18n.language);
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
      console.log('🔍 Translation Debugger Active');
      console.log('Current language:', i18n.language);
      console.log('Available languages:', i18n.languages);
      console.log('Has resources:', i18n.hasResourceBundle(i18n.language, 'translation'));
      console.log('LocalStorage language:', localStorage.getItem('i18nextLng'));
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
          console.log('User email not verified, removing from localStorage');
          localStorage.removeItem('user');
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
  }, []);

  // Загрузка локальной корзины для гостей
  useEffect(() => {
    if (!user) {
      // Если пользователь не авторизован, загружаем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      console.log('🔍 Загружаем локальную корзину для гостя:', localCart);
      console.log('🔍 Локальная корзина items:', localCart.items);
      if (localCart.items && localCart.items.length > 0) {
        console.log('🔍 Первый товар в корзине:', localCart.items[0]);
        console.log('🔍 imageUrls первого товара:', localCart.items[0].product?.imageUrls);
      }
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
            
            console.log('Email подтвержден, пользователь автоматически вошел в систему');
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
    console.log('🛒 handleAddToCart: Добавляем товар в корзину:', product);
    console.log('🛒 handleAddToCart: imageUrls товара:', product.imageUrls);
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
      console.log('Локальная корзина очищена после успешного заказа');
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
      
      console.log('Корзина очищена после успешного заказа');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Функция для работы с избранным
  const handleWishlistToggle = async (productId, isInWishlist) => {
    setLottiePlayingMap(prev => {
      const newMap = { ...prev, [Number(productId)]: true };
      console.log('setLottiePlayingMap', newMap);
      return newMap;
    });
    setTimeout(() => {
      setLottiePlayingMap(prev => {
        const newMap = { ...prev, [Number(productId)]: false };
        console.log('setLottiePlayingMap (timeout)', newMap);
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
      console.log('User email not verified, login blocked');
      return; // Не входим в систему, если email не подтвержден
    }
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleRegister = async (userData) => {
    // При регистрации пользователь не должен сразу входить в систему
    // Показываем модальное окно с просьбой подтвердить email
    console.log('Registration successful, email verification required');
    
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
      console.log('App: handleSaveProduct - updatedProduct:', updatedProduct);
      console.log('App: Category:', updatedProduct.category);
      console.log('App: Subcategory:', updatedProduct.subcategory);
      
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

      console.log('App: Sending request to:', `${API_BASE_URL}/api/products/${updatedProduct.id}`);
      console.log('App: Request method: PUT');
      console.log('App: FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log('App: FormData entry:', key, '=', value);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('App: Response status:', response.status);
      console.log('App: Response ok:', response.ok);

      if (response.ok) {
        const savedProduct = await response.json();
        console.log('App: Saved product response:', savedProduct);
        console.log('App: Saved product category:', savedProduct.category);
        console.log('App: Saved product subcategory:', savedProduct.subcategory);
        console.log('App: Saved product categoryId:', savedProduct.categoryId);
        console.log('App: Saved product subcategoryId:', savedProduct.subcategoryId);
    
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
          console.log('App: Calling onSaveCallback for product update');
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
    document.body.style.background = "url('/background.png') no-repeat center center fixed";
    document.body.style.backgroundSize = "cover";
    return () => {
      document.body.style.background = "";
      document.body.style.backgroundSize = "";
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
  const loadCategoriesFromAPI = async () => {
    try {
      const categoriesUrl = user?.role === 'admin' 
        ? `${API_BASE_URL}/api/admin/categories`
        : `${API_BASE_URL}/api/categories`;
      
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      
      console.log('Fetching categories from:', categoriesUrl);
      const res = await fetch(categoriesUrl, { headers });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
      
            const response = await res.json();
      const data = response.value || response; // Поддерживаем оба формата
      console.log('loadCategoriesFromAPI - received data:', data);

      
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
          console.log('loadCategoriesFromAPI - transformed categories:', transformedCategories);
          setDbCategories(transformedCategories);
      
      return transformedCategories;
    } catch (error) {
          console.error('Error loading categories:', error);
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
// Компонент для контента внутри Router
function AppContent({ 
  cart, cartLoading, user, handleLogout, setAuthOpen, profileLoading, onOpenSidebar, 
  mobileOpen, setMobileOpen, appBarRef, drawerOpen, setDrawerOpen, 
  miniCartOpen, setMiniCartOpen, handleChangeCartQuantity, 
  handleRemoveFromCart, handleAddToCart, handleEditProduct, 
  handleSaveProduct, handleDeleteProduct, handleWishlistToggle, handleClearCart, wishlist, products, dbCategories, 
  authOpen, handleLogin, handleRegister,
  editModalOpen, setEditModalOpen, editingProduct, setEditingProduct, loadCategoriesFromAPI, selectedGenders, onGendersChange, selectedBrands, selectedAgeGroups, setSelectedBrands, setSelectedAgeGroups, handleUserUpdate, handleOpenReviewForm, reviewFormOpen, setReviewFormOpen, reviewFormData, emailConfirmModalOpen, setEmailConfirmModalOpen, emailConfirmData, priceRange, setPriceRange, filtersMenuOpen, setFiltersMenuOpen, desktopSearchBarRef
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  
  // Проверка для отображения десктопной поисковой строки
  const isHome = location.pathname === '/';
  const isCatalog = location.pathname === '/catalog';
  const shouldShowDesktopSearch = isHome || isCatalog;
  
  // Состояния для мобильного поиска и фильтров
  const [searchQuery, setSearchQuery] = React.useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [interimTranscript, setInterimTranscript] = React.useState('');
  const recognitionRef = React.useRef(null);
  
  // Обработка ошибок рендера
  const [hasError, setHasError] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState(null);
  
  // Функция поиска
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Инициализация голосового поиска
  React.useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      console.log('Speech recognition not supported');
      return;
    }
    
    // Очищаем предыдущий объект распознавания
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping previous recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        // Создаем новый объект распознавания
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          console.log('Speech recognition started with language:', recognitionRef.current.lang);
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setSearchQuery(finalTranscript);
            setIsListening(false);
            recognitionRef.current.stop();
          } else {
            setInterimTranscript(interimTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        console.log('Speech recognition initialized with language:', getSpeechRecognitionLanguage(i18n.language));
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
      }
    }
  }, [i18n.language]); // Переинициализируем только при смене языка

  // Функции для голосового поиска
  const handleMicClick = () => {
    console.log('handleMicClick called, isListening:', isListening);
    
    if (!recognitionRef.current) {
      console.log('No recognition object available');
      alert(getSpeechRecognitionErrorMessage(i18n.language));
      return;
    }

    try {
      // Убеждаемся, что язык установлен правильно перед запуском
      recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
      console.log('Setting speech recognition language to:', recognitionRef.current.lang);

      if (isListening) {
        console.log('Stopping speech recognition');
        recognitionRef.current.stop();
      } else {
        console.log('Starting speech recognition');
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error in handleMicClick:', error);
      setIsListening(false);
    }
  };

  React.useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error('AppContent Error:', error, errorInfo);
      setHasError(true);
      setErrorInfo(errorInfo);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ 
          textAlign: 'center', 
          p: 4, 
          background: 'white', 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h4" sx={{ color: '#f44336', mb: 2 }}>
            😵 Произошла ошибка
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
            Что-то пошло не так. Попробуйте обновить страницу.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ background: '#4CAF50' }}
          >
            Обновить страницу
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <>
      <div className="App" style={{ 
        flex: '1 0 auto', 
        display: 'flex', 
        flexDirection: 'column',
        paddingTop: isNarrow ? '64px' : '96px' // Добавляем отступ сверху для учета фиксированного AppBar
      }}>
        <Navigation 
          cart={cart}
          cartCount={cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
          user={user}
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
          onChangeCartQuantity={handleChangeCartQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          dbCategories={dbCategories}
          selectedGenders={selectedGenders}
          onGendersChange={onGendersChange}
          products={products}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          selectedAgeGroups={selectedAgeGroups}
          setSelectedAgeGroups={setSelectedAgeGroups}
          mobileFiltersOpen={mobileFiltersOpen}
          setMobileFiltersOpen={setMobileFiltersOpen}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          filtersMenuOpen={filtersMenuOpen}
          setFiltersMenuOpen={setFiltersMenuOpen}
          desktopSearchBarRef={desktopSearchBarRef}
        />
        
        {/* Мобильный поиск и фильтры под AppBar */}
        {isNarrow && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 1, 
            width: '100%',
            mt: '15px',
            mb: '15px',
            px: 2,
            position: 'relative',
            zIndex: 1
          }}>
            {/* Поисковое поле */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ flex: 1 }}>
              <TextField
                size="small"
                placeholder={t('header.searchPlaceholder')}
                value={isListening && interimTranscript ? interimTranscript : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleMicClick} size="small" color={isListening ? 'primary' : 'default'} title="Голосовой ввод">
                        <MicIcon />
                      </IconButton>
                      <IconButton type="submit" size="small">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ background: 'white', borderRadius: 2, width: '100%' }}
              />
            </form>

                                 {/* Кнопка фильтров */}
                     <IconButton
                       onClick={() => setMobileFiltersOpen(true)}
                       sx={{
                         color: '#FF9800',
                         backgroundColor: 'white',
                         border: '1px solid #FF9800',
                         borderRadius: 2,
                         width: 48,
                         height: 40,
                         '&:hover': {
                           backgroundColor: 'rgba(255, 152, 0, 0.04)',
                         },
                       }}
                     >
                       <FilterList />
                     </IconButton>
          </Box>
        )}

                         {/* Десктопная поисковая строка под AppBar */}
        {isDesktop && shouldShowDesktopSearch && (
          <Box 
            ref={desktopSearchBarRef}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              width: '100%',
              mt: '15px',
              mb: '15px',
              px: 2,
              position: 'relative',
              zIndex: 1
            }}
          >
                  {/* Поисковое поле с отступом слева 255px */}
                  <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{
                    flex: 1,
                    marginLeft: '255px',
                    maxWidth: 'calc(100% - 255px)'
                  }}>
               <TextField
                 size="small"
                 placeholder={t('header.searchPlaceholder')}
                 value={isListening && interimTranscript ? interimTranscript : searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 InputProps={{
                   endAdornment: (
                     <InputAdornment position="end">
                       <IconButton onClick={handleMicClick} size="small" color={isListening ? 'primary' : 'default'} title="Голосовой ввод">
                         <MicIcon />
                       </IconButton>
                       <IconButton type="submit" size="small">
                         <SearchIcon />
                       </IconButton>
                     </InputAdornment>
                   )
                 }}
                 sx={{ background: 'white', borderRadius: 2, width: '100%' }}
               />
             </form>

             {/* Кнопка фильтров для десктопа */}
             <IconButton
               data-filter-button
               onClick={() => setFiltersMenuOpen(!filtersMenuOpen)}
               sx={{
                 color: '#FF9800',
                 backgroundColor: filtersMenuOpen ? 'rgba(255, 152, 0, 0.1)' : 'white',
                 border: '1px solid #FF9800',
                 borderRadius: 2,
                 width: 48,
                 height: 40,
                 '&:hover': {
                   backgroundColor: filtersMenuOpen ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.04)',
                 },
               }}
             >
               <FilterList />
             </IconButton>
           </Box>
         )}


        <Routes>
          <Route path="/" element={<HomePage products={products} onAddToCart={handleAddToCart} cart={cart} user={user} onWishlistToggle={handleWishlistToggle} onChangeCartQuantity={handleChangeCartQuantity} onEditProduct={handleEditProduct} wishlist={wishlist} />} />
          <Route path="/product/:id" element={<ProductPage onAddToCart={handleAddToCart} cart={cart} user={user} onChangeCartQuantity={handleChangeCartQuantity} onEditProduct={handleEditProduct} setAuthOpen={setAuthOpen} dbCategories={dbCategories} />} />
          <Route path="/catalog" element={<CatalogPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} dbCategories={dbCategories} selectedGenders={selectedGenders} selectedBrands={selectedBrands} selectedAgeGroups={selectedAgeGroups} priceRange={priceRange} />} />
          <Route path="/category/:id" element={<CategoryPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} />} />
          <Route path="/subcategory/:id" element={<SubcategoryPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} selectedGenders={selectedGenders} />} />
          <Route path="/cart" element={<CartPage cart={cart} onChangeCartQuantity={handleChangeCartQuantity} onRemoveFromCart={handleRemoveFromCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} cartLoading={cartLoading} user={user} onClearCart={handleClearCart} />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/wishlist" element={<WishlistPage user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} />} />
          <Route path="/profile" element={<UserCabinetPage user={user} handleLogout={handleLogout} wishlist={wishlist} handleWishlistToggle={handleWishlistToggle} cart={cart} handleAddToCart={handleAddToCart} handleChangeCartQuantity={handleChangeCartQuantity} onEditProduct={handleEditProduct} handleUserUpdate={handleUserUpdate} handleOpenReviewForm={handleOpenReviewForm} />} />
          <Route path="/cms" element={<CMSPage loadCategoriesFromAPI={loadCategoriesFromAPI} editModalOpen={editModalOpen} setEditModalOpen={setEditModalOpen} editingProduct={editingProduct} setEditingProduct={setEditingProduct} dbCategories={dbCategories} />} />
          <Route path="/attribution" element={<AttributionPage />} />
          <Route path="/search" element={<SearchResultsPage products={products} cart={cart} onChangeCartQuantity={handleChangeCartQuantity} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reviews" element={<CustomerReviews />} />
          <Route path="/review-order" element={<ReviewPage />} />
          <Route path="/test-reviews" element={<TestReviews />} />
          <Route path="/test-product-reviews" element={<TestProductReviews />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />
          <Route path="/questions" element={<PublicQuestions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <AuthModal 
        open={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      <EditProductModal
        open={editModalOpen}
        product={editingProduct}
        onClose={() => { setEditModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        categories={dbCategories}
      />
      
      <ReviewForm
        open={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
        productId={reviewFormData.productId}
        productName={reviewFormData.productName}
        productImage={reviewFormData.productImage}
      />
      
      {/* Модальное окно подтверждения email */}
      <Dialog
        open={emailConfirmModalOpen}
        onClose={() => setEmailConfirmModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#1976d2',
          borderBottom: '2px solid #e3f2fd',
          mb: 2
        }}>
          ✉️ Проверьте вашу почту
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem', color: '#666' }}>
            Привет, <strong>{emailConfirmData.name}</strong>! 👋
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', color: '#666' }}>
            Мы отправили письмо с подтверждением на адрес:
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              color: '#1976d2',
              backgroundColor: '#f5f5f5',
              padding: 2,
              borderRadius: 2,
              border: '1px solid #e3f2fd'
            }}
          >
            {emailConfirmData.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', color: '#666' }}>
            Пожалуйста, проверьте вашу почту и нажмите на ссылку для подтверждения регистрации.
          </Typography>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              💡 <strong>Совет:</strong> Проверьте папку "Спам", если письмо не пришло в течение нескольких минут.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4 }}>
          <Button
            variant="contained"
            onClick={() => setEmailConfirmModalOpen(false)}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
              textTransform: 'none',
              minWidth: 120,
              '&:hover': {
                background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
          >
            Понятно
          </Button>
        </DialogActions>
      </Dialog>

      {/* Футер */}
      <Box component="footer" sx={{
        width: '100%',
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
        color: '#fff',
        mt: 6,
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Информация о компании */}
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {t('footer.title')}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#e3f2fd', 
                lineHeight: 1.6, 
                mb: 3,
                opacity: 0.9
              }}>
                {t('footer.description')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton 
                  component="a"
                  href="https://www.facebook.com/simbakingoftoys"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#fff', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton 
                  component="a"
                  href="https://www.instagram.com/simbaking_oftoys?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#fff', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Instagram />
                </IconButton>
                <IconButton 
                  component="a"
                  href="https://wa.me/972533774509?text=שלום! יש לי שאלה על הצעצועים שלכם."
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#fff', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <WhatsApp />
                </IconButton>
              </Box>
            </Grid>

            {/* Быстрые ссылки */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {t('footer.quickLinks')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <RouterLink to="/" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { textDecoration: 'underline' }
                }}>
                  {t('breadcrumbs.home')}
                </RouterLink>
                <RouterLink to="/catalog" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { textDecoration: 'underline' }
                }}>
                  {t('navigation.catalog')}
                </RouterLink>
                <RouterLink to="/about" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { textDecoration: 'underline' }
                }}>
                  {t('footer.about')}
                </RouterLink>
                <RouterLink to="/contacts" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { textDecoration: 'underline' }
                }}>
                  {t('footer.contacts')}
                </RouterLink>
                <RouterLink to="/reviews" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { textDecoration: 'underline' }
                }}>
                  {t('footer.reviews')}
                </RouterLink>
              </Box>
            </Grid>

            {/* Часы работы */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {t('footer.workingHours')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                  {t('footer.weekdays')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                  {t('footer.friday')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                  {t('footer.saturday')}
                </Typography>
              </Box>
            </Grid>

            {/* Контактная информация */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {t('footer.contactInfo')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ color: '#e3f2fd', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                    +972 53-377-4509
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ color: '#e3f2fd', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                    +972 77-700-5171
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ color: '#e3f2fd', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                    info@kids-toys-shop.com
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>


        </Container>

        {/* Нижняя часть футера */}
        <Box sx={{ 
          bgcolor: 'rgba(0,0,0,0.2)', 
          py: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2
            }}>
              <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.8 }}>
                © {new Date().getFullYear()} {t('footer.copyright')} - {t('footer.title')}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 3,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <RouterLink to="/privacy" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  opacity: 0.8
                }}>
                  {t('footer.privacyPolicy')}
                </RouterLink>
                <RouterLink to="/terms" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  opacity: 0.8
                }}>
                  {t('footer.termsOfService')}
                </RouterLink>

                <RouterLink to="/attribution" style={{ 
                  color: '#fff', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  opacity: 0.8
                }}>
                  {t('footer.attribution')}
                </RouterLink>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
         </>
   );
 }

function CMSPage({ loadCategoriesFromAPI, editModalOpen, setEditModalOpen, editingProduct, setEditingProduct, dbCategories }) {
  const [section, setSection] = React.useState('products');
  const [productsSubsection, setProductsSubsection] = React.useState('list'); // 'add' | 'list'
  const [productsMenuOpen, setProductsMenuOpen] = React.useState(false);
  const [reviewsSubsection, setReviewsSubsection] = React.useState('shop'); // 'shop' | 'product' | 'questions'
  const [reviewsMenuOpen, setReviewsMenuOpen] = React.useState(false);
  const sections = [
    { key: 'products', label: 'Товары' },
    { key: 'categories', label: 'Категории' },
    { key: 'orders', label: 'Заказы' },
    { key: 'users', label: 'Пользователи' },
    { key: 'reviews', label: 'Отзывы и вопросы' },
  ];

  // Сброс состояния подменю товаров при переключении на другие разделы
  React.useEffect(() => {
    if (section !== 'products') {
      setProductsMenuOpen(false);
      setProductsSubsection('list');
    }
    if (section !== 'reviews') {
      setReviewsMenuOpen(false);
      setReviewsSubsection('shop');
    }
  }, [section]);

  // Функция для создания красивого заголовка
  const createHeader = (title) => (
    <Typography variant="h5" sx={{ 
      fontWeight: 800, 
      mb: 3, 
      color: '#ff6600',
      fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      fontSize: '2.2rem',
      textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }}>
      {title}
    </Typography>
  );

    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f7f7f7', pt: 'var(--appbar-height)', boxSizing: 'border-box' }}>
      <Box sx={{ width: 220, background: '#fff', borderRight: '1px solid #eee', p: 0 }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', color: '#1976d2' }}>CMS</Typography>
        <List>
          {/* Товары с выпадающим меню */}
          <ListItem onClick={() => {
            setSection('products');
            setProductsMenuOpen(o => !o);
          }} selected={section === 'products'} sx={{ cursor: 'pointer' }}>
            <ListItemText primary="Товары" />
            <KeyboardArrowDown
              sx={{
                transition: 'transform 0.2s',
                transform: productsMenuOpen && section === 'products' ? 'rotate(0deg)' : 'rotate(-90deg)',
                color: productsMenuOpen && section === 'products' ? '#1976d2' : '#888',
                ml: 1
              }}
            />
          </ListItem>
          {section === 'products' && productsMenuOpen && (
                          <Box sx={{ pl: 3 }}>
                <List dense>
                <ListItem selected={productsSubsection === 'add'} onClick={() => { 
                  setSection('products'); 
                  setProductsSubsection('add'); 
                  setProductsMenuOpen(true);
                }} sx={{ cursor: 'pointer' }}>
                  <ListItemText primary="Добавить товар" />
                </ListItem>
                  <ListItem selected={productsSubsection === 'list'} onClick={() => { 
                    setSection('products'); 
                    setProductsSubsection('list'); 
                    setProductsMenuOpen(true);
                  }} sx={{ cursor: 'pointer' }}>
                    <ListItemText primary="Список товаров" />
                  </ListItem>
                  <ListItem selected={productsSubsection === 'import'} onClick={() => { 
                    setSection('products'); 
                    setProductsSubsection('import'); 
                    setProductsMenuOpen(true);
                  }} sx={{ cursor: 'pointer' }}>
                    <ListItemText primary="Массовый импорт" />
                  </ListItem>
              </List>
            </Box>
          )}
          {/* Отзывы с выпадающим меню */}
          <ListItem onClick={() => {
            setSection('reviews');
            setReviewsMenuOpen(o => !o);
          }} selected={section === 'reviews'} sx={{ cursor: 'pointer' }}>
            <ListItemText primary="Отзывы и вопросы" />
            <KeyboardArrowDown
              sx={{
                transition: 'transform 0.2s',
                transform: reviewsMenuOpen && section === 'reviews' ? 'rotate(0deg)' : 'rotate(-90deg)',
                color: reviewsMenuOpen && section === 'reviews' ? '#1976d2' : '#888',
                ml: 1
              }}
            />
          </ListItem>
          {section === 'reviews' && reviewsMenuOpen && (
            <Box sx={{ pl: 3 }}>
              <List dense>
                <ListItem selected={reviewsSubsection === 'shop'} onClick={() => { 
                              setSection('reviews'); 
            setReviewsSubsection('shop');
            setReviewsMenuOpen(true); 
                  setReviewsMenuOpen(true);
                }} sx={{ cursor: 'pointer' }}>
                  <ListItemText primary="Отзывы о магазине" />
                </ListItem>
                <ListItem selected={reviewsSubsection === 'product'} onClick={() => { 
                  setSection('reviews'); 
                  setReviewsSubsection('product'); 
                  setReviewsMenuOpen(true);
                }} sx={{ cursor: 'pointer' }}>
                  <ListItemText primary="Отзывы о товарах" />
                </ListItem>
                <ListItem selected={reviewsSubsection === 'questions'} onClick={() => { 
                  setSection('reviews'); 
                  setReviewsSubsection('questions'); 
                  setReviewsMenuOpen(true);
                }} sx={{ cursor: 'pointer' }}>
                  <ListItemText primary="Вопросы и ответы" />
                </ListItem>
              </List>
            </Box>
          )}
          {/* Остальные разделы */}
          {sections.filter(s => s.key !== 'products' && s.key !== 'reviews').map(s => (
            <ListItem key={s.key} selected={section===s.key} onClick={()=>{
              setSection(s.key); 
              setProductsMenuOpen(false);
              setProductsSubsection('list'); // Сбрасываем подраздел товаров
            }} sx={{ cursor: 'pointer' }}>
              <ListItemText primary={s.label} />
            </ListItem>
          ))}
        </List>
      </Box>
      {/* Убираем фиксированную высоту и overflow у правой части */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, p: 0 }}>
        {section === 'products' ? (
          productsSubsection === 'import' ? (
            <BulkImportProducts categories={dbCategories} />
          ) : (
            <CMSProducts 
          mode={productsSubsection} 
          editModalOpen={editModalOpen}
          setEditModalOpen={setEditModalOpen}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          dbCategories={dbCategories}
            />
          )
        ) :
         section === 'categories' ? <CMSCategories loadCategoriesFromAPI={loadCategoriesFromAPI} /> :
         section === 'orders' ? <CMSOrders /> :
         section === 'users' ? <AdminUsers /> :
         section === 'reviews' ? (
           reviewsSubsection === 'shop' ? <AdminShopReviews /> :
           reviewsSubsection === 'product' ? <AdminProductReviews /> :
           reviewsSubsection === 'questions' ? <AdminQuestions /> :
           <AdminShopReviews />
         ) : (
          <Box sx={{ p: 4 }}>
            {createHeader(sections.find(s=>s.key===section)?.label)}
            <Typography sx={{ color: '#888' }}>Здесь будет управление: {sections.find(s=>s.key===section)?.label}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
// Вынесем форму и таблицу в отдельные компоненты внутри CMSProducts
function CMSProducts({ mode, editModalOpen, setEditModalOpen, editingProduct, setEditingProduct, dbCategories }) {
  const { t } = useTranslation();
  const categories = dbCategories || categoriesData;
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [cmsSubcategories, setCmsSubcategories] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedProducts, setSelectedProducts] = React.useState([]);
  const [selectAll, setSelectAll] = React.useState(false);
  
  // Функция для получения названия категории
  const getCategoryName = (categoryValue) => {
    if (!categoryValue) return '';
    
    // Если это объект с полем name (из include)
    if (typeof categoryValue === 'object' && categoryValue.name) {
      return categoryValue.name;
    }
    
    // Если это ID, ищем по ID
    if (!isNaN(categoryValue)) {
      const category = categories.find(c => c.id === parseInt(categoryValue));
      return category ? category.name : categoryValue;
    }
    
    // Если это уже название, возвращаем как есть
    return categoryValue;
  };
  
  // Фильтрация товаров по поисковому запросу
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      searchInProductNames(product, searchQuery) ||
      product.article?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.country?.toLowerCase().includes(query) ||
      getCategoryName(product.category)?.toLowerCase().includes(query)
    );
  });
  
  const [form, setForm] = React.useState({ 
    name: '', 
    nameHe: '',
    description: '', 
    descriptionHe: '',
    price: '', 
    category: '', 
    subcategory: '', 
    quantity: '', 
    image: '', 
    article: '', 
    brand: '', 
    country: '', 
    length: '', 
    width: '', 
    height: '',
    ageGroup: '',
    gender: ''
  });

  React.useEffect(() => {
    fetchProducts();
  }, []);

  // Загружаем подкатегории при изменении категории
  React.useEffect(() => {
    if (form.category) {
      fetch(`${API_BASE_URL}/api/categories?parentId=${form.category}`)
        .then(res => res.json())
        .then(data => {
          setCmsSubcategories(data);
        })
        .catch(error => {
          console.error('Error loading subcategories:', error);
          setCmsSubcategories([]);
        });
    } else {
      setCmsSubcategories([]);
    }
  }, [form.category]);

  React.useEffect(() => {
    if (editingProduct) {
      setForm(editingProduct);
    } else {
      setForm({ 
        name: '', 
        nameHe: '',
        description: '', 
        descriptionHe: '',
        price: '', 
        category: '', 
        subcategory: '', 
        quantity: '', 
        article: '', 
        brand: '', 
        country: '', 
        length: '', 
        width: '', 
        height: '', 
        ageGroup: '',
        gender: '',
        images: [], 
        mainImageIndex: undefined 
      });
    }
  }, [editingProduct]);

  // Очистка URL объектов при размонтировании
  React.useEffect(() => {
    return () => {
      if (form.images) {
        Array.from(form.images).forEach(file => {
          URL.revokeObjectURL(URL.createObjectURL(file));
        });
      }
    };
  }, [form.images]);

  const handleOpenEdit = (product) => {
    // Добавляем callback функции к продукту
    const productWithCallbacks = {
      ...product,
      onSaveCallback: fetchProducts,
      onDeleteCallback: fetchProducts
    };
    setEditingProduct(productWithCallbacks);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditModalOpen(false);
  };
  
  // Простые обработчики как в форме категорий
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      const newFiles = Array.from(files);
      setForm(f => {
        const currentImages = f.images || [];
        // Фильтруем только новые файлы, исключая дубликаты
        const uniqueNewFiles = newFiles.filter(newFile => 
          !currentImages.some(existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size &&
            existingFile.lastModified === newFile.lastModified
          )
        );
        return {
          ...f, 
          images: [...currentImages, ...uniqueNewFiles],
          // Если это первое изображение, делаем его главным
          mainImageIndex: f.mainImageIndex === undefined && currentImages.length === 0 ? 0 : f.mainImageIndex
        };
      });
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleCategoryChange = e => {
    setForm(prev => ({ ...prev, category: e.target.value, subcategory: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    try {
      const formData = new FormData();
      
      // Добавляем все поля формы
      Object.keys(form).forEach(key => {
        if (form[key] !== '' && key !== 'images' && key !== 'mainImageIndex') {
          formData.append(key, form[key]);
        }
      });
      
      // Добавляем изображения
      if (form.images) {
        form.images.forEach((image, index) => {
          formData.append('images', image);
          // Если это главное изображение, добавляем специальный флаг
          if (index === form.mainImageIndex) {
            formData.append('mainImageIndex', index);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}` },
        body: formData
      });

      if (response.ok) {
        // Очищаем форму
        setForm({ 
          name: '', 
          nameHe: '',
          description: '', 
          descriptionHe: '',
          price: '', 
          category: '', 
          subcategory: '', 
          quantity: '', 
          article: '', 
          brand: '', 
          country: '', 
          length: '', 
          width: '', 
          height: '', 
          ageGroup: '',
          gender: '',
          images: [], 
          mainImageIndex: undefined 
        });
        // Перезагружаем товары с сервера
        fetchProducts();
    } else {
        console.error('Ошибка сохранения товара');
      }
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
    }
  };

  // Функция загрузки товаров с сервера
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?admin=true`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log('Попытка удаления товара с ID:', id);
    
    // Проверяем, есть ли токен
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
      return;
    }

    // Запрашиваем подтверждение удаления
    // Убираем подтверждение удаления - удаляем сразу
    // if (!window.confirm('Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.')) {
    //   return;
    // }

    try {
      console.log('Отправка запроса на удаление товара ID:', id);
      
      // Сначала проверим, существует ли товар
      const checkResponse = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!checkResponse.ok) {
        // Убираем alert - просто возвращаемся без уведомления
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Ответ сервера:', response.status, response.statusText);

      if (response.ok) {
        // Убираем alert - товар удаляется без уведомления
        fetchProducts();
      } else {
        let errorMessage = 'Неизвестная ошибка';
        try {
          const errorData = await response.json();
          console.error('Ошибка сервера:', errorData);
          errorMessage = errorData.error || errorData.message || 'Неизвестная ошибка';
        } catch (parseError) {
          console.error('Ошибка парсинга ответа сервера:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        // Оставляем alert только для ошибок
        alert(`Ошибка удаления товара: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      alert('Ошибка удаления товара. Проверьте подключение к серверу.');
    }
  };

  const handleToggleHidden = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/hidden`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
        },
        body: JSON.stringify({ isHidden: !product.isHidden })
      });
      if (response.ok) {
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(`Ошибка при изменении видимости товара: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      alert('Ошибка при изменении видимости товара');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;

    try {
      const formData = new FormData();
      
      // Добавляем все поля формы
      Object.keys(form).forEach(key => {
        if (form[key] !== '' && key !== 'images' && key !== 'mainImageIndex') {
          formData.append(key, form[key]);
        }
      });
      
      // Определяем язык ввода на основе содержимого полей
      const detectInputLanguage = (text) => {
        if (!text) return 'ru';
        // Простая эвристика для определения языка
        const hebrewPattern = /[\u0590-\u05FF]/; // Диапазон символов иврита
        return hebrewPattern.test(text) ? 'he' : 'ru';
      };
      
      const nameLanguage = detectInputLanguage(form.name);
      const descriptionLanguage = detectInputLanguage(form.description);
      const inputLanguage = nameLanguage === 'he' || descriptionLanguage === 'he' ? 'he' : 'ru';
      
      // Добавляем язык ввода для автоматического перевода
      formData.append('inputLanguage', inputLanguage);
      
      // Добавляем изображения
      if (form.images) {
        form.images.forEach((image, index) => {
          formData.append('images', image);
          // Если это главное изображение, добавляем специальный флаг
          if (index === form.mainImageIndex) {
            formData.append('mainImageIndex', index);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}` },
        body: formData
      });

      if (response.ok) {
        // Очищаем форму
        setForm({ 
          name: '', 
          nameHe: '',
          description: '', 
          descriptionHe: '',
          price: '', 
          category: '', 
          subcategory: '', 
          quantity: '', 
          article: '', 
          brand: '', 
          country: '', 
          length: '', 
          width: '', 
          height: '', 
          ageGroup: '',
          gender: '',
          images: [], 
          mainImageIndex: undefined 
        });
        // Перезагружаем товары с сервера
        fetchProducts();
      } else {
        console.error('Ошибка сохранения товара');
      }
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
    }
  };

  const handleClear = () => {
    // Очищаем URL объекты перед очисткой формы
    if (form.images) {
      Array.from(form.images).forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    }
    setForm({ name: '', nameHe: '', description: '', descriptionHe: '', price: '', category: '', subcategory: '', quantity: '', article: '', brand: '', country: '', length: '', width: '', height: '', images: [], mainImageIndex: undefined });
  };

  // Функции для мультивыбора
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
      setSelectAll(true);
    }
  };

  // Обновляем состояние selectAll при изменении выбранных товаров
  React.useEffect(() => {
    if (filteredProducts.length > 0) {
      const allSelected = filteredProducts.every(p => selectedProducts.includes(p.id));
      const someSelected = filteredProducts.some(p => selectedProducts.includes(p.id));
      
      if (allSelected) {
        setSelectAll(true);
      } else if (someSelected) {
        setSelectAll(false);
      } else {
        setSelectAll(false);
      }
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, filteredProducts]);

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (!window.confirm(`Вы уверены, что хотите удалить ${selectedProducts.length} товаров? Это действие нельзя отменить.`)) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
      return;
    }

    try {
      const deletePromises = selectedProducts.map(productId =>
        fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      const failed = results.length - successful;

      if (failed > 0) {
        alert(`Удалено ${successful} товаров. Не удалось удалить ${failed} товаров.`);
      } else {
        alert(`Успешно удалено ${successful} товаров.`);
      }

      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      alert('Ошибка при массовом удалении товаров.');
    }
  };

  const handleBulkToggleHidden = async (hide) => {
    if (selectedProducts.length === 0) return;
    
    const action = hide ? 'скрыть' : 'показать';
    if (!window.confirm(`Вы уверены, что хотите ${action} ${selectedProducts.length} товаров?`)) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
      return;
    }

    try {
      const togglePromises = selectedProducts.map(productId =>
        fetch(`${API_BASE_URL}/api/products/${productId}/hidden`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ isHidden: hide })
        })
      );

      const results = await Promise.allSettled(togglePromises);
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      const failed = results.length - successful;

      if (failed > 0) {
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} ${successful} товаров. Не удалось ${action} ${failed} товаров.`);
      } else {
        alert(`Успешно ${action} ${successful} товаров.`);
      }

      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (error) {
      console.error(`Ошибка массового ${action} товаров:`, error);
      alert(`Ошибка при массовом ${action} товаров.`);
    }
  };



  // Очищаем выбранные товары при изменении поискового запроса
  React.useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, [searchQuery]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }



  // Компонент таблицы
  const ProductList = () => {
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (productId) => {
      setImageErrors(prev => ({ ...prev, [productId]: true }));
    };

    return (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8, border: '1px solid #eee', width: '50px', textAlign: 'center' }} title="Выбрать все">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    size="small"
                    sx={{ padding: 0 }}
                  />
                  {selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length && (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                      {selectedProducts.length}
                    </Typography>
                  )}
                </Box>
              </th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Картинка</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '200px' }}>Название</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Цена</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '120px' }}>Категория</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '120px' }}>Подкатегория</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Кол-во</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '100px' }}>Артикул</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Статус</th>
              <th style={{ padding: 8, border: '1px solid #eee', width: '120px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                  <Checkbox
                    checked={selectedProducts.includes(p.id)}
                    onChange={() => handleSelectProduct(p.id)}
                    size="small"
                    sx={{ padding: 0 }}
                  />
                </td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                  {p.imageUrls && p.imageUrls.length > 0 && !imageErrors[p.id] ? (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        backgroundImage: `url(${getImageUrl(p.imageUrls[0])})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#f0f0f0',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        e.target.style.backgroundImage = 'url(/photography.jpg)';
                        handleImageError(p.id);
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        backgroundImage: 'url(/photography.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#f0f0f0',
                        margin: '0 auto'
                      }}
                    />
                  )}
                </td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word', wordBreak: 'break-word', maxWidth: '200px' }}>{p.name}</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{p.price} ₪</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{getCategoryName(p.category)}</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{p.subcategory?.name || p.subcategory || ''}</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{p.quantity}</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{p.article}</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                  {p.isHidden ? (
                    <span style={{ color: '#f57c00', fontWeight: 'bold' }}>Скрыт</span>
                  ) : (
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Видим</span>
                  )}
                </td>
                <td style={{ padding: 8, border: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenEdit(p)} 
                        sx={{ 
                          color: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#e3f2fd'
                          }
                        }}
                        title="Редактировать"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          console.log('Клик по кнопке удаления для товара:', p);
                          console.log('ID товара:', p.id, 'Тип ID:', typeof p.id);
                          handleDelete(p.id);
                        }}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: '#ffebee'
                          }
                        }}
                        title="Удалить"
                      >
                        <Delete />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleToggleHidden(p)}
                        sx={{ 
                          color: p.isHidden ? '#4caf50' : '#ff9800',
                          '&:hover': {
                            backgroundColor: p.isHidden ? '#e8f5e8' : '#fff3e0'
                          }
                        }}
                        title={p.isHidden ? 'Показать' : 'Скрыть'}
                      >
                        {p.isHidden ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };
  // Выбор отображения
  if (mode === 'add') {
    return (
      <Box sx={{ width: '100%', maxWidth: 840, background: '#fff', p: 3, borderRadius: 3, boxShadow: 2, mb: 4, mt: 4, mx: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Добавить товар
        </Typography>
        

        
        <Box component="form" onSubmit={async (e) => { e.preventDefault(); await handleSave(); }}>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Название (русский)" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            fullWidth 
            required 
            variant="outlined"
            size="medium"
          />
          <TextField 
            label="Название (иврит)" 
            name="nameHe" 
            value={form.nameHe} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined"
            size="medium"
          />
          <TextField 
            label="Описание (русский)" 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            minRows={2} 
            variant="outlined"
            size="medium"
          />
          <TextField 
            label="Описание (иврит)" 
            name="descriptionHe" 
            value={form.descriptionHe} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            minRows={2} 
            variant="outlined"
            size="medium"
          />
          <TextField 
            label="Цена" 
            name="price" 
            value={form.price} 
            onChange={handleChange} 
            type="number" 
            fullWidth 
            required 
            variant="outlined"
            size="medium"
          />
          <FormControl fullWidth>
            <InputLabel id="category-label">Категория</InputLabel>
            <Select 
              labelId="category-label" 
              label="Категория" 
              name="category" 
              value={form.category} 
              onChange={handleCategoryChange} 
              renderValue={selected => selected ? (categories.find(c => c.id === parseInt(selected))?.name || selected) : 'Выберите категорию'}
            >
              {categories.filter(c => !c.parentId).map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth disabled={!form.category}>
            <InputLabel id="subcategory-label">Подкатегория</InputLabel>
            <Select 
              labelId="subcategory-label" 
              label="Подкатегория" 
              name="subcategory" 
              value={form.subcategory} 
              onChange={handleChange} 
              renderValue={selected => selected ? (cmsSubcategories.find(sub => sub.id === selected)?.name || selected) : 'Выберите подкатегорию'}
            >
              {cmsSubcategories.map(sub => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)}
            </Select>
          </FormControl>
          {/* Добавлено: возрастная группа и пол */}
          <FormControl fullWidth>
            <InputLabel id="age-group-label">Возрастная группа</InputLabel>
            <Select
              labelId="age-group-label"
              label="Возрастная группа"
              name="ageGroup"
              value={form.ageGroup}
              onChange={handleChange}
            >
              <MenuItem value=""><em>Не выбрано</em></MenuItem>
              <MenuItem value="0-1 год">0-1 год</MenuItem>
              <MenuItem value="1-3 года">1-3 года</MenuItem>
              <MenuItem value="3-5 лет">3-5 лет</MenuItem>
              <MenuItem value="5-7 лет">5-7 лет</MenuItem>
              <MenuItem value="7-10 лет">7-10 лет</MenuItem>
              <MenuItem value="10-12 лет">10-12 лет</MenuItem>
              <MenuItem value="12-14 лет">12-14 лет</MenuItem>
              <MenuItem value="14-16 лет">14-16 лет</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="gender-label">Пол</InputLabel>
            <Select
              labelId="gender-label"
              label="Пол"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <MenuItem value=""><em>Не выбрано</em></MenuItem>
                                      <MenuItem value="Для мальчиков">Для мальчиков</MenuItem>
                        <MenuItem value="Для девочек">Для девочек</MenuItem>
              <MenuItem value="Универсальный">Универсальный</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label="Количество" 
            name="quantity" 
            value={form.quantity} 
            onChange={handleChange} 
            type="number" 
            fullWidth 
            required 
            variant="outlined"
            size="medium"
          />
          <TextField 
            label="Артикул" 
            name="article" 
            value={form.article} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined"
            size="medium"
          />
          <TextField 
            label="Бренд" 
            name="brand" 
            value={form.brand} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined"
            size="medium"
          />
          <TextField 
            label="Страна" 
            name="country" 
            value={form.country} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined"
            size="medium"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Длина (см)" 
              name="length" 
              value={form.length} 
              onChange={handleChange} 
              type="number" 
              fullWidth 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Ширина (см)" 
              name="width" 
              value={form.width} 
              onChange={handleChange} 
              type="number" 
              fullWidth 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Высота (см)" 
              name="height" 
              value={form.height} 
              onChange={handleChange} 
              type="number" 
              fullWidth 
              variant="outlined"
              size="medium"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Изображения товара
            </Typography>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                background: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                '&:hover': {
                  borderColor: '#4FC3F7',
                  background: '#f0f8ff'
                }
              }}
              onClick={() => document.getElementById('image-upload').click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#4FC3F7';
                e.currentTarget.style.background = '#f0f8ff';
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.background = '#fafafa';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.background = '#fafafa';
                
                const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                if (files.length > 0) {
                  const currentImages = form.images || [];
                  // Фильтруем только новые файлы, исключая дубликаты
                  const newFiles = files.filter(newFile => 
                    !currentImages.some(existingFile => 
                      existingFile.name === newFile.name && 
                      existingFile.size === newFile.size &&
                      existingFile.lastModified === newFile.lastModified
                    )
                  );
                  if (newFiles.length > 0) {
                    const newImages = [...currentImages, ...newFiles];
                    setForm(prev => ({ 
                      ...prev, 
                      images: newImages,
                      // Если это первое изображение, делаем его главным
                      mainImageIndex: prev.mainImageIndex === undefined ? 0 : prev.mainImageIndex
                    }));
                  }
                }
              }}
              onDragStart={(e) => {
                // Предотвращаем перетаскивание самой зоны
                e.preventDefault();
                return false;
              }}
            >
              <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography sx={{ color: '#666', mb: 1 }}>
                Перетащите изображения сюда или нажмите для выбора
              </Typography>
              <Typography variant="caption" sx={{ color: '#999', mb: 1 }}>
                Поддерживаются форматы: JPG, PNG, GIF, WEBP
              </Typography>
              <Typography variant="caption" sx={{ color: '#FFB300', fontWeight: 'bold' }}>
                💡 Кликните на изображение, чтобы сделать его главным
              </Typography>
              <input
                id="image-upload"
                type="file"
                name="images"
                accept="image/*"
                multiple
                hidden
                onChange={handleChange}
              />
        </Box>
            
            {form.images && form.images.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ mb: 2, fontSize: 14, color: '#666', fontWeight: 'bold' }}>
                  Выбрано изображений: {form.images.length}
                  {form.mainImageIndex !== undefined && (
                    <span style={{ color: '#FFB300', marginLeft: 8 }}>
                      • Главное изображение: {form.mainImageIndex + 1}
                    </span>
                  )}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2,
                    minHeight: 120,
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    p: 2,
                    background: '#fafafa',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#4FC3F7';
                    e.currentTarget.style.background = '#f0f8ff';
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.background = '#fafafa';
                    
                    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                    if (files.length > 0) {
                      const currentImages = form.images || [];
                      // Фильтруем только новые файлы, исключая дубликаты
                      const newFiles = files.filter(newFile => 
                        !currentImages.some(existingFile => 
                          existingFile.name === newFile.name && 
                          existingFile.size === newFile.size &&
                          existingFile.lastModified === newFile.lastModified
                        )
                      );
                      if (newFiles.length > 0) {
                        const newImages = [...currentImages, ...newFiles];
                        setForm(prev => ({ 
                          ...prev, 
                          images: newImages,
                          // Если это первое изображение, делаем его главным
                          mainImageIndex: prev.mainImageIndex === undefined ? 0 : prev.mainImageIndex
                        }));
                      }
                    }
                  }}
                  onDragStart={(e) => {
                    // Предотвращаем перетаскивание контейнера
                    e.preventDefault();
                    return false;
                  }}
                >
                  {Array.from(form.images).map((file, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        position: 'relative',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                      onDragStart={(e) => {
                        // Предотвращаем перетаскивание контейнера изображения
                        e.preventDefault();
                        return false;
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: form.mainImageIndex === index ? '3px solid #FFB300' : '2px solid #e0e0e0',
                          cursor: 'pointer',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                        onError={(e) => {
                          e.target.src = '/toys.png';
                          e.target.onerror = null;
                        }}
                        onClick={() => {
                          // При клике на изображение делаем его главным
                          setForm(prev => ({ ...prev, mainImageIndex: index }));
                        }}
                        onDragStart={(e) => {
                          // Предотвращаем перетаскивание изображений
                          e.preventDefault();
                          return false;
                        }}
                        draggable={false}
                      />
                      {/* Звездочка для главного изображения */}
                      {form.mainImageIndex === index && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            left: -8,
                            background: '#FFB300',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3,
                            boxShadow: '0 2px 8px rgba(255,179,0,0.3)',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.1)' },
                              '100%': { transform: 'scale(1)' }
                            }
                          }}
                          title="Главное изображение"
                        >
                          <Star sx={{ fontSize: 14, color: '#fff' }} />
                        </Box>
                      )}
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: '#fff',
                          borderRadius: '50%',
                          p: 0.5,
                          zIndex: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '&:hover': { 
                            background: '#ffeaea',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => {
                          const newImages = Array.from(form.images).filter((_, i) => i !== index);
                          setForm(prev => ({ 
                            ...prev, 
                            images: newImages,
                            // Если удаляем главное изображение, сбрасываем индекс
                            mainImageIndex: prev.mainImageIndex === index ? undefined : 
                                           prev.mainImageIndex > index ? prev.mainImageIndex - 1 : prev.mainImageIndex
                          }));
                        }}
                      >
                        <CloseIcon fontSize="small" sx={{ color: '#e57373' }} />
                      </IconButton>
                      <Typography variant="caption" sx={{ 
                        display: 'block', 
                        textAlign: 'center', 
                        mt: 0.5, 
                        color: form.mainImageIndex === index ? '#FFB300' : '#666',
                        fontSize: '0.7rem',
                        fontWeight: form.mainImageIndex === index ? 'bold' : 'normal'
                      }}>
                        {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => document.getElementById('image-upload').click()}
                    startIcon={<AddIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 15,
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      border: '1px solid #ff6600',
                      boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
                      minWidth: 120,
                      height: 44,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff8533 0%, #ff6600 100%)',
                        boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: '#ccc',
                        color: '#666',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Добавить еще изображения
                  </Button>
                  {form.mainImageIndex !== undefined && (
                    <Button 
                      variant="outlined" 
                      onClick={() => setForm(prev => ({ ...prev, mainImageIndex: undefined }))}
                      startIcon={<Star />}
                      sx={{
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 15,
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        border: '1px solid #ff9800',
                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                        minWidth: 120,
                        height: 44,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          background: '#ccc',
                          color: '#666',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Сбросить главное
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={handleClear} 
              variant="outlined"
              sx={{
                background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                border: '1px solid #e53e3e',
                boxShadow: '0 2px 8px rgba(229, 62, 62, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #c53030 0%, #a52a2a 100%)',
                  boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  color: '#666',
                  boxShadow: 'none'
                }
              }}
            >
              Очистить форму
            </Button>
          </Box>
          <Button 
            type="submit" 
            variant="contained" 
            size="medium"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              minWidth: 120,
              height: 44,
              '&:hover': {
                background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666',
                boxShadow: 'none'
              }
            }}
          >
            Сохранить товар
          </Button>
        </Box>
        </Box>
      </Box>
  );
  }
  if (mode === 'list') {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Поисковая строка */}
        <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}>
          <TextField
            fullWidth
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
          {searchQuery && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Найдено товаров: {filteredProducts.length} из {products.length}
            </Typography>
          )}
        </Box>

        {/* Панель массовых действий */}
        {selectedProducts.length > 0 && (
          <Box sx={{ mb: 2, p: 2, background: '#e3f2fd', borderRadius: 2, border: '1px solid #1976d2' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Выбрано товаров: {selectedProducts.length}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleBulkToggleHidden(false)}
                startIcon={<Visibility />}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2,
                  py: 1,
                  height: 36,
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
                Показать все
              </Button>
              <Button
                variant="contained"
                onClick={() => handleBulkToggleHidden(true)}
                startIcon={<VisibilityOff />}
                sx={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2,
                  py: 1,
                  height: 36,
                  boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                  textTransform: 'none',
                  minWidth: 120,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                }}
              >
                Скрыть все
              </Button>
              <Button
                variant="contained"
                onClick={handleBulkDelete}
                startIcon={<Delete />}
                sx={{
                  background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2,
                  py: 1,
                  height: 36,
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                  textTransform: 'none',
                  minWidth: 120,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ef5350 0%, #f44336 100%)',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                }}
              >
                Удалить все
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedProducts([]);
                  setSelectAll(false);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2,
                  py: 1,
                  height: 36,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textTransform: 'none',
                  minWidth: 120,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  }
                }}
              >
                Отменить выбор
              </Button>
            </Box>
          </Box>
        )}
        
        <ProductList />
      </Box>
    );
  }
  return null;
}

// Глобальная функция getCategoryIcon
const getCategoryIcon = (category) => {
  console.log('getCategoryIcon called with:', category);
  
  if (!category) {
    console.log('No category provided, returning default');
    return `${API_BASE_URL}/public/toys.png?t=${Date.now()}`;
  }
  
  // Если есть загруженное изображение, используем его
  if (category.image && /^175\d+/.test(category.image)) {
    const url = `${API_BASE_URL}/uploads/${category.image}?t=${Date.now()}`;
    console.log('Returning uploads URL:', url);
    return url;
  }
  
  // Если есть изображение, но это не загруженный файл, используем его
  if (category.image) {
    const url = `${API_BASE_URL}/public/${category.image}?t=${Date.now()}`;
    console.log('Returning public URL:', url);
    return url;
  }
  
  // Fallback иконки для разных категорий
  const fallbackIcons = {
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
  
  const fallbackIcon = fallbackIcons[category.name] || '/toys.png';
  console.log(`No image for category "${category.name}", using fallback: ${fallbackIcon}`);
  return `${API_BASE_URL}/public${fallbackIcon}?t=${Date.now()}`;
};
function CMSCategories({ loadCategoriesFromAPI }) {
  console.log('CMSCategories RENDER - Component is loading');
  
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState([]); // id категорий с раскрытыми подкатегориями
  const [form, setForm] = React.useState({ type: 'category', parent: '', name: '', icon: null });
  const [editForm, setEditForm] = React.useState({ id: null, name: '', parent: '', icon: null });
  const [isEditing, setIsEditing] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState({ open: false, id: null, name: '' });
  const fileInputRef = React.useRef();
  const editFileInputRef = React.useRef();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Drag & Drop сенсоры
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Загрузка категорий с сервера (только /api/categories)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      console.log('CMSCategories fetchCategories - received data:', data);
  
      setCategories(data);
    } catch (e) {
      console.error('CMSCategories fetchCategories - error:', e);
      setCategories([]);
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchCategories(); }, []);

  // Обработчик завершения drag & drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const activeCategory = categories.find(cat => cat.id === active.id);
      const overCategory = categories.find(cat => cat.id === over.id);
      
      if (!activeCategory || !overCategory) return;
      
      // Проверяем, что перетаскиваемые категории находятся на одном уровне
      if (activeCategory.parentId !== overCategory.parentId) {
        console.log('Можно перетаскивать только категории одного уровня');
        return;
      }
      
      // Получаем категории того же уровня
      const sameLevelCategories = categories.filter(cat => cat.parentId === activeCategory.parentId);
      
      // Находим индексы в массиве категорий того же уровня
      const oldIndex = sameLevelCategories.findIndex(cat => cat.id === active.id);
      const newIndex = sameLevelCategories.findIndex(cat => cat.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Переупорядочиваем категории того же уровня
        const reorderedSameLevel = arrayMove(sameLevelCategories, oldIndex, newIndex);
        
        // Обновляем общий массив категорий
        const newCategories = categories.map(cat => {
          const reorderedCat = reorderedSameLevel.find(rc => rc.id === cat.id);
          return reorderedCat || cat;
        });
        
        // Сначала обновляем состояние локально для мгновенного отклика
        setCategories(newCategories);
        
        try {
          // Отправляем категории того же уровня в API
          const sameLevelCategoryIds = reorderedSameLevel.map(cat => cat.id);
          
          const response = await fetch(`${API_BASE_URL}/api/categories/reorder`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              categoryIds: sameLevelCategoryIds
            })
          });
          
          if (response.ok) {
            // Принудительно обновляем категории с сервера
            await fetchCategories();
            // Обновляем только боковое меню, если нужно
            if (loadCategoriesFromAPI) {
              await loadCategoriesFromAPI();
            }
          } else {
            console.error('Reorder failed:', response.status);
            // В случае ошибки возвращаем исходный порядок
            fetchCategories();
          }
        } catch (error) {
          console.error('Error during reorder:', error);
          // В случае ошибки возвращаем исходный порядок
          fetchCategories();
        }
      }
    }
  };

  // Построить дерево категорий
  const buildTree = (cats) => {
    // Фильтруем категории без id
    const validCats = cats.filter(cat => cat && cat.id);
    
    const map = {};
    validCats.forEach(cat => { map[cat.id] = { ...cat, sub: [] }; });
    const tree = [];
    validCats.forEach(cat => {
      if (cat.parentId) {
        if (map[cat.parentId]) map[cat.parentId].sub.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });
    // Сортируем корневые категории по полю order
    tree.sort((a, b) => (a.order || 0) - (b.order || 0));

    return tree;
  };
  const tree = buildTree(categories);

  // Раскрытие/сворачивание
  const handleExpand = id => {
    setExpanded(exp => exp.includes(id) ? exp.filter(e => e !== id) : [...exp, id]);
  };

  // Отключение категории
  const handleToggleActive = async (cat) => {
    try {
      console.log('Frontend: Toggle категории:', cat.name, 'ID:', cat.id);
      
      const response = await fetch(`${API_BASE_URL}/api/categories/${cat.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const updatedCategory = await response.json();
        console.log('Frontend: Категория обновлена:', updatedCategory);
        
        // Обновляем состояние локально используя данные с сервера
        setCategories(prevCategories => 
          prevCategories.map(category => 
            category.id === cat.id 
              ? { ...category, active: updatedCategory.active }
              : category
          )
        );
        
        // Обновляем только боковое меню, если нужно
        if (loadCategoriesFromAPI) {
          await loadCategoriesFromAPI();
        }
      } else {
        console.error('Failed to toggle category');
      }
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };
  // Показать диалог подтверждения удаления
  const handleDelete = (id) => {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      setDeleteDialog({ open: true, id: id, name: category.name });
    }
  };

  // Подтверждение удаления категории
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${deleteDialog.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        // Обновляем состояние локально
        setCategories(prevCategories => 
          prevCategories.filter(category => category.id !== deleteDialog.id)
        );
        
        // Обновляем только боковое меню, если нужно
        if (loadCategoriesFromAPI) {
          await loadCategoriesFromAPI();
        }
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };
  // Редактирование категории
  const handleEdit = id => {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      setEditForm({
        id: category.id,
        name: category.name,
        parent: category.parentId || '',
        icon: null
      });
      setIsEditing(true);
      setEditDialogOpen(true);
    }
  };

  // Обработка изменений в форме редактирования
  const handleEditFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'icon') {
      setEditForm(f => ({ ...f, icon: files[0] }));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };

  // Сохранение изменений категории
  const handleEditSubmit = async e => {
    e.preventDefault();
    if (!editForm.name) return;

    // Сохраняем данные формы до сброса
    const formDataToSend = new FormData();
    formDataToSend.append('name', editForm.name);
    if (editForm.icon) {
      formDataToSend.append('image', editForm.icon);
    }
    if (editForm.parent !== '') {
      formDataToSend.append('parentId', editForm.parent);
    }

    // Сохраняем ID категории до сброса формы
    const categoryId = editForm.id;
    console.log('Frontend: Начинаем обновление категории с ID:', categoryId);

    // Сразу закрываем диалог и сбрасываем форму
    setEditForm({ id: null, name: '', parent: '', icon: null });
    setIsEditing(false);
    setEditDialogOpen(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';

    try {
      // Отправляем запрос на обновление
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления категории');
      }

      const updatedCategory = await response.json();
      console.log('Frontend: Категория обновлена:', updatedCategory);
      console.log('Frontend: Новое изображение:', updatedCategory.image);
      
      // Обновляем состояние локально используя данные с сервера
      setCategories(prevCategories => {
        console.log('Frontend: Обновляем состояние категорий');
        console.log('Frontend: Ищем категорию с ID:', categoryId);
        console.log('Frontend: Доступные категории:', prevCategories.map(c => ({ id: c.id, name: c.name })));
        
        return prevCategories.map(category => 
          category.id === categoryId 
            ? { 
                ...category, 
                name: updatedCategory.name, 
                parentId: updatedCategory.parentId,
                image: updatedCategory.image,
                active: updatedCategory.active
              }
            : category
        );
      });
      
      // Обновляем боковое меню асинхронно
      if (loadCategoriesFromAPI) {
        setTimeout(() => {
          loadCategoriesFromAPI();
        }, 100);
      }
      
      // Принудительно обновляем состояние для немедленного отображения изменений
      setCategories(prevCategories => [...prevCategories]);
      
      // Добавляем задержку для гарантии обновления изображения
      setTimeout(() => {
        console.log('Frontend: Финальное обновление UI через 500ms');
        setCategories(prevCategories => [...prevCategories]);
      }, 500);
      
    } catch (error) {
      console.error('Ошибка обновления категории:', error);
      alert('Ошибка при обновлении категории');
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditForm({ id: null, name: '', parent: '', icon: null });
    setIsEditing(false);
    setEditDialogOpen(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };
  // Форма добавления
  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'icon') setForm(f => ({ ...f, icon: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  };
  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!form.name) return;
    
    try {
    const formData = new FormData();
    formData.append('name', form.name);
    if (form.icon) formData.append('image', form.icon);
    if (form.type === 'subcategory' && form.parent) {
      formData.append('parentId', form.parent);
    }
      
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` },
      body: formData
    });
      
      if (response.ok) {
    setForm({ type: 'category', parent: '', name: '', icon: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Получаем новую категорию из ответа сервера
    const newCategory = await response.json();
    
    // Добавляем новую категорию в состояние локально
    setCategories(prevCategories => [...prevCategories, newCategory]);
    
    // Обновляем только боковое меню, если нужно
    if (loadCategoriesFromAPI) {
      await loadCategoriesFromAPI();
    }
      } else {
        console.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Box>;

  // Компонент для drag & drop категории
  const SortableCategoryItem = ({ cat, isRoot = false }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: cat.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Box
        ref={setNodeRef}
        style={style}
        sx={{
          border: '1px solid #eee',
          borderRadius: 3,
          mb: 2,
          background: '#fff',
          p: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        {/* DragIndicator для всех элементов */}
        <span {...attributes} {...listeners} style={{ display: 'flex' }}>
          <DragIndicator
            sx={{
              color: '#ccc',
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
            }}
          />
        </span>
        {cat.sub.length > 0 && (
          <IconButton onClick={e => { e.stopPropagation(); handleExpand(cat.id); }} data-no-drag>
            {expanded.includes(cat.id) ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        )}
        {cat.parentId == null && (
          <img src={getCategoryIcon(cat)} alt="icon" style={{ width: 32, height: 32, marginLeft: '4px', marginRight: 12, borderRadius: 0, objectFit: 'cover' }} />
        )}
        <Typography sx={{ fontWeight: 500, flex: 1 }}>{cat.name}</Typography>
        <Switch
          checked={!!cat.active}
          onClick={e => { e.stopPropagation(); }}
          onChange={() => handleToggleActive(cat)}
          color="success"
          inputProps={{ 'aria-label': 'Включена/Отключена' }}
          sx={{ mr: 2 }}
          data-no-drag
        />
        <IconButton 
          size="small" 
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleEdit(cat.id);
          }}
          sx={{ 
            color: '#1976d2',
            '&:hover': {
              backgroundColor: '#e3f2fd'
            }
          }}
          title="Редактировать"
          data-no-drag
        >
          <Edit />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(cat.id);
          }}
          sx={{ 
            color: '#f44336',
            '&:hover': {
              backgroundColor: '#ffebee'
            }
          }}
          title="Удалить"
          data-no-drag
        >
          <Delete />
        </IconButton>
      </Box>
    );
  };

  // Рекурсивный рендер дерева категорий
  const renderCategory = cat => {
    // Проверяем, что у категории есть id
    if (!cat || !cat.id) {
      console.warn('Category without id:', cat);
      return null;
    }
    
    return (
      <React.Fragment key={cat.id}>
        <SortableCategoryItem cat={cat} isRoot={!cat.parentId} />
        {/* Подкатегории */}
        {cat.sub && cat.sub.length > 0 && expanded.includes(cat.id) && (
          <Box sx={{ ml: 6, mb: 2 }}>
            {cat.sub.map(renderCategory)}
          </Box>
        )}
      </React.Fragment>
    );
  };

  // Функция для получения всех категорий в плоском виде для drag & drop
  const getAllCategories = (cats) => {
    let result = [];
    cats.forEach(cat => {
      if (cat && cat.id) {
        result.push(cat);
        if (cat.sub && cat.sub.length > 0) {
          result = result.concat(getAllCategories(cat.sub));
        }
      }
    });
    return result;
  };
  return (
    <Box sx={{ mt: 0, minHeight: 400, py: 4, px: { xs: 0, md: 0 } }}>
      <Box sx={{
        background: '#fff',
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        p: { xs: 2, md: 4 },
        maxWidth: 1100,
        minWidth: 1100,
        minHeight: 320,
        margin: '0 auto',
        mt: 0,
      }}>
        {/* Красивая шапка */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Category color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 1 }}>
              Управление категориями
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Создание и редактирование структуры категорий магазина
            </Typography>
          </Box>
        </Box>

        {/* Статистика категорий */}
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e9ecef' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#495057' }}>
            Статистика категорий
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                {categories.filter(cat => !cat.parentId).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Основных категорий
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                {categories.filter(cat => cat.parentId).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Подкатегорий
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffc107' }}>
                {categories.filter(cat => cat.active).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Активных категорий
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc3545' }}>
                {categories.filter(cat => !cat.active).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Неактивных
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Разделитель */}
        <Box sx={{ mb: 4, height: 1, background: 'linear-gradient(90deg, transparent, #e0e0e0, transparent)' }} />

        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#495057' }}>Структура категорий</Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={getAllCategories(tree).map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ mb: 4 }}>
            {tree.map(renderCategory)}
          </Box>
        </SortableContext>
      </DndContext>

      {/* Форма добавления */}
      <Box component="form" onSubmit={handleFormSubmit} sx={{ 
        background: '#f8f9fa', 
        p: 4, 
        borderRadius: 3, 
        border: '1px solid #e9ecef',
        mt: 4
      }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#495057' }}>Добавить категорию / подкатегорию</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="type-label">Тип</InputLabel>
          <Select labelId="type-label" name="type" value={form.type} label="Тип" onChange={handleFormChange}>
            <MenuItem value="category">Категория</MenuItem>
            <MenuItem value="subcategory">Подкатегория</MenuItem>
                </Select>
              </FormControl>
        {form.type === 'subcategory' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="parent-label">Родительская категория</InputLabel>
            <Select labelId="parent-label" name="parent" value={form.parent} label="Родительская категория" onChange={handleFormChange}>
              {categories.filter(cat => !cat.parentId).map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                </Select>
              </FormControl>
        )}
        <TextField label="Название" name="name" value={form.name} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} required />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Button 
            variant="outlined" 
            component="label"
            sx={{
              background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              border: '1px solid #ff6600',
              boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
              minWidth: 120,
              height: 44,
              '&:hover': {
                background: 'linear-gradient(135deg, #ff8533 0%, #ff6600 100%)',
                boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666',
                boxShadow: 'none'
              }
            }}
          >
            Загрузить иконку
            <input ref={fileInputRef} type="file" name="icon" accept="image/*" hidden onChange={handleFormChange} />
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              minWidth: 120,
              height: 44,
              '&:hover': {
                background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666',
                boxShadow: 'none'
              }
            }}
          >
            Сохранить
          </Button>
        </Box>
        {form.icon && <Typography sx={{ mb: 2, fontSize: 14, color: '#888' }}>{form.icon.name}</Typography>}
              </Box>

      {/* Диалог редактирования */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCancelEdit} 
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 500,
            maxWidth: 600
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#333',
          borderBottom: '2px solid #f0f0f0',
          mb: 2
        }}>
          Редактировать категорию
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-parent-label">Родительская категория</InputLabel>
              <Select 
                labelId="edit-parent-label" 
                name="parent" 
                value={editForm.parent} 
                label="Родительская категория" 
                onChange={handleEditFormChange}
              >
                <MenuItem value="">Без родительской категории</MenuItem>
                {categories.filter(cat => !cat.parentId && cat.id !== editForm.id).map(cat => 
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField 
              label="Название" 
              name="name" 
              value={editForm.name} 
              onChange={handleEditFormChange} 
              fullWidth 
              sx={{ mb: 2 }} 
              required 
            />
            <Button 
              variant="outlined" 
              component="label" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                border: '1px solid #ff6600',
                boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff8533 0%, #ff6600 100%)',
                  boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  color: '#666',
                  boxShadow: 'none'
                }
              }}
            >
              Загрузить новую иконку
              <input ref={editFileInputRef} type="file" name="icon" accept="image/*" hidden onChange={handleEditFormChange} />
            </Button>
            {editForm.icon && <Typography sx={{ mb: 2, fontSize: 14, color: '#888' }}>{editForm.icon.name}</Typography>}

            </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
          <Button 
            onClick={handleCancelEdit} 
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              minWidth: 120,
              height: 44,
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                transform: 'translateY(-1px)'
              },
              cursor: 'pointer',
            }}
            variant="contained"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              minWidth: 120,
              height: 44,
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-1px)'
              },
              cursor: 'pointer',
            }}
            variant="contained"
          >
            Сохранить изменения
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#d32f2f',
          borderBottom: '2px solid #ffebee',
          mb: 2
        }}>
          Удалить категорию "{deleteDialog.name}"?
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Внимание! Это действие нельзя отменить.
            </Typography>
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 2, color: '#666', lineHeight: 1.5 }}>
            Вы действительно хотите удалить категорию "{deleteDialog.name}"?
          </Typography>
          
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              При удалении категории также будут удалены все её подкатегории и связанные товары.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              minWidth: 0,
              height: 32,
              borderRadius: 6,
              px: 2,
              lineHeight: '32px',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              boxShadow: '0 2px 4px rgba(244, 67, 54, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
              },
              cursor: 'pointer',
            }}
            variant="contained"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              minWidth: 0,
              height: 32,
              borderRadius: 6,
              px: 2,
              lineHeight: '32px',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              boxShadow: '0 2px 4px rgba(244, 67, 54, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
              },
              cursor: 'pointer',
            }}
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
// Компонент управления заказами в CMS
function CMSOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = React.useState(false);
  const orderDetailsContentRef = React.useRef(null);
  const orderDetailsLenisRef = React.useRef(null);

  // Загрузка заказов
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  // Блокировка прокрутки фона при открытии диалога
  React.useEffect(() => {
    if (orderDetailsOpen) {
      // Блокируем прокрутку body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Добавляем обработчик для предотвращения прокрутки фона
      const preventScroll = (e) => {
        if (orderDetailsContentRef.current?.contains(e.target)) {
          return; // Разрешаем прокрутку внутри модального окна
        }
        
        e.preventDefault();
        e.stopPropagation();
      };
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    } else {
      // Восстанавливаем прокрутку
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      // Очистка при размонтировании
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [orderDetailsOpen]);

  // Инициализация Lenis для диалога деталей заказа
  React.useEffect(() => {
    if (orderDetailsOpen) {
      // Добавляем небольшую задержку для гарантии готовности DOM
      const initLenis = () => {
        if (orderDetailsContentRef.current) {
          // Уничтожаем предыдущий экземпляр Lenis
          if (orderDetailsLenisRef.current) {
            orderDetailsLenisRef.current.destroy();
            orderDetailsLenisRef.current = null;
          }

          // Инициализируем новый экземпляр Lenis для прокрутки внутри диалога
          orderDetailsLenisRef.current = new Lenis({
            wrapper: orderDetailsContentRef.current,
            duration: 1.2,
            smooth: true,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            syncTouch: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
          });

          // Функция для анимации кадров
          function raf(time) {
            orderDetailsLenisRef.current?.raf(time);
            if (orderDetailsOpen) requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);

        } else {
          // Если элемент еще не готов, пробуем еще раз через 100мс
          setTimeout(initLenis, 100);
        }
      };

      initLenis();
    } else {
      // Уничтожаем Lenis при закрытии диалога
      if (orderDetailsLenisRef.current) {
        orderDetailsLenisRef.current.destroy();
        orderDetailsLenisRef.current = null;
      }
    }

    // Очистка при размонтировании
    return () => {
      if (orderDetailsLenisRef.current) {
        orderDetailsLenisRef.current.destroy();
        orderDetailsLenisRef.current = null;
      }
    };
  }, [orderDetailsOpen]);

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.id.toString().includes(searchQuery) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchOrders(); // Перезагружаем заказы
        
        // Немедленно обновляем счетчик уведомлений
        setTimeout(() => {
          // Вызываем функцию обновления счетчика уведомлений из Navigation
          const event = new CustomEvent('updateNotificationsCount');
          window.dispatchEvent(event);
        }, 1000); // Небольшая задержка для создания уведомления
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Удаление заказа
  const deleteOrder = async (orderId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        }
      });
      
      if (response.ok) {
        fetchOrders(); // Перезагружаем заказы
      } else {
        console.error('Error deleting order:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'ready': return '#9c27b0';
      case 'pickedup': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  // Получение градиента статуса
  const getStatusGradient = (status) => {
    switch (status) {
      case 'pending': return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
      case 'confirmed': return 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)';
      case 'ready': return 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)';
      case 'pickedup': return 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
      case 'cancelled': return 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)';
      default: return 'linear-gradient(135deg, #666 0%, #999 100%)';
    }
  };

  // Получение текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтвержден';
      case 'ready': return 'Готов к выдаче';
      case 'pickedup': return 'Получен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return `${price} ₪`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 0, minHeight: 400, py: 4, px: { xs: 0, md: 0 } }}>
      <Box sx={{
        background: '#fff',
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        p: { xs: 2, md: 4 },
        maxWidth: 1100,
        minWidth: 1100,
        minHeight: 320,
        margin: '0 auto',
        mt: 0,
      }}>
        {/* Красивая шапка */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <LocalShipping color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 1 }}>
              Управление заказами
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Просмотр и управление заказами клиентов
            </Typography>
          </Box>
        </Box>

        {/* Статистика заказов */}
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e9ecef' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#495057' }}>
            Статистика заказов
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                {orders.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Всего заказов
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {orders.filter(order => order.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Ожидают подтверждения
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {orders.filter(order => order.status === 'confirmed').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Подтверждены
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {orders.filter(order => order.status === 'pickedup').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Получены
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Разделитель */}
        <Box sx={{ mb: 4, height: 1, background: 'linear-gradient(90deg, transparent, #e0e0e0, transparent)' }} />
      
      {/* Поиск и фильтры */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Поиск по номеру заказа, email или имени..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Статус"
          >
            <MenuItem value="all">Все статусы</MenuItem>
            <MenuItem value="pending">Ожидает подтверждения</MenuItem>
            <MenuItem value="confirmed">Подтвержден</MenuItem>
            <MenuItem value="ready">Готов к выдаче</MenuItem>
            <MenuItem value="pickedup">Получен</MenuItem>
            <MenuItem value="cancelled">Отменен</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Список заказов */}
      <Box sx={{ background: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>№ Заказа</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Клиент</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Дата</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Сумма</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Статус</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>#{order.id}</td>
                  <td style={{ padding: 12 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {order.user?.name || 'Не указано'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {order.user?.email || 'Не указано'}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ padding: 12 }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td style={{ padding: 12 }}>
                    {formatPrice(order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}
                  </td>
                  <td style={{ padding: 12 }}>
                    <Box sx={{ 
                      display: 'inline-block', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 1, 
                      backgroundColor: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status),
                      fontSize: '0.875rem',
                      fontWeight: 'medium'
                    }}>
                      {getStatusText(order.status)}
                    </Box>
                  </td>
                  <td style={{ padding: 12 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderDetailsOpen(true);
                        }}
                        sx={{
                          color: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#e3f2fd'
                          }
                        }}
                        title="Детали заказа"
                      >
                        <Info />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteOrder(order.id)}
                        sx={{
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: '#ffebee'
                          }
                        }}
                        title="Удалить заказ"
                      >
                        <Delete />
                      </IconButton>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          sx={{ fontSize: '0.875rem' }}
                        >
                          <MenuItem value="pending">Ожидает подтверждения</MenuItem>
                          <MenuItem value="confirmed">Подтвержден</MenuItem>
                          <MenuItem value="ready">Готов к выдаче</MenuItem>
                          <MenuItem value="pickedup">Получен</MenuItem>
                          <MenuItem value="cancelled">Отменен</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Диалог с деталями заказа */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: '99999 !important',
          '& .MuiDialog-paper': {
            zIndex: '99999 !important'
          },
          '& .MuiBackdrop-root': {
            zIndex: '99998 !important'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          borderRadius: 0,
          mb: 0
        }}>
          📋 Заказ #{selectedOrder?.id} - Детальная информация
        </DialogTitle>
        <DialogContent 
          ref={orderDetailsContentRef}
          onWheel={(e) => {
            // Разрешаем прокрутку только внутри DialogContent
            e.stopPropagation();
          }}
          sx={{ 
            p: 3,
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '70vh',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#555',
              },
            },
          }}
          dividers
        >
          {selectedOrder && (
            <Box sx={{ mt: 1 }}>
              {/* Информация о заказе */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 2,
                border: '1px solid #dee2e6'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#1976d2',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  📅 Информация о заказе
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Дата заказа:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Статус заказа:</Typography>
                    <Box sx={{ 
                      display: 'inline-block', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 1, 
                      backgroundColor: getStatusColor(selectedOrder.status) + '20',
                      color: getStatusColor(selectedOrder.status),
                      fontSize: '0.875rem',
                      fontWeight: 'medium'
                    }}>
                      {getStatusText(selectedOrder.status)}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Информация о клиенте */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                borderRadius: 2,
                border: '1px solid #90caf9'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#1565c0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  👤 Информация о клиенте
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Имя клиента:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedOrder.user?.name || 'Не указано'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Email:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {selectedOrder.user?.email || 'Не указано'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Телефон:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedOrder.user?.phone || 'Не указано'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Адрес доставки:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedOrder.user?.address || 'Не указано'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Товары в заказе */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                borderRadius: 2,
                border: '1px solid #ce93d8'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#7b1fa2',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  🛍️ Товары в заказе ({selectedOrder.items?.length || 0} шт.)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedOrder.items?.map((item, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      gap: 2,
                      p: 2, 
                      background: 'rgba(255,255,255,0.7)', 
                      borderRadius: 2,
                      border: '1px solid #e1bee7',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }
                    }}>
                      {/* Картинка товара */}
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        flexShrink: 0,
                        borderRadius: 2,
                        border: '2px solid #e1bee7',
                        backgroundImage: item.product?.imageUrls && item.product.imageUrls.length > 0 
                          ? `url(${getImageUrl(item.product.imageUrls[0])})`
                          : 'url(/photography.jpg)',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }} />
                      
                      {/* Информация о товаре */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: '#333',
                            mb: 0.5,
                            fontSize: '0.95rem'
                          }}>
                            {item.product?.name || 'Товар не найден'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#666',
                            mb: 0.5,
                            fontSize: '0.8rem'
                          }}>
                            {t('productCard.sku')}: {item.product?.article || '—'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip 
                              label={`Количество: ${item.quantity}`}
                              size="small"
                              sx={{ 
                                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                              Цена за шт.: {formatPrice(item.price)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      {/* Общая стоимость */}
                      <Box sx={{ 
                        textAlign: 'right', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center',
                        minWidth: 100
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          color: '#1976d2',
                          fontSize: '1.1rem'
                        }}>
                          {formatPrice(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Итоговая информация */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                borderRadius: 2,
                border: '1px solid #a5d6a7'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#2e7d32',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  💰 Итоговая информация
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 2,
                  border: '1px solid #a5d6a7'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                    Общая сумма заказа:
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700,
                    color: '#1976d2',
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {formatPrice(selectedOrder.total)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOrderDetailsOpen(false)}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
              minWidth: 120,
              height: 44,
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              },
              cursor: 'pointer',
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}
// Страница категории (показывает подкатегории)
function CategoryPage({ products, onAddToCart, cart, handleChangeCartQuantity, user, wishlist, onWishlistToggle, onEditProduct }) {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  // Загрузка категории и подкатегорий
  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
        const [categoryRes, subcategoriesRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories/${id}`, { headers }),
          fetch(`${API_BASE_URL}/api/categories?parentId=${id}`, { headers }),
          fetch(`${API_BASE_URL}/api/products?categoryId=${id}`, { headers })
        ]);
        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          setCategory(categoryData);
        }
        if (subcategoriesRes.ok) {
          const subcategoriesData = await subcategoriesRes.json();
          setSubcategories(subcategoriesData);
        }
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setCategoryProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      }
      setLoading(false);
    };

    if (id) {
      fetchCategoryData();
    }
  }, [id]);

  // Инициализация распознавания речи
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setSearchQuery(finalTranscript);
          setInterimTranscript('');
          setIsListening(false);
        } else {
          setInterimTranscript(interimTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    }
  }, [i18n.language]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        // Убеждаемся, что язык установлен правильно перед запуском
        recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
        console.log('CategoryPage: Setting speech recognition language to:', recognitionRef.current.lang);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    } else {
      alert(getSpeechRecognitionErrorMessage(i18n.language));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Фильтрация подкатегорий по поисковому запросу
  const filteredSubcategories = subcategories.filter(subcat => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = subcat.name?.toLowerCase().includes(searchLower);
    return nameMatch;
  });

  // ... после useState для categoryProducts и после загрузки category ...
  const filteredCategoryProducts = categoryProducts.filter(product => {
    if (product.categoryId && Number(product.categoryId) === Number(id)) return true;
    if (typeof product.category === 'number' && product.category === Number(id)) return true;
    if (typeof product.category === 'string' && Number(product.category) === Number(id)) return true;
    if (product.category && typeof product.category === 'object' && Number(product.category.id) === Number(id)) return true;
    if (product.category && typeof product.category === 'string' && product.category === category?.name) return true;
    return false;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
          <Typography variant="h4">Загрузка...</Typography>
        </Box>
      </Container>
    );
  }

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
          <Typography variant="h4" color="error">{t('category.notFound')}</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/catalog')}
            sx={{ mt: 2 }}
          >
            {t('category.backToCatalog')}
          </Button>
        </Box>
      </Container>
    );
  }

  // Функция транслитерации для подкатегорий
  function translit(str) {
    const map = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',' ':'_','-':'_','—':'_','і':'i','ї':'i','є':'e','А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'E','Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Sch','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya','І':'I','Ї':'I','Є':'E'
    };
    return str.split('').map(l => map[l] !== undefined ? map[l] : l).join('');
  }
  // Маппинг: подкатегория -> реальное имя файла в public
  const subcategoryImageMap = {
    // Игрушки
    'Куклы': 'Kukly_11zon.webp',
    'Игрушки для самых маленьких': 'Igrushki-dlya-samyh-malenkih_11zon.webp',
    'Игрушки - антистресс и сквиши': 'antistress.webp',
    'Треки, паркинги и жд': 'treki11.webp',
    'Мягкие игрушки': 'Myagkie-igrushki_11zon.webp',
    'Тематические игровые наборы': 'Tematicheskie.webp',
    'Декоративная косметика и украшения': 'Dekorativnaya-kosmetika-i-ukrasheniya_11zon.webp',
    'Машинки и другой транспорт': 'Mashinki.webp',
    'Игровые фигурки': 'figurki.webp',
    'Игрушки для песочницы': 'pesochnicy.webp',
    'Оружие игрушечное': 'Oruzhie.webp',
    'Роботы и трансформеры': 'Roboty.webp',
    'Шарики': 'shariki.webp',
    'Активные игры': 'Aktivnye-igry_11zon.webp',
    'Игрушки на радиоуправлении': 'Igrushki-na-radioupravlenii_11zon.webp',
    
    // Конструкторы
    'Lego для мальчиков': 'podkategorii/konstruktor/legomalchiki.webp',
    'Lego для девочек': 'podkategorii/konstruktor/legdevochki.webp',
    'Металлические конструкторы': 'podkategorii/konstruktor/metalkonstruktor.webp',
    'Lego крупные блоки': 'podkategorii/konstruktor/legoblokikrupnie.webp',
    
    // Пазлы
    'Пазлы для взрослых': 'podkategorii/puzzle/pazlyvzrosliy.webp',
    'Пазлы для детей': 'podkategorii/puzzle/pazlydeti.webp',
    'Магнитные пазлы': 'podkategorii/puzzle/magnotpazzle.webp',
    'Пазлы напольные': 'podkategorii/puzzle/napolnie.webp',
    'Пазлы для малышей': 'podkategorii/puzzle/babypazzle.webp',
    
                  // Творчество
              'Рисование': 'podkategorii/tvorchestvo/risovanie.webp',
              'Раскраски': 'podkategorii/tvorchestvo/raskraski.webp',
              'Наклейки': 'podkategorii/tvorchestvo/nakleyki.webp',
              'Наборы для творчества': 'podkategorii/tvorchestvo/tvorchestvanabor.webp',
              'Кинетический песок': 'podkategorii/tvorchestvo/kineticheskiypesok.webp',
              'Наборы для лепки': 'podkategorii/tvorchestvo/lepka.webp',
              'Лизуны и слаймы': 'podkategorii/tvorchestvo/lizun.webp',
    
                    // Канцтовары
                'Портфели для школы': 'podkategorii/kanstovary/portfel.webp',
                'Портфели для детских садов': 'podkategorii/kanstovary/portfelisadikj.webp',
                'Пеналы': 'podkategorii/kanstovary/penaly.webp',
                'Ручки и карандаши': 'podkategorii/kanstovary/ruchkikarandashi.webp',
                'Точилки': 'podkategorii/kanstovary/tochilki.webp',
                'Фломастеры и маркеры': 'podkategorii/kanstovary/flomastery.webp',
                'Краски': 'podkategorii/kanstovary/kraski.webp',
                'Кисточки и принадлежности': 'podkategorii/kanstovary/kistochki.webp',
                'Брелки': 'podkategorii/kanstovary/brelki.webp',
    
                    // Транспорт
                'Детские самокаты': 'podkategorii/transport/samokat.webp',
                'Велосипеды': 'podkategorii/transport/velosiped.webp',
                'Ходунки': 'podkategorii/transport/hodunki.webp',
                'Беговелы': 'podkategorii/transport/begovely.webp',
    
                    // Отдых на воде
                              'Бассейны': 'podkategorii/otdyh_na_vode/basseiny.webp',
              'Матрасы и плотики': 'podkategorii/otdyh_na_vode/matrasyiplotiki.webp',
              'Круги надувные': 'podkategorii/otdyh_na_vode/kruginaduvnie.webp',
              'Нарукавники и жилеты': 'podkategorii/otdyh_na_vode/zhilety.webp',
              'Аксессуары для плавания': 'podkategorii/otdyh_na_vode/aksesuary.webp',
              'Ракетки': 'podkategorii/otdyh_na_vode/raketki.webp',
              'Пляжные мячи и игрушки для плавания': 'podkategorii/otdyh_na_vode/miachi.webp',
              'Насосы для матрасов': 'podkategorii/otdyh_na_vode/nasosy.webp',
  };

  function getSubcategoryImageFileName(subCategory) {
    // Проверяем, есть ли изображение в маппинге
    const mappedImage = subcategoryImageMap[subCategory];
    if (mappedImage) {
      return mappedImage;
    }
    
    // Если изображения нет в маппинге, возвращаем заглушку
    return 'toys.png';
  }

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
      'Насосы для матрасов': 'pumps'
    };
    
    const parentKey = categoryMap[parentCategory];
    const subcategoryKey = subcategoryMap[subcategoryName];
    
    if (parentKey && subcategoryKey) {
      return t(`categories.subcategories.${parentKey}.${subcategoryKey}`);
    }
    
    return subcategoryName;
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, pt: { xs: 0, md: 10 } }}>
                {/* Хлебные крошки */}
        <Box sx={{ 
          mb: 3, 
          ml: { xs: 0, md: '280px' }, // Отступ слева для десктопа
          pl: { xs: 2, md: 0 }, // Отступ слева для мобильных
          pt: { xs: 1, md: 0 } // Отступ сверху для мобильных
        }}>
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />}
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
            <RouterLink 
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
              <Home sx={{ fontSize: 18 }} />
              {t('breadcrumbs.home')}
            </RouterLink>
            <RouterLink 
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
            </RouterLink>
            <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: '14px' }}>
              {category?.name ? translateCategory(category.name) : t('breadcrumbs.category')}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Заголовок категории */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          textAlign: 'center',
          mb: 4 
        }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            color: '#ff6600',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            fontSize: '3rem',
            textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1 
          }}>
            {translateCategory(category.name)}
          </Typography>
        </Box>

        {/* Строка поиска удалена по просьбе пользователя */}
{searchQuery && !isListening && (
          <Typography sx={{ 
            mt: 2, 
            textAlign: 'center', 
            color: '#666',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            {t('category.foundSubcategories', { count: filteredSubcategories.length })}
          </Typography>
        )}

        {filteredSubcategories.length > 0 && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 6,
            maxWidth: 1400,
            mx: 'auto',
            justifyItems: { xs: 'center', sm: 'start' },
            pl: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
            '@media (min-width: 1200px)': {
              pl: 9, // Отступ слева для больших экранов
            },
          }}>
            {filteredSubcategories.map(subcat => {
              const nameTrimmed = subcat.name && subcat.name.trim();
              const fileName = getSubcategoryImageFileName(nameTrimmed);
              const src = fileName ? `/${fileName}` : '/toys.png';
              return (
                <Box
                  key={subcat.id}
                  className="category-tile"
                  onClick={() => navigate(`/subcategory/${subcat.id}`)}
                  sx={{
                    position: 'relative',
                    height: 156,
                    border: 'none',
                    borderRadius: 3,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    backgroundImage: `url(${src})`,
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.05)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.82)',
                    py: 1,
                    px: 2,
                    textAlign: 'center',
                  }}>
                    <Typography sx={{
                      fontWeight: 700,
                      fontSize: 18,
                      color: '#222',
                      textAlign: 'center',
                      m: 0,
                      p: 0,
                    }}>
                      {translateSubcategory(category.name, subcat.name)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Сетка товаров из этой категории */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 6,
          justifyItems: { xs: 'center', sm: 'start' },
          pl: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
          '@media (min-width: 1200px)': {
            pl: 9, // Отступ слева для больших экранов
          },
        }}>
          {filteredCategoryProducts.length > 0 ? (
            filteredCategoryProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                user={user}
                isAdmin={user?.role === 'admin'}
                inWishlist={wishlist.some(item => item.productId === product.id)}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={onAddToCart} 
                cart={cart} 
                onChangeCartQuantity={handleChangeCartQuantity} 
                onEditProduct={onEditProduct}
              />
            ))
          ) : (
            <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 20 }}>
              {searchQuery ? t('category.noProductsSearch', { query: searchQuery }) : t('category.noProducts')}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}
// Страница подкатегории (показывает товары)
function SubcategoryPage({ products, onAddToCart, cart, handleChangeCartQuantity, user, wishlist, onWishlistToggle, onEditProduct, selectedGenders }) {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [subcategoryProducts, setSubcategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Загрузка подкатегории и товаров
  useEffect(() => {
    const fetchSubcategoryData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
        
        const [subcategoryRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories/${id}`, { headers }),
          fetch(`${API_BASE_URL}/api/products?subcategoryId=${id}`, { headers })
        ]);
        
        if (subcategoryRes.ok) {
          const subcategoryData = await subcategoryRes.json();
          setSubcategory(subcategoryData);
          
          // Загружаем родительскую категорию
          if (subcategoryData.parentId) {
            const categoryRes = await fetch(`${API_BASE_URL}/api/categories/${subcategoryData.parentId}`, { headers });
            if (categoryRes.ok) {
              const categoryData = await categoryRes.json();
              setCategory(categoryData);
            }
          }
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setSubcategoryProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching subcategory data:', error);
      }
      setLoading(false);
    };

    if (id) {
      fetchSubcategoryData();
    }
  }, [id]);

  // Инициализация распознавания речи
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setSearchQuery(finalTranscript);
          setInterimTranscript('');
          setIsListening(false);
        } else {
          setInterimTranscript(interimTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    }
  }, [i18n.language]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        // Убеждаемся, что язык установлен правильно перед запуском
        recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
        console.log('SubcategoryPage: Setting speech recognition language to:', recognitionRef.current.lang);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    } else {
      alert(getSpeechRecognitionErrorMessage(i18n.language));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Фильтрация товаров по поисковому запросу
  const filteredProducts = subcategoryProducts.filter(product => {
    if (selectedGenders && selectedGenders.length > 0 && !selectedGenders.includes(product.gender)) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = product.name?.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
      const categoryMatch = (() => {
        if (typeof product.category === 'object' && product.category !== null) {
          return (product.category.name || '').toLowerCase().includes(searchLower);
        }
        return (product.category || '').toLowerCase().includes(searchLower);
      })();
      
      if (!nameMatch && !descriptionMatch && !categoryMatch) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
          <Typography variant="h4">Загрузка...</Typography>
        </Box>
      </Container>
    );
  }

  if (!subcategory) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
          <Typography variant="h4" color="error">{t('subcategory.notFound')}</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/catalog')}
            sx={{ mt: 2 }}
          >
            {t('subcategory.backToCatalog')}
          </Button>
        </Box>
      </Container>
    );
  }

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
      'Насосы для матрасов': 'pumps'
    };
    
    const parentKey = categoryMap[parentCategory];
    const subcategoryKey = subcategoryMap[subcategoryName];
    
    if (parentKey && subcategoryKey) {
      return t(`categories.subcategories.${parentKey}.${subcategoryKey}`);
    }
    
    return subcategoryName;
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, pt: { xs: 0, md: 10 } }}>
        {/* Хлебные крошки */}
        <Box sx={{ 
          mb: 3, 
          ml: { xs: 0, md: '280px' }, // Отступ слева для десктопа
          pl: { xs: 2, md: 0 }, // Отступ слева для мобильных
          pt: { xs: 1, md: 0 } // Отступ сверху для мобильных
        }}>
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />}
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
            <RouterLink 
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
              <Home sx={{ fontSize: 18 }} />
              {t('breadcrumbs.home')}
            </RouterLink>
            <RouterLink 
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
            </RouterLink>
            {category && (
              <RouterLink 
                to={`/category/${category.id}`}
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
                {translateCategory(category.name)}
              </RouterLink>
            )}
            <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: '14px' }}>
              {subcategory?.name ? (category ? translateSubcategory(category.name, subcategory.name) : subcategory.name) : t('breadcrumbs.subcategory')}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Заголовок подкатегории */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          textAlign: 'center',
          mb: 4 
        }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            color: '#ff6600',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            fontSize: '3rem',
            textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1 
          }}>
            {category ? translateSubcategory(category.name, subcategory.name) : subcategory.name}
          </Typography>

        </Box>

        {/* Строка поиска удалена по просьбе пользователя */}
{searchQuery && !isListening && (
          <Typography sx={{ 
            mt: 2, 
            textAlign: 'center', 
            color: '#666',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            {t('catalog.foundProducts', { count: filteredProducts.length })}
          </Typography>
        )}

        {/* Сетка товаров */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 6,
          justifyItems: { xs: 'center', sm: 'start' },
          pl: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
          '@media (min-width: 1200px)': {
            pl: 9, // Отступ слева для больших экранов
          },
        }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                user={user}
                isAdmin={user?.role === 'admin'}
                inWishlist={wishlist.some(item => item.productId === product.id)}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={onAddToCart} 
                cart={cart} 
                onChangeCartQuantity={handleChangeCartQuantity} 
                onEditProduct={onEditProduct}
              />
            ))
          ) : (
            <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 20 }}>
              {searchQuery ? t('subcategory.noProductsSearch', { query: searchQuery }) : t('subcategory.noProducts')}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}
// Новый компонент личного кабинета
function UserCabinetPage({ user, handleLogout, wishlist, handleWishlistToggle, cart, handleAddToCart, handleChangeCartQuantity, onEditProduct, handleUserUpdate, handleOpenReviewForm }) {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState('myprofile');
  
    // Проверяем флаг для открытия вкладки уведомлений при загрузке
  React.useEffect(() => {
    const openNotificationsTab = localStorage.getItem('openNotificationsTab');
    if (openNotificationsTab === 'true') {
      setSelectedSection('notifications');
      localStorage.removeItem('openNotificationsTab');
    }
  }, []);
  
  // Обнуляем счетчик уведомлений при переходе на страницу уведомлений
  React.useEffect(() => {
    if (selectedSection === 'notifications') {
      // Обнуляем счетчик в AppBar
      window.dispatchEvent(new CustomEvent('clearNotificationsCount'));
      
      // Устанавливаем флаг, что счетчик был обнулен
      localStorage.setItem('notificationsCleared', 'true');
      localStorage.setItem('notificationsClearedAt', Date.now().toString());
      localStorage.setItem('notificationsCountAtClear', '0');
    }
  }, [selectedSection]);
  const [localWishlist, setLocalWishlist] = useState(wishlist || []);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [localViewed, setLocalViewed] = useState([]);
  const [clearViewedDialogOpen, setClearViewedDialogOpen] = useState(false);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
  });
  const [profileData, setProfileData] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Состояния для вкладки "Настройки авторизации"
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Хуки для уведомлений (в начало UserCabinetPage)
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [errorNotifications, setErrorNotifications] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState(new Set());
  const [completedNotifications, setCompletedNotifications] = useState(new Set());
  
  // Хуки для заказов
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Хуки для отзывов
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  // Проверяем localStorage для активной вкладки при загрузке
  useEffect(() => {
    const activeTab = localStorage.getItem('activeProfileTab');
    const selectedSectionFromMenu = localStorage.getItem('selectedProfileSection');
    const skipReload = localStorage.getItem('skipReload');
    
    // Приоритет: сначала проверяем выбранную секцию из контекстного меню
    if (selectedSectionFromMenu && ['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(selectedSectionFromMenu)) {
      setSelectedSection(selectedSectionFromMenu);
      localStorage.removeItem('selectedProfileSection');
      return;
    }
    
        // Затем проверяем активную вкладку
    if (activeTab && ['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(activeTab)) {
      setSelectedSection(activeTab);
      // Очищаем localStorage после использования
      localStorage.removeItem('activeProfileTab');
      
      // Если это обновление с перезагрузкой, очищаем флаг
      if (skipReload) {
        localStorage.removeItem('skipReload');
        // Принудительно загружаем уведомления при переключении на вкладку
        if (activeTab === 'notifications' && user) {
          let ignore = false;
          setLoadingNotifications(true);
          setErrorNotifications('');
          fetch(`${API_BASE_URL}/api/profile/notifications`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          })
            .then(res => {
              if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
              return res.json();
            })
            .then(data => {
              if (!ignore) setNotifications(Array.isArray(data) ? data : []);
            })
            .catch(e => { if (!ignore) setErrorNotifications(e.message); })
            .finally(() => { if (!ignore) setLoadingNotifications(false); });
          return () => { ignore = true; };
        }

      }
    }
  }, [user]);

  // Дополнительный useEffect для обработки случая, когда пользователь еще не загружен
  useEffect(() => {
    const activeTab = localStorage.getItem('activeProfileTab');
    const skipReload = localStorage.getItem('skipReload');
    
    // Если есть активная вкладка, но пользователь еще не загружен, ждем загрузки
    if (activeTab && !user && skipReload) {
      return;
    }
  }, [user]);

  // useEffect для обработки изменений selectedSection в реальном времени
  useEffect(() => {
    const selectedSectionFromMenu = localStorage.getItem('selectedProfileSection');
    if (selectedSectionFromMenu && ['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(selectedSectionFromMenu)) {
      setSelectedSection(selectedSectionFromMenu);
      localStorage.removeItem('selectedProfileSection');
    }
  }, [selectedSection]);

  // Обработчик события изменения секции профиля
  useEffect(() => {
    const handleProfileSectionChange = (event) => {
      const section = event.detail;
      if (['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(section)) {
        setSelectedSection(section);
      }
    };

    window.addEventListener('profileSectionChanged', handleProfileSectionChange);
    return () => {
      window.removeEventListener('profileSectionChanged', handleProfileSectionChange);
    };
  }, []);
  
  useEffect(() => {
    if (!user || !user.token) {
      setNotifications([]);
      setLoadingNotifications(false);
      setErrorNotifications('');
      return;
    }
    
    // Проверяем, не является ли это обновлением с перезагрузкой
    const skipReload = localStorage.getItem('skipReload');
    if (skipReload) {
      // Если это перезагрузка для переключения на уведомления, загружаем данные
      let ignore = false;
      setLoadingNotifications(true);
      setErrorNotifications('');
      fetch(`${API_BASE_URL}/api/profile/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
          return res.json();
        })
        .then(data => {
          if (!ignore) setNotifications(Array.isArray(data) ? data : []);
        })
        .catch(e => { if (!ignore) setErrorNotifications(e.message); })
        .finally(() => { if (!ignore) setLoadingNotifications(false); });
      return () => { ignore = true; };
    }
    

    
    let ignore = false;
    setLoadingNotifications(true);
    setErrorNotifications('');
    fetch(`${API_BASE_URL}/api/profile/notifications`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
        return res.json();
      })
      .then(data => {
        if (!ignore) setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(e => { if (!ignore) setErrorNotifications(e.message); })
      .finally(() => { if (!ignore) setLoadingNotifications(false); });
    return () => { ignore = true; };
  }, [user]);
  
  // Загружаем данные профиля при открытии страницы
  useEffect(() => {
    if ((selectedSection === 'profile' || selectedSection === 'myprofile') && user) {
      loadProfileData();
    }
  }, [selectedSection, user]);

  // Загружаем заказы при переключении на вкладку заказов
  useEffect(() => {
    if (selectedSection === 'orders' && user) {
      loadOrders();
    }
  }, [selectedSection, user]);

  // Загружаем отзывы при переключении на вкладку отзывов
  useEffect(() => {
    if (selectedSection === 'reviews' && user) {
      loadUserReviews();
    }
  }, [selectedSection, user]);

  // Загружаем уведомления при переключении на вкладку уведомлений
  useEffect(() => {
    if (selectedSection === 'notifications' && user) {
      // Очищаем флаг skipReload при явном переключении на уведомления
      localStorage.removeItem('skipReload');
      
      // Проверяем, нужно ли обнулить счетчик уведомлений
      const clearNotificationsFlag = localStorage.getItem('clearNotificationsOnProfile');
      if (clearNotificationsFlag === 'true') {
        // Обнуляем счетчик уведомлений в Navigation
        const event = new CustomEvent('clearNotificationsCount');
        window.dispatchEvent(event);
        localStorage.removeItem('clearNotificationsOnProfile');
      }
      
      let ignore = false;
      setLoadingNotifications(true);
      setErrorNotifications('');
      fetch(`${API_BASE_URL}/api/profile/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
          return res.json();
        })
        .then(data => {
          if (!ignore) setNotifications(Array.isArray(data) ? data : []);
        })
        .catch(e => { if (!ignore) setErrorNotifications(e.message); })
        .finally(() => { if (!ignore) setLoadingNotifications(false); });
      return () => { ignore = true; };
    }
  }, [selectedSection, user]);

  // Загружаем информацию о отправленных отзывах и выполненных уведомлениях
  useEffect(() => {
    if (selectedSection === 'notifications' && user) {
      // Загружаем информацию о отправленных отзывах из localStorage
      const submittedReviewsData = localStorage.getItem('submittedReviews');
      if (submittedReviewsData) {
        try {
          const reviews = JSON.parse(submittedReviewsData);
          setSubmittedReviews(new Set(reviews));
        } catch (error) {
          console.error('Error parsing submitted reviews:', error);
        }
      }
      
      // Загружаем информацию о выполненных уведомлениях из localStorage
      const completedNotificationsData = localStorage.getItem('completedNotifications');
      if (completedNotificationsData) {
        try {
          const completed = JSON.parse(completedNotificationsData);
          setCompletedNotifications(new Set(completed));
        } catch (error) {
          console.error('Error parsing completed notifications:', error);
        }
      }
    }
  }, [selectedSection, user]);



  const loadProfileData = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
        setProfileForm({
          name: data.user.name || '',
          surname: data.user.surname || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/profile/orders`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleHideOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Скрываем заказ из списка
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        alert('Заказ скрыт из списка');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка скрытия заказа');
      }
    } catch (error) {
      console.error('Ошибка скрытия заказа:', error);
      alert('Ошибка скрытия заказа');
    }
  };

  const loadUserReviews = async () => {
    if (!user) return;
    
    try {
      setReviewsLoading(true);
      // Загружаем отзывы о товарах
      const productReviewsRes = await fetch(`${API_BASE_URL}/api/profile/reviews/product`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const productReviews = await productReviewsRes.json();
      

      
      // Загружаем отзывы о магазине
      const shopReviewsRes = await fetch(`${API_BASE_URL}/api/profile/reviews/shop`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const shopReviews = await shopReviewsRes.json();
      

      
      // Объединяем отзывы
      const allReviews = [
        ...productReviews.map(review => ({
          ...review,
          type: 'review',
          productName: review.product?.name || 'Товар',
          productImage: review.product?.imageUrls?.[0] ? 
            getImageUrl(review.product.imageUrls[0]) : 
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4xODM0IDI1IDM4IDMxLjgxNjYgMzggMzlDMzggNDYuMTgzNCAzMi4xODM0IDUzIDI1IDUzQzE3LjgxNjYgNTMgMTIgNDYuMTgzNCAxMiAzOUMxMiAzMS44MTY2IDE3LjgxNjYgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAzMUMyNy43NjE0IDMxIDMwIDMzLjIzODYgMzAgMzZDMzAgMzguNzYxNCAyNy43NjE0IDQxIDI1IDQxQzIyLjIzODYgNDEgMjAgMzguNzYxNCAyMCAzNkMyMCAzMy4yMzg2IDIyLjIzODYgMzEgMjUgMzFaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo='
        })),
        ...shopReviews.map(review => ({
          ...review,
          type: 'shop_review',
          productName: 'Магазин',
          productImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4xODM0IDI1IDM4IDMxLjgxNjYgMzggMzlDMzggNDYuMTgzNCAzMi4xODM0IDUzIDI1IDUzQzE3LjgxNjYgNTMgMTIgNDYuMTgzNCAxMiAzOUMxMiAzMS44MTY2IDE3LjgxNjYgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAzMUMyNy43NjE0IDMxIDMwIDMzLjIzODYgMzAgMzZDMzAgMzguNzYxNCAyNy43NjE0IDQxIDI1IDQxQzIyLjIzODYgNDEgMjAgMzguNzYxNCAyMCAzNkMyMCAzMy4yMzg2IDIyLjIzODYgMzEgMjUgMzFaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo='
        }))
      ];
      

      
      setUserReviews(allReviews);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Функция для скрытия отзыва о товаре
  const handleHideProductReview = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/reviews/product/${reviewId}/hide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        // Перезагружаем отзывы
        loadUserReviews();
      } else {
        console.error('Ошибка скрытия отзыва о товаре');
      }
    } catch (error) {
      console.error('Ошибка скрытия отзыва о товаре:', error);
    }
  };

  // Функция для скрытия отзыва о магазине
  const handleHideShopReview = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/reviews/shop/${reviewId}/hide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        // Перезагружаем отзывы
        loadUserReviews();
      } else {
        console.error('Ошибка скрытия отзыва о магазине');
      }
    } catch (error) {
      console.error('Ошибка скрытия отзыва о магазине:', error);
    }
  };

  const handleProfileInput = (e) => {
    setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  
  // Функции для работы с паролем
  const handlePasswordInput = (e) => {
    setPasswordForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Новые пароли не совпадают');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    
    // Проверяем, есть ли у пользователя пароль
    const hasPassword = profileData?.hasPassword;
    
    // Для пользователей с паролем проверяем текущий пароль
    if (hasPassword && !passwordForm.currentPassword) {
      alert('Введите текущий пароль');
      return;
    }
    
    try {
      setPasswordLoading(true);
      const requestBody = {
        newPassword: passwordForm.newPassword
      };
      
      // Добавляем текущий пароль только если он есть
      if (hasPassword && passwordForm.currentPassword) {
        requestBody.currentPassword = passwordForm.currentPassword;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        setPasswordSaved(true);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordSaved(false), 3000);
      } else {
        const errorData = await response.json();
        alert('Ошибка смены пароля: ' + (errorData.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      alert('Ошибка смены пароля');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileForm.name,
          surname: profileForm.surname,
          email: profileForm.email,
          phone: profileForm.phone
        })
      });
      
      if (response.ok) {
        setProfileSaved(true);
        // Получаем обновленные данные пользователя
        const responseData = await response.json();
        // Обновляем данные пользователя в localStorage
                const updatedUser = {
          ...user, 
          name: responseData.user.name,
          surname: responseData.user.surname,
          phone: responseData.user.phone,
          googleId: responseData.user.googleId,
          facebookId: responseData.user.facebookId
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Обновляем profileData с новыми данными
        setProfileData(responseData.user);
        // Обновляем состояние пользователя в родительском компоненте
        if (handleUserUpdate) {
          handleUserUpdate(updatedUser);
        }
      } else {
        const errorData = await response.json();
        alert('Ошибка сохранения: ' + (errorData.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      alert('Ошибка сохранения профиля');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    setLocalWishlist(wishlist || []);
  }, [wishlist]);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    setLocalViewed(viewed);
    // Подписка на изменения localStorage (если вкладка другая очистила)
    const onStorage = (e) => {
      if (e.key === 'viewedProducts') {
        setLocalViewed(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleClearWishlist = async () => {
    if (!user || !user.token) return;
    try {
      await fetch(`${API_BASE_URL}/api/profile/wishlist/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      });
      setLocalWishlist([]);
    } catch (e) {
      alert('Ошибка при очистке списка желаний');
    }
  };
  const handleClearConfirm = () => {
    setClearDialogOpen(false);
    handleClearWishlist();
  };
  const handleClearCancel = () => {
    setClearDialogOpen(false);
  };
  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    handleLogout();
  };
  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleClearViewed = () => {
    setLocalViewed([]);
    localStorage.setItem('viewedProducts', '[]');
  };
  const handleClearViewedConfirm = () => {
    setClearViewedDialogOpen(false);
    handleClearViewed();
  };
  const handleClearViewedCancel = () => {
    setClearViewedDialogOpen(false);
  };
  // Удалить один товар из просмотренных
  const handleRemoveViewed = (productId) => {
    const updated = localViewed.filter(p => p.id !== productId);
    setLocalViewed(updated);
    localStorage.setItem('viewedProducts', JSON.stringify(updated));
  };

  // Обработка удаления профиля
  const handleDeleteProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Удаляем данные пользователя из localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        localStorage.removeItem('viewedProducts');
        localStorage.removeItem('submittedReviews');
        localStorage.removeItem('completedNotifications');
        localStorage.removeItem('notificationsCleared');
        localStorage.removeItem('notificationsClearedAt');
        localStorage.removeItem('notificationsCountAtClear');
        localStorage.removeItem('clearNotificationsOnProfile');
        
        // Сбрасываем флаг уведомлений (будет обработано в Navigation)
        
        // Вызываем logout в родительском компоненте
        if (handleLogout) {
          handleLogout();
        }
      } else {
        const errorData = await response.json();
        alert('Ошибка удаления профиля: ' + (errorData.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка удаления профиля:', error);
      alert('Ошибка удаления профиля');
    } finally {
      setDeleteProfileDialogOpen(false);
    }
  };

  const handleDeleteProfileConfirm = () => {
    handleDeleteProfile();
  };

  const handleDeleteProfileCancel = () => {
    setDeleteProfileDialogOpen(false);
  };

  // Функция для создания красивого заголовка
  const createHeader = (title) => (
    <Typography variant="h5" sx={{ 
      fontWeight: 800, 
      mb: 3, 
      color: '#ff6600',
      fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      fontSize: '2.2rem',
      textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }}>
      {title}
    </Typography>
  );
  // Заглушки для разделов
  const renderSection = () => {
    switch (selectedSection) {
      case 'myprofile':
        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              p: { xs: 2, md: 4 },
              maxWidth: { xs: '100%', md: 1100 },
              minWidth: { xs: 'auto', md: 1100 },
              minHeight: 320,
              margin: '0 auto',
              mt: 0,
              position: 'relative',
              left: { xs: 0, md: '-80px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              {/* Заголовок и кнопки в одной строке */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 4,
                borderBottom: '2px solid #f0f0f0',
                pb: 2,
                width: '100%'
              }}>
                {createHeader(t('profile.header.myProfile'))}
                
                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setSelectedSection('profile')}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: 15,
                      px: { xs: 2, md: 3 },
                      py: 1.5,
                      height: 44,
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      textTransform: 'none',
                      minWidth: { xs: 'auto', md: 120 },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                    }}
                  >
                    {t('profile.buttons.edit')}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DeleteForeverIcon />}
                    onClick={() => setDeleteProfileDialogOpen(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: 15,
                      px: 3,
                      py: 1.5,
                      height: 44,
                      boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                      textTransform: 'none',
                      minWidth: 120,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                    }}
                  >
                    {t('profile.buttons.deleteProfile')}
                  </Button>
                </Box>
              </Box>

              {/* Основная информация */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: { xs: 4, md: 6 },
                width: '100%',
                maxWidth: { xs: '100%', md: 1000 }
              }}>
                {/* Левая колонка - личная информация */}
                <Box sx={{ 
                  width: '100%',
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#333', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <PersonIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                    {t('profile.sections.personalInfo')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Имя */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)'
                      }
                    }}>
                      <PersonIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('profile.fields.firstName')}
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 16, fontWeight: 500, mt: 0.5 }}>
                          {profileData?.name || user?.name || t('profile.value.notSpecified')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Фамилия */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)'
                      }
                    }}>
                      <PersonIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('profile.fields.lastName')}
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 16, fontWeight: 500, mt: 0.5 }}>
                          {profileData?.surname || user?.surname || t('profile.value.notSpecifiedF')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Email */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)'
                      }
                    }}>
                      <EmailIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Email
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 16, fontWeight: 500, mt: 0.5 }}>
                          {profileData?.email || user?.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Телефон */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)'
                      }
                    }}>
                      <PhoneIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('profile.fields.phone')}
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 16, fontWeight: 500, mt: 0.5 }}>
                          {profileData?.phone || user?.phone || t('profile.value.notSpecified')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Дата регистрации */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)'
                      }
                    }}>
                      <CalendarTodayIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('profile.fields.registeredAt')}
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 16, fontWeight: 500, mt: 0.5 }}>
                          {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('ru-RU') : user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : t('profile.value.notSpecifiedF')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Правая колонка - статистика */}
                <Box sx={{ 
                  width: '100%',
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#333', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <BarChartIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                    {t('profile.sections.stats')}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                    gap: 3 
                  }}>
                    {/* Товары в корзине */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                        transform: 'translateY(-2px)',
                        borderColor: '#4caf50'
                      }
                    }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        backgroundColor: '#e8f5e8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ShoppingCartIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('profile.stats.cartItems')}
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 24, fontWeight: 700, mt: 0.5 }}>
                          {cart?.length || 0}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Избранные товары */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                        transform: 'translateY(-2px)',
                        borderColor: '#4caf50'
                      }
                    }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        backgroundColor: '#e8f5e8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FavoriteIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('profile.stats.wishlistItems')}
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 24, fontWeight: 700, mt: 0.5 }}>
                          {localWishlist?.length || 0}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Просмотренные товары */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                        transform: 'translateY(-2px)',
                        borderColor: '#4caf50'
                      }
                    }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        backgroundColor: '#e8f5e8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <VisibilityIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('profile.stats.viewedItems')}
                        </Typography>
                        <Typography sx={{ color: '#333', fontSize: 24, fontWeight: 700, mt: 0.5 }}>
                          {localViewed?.length || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      case 'notifications': {
        const getNotificationIcon = (type) => {
          switch (type) {
            case 'order': return <ShoppingCartIcon sx={{ color: '#4caf50', fontSize: 28 }} />;
            case 'promo': return <FavoriteIcon sx={{ color: '#ff9800', fontSize: 28 }} />;
            case 'system': return <NotificationsIcon sx={{ color: '#2196f3', fontSize: 28 }} />;
            default: return <NotificationsIcon sx={{ color: '#666', fontSize: 28 }} />;
          }
        };
        // --- Новое: функции удаления ---
        const handleDeleteNotification = async (id) => {
          if (!user || !user.token) return;
          if (!window.confirm('Удалить это уведомление?')) return;
          try {
            await fetch(`${API_BASE_URL}/api/profile/notifications/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${user.token}` }
            });
            // Обновить список
            setNotifications(notifications => notifications.filter(n => n.id !== id));
          } catch (e) {
            alert('Ошибка удаления уведомления');
          }
        };
        const handleDeleteAllNotifications = async () => {
          if (!user || !user.token) return;
          try {
            await fetch(`${API_BASE_URL}/api/profile/notifications`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setNotifications([]);
          } catch (e) {
            alert('Ошибка удаления всех уведомлений');
          }
        };

        const handleNotificationAction = (notif) => {
          if (notif.type === 'review_request') {
            // НЕ отмечаем уведомление как выполненное для отзывов
            // Уведомление будет отмечено только после полного заполнения всех отзывов
            
            // Перенаправляем на страницу отзывов о заказе
            // Извлекаем orderId из actionUrl
            if (notif.actionUrl) {
              try {
                const url = new URL(notif.actionUrl);
                const orderId = url.searchParams.get('orderId');
                if (orderId && orderId !== 'latest') {
                  window.location.href = `/review-order?orderId=${orderId}`;
                } else {
                  // Fallback - перенаправляем на страницу отзывов без orderId
                  window.location.href = `/review-order`;
                }
              } catch (error) {
                console.error('Error parsing actionUrl:', error);
                // Fallback - перенаправляем на страницу отзывов без orderId
                window.location.href = `/review-order`;
              }
            } else {
              // Fallback - перенаправляем на страницу отзывов без orderId
              window.location.href = `/review-order`;
            }
          } else {
            // Для других типов уведомлений отмечаем как выполненное
            setCompletedNotifications(prev => new Set([...prev, notif.id]));
            
            // Сохраняем в localStorage
            const completedNotificationsData = localStorage.getItem('completedNotifications');
            let completedNotifications = completedNotificationsData ? JSON.parse(completedNotificationsData) : [];
            if (!completedNotifications.includes(notif.id)) {
              completedNotifications.push(notif.id);
              localStorage.setItem('completedNotifications', JSON.stringify(completedNotifications));
            }
            
            if (notif.actionUrl) {
              // Переходим на страницу действия
              window.location.href = notif.actionUrl;
            }
          }
        };

        // Функция для проверки, был ли отправлен отзыв для заказа
        const isReviewSubmitted = (notif) => {
          if (notif.type !== 'review_request') return false;
          
          try {
            if (notif.actionUrl) {
              const url = new URL(notif.actionUrl);
              const orderId = url.searchParams.get('orderId');
              if (!orderId) return false;
              
              // Проверяем, есть ли полная информация о заполненных отзывах
              const reviewProgress = localStorage.getItem(`reviewProgress_${orderId}`);
              if (reviewProgress) {
                const progress = JSON.parse(reviewProgress);
                // Возвращаем true только если все отзывы заполнены
                return progress.shopReview && progress.productReviews && 
                       progress.productReviews.length === progress.totalProducts;
              }
              
              // Fallback - проверяем старую логику
              return submittedReviews.has(orderId);
            }
          } catch (error) {
            console.error('Error parsing actionUrl:', error);
          }
          return false;
        };

        // Функция для получения прогресса заполнения отзывов
        const getReviewProgress = (notif) => {
          if (notif.type !== 'review_request') return null;
          
          try {
            if (notif.actionUrl) {
              const url = new URL(notif.actionUrl);
              const orderId = url.searchParams.get('orderId');
              if (!orderId) return null;
              
              const reviewProgress = localStorage.getItem(`reviewProgress_${orderId}`);
              if (reviewProgress) {
                return JSON.parse(reviewProgress);
              }
            }
          } catch (error) {
            console.error('Error getting review progress:', error);
          }
          return null;
        };

        // Функция для получения текста уведомления в зависимости от прогресса
        const getNotificationText = (notif) => {
          if (notif.type !== 'review_request') {
            // Для других типов уведомлений переводим сообщение, если оно начинается с 'reviews.'
            const message = notif.message || notif.text;
            return message.startsWith('reviews.') ? t(message) : message;
          }
          
          const progress = getReviewProgress(notif);
          if (!progress) {
            // Если нет прогресса, переводим сообщение из backend
            const message = notif.message || notif.text;
            return message.startsWith('reviews.') ? t(message) : message;
          }
          
          const { shopReview, productReviews, totalProducts } = progress;
          const completedProducts = productReviews ? productReviews.length : 0;
          
          if (!shopReview && completedProducts === 0) {
            return t('reviews.modal.title');
          } else if (!shopReview) {
            return t('reviews.progress.shopReviewPending', { completedProducts, totalProducts });
          } else if (completedProducts < totalProducts) {
            return t('reviews.progress.productsRemaining', { remaining: totalProducts - completedProducts, totalProducts });
          } else {
            return t('reviews.progress.completed');
          }
        };

        // Функция для проверки, было ли уведомление выполнено
        const isNotificationCompleted = (notif) => {
          // Проверяем, было ли уведомление выполнено (например, переход по ссылке)
          return completedNotifications.has(notif.id);
        };

        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              p: { xs: 2, md: 4 },
              maxWidth: { xs: '100%', md: 1100 },
              minWidth: { xs: 'auto', md: 1100 },
              minHeight: 320,
              margin: '0 auto',
              mt: 0,
              position: 'relative',
              left: { xs: 0, md: '-80px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 4, 
                borderBottom: '2px solid #f0f0f0', 
                pb: 2,
                width: '100%'
              }}>
              {createHeader(t('profile.header.notifications'))}
                {notifications.length > 0 && (
                  <Button 
                    variant="contained" 
                    onClick={handleDeleteAllNotifications} 
                    startIcon={<Delete />} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: { xs: 14, md: 15 },
                      px: { xs: 2, md: 3 },
                      py: 1.5,
                      height: 44,
                      boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                      textTransform: 'none',
                      minWidth: { xs: '100%', md: 120 },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                    }}
                  >
                    {t('profile.notifications.deleteAll')}
                  </Button>
                )}
              </Box>
              {loadingNotifications ? (
                <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>Загрузка...</Typography>
              ) : errorNotifications ? (
                <Typography sx={{ textAlign: 'center', color: '#d32f2f', fontSize: 18, mt: 6 }}>{errorNotifications}</Typography>
              ) : notifications.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>
                  {t('common.noNotifications')}
                </Typography>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  width: '100%',
                  maxWidth: { xs: '100%', md: 1000 }
                }}>
                  {notifications.map((notif) => {
                    const isSubmitted = isReviewSubmitted(notif);
                    const isCompleted = isNotificationCompleted(notif);
                    const progress = getReviewProgress(notif);
                    const isReviewActive = notif.type === 'review_request' && progress && !isSubmitted;
                    
                    return (
                    <Box
                      key={notif.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: { xs: 2, md: 3 },
                        p: { xs: 2, md: 3 },
                        border: isSubmitted || isCompleted ? '1px solid #e0e0e0' : (notif.isRead ? '1px solid #e0e0e0' : '2px solid #ff0844'),
                        borderRadius: 3,
                        backgroundColor: isSubmitted || isCompleted ? '#f5f5f5' : (notif.isRead ? '#fafafa' : '#fff4f4'),
                        boxShadow: isSubmitted || isCompleted ? 'none' : (notif.isRead ? 'none' : '0 2px 8px rgba(255,8,68,0.08)'),
                        transition: 'all 0.2s',
                        position: 'relative',
                        opacity: isSubmitted || isCompleted ? 0.6 : 1,
                        width: '100%',
                        '&:hover': {
                          boxShadow: isSubmitted || isCompleted ? 'none' : '0 4px 16px rgba(255,8,68,0.12)',
                          backgroundColor: isSubmitted || isCompleted ? '#f5f5f5' : '#fff0f0',
                        }
                      }}
                    >
                      {getNotificationIcon(notif.type)}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ 
                          fontWeight: 600, 
                          color: isSubmitted || isCompleted ? '#999' : (notif.isRead ? '#888' : '#ff0844'), 
                          fontSize: { xs: 14, md: 16 },
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {notif.title.startsWith('reviews.') ? t(notif.title) : notif.title}
                        </Typography>
                        <Typography sx={{ 
                          color: '#333', 
                          fontSize: { xs: 13, md: 15 }, 
                          mt: 1, 
                          mb: 1,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: 1.4
                        }}>
                          {getNotificationText(notif)}
                        </Typography>
                        <Typography sx={{ 
                          color: '#999', 
                          fontSize: { xs: 11, md: 13 } 
                        }}>
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </Typography>
                        {notif.actionUrl && notif.actionText && !isSubmitted && !isCompleted && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleNotificationAction(notif)}
                            sx={{ 
                              mt: 1, 
                              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                              color: '#fff',
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize: { xs: 14, md: 15 },
                              px: { xs: 2, md: 3 },
                              py: 1.5,
                              height: 44,
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                              textTransform: 'none',
                              minWidth: { xs: '100%', md: 120 },
                              '&:hover': {
                                background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                                transform: 'translateY(-1px)'
                              },
                            }}
                          >
                            {notif.actionText.startsWith('reviews.') ? t(notif.actionText) : notif.actionText}
                          </Button>
                        )}
                        {isSubmitted && (
                          <Typography sx={{ 
                            mt: 1, 
                            color: '#4caf50', 
                            fontSize: { xs: 11, md: 12 }, 
                            fontWeight: 600 
                          }}>
                            {t('profile.notifications.reviewSubmitted')}
                          </Typography>
                        )}
                        {isCompleted && !isSubmitted && (
                          <Typography sx={{ 
                            mt: 1, 
                            color: '#2196f3', 
                            fontSize: { xs: 11, md: 12 }, 
                            fontWeight: 600 
                          }}>
                            {t('profile.notifications.completed')}
                          </Typography>
                        )}
                      </Box>
                      <IconButton 
                        onClick={() => handleDeleteNotification(notif.id)} 
                        size="small" 
                        sx={{ 
                          ml: { xs: 0.5, md: 1 }, 
                          color: '#ff1744',
                          minWidth: 'auto'
                        }} 
                        title={t('profile.notifications.deleteNotification')}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      {!isSubmitted && !isCompleted && !notif.isRead && (
                        <Box sx={{ 
                          width: { xs: 8, md: 12 }, 
                          height: { xs: 8, md: 12 }, 
                          borderRadius: '50%', 
                          background: '#ff0844', 
                          mt: 0.5 
                        }} />
                      )}
                    </Box>
                  );
                })}
                </Box>
              )}
            </Box>
          </Box>
        );
      }
      case 'orders':
        // Функции для работы с заказами
       



        const formatPrice = (price) => {
          return `${price} ₪`;
        };

        const getStatusColor = (status) => {
          switch (status) {
            case 'pending': return '#ff6b35';
            case 'confirmed': return '#2196f3';
            case 'ready': return '#9c27b0';
            case 'pickedup': return '#4caf50';
            case 'cancelled': return '#f44336';
            default: return '#666';
          }
        };

        const getStatusGradient = (status) => {
          switch (status) {
            case 'pending': return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
            case 'confirmed': return 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)';
            case 'ready': return 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)';
            case 'pickedup': return 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
            case 'cancelled': return 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)';
            default: return 'linear-gradient(135deg, #666 0%, #999 100%)';
          }
        };

        const getStatusIcon = (status) => {
          switch (status) {
            case 'pending': return '⏳';
            case 'confirmed': return '✓';
            case 'ready': return '📦';
            case 'pickedup': return '✓';
            case 'cancelled': return '❌';
            default: return '•';
          }
        };

        const getStatusText = (status) => {
          switch (status) {
            case 'pending': return t('profile.orders.status.pending');
            case 'confirmed': return t('profile.orders.status.confirmed');
            case 'ready': return t('profile.orders.status.ready');
            case 'pickedup': return t('profile.orders.status.pickedup');
            case 'cancelled': return t('profile.orders.status.cancelled');
            default: return status;
          }
        };

        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              p: { xs: 2, md: 4 },
              maxWidth: { xs: '100%', md: 1100 },
              minWidth: { xs: 'auto', md: 1100 },
              minHeight: 320,
              margin: '0 auto',
              mt: 0,
              position: 'relative',
              left: { xs: 0, md: '-80px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              {/* Заголовок с серой линией */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 4,
                borderBottom: '2px solid #f0f0f0',
                pb: 2,
                width: '100%'
              }}>
              {createHeader(t('profile.header.orders'))}
              </Box>
              
              {ordersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <CircularProgress />
                </Box>
              ) : orders.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>
                  {t('profile.orders.empty')}
                </Typography>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  width: '100%',
                  maxWidth: { xs: '100%', md: 1000 }
                }}>
                  {orders.map((order) => (
                    <Box
                      key={order.id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 4,
                        p: { xs: 2, md: 4 },
                        backgroundColor: '#fff',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        width: '100%',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          background: getStatusGradient(order.status),
                          borderRadius: '0 2px 2px 0'
                        },
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          transform: 'translateY(-4px)',
                          borderColor: getStatusColor(order.status) + '40'
                        }
                      }}
                    >
                      {/* Заголовок заказа */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                        alignItems: { xs: 'flex-start', md: 'center' },
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 2, md: 0 },
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid #e0e0e0'
                      }}>
                        <Box>
                          <Typography sx={{ 
                            fontWeight: 600, 
                            color: '#333', 
                            fontSize: { xs: 14, md: 16 } 
                          }}>
                            {t('profile.orders.orderN', { id: order.id })}
                          </Typography>
                          <Typography sx={{ 
                            color: '#666', 
                            fontSize: { xs: 12, md: 14 } 
                          }}>
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: { xs: 0.5, md: 1 },
                          flexDirection: { xs: 'row', md: 'row' }
                        }}>
                          <Box sx={{ 
                            display: 'inline-block', 
                            px: { xs: 1.5, md: 2 }, 
                            py: 0.5, 
                            borderRadius: 1, 
                            backgroundColor: getStatusColor(order.status) + '20',
                            color: getStatusColor(order.status),
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            fontWeight: 'medium'
                          }}>
                            {getStatusText(order.status)}
                          </Box>
                          {(order.status === 'pickedup' || order.status === 'cancelled') && (
                            <IconButton 
                              onClick={() => handleHideOrder(order.id)} 
                              size="small" 
                              sx={{ 
                                ml: { xs: 0.5, md: 1 },
                                color: '#ff1744',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 23, 68, 0.1)',
                                  color: '#d50000'
                                }
                              }} 
                              title={t('profile.orders.removeFromList')}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* Товары в заказе */}
                      <Box sx={{ mb: 2 }}>
                        {order.items?.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: { xs: 2, md: 3 },
                              p: { xs: 2, md: 3 },
                              mb: 2,
                              backgroundColor: '#fafafa',
                              borderRadius: 3,
                              border: '1px solid #e8e8e8',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                                transform: 'translateX(4px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: { xs: 50, md: 70 },
                                height: { xs: 50, md: 70 },
                                borderRadius: 3,
                                background: item.product?.imageUrls && item.product.imageUrls.length > 0
                                  ? `center/cover no-repeat url(${getImageUrl(item.product.imageUrls[0])})` 
                                  : '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: '2px solid #fff',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }
                              }}
                            >
                              {(!item.product?.imageUrls || item.product.imageUrls.length === 0) && (
                                <img 
                                  src="/photography.jpg" 
                                  alt="Фото товара"
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover', 
                                    borderRadius: '8px',
                                    opacity: 0.5
                                  }} 
                                />
                              )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ 
                                fontWeight: 500, 
                                color: '#333', 
                                fontSize: { xs: 12, md: 14 } 
                              }}>
                                {item.product ? getTranslatedName(item.product) : t('common.productNotFound')}
                              </Typography>
                              <Typography sx={{ 
                                color: '#666', 
                                fontSize: { xs: 10, md: 12 } 
                              }}>
                                {t('common.quantity')}: {item.quantity}
                              </Typography>
                            </Box>
                            <Typography sx={{ 
                              fontWeight: 600, 
                              color: '#333', 
                              fontSize: { xs: 14, md: 16 } 
                            }}>
                              {formatPrice(item.price * item.quantity)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Итого */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pt: 2,
                        borderTop: '1px solid #e0e0e0'
                      }}>
                        <Typography sx={{ 
                          fontWeight: 600, 
                          color: '#333', 
                          fontSize: { xs: 14, md: 16 } 
                        }}>
                          {t('profile.orders.total')}
                        </Typography>
                        <Typography sx={{ 
                          fontWeight: 700, 
                          color: '#ff0844', 
                          fontSize: { xs: 16, md: 18 } 
                        }}>
                          {formatPrice(order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}
                        </Typography>
                      </Box>


                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );
      case 'reviews':
        // Используем отзывы, загруженные на уровне компонента

        const getReviewTypeIcon = (type) => {
          return type === 'review' ? '⭐' : '❓';
        };

        const getReviewTypeColor = (type) => {
          return type === 'review' ? '#ff9800' : '#2196f3';
        };



        const renderStars = (rating) => {
          return '★'.repeat(rating) + '☆'.repeat(5 - rating);
        };

        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              p: { xs: 2, md: 4 },
              maxWidth: { xs: '100%', md: 1100 },
              minWidth: { xs: 'auto', md: 1100 },
              minHeight: 320,
              margin: '0 auto',
              mt: 0,
              position: 'relative',
              left: { xs: 0, md: '-80px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              {/* Заголовок с серой линией */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 4,
                borderBottom: '2px solid #f0f0f0',
                pb: 2,
                width: '100%'
              }}>
              {createHeader(t('profile.header.reviews'))}
              </Box>
              
              {reviewsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : userReviews.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>
                  {t('common.noReviews')}
                </Typography>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  width: '100%',
                  maxWidth: { xs: '100%', md: 1000 }
                }}>
                  {userReviews.map((review) => (
                    <Box
                      key={review.id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 3,
                        p: { xs: 2, md: 3 },
                        backgroundColor: '#fafafa',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {/* Заголовок */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                        alignItems: { xs: 'flex-start', md: 'flex-start' },
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 2, md: 0 },
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid #e0e0e0'
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: { xs: 1.5, md: 2 },
                          flexDirection: { xs: 'row', md: 'row' }
                        }}>
                          <Box
                            sx={{
                              width: { xs: 40, md: 50 },
                              height: { xs: 40, md: 50 },
                              borderRadius: 2,
                              backgroundColor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={review.productImage && review.productImage.startsWith('/') ? review.productImage : (review.productImage ? getImageUrl(review.productImage) : '/photography.jpg')}
                              alt="Фото товара"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                            onError={(e) => {
                                e.target.src = '/photography.jpg';
                            }}
                          />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ 
                                fontWeight: 600, 
                                color: '#333', 
                              fontSize: { xs: 14, md: 16 },
                              mb: 1,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                              }}>
                                {review.productName}
                              </Typography>
                            <Typography sx={{ 
                              color: '#666', 
                              fontSize: { xs: 12, md: 14 } 
                            }}>
                              {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Кнопка удаления */}
                        <IconButton 
                          onClick={() => {
                            if (review.type === 'review') {
                              handleHideProductReview(review.id);
                            } else {
                              handleHideShopReview(review.id);
                            }
                          }}
                          size="small" 
                          sx={{ 
                            ml: { xs: 0, md: 1 }, 
                            color: '#ff1744',
                            alignSelf: { xs: 'flex-end', md: 'flex-start' }
                          }} 
                          title="Удалить из профиля"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Содержание */}
                      <Box sx={{ mb: 2 }}>
                        {review.type === 'review' && review.rating && (
                          <Typography sx={{ 
                            color: '#ff9800', 
                            fontSize: { xs: 16, md: 18 }, 
                            mb: 1 
                          }}>
                            {renderStars(review.rating)}
                          </Typography>
                        )}
                        <Typography sx={{ 
                          color: '#666', 
                          fontSize: { xs: 13, md: 14 }, 
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {review.comment || review.text || 'Комментарий отсутствует'}
                        </Typography>
                      </Box>

                      {/* Ответ (если есть) */}
                      {review.answer && (
                        <Box sx={{ 
                          mt: 2, 
                          p: { xs: 1.5, md: 2 }, 
                          backgroundColor: '#e3f2fd', 
                          borderRadius: 2,
                          border: '1px solid #2196f3'
                        }}>
                          <Typography sx={{ 
                            fontWeight: 600, 
                            color: '#1976d2', 
                            fontSize: { xs: 13, md: 14 }, 
                            mb: 1 
                          }}>
                            Ответ:
                          </Typography>
                          <Typography sx={{ 
                            color: '#333', 
                            fontSize: { xs: 13, md: 14 }, 
                            lineHeight: 1.6,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {review.answer}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );
      case 'wishlist':
        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            {localWishlist && localWishlist.length === 0 ? (
                                          <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>{t('common.noWishlistItems')}</Typography>
            ) : (
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 4 },
                maxWidth: { xs: '100%', md: 1100 },
                minWidth: { xs: 'auto', md: 1100 },
                minHeight: 320,
                margin: '0 auto',
                mt: 0,
                position: 'relative',
                left: { xs: 0, md: '-80px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {/* Заголовок и кнопка в одной строке */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 2,
                  width: '100%'
                }}>
              {createHeader(t('profile.header.wishlist'))}
                  
                  {localWishlist && localWishlist.length > 0 && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setClearDialogOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: 14, md: 15 },
                        px: { xs: 2, md: 3 },
                        py: 1.5,
                        height: 44,
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                        textTransform: 'none',
                        minWidth: { xs: '100%', md: 120 },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                      }}
                    >
                      {t('profile.wishlist.clearButton')}
                    </Button>
                  )}
                </Box>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: 2,
                  justifyItems: 'center',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'start' },
                  maxWidth: 1100,
                  margin: '0 auto',
                }}>
                  {localWishlist.map(item => (
                    <ProductCard
                      key={item.product?.id || item.id}
                      product={item.product}
                      user={user}
                      inWishlist={true}
                      onWishlistToggle={handleWishlistToggle}
                      onAddToCart={handleAddToCart}
                      cart={cart}
                      onChangeCartQuantity={handleChangeCartQuantity}
                      onEditProduct={onEditProduct}
                      viewMode="grid"
                    />
                  ))}
                  {Array.from({ length: Math.max(0, 4 - localWishlist.length) }).map((_, idx) => (
                    <Box key={`empty-wishlist-${idx}`} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );
      case 'viewed':
        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            {localViewed && localViewed.length === 0 ? (
                                          <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>{t('common.noViewedProducts')}</Typography>
            ) : (
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 4 },
                maxWidth: { xs: '100%', md: 1100 },
                minWidth: { xs: 'auto', md: 1100 },
                minHeight: 320,
                margin: '0 auto',
                mt: 0,
                position: 'relative',
                left: { xs: 0, md: '-80px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {/* Заголовок и кнопка в одной строке */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 2,
                  width: '100%'
                }}>
              {createHeader(t('profile.header.viewed'))}
                  
                  {localViewed && localViewed.length > 0 && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setClearViewedDialogOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: 14, md: 15 },
                        px: { xs: 2, md: 3 },
                        py: 1.5,
                        height: 44,
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                        textTransform: 'none',
                        minWidth: { xs: '100%', md: 120 },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                      }}
                    >
                      {t('profile.viewed.clearButton')}
                    </Button>
                  )}
                </Box>
                
                                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: 2,
                  justifyItems: 'center',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'start' },
                  maxWidth: 1100,
                  margin: '0 auto',
                }}>
                  {localViewed.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      user={user}
                      isViewed={true}
                      onRemoveViewed={() => handleRemoveViewed(product.id)}
                      onAddToCart={handleAddToCart}
                      cart={cart}
                      onChangeCartQuantity={handleChangeCartQuantity}
                      onEditProduct={onEditProduct}
                      viewMode="grid"
                    />
                  ))}
                </Box>
              </Box>
            )}

          </Box>
        );
      case 'profile':
        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              p: { xs: 2, md: 4 },
              maxWidth: { xs: '100%', md: 1100 },
              minWidth: { xs: 'auto', md: 1100 },
              minHeight: 320,
              margin: '0 auto',
              mt: 0,
              position: 'relative',
              left: { xs: 0, md: '-80px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              {/* Заголовок с серой линией */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 4,
                borderBottom: '2px solid #f0f0f0',
                pb: 2,
                width: '100%'
              }}>
              {createHeader(t('profile.header.personalData'))}
              </Box>
              <Typography sx={{ color: '#888', fontSize: 16, mb: 3, textAlign: 'center' }}>
                {profileLoading ? t('profile.personal.loading') : t('profile.personal.hint')}
              </Typography>
              <Box component="form" onSubmit={handleProfileSave} sx={{ width: '100%', maxWidth: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField 
                  label={t('profile.fields.firstName')} 
                  name="name" 
                  value={profileForm.name} 
                  onChange={handleProfileInput} 
                  variant="outlined" 
                  fullWidth 
                  disabled={profileLoading}
                />
                <TextField 
                  label={t('profile.fields.lastName')} 
                  name="surname" 
                  value={profileForm.surname} 
                  onChange={handleProfileInput} 
                  variant="outlined" 
                  fullWidth 
                  disabled={profileLoading}
                />
                <TextField 
                  label="Email" 
                  name="email" 
                  value={profileForm.email} 
                  onChange={handleProfileInput} 
                  variant="outlined" 
                  type="email" 
                  fullWidth 
                  disabled={profileLoading}
                />
                <TextField 
                  label={t('profile.fields.phone')} 
                  name="phone" 
                  value={profileForm.phone} 
                  onChange={handleProfileInput} 
                  variant="outlined" 
                  type="tel" 
                  fullWidth 
                  disabled={profileLoading}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={profileLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    px: { xs: 2, md: 3 },
                    py: 1.5,
                    height: 44,
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: 160 },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  {profileLoading ? <CircularProgress size={24} color="inherit" /> : t('common.save')}
                </Button>
              </Box>
            </Box>
          </Box>
        );

      case 'auth':
        return (
          <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              p: { xs: 2, md: 4 },
              maxWidth: { xs: '100%', md: 1100 },
              minWidth: { xs: 'auto', md: 1100 },
              minHeight: 320,
              margin: '0 auto',
              mt: 0,
              position: 'relative',
              left: { xs: 0, md: '-80px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              {/* Заголовок с серой линией */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 4,
                borderBottom: '2px solid #f0f0f0',
                pb: 2,
                width: '100%'
              }}>
              {createHeader(t('profile.header.authSettings'))}
              </Box>
              
              {/* Смена пароля */}
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Lock sx={{ color: '#ff0844', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                    {t('profile.auth.changePassword')}
                  </Typography>
                </Box>
                
                <Box component="form" onSubmit={handlePasswordSave} sx={{ maxWidth: { xs: '100%', md: 500 } }}>
                  {/* Показываем поле "Текущий пароль" только для пользователей с паролем */}
                  {profileData?.hasPassword && (
                    <TextField
                      label={t('profile.auth.currentPassword')}
                      name="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInput}
                      variant="outlined"
                      fullWidth
                      required
                      disabled={passwordLoading}
                      sx={{ mb: 3 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('current')}
                              edge="end"
                            >
                              {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  
                  {/* Информация для OAuth пользователей */}
                  {!profileData?.hasPassword && (
                    <Box sx={{ 
                      mb: 3, 
                      p: 2, 
                      bgcolor: '#f0f8ff', 
                      borderRadius: 2, 
                      border: '1px solid #e3f2fd' 
                    }}>
                      <Typography sx={{ color: '#1976d2', fontSize: 14, fontWeight: 500 }}>
                        {t('profile.auth.oauthInfo', { provider: profileData?.googleId ? 'Google' : 'Facebook' })}
                      </Typography>
                    </Box>
                  )}
                  
                  <TextField
                    label={t('profile.auth.newPassword')}
                    name="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInput}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={passwordLoading}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    label={t('profile.auth.confirmNewPassword')}
                    name="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInput}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={passwordLoading}
                    sx={{ mb: 4 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={passwordLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: { xs: 14, md: 15 },
                      px: { xs: 2, md: 3 },
                      py: 1.5,
                      height: 44,
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      textTransform: 'none',
                      minWidth: { xs: '100%', md: 120 },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                    }}
                  >
                    {passwordLoading ? <CircularProgress size={24} color="inherit" /> : t('profile.auth.changePassword')}
                  </Button>
                </Box>
              </Box>
              
              {/* Подключенные аккаунты */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AccountCircle sx={{ color: '#ff0844', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                    {t('profile.auth.connectedAccounts')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Google */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', md: 'space-between' },
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 0 },
                    p: { xs: 2, md: 3 },
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    background: '#fafafa'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Google sx={{ color: '#4285f4', fontSize: 24 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#333' }}>
                          Google
                        </Typography>
                        <Typography sx={{ color: '#666', fontSize: 14 }}>
                          {profileData?.googleId ? t('profile.auth.connected') : t('profile.auth.notConnected')}
                        </Typography>
                      </Box>
                    </Box>
                                          <Button
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                          color: '#fff',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: { xs: 14, md: 15 },
                          px: { xs: 2, md: 3 },
                          py: 1.5,
                          height: 44,
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                          textTransform: 'none',
                          minWidth: { xs: '100%', md: 120 },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                        }}
                      >
                        {profileData?.googleId ? t('profile.auth.disconnect') : t('profile.auth.connect')}
                      </Button>
                  </Box>
                  
                  {/* Facebook */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', md: 'space-between' },
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 0 },
                    p: { xs: 2, md: 3 },
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    background: '#fafafa'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Facebook sx={{ color: '#1877f2', fontSize: 24 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#333' }}>
                          Facebook
                        </Typography>
                        <Typography sx={{ color: '#666', fontSize: 14 }}>
                          {profileData?.facebookId ? t('profile.auth.connected') : t('profile.auth.notConnected')}
                        </Typography>
                      </Box>
                    </Box>
                                          <Button
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                          color: '#fff',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: { xs: 14, md: 15 },
                          px: { xs: 2, md: 3 },
                          py: 1.5,
                          height: 44,
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                          textTransform: 'none',
                          minWidth: { xs: '100%', md: 120 },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                        }}
                      >
                        {profileData?.facebookId ? t('profile.auth.disconnect') : t('profile.auth.connect')}
                      </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  // Проверяем, есть ли флаг skipReload, который указывает на то, что это перезагрузка для переключения вкладки
  const skipReload = localStorage.getItem('skipReload');
  
  // Если пользователь не загружен и нет флага skipReload, перенаправляем на главную
  if (!user && !skipReload) return <Navigate to="/" replace />;
  
  // Если пользователь не загружен, но есть флаг skipReload, показываем загрузку
  if (!user && skipReload) {
    return (
      <Container maxWidth="lg" disableGutters sx={{
        mt: 0,
        mb: 0,
        px: { xs: 0, md: 0 },
        minHeight: 'calc(100vh - var(--appbar-height) - 64px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        pt: { xs: 'var(--appbar-height)', md: 'var(--appbar-height)' },
        pb: { xs: '64px', md: '64px' },
      }}>
        <CircularProgress />
      </Container>
    );
  }
  return (
    <>
      <Container maxWidth="lg" disableGutters sx={{
        mt: 0,
        mb: 0,
        px: { xs: 0, md: 0 },
        minHeight: 'calc(100vh - var(--appbar-height) - 64px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        pt: { xs: 'var(--appbar-height)', md: 'var(--appbar-height)' },
        pb: { xs: '64px', md: '64px' }, // отступ снизу ровно над футером
        ml: { xs: 0, md: '2px' }, // сдвигаем вправо для десктопа (было 0px, теперь +2px)
      }}>
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Боковое меню */}
          <Box
            sx={{
              width: 260,
              flexShrink: 0,
              borderRight: '1px solid #eee',
              background: '#fafbfc',
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 'var(--appbar-height)',
              height: 'fit-content',
              mt: -11.5, // сдвигаем на 92px вверх (92px = 11.5 * 8px)
              alignSelf: 'flex-start',
              ml: { xs: 0, md: '2px' }, // дополнительный сдвиг вправо (было 0px, теперь +2px)
            }}
          >
            <Box sx={{ overflow: 'auto', pt: 2 }}>
              <List>
                <ListItem 
                  button 
                  selected={selectedSection === 'myprofile'} 
                  onClick={() => setSelectedSection('myprofile')}
                  sx={selectedSection === 'myprofile' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.myProfile')} />
                </ListItem>
                <ListItem 
                  button 
                  selected={selectedSection === 'notifications'} 
                  onClick={() => setSelectedSection('notifications')}
                  sx={selectedSection === 'notifications' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><NotificationsIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.notifications')} />
                </ListItem>
                <ListItem 
                  button 
                  selected={selectedSection === 'orders'} 
                  onClick={() => setSelectedSection('orders')}
                  sx={selectedSection === 'orders' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.orders')} />
                </ListItem>
                <ListItem 
                  button 
                  selected={selectedSection === 'wishlist'} 
                  onClick={() => setSelectedSection('wishlist')}
                  sx={selectedSection === 'wishlist' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><FavoriteIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.wishlist')} />
                </ListItem>
                <ListItem 
                  button 
                  selected={selectedSection === 'viewed'} 
                  onClick={() => setSelectedSection('viewed')}
                  sx={selectedSection === 'viewed' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><VisibilityIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.viewed')} />
                </ListItem>
                <ListItem 
                  button 
                  selected={selectedSection === 'profile'} 
                  onClick={() => setSelectedSection('profile')}
                  sx={selectedSection === 'profile' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.personalData')} />
                </ListItem>
                <ListItem 
                  button 
                  selected={selectedSection === 'reviews'} 
                  onClick={() => setSelectedSection('reviews')}
                  sx={selectedSection === 'reviews' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><QuestionAnswerIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.reviews')} />
                </ListItem>
                <ListItem 
                  button 
                  selected={selectedSection === 'auth'} 
                  onClick={() => setSelectedSection('auth')}
                  sx={selectedSection === 'auth' ? {
                    backgroundColor: '#f5f5f5',
                    color: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  } : {
                    borderRadius: 2,
                    color: 'inherit',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon><SettingsIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.authSettings')} />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => setLogoutDialogOpen(true)}
                  sx={{
                    borderRadius: 2,
                    color: '#f44336',
                    cursor: 'pointer',
                    '& .MuiListItemIcon-root': { color: '#f44336' },
                    '&:hover': {
                      backgroundColor: '#ffebee',
                      color: '#d32f2f',
                      '& .MuiListItemIcon-root': { color: '#d32f2f' }
                    }
                  }}
                >
                  <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                  <ListItemText primary={t('profile.menu.logout')} />
                </ListItem>
              </List>
            </Box>
          </Box>
          {/* Контент */}
          <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, minHeight: 0, ml: { xs: 0, md: '130px' } }}>
            {renderSection()}
          </Box>
        </Box>
      </Container>
      {/* Диалог выхода */}
      <Dialog 
        open={logoutDialogOpen} 
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#333',
          borderBottom: '2px solid #f0f0f0',
          mb: 2
        }}>
            {t('profile.dialogs.logout.title')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
          <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5 }}>
            {t('profile.dialogs.logout.message')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
          <Button 
            onClick={handleLogoutCancel} 
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
            }}
            variant="contained"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              textTransform: 'none',
              minWidth: 120,
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
            variant="contained"
          >
            {t('profile.dialogs.logout.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления профиля */}
      <Dialog 
        open={deleteProfileDialogOpen} 
        onClose={handleDeleteProfileCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#d32f2f',
          borderBottom: '2px solid #ffebee',
          mb: 2
        }}>
            {t('profile.dialogs.deleteProfile.title')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
          <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5, mb: 2 }}>
            {t('profile.dialogs.deleteProfile.message')}
          </Typography>
          <Typography sx={{ 
            color: '#d32f2f', 
            fontSize: 14, 
            fontWeight: 500,
            backgroundColor: '#ffebee',
            padding: 2,
            borderRadius: 2,
            border: '1px solid #ffcdd2'
          }}>
            {t('profile.dialogs.deleteProfile.warning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
          <Button 
            onClick={handleDeleteProfileCancel} 
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
            }}
            variant="contained"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteProfileConfirm} 
            sx={{
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
              textTransform: 'none',
              minWidth: 120,
              '&:hover': {
                background: 'linear-gradient(135deg, #b71c1c 0%, #8e0000 100%)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
            variant="contained"
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения очистки списка желаний */}
      <Dialog 
        open={clearDialogOpen} 
        onClose={handleClearCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#333',
          borderBottom: '2px solid #f0f0f0',
          mb: 2
        }}>
            {t('profile.dialogs.clearWishlist.title')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
          <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5 }}>
            {t('profile.dialogs.clearWishlist.message')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
          <Button 
            onClick={handleClearCancel} 
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
            }}
            variant="contained"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleClearConfirm} 
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              textTransform: 'none',
              minWidth: 120,
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
            variant="contained"
          >
            {t('common.clear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения очистки просмотренных товаров */}
      <Dialog 
        open={clearViewedDialogOpen} 
        onClose={handleClearViewedCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#333',
          borderBottom: '2px solid #f0f0f0',
          mb: 2
        }}>
            {t('profile.dialogs.clearViewed.title')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
          <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5 }}>
            {t('profile.dialogs.clearViewed.message')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
          <Button 
            onClick={handleClearViewedCancel} 
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
            }}
            variant="contained"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleClearViewedConfirm} 
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              textTransform: 'none',
              minWidth: 120,
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
            variant="contained"
          >
            {t('common.clear')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={profileSaved} autoHideDuration={3000} onClose={() => setProfileSaved(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ zIndex: 20000 }}>
        <Alert onClose={() => setProfileSaved(false)} severity="success" sx={{ width: '100%', fontWeight: 600, fontSize: 16 }}>
          {t('profile.toasts.profileSaved')}
        </Alert>
      </Snackbar>
      <Snackbar open={passwordSaved} autoHideDuration={3000} onClose={() => setPasswordSaved(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ zIndex: 20000 }}>
        <Alert onClose={() => setPasswordSaved(false)} severity="success" sx={{ width: '100%', fontWeight: 600, fontSize: 16 }}>
          {t('profile.toasts.passwordChanged')}
        </Alert>
      </Snackbar>
    </>
  );
}
export default App;