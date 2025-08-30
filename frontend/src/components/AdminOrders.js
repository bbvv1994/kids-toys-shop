import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { getTranslatedName } from '../utils/translationUtils';

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
      <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
        Управление заказами
      </Typography>
      
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#666' }}>
            Заказов пока нет
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID заказа</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Клиент</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Товары</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Магазин</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {order.user?.name || order.user?.email || 'Неизвестно'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {getTranslatedName(item.product)} × {item.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      ₪{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.pickupStore === 'store1' ? 'ул. Роберт Сольд 8, Кирьят-Ям' : order.pickupStore === 'store2' ? 'ул. Вайцман 6, Кирьят-Моцкин' : 'Не выбран'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusChange(order.id, order.status)}
                    >
                      Обновить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
} 