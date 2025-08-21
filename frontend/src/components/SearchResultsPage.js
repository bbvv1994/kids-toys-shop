import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { searchInProductNames } from '../utils/translationUtils';

export default function SearchResultsPage({ products, cart, onChangeCartQuantity }) {
  const { t } = useTranslation();
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
    <Container maxWidth={false} sx={{ py: { xs: 2, md: 0.25 }, px: { xs: 2, md: 4 }, pl: { md: '270px' } }}>
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
        <Typography sx={{ textAlign: 'center', mb: 2, color: '#666' }}>
          <b>{query}</b> {t('searchResults.forQuery')}
        </Typography>
                 <Box sx={{ 
           display: 'grid', 
           gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
           gap: 2,
           justifyItems: 'center',
           alignItems: 'center',
           justifyContent: { xs: 'center', sm: 'start' },
           maxWidth: 1100,
           margin: '0 auto',
           mb: 6
         }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                cart={cart}
                onChangeCartQuantity={onChangeCartQuantity}
              />
            ))
          ) : (
            <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 20 }}>
              {query ? t('searchResults.noResults', { query }) : t('searchResults.enterQuery')}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
} 