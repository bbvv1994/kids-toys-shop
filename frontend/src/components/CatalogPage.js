import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ViewModule,
  ViewList,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  SwapVert as SortIcon,
  FormatListNumbered as ItemsPerPageIcon
} from '@mui/icons-material';
import { useDeviceType } from '../utils/deviceDetection';
import { getSpeechRecognitionLanguage, getSpeechRecognitionErrorMessage, isSpeechRecognitionSupported } from '../utils/speechRecognitionUtils';
import CustomSelect from './CustomSelect';
import ProductCard from './ProductCard';

// Маппинг полов для фильтрации
const genderMapping = {
  'male': 'Для мальчиков',
  'female': 'Для девочек', 
  'unisex': 'Универсальный'
};

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
    // Используем основные состояния фильтров
    const currentFilters = {
      genders: selectedGenders,
      brands: selectedBrands,
      ageGroups: selectedAgeGroups,
      priceRange: priceRange
    };
    

    
    // Фильтр по брендам
    if (currentFilters.brands && currentFilters.brands.length > 0 && !currentFilters.brands.includes(product.brand)) {

      return false;
    }
    // Фильтр по возрасту
    if (currentFilters.ageGroups && currentFilters.ageGroups.length > 0 && !currentFilters.ageGroups.includes(product.ageGroup)) {

      return false;
    }
    // Фильтр по полу
    if (currentFilters.genders && currentFilters.genders.length > 0) {
      // Преобразуем выбранные английские коды в русские названия
      const selectedRussianGenders = currentFilters.genders.map(code => genderMapping[code]).filter(Boolean);
      if (!selectedRussianGenders.includes(product.gender)) {
        return false;
      }
          }
      // Фильтр по цене
      const productPrice = Number(product.price);
      if (productPrice < currentFilters.priceRange[0] || productPrice > currentFilters.priceRange[1]) {

        return false;
      }
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 285px))',
            gap: 3,
            justifyContent: 'center',
            mx: 'auto',
          }}>
            {catalogCategories.map((cat, index) => {
              return (
                <Card key={index} sx={{
                  borderRadius: 2,
                  background: 'rgba(103, 126, 234, 0.05)',
                  border: '1px solid rgba(103, 126, 234, 0.1)',
                  cursor: 'pointer',
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    background: 'rgba(103, 126, 234, 0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }} onClick={() => {
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
                }}>
                  <CardContent sx={{ 
                    p: 0, 
                  position: 'relative',
                    display: 'flex', 
                    flexDirection: 'column', 
                    flex: 1,
                    '&:last-child': {
                      pb: 0
                    }
                  }}>
                    {/* Изображение как фон */}
                    <Box sx={{
                    width: '100%',
                    height: '100%',
                      borderRadius: 2,
                      backgroundImage: `url(${cat.icon || '/toys.png'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      position: 'relative',
                      flex: 1
                    }}>
                      {/* Название категории внизу карточки */}
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255,255,255,0.82)',
                  py: 1,
                  px: 2,
                  textAlign: 'center'
                }}>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#222',
                    textAlign: 'center',
                    m: 0,
                    p: 0
                  }}>
                    {cat.label}
                  </Typography>
                </Box>
              </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          
          {/* Отступ между карточками категорий и блоком сортировки */}
          <Box sx={{ mb: 2 }} />
          
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
            mt: 1,
            flexWrap: 'wrap',
            maxWidth: 1100,
            margin: '0 auto',
          }}>
            {/* Сортировка и количество — слева */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SortIcon sx={{ fontSize: 20, color: '#ff9800' }} />
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
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {!isMobile && <ItemsPerPageIcon sx={{ fontSize: 20, color: '#666' }} />}
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
          <Box sx={{ mb: 0.5 }} />
        </Box>
      </Container>

      {/* Контейнер товаров без левого отступа 270 */}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Box>
          {/* Сетка или список товаров каталога */}
          {viewMode === 'grid' ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: isMobile 
                ? 'repeat(2, 1fr)' 
                : 'repeat(auto-fit, minmax(280px, 280px))',
              justifyContent: 'center',
              gap: isMobile ? '4px' : '8px',
              mt: 0.5,
              mb: 6,
              width: '100%',
              maxWidth: isMobile 
                ? '100%' 
                : { md: 'calc(5 * 280px + 4 * 8px)' },
              mx: 'auto',
              px: isMobile ? 1 : 0
            }}>
              {pagedProducts.length > 0 ? (
                pagedProducts.map(product => (
                  <Box key={product.id} sx={{ 
                    display: 'flex'
                  }}>
                    <ProductCard
                      product={product}
                      user={user}
                      inWishlist={wishlist?.some ? wishlist.some(item => item.productId === product.id) : false}
                      onWishlistToggle={onWishlistToggle}
                      onAddToCart={onAddToCart}
                      cart={cart}
                      onChangeCartQuantity={handleChangeCartQuantity}
                      onEditProduct={onEditProduct}
                      viewMode={isMobile ? "carousel-mobile" : "grid"}
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

export default CatalogPage;
