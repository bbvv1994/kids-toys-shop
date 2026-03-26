import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import BannerSlider from './BannerSlider';
import ElegantProductCarousel from './ElegantProductCarousel';
import { FRONTEND_URL } from '../config';

// Главная страница
function HomePage({ products, onAddToCart, cart, user, onWishlistToggle, onChangeCartQuantity, onEditProduct, wishlist }) {
    const { t, i18n } = useTranslation();
    const isAdmin = user?.role === 'admin';
    const isHebrew = i18n.language === 'he';
    const runtimeBaseUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : '';
    const siteUrl = (FRONTEND_URL || runtimeBaseUrl || 'https://simba-tzatzuim.co.il').replace(/\/+$/, '');
    const canonicalUrl = `${siteUrl}`;
    const seoTitle = isHebrew
      ? 'סימבה מלך הצעצועים | חנות צעצועים לילדים בקריית ים ובקריות'
      : 'Симба - Король игрушек | Магазин детских игрушек в Кирьят-Яме и Крайот';
    const seoDescription = isHebrew
      ? 'סימבה מלך הצעצועים - חנות צעצועים לילדים בקריית ים ובקריות. לגו, משחקי קופסה, יצירה וצעצועים לפי גיל.'
      : 'Симба - Король игрушек — магазин детских игрушек в Кирьят-Яме и Крайот. Конструкторы, настольные игры, творчество и игрушки по возрасту.';
    const ogLocale = isHebrew ? 'he_IL' : 'ru_RU';

    // Fallback in case Helmet updates are delayed/skipped in some environments.
    useEffect(() => {
      document.title = seoTitle;

      const ensureMeta = (selector, attrs, content) => {
        let el = document.head.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      let canonicalEl = document.head.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        canonicalEl.setAttribute('data-manual-canonical', 'true');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);

      ensureMeta('meta[name="description"]', { name: 'description' }, seoDescription);
      ensureMeta('meta[property="og:locale"]', { property: 'og:locale' }, ogLocale);
      ensureMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
      ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, isHebrew ? 'סימבה מלך הצעצועים' : 'Симба - Король игрушек');
      ensureMeta('meta[property="og:title"]', { property: 'og:title' }, seoTitle);
      ensureMeta('meta[property="og:description"]', { property: 'og:description' }, seoDescription);
      ensureMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
      ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
      ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, seoTitle);
      ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, seoDescription);
    }, [canonicalUrl, isHebrew, ogLocale, seoDescription, seoTitle]);
    
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
      <>
        <Helmet>
          <title>{seoTitle}</title>
          <meta name="description" content={seoDescription} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:locale" content={ogLocale} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={isHebrew ? 'סימבה מלך הצעצועים' : 'Симба - Король игрушек'} />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDescription} />
          <meta property="og:url" content={canonicalUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoTitle} />
          <meta name="twitter:description" content={seoDescription} />
        </Helmet>
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
      </>
    );
  }

export default HomePage;