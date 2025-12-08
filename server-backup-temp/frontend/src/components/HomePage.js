import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import BannerSlider from './BannerSlider';
import ElegantProductCarousel from './ElegantProductCarousel';

// Главная страница
function HomePage({ products, onAddToCart, cart, user, onWishlistToggle, onChangeCartQuantity, onEditProduct, wishlist }) {
    const { t } = useTranslation();
    const isAdmin = user?.role === 'admin';
    
    // Прокрутка в начало страницы при загрузке
    useEffect(() => {
      // Немедленная прокрутка
      window.scrollTo(0, 0);
      
      // Агрессивные попытки прокрутки для надежности
      const timers = [
        setTimeout(() => window.scrollTo(0, 0), 10),
        setTimeout(() => window.scrollTo(0, 0), 50),
        setTimeout(() => window.scrollTo(0, 0), 100),
        setTimeout(() => window.scrollTo(0, 0), 200),
        setTimeout(() => window.scrollTo(0, 0), 300),
        setTimeout(() => window.scrollTo(0, 0), 500),
        setTimeout(() => window.scrollTo(0, 0), 750),
        setTimeout(() => window.scrollTo(0, 0), 1000),
        setTimeout(() => window.scrollTo(0, 0), 1500)
      ];
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }, []);
    // Новинки — сортировка по дате создания (createdAt), самые новые первые
    const newProducts = React.useMemo(() =>
      [...(products || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12),
      [products]
    );
    // Популярное — сортировка по рейтингу (rating), самые популярные первые
    const popularProducts = React.useMemo(() =>
      [...(products || [])].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12),
      [products]
    );
  
    return (
      <Box sx={{ minHeight: '80vh', pt: 4, flexDirection: 'column' }}>
        {/* Баннеры главной страницы */}
        <BannerSlider />
        <ElegantProductCarousel
          title={t('home.newArrivals')}
          products={newProducts}
          onAddToCart={onAddToCart}
          cart={cart}
          user={user}
          onWishlistToggle={onWishlistToggle}
          onChangeCartQuantity={onChangeCartQuantity}
          onEditProduct={onEditProduct}
          wishlist={wishlist}
          isAdmin={isAdmin}
          reducedMargin={true}
          reducedBottomMargin={true}
        />
        <ElegantProductCarousel
          title={t('home.popular')}
          products={popularProducts}
          onAddToCart={onAddToCart}
          cart={cart}
          user={user}
          onWishlistToggle={onWishlistToggle}
          onChangeCartQuantity={onChangeCartQuantity}
          onEditProduct={onEditProduct}
          wishlist={wishlist}
          isAdmin={isAdmin}
          reducedMargin={true}
        />
        {/* Здесь может быть дополнительный контент главной страницы */}
      </Box>
    );
  }

export default HomePage;