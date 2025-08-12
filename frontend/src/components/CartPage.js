import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
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
import { useTranslation } from 'react-i18next';

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
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [removingItem, setRemovingItem] = useState(null);
  const { t } = useTranslation();
  
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
        maxWidth: { xs: '100%', md: 1400 },
        width: { xs: '95%', md: '90%' },
        mx: 'auto', 
        mt: { xs: 2, md: 4 }, 
        p: { xs: 1, md: 3 },
        pt: { xs: 6, md: 10 },
        background: 'white',
        borderRadius: { xs: 2, md: 4 },
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <Typography variant={isMobile ? "h5" : "h3"} sx={{ textAlign: 'center', color: '#666' }}>
          {t('cart.loadingCart')}
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
          borderRadius: { xs: 2, md: 3 },
          border: removingItem === item.product.id ? '2px solid #f44336' : '2px solid #E0E0E0',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
          transform: removingItem === item.product.id ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease',
          width: '100%',
          maxWidth: { xs: '100%', md: 600 },
          '&:hover': {
            transform: removingItem === item.product.id ? 'scale(0.95)' : 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'flex-start' }, 
            gap: { xs: 1.5, sm: 2 } 
          }}>
            {/* Основная информация о товаре */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', sm: 'row' },
              flexGrow: 1, 
              gap: { xs: 1.5, sm: 2 }, 
              minWidth: 0,
              alignItems: { xs: 'flex-start', sm: 'flex-start' }
            }}>
              {/* Изображение товара */}
              <Box sx={{ 
                width: { xs: 70, sm: 80, md: 120 }, 
                height: { xs: 70, sm: 80, md: 120 }, 
                borderRadius: { xs: 1.5, md: 2 },
                border: '2px solid #f0f0f0',
                flexShrink: 0,
                backgroundImage: `url(${getImageUrl(item.product.imageUrls?.[0] || '/toys.png')})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }} />
              
              {/* Информация о товаре */}
              <Box sx={{ 
                minWidth: 0, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: { xs: 70, sm: 80, md: 'auto' }
              }}>
                                 <Box>
                   <Typography 
                     variant={isSmallMobile ? "body2" : isMobile ? "body1" : "h6"} 
                     sx={{ 
                       fontWeight: 600, 
                       mb: { xs: 0.5, md: 1 }, 
                       wordBreak: 'break-word',
                       lineHeight: { xs: 1.2, md: 1.4 },
                       fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                     }}
                   >
                     {typeof item.product.name === 'string' ? item.product.name : String(item.product.name || '')}
                   </Typography>
                   
                   {!isSmallMobile && (
                     <Typography 
                       variant="body2" 
                       sx={{ 
                         color: '#666', 
                         mb: { xs: 0.5, md: 1 }, 
                         wordBreak: 'break-word',
                         fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                         display: { xs: 'none', sm: 'block' }
                       }}
                     >
                       {item.product.description?.substring(0, isMobile ? 60 : 100)}...
                     </Typography>
                   )}
                   
                   {/* Возрастная группа и пол */}
                   <Box sx={{ 
                     display: 'flex', 
                     gap: { xs: 0.5, md: 1 }, 
                     mb: { xs: 0.5, md: 1 }, 
                     flexWrap: 'wrap', 
                     alignItems: 'center' 
                   }}>
                     {item.product.ageGroup && (
                       <>
                         {(() => {
                           const ageGroupStr = typeof item.product.ageGroup === 'object' ? (item.product.ageGroup.name || '') : String(item.product.ageGroup || '');
                           return ageIcons[ageGroupStr] && (
                             <img 
                               src={ageIcons[ageGroupStr]} 
                               alt={ageGroupStr}
                               style={{ 
                                 width: isSmallMobile ? 16 : isMobile ? 20 : 28, 
                                 height: isSmallMobile ? 16 : isMobile ? 20 : 28, 
                                 marginRight: 6, 
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
                       </>
                     )}
                     {item.product.gender && (
                       <span style={{ 
                         fontSize: isSmallMobile ? '0.65rem' : isMobile ? '0.7rem' : '0.8rem', 
                         color: '#666', 
                         marginBottom: 4,
                         padding: '2px 6px',
                         background: '#f0f0f0',
                         borderRadius: '4px'
                       }}>
                         {(() => {
                           const genderValue = typeof item.product.gender === 'object' ? (item.product.gender.name || '') : String(item.product.gender || '');
                           if (genderValue === 'Для мальчиков' || genderValue === 'Мальчик' || genderValue === 'мальчик') {
                             return t('productCard.gender.boy');
                           } else if (genderValue === 'Для девочек' || genderValue === 'Девочка' || genderValue === 'девочка') {
                             return t('productCard.gender.girl');
                           } else if (genderValue === 'Универсальный' || genderValue === 'универсальный') {
                             return t('productCard.gender.unisex');
                           }
                           return genderValue;
                         })()}
                       </span>
                     )}
                   </Box>
                 </Box>
              </Box>
            </Box>
            
            {/* Управление количеством и удаление */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column' },
              alignItems: { xs: 'center', sm: 'flex-end' },
              gap: { xs: 1, sm: 1.5, md: 2 },
              minWidth: { xs: 'auto', sm: isMobile ? 80 : 120 },
              flexShrink: 0,
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              {/* Управление количеством */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, md: 1 },
                order: { xs: 1, sm: 1 }
              }}>
                <button
                  style={{
                    border: '1px solid #ddd',
                    background: '#fff',
                    fontSize: isSmallMobile ? 14 : isMobile ? 16 : 18,
                    width: isSmallMobile ? 20 : isMobile ? 24 : 28,
                    height: isSmallMobile ? 20 : isMobile ? 24 : 28,
                    borderRadius: 4,
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
                  minWidth: isSmallMobile ? 16 : isMobile ? 18 : 22, 
                  textAlign: 'center', 
                  fontWeight: 600, 
                  fontSize: isSmallMobile ? 12 : isMobile ? 14 : 16, 
                  display: 'inline-block' 
                }}>
                  {item.quantity}
                </span>
                <button
                  style={{
                    border: '1px solid #ddd',
                    background: '#fff',
                    fontSize: isSmallMobile ? 14 : isMobile ? 16 : 18,
                    width: isSmallMobile ? 20 : isMobile ? 24 : 28,
                    height: isSmallMobile ? 20 : isMobile ? 24 : 28,
                    borderRadius: 4,
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
              
              {/* Общая стоимость товара */}
              <Typography 
                variant={isSmallMobile ? "body2" : isMobile ? "body1" : "h6"} 
                sx={{ 
                  fontWeight: 700, 
                  color: '#4CAF50',
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  order: { xs: 2, sm: 2 }
                }}
              >
                {(item.product.price * item.quantity).toFixed(2)} ₪
              </Typography>
              
              {/* Кнопка удаления */}
              <Tooltip title={t('cart.removeFromCart')}>
                <IconButton
                  onClick={() => handleRemoveItem(item.product.id)}
                  sx={{ 
                    color: '#f44336',
                    size: isSmallMobile ? 'small' : 'medium',
                    padding: { xs: 0.5, sm: 1 },
                    order: { xs: 3, sm: 3 },
                    '&:hover': {
                      backgroundColor: '#ffebee'
                    }
                  }}
                >
                  <Delete sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }} />
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
      maxWidth: { xs: '100%', md: 1400 },
      width: { xs: '95%', md: '90%' },
      mx: 'auto', 
      mt: { xs: 2, md: 16 }, 
      p: { xs: 1, md: 2 },
      pt: { xs: 2, md: 6 },
      pb: { xs: 1, md: 2 },
      background: 'white',
      borderRadius: { xs: 2, md: 4 },
      border: '1px solid #e0e0e0'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 4 }, mt: { xs: 1.5, md: 2.5 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: { xs: 1, md: 2 }, 
            mb: { xs: 0.5, md: 1 } 
          }}>
            <img 
              src="/pocket.png" 
              alt="cart" 
              style={{ 
                width: isSmallMobile ? 30 : isMobile ? 35 : 40, 
                height: isSmallMobile ? 30 : isMobile ? 35 : 40, 
                display: 'block', 
                filter: 'brightness(0)', 
                objectFit: 'contain'
              }} 
            />
            <Typography 
              variant={isSmallMobile ? "h5" : isMobile ? "h4" : "h3"}
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #FFB300, #FF6B6B)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
              }}
            >
              {t('cart.yourCart')}
            </Typography>
          </Box>
          
          {discount > 0 && (
            <Paper sx={{ 
              p: { xs: 1.5, md: 2 }, 
              mb: { xs: 2, md: 3 }, 
              background: 'linear-gradient(45deg, #4CAF50, #81C784)',
              color: 'white',
              borderRadius: { xs: 2, md: 3 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TrophyIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
                <Typography variant={isMobile ? "body1" : "h6"}>
                  {t('cart.discountMessage', { percent: discount, saved: Math.round(total * discount / 100) })}
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
            py: { xs: 4, md: 8 },
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: { xs: 2, md: 3 },
            border: '2px dashed #FFB300'
          }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: '#666', mb: { xs: 1, md: 2 } }}>
              {t('cart.empty')}
            </Typography>
            <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: '#888' }}>
              {t('cart.emptyMessage')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/catalog')}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: { xs: 14, md: 15 },
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.5 },
                height: { xs: 40, md: 44 },
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                minWidth: { xs: 100, md: 120 },
                mt: { xs: 1.5, md: 2 },
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
            >
              {t('cart.goToShopping')}
            </Button>
          </Box>
        </motion.div>
      ) : (
        <Paper sx={{ p: { xs: 2, md: 3 }, boxShadow: 'none' }}>
                     <Typography 
             variant={isMobile ? "h6" : "h5"} 
             sx={{ 
               mb: { xs: 2, md: 3 }, 
               color: '#FF6B6B', 
               fontWeight: 'bold',
               fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
               textAlign: t('cart.itemsInCart').includes('מוצרים') ? 'right' : 'left'
             }}
           >
             {t('cart.itemsInCart')}
           </Typography>
      
          {/* Карточки товаров */}
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
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
                  style={{ marginBottom: isMobile ? 12 : 16 }}
                >
                  {renderCartItem(item)}
                </motion.div>
              );
            })}
          </Box>

          {/* Сводка заказа */}
          <Box sx={{ 
            p: { xs: 2, md: 3 }, 
            borderRadius: { xs: 2, md: 3 },
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '2px solid #E0E0E0',
            mt: { xs: 2, md: 3 }
          }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontWeight: 700, 
                mb: { xs: 2, md: 3 }, 
                textAlign: 'center',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
              }}
            >
              {t('cart.yourOrder')}
            </Typography>
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 {t('cart.itemsCount', { count: itemCount }).includes('מוצרים') ? (
                   // Иврит: цена слева, "מוצרים: ({{count}})" справа
                   <>
                     <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                       {total.toFixed(2)} ₪
                     </Typography>
                     <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                       {t('cart.itemsCount', { count: itemCount })}
                     </Typography>
                   </>
                 ) : (
                   // Русский язык: "Товары ({{count}}):" слева, цена справа
                   <>
                     <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                       {t('cart.itemsCount', { count: itemCount })}
                     </Typography>
                     <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                       {total.toFixed(2)} ₪
                     </Typography>
                   </>
                 )}
               </Box>
              {discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#4CAF50', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    {t('cart.discount', { percent: discount })}
                  </Typography>
                  <Typography sx={{ color: '#4CAF50', fontWeight: 700, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    -{Math.round(total * discount / 100)} ₪
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: { xs: 1.5, md: 2 } }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 1.5, md: 2 } }}>
                 {t('cart.toPay').includes('К оплате') ? (
                   // Русский язык: "К оплате" слева, цена справа
                   <>
                     <Typography 
                       variant={isMobile ? "body1" : "h6"} 
                       sx={{ 
                         fontWeight: 700, 
                         fontSize: { xs: '1rem', md: '1.25rem' }
                       }}
                     >
                       {t('cart.toPay')}
                     </Typography>
                     <Typography 
                       variant={isMobile ? "h6" : "h5"} 
                       sx={{ 
                         fontWeight: 800, 
                         color: '#FF6B6B',
                         fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                       }}
                     >
                       {finalTotal.toFixed(2)} ₪
                     </Typography>
                   </>
                                   ) : (
                    // Иврит: цена слева, "К оплате" справа
                    <>
                                             <Typography 
                         variant={isMobile ? "h6" : "h5"} 
                         sx={{ 
                           fontWeight: 800, 
                           color: '#FF6B6B',
                           fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                         }}
                       >
                         {finalTotal.toFixed(2)} ₪
                       </Typography>
                       <Typography 
                         variant={isMobile ? "body1" : "h6"} 
                         sx={{ 
                           fontWeight: 700, 
                           fontSize: { xs: '1rem', md: '1.25rem' }
                         }}
                       >
                         {t('cart.toPay')}
                       </Typography>
                    </>
                  )}
               </Box>
            </Box>
            <Button 
              variant="contained" 
              fullWidth
              size={isMobile ? "medium" : "large"}
              onClick={handleCheckout}
              sx={{ 
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                borderRadius: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.5 },
                fontSize: { xs: '1rem', md: '1.1rem' },
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
              <PaymentIcon sx={{ mr: 1, fontSize: { xs: '1.1rem', md: '1.25rem' } }} />
              {t('cart.checkout')}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default CartPage; 