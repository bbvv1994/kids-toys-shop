import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Rating, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../config';

export default function TestProductReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const testProductReviews = async () => {
      console.log('TestProductReviews: Начинаем тестирование отзывов о товаре...');
      
      try {
        // Тестируем отзывы о товаре с ID 27
        console.log('TestProductReviews: Тестируем /api/reviews/product/27');
        const res = await fetch(`${API_BASE_URL}/api/reviews/product/27`);
        console.log('TestProductReviews: Статус ответа:', res.status);
        const data = await res.json();
        console.log('TestProductReviews: Полученные отзывы:', data);
        setReviews(data);
        
      } catch (error) {
        console.error('TestProductReviews: Ошибка:', error);
        setError('Ошибка загрузки отзывов');
      } finally {
        setLoading(false);
      }
    };
    
    testProductReviews();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Загрузка отзывов...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Тестирование отзывов о товаре</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>Товар ID: 27 - Отзывы ({reviews.length})</Typography>
      
      {reviews.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: '#888' }}>
          Отзывов нет
        </Typography>
      ) : (
        reviews.map((review) => (
          <Paper key={review.id} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={review.rating} readOnly size="small" />
              <Typography sx={{ ml: 2, fontWeight: 'bold' }}>
                {review.user?.name || 'Пользователь'}
              </Typography>
              <Typography sx={{ ml: 2, color: '#888' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Typography>{review.text}</Typography>
          </Paper>
        ))
      )}
    </Box>
  );
} 