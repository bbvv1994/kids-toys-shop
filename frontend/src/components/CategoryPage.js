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
import ProductCard from './ProductCard';
import ElegantProductCarousel from './ElegantProductCarousel';
import LazyImage from './LazyImage';
import Lenis from '@studio-freight/lenis';

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
  
    // Функция для загрузки товаров категории
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
  
  
  
    // Загрузка категории и подкатегорий
    useEffect(() => {
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
        <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
            <Typography variant="h4">Загрузка...</Typography>
          </Box>
        </Container>
      );
    }
  
    if (!category) {
      return (
        <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4, pt: { xs: 8, md: 10 }, textAlign: 'center' }}>
            <Typography variant="h4" color="error">{t('category.notFound')}</Typography>
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
      <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
        <Box sx={{ mb: 4, pt: { xs: 0, md: 3.75 } }}>
                  {/* Хлебные крошки */}
          <Box sx={{ 
            mb: 3, 
            mt: -3.625,
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
              // Match categories: fixed gaps, breakpoint-based columns and widths
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 8,
              width: '100%',
              maxWidth: 'calc(4 * 285px + 3 * 24px)',
              margin: '0 auto',
              justifyContent: 'center',
              '@media (max-width: 599px)': {
                maxWidth: '285px',
                gridTemplateColumns: '1fr'
              },
              '@media (min-width: 600px) and (max-width: 899px)': {
                maxWidth: 'calc(2 * 285px + 24px)',
                gridTemplateColumns: 'repeat(2, 1fr)'
              },
              '@media (min-width: 900px) and (max-width: 1199px)': {
                maxWidth: 'calc(3 * 285px + 2 * 24px)',
                gridTemplateColumns: 'repeat(3, 1fr)'
              },
              '@media (min-width: 1200px) and (max-width: 1535px)': {
                maxWidth: 'calc(3 * 285px + 2 * 24px)',
                gridTemplateColumns: 'repeat(3, 1fr)'
              },
              '@media (min-width: 1536px)': {
                maxWidth: 'calc(4 * 285px + 3 * 24px)',
                gridTemplateColumns: 'repeat(4, 1fr)'
              },
              // desktop alignment: center 3-cols region (≤1535px); 4-cols (≥1536px) left-align with indent
              mx: { xs: 'auto', sm: 'auto', md: 'auto', lg: 0, xl: 0 },
              // keep no manual left offset on mobile/tablet so centering works
              ml: { lg: 'calc(280px + (100% - 280px - 903px)/2)', xl: '280px' },
            }}>
              {filteredSubcategories.map(subcat => {
                const nameTrimmed = subcat.name && subcat.name.trim();
                const fileName = getSubcategoryImageFileName(nameTrimmed);
                const src = fileName ? `/${fileName}` : '/toys.png';
                return (
                  <Box
                    key={subcat.id}
                    className="category-tile"
                    onClick={() => {
                      navigate(`/subcategory/${subcat.id}`);
                      if (window.location.pathname === '/checkout') {
                        setTimeout(() => window.location.reload(), 100);
                      }
                    }}
                    sx={{
                      position: 'relative',
                      height: 180,
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
  
          {/* Отступ между карточками подкатегорий и блоком товаров */}
          <Box sx={{ mb: 6 }} />
  
          {/* Сетка товаров из этой категории */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 280px))',
            justifyContent: 'center',
            gap: '8px',
            mb: 6,
            width: '100%',
            maxWidth: { md: 'calc(5 * 280px + 4 * 8px)' },
            mx: 'auto',
            // Центрирование для мобильных устройств
            '@media (max-width: 899px)': {
              justifyItems: 'center'
            }
          }}>
            {filteredCategoryProducts.length > 0 ? (
              filteredCategoryProducts.map(product => (
                <Box key={product.id} sx={{ 
                  display: 'flex',
                  justifyContent: 'center'
                }}>
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
                    viewMode="grid"
                  />
                </Box>
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

export default CategoryPage;