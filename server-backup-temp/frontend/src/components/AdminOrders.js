import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Paper,
  Container,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import { getTranslatedName } from '../utils/translationUtils';
import { API_BASE_URL } from '../config';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'ready',
  'pickedup',
  'cancelled'
];

const STATUS_LABELS = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  ready: 'Готов к выдаче',
  pickedup: 'Получен',
  cancelled: 'Отменен'
};

export default function AdminOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Ошибка загрузки заказов');
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleStatusChange(orderId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Ошибка изменения статуса');
      fetchOrders();
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={fetchOrders} variant="contained">Повторить</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, minHeight: 'calc(100vh - 200px)' }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Управление заказами
          </Typography>
        </Box>
        
        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              Заказов пока нет
            </Typography>
          </Box>
        ) : (
          <List>
            {orders.map((order) => (
              <ListItem 
                key={order.id}
                sx={{ 
                  mb: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        Заказ #{order.id}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ 
                      maxWidth: { xs: '100%', sm: 'calc(100% - 200px)' },
                      pr: { xs: 0, sm: 2 }
                    }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Клиент: {order.user?.name || order.user?.email || 'Неизвестно'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Магазин: {order.pickupStore === 'store1' ? 'ул. Роберт Сольд 8, Кирьят-Ям' : order.pickupStore === 'store2' ? 'ул. Вайцман 6, Кирьят-Моцкин' : 'Не выбран'}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Товары:
                        </Typography>
                        {order.items?.slice(0, 3).map((item, index) => (
                          <Typography key={index} variant="body2" sx={{ 
                            ml: 1,
                            color: 'textSecondary'
                          }}>
                            • {getTranslatedName(item.product)} × {item.quantity}
                          </Typography>
                        ))}
                        {order.items?.length > 3 && (
                          <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                            и еще {order.items.length - 3} товаров
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 'bold',
                        color: '#1976d2'
                      }}>
                        Сумма: ₪{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: 'textSecondary',
                        display: 'block',
                        mt: 1
                      }}>
                        {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 1, 
                    alignItems: { xs: 'flex-end', sm: 'center' },
                    flexWrap: 'wrap'
                  }}>
                    {/* Статус */}
                    <Chip
                      label={STATUS_LABELS[order.status]}
                      color={
                        order.status === 'pending' ? 'warning' :
                        order.status === 'confirmed' ? 'info' :
                        order.status === 'ready' ? 'primary' :
                        order.status === 'pickedup' ? 'success' :
                        'error'
                      }
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                    
                    {/* Селект статуса */}
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      size="small"
                      sx={{ 
                        minWidth: { xs: 120, sm: 140 },
                        maxWidth: { xs: 140, sm: 'none' }
                      }}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </MenuItem>
                      ))}
                    </Select>
                    
                    {/* Кнопка обновления */}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusChange(order.id, order.status)}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: 12,
                        px: 2,
                        py: 0.5,
                        height: 28,
                        minWidth: { xs: 80, sm: 'auto' }
                      }}
                    >
                      Обновить
                    </Button>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
} 