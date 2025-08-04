import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Rating, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import { API_BASE_URL } from '../config';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('ReviewsPage: Загружаем отзывы о магазине');
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reviews/shop/published`)
      .then(res => {
        console.log('ReviewsPage: Ответ API отзывов о магазине:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('ReviewsPage: Полученные отзывы о магазине:', data);
        setReviews(data);
      })
      .catch((error) => {
        console.error('ReviewsPage: Ошибка загрузки отзывов:', error);
        setError('Ошибка загрузки отзывов');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        Отзывы о магазине
      </Typography>
      
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {reviews.length === 0 && !loading && (
        <Typography sx={{ textAlign: 'center', color: '#888', py: 4 }}>
          Пока нет отзывов.
        </Typography>
      )}
      
      {reviews.length > 0 && (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {reviews.map((review, index) => {
              // Проверяем, что у отзыва есть id
              if (!review || !review.id) {
                console.warn('Review without id:', review);
                return null;
              }
              
              return (
                <React.Fragment key={review.id}>
                <ListItem sx={{ 
                  py: 3, 
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#f8f9fa'
                  }
                }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating 
                          value={review.rating} 
                          readOnly 
                          size="small" 
                          sx={{ mr: 2 }}
                        />
                        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                          {review.user?.name || 'Пользователь'}
                        </Typography>
                        <Typography sx={{ ml: 'auto', color: '#888', fontSize: 14 }}>
                          {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography sx={{ 
                        color: '#333', 
                        fontSize: 15, 
                        lineHeight: 1.5,
                        mt: 1
                      }}>
                        {review.text}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < reviews.length - 1 && (
                  <Divider sx={{ mx: 3 }} />
                )}
              </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
} 