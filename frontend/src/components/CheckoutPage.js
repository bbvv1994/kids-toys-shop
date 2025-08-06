import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, TextField, Button, 
  Radio, RadioGroup, FormControlLabel, FormControl, 
  FormLabel, Divider, Paper, Grid, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../config';

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
  const [pickupStore, setPickupStore] = useState('store1');
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
    console.log('🔍 Checkout validation:', { formData, pickupStore, cart });
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !pickupStore) {
      setError('Пожалуйста, заполните все обязательные поля и выберите магазин для самовывоза');
      setLoading(false);
      return;
    }

    try {
      if (isGuest) {
        // Гостевой заказ
        console.log('🔍 Cart items before mapping:', cart.items);
        const cartItems = cart.items
          .filter(item => item.product && item.product.id) // Фильтруем удаленные товары
          .map(item => {
            console.log('🔍 Processing cart item:', item);
            const mappedItem = {
              productId: parseInt(item.product.id),
              quantity: item.quantity,
              price: item.product.price,
              productName: item.product.name
            };
            console.log('🔍 Mapped item:', mappedItem);
                      return mappedItem;
        });
        
        console.log('🔍 Final cartItems:', cartItems);
        
        if (cartItems.length === 0) {
          setError('В корзине нет доступных товаров для заказа');
          setLoading(false);
          return;
        }

        // Добавляем код страны к номеру телефона
        const customerInfoWithPhone = {
          ...formData,
          phone: formData.phone.startsWith('+972') ? formData.phone : `+972${formData.phone.replace(/^0/, '')}`
        };

        const requestBody = {
          customerInfo: customerInfoWithPhone,
          pickupStore,
          paymentMethod,
          total: calculateTotal(),
          cartItems
        };
        console.log('📤 Guest checkout request:', requestBody);
        
        const response = await fetch(`${API_BASE_URL}/api/guest/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        console.log('📥 Guest checkout response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Guest checkout error response:', errorData);
          throw new Error(errorData.error || 'Ошибка при создании заказа');
        }

        const orderData = await response.json();
        console.log('✅ Guest checkout success:', orderData);
        
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

        // Добавляем код страны к номеру телефона для авторизованных пользователей
        const customerInfoWithPhone = {
          ...formData,
          phone: formData.phone.startsWith('+972') ? formData.phone : `+972${formData.phone.replace(/^0/, '')}`
        };

        // Подготавливаем данные корзины для авторизованных пользователей
        const cartItems = cart.items
          .filter(item => item.product && item.product.id)
          .map(item => ({
            productId: parseInt(item.product.id),
            quantity: item.quantity,
            price: item.product.price,
            productName: item.product.name
          }));

        if (cartItems.length === 0) {
          setError('В корзине нет доступных товаров для заказа');
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
            customerInfo: customerInfoWithPhone,
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
      }
    } catch (err) {
      console.error('❌ Checkout error:', err);
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
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          <Grid gridColumn="span 12" md="span 6">
            <Paper sx={{ p: 3, background: 'white', width: '900px' }}>
              <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
                Информация о заказе
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
                    InputProps={{
                      startAdornment: <span style={{ color: '#000', marginRight: '8px' }}>+972</span>,
                    }}
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
          <Grid gridColumn="span 12" md="span 6">
            <Paper sx={{ p: 3, background: 'white', width: '900px' }}>
              <Typography variant="h6" gutterBottom>
                Итоги заказа
              </Typography>
              {cart.items.map((item) => (
                <Box key={item.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 3,
                    border: '2px solid #f0f0f0',
                    flexShrink: 0,
                    backgroundImage: `url(${getImageUrl(item.product.imageUrls?.[0] || '/toys.png')})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {item.product.name} x {item.quantity}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.product.price} ₪ x {item.quantity} = {item.product.price * item.quantity} ₪
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Товары: {cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)} ₪
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Самовывоз из: {pickupStore === 'store1' ? 'רוברט סולד 8 קריית ים' : 'ויצמן 6 קריית מוצקין'}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Оплата: Наличными или картой
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
                sx={{ 
                  mt: 2, 
                  mt: 'auto',
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
                }}
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