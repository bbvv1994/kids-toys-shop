import React from 'react';
import { API_BASE_URL, getImageUrl } from '../config';
import {
  Container, Typography, Box, Paper, Button, 
  Divider, Grid, Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderNumber, orderData } = location.state || {};

  if (!orderNumber) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" color="error">
          Ошибка: данные заказа не найдены
        </Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Вернуться на главную
        </Button>
      </Container>
    );
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения';
      case 'confirmed':
        return 'Подтвержден';
      case 'ready':
        return 'Готов к выдаче';
      case 'pickedup':
        return 'Получен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Неизвестный статус';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'ready':
        return 'primary';
      case 'pickedup':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const total = orderData?.total || 0;

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 4, md: 12 }, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4, pt: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" color="success.main" gutterBottom>
          Заказ успешно оформлен!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Номер заказа: {orderNumber}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          <strong>Самовывоз из:</strong> {orderData?.pickupStore === 'store1' ? 'רוברט סולד 8 קריית ים' : orderData?.pickupStore === 'store2' ? 'ויצמן 6 קריית מוצקין' : 'Не выбран'}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Спасибо за ваш заказ! Вам было отправлено подтверждение заказа на ваш email.
        </Typography>
      </Box>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#2E7D32', fontWeight: 'bold', textAlign: 'center' }}>
          📦 Информация о заказе
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Номер заказа:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            #{orderNumber}
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Статус:</Typography>
          <Chip 
            label={getStatusLabel('pending')} 
            color={getStatusColor('pending')}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Дата заказа:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {new Date(orderData?.createdAt).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
      </Paper>
      <Paper sx={{ p: { xs: 2, md: 3 }, mt: 3, background: 'white' }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#333', fontWeight: 'bold', textAlign: 'center' }}>
          Товары в заказе
        </Typography>
        {orderData?.items?.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexDirection: 'row' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, border: '2px solid #f0f0f0', flexShrink: 0, backgroundImage: `url(${getImageUrl(item.product.imageUrls?.[0] || '/toys.png')})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mr: 1 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, fontSize: 16 }}>
                {item.product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Кол-во: {item.quantity} × ₪{item.product.price}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4CAF50', fontSize: 16 }}>
              ₪{(item.product.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 3 }} />
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={8}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Итого:
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              ₪{total}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button 
          variant="contained" 
          fullWidth
          size="large"
          onClick={() => navigate('/catalog')}
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 16,
            py: 1.5,
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
            textTransform: 'none',
            minWidth: 120,
            mb: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
              transform: 'translateY(-1px)'
            },
          }}
        >
          Продолжить покупки
        </Button>
        <Button 
          variant="contained" 
          fullWidth
          size="large"
          onClick={() => navigate('/profile')}
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 16,
            py: 1.5,
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
            textTransform: 'none',
            minWidth: 120,
            mb: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
              transform: 'translateY(-1px)'
            },
          }}
        >
          Мои заказы
        </Button>
        <Button 
          variant="contained" 
          fullWidth
          size="large"
          onClick={() => navigate('/')}
          sx={{
            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 16,
            py: 1.5,
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
            textTransform: 'none',
            minWidth: 120,
            '&:hover': {
              background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
              transform: 'translateY(-1px)'
            },
          }}
        >
          На главную
        </Button>
      </Box>
    </Container>
  );
} 