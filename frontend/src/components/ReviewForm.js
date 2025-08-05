import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Star, Send, ArrowBack } from '@mui/icons-material';

const ReviewForm = ({ open, onClose, productId = null, productName = null, productImage = null }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }
    
    if (!text.trim()) {
      setError('Пожалуйста, напишите отзыв');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewData = {
        rating,
        text: text.trim(),
        ...(productId && { productId })
      };

      const response = await fetch(`${API_BASE_URL}/api/reviews/${productId ? 'product' : 'shop'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при отправке отзыва');
      }
    } catch (error) {
      setError('Ошибка сети при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  const isProductReview = !!productId;

  // Если форма не открыта, не рендерим ничего
  if (!open) {
    return null;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onClose}
            sx={{ 
              mr: 2,
              background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
              textTransform: 'none',
              minWidth: 120,
              '&:hover': {
                background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
          >
            Назад
          </Button>
          <Typography variant="h5" component="h1">
            {isProductReview ? 'Отзыв о товаре' : 'Отзыв о магазине'}
          </Typography>
        </Box>

        {/* Информация о товаре */}
        {isProductReview && productName && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                {productImage && (
                  <Grid item>
                    <CardMedia
                      component="img"
                      image={productImage.startsWith('http') ? productImage : `${API_BASE_URL}${productImage}`}
                      alt={productName}
                      sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                      onError={(e) => {
                        e.target.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4xODM0IDI1IDM4IDMxLjgyMzYgMzggMzlDMzggNDYuMTc2NCAzMi4xODM0IDUzIDI1IDUzQzE3LjgxNjYgNTMgMTIgNDYuMTc2NCAxMiAzOUMxMiAzMS44MjM2IDE3LjgxNjYgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAzMUMyNy43NjE0IDMxIDMwIDMzLjIzODYgMzAgMzZDMzAgMzguNzYxNCAyNy43NjE0IDQxIDI1IDQxQzIyLjIzODYgNDEgMjAgMzguNzYxNCAyMCAzNkMyMCAzMy4yMzg2IDIyLjIzODYgMzEgMjUgMzFaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=)';
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs>
                  <Typography variant="h6" component="h2">
                    {productName}
                  </Typography>
                  <Chip 
                    label="Отзыв о товаре" 
                    color="primary" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Форма отзыва */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Оценка */}
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" variant="h6" sx={{ mb: 1 }}>
              Ваша оценка
            </Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              sx={{ fontSize: '2rem' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {rating === 0 && 'Поставьте оценку от 1 до 5 звезд'}
              {rating === 1 && 'Плохо'}
              {rating === 2 && 'Не очень'}
              {rating === 3 && 'Нормально'}
              {rating === 4 && 'Хорошо'}
              {rating === 5 && 'Отлично!'}
            </Typography>
          </Box>

          {/* Текст отзыва */}
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" variant="h6" sx={{ mb: 1 }}>
              Ваш отзыв
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder={isProductReview 
                ? "Расскажите о ваших впечатлениях от товара. Что понравилось, что можно улучшить?"
                : "Расскажите о ваших впечатлениях от магазина. Качество обслуживания, ассортимент, доставка?"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              error={!!error && !text.trim()}
              helperText={error && !text.trim() ? error : ''}
            />
          </Box>

          {/* Сообщения об ошибках */}
          {error && !error.includes('напишите отзыв') && !error.includes('поставьте оценку') && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Сообщение об успехе */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Отзыв успешно отправлен! Спасибо за ваше мнение.
            </Alert>
          )}

          {/* Кнопки */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              sx={{
                border: '2px solid #2196f3',
                color: '#2196f3',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  border: '2px solid #1976d2',
                  color: '#1976d2',
                  background: 'rgba(33, 150, 243, 0.04)',
                  transform: 'translateY(-1px)'
                },
              }}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              disabled={loading || success}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {loading ? 'Отправка...' : 'Отправить отзыв'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReviewForm; 