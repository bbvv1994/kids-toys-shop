import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useSwipeable } from 'react-swipeable';
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import ProductCard from './ProductCard';

function ElegantProductCarousel({
  title,
  products,
  user,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  cart,
  onChangeCartQuantity,
  onEditProduct,
  isAdmin,
  reducedMargin = false
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMedium = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLarge = useMediaQuery('(min-width: 1500px)');

  // Количество видимых товаров на разных экранах
  const visibleCount = isMobile ? 1 : isTablet ? 2 : isLarge ? 4 : 3;
  const items = products || [];
  const totalPages = Math.max(1, items.length - visibleCount + 1);

  // Адаптивные размеры контейнера
  const getContainerMaxWidth = () => {
    if (isMobile) return '280px';
    if (isTablet) return 'calc(2 * 280px + 16px)'; // 2 карточки + 1 отступ
    if (isLarge) return 'calc(4 * 280px + 3 * 16px)'; // 4 карточки + 3 отступа
    return 'calc(3 * 280px + 2 * 16px)'; // 3 карточки + 2 отступа (по умолчанию для средних экранов)
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = вперед, -1 = назад

  // Сброс позиции при изменении размера экрана
  useEffect(() => {
    setCurrentIndex(0);
  }, [visibleCount]);

  // Автопрокрутка
  useEffect(() => {
    if (!isAutoPlaying || totalPages <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (direction === 1) {
          // Движемся вперед
          if (prev < totalPages - 1) {
            return prev + 1;
          } else {
            // Достигли конца - меняем направление
            setDirection(-1);
            return prev - 1;
          }
        } else {
          // Движемся назад
          if (prev > 0) {
            return prev - 1;
          } else {
            // Достигли начала - меняем направление
            setDirection(1);
            return prev + 1;
          }
        }
      });
    }, 4000); // 4 секунды

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalPages, direction]);

  // Обработка свайпов
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      nextPage();
    },
    onSwipedRight: () => {
      prevPage();
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const nextPage = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(prev => prev + 1);
      setDirection(1); // Устанавливаем направление вперед
      setIsAutoPlaying(false);
      setTimeout(() => {
        setIsAutoPlaying(true);
      }, 1000);
    }
  };

  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setDirection(-1); // Устанавливаем направление назад
      setIsAutoPlaying(false);
      setTimeout(() => {
        setIsAutoPlaying(true);
      }, 1000);
    }
  };

  const handleDotClick = (pageIndex) => {
    if (pageIndex === currentIndex) return;
    setCurrentIndex(pageIndex);
    // Определяем направление на основе позиции
    setDirection(pageIndex > currentIndex ? 1 : -1);
    setIsAutoPlaying(false);
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 1000);
  };

  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        mt: reducedMargin ? { xs: 2, md: 4 } : { xs: 6, md: 10 },
        mb: 6,
        ml: { xs: 0, lg: '260px' },
        width: { xs: '100%', lg: 'calc(100vw - 289px)' },
        position: 'relative',
        px: { xs: 2, md: 4 } // Добавляем отступы по бокам
      }}
    >
      {/* Заголовок секции */}
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 800,
          color: '#ff6600',
          textAlign: { xs: 'center', lg: 'left' },
          fontSize: { xs: '1.5rem', md: '2rem' }
        }}
      >
        {title}
      </Typography>

      {/* Контейнер карусели */}
      <Box
        {...handlers}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: getContainerMaxWidth(),
          mx: 'auto'
        }}
      >
        {/* Слайды */}
        <Box
          sx={{
            display: 'flex',
            gap: 2, // 16px отступ между карточками
            transform: `translateX(-${currentIndex * (280 + 16)}px)`, // 280px карточка + 16px отступ
            transition: 'transform 0.5s ease-in-out',
            width: 'max-content', // Ширина по содержимому
          }}
        >
          {items.map((product, i) => (
            <Box
              key={product.id}
              sx={{
                width: '280px',
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <ProductCard
                product={product}
                user={user}
                inWishlist={wishlist?.some ? wishlist.some((w) => w.productId === product.id) : false}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={onAddToCart}
                cart={cart}
                onChangeCartQuantity={onChangeCartQuantity}
                onEditProduct={onEditProduct}
                viewMode="carousel"
                isAdmin={isAdmin}
              />
            </Box>
          ))}
        </Box>

        {/* Стрелки навигации (только для десктопа) */}
        {!isMobile && totalPages > 1 && (
          <>
            {/* Левая стрелка - показываем только если не в начале */}
            {currentIndex > 0 && (
              <IconButton
                onClick={prevPage}
                sx={{
                  position: 'absolute',
                  left: { xs: 4, sm: 8 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 2,
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'translateY(-50%) scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff6600',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                >
                  ‹
                </Box>
              </IconButton>
            )}

            {/* Правая стрелка - показываем только если не в конце */}
            {currentIndex < totalPages - 1 && (
              <IconButton
                onClick={nextPage}
                sx={{
                  position: 'absolute',
                  right: { xs: 4, sm: 8 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 2,
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'translateY(-50%) scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff6600',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                >
                  ›
                </Box>
              </IconButton>
            )}
          </>
        )}
      </Box>

      {/* Точки навигации */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mt: 3,
            alignItems: 'center'
          }}
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <IconButton
              key={i}
              size="small"
              onClick={() => handleDotClick(i)}
              sx={{
                padding: '6px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 102, 0, 0.1)'
                }
              }}
            >
              {i === currentIndex ? (
                <CircleIcon
                  sx={{
                    color: '#ff6600',
                    fontSize: 16,
                    transition: 'all 0.3s ease'
                  }}
                />
              ) : (
                <CircleOutlinedIcon
                  sx={{
                    color: 'rgba(0,0,0,0.3)',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: 'rgba(255, 102, 0, 0.6)'
                    }
                  }}
                />
              )}
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ElegantProductCarousel;