import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Rating, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

export default function TestReviews() {
  const { t } = useTranslation();
  const [shopReviews, setShopReviews] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPIs = async () => {
      console.log('TestReviews: Начинаем тестирование API...');
      
      try {
        // Тестируем отзывы о магазине
        console.log('TestReviews: Тестируем /api/reviews/shop');
        const shopRes = await fetch(`${API_BASE_URL}/api/reviews/shop`);
        console.log('TestReviews: Статус отзывов о магазине:', shopRes.status);
        const shopData = await shopRes.json();
        console.log('TestReviews: Данные отзывов о магазине:', shopData);
        setShopReviews(shopData);
        
        // Тестируем отзывы о товаре
        console.log('TestReviews: Тестируем /api/reviews/product/27');
        const productRes = await fetch(`${API_BASE_URL}/api/reviews/product/27`);
        console.log('TestReviews: Статус отзывов о товаре:', productRes.status);
        const productData = await productRes.json();
        console.log('TestReviews: Данные отзывов о товаре:', productData);
        setProductReviews(productData);
        
      } catch (error) {
        console.error('TestReviews: Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };
    
    testAPIs();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>{t('reviews.test.testing')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{t('reviews.test.title')}</Typography>
      
      <Typography variant="h5" sx={{ mb: 2 }}>{t('reviews.test.shopReviews', { count: shopReviews.length })}</Typography>
      {shopReviews.map((review) => (
        <Paper key={review.id} sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={review.rating} readOnly size="small" />
            <Typography sx={{ ml: 2, fontWeight: 'bold' }}>
              {review.user?.name || t('reviews.page.user')}
            </Typography>
            <Typography sx={{ ml: 2, color: '#888' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Typography>{review.text}</Typography>
        </Paper>
      ))}
      
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>{t('reviews.test.productReviews', { count: productReviews.length })}</Typography>
      {productReviews.map((review) => (
        <Paper key={review.id} sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={review.rating} readOnly size="small" />
            <Typography sx={{ ml: 2, fontWeight: 'bold' }}>
              {review.user?.name || t('reviews.page.user')}
            </Typography>
            <Typography sx={{ ml: 2, color: '#888' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Typography>{review.text}</Typography>
        </Paper>
      ))}
    </Box>
  );
} 