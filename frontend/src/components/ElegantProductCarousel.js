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
  reducedMargin = false,
  reducedBottomMargin = false
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMedium = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLarge = useMediaQuery('(min-width: 1500px)');

  // Количество видимых товаров на разных экранах
  const visibleCount = isMobile ? 2 : isTablet ? 4 : isLarge ? 4 : 3;
  const items = products || [];
  const totalPages = Math.max(1, Math.ceil(items.length / visibleCount));

  // Адаптивные размеры контейнера
  const getContainerMaxWidth = () => {
    if (isMobile) return '100%'; // Полная ширина на мобильных (как в каталоге)
    if (isTablet) return '100%'; // Полная ширина на планшетах
    if (isLarge) return 'calc(2 * 280px + 16px)'; // 2 карточки по 280px + 16px отступ
    return 'calc(2 * 280px + 16px)'; // 2 карточки по 280px + 16px отступ
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  // Сброс позиции при изменении размера экрана
  useEffect(() => {
    setCurrentIndex(0);
  }, [visibleCount]);


  // Обработка свайпов
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      nextPage();
    },
    onSwipedRight: () => {
      prevPage();
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  const nextPage = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDotClick = (pageIndex) => {
    if (pageIndex === currentIndex) return;
    setCurrentIndex(pageIndex);
  };

  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        mt: reducedMargin ? { xs: 2, md: 4 } : { xs: 6, md: 10 },
        mb: reducedBottomMargin ? { xs: 2, md: 3 } : 6,
        ml: { xs: 0, lg: '260px' },
        width: { xs: '100%', lg: 'calc(100vw - 289px)' },
        position: 'relative',
        px: { xs: 2, sm: 3, md: 4 } // Равномерные отступы по бокам
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
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)', // 2 карточки на мобильных как в каталоге
              sm: 'repeat(2, 1fr)', // 2 карточки на маленьких экранах
              md: 'repeat(2, 280px)', // 2 карточки по 280px на средних и больших
              lg: 'repeat(2, 280px)' // 2 карточки по 280px на больших
            },
            gap: { xs: 1, sm: 1.5, md: 2 }, // Точно как в каталоге: 8px, 12px, 16px
            width: 'max-content', // Ширина по содержимому
            justifyContent: 'center', // Центрирование
            mx: 'auto', // Автоматические отступы для центрирования
          }}
        >
          {items.slice(currentIndex * visibleCount, (currentIndex + 1) * visibleCount).map((product, i) => (
            <Box
              key={product.id}
              sx={{
                width: '100%', // Полная ширина в grid (как в каталоге)
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <ProductCard
                product={product}
                user={user}
                inWishlist={wishlist?.includes ? wishlist.includes(product.id) : false}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={onAddToCart}
                cart={cart}
                onChangeCartQuantity={onChangeCartQuantity}
                onEditProduct={onEditProduct}
                viewMode={(isMobile || isTablet) ? "carousel-mobile" : "carousel"}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  opacity: 1,
                  visibility: 'visible',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-50%) scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    opacity: 1,
                    visibility: 'visible'
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  opacity: 1,
                  visibility: 'visible',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-50%) scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    opacity: 1,
                    visibility: 'visible'
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
            gap: { xs: 1, md: 1.5 },
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
                padding: { xs: '4px', md: '6px' },
                '&:hover': {
                  backgroundColor: 'rgba(255, 102, 0, 0.1)'
                }
              }}
            >
              {i === currentIndex ? (
                <CircleIcon
                  sx={{
                    color: '#ff6600',
                    fontSize: { xs: 12, md: 16 },
                    transition: 'all 0.3s ease'
                  }}
                />
              ) : (
                <CircleOutlinedIcon
                  sx={{
                    color: 'rgba(0,0,0,0.3)',
                    fontSize: { xs: 12, md: 16 },
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