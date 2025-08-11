import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, TextField, Button, 
  Radio, RadioGroup, FormControlLabel, FormControl, 
  FormLabel, Divider, Paper, Grid, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../config';
import { useTranslation } from 'react-i18next';

export default function CheckoutPage({ cart, onPlaceOrder, onClearCart }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        let phoneNumber = data.user.phone || '';
        
        // Очищаем номер телефона от кода страны, если он есть
        if (phoneNumber.startsWith('+972')) {
          phoneNumber = phoneNumber.substring(4);
        } else if (phoneNumber.startsWith('972')) {
          phoneNumber = phoneNumber.substring(3);
        }
        
        // Убираем ведущий ноль, если есть
        if (phoneNumber.startsWith('0')) {
          phoneNumber = phoneNumber.substring(1);
        }
        
        setFormData({
          firstName: data.user.name || '',
          lastName: data.user.surname || '',
          email: data.user.email || '',
          phone: phoneNumber,
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
    let value = e.target.value;
    
    // Специальная обработка для поля телефона
    if (e.target.name === 'phone') {
      // Убираем все символы кроме цифр
      value = value.replace(/\D/g, '');
      
      // Если номер начинается с 972, убираем его (чтобы избежать дублирования)
      if (value.startsWith('972')) {
        value = value.substring(3);
      }
      
      // Если номер начинается с 0, убираем его
      if (value.startsWith('0')) {
        value = value.substring(1);
      }
      
      // Ограничиваем длину номера (без кода страны)
      if (value.length > 9) {
        value = value.substring(0, 9);
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
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
          setError(t('checkout.loginRequired'));
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
          setError(t('checkout.noItemsError'));
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
          throw new Error(errorData.error || t('checkout.orderError'));
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
      setError(t('checkout.orderError'));
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          {t('checkout.emptyCart')} <Button onClick={() => navigate('/catalog')}>{t('checkout.goToProducts')}</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 4, md: 16 }, mb: 4 }}>

      {loadingUserData && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('checkout.loadingUserData')}
          </Typography>
        </Box>
      )}

      {!loadingUserData && (
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: { xs: 2, md: 3 }, background: 'white', mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 'bold', textAlign: 'center' }}>
              {t('checkout.orderInfo')}
            </Typography>
            {isGuest ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('checkout.guestCheckout')}
              </Alert>
            ) : userData && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('checkout.autoFilled')}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('checkout.firstName')}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('checkout.lastName')}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('checkout.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('checkout.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    const charCode = e.which ? e.which : e.keyCode;
                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                      e.preventDefault();
                    }
                  }}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <span style={{ color: '#000', marginRight: '8px' }}>+972</span>,
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <FormLabel>{t('checkout.pickupStore')}</FormLabel>
                  <RadioGroup
                    row={false}
                    value={pickupStore}
                    onChange={e => setPickupStore(e.target.value)}
                  >
                    <FormControlLabel value="store1" control={<Radio />} label={t('checkout.store1')} />
                    <FormControlLabel value="store2" control={<Radio />} label={t('checkout.store2')} />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: { xs: 2, md: 3 }, background: 'white', mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              {t('checkout.orderTotals')}
            </Typography>
            {cart.items.map((item) => (
              <Box key={item.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 60, height: 60, borderRadius: 3, border: '2px solid #f0f0f0', flexShrink: 0, backgroundImage: `url(${getImageUrl(item.product.imageUrls?.[0] || '/toys.png')})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
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
                {t('checkout.pickupFrom')} {pickupStore === 'store1' ? t('checkout.store1') : t('checkout.store2')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {t('checkout.paymentMethod')}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" sx={{ textAlign: 'center' }}>
              {t('checkout.totalAmount')} {calculateTotal()} ₪
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
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 18,
                py: 1.5,
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
              {loading ? t('checkout.processing') : t('checkout.placeOrder')}
            </Button>
          </Paper>
        </form>
      )}
    </Container>
  );
} 