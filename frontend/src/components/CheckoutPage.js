import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, TextField, Button, 
  Radio, RadioGroup, FormControlLabel, FormControl, 
  FormLabel, Divider, Paper, Grid, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage({ cart, onPlaceOrder, onClearCart }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    zipCode: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [pickupStore, setPickupStore] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  // Загрузка данных пользователя
  const loadUserData = async () => {
    try {
      setLoadingUserData(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.token) {
        // Если пользователь не авторизован, переключаемся в гостевой режим
        setIsGuest(true);
        setLoadingUserData(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        
        // Автоматически заполняем форму данными пользователя
        setFormData({
          firstName: data.user.name || '',
          lastName: data.user.surname || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          city: '',
          zipCode: ''
        });
      } else {
        // Если токен недействителен, переключаемся в гостевой режим
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsGuest(true);
    } finally {
      setLoadingUserData(false);
    }
  };

  // Загружаем данные пользователя при загрузке компонента
  useEffect(() => {
    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const deliveryCost = deliveryMethod === 'delivery' ? 30 : 0;
    return subtotal + deliveryCost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !pickupStore) {
      setError('Пожалуйста, заполните все обязательные поля и выберите магазин для самовывоза');
      setLoading(false);
      return;
    }

    try {
      if (isGuest) {
        // Гостевой заказ
        const cartItems = cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name
        }));

        const response = await fetch(`${API_BASE_URL}/api/guest/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerInfo: formData,
            pickupStore,
            paymentMethod,
            total: calculateTotal(),
            cartItems
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при создании заказа');
        }

        const orderData = await response.json();
        
        // Очищаем корзину после успешного заказа
        if (onClearCart) {
          onClearCart();
        }
        
        // Перенаправление на страницу успеха
        navigate('/order-success', { 
          state: { 
            orderNumber: `ORD-${orderData.order.id}`,
            orderData: {
              ...orderData.order,
              customer: formData,
              pickupStore,
              paymentMethod,
              total: calculateTotal()
            }
          } 
        });
      } else {
        // Заказ для авторизованного пользователя
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.token) {
          setError('Необходимо войти в систему');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/profile/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            customerInfo: formData,
            pickupStore,
            paymentMethod,
            total: calculateTotal()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при создании заказа');
        }

        const orderData = await response.json();
        
        // Очищаем корзину после успешного заказа
        if (onClearCart) {
          onClearCart();
        }
        
        // Перенаправление на страницу успеха
        navigate('/order-success', { 
          state: { 
            orderNumber: `ORD-${orderData.order.id}`,
            orderData: {
              ...orderData.order,
              customer: formData,
              pickupStore,
              paymentMethod,
              total: calculateTotal()
            }
          } 
        });
      }
    } catch (err) {
      setError('Ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          Ваша корзина пуста. <Button onClick={() => navigate('/catalog')}>Перейти к товарам</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Оформление заказа
      </Typography>

      {loadingUserData && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Загрузка данных пользователя...
          </Typography>
        </Box>
      )}

      {!loadingUserData && (
        <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid gridColumn="span 12" md="span 8">
            <Paper sx={{ p: 3, background: 'white' }}>
              <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
                📋 Информация о заказе
              </Typography>
              
              {isGuest ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Вы оформляете заказ как гость. Пожалуйста, заполните все поля.
                </Alert>
              ) : userData && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Данные автоматически заполнены из вашего профиля. При необходимости вы можете их изменить.
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid gridColumn="span 12" md="span 6">
                  <TextField
                    fullWidth
                    label="Имя"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid gridColumn="span 12" md="span 6">
                  <TextField
                    fullWidth
                    label="Фамилия"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid gridColumn="span 12" md="span 6">
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid gridColumn="span 12" md="span 6">
                  <TextField
                    fullWidth
                    label="Телефон"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid gridColumn="span 12">
                  <FormControl fullWidth required sx={{ mb: 2 }}>
                    <FormLabel>Магазин для самовывоза</FormLabel>
                    <RadioGroup
                      row
                      value={pickupStore}
                      onChange={e => setPickupStore(e.target.value)}
                    >
                      <FormControlLabel value="store1" control={<Radio />} label="רוברט סולד 8 קריית ים" />
                      <FormControlLabel value="store2" control={<Radio />} label="ויצמן 6 קריית מוצקין" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid gridColumn="span 12" md="span 4">
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Итоги заказа
              </Typography>
              {cart.items.map((item) => (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.product.price} ₪ x {item.quantity} = {item.product.price * item.quantity} ₪
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Товары: {cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)} ₪
                </Typography>
                <Typography variant="body2">
                  Самовывоз: Бесплатно
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" color="primary">
                Итого: {calculateTotal()} ₪
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Оформление...' : 'Оформить заказ'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
      )}
    </Container>
  );
} 