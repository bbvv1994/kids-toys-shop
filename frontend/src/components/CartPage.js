import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
  Chip,
  Divider,
  Paper,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Delete,
  Payment as PaymentIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [removingItem, setRemovingItem] = useState(null);
  
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

  // Рендеринг элемента корзины
  const renderCartItem = (item) => {
    return (
      <Card 
        sx={{ 
          borderRadius: 3,
          border: removingItem === item.product.id ? '2px solid #f44336' : '2px solid #E0E0E0',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
          transform: removingItem === item.product.id ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease',
          width: { xs: '100%', md: 600 },
          '&:hover': {
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, minWidth: 0 }}>
              <Box sx={{ 
                width: { xs: 80, md: 120 }, 
                height: { xs: 80, md: 120 }, 
                borderRadius: 2,
                border: '2px solid #f0f0f0',
                flexShrink: 0,
                backgroundImage: `url(${getImageUrl(item.product.imageUrls?.[0] || '/toys.png')})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, mb: 1, wordBreak: 'break-word' }}>
                  {typeof item.product.name === 'string' ? item.product.name : String(item.product.name || '')}
                </Typography>
                {!isMobile && (
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, wordBreak: 'break-word' }}>
                    {item.product.description?.substring(0, 100)}...
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {item.product.category && (
                    <Chip 
                      label={typeof item.product.category === 'object' ? (item.product.category.name || '') : String(item.product.category || '')} 
                      size="small" 
                      sx={{ background: '#E3F2FD' }}
                    />
                  )}
                  {item.product.ageGroup && (
                    <>
                      {(() => {
                        const ageGroupStr = typeof item.product.ageGroup === 'object' ? (item.product.ageGroup.name || '') : String(item.product.ageGroup || '');
                        return ageIcons[ageGroupStr] && (
                          <img 
                            src={ageIcons[ageGroupStr]} 
                            alt={ageGroupStr}
                            style={{ 
                              width: isMobile ? 20 : 28, 
                              height: isMobile ? 20 : 28, 
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
                        );
                      })()}
                      <span style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#666', marginBottom: 4, marginRight: 6 }}>
                        {typeof item.product.ageGroup === 'object' ? (item.product.ageGroup.name || '') : String(item.product.ageGroup || '')}
                      </span>
                    </>
                  )}
                </Box>
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: '#FF6B6B', fontWeight: 700 }}>
                  {item.product.price} ₪
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2,
              minWidth: isMobile ? 80 : 120,
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <button
                  style={{
                    border: '1px solid #ddd',
                    background: '#fff',
                    fontSize: isMobile ? 16 : 18,
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
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
                  minWidth: isMobile ? 18 : 22, 
                  textAlign: 'center', 
                  fontWeight: 600, 
                  fontSize: isMobile ? 14 : 16, 
                  display: 'inline-block' 
                }}>
                  {item.quantity}
                </span>
                <button
                  style={{
                    border: '1px solid #ddd',
                    background: '#fff',
                    fontSize: isMobile ? 16 : 18,
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
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
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 700, color: '#4CAF50' }}>
                {(item.product.price * item.quantity).toFixed(2)} ₪
              </Typography>
              <Tooltip title="Удалить из корзины">
                <IconButton
                  onClick={() => handleRemoveItem(item.product.id)}
                  sx={{ 
                    color: '#f44336',
                    size: isMobile ? 'small' : 'medium',
                    '&:hover': {
                      backgroundColor: '#ffebee'
                    }
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };



  return (
    <Box sx={{ 
      maxWidth: 1400,
      width: '90%',
      mx: 'auto', 
      mt: { xs: 8, md: 16 }, 
      p: 2,
      pt: { xs: 2, md: 6 },
      pb: 2,
      background: 'white',
      borderRadius: 4,
      border: '1px solid #e0e0e0'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4, mt: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
            <img 
              src="/pocket.png" 
              alt="cart" 
              style={{ 
                width: 40, 
                height: 40, 
                display: 'block', 
                filter: 'brightness(0)', 
                objectFit: 'contain'
              }} 
            />
            <Typography 
              variant={isMobile ? "h4" : "h3"}
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #FFB300, #FF6B6B)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Ваша Корзина
            </Typography>
          </Box>
          
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
                mt: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
            >
              Перейти к покупкам
            </Button>
          </Box>
        </motion.div>
      ) : (
            <Paper sx={{ p: 3, boxShadow: 'none' }}>
              <Typography variant="h5" sx={{ mb: 3, color: '#FF6B6B', fontWeight: 'bold' }}>
            Товары в корзине
              </Typography>
          
          {/* Карточки товаров */}
          <Box sx={{ mb: 4 }}>
                {items.map((item, index) => {
                  if (!item || !item.product) {
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
                  {renderCartItem(item)}
                  </motion.div>
                );
                })}
          </Box>

          {/* Сводка заказа */}
          <Box sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '2px solid #E0E0E0',
            mt: 3
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
                  <Typography sx={{ color: '#4CAF50' }}>Скидка {discount}%:</Typography>
                      <Typography sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        -{Math.round(total * discount / 100)} ₪
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>К оплате:</Typography>
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
                </Box>
              </Paper>
      )}


    </Box>
  );
}

export default CartPage; 