import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ProductCard from './ProductCard';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ProductCarousel({ title, products, onAddToCart, cart, user, onWishlistToggle, onChangeCartQuantity, onEditProduct, wishlist, isAdmin }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef(null);
  const theme = useTheme();
  
  // Используем Material-UI breakpoints для лучшей адаптивности
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900px - 1200px
  const isMediumDesktop = useMediaQuery(theme.breakpoints.between('lg', 'xl')); // 1200px - 1536px
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl')); // >= 1536px

  // Вычисляем количество видимых карточек
  const getVisibleCount = () => {
    if (isLargeDesktop) return 4; // >= 1536px
    if (isMediumDesktop) return 3; // 1200px - 1536px
    if (isSmallDesktop) return 3; // 900px - 1200px
    if (isTablet) return 2; // 600px - 900px
    return 1; // < 600px
  };

  const visibleCount = getVisibleCount();
  
  // Текущий индекс (начинаем с первого продукта)
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Эффект для завершения переходов
  useEffect(() => {
    if (!isTransitioning) return;
    
    // Используем requestAnimationFrame для лучшей производительности
    const frameId = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 150); // Уменьшаем задержку с 300ms до 150ms
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(frameId);
  }, [isTransitioning]); // Зависим от isTransitioning вместо currentIndex

  // Эффект для сброса isResetting
  useEffect(() => {
    if (isResetting) {
      // Используем requestAnimationFrame для лучшей производительности
      const frameId = requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          setIsResetting(false);
        }, 50);
        return () => clearTimeout(timer);
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [isResetting]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setCurrentIndex(prev => {
      const newIndex = prev - 1;
      
      // Если уходим в отрицательные числа, переходим к концу
      if (newIndex < 0) {
        setIsResetting(true);
        return products.length - 3; // Переходим к третьему с конца продукту
      }
      
      return newIndex;
    });
  }, [isTransitioning, products.length, visibleCount]);
  
  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      
      // Если достигли конца (на 3 клика раньше), переходим к началу
      if (newIndex >= products.length - 3) {
        setIsResetting(true);
        return 0; // Начинаем с первого продукта
      }
      
      return newIndex;
    });
  }, [isTransitioning, products.length, visibleCount]);
  // Пагинация
  const totalPages = Math.ceil((products.length - 2) / visibleCount);
  const currentPage = Math.floor(currentIndex / visibleCount) + 1;

  // Отладочная информация для свайпов


  // Функции для обработки свайпов
  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
    setIsPaused(true); // Останавливаем автопереключение при начале свайпа
  }, []);

  const onTouchMove = useCallback((e) => {
    if (isSwiping) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  }, [isSwiping]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || isTransitioning) {
      setIsSwiping(false);
      setIsPaused(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 30; // Минимальное расстояние для свайпа
    
    if (distance > minSwipeDistance) {
      // Свайп влево - следующий слайд

      // Проверяем, что можем двигаться дальше
      if (currentIndex < products.length - 1) {
        const newIndex = currentIndex + 1;

        setIsTransitioning(true);
        setCurrentIndex(newIndex);
      } else {

      }
    } else if (distance < -minSwipeDistance) {
      // Свайп вправо - предыдущий слайд

      // Проверяем, что можем двигаться назад
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1;

        setIsTransitioning(true);
        setCurrentIndex(newIndex);
      } else {

      }
    }
    
    // Сбрасываем состояние свайпа
    setIsSwiping(false);
    
    // Возобновляем автопереключение через 2 секунды после свайпа
    // Используем requestAnimationFrame для лучшей производительности
    const frameId = requestAnimationFrame(() => {
      setTimeout(() => setIsPaused(false), 2000);
    });
    return () => cancelAnimationFrame(frameId);
  }, [touchStart, touchEnd, currentIndex, products.length, isTransitioning]);

  const handlePageClick = useCallback((pageIndex) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Вычисляем правильный индекс
    const targetIndex = pageIndex * visibleCount;
    
    // Проверяем, что индекс не выходит за пределы
    if (targetIndex >= products.length - 3) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(targetIndex);
    }
  }, [isTransitioning, products.length, visibleCount]);

  // Автопрокрутка (размещаем после объявления всех функций)
  useEffect(() => {
    if (products.length <= 1) return;

    // Временно отключаем автопрокрутку для тестирования свайпа
    // const interval = setInterval(() => {
    //   if (!isPaused && !isTransitioning && !isResetting) {
    //     handleNext();
    //   }
    // }, 5000);

    // return () => clearInterval(interval);
  }, [products.length, isPaused, isTransitioning, isResetting, handleNext]);

  if (!products || products.length === 0) return null;
  
  return (
    <Box
      sx={{
        mt: { xs: 6, md: 10 },
        mb: 6,
        // Оставляем отступ слева как было изначально
        ml: { xs: 0, sm: 0, md: 0, lg: '260px' },
        width: { xs: '100vw', sm: '100vw', md: '100vw', lg: 'calc(100vw - 289px)' },
        maxWidth: '100%',
        transition: 'width 0.3s',
      }}
    >
      <Typography variant="h5" sx={{ 
        mb: 2, 
        fontWeight: 800, 
        color: '#ff6600',
        fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
        textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
        letterSpacing: '0.5px',
        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        // Центрируем заголовки на мобильных, оставляем по левому краю на больших экранах
        textAlign: { xs: 'center', sm: 'center', md: 'center', lg: 'left' }
      }}>{title}</Typography>
      
            <Box
        sx={{
          width: '100%', 
          position: 'relative', 
          px: { xs: 2, sm: 4, md: 8 },
          touchAction: 'pan-y', // Разрешаем вертикальный скролл, но блокируем горизонтальный
          userSelect: 'none', // Запрещаем выделение текста при свайпе
          WebkitUserSelect: 'none' // Для Safari
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Стрелки навигации */}
        {products.length > visibleCount && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
            position: 'absolute',
            top: '50%',
                left: { xs: '2px', sm: '5px', md: '10px' },
            transform: 'translateY(-50%)',
                width: { xs: 36, sm: 40, md: 60 },
                height: { xs: 36, sm: 40, md: 60 },
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#ff6600',
            zIndex: 2,
                '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                display: { xs: 'none', sm: 'flex' } // Скрываем на очень маленьких экранах
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
            </IconButton>
            
            <IconButton
              onClick={handleNext}
              sx={{
            position: 'absolute',
            top: '50%',
                right: { xs: '2px', sm: '5px', md: '10px' },
            transform: 'translateY(-50%)',
                width: { xs: 36, sm: 40, md: 60 },
                height: { xs: 36, sm: 40, md: 60 },
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#ff6600',
            zIndex: 2,
                '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                display: { xs: 'none', sm: 'flex' } // Скрываем на очень маленьких экранах
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
            </IconButton>
          </>
        )}
        
                 {/* Карусель с плавным скольжением */}
         <Box
          sx={{
             width: '100%',
             maxWidth: `calc(${visibleCount} * 260px + ${visibleCount - 1} * 8px)`,
             margin: '0 auto',
             overflow: 'hidden',
             position: 'relative',
             touchAction: 'pan-y', // Разрешаем вертикальный скролл, но блокируем горизонтальный
             userSelect: 'none', // Запрещаем выделение текста при свайпе
             WebkitUserSelect: 'none', // Для Safari
             cursor: isSwiping ? 'grabbing' : 'grab', // Визуальная обратная связь
             transition: 'cursor 0.2s ease',
             // Адаптивные стили для разных размеров экрана
             '@media (max-width: 599px)': {
               maxWidth: '260px',
             },
             '@media (min-width: 600px) and (max-width: 899px)': {
               maxWidth: 'calc(2 * 260px + 8px)',
             },
             '@media (min-width: 900px) and (max-width: 1199px)': {
               maxWidth: 'calc(3 * 260px + 2 * 8px)',
             },
             '@media (min-width: 1200px) and (max-width: 1535px)': {
               maxWidth: 'calc(3 * 260px + 2 * 8px)',
             },
             '@media (min-width: 1536px)': {
               maxWidth: 'calc(4 * 260px + 3 * 8px)',
             }
           }}
           onTouchStart={onTouchStart}
           onTouchMove={onTouchMove}
           onTouchEnd={onTouchEnd}
         >
           <Box
             ref={containerRef}
             className="product-carousel-container"
             sx={{
               display: 'flex',
               gap: '8px',
               justifyContent: 'flex-start',
                               transition: isResetting ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                               transform: `translateX(-${currentIndex * 268}px)`,
               width: 'max-content',
             }}
           >
                                                                                               {/* Карусель с простой бесконечной прокруткой */}
                       {(() => {
              // Используем оригинальный массив продуктов без клонов
              const extendedProducts = products;
              
              return extendedProducts.map((product, index) => {
                return (
                  <Box 
                    key={`${product.id}-${index}`}
                    sx={{ 
                      width: '260px',
                      maxWidth: '260px',
                      minWidth: '260px',
                      flexShrink: 0,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s ease',
                      }
                    }}
                  >
                    <ProductCard
                      product={product}
                      user={user}
                      inWishlist={wishlist?.some ? wishlist.some(item => item.productId === product.id) : false}
                      onWishlistToggle={onWishlistToggle}
                      onAddToCart={onAddToCart}
                      cart={cart}
                      onChangeCartQuantity={onChangeCartQuantity}
                      onEditProduct={onEditProduct}
                      viewMode="carousel"
                      isAdmin={isAdmin}
                    />
                  </Box>
                );
              });
            })()}
           </Box>
         </Box>

        {/* Пагинация (точки) */}
        {totalPages > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: '6px', sm: '8px' },
            mt: { xs: 2, sm: 3 },
            mb: { xs: 1, sm: 2 }
          }}>
            {Array.from({ length: totalPages }, (_, index) => (
              <Box
                key={index}
                onClick={() => handlePageClick(index)}
                sx={{
                  width: { xs: '10px', sm: '12px' },
                  height: { xs: '10px', sm: '12px' },
                  borderRadius: '50%',
                  backgroundColor: currentPage === index + 1 ? '#ff6600' : '#ddd',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: currentPage === index + 1 ? '#ff6600' : '#bbb',
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ProductCarousel; 