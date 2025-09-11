import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useSwipeable } from "react-swipeable";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ProductCard from './ProductCard';

function SimpleProductCarousel({ title, products, onAddToCart, cart, user, onWishlistToggle, onChangeCartQuantity, onEditProduct, wishlist, isAdmin }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0);

  // сколько карточек показывать на экране
  const visible = isMobile ? 1 : isTablet ? 2 : 3;

  // удвоенный список для "кольца"
  const items = products ? [...products, ...products] : [];

  // Measure container width and compute item width in px
  useEffect(() => {
    const updateSizes = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const computedItemWidth = containerWidth / visible;
      setItemWidth(computedItemWidth);
    };

    updateSizes();
    const ro = new ResizeObserver(updateSizes);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateSizes);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSizes);
    };
  }, [visible]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) {
      console.log('🚫 nextSlide [' + title + '] blocked - already transitioning');
      return;
    }
    
    setIsTransitioning(true);
    setIndex((prev) => {
      const newIndex = prev + 1;
      console.log('🔄 nextSlide [' + title + ']:', prev, '->', newIndex);
      return newIndex;
    });
    setIsAnimating(true);
    
    // Сброс флага через время анимации
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning, title]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) {
      console.log('🚫 prevSlide [' + title + '] blocked - already transitioning');
      return;
    }
    
    setIsTransitioning(true);
    setIndex((prev) => {
      const newIndex = (prev - 1 + items.length) % items.length;
      console.log('🔄 prevSlide [' + title + ']:', prev, '->', newIndex);
      return newIndex;
    });
    setIsAnimating(true);
    
    // Сброс флага через время анимации
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning, title, items.length]);

  // автопрокрутка
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    const timer = setInterval(() => {
      console.log('⏰ Auto-scroll triggered for:', title);
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [products, title, nextSlide]);

  // сброс позиции (кольцо) без визуального рывка
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    const pageSize = 1; // двигаемся по 1 карточке
    const needForwardReset = index >= products.length;
    const needBackwardReset = index < 0; // теоретически не должно, но пусть будет

    if (needForwardReset || needBackwardReset) {
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setIndex((prev) => {
          if (needForwardReset) return prev - products.length;
          if (needBackwardReset) return prev + products.length;
          return prev;
        });
        setTimeout(() => setIsAnimating(true), 50);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [index, products]);

  // свайпы
  const handlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true,
  });

  if (!products || products.length === 0) return null;

  // Отладочная информация
  const translateX = `-${index * itemWidth}px`;
  const width = itemWidth > 0 ? `${items.length * itemWidth}px` : `${(items.length * 100) / visible}%`;
  
  console.log('Carousel Debug [' + title + ']:', {
    productsLength: products.length,
    itemsLength: items.length,
    visible,
    index,
    isAnimating,
    translateX,
    width,
    shouldReset: index >= products.length,
    isTransitioning
  });

  return (
    <Box
      sx={{
        mt: { xs: 6, md: 10 },
        mb: 6,
        ml: { xs: 0, sm: 0, md: 0, lg: '260px' },
        width: { xs: '100vw', sm: '100vw', md: '100vw', lg: 'calc(100vw - 289px)' },
        maxWidth: '100%',
        transition: 'width 0.3s',
      }}
    >
      {/* Заголовок */}
      <Typography 
        variant="h5" 
        sx={{ 
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
          textAlign: { xs: 'center', sm: 'center', md: 'center', lg: 'left' }
        }}
      >
        {title}
      </Typography>

      {/* Карусель */}
      <Box
        {...handlers}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 1100,
          mx: "auto",
          overflow: "hidden",
          py: 4,
        }}
      >
        {/* Лента карточек */}
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            transform: `translateX(${translateX})`,
            transition: isAnimating ? "transform 0.8s ease-in-out" : "none",
            width: width,
            boxSizing: 'border-box'
          }}
        >
          {items.map((product, i) => (
            <Box
              key={`${product.id}-${i}`}
              sx={{
                flex: itemWidth > 0 ? `0 0 ${itemWidth}px` : `0 0 ${100 / visible}%`,
                boxSizing: 'border-box',
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
          ))}
        </Box>

        {/* Стрелки */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: "absolute",
            top: "50%",
            left: 10,
            transform: "translateY(-50%)",
            bgcolor: "white",
            boxShadow: 2,
            "&:hover": { bgcolor: "grey.200" },
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        <IconButton
          onClick={nextSlide}
          sx={{
            position: "absolute",
            top: "50%",
            right: 10,
            transform: "translateY(-50%)",
            bgcolor: "white",
            boxShadow: 2,
            "&:hover": { bgcolor: "grey.200" },
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default SimpleProductCarousel;