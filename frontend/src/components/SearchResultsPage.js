import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import ProductCard from './ProductCard';

export default function SearchResultsPage({ products, cart, onChangeCartQuantity }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const filteredProducts = products.filter(product =>
    query && (
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      (typeof product.category === 'string' ? product.category.toLowerCase().includes(query.toLowerCase()) : 
       product.category?.name?.toLowerCase().includes(query.toLowerCase()) || false)
    )
  );
  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
             <Box sx={{ mb: 4, pt: { xs: 2, md: 4 } }}>
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
           Результаты поиска
         </Typography>
        <Typography sx={{ textAlign: 'center', mb: 2, color: '#666' }}>
          По запросу: <b>{query}</b>
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
              {query ? `По запросу "${query}" ничего не найдено` : 'Введите поисковый запрос'}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
} 