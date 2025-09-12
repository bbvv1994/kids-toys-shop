import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useSwipeable } from "react-swipeable";
import CircleIcon from "@mui/icons-material/Circle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import ProductCard from "./ProductCard";

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
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLarge = useMediaQuery("(min-width: 1500px)");

  // Кол-во карточек в ряд
  const visibleCount = isMobile ? 1 : isTablet ? 2 : isLarge ? 4 : 3;

  const productCount = products?.length || 0;
  const cardWidth = 280 + 16; // ширина + отступ
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Оптимизация: рендерим только видимые товары + буфер
  const bufferSize = 2; // дополнительных товара с каждой стороны
  const totalVisible = visibleCount + bufferSize * 2;
  
  // Создаем оптимизированный список товаров
  const getVisibleItems = () => {
    if (productCount === 0) return [];
    
    const items = [];
    const startIndex = Math.max(0, currentIndex - bufferSize);
    const endIndex = Math.min(productCount, startIndex + totalVisible);
    
    // Добавляем товары с учетом кольцевой структуры
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        ...products[i],
        originalIndex: i,
        displayIndex: i - startIndex
      });
    }
    
    // Если дошли до конца, добавляем товары с начала
    if (endIndex === productCount && productCount > totalVisible) {
      const remaining = totalVisible - (endIndex - startIndex);
      for (let i = 0; i < remaining; i++) {
        items.push({
          ...products[i],
          originalIndex: i,
          displayIndex: items.length
        });
      }
    }
    
    return items;
  };
  
  const visibleItems = getVisibleItems();
  const [isAnimating, setIsAnimating] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Сброс при ресайзе
  useEffect(() => {
    setCurrentIndex(0);
  }, [visibleCount]);

  // Автопрокрутка
  useEffect(() => {
    if (!isAutoPlaying || productCount <= visibleCount) return;

    const interval = setInterval(() => {
      nextPage();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, productCount, visibleCount]);

  // Упрощенная логика анимации
  useEffect(() => {
    setIsAnimating(true);
  }, [currentIndex]);

  // Навигация
  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % productCount);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => prev > 0 ? prev - 1 : productCount - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  // Свайпы
  const handlers = useSwipeable({
    onSwipedLeft: () => nextPage(),
    onSwipedRight: () => prevPage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (productCount === 0) return null;

  return (
    <Box
      sx={{
        mt: reducedMargin ? { xs: 2, md: 4 } : { xs: 6, md: 10 },
        mb: 6,
        ml: { xs: 0, lg: "260px" },
        width: { xs: "100%", lg: "calc(100vw - 289px)" },
        position: "relative",
        px: { xs: 2, md: 4 },
      }}
    >
      {/* Заголовок */}
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 800,
          color: "#ff6600",
          textAlign: { xs: "center", lg: "left" },
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        {title}
      </Typography>

      {/* Карусель */}
      <Box
        {...handlers}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: `calc(${visibleCount} * 280px + ${
            visibleCount - 1
          } * 16px)`,
          mx: "auto",
        }}
      >
        {/* Лента */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            transform: `translateX(-${bufferSize * cardWidth}px)`,
            transition: isAnimating ? "transform 0.5s ease-in-out" : "none",
            width: "max-content",
          }}
        >
          {visibleItems.map((product, i) => (
            <Box
              key={`${product.id}-${product.originalIndex}`}
              sx={{
                width: "280px",
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ProductCard
                product={product}
                user={user}
                inWishlist={
                  wishlist?.some
                    ? wishlist.some((w) => w.productId === product.id)
                    : false
                }
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
        {!isMobile && productCount > visibleCount && (
          <>
            {/* Левая */}
            <IconButton
              onClick={prevPage}
              sx={{
                position: "absolute",
                left: { xs: 4, sm: 8 },
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 2,
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                "&:hover": {
                  backgroundColor: "white",
                  transform: "translateY(-50%) scale(1.05)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff6600",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                ‹
              </Box>
            </IconButton>

            {/* Правая */}
            <IconButton
              onClick={nextPage}
              sx={{
                position: "absolute",
                right: { xs: 4, sm: 8 },
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 2,
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                "&:hover": {
                  backgroundColor: "white",
                  transform: "translateY(-50%) scale(1.05)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff6600",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                ›
              </Box>
            </IconButton>
          </>
        )}
      </Box>

      {/* Точки */}
      {productCount > visibleCount && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1.5,
            mt: 3,
            alignItems: "center",
          }}
        >
          {Array.from({ length: productCount }).map((_, i) => (
            <IconButton
              key={i}
              size="small"
              onClick={() => setCurrentIndex(i)}
              sx={{
                padding: "6px",
                "&:hover": {
                  backgroundColor: "rgba(255, 102, 0, 0.1)",
                },
              }}
            >
              {i === currentIndex % productCount ? (
                <CircleIcon
                  sx={{
                    color: "#ff6600",
                    fontSize: 16,
                    transition: "all 0.3s ease",
                  }}
                />
              ) : (
                <CircleOutlinedIcon
                  sx={{
                    color: "rgba(0,0,0,0.3)",
                    fontSize: 16,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "rgba(255, 102, 0, 0.6)",
                    },
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