import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductsContext';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Fab,
  Backdrop,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  Slider,
  FormControlLabel,
  Checkbox,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Favorite,
  Person,
  Search,
  Close,
  Home,
  Category,
  Login,
  Logout,
  AdminPanelSettings,
  Notifications,
  Language,
  KeyboardArrowUp,
  Mic as MicIcon,
  Search as SearchIcon,
  FilterList,
  Phone,
  Email,
  Facebook,
  Instagram,
  WhatsApp,
  FormatListBulleted,
  RateReview,
  ContactMail,
  Info,
  Category as CategoryIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Close as CloseIcon,
  ExpandMore,
  ChevronRight
} from '@mui/icons-material';
import { Link as RouterLink, Routes, Route, Navigate } from 'react-router-dom';
import { getImageUrl, API_BASE_URL } from '../config';
import { getTranslatedName } from '../utils/translationUtils';
import { transformCategoriesForNavigation } from '../utils/categoryIcon';
import { getSpeechRecognitionLanguage, getSpeechRecognitionErrorMessage, isSpeechRecognitionSupported } from '../utils/speechRecognitionUtils';
import { useDeviceType } from '../utils/deviceDetection';
import Lenis from 'lenis';
import LazyImage from './LazyImage';
import ElegantProductCarousel from './ElegantProductCarousel';
import ProductCard from './ProductCard';
import CustomSelect from './CustomSelect';
import LanguageSwitcher from './LanguageSwitcher';
import AuthModal from './AuthModal';
import EditProductModal from './EditProductModal';
import ReviewForm from './ReviewForm';
import ScrollToTopButton from './ScrollToTopButton';
import HomePage from './HomePage';
import CatalogPage from './CatalogPage';
import CategoryPage from './CategoryPage';
import SubcategoryPage from './SubcategoryPage';
import ProductPage from './ProductPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import OrderSuccessPage from './OrderSuccessPage';
import WishlistPage from './WishlistPage';
import UserCabinetPage from './UserCabinetPage';
import SearchResultsPage from './SearchResultsPage';
import ConfirmEmailPage from './ConfirmEmailPage';
import OAuthSuccessPage from './OAuthSuccessPage';
import AboutPage from './AboutPage';
import ReviewsPage from './ReviewsPage';
import ContactsPage from './ContactsPage';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import PublicQuestions from './PublicQuestions';
import AttributionPage from './AttributionPage';
import TestReviews from './TestReviews';
import TestProductReviews from './TestProductReviews';
import ReviewPage from './ReviewPage';
import CMSProducts from './cms/CMSProducts';
import CMSCategories from './cms/CMSCategories';
import CMSPage from './cms/CMSPage';
import CMSOrders from './cms/CMSOrders';
import AdminUsers from './AdminUsers';
import AdminShopReviews from './AdminShopReviews';
import AdminProductReviews from './AdminProductReviews';
import AdminQuestions from './AdminQuestions';
import BulkImportProducts from './BulkImportProducts';
import BoysToysPage from './BoysToysPage';
import GirlsToysPage from './GirlsToysPage';
import CustomerReviews from './CustomerReviews';
// Компонент навигации
function Navigation({ cartCount, user, userLoading, handleLogout, setAuthOpen, profileLoading, onOpenSidebar, mobileOpen, setMobileOpen, appBarRef, drawerOpen, setDrawerOpen, miniCartOpen, setMiniCartOpen, cart, onChangeCartQuantity, onRemoveFromCart, dbCategories, selectedGenders, onGendersChange, products, selectedBrands, setSelectedBrands, selectedAgeGroups, setSelectedAgeGroups, mobileFiltersOpen, setMobileFiltersOpen, priceRange, setPriceRange, filtersMenuOpen, setFiltersMenuOpen, desktopSearchBarRef, isClosingFilters, setIsClosingFilters, savedScrollY, setSavedScrollY, isRestoringScroll, setIsRestoringScroll, lastFilterCloseTime, setLastFilterCloseTime, shouldPreventGlobalScroll, setShouldPreventGlobalScroll }) {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const deviceType = useDeviceType();
    // Viewport-based breakpoints
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
    const isNarrow = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
    const isMediumOrSmaller = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px (включает md)
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
    // (закомментировано, так как дублируется в AppContent)
    // useEffect(() => {
    //   // Плавная прокрутка наверх при переходе на новую страницу
    //   window.scrollTo({
    //     top: 0,
    //     left: 0,
    //     behavior: 'smooth'
    //   });
    // }, [location.pathname]);
  
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
      '0-1 год',
      '1-3 года',
      '3-5 лет',
      '5-7 лет',
      '7-10 лет',
      '10-12 лет',
      '12-14 лет',
      '14-16 лет'
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
            
            const imagePath = cat.image || cat.icon;
            console.log('🔍 AppContent: Processing category:', cat.name, 'imagePath:', imagePath, 'cat.icon:', cat.icon, 'cat.image:', cat.image);
            
            if (imagePath) {
              // Если изображение содержит временную метку (175...), это загруженный файл
              if (imagePath.match(/^175\d+/)) {
                iconPath = `${API_BASE_URL}/uploads/${imagePath}?t=${Date.now()}`;
                console.log('✅ AppContent: Uploaded file detected:', iconPath);
              } else {
                // Если это старый файл из public папки или fallback иконка
                iconPath = `${API_BASE_URL}/public/${imagePath}?t=${Date.now()}`;
                console.log('✅ AppContent: Static file detected:', iconPath);
              }
            } else {
              // Если нет изображения, используем fallback
              iconPath = getCategoryIcon(cat.name) || '/toys.png';
              console.log('✅ AppContent: Fallback icon:', iconPath);
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
        
        const imagePath = cat.icon || cat.image;
        if (imagePath) {
          // Если изображение содержит временную метку (175...), это загруженный файл
          if (imagePath.match(/^175\d+/)) {
            iconPath = `${API_BASE_URL}/uploads/${imagePath}`;
          } else {
            // Если это старый файл из public папки или fallback иконка
            iconPath = `/${imagePath}`;
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
    const shouldHideCategories = (location.pathname === '/privacy' || location.pathname === '/terms' || location.pathname === '/attribution' || location.pathname.startsWith('/product/')) && isDesktop;
    
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
        return;
      }
      
      // Очищаем предыдущий объект распознавания
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Error stopping previous recognition
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
          setIsListening(false); 
          setInterimTranscript(""); 
        };
        
  
      } catch (error) {
        console.error('Navigation: Error initializing speech recognition:', error);
      }
    }, [i18n.language]);
  
    const handleMicClick = () => {
      if (recognitionRef.current) {
        try {
          // Очищаем предыдущие результаты при новом нажатии на микрофон
          setSearchValue("");
          setInterimTranscript("");
          
          // Убеждаемся, что язык установлен правильно перед запуском
          recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
          setIsListening(true);
          recognitionRef.current.start();
        } catch (error) {
          console.error('Navigation: Error in handleMicClick:', error);
          setIsListening(false);
        }
      } else {
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
              // Lenis wrapper for Drawer
            } else {
              // Lenis wrapper for Drawer paper
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
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mr: { xs: 0.5, sm: 1, md: 2 },
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none !important',
                    '&:focus': {
                      outline: 'none !important',
                      boxShadow: 'none !important'
                    },
                    '&:focus-visible': {
                      outline: 'none !important',
                      boxShadow: 'none !important'
                    },
                    '&:active': {
                      outline: 'none !important',
                      boxShadow: 'none !important'
                    },
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                  tabIndex={-1}
                  onClick={() => navigate('/')}
                >
                  <Box
                    sx={{
                      width: isDesktop ? 57 : (isNarrow ? 45 : 40),
                      height: isDesktop ? 57 : (isNarrow ? 45 : 40),
                      backgroundImage: 'url("/lion-logo.png")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      filter: 'drop-shadow(0 0 0px rgba(255, 102, 0, 0))',
                      transition: 'filter 0.3s ease',
                      outline: 'none !important',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      userSelect: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitAppearance: 'none',
                      border: 'none',
                      '&:focus': {
                        outline: 'none !important',
                        boxShadow: 'none !important'
                      },
                      '&:focus-visible': {
                        outline: 'none !important',
                        boxShadow: 'none !important'
                      },
                      '&:active': {
                        outline: 'none !important',
                        boxShadow: 'none !important'
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 12px rgba(255, 102, 0, 0.9)) drop-shadow(0 0 24px rgba(255, 102, 0, 0.6)) drop-shadow(0 0 36px rgba(255, 102, 0, 0.3))';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 0px rgba(255, 102, 0, 0))';
                    }}
                    onMouseDown={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 15px rgba(255, 102, 0, 1)) drop-shadow(0 0 30px rgba(255, 102, 0, 0.8)) drop-shadow(0 0 45px rgba(255, 102, 0, 0.6))';
                    }}
                    onMouseUp={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 0px rgba(255, 102, 0, 0))';
                    }}
                    onTouchStart={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 15px rgba(255, 102, 0, 1)) drop-shadow(0 0 30px rgba(255, 102, 0, 0.8)) drop-shadow(0 0 45px rgba(255, 102, 0, 0.6))';
                    }}
                    onTouchEnd={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 0px rgba(255, 102, 0, 0))';
                    }}
                    tabIndex={-1}
                  />
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
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                        // Принудительная перезагрузка при навигации с checkout страницы
                        if (window.location.pathname === '/checkout') {
                          setTimeout(() => window.location.reload(), 100);
                        }
                      }}
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
              {!isMediumOrSmaller && (
              <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                {/* Кнопка CMS для админа */}
                {!userLoading && user?.role === 'admin' && (
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
                {!userLoading && user && user.role !== 'admin' && (
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
                  {!userLoading && user ? (
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
                  ) : !userLoading ? (
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
                  ) : null}
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
       <img src="/iconcart.png" alt="cart" style={{ width: 32, height: 32, display: 'block', filter: 'brightness(0) invert(1)', objectFit: 'contain', position: 'relative', top: '7px' }} />
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
              )}
  
              {/* Корзина и язык для мобильных - справа */}
              {isMediumOrSmaller && (
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
                      <ShoppingCartIcon sx={{ fontSize: 24 }} />
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
           !userLoading && user?.role !== 'admin' && isDesktop && (
            <>
            <Box sx={{ 
              position: 'absolute',
              top: '4px',
              left: 0,
              zIndex: 1400,
              width: 250,
            }}>
              <button
                ref={categoryBtnRef}
                onClick={() => {
                  handleCategoryBtnClick();
                }}
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
  
            </>
          )}
          {/* Затемнение фона при открытом меню */}
          {isDesktop && menuOpen && !instantClose && !shouldHideCategories && !userLoading && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1399,
                cursor: 'pointer'
              }}
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Меню категорий с position: absolute */}
          {isDesktop && !instantClose && !shouldHideCategories && !userLoading && (
          <Box sx={{ position: 'relative' }}>
            <Paper
              ref={menuRef}
              className="category-dropdown-menu"
              sx={{
                position: 'absolute',
                top: isHome ? 4 : 48,
                left: 0,
                width: 250,
                zIndex: 1400,
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
                    <ListItemText primary={cat.label || cat.name} sx={{ fontWeight: 600, color: '#2c3e50', fontSize: 16, lineHeight: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                    {getSubcategories(cat).length > 0 && (
                      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#FFB300', height: '21px', lineHeight: '21px' }}>{'>'}</span>
                    )}
                  </ListItem>
                ))}
              </List>
              </Paper>
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
                  subcats = cat ? getSubcategories(cat) : [];
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
                      position: 'absolute',
                      top: 4,
                      left: 250,
                      width: 250,
                      height: 'calc(100vh - 100px - 67px + 4px)',
                      background: '#fff',
                      zIndex: 1400,
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
            </Box>
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
            disableScrollLock={true}
            ModalProps={{
              disableScrollLock: true,
              disableEnforceFocus: true,
              disableAutoFocus: true,
              disableRestoreFocus: true,
            }}
            onClose={(event, reason) => {
              // Предотвращаем встроенное поведение Drawer
              event?.preventDefault?.();
              event?.stopPropagation?.();
              
              setIsClosingFilters(true);
              setIsRestoringScroll(true);
              setLastFilterCloseTime(Date.now());
              setShouldPreventGlobalScroll(true);
              setMobileFiltersOpen(false);
              
              // Восстанавливаем позицию прокрутки с максимальной защитой
              setTimeout(() => {
                window.scrollTo(0, savedScrollY);
                // Дополнительная защита - повторяем несколько раз
                setTimeout(() => {
                  window.scrollTo(0, savedScrollY);
                  setTimeout(() => {
                    window.scrollTo(0, savedScrollY);
                    setTimeout(() => {
                      window.scrollTo(0, savedScrollY);
                      // Увеличиваем задержку перед сбросом флагов
                      setTimeout(() => {
                        setIsClosingFilters(false);
                        setIsRestoringScroll(false);
                        setShouldPreventGlobalScroll(false);
                      }, 500); // Увеличиваем задержку до 500мс
                    }, 50);
                  }, 50);
                }, 50);
              }, 50);
            }}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      onGendersChange([]);
                      setSelectedAgeGroups([]);
                      setSelectedBrands([]);
                      setPriceRange(priceLimits);
                      // Автоматическая прокрутка к продуктам
                      setTimeout(() => {
                        if (window.scrollToCatalogProducts) {
                          window.scrollToCatalogProducts();
                        }
                      }, 100);
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '12px',
                      minWidth: 'auto',
                      px: 1,
                      py: 0.5,
                      height: 32,
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
                  <IconButton onClick={() => {
                    setIsClosingFilters(true);
                    setIsRestoringScroll(true);
                    setLastFilterCloseTime(Date.now());
                    setShouldPreventGlobalScroll(true);
                    setMobileFiltersOpen(false);
                    
                    // Восстанавливаем позицию прокрутки с максимальной защитой
                    setTimeout(() => {
                      window.scrollTo(0, savedScrollY);
                      // Дополнительная защита - повторяем несколько раз
                      setTimeout(() => {
                        window.scrollTo(0, savedScrollY);
                        setTimeout(() => {
                          window.scrollTo(0, savedScrollY);
                          // Увеличиваем задержку перед сбросом флагов
                          setTimeout(() => {
                            setIsClosingFilters(false);
                            setIsRestoringScroll(false);
                            setShouldPreventGlobalScroll(false);
                          }, 500); // Увеличиваем задержку до 500мс
                        }, 100);
                      }, 50);
                    }, 50);
                  }}>
                  <CloseIcon />
                </IconButton>
                </Box>
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
                          // Автоматическая прокрутка к продуктам
                          setTimeout(() => {
                            if (window.scrollToCatalogProducts) {
                              window.scrollToCatalogProducts();
                            }
                          }, 100);
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
                  onChange={(_, newValue) => {
                    setPriceRange(newValue);
                  }}
                  valueLabelDisplay="auto"
                  min={priceLimits[0]}
                  max={priceLimits[1]}
                  step={1}
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
                          // Автоматическая прокрутка к продуктам
                          setTimeout(() => {
                            if (window.scrollToCatalogProducts) {
                              window.scrollToCatalogProducts();
                            }
                          }, 100);
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
                            // Автоматическая прокрутка к продуктам
                            setTimeout(() => {
                              if (window.scrollToCatalogProducts) {
                                window.scrollToCatalogProducts();
                              }
                            }, 100);
                          }}
                        />
                      }
                      label={brand}
                      sx={{ display: 'block', mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
              
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
  

// Компонент для контента внутри Router
function AppContent({ 
    editModalOpen, setEditModalOpen, authOpen, setAuthOpen, authLoading, snackbar, setSnackbar, 
    hoveredCategory, setHoveredCategory, drawerOpen, setDrawerOpen, mobileOpen, setMobileOpen, 
    appBarRef, submenuTimeout, setSubmenuTimeout, onOpenSidebar, handleEditProduct, 
    handleSaveProduct, handleDeleteProduct, editingProduct, setEditingProduct, 
    loadCategoriesFromAPI, selectedGenders, onGendersChange, selectedBrands, selectedAgeGroups, 
    setSelectedBrands, setSelectedAgeGroups, handleOpenReviewForm, reviewFormOpen, 
    setReviewFormOpen, reviewFormData, emailConfirmModalOpen, setEmailConfirmModalOpen, 
    emailConfirmData, priceRange, setPriceRange, filtersMenuOpen, setFiltersMenuOpen, 
    desktopSearchBarRef
  }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isNarrow = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
    
    // Используем контексты
    const { user, userLoading, handleLogout, handleLogin, handleRegister, handleUserUpdate } = useUser();
    const { cart, cartLoading, handleAddToCart, handleChangeCartQuantity, handleRemoveFromCart, handleClearCart } = useCart();
    const { products, dbCategories, wishlist, handleWishlistToggle, refreshWishlist } = useProducts();
    
    // Локальные состояния
    const [profileLoading, setProfileLoading] = useState(false);
    const [miniCartOpen, setMiniCartOpen] = useState(false);
    
    // Обертки для функций с проверкой аутентификации
    const handleSaveProductWithAuth = async (updatedProduct) => {
      console.log('🚀 handleSaveProductWithAuth вызвана с товаром:', updatedProduct?.id, updatedProduct?.name);
      if (!user || !user.token) {
        console.error('User not authenticated');
        return;
      }
      return handleSaveProduct(updatedProduct);
    };
    
    const handleDeleteProductWithAuth = async (productId) => {
      if (!user || !user.token) {
        console.error('User not authenticated');
        return;
      }
      return handleDeleteProduct(productId);
    };
    
    const loadCategoriesFromAPIWithAuth = async (forceRefresh = false) => {
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      return loadCategoriesFromAPI(forceRefresh, headers);
    };
    
    // Проверка для отображения десктопной поисковой строки
    const isHome = location.pathname === '/';
    const isCatalog = location.pathname === '/catalog';
    const shouldShowDesktopSearch = isHome || isCatalog;
    const shouldShowDesktopFilters = isCatalog; // Фильтры только на каталоге
    
    // Состояния для мобильного поиска и фильтров
    const [searchQuery, setSearchQuery] = React.useState('');
    const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
    const [isListening, setIsListening] = React.useState(false);
    const [interimTranscript, setInterimTranscript] = React.useState('');
    const recognitionRef = React.useRef(null);
    const filtersPanelRef = React.useRef(null);
    const [isClosingFilters, setIsClosingFilters] = React.useState(false);
    const [savedScrollY, setSavedScrollY] = React.useState(0);
    const [isRestoringScroll, setIsRestoringScroll] = React.useState(false);
    const [lastFilterCloseTime, setLastFilterCloseTime] = React.useState(0);
    const [shouldPreventGlobalScroll, setShouldPreventGlobalScroll] = React.useState(false);
    
    // Убрано избыточное логирование состояний
    
    // Отслеживание позиции прокрутки для восстановления при закрытии фильтров
    React.useEffect(() => {
      let scrollTimeout;
      
      const updateScrollPosition = () => {
        // Используем debounce для уменьшения частоты обновлений
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setSavedScrollY(window.scrollY);
        }, 100); // Обновляем только раз в 100мс
      };
      
      window.addEventListener('scroll', updateScrollPosition, { passive: true });
      return () => {
        clearTimeout(scrollTimeout);
        window.removeEventListener('scroll', updateScrollPosition);
      };
    }, []);
    
    // Прокрутка к началу страницы при переходе между вкладками
    React.useEffect(() => {
      const timeSinceLastFilterClose = Date.now() - lastFilterCloseTime;
      
      // Не прокручиваем, если закрываем фильтры, восстанавливаем прокрутку, недавно закрыли фильтры или нужно предотвратить прокрутку
      if (!isClosingFilters && !isRestoringScroll && timeSinceLastFilterClose > 3000 && !shouldPreventGlobalScroll) {
        // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }, [location.pathname, isClosingFilters, isRestoringScroll, lastFilterCloseTime]);

    // Глобальный обработчик для предотвращения нежелательной прокрутки
    React.useEffect(() => {
      const preventScroll = (e) => {
        if (isRestoringScroll) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Добавляем обработчики только если действительно восстанавливаем прокрутку
      if (isRestoringScroll) {
        window.addEventListener('scroll', preventScroll, { passive: false });
        window.addEventListener('wheel', preventScroll, { passive: false });
        document.addEventListener('scroll', preventScroll, { passive: false });
      }

      return () => {
        window.removeEventListener('scroll', preventScroll);
        window.removeEventListener('wheel', preventScroll);
        document.removeEventListener('scroll', preventScroll);
      };
    }, [isRestoringScroll]);
    
    // Обработка ошибок рендера
    const [hasError, setHasError] = React.useState(false);
    const [errorInfo, setErrorInfo] = React.useState(null);
    
    // Убраны временные состояния - фильтры применяются автоматически
    
    // Массив возрастных групп (как в форме редактирования)
    const ageGroups = [
      '0-1 год',
      '1-3 года',
      '3-5 лет',
      '5-7 лет',
      '7-10 лет',
      '10-12 лет',
      '12-14 лет',
      '14-16 лет'
    ];
    
    // Вычисляем реальные лимиты цен на основе товаров
    const priceLimits = React.useMemo(() => {
      if (!products || products.length === 0) return [0, 10000];
      
      const validPrices = products
        .map(product => Number(product.price))
        .filter(price => !isNaN(price) && price > 0);
      
      if (validPrices.length === 0) return [0, 10000];
      
      const minPrice = Math.floor(Math.min(...validPrices) / 100) * 100; // Округляем вниз до сотен
      const maxPrice = Math.max(...validPrices); // Используем точную максимальную цену товара
      
      return [minPrice, maxPrice];
    }, [products]);
    
    // Убрана инициализация временных состояний - фильтры применяются автоматически
    
    // Инициализация priceRange на основе реальных цен при загрузке товаров
    React.useEffect(() => {
      if (products && products.length > 0 && priceRange[0] === 0 && priceRange[1] === 10000) {
        setPriceRange(priceLimits);
      }
    }, [products, priceLimits, priceRange]);
    
    // Инициализация Lenis для фильтров
    React.useEffect(() => {
      if (filtersMenuOpen && filtersPanelRef.current) {
        if (window.lenisFiltersRef) {
          window.lenisFiltersRef.destroy();
          window.lenisFiltersRef = null;
        }
        window.lenisFiltersRef = new Lenis({
          wrapper: filtersPanelRef.current,
          duration: 0.8,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          normalizeWheel: true,
          infinite: false,
          showScrollbar: true,
        });
        function raf(time) {
          window.lenisFiltersRef?.raf(time);
          if (filtersMenuOpen) requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => {
          if (window.lenisFiltersRef) {
            window.lenisFiltersRef.destroy();
            window.lenisFiltersRef = null;
          }
        };
      } else {
        if (window.lenisFiltersRef) {
          window.lenisFiltersRef.destroy();
          window.lenisFiltersRef = null;
        }
      }
    }, [filtersMenuOpen]);
    
    // Получаем актуальные состояния фильтров (теперь всегда используются основные состояния)
    const currentFilterStates = {
      genders: selectedGenders,
      brands: selectedBrands,
      ageGroups: selectedAgeGroups,
      priceRange: priceRange
    };
    
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
  
        return;
      }
      
      // Очищаем предыдущий объект распознавания
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
  
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
          
  
        } catch (error) {
          console.error('Error initializing speech recognition:', error);
        }
      }
    }, [i18n.language]); // Переинициализируем только при смене языка
  
    // Обработчик клика вне панели фильтров
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (filtersMenuOpen) {
          const filterButton = event.target.closest('[data-filter-button]');
          const filtersPanel = event.target.closest('[data-filters-panel]');
          
          if (!filterButton && !filtersPanel) {
            setFiltersMenuOpen(false);
          }
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [filtersMenuOpen]);
  
    // Функции для голосового поиска
    const handleMicClick = () => {
      if (!recognitionRef.current) {
        alert(getSpeechRecognitionErrorMessage(i18n.language));
        return;
      }
  
      try {
        // Очищаем предыдущие результаты при новом нажатии на микрофон
        setSearchQuery("");
        setInterimTranscript("");
        
        // Убеждаемся, что язык установлен правильно перед запуском
        recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
  
        if (isListening) {
          recognitionRef.current.stop();
        } else {
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
              {t('common.errorOccurred')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
              {t('common.somethingWentWrong')}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ background: '#4CAF50' }}
            >
              {t('common.refreshPage')}
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
            isClosingFilters={isClosingFilters}
            setIsClosingFilters={setIsClosingFilters}
            savedScrollY={savedScrollY}
            setSavedScrollY={setSavedScrollY}
            isRestoringScroll={isRestoringScroll}
            setIsRestoringScroll={setIsRestoringScroll}
            lastFilterCloseTime={lastFilterCloseTime}
            setLastFilterCloseTime={setLastFilterCloseTime}
            shouldPreventGlobalScroll={shouldPreventGlobalScroll}
            setShouldPreventGlobalScroll={setShouldPreventGlobalScroll}
          />
          
          {/* Мобильный поиск и фильтры под AppBar */}
          {isNarrow && !location.pathname.startsWith('/product/') && (
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
  
              {/* Кнопка фильтров - только на странице каталога */}
              {isCatalog && (
                <IconButton
                  onClick={() => {
                    setMobileFiltersOpen(true);
                  }}
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
              )}
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
               {shouldShowDesktopFilters && (
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
               )}
  
               {/* Панель фильтров для десктопа */}
               {shouldShowDesktopFilters && filtersMenuOpen && (
                 <Paper
                   ref={filtersPanelRef}
                   data-filters-panel
                   
                   sx={{
                     position: 'absolute',
                     top: '100%',
                     right: 0,
                     width: 250,
                     zIndex: '999999 !important',
                     m: 0,
                     p: 2,
                     borderRadius: 2,
                     boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                     background: '#fff',
                     maxHeight: 520,
                     overflowY: 'auto',
                     border: '1px solid #e0e0e0',
                     mt: 1,
                   }}
                 >
                   {/* Цена */}
                   <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                     Цена
                   </Typography>
                   <Box sx={{ px: 1, mb: 3 }}>
                     <Slider
                       value={priceRange}
                       onChange={(event, newValue) => {
                         setPriceRange(newValue);
                       }}
                       valueLabelDisplay="auto"
                       min={priceLimits[0]}
                       max={priceLimits[1]}
                       step={1}
                       sx={{
                         '& .MuiSlider-thumb': {
                           backgroundColor: '#FF9800',
                         },
                         '& .MuiSlider-track': {
                           backgroundColor: '#FF9800',
                         },
                         '& .MuiSlider-rail': {
                           backgroundColor: '#e0e0e0',
                         },
                       }}
                     />
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                       <Typography variant="body2" color="text.secondary">
                         ₪{priceRange[0]}
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         ₪{priceRange[1]}
                       </Typography>
                     </Box>
                   </Box>
  
                   {/* Возраст */}
                   <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                     Возраст
                   </Typography>
                   <Box sx={{ mb: 3 }}>
                     {ageGroups.map((age) => (
                       <FormControlLabel
                         key={age}
                         control={
                           <Checkbox
                             checked={selectedAgeGroups.includes(age)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setSelectedAgeGroups([...selectedAgeGroups, age]);
                               } else {
                                 setSelectedAgeGroups(selectedAgeGroups.filter(g => g !== age));
                               }
                               // Автоматическая прокрутка к продуктам после изменения фильтра
                               setTimeout(() => {
                                 if (window.scrollToCatalogProducts) {
                                   window.scrollToCatalogProducts();
                                 }
                               }, 100);
                             }}
                             sx={{
                               color: '#FF9800',
                               '&.Mui-checked': {
                                 color: '#FF9800',
                               },
                             }}
                           />
                         }
                         label={age}
                         sx={{ display: 'block', mb: 1 }}
                       />
                     ))}
                   </Box>
  
                   {/* Пол */}
                   <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                     Пол
                   </Typography>
                   <Box sx={{ mb: 3 }}>
                     {['Мальчики', 'Девочки', 'Унисекс'].map((gender) => (
                       <FormControlLabel
                         key={gender}
                         control={
                           <Checkbox
                             checked={selectedGenders.includes(gender)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 onGendersChange([...selectedGenders, gender]);
                               } else {
                                 onGendersChange(selectedGenders.filter(g => g !== gender));
                               }
                               // Автоматическая прокрутка к продуктам после изменения фильтра
                               setTimeout(() => {
                                 if (window.scrollToCatalogProducts) {
                                   window.scrollToCatalogProducts();
                                 }
                               }, 100);
                             }}
                             sx={{
                               color: '#FF9800',
                               '&.Mui-checked': {
                                 color: '#FF9800',
                               },
                             }}
                           />
                         }
                         label={gender}
                         sx={{ display: 'block', mb: 1 }}
                       />
                     ))}
                   </Box>
  
                   {/* Бренды */}
                   <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                     Бренды
                   </Typography>
                   <Box sx={{ mb: 2 }}>
                     {Array.from(new Set(products.map(p => p.brand))).filter(Boolean).slice(0, 10).map((brand) => (
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
                               // Автоматическая прокрутка к продуктам после изменения фильтра
                               setTimeout(() => {
                                 if (window.scrollToCatalogProducts) {
                                   window.scrollToCatalogProducts();
                                 }
                               }, 100);
                             }}
                             sx={{
                               color: '#FF9800',
                               '&.Mui-checked': {
                                 color: '#FF9800',
                               },
                             }}
                           />
                         }
                         label={brand}
                         sx={{ display: 'block', mb: 1 }}
                       />
                     ))}
                   </Box>
  
                   {/* Кнопка сброса */}
                   <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                     <Button
                       fullWidth
                       variant="contained"
                       onClick={() => {
                         onGendersChange([]);
                         setSelectedBrands([]);
                         setSelectedAgeGroups([]);
                         setPriceRange(priceLimits);
                         setFiltersMenuOpen(false);
                         // Автоматическая прокрутка к продуктам после сброса фильтров
                         setTimeout(() => {
                           if (window.scrollToCatalogProducts) {
                             window.scrollToCatalogProducts();
                           }
                         }, 100);
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
                       Сбросить фильтры
                     </Button>
                   </Box>
                 </Paper>
               )}
             </Box>
           )}
  
  
          <Routes>
            <Route path="/" element={<HomePage products={products} onAddToCart={handleAddToCart} cart={cart} user={user} onWishlistToggle={handleWishlistToggle} onChangeCartQuantity={handleChangeCartQuantity} onEditProduct={handleEditProduct} wishlist={wishlist} />} />
            <Route path="/product/:id" element={<ProductPage onAddToCart={handleAddToCart} cart={cart} user={user} onChangeCartQuantity={handleChangeCartQuantity} onEditProduct={handleEditProduct} setAuthOpen={setAuthOpen} dbCategories={dbCategories} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} />} />
            <Route path="/catalog" element={<CatalogPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} dbCategories={dbCategories} selectedGenders={selectedGenders} selectedBrands={selectedBrands} selectedAgeGroups={selectedAgeGroups} priceRange={priceRange} />} />
            <Route path="/category/:id" element={<CategoryPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} />} />
            <Route path="/subcategory/:id" element={<SubcategoryPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} selectedGenders={selectedGenders} />} />
            <Route path="/boys-toys" element={<BoysToysPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} />} />
            <Route path="/girls-toys" element={<GirlsToysPage products={products} onAddToCart={handleAddToCart} cart={cart} handleChangeCartQuantity={handleChangeCartQuantity} user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} onEditProduct={handleEditProduct} />} />
            <Route path="/cart" element={<CartPage cart={cart} onChangeCartQuantity={handleChangeCartQuantity} onRemoveFromCart={handleRemoveFromCart} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} cartLoading={cartLoading} user={user} onClearCart={handleClearCart} />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/wishlist" element={<WishlistPage user={user} wishlist={wishlist} onWishlistToggle={handleWishlistToggle} />} />
            <Route path="/profile" element={<UserCabinetPage user={user} handleLogout={handleLogout} wishlist={wishlist} handleWishlistToggle={handleWishlistToggle} refreshWishlist={refreshWishlist} cart={cart} handleAddToCart={handleAddToCart} handleChangeCartQuantity={handleChangeCartQuantity} onEditProduct={handleEditProduct} handleUserUpdate={handleUserUpdate} handleOpenReviewForm={handleOpenReviewForm} />} />
            <Route path="/cms" element={<CMSPage loadCategoriesFromAPI={loadCategoriesFromAPIWithAuth} editModalOpen={editModalOpen} setEditModalOpen={setEditModalOpen} editingProduct={editingProduct} setEditingProduct={setEditingProduct} dbCategories={dbCategories} />} />
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
          onSave={handleSaveProductWithAuth}
          onDelete={handleDeleteProductWithAuth}
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
              <Grid size={{ xs: 12, md: i18n.language === 'he' ? 4 : 3 }} sx={{ ml: { md: -5 } }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: i18n.language === 'he' ? 3 : 4 }}>
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
                      053-377-4509
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ color: '#e3f2fd', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                      077-700-5171
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: '#e3f2fd', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.9 }}>
                      simbakingoftoys@gmail.com
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
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2
                }}>
                  <Typography variant="body2" sx={{ color: '#e3f2fd', opacity: 0.8 }}>
                    © {new Date().getFullYear()} {t('footer.copyright')} - {t('footer.title')}
                  </Typography>
                  <img 
                    src="/lion-logo.png..png" 
                    alt="Kids Toys Shop Logo" 
                    style={{ 
                      width: '60px', 
                      height: '60px',
                      opacity: 0.9
                    }} 
                  />
                </Box>
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

export default AppContent;