import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import ProductCard from './ProductCard';
import { searchInProductNames } from '../utils/translationUtils';
import { FRONTEND_URL } from '../config';

export default function SearchResultsPage({ products, cart, onChangeCartQuantity }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';

  const isHebrew = i18n.language === 'he';
  const runtimeBaseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : '';
  const siteUrl = (FRONTEND_URL || runtimeBaseUrl || 'https://simba-tzatzuim.co.il').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/search`;

  const seoTitle = isHebrew
    ? 'תוצאות חיפוש | סימבה מלך הצעצועים בקריית ים ובקריות'
    : 'Результаты поиска | Симба - Король игрушек в Кирьят-Яме и Крайот';

  const seoDescription = isHebrew
    ? 'תוצאות חיפוש של סימבה מלך הצעצועים לפי מילות חיפוש. צעצועים לפי קטגוריות, מותגים וגיל.'
    : 'Результаты поиска по сайту Симба - Король игрушек. Подбор игрушек по категориям, брендам и возрасту.';

  // Fallback in case Helmet updates are delayed/skipped in some environments.
  React.useEffect(() => {
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
    ensureMeta('meta[property="og:locale"]', { property: 'og:locale' }, isHebrew ? 'he_IL' : 'ru_RU');
    ensureMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, isHebrew ? 'סימבה מלך הצעצועים' : 'Симба - Король игрушек');
    ensureMeta('meta[property="og:title"]', { property: 'og:title' }, seoTitle);
    ensureMeta('meta[property="og:description"]', { property: 'og:description' }, seoDescription);
    ensureMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, seoTitle);
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, seoDescription);
  }, [canonicalUrl, isHebrew, seoDescription, seoTitle]);
  const filteredProducts = products.filter(product =>
    query && (
      searchInProductNames(product, query) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.descriptionHe?.toLowerCase().includes(query.toLowerCase()) ||
      (typeof product.category === 'string' ? product.category.toLowerCase().includes(query.toLowerCase()) : 
       product.category?.name?.toLowerCase().includes(query.toLowerCase()) || false)
    )
  );
  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:locale" content={isHebrew ? 'he_IL' : 'ru_RU'} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={isHebrew ? 'סימבה מלך הצעצועים' : 'Симба - Король игрушек'} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Helmet>
      {/* Заголовок по центру всего экрана */}
      <Container maxWidth={false} sx={{ py: { xs: 2, md: 0.25 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, pt: { xs: 0, md: 0 } }}>
          <Typography variant="h2" sx={{ 
            textAlign: 'center', 
            mb: 4,
            fontWeight: 800, 
            color: '#ff6600',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            fontSize: '3rem',
            textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {t('searchResults.title')}
          </Typography>
          <Typography sx={{ textAlign: 'center', mb: 2, color: '#666' }} dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
            {t('searchResults.forQuery')}{i18n.language === 'he' ? ':' : ''} <b>{query}</b>
          </Typography>
        </Box>
      </Container>

      {/* Контейнер товаров без левого отступа 270 */}
      <Container maxWidth={false} sx={{ px: 0 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', // 2 cards per row on mobile
            sm: 'repeat(2, 1fr)', // 2 cards per row on small screens (до 900px)
            md: 'repeat(3, 280px)', // 3 standard columns on ≥900px
            lg: 'repeat(4, 280px)' // 4 standard columns on ≥1200px
          },
          '@media (min-width:1400px)': {
            gridTemplateColumns: 'repeat(5, 280px)',
            maxWidth: 'calc(5 * 280px + 4 * 16px)'
          },
          gap: { xs: 1, sm: 1.5, md: 2 },
          mt: 0.5,
          mb: 6,
          width: '100%',
          maxWidth: {
            xs: '100%',
            md: 'calc(3 * 280px + 2 * 16px)',
            lg: 'calc(4 * 280px + 3 * 16px)'
          },
          '@media (min-width:1450px)': {
            maxWidth: 'calc(5 * 280px + 4 * 16px)'
          },
          mx: 'auto',
          px: 0,
          justifyItems: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Box key={product.id}>
                <ProductCard 
                  product={product} 
                  cart={cart}
                  onChangeCartQuantity={onChangeCartQuantity}
                />
              </Box>
            ))
          ) : (
            <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 20 }} dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
              {query ? (i18n.language === 'he' ? 
                <span dangerouslySetInnerHTML={{ __html: `לא נמצא דבר לחיפוש: <b>${query}</b>` }} /> : 
                t('searchResults.noResults', { query: query })) : t('searchResults.enterQuery')}
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
} 
