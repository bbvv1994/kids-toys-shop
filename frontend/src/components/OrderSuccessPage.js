import React from 'react';
import { API_BASE_URL } from '../config';
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" color="success.main" gutterBottom>
          Заказ успешно оформлен!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Номер заказа: {orderNumber}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          <strong>Самовывоз из:</strong> {orderData?.pickupStore === 'store1' ? 'רוברט סולד 8 קריית ים' : orderData?.pickupStore === 'store2' ? 'ויצמן 6 קריית מוצקין' : 'Не выбран'}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid gridColumn="span 12" md="span 6">
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2E7D32', fontWeight: 'bold' }}>
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
        </Grid>
        <Grid gridColumn="span 12" md="span 6">
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#E65100', fontWeight: 'bold' }}>
              💰 Итоговая сумма
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#E65100' }}>
                {total} ₪
              </Typography>
              <EmojiEventsIcon sx={{ fontSize: 40, color: '#FF9800' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Спасибо за ваш заказ! Мы уведомим вас о статусе доставки.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3, background: 'white' }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
          🛒 Товары в заказе
        </Typography>
        {orderData?.items?.map((item, index) => (
          <Box key={index} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            mb: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 2,
            background: '#fafafa'
          }}>
            <img
              src={item.product.imageUrls && item.product.imageUrls.length > 0 
                ? `${API_BASE_URL}${item.product.imageUrls[0]}` 
                : '/toys.png'}
              alt={item.product.name}
              style={{ 
                width: 60, 
                height: 60, 
                objectFit: 'cover', 
                borderRadius: 8,
                marginRight: 16
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {item.product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Количество: {item.quantity} × ₪{item.product.price}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              ₪{(item.product.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
        ))}
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container alignItems="center" spacing={2}>
          <Grid gridColumn="span 8">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Итого:
            </Typography>
          </Grid>
          <Grid gridColumn="span 4" sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              ₪{total}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Мы отправили подтверждение заказа на ваш email.
          Наш менеджер свяжется с вами в течение 24 часов.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/catalog')}
          >
            Продолжить покупки
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/profile')}
          >
            Мои заказы
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 