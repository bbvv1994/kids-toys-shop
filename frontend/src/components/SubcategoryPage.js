import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tooltip,
  Badge,
  Fab,
  Zoom,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear,
  Mic,
  MicOff,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Star,
  StarBorder,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  CloudUpload,
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore,
  Category,
  SubdirectoryArrowRight,
  FilterList,
  Sort,
  ViewList,
  ViewModule,
  Refresh,
  ArrowBack,
  ArrowForward,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Info,
  Warning,
  CheckCircle,
  Cancel,
  Pending,
  LocalShipping,
  Payment,
  Person,
  Email,
  Phone,
  LocationOn,
  NavigateNext,
  Home
} from '@mui/icons-material';
import { API_BASE_URL, getImageUrl } from '../config';
import { getTranslatedName, getTranslatedDescription } from '../utils/translationUtils';
import { getSpeechRecognitionLanguage, getSpeechRecognitionErrorMessage, isSpeechRecognitionSupported } from '../utils/speechRecognitionUtils';
import { useDeviceType } from '../utils/deviceDetection';
import ProductCard from './ProductCard';
import ElegantProductCarousel from './ElegantProductCarousel';
import LazyImage from './LazyImage';
import Lenis from '@studio-freight/lenis';

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
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'mobile';
  
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
          // Очищаем предыдущие результаты при новом нажатии на микрофон
          setSearchQuery("");
          setInterimTranscript("");
          
          // Убеждаемся, что язык установлен правильно перед запуском
          recognitionRef.current.lang = getSpeechRecognitionLanguage(i18n.language);
  
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
        <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
            <Typography variant="h4">Загрузка...</Typography>
          </Box>
        </Container>
      );
    }
  
    if (!subcategory) {
      return (
        <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
            <Typography variant="h4" color="error">{t('subcategory.notFound')}</Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                navigate('/catalog');
                if (window.location.pathname === '/checkout') {
                  setTimeout(() => window.location.reload(), 100);
                }
              }}
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
      <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, pt: { xs: 0, md: 3.75 } }}>
          {/* Хлебные крошки */}
          <Box sx={{ 
            mb: 3, 
            mt: -3.625,
            width: '100%',
            // desktop alignment: center 3-cols region (≤1535px); 4-cols (≥1536px) left-align with indent
            mx: { xs: 'auto', sm: 'auto', md: 'auto', lg: 0, xl: 0 },
            // keep no manual left offset on mobile/tablet so centering works
            ml: { lg: 'calc(280px + (100% - 280px - 903px)/2)', xl: '280px' },
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
                <Home sx={{ fontSize: 18 }} />
                {t('breadcrumbs.home')}
              </Link>
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
              {category && (
                <Link 
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
                </Link>
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
            mb: 4,
            width: '100%',
            mx: 'auto'
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
              fontWeight: 500,
              width: '100%',
              // desktop alignment: center 3-cols region (≤1535px); 4-cols (≥1536px) left-align with indent
              mx: { xs: 'auto', sm: 'auto', md: 'auto', lg: 0, xl: 0 },
              // keep no manual left offset on mobile/tablet so centering works
              ml: { lg: 'calc(280px + (100% - 280px - 903px)/2)', xl: '280px' }
            }}>
              {t('catalog.foundProducts', { count: filteredProducts.length })}
            </Typography>
          )}
  
          {/* Сетка товаров */}
          <Box sx={{
            display: {
              xs: 'flex',
              md: 'grid'
            },
            flexDirection: { xs: 'row', md: 'unset' },
            flexWrap: { xs: 'wrap', md: 'unset' },
            justifyContent: { xs: 'center', md: 'unset' },
            gridTemplateColumns: {
              md: 'repeat(auto-fit, minmax(280px, 280px))'
            },
            gap: '8px',
            mb: 6,
            width: '100%',
            maxWidth: { 
              xs: '100%', 
              md: 'calc(4 * 280px + 3 * 8px)' 
            },
            mx: { xs: 0, md: 0 },
            px: 0,
            // desktop alignment: center 3-cols region (≤1535px); 4-cols (≥1536px) left-align with indent
            ml: { xs: 0, lg: 'calc(280px + (100% - 280px - 903px)/2)', xl: '280px' }
          }}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Box key={product.id}>
                  <ProductCard 
                    product={product} 
                    user={user}
                    isAdmin={user?.role === 'admin'}
                    inWishlist={wishlist.some(item => item.productId === product.id)}
                    onWishlistToggle={onWishlistToggle}
                    onAddToCart={onAddToCart} 
                    cart={cart} 
                    onChangeCartQuantity={handleChangeCartQuantity} 
                    onEditProduct={onEditProduct}
                    viewMode={isMobile ? "carousel-mobile" : "grid"}
                  />
                </Box>
              ))
            ) : (
              <Typography sx={{ 
                gridColumn: '1/-1', 
                textAlign: 'center', 
                color: '#888', 
                fontSize: 20,
                width: '100%',
                mx: 'auto'
              }}>
                {searchQuery ? t('subcategory.noProductsSearch', { query: searchQuery }) : t('subcategory.noProducts')}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    );
  }

export default SubcategoryPage;