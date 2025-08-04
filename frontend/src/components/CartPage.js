import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  Divider,
  Fade,
  Slide,
  Paper,
  Grid,
  Badge,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Иконки для возрастных групп
const ageIcons = {
  '0-1 год': '/age-icons/0-1.png',
  '1-3 года': '/age-icons/1-3.png',
  '3-5 лет': '/age-icons/3-5.png',
  '5-7 лет': '/age-icons/5-7.png',
  '7-10 лет': '/age-icons/7-10.png',
  '10-12 лет': '/age-icons/10-12.png',
  '12-14 лет': '/age-icons/12-14.png',
  '14-16 лет': '/age-icons/14-16.png'
};

function CartPage({ cart, onChangeCartQuantity, onRemoveFromCart }) {
  const navigate = useNavigate();
  const [removingItem, setRemovingItem] = useState(null);
  
  console.log('🛒 CartPage: Начало рендера');
  console.log('🛒 CartPage: Получена корзина:', cart);
  console.log('🛒 CartPage: cart.items:', cart?.items);
  console.log('🛒 CartPage: cart.items.length:', cart?.items?.length);
  
  // Защита от ошибок - всегда возвращаем JSX
  if (!cart) {
    console.warn('🛒 CartPage: cart is null/undefined, using default');
    return (
      <Box sx={{ 
        maxWidth: 1400,
        width: '90%',
        mx: 'auto', 
        mt: 4, 
        p: 3,
        pt: { xs: 8, md: 10 },
        background: 'white',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <Typography variant="h3" sx={{ textAlign: 'center', color: '#666' }}>
          Загрузка корзины...
        </Typography>
      </Box>
    );
  }
  
  // Фильтруем товары, исключая удаленные (null/undefined product)
  const validItems = (cart?.items || []).filter(item => {
    if (!item || !item.product) {
      console.warn('🛒 CartPage: Найден товар с null/undefined product:', item);
      return false;
    }
    return true;
  });
  
  const items = validItems.sort((a, b) => a.id - b.id);
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  console.log('🛒 CartPage: Обработанные items:', items);
  console.log('🛒 CartPage: Количество товаров:', itemCount);
  console.log('🛒 CartPage: Общая сумма:', total);
  
  // Проверяем, что все необходимые функции переданы
  console.log('🛒 CartPage: onChangeCartQuantity:', typeof onChangeCartQuantity);
  console.log('🛒 CartPage: onRemoveFromCart:', typeof onRemoveFromCart);

  // Функция для очистки корзины от удаленных товаров
  const cleanupRemovedProducts = React.useCallback(() => {
    if (!cart?.items) return;
    
    const removedProducts = cart.items.filter(item => !item || !item.product);
    if (removedProducts.length > 0) {
      console.log('🛒 CartPage: Найдены удаленные товары в корзине:', removedProducts);
      // Удаляем каждый удаленный товар из корзины
      removedProducts.forEach(item => {
        if (item && item.product && onRemoveFromCart) {
          onRemoveFromCart(item.product.id);
        }
      });
    }
  }, [cart?.items, onRemoveFromCart]);

  // Очищаем удаленные товары при загрузке
  React.useEffect(() => {
    cleanupRemovedProducts();
  }, [cleanupRemovedProducts]);

  const handleRemoveItem = async (productId) => {
    setRemovingItem(productId);
    setTimeout(() => {
      onRemoveFromCart(productId);
      setRemovingItem(null);
    }, 300);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Ваша корзина пуста');
      return;
    }
    navigate('/checkout');
  };

  const getDiscount = () => {
    if (total >= 500) return 15;
    if (total >= 300) return 10;
    if (total >= 150) return 5;
    return 0;
  };

  const discount = getDiscount();
  const finalTotal = total - (total * discount / 100);

  return (
    <Box sx={{ 
      maxWidth: 1400,
      width: '90%',
      mx: 'auto', 
      mt: 4, 
      p: 3,
      pt: { xs: 8, md: 10 },
      background: 'white',
      borderRadius: 4,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4, mt: 2.5 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(45deg, #FFB300, #FF6B6B)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            🛒 Ваша Корзина
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
            {itemCount} товар{itemCount === 1 ? '' : itemCount < 5 ? 'а' : 'ов'} на сумму {total} ₪
          </Typography>
          
          {discount > 0 && (
            <Paper sx={{ 
              p: 2, 
              mb: 3, 
              background: 'linear-gradient(45deg, #4CAF50, #81C784)',
              color: 'white',
              borderRadius: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TrophyIcon />
                <Typography variant="h6">
                  Скидка {discount}%! Экономия {Math.round(total * discount / 100)} ₪
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 3,
            border: '2px dashed #FFB300'
          }}>
            <CartIcon sx={{ fontSize: 80, color: '#FFB300', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#666', mb: 2 }}>
              Ваша корзина пуста
            </Typography>
            <Typography variant="body1" sx={{ color: '#888' }}>
              Добавьте товары из каталога, чтобы начать покупки!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/catalog')}
              sx={{ 
                mt: 2,
                backgroundColor: '#4ECDC4', 
                '&:hover': { backgroundColor: '#45b7aa' } 
              }}
            >
              Перейти к покупкам
            </Button>
          </Box>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          <Grid gridColumn="span 12" xl="span 8">
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, color: '#FF6B6B', fontWeight: 'bold' }}>
                🛒 Товары в корзине ({items.length})
              </Typography>
              <AnimatePresence>
                {items.map((item, index) => {
                  // Дополнительная защита от null/undefined product
                  if (!item || !item.product) {
                    console.warn('🛒 CartPage: Пропускаем товар с null/undefined product:', item);
                    return null;
                  }
                  
                  return (
                    <motion.div
                      key={`${item.product.id}-${item.id}`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      style={{ marginBottom: 16 }}
                    >
                    <Card 
                      sx={{ 
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: removingItem === item.product.id ? '2px solid #f44336' : '2px solid #E0E0E0',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
                        transform: removingItem === item.product.id ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        width: { xs: '100%', md: 600 },
                        '&:hover': {
                          boxShadow: '0 8px 30px rgba(255, 179, 0, 0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, minWidth: 0 }}>
                            <Box sx={{ 
                              width: 120, 
                              height: 120, 
                              borderRadius: 2,
                              border: '2px solid #f0f0f0',
                              flexShrink: 0,
                              backgroundImage: `url(${item.product.imageUrls?.[0] || '/toys.png'})`,
                              backgroundSize: '100% 100%',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, wordBreak: 'break-word' }}>
                                {typeof item.product.name === 'string' ? item.product.name : String(item.product.name || '')}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', mb: 1, wordBreak: 'break-word' }}>
                                {item.product.description?.substring(0, 100)}...
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                {item.product.category && (
                                  <Chip 
                                    label={item.product.category} 
                                    size="small" 
                                    sx={{ background: '#E3F2FD' }}
                                  />
                                )}
                                {item.product.ageGroup && (
                                  <>
                                    {ageIcons[item.product.ageGroup] && (
                                      <img 
                                        src={ageIcons[item.product.ageGroup]} 
                                        alt={item.product.ageGroup}
                                        style={{ 
                                          width: 28, 
                                          height: 28, 
                                          marginRight: 4, 
                                          marginBottom: 4,
                                          verticalAlign: 'middle',
                                          background: 'transparent',
                                          border: 'none',
                                          outline: 'none'
                                        }} 
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4, marginRight: 6 }}>
                                      {item.product.ageGroup}
                                    </span>
                                  </>
                                )}
                                {item.product.gender && (
                                  <span style={{
                                    display: 'inline-block',
                                    fontSize: '0.8rem',
                                    color: '#666',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginBottom: '4px',
                                    background: '#f0f0f0'
                                  }}>
                                    {item.product.gender === 'Мальчик' ? 'Для мальчиков' : item.product.gender === 'Девочка' ? 'Для девочек' : 'Универсальный'}
                                  </span>
                                )}
                              </Box>
                              <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 700 }}>
                                {item.product.price} ₪
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: 2,
                            minWidth: 120,
                            flexShrink: 0
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <button
                                style={{
                                  border: '1px solid #ddd',
                                  background: '#fff',
                                  fontSize: 18,
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  color: '#888',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0
                                }}
                                onClick={() => onChangeCartQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              >
                                -
                              </button>
                              <span style={{ 
                                minWidth: 22, 
                                textAlign: 'center', 
                                fontWeight: 600, 
                                fontSize: 16, 
                                display: 'inline-block' 
                              }}>
                                {item.quantity}
                              </span>
                              <button
                                style={{
                                  border: '1px solid #ddd',
                                  background: '#fff',
                                  fontSize: 18,
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  color: '#888',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0
                                }}
                                onClick={() => onChangeCartQuantity(item.product.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                              {(item.product.price * item.quantity).toFixed(2)} ₪
                            </Typography>
                            <Tooltip title="Удалить из корзины">
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveItem(item.product.id)}
                                sx={{ 
                                  background: '#FFEBEE',
                                  '&:hover': { background: '#FFCDD2' }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
                })}
              </AnimatePresence>
            </Paper>
          </Grid>
          
          <Grid gridColumn="span 12" xl="span 4">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '2px solid #E0E0E0'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                  Ваш заказ
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Товары ({itemCount}):</Typography>
                    <Typography>{total.toFixed(2)} ₪</Typography>
                  </Box>
                  
                  {discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: '#4CAF50' }}>
                        Скидка {discount}%:
                      </Typography>
                      <Typography sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        -{Math.round(total * discount / 100)} ₪
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      К оплате:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF6B6B' }}>
                      {finalTotal.toFixed(2)} ₪
                    </Typography>
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  sx={{ 
                    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                    borderRadius: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                      boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <PaymentIcon sx={{ mr: 1 }} />
                  Оформить заказ
                </Button>
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default CartPage; 