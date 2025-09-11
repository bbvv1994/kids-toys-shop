import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import ProductCard from './ProductCard';

function UltraLightCarousel({ title, products, user, wishlist, onWishlistToggle, onAddToCart, cart, onChangeCartQuantity, onEditProduct, isAdmin }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const visibleCount = isMobile ? 1 : isTablet ? 2 : 3;
  const items = products || [];
  const pageCount = Math.max(1, Math.ceil(items.length / visibleCount));
  const [page, setPage] = useState(0);
  
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(items.length / visibleCount) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [items.length, visibleCount, page]);

  const handleDotClick = (i) => setPage(i);

  if (items.length === 0) return null;

  return (
    <Box sx={{ mt: { xs: 6, md: 10 }, mb: 6, ml: { xs: 0, lg: '260px' }, width: { xs: '100vw', lg: 'calc(100vw - 289px)' } }}>
      <Typography
        variant="h5"
        sx={{ mb: 2, fontWeight: 800, color: '#ff6600', textAlign: { xs: 'center', lg: 'left' } }}
      >
        {title}
      </Typography>

      <Box sx={{ overflow: 'hidden', px: { xs: 2, sm: 3 }, py: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            columnGap: 16,
            width: '100%',
            transform: `translate3d(-${page * 100}%, 0, 0)`,
            transition: 'transform 400ms ease',
          }}
        >
          {items.map((product) => (
            <Box key={product.id} sx={{
              width: '100%',
              boxSizing: 'border-box',
              padding: 8,
              gridColumn: `span ${visibleCount}`,
            }}>
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
      </Box>

      {/* Dots */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1 }}>
          {Array.from({ length: pageCount }).map((_, i) => (
            <Box
              key={i}
              onClick={() => handleDotClick(i)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: i === page ? '#ff6600' : 'rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'transform 150ms ease',
                '&:hover': { transform: 'scale(1.15)' },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default UltraLightCarousel;


