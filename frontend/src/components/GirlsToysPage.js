import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Button,
  Alert,
  IconButton,
  CircularProgress,
  Breadcrumbs
} from '@mui/material';
import { 
  Girl,
  ViewModule,
  ViewList,
  SwapVert as SortIcon,
  FormatListNumbered as ItemsPerPageIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTranslatedName, getTranslatedDescription } from '../utils/translationUtils';
import { useDeviceType } from '../utils/deviceDetection';
import { API_BASE_URL } from '../config';
import ProductCard from './ProductCard';
import CustomSelect from './CustomSelect';

export default function GirlsToysPage({ 
  products, 
  onAddToCart, 
  cart, 
  handleChangeCartQuantity, 
  user, 
  wishlist, 
  onWishlistToggle, 
  onEditProduct 
}) {
  const [sortBy, setSortBy] = useState('popular');
  const [pageSize, setPageSize] = useState(24);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

     // Фильтрация продуктов: категория "Игрушки" И пол "для девочек"
   const girlsProducts = useMemo(() => {
     if (!products || !Array.isArray(products)) {
       return [];
     }
     
     const filtered = products.filter(product => {
       // Проверяем, что категория содержит "Игрушки" (или похожие варианты)
       // Учитываем, что category может быть объектом или строкой
       let isToyCategory = false;
       if (product.category) {
         if (typeof product.category === 'string') {
           isToyCategory = product.category.toLowerCase().includes('игрушки') ||
                          product.category.toLowerCase().includes('toys') ||
                          product.category.toLowerCase().includes('игрушка') ||
                          product.category.toLowerCase().includes('toy');
         } else if (typeof product.category === 'object' && product.category.name) {
           // Если category - объект, проверяем поле name
           isToyCategory = product.category.name.toLowerCase().includes('игрушки') ||
                          product.category.name.toLowerCase().includes('toys') ||
                          product.category.name.toLowerCase().includes('игрушка') ||
                          product.category.name.toLowerCase().includes('toy');
         }
       }
       
       // Проверяем, что пол указан как "для девочек"
       const isForGirls = product.gender && typeof product.gender === 'string' && (
         product.gender === 'Для девочек' ||
         product.gender === 'Девочки' || 
         product.gender === 'girls' ||
         product.gender === 'Girls' ||
         product.gender.toLowerCase().includes('девочк') ||
         product.gender.toLowerCase().includes('girl')
       );
       
       // Возвращаем true только если ОБА условия выполнены
       return isToyCategory && isForGirls;
     });
     
     return filtered;
   }, [products]);

  // Фильтрация продуктов по выбранным критериям
  const filteredProducts = useMemo(() => {
    return girlsProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'name-za':
          return b.name.localeCompare(a.name);
        case 'popular':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [girlsProducts, sortBy]);

  // Пагинация
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [sortBy, pageSize, filteredProducts]);

  // Управление состоянием загрузки
  useEffect(() => {
    if (products) {
      // Небольшая задержка для плавности
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [products]);

  // Обработчики
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleWishlistToggle = (productId) => {
    if (onWishlistToggle) {
      const isInWishlist = wishlist.some(item => item.productId === productId);
      // Добавляем логирование для отладки
      console.log('handleWishlistToggle:', { productId, wishlist, isInWishlist, onWishlistToggle: !!onWishlistToggle });
      onWishlistToggle(productId, isInWishlist);
    }
  };

  const isInWishlist = (productId) => {
    if (!wishlist || !Array.isArray(wishlist)) return false;
    // Добавляем логирование для отладки
    console.log('isInWishlist check:', { productId, wishlist, result: wishlist.some(item => item.productId === productId) });
    return wishlist.some(item => item.productId === productId);
  };

  const getCartQuantity = (productId) => {
    if (!cart || !Array.isArray(cart)) return 0;
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (handleChangeCartQuantity) {
      handleChangeCartQuantity(productId, newQuantity);
    }
  };

  // Показываем спиннер во время загрузки
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          gap: 3
        }}>
          <CircularProgress 
            size={60} 
            sx={{ color: '#ff6600' }} 
          />
          <Typography variant="h6" sx={{ color: '#666' }}>
            {t('catalog.pages.girlsToys.loading')}
          </Typography>
        </Box>
      </Container>
    );
  }

  // Показываем сообщение только если товары загружены, но их нет
  if (!isLoading && !girlsProducts.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ color: '#666', mb: 2 }}>
            {t('catalog.pages.girlsToys.title')}
          </Typography>
          <Typography variant="h6" sx={{ color: '#888', mb: 4 }}>
            {t('catalog.pages.girlsToys.noProducts')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#999', maxWidth: 500, mx: 'auto' }}>
            {t('catalog.pages.girlsToys.noProductsDescription')}
          </Typography>
          <Button 
            onClick={() => navigate('/')}
            variant="contained" 
            sx={{ 
              mt: 3, 
              background: '#ff6600',
              '&:hover': { background: '#e55a00' }
            }}
          >
            {t('catalog.pages.girlsToys.backToHome')}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 4 }, pt: { xs: 0, md: 7.5 }, minHeight: '80vh' }}>
        {/* Хлебные крошки */}
        <Box sx={{ 
          mb: 3, 
          mt: { xs: 0.25, md: 0 },
          width: '100%',
          pt: { xs: 1, md: 0 }
        }}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{
              position: 'relative',
              zIndex: 15,
              pl: { xs: 2, md: 3 },
              '& .MuiBreadcrumbs-separator': {
                color: '#4ECDC4'
              },
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'wrap'
              }
            }}
          >
            {/* Главная */}
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
            
            {/* Текущая страница */}
            <Typography 
              sx={{ 
                color: '#ff6600',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {t('catalog.pages.girlsToys.title')}
            </Typography>
          </Breadcrumbs>
        </Box>

      {/* Заголовок страницы */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            fontWeight: 800, 
            color: '#ff6600',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            fontSize: { xs: '2rem', md: '3rem' },
            textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('catalog.pages.girlsToys.title')}
        </Typography>
      </Box>

      {/* Блок сортировки, количества и вида — как в каталоге */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1, md: 3 },
        mb: 5,
        mt: 3,
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
              onChange={handleSortChange}
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

      {/* Отступ между фильтрами и карточками товаров */}
      <Box sx={{ height: '15px' }} />

      {/* Список продуктов */}
      {!isLoading && filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" sx={{ color: '#666', mb: 2 }}>
            Товары не найдены
          </Typography>
          <Typography variant="body1" sx={{ color: '#888', maxWidth: 400, mx: 'auto' }}>
            Попробуйте изменить параметры сортировки или загляните позже
          </Typography>
        </Box>
      ) : (
        <>
          {viewMode === 'grid' ? (
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
              width: '100%',
              maxWidth: { 
                xs: '100%', 
                md: 'calc(5 * 280px + 4 * 8px)' 
              },
              mx: 'auto',
              mt: 2,
              mb: 6,
              px: 0
            }}>
              {pagedProducts.map((product) => (
                <Box key={product.id}>
                  <ProductCard
                    product={product}
                    user={user}
                    inWishlist={isInWishlist(product.id)}
                    onWishlistToggle={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                    cart={cart}
                    onChangeCartQuantity={handleQuantityChange}
                    onEditProduct={onEditProduct}
                    viewMode={isMobile ? "carousel-mobile" : "grid"}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 6, mb: 6, maxWidth: 1100, margin: '0 auto', alignItems: { xs: 'center', sm: 'stretch' } }}>
              {pagedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  user={user}
                  inWishlist={isInWishlist(product.id)}
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  cart={cart}
                  onChangeCartQuantity={handleQuantityChange}
                  onEditProduct={onEditProduct}
                  viewMode="list"
                />
              ))}
            </Box>
          )}
          
          {/* Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
              <Button
                variant="outlined"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                sx={{ minWidth: 40 }}
              >
                ←
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'contained' : 'outlined'}
                  onClick={() => setPage(pageNum)}
                  sx={{ minWidth: 40 }}
                >
                  {pageNum}
                </Button>
              ))}
              <Button
                variant="outlined"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                sx={{ minWidth: 40 }}
              >
                →
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
