import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Box, Typography, Button } from '@mui/material';
import ProductCard from './ProductCard';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ProductCarousel({ title, products, onAddToCart, cart, user, onWishlistToggle, onChangeCartQuantity, onEditProduct, wishlist, isAdmin }) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const swiperRef = useRef(null);

  const handlePrev = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev();
      setForceUpdate(f => f + 1);
    }
  };
  const handleNext = () => {
    if (swiperInstance) {
      swiperInstance.slideNext();
      setForceUpdate(f => f + 1);
    }
  };

  if (!products || products.length === 0) return null;
  return (
    <Box
      sx={{
        mt: { xs: 6, md: 10 },
        mb: 6,
        ml: { xs: 0, md: '260px' },
        width: { xs: '100vw', md: 'calc(100vw - 289px)' },
        maxWidth: '100%',
        transition: 'width 0.3s',
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>{title}</Typography>
      <Box sx={{ width: '100%', position: 'relative', px: { xs: 4, md: 8 } }}
        onMouseEnter={() => { swiperInstance && swiperInstance.autoplay && swiperInstance.autoplay.stop(); }}
        onMouseLeave={() => { swiperInstance && swiperInstance.autoplay && swiperInstance.autoplay.start(); }}
      >
        {/* Стрелки как в галерее (простые HTML) */}
        <button
          onClick={() => swiperInstance && swiperInstance.slidePrev()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            width: 60,
            height: 60,
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            fontSize: 28,
            fontWeight: 600,
            color: '#ff6600',
            cursor: 'pointer',
            zIndex: 2,
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          ‹
        </button>
        <button
          onClick={() => swiperInstance && swiperInstance.slideNext()}
          style={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            width: 60,
            height: 60,
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            fontSize: 28,
            fontWeight: 600,
            color: '#ff6600',
            cursor: 'pointer',
            zIndex: 2,
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          ›
        </button>
        <Swiper
          modules={[Pagination, A11y, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            600: { slidesPerView: 2, spaceBetween: 20 },
            900: { slidesPerView: 2, spaceBetween: 25 },
            1200: { slidesPerView: 3, spaceBetween: 30 },
            1400: { slidesPerView: 4, spaceBetween: 30 },
          }}
          style={{ paddingBottom: 32, width: '100%' }}
          onSwiper={instance => {
            setSwiperInstance(instance);
            swiperRef.current = instance;
          }}
          onSlideChange={() => setForceUpdate(f => f + 1)}
        >
          {products.map(product => (
            <SwiperSlide key={product.id}>
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
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}

export default ProductCarousel; 