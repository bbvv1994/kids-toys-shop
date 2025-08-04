import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import ProductCard from './ProductCard';

export default function SearchResultsPage({ products, cart, onChangeCartQuantity }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';
  const filteredProducts = products.filter(product =>
    query && (
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase())
    )
  );
  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, pt: { xs: 8, md: 10 } }}>
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 4 }}>
          Результаты поиска
        </Typography>
        <Typography sx={{ textAlign: 'center', mb: 2, color: '#666' }}>
          По запросу: <b>{query}</b>
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 3, mb: 6 }}>
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