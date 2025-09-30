import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { searchInProductNames } from '../utils/translationUtils';

export default function SearchResultsPage({ products, cart, onChangeCartQuantity }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
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
            {t('searchResults.forQuery')}{i18n.language === 'he' ? ':' : ''} <b>{i18n.language === 'he' ? query : `"${query}"`}</b>
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
                t('searchResults.noResults', { query: `"${query}"` })) : t('searchResults.enterQuery')}
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
} 
