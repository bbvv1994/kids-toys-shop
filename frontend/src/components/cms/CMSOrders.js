import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  CloudUpload,
  Star,
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore,
  ShoppingCart,
  Person,
  Email,
  Phone,
  LocationOn,
  Payment,
  LocalShipping,
  CheckCircle,
  Cancel,
  Pending,
  Refresh,
  Info
} from '@mui/icons-material';
import { API_BASE_URL, getImageUrl } from '../../config';
import Lenis from '@studio-freight/lenis';

function CMSOrders() {
    const { t } = useTranslation();
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [orderDetailsOpen, setOrderDetailsOpen] = React.useState(false);
    const orderDetailsContentRef = React.useRef(null);
    const orderDetailsLenisRef = React.useRef(null);
  
    // Загрузка заказов
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
      setLoading(false);
    };
  
    React.useEffect(() => {
      fetchOrders();
    }, []);
  
    // Блокировка прокрутки фона при открытии диалога
    React.useEffect(() => {
      if (orderDetailsOpen) {
        // Блокируем прокрутку body
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        // Добавляем обработчик для предотвращения прокрутки фона
        const preventScroll = (e) => {
          if (orderDetailsContentRef.current?.contains(e.target)) {
            return; // Разрешаем прокрутку внутри модального окна
          }
          
          e.preventDefault();
          e.stopPropagation();
        };
        
        document.addEventListener('wheel', preventScroll, { passive: false });
        document.addEventListener('touchmove', preventScroll, { passive: false });
        
        return () => {
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
          document.removeEventListener('wheel', preventScroll);
          document.removeEventListener('touchmove', preventScroll);
        };
      } else {
        // Восстанавливаем прокрутку
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
      
      return () => {
        // Очистка при размонтировании
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }, [orderDetailsOpen]);
  
    // Инициализация Lenis для диалога деталей заказа
    React.useEffect(() => {
      if (orderDetailsOpen) {
        // Добавляем небольшую задержку для гарантии готовности DOM
        const initLenis = () => {
          if (orderDetailsContentRef.current) {
            // Уничтожаем предыдущий экземпляр Lenis
            if (orderDetailsLenisRef.current) {
              orderDetailsLenisRef.current.destroy();
              orderDetailsLenisRef.current = null;
            }
  
            // Инициализируем новый экземпляр Lenis для прокрутки внутри диалога
            orderDetailsLenisRef.current = new Lenis({
              wrapper: orderDetailsContentRef.current,
              duration: 1.2,
              smooth: true,
              easing: (t) => 1 - Math.pow(1 - t, 3),
              syncTouch: true,
              wheelMultiplier: 1,
              touchMultiplier: 2,
              infinite: false,
              orientation: 'vertical',
              gestureOrientation: 'vertical',
              smoothWheel: true,
              wheelMultiplier: 0.8,
            });
  
            // Функция для анимации кадров
            function raf(time) {
              orderDetailsLenisRef.current?.raf(time);
              if (orderDetailsOpen) requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
  
          } else {
            // Если элемент еще не готов, пробуем еще раз через 100мс
            setTimeout(initLenis, 100);
          }
        };
  
        initLenis();
      } else {
        // Уничтожаем Lenis при закрытии диалога
        if (orderDetailsLenisRef.current) {
          orderDetailsLenisRef.current.destroy();
          orderDetailsLenisRef.current = null;
        }
      }
  
      // Очистка при размонтировании
      return () => {
        if (orderDetailsLenisRef.current) {
          orderDetailsLenisRef.current.destroy();
          orderDetailsLenisRef.current = null;
        }
      };
    }, [orderDetailsOpen]);
  
    // Фильтрация заказов
    const filteredOrders = orders.filter(order => {
      const matchesSearch = !searchQuery || 
        order.id.toString().includes(searchQuery) ||
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  
    // Обновление статуса заказа
    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}` 
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          fetchOrders(); // Перезагружаем заказы
          
          // Немедленно обновляем счетчик уведомлений
          setTimeout(() => {
            // Вызываем функцию обновления счетчика уведомлений из Navigation
            const event = new CustomEvent('updateNotificationsCount');
            window.dispatchEvent(event);
          }, 1000); // Небольшая задержка для создания уведомления
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    };
  
    // Удаление заказа
    const deleteOrder = async (orderId) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}` 
          }
        });
        
        if (response.ok) {
          fetchOrders(); // Перезагружаем заказы
        } else {
          console.error('Error deleting order:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    };
  
    // Получение цвета статуса
    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return '#ff9800';
        case 'confirmed': return '#2196f3';
        case 'ready': return '#9c27b0';
        case 'pickedup': return '#4caf50';
        case 'cancelled': return '#f44336';
        default: return '#666';
      }
    };
  
    // Получение градиента статуса
    const getStatusGradient = (status) => {
      switch (status) {
        case 'pending': return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
        case 'confirmed': return 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)';
        case 'ready': return 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)';
        case 'pickedup': return 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
        case 'cancelled': return 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)';
        default: return 'linear-gradient(135deg, #666 0%, #999 100%)';
      }
    };
  
    // Получение текста статуса
    const getStatusText = (status) => {
      switch (status) {
        case 'pending': return 'Ожидает подтверждения';
        case 'confirmed': return 'Подтвержден';
        case 'ready': return 'Готов к выдаче';
        case 'pickedup': return 'Получен';
        case 'cancelled': return 'Отменен';
        default: return status;
      }
    };
  
    // Форматирование даты
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('ru-RU');
    };
  
    // Форматирование цены
    const formatPrice = (price) => {
      return `₪${price}`;
    };
  
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }
  
    return (
      <Box sx={{ mt: 0, minHeight: 400, py: 4, px: { xs: 0, md: 0 } }}>
        <Box sx={{
          background: '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          p: { xs: 2, md: 4 },
          maxWidth: 1100,
          minWidth: 1100,
          minHeight: 320,
          margin: '0 auto',
          mt: 0,
        }}>
          {/* Красивая шапка */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <LocalShipping color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 1 }}>
                Управление заказами
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Просмотр и управление заказами клиентов
              </Typography>
            </Box>
          </Box>
  
          {/* Статистика заказов */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e9ecef' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#495057' }}>
              Статистика заказов
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                  {orders.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Всего заказов
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {orders.filter(order => order.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ожидают подтверждения
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                  {orders.filter(order => order.status === 'confirmed').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Подтверждены
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {orders.filter(order => order.status === 'pickedup').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Получены
                </Typography>
              </Box>
            </Box>
          </Box>
  
          {/* Разделитель */}
          <Box sx={{ mb: 4, height: 1, background: 'linear-gradient(90deg, transparent, #e0e0e0, transparent)' }} />
        
        {/* Поиск и фильтры */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по номеру заказа, email или имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Статус"
            >
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value="pending">Ожидает подтверждения</MenuItem>
              <MenuItem value="confirmed">Подтвержден</MenuItem>
              <MenuItem value="ready">Готов к выдаче</MenuItem>
              <MenuItem value="pickedup">Получен</MenuItem>
              <MenuItem value="cancelled">Отменен</MenuItem>
            </Select>
          </FormControl>
        </Box>
  
        {/* Список заказов */}
        <Box sx={{ background: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>№ Заказа</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Клиент</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Дата</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Сумма</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Статус</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 12 }}>#{order.id}</td>
                    <td style={{ padding: 12 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {order.user?.name || 'Не указано'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {order.user?.email || 'Не указано'}
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: 12 }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: 12 }}>
                      {formatPrice(order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}
                    </td>
                    <td style={{ padding: 12 }}>
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1, 
                        backgroundColor: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status),
                        fontSize: '0.875rem',
                        fontWeight: 'medium'
                      }}>
                        {getStatusText(order.status)}
                      </Box>
                    </td>
                    <td style={{ padding: 12 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDetailsOpen(true);
                          }}
                          sx={{
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#e3f2fd'
                            }
                          }}
                          title="Детали заказа"
                        >
                          <Info />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteOrder(order.id)}
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: '#ffebee'
                            }
                          }}
                          title="Удалить заказ"
                        >
                          <Delete />
                        </IconButton>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            sx={{ fontSize: '0.875rem' }}
                          >
                            <MenuItem value="pending">Ожидает подтверждения</MenuItem>
                            <MenuItem value="confirmed">Подтвержден</MenuItem>
                            <MenuItem value="ready">Готов к выдаче</MenuItem>
                            <MenuItem value="pickedup">Получен</MenuItem>
                            <MenuItem value="cancelled">Отменен</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
  
        {/* Диалог с деталями заказа */}
        <Dialog
          open={orderDetailsOpen}
          onClose={() => setOrderDetailsOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            zIndex: '99999 !important',
            '& .MuiDialog-paper': {
              zIndex: '99999 !important'
            },
            '& .MuiBackdrop-root': {
              zIndex: '99998 !important'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            borderRadius: 0,
            mb: 0
          }}>
            📋 Заказ #{selectedOrder?.id} - Детальная информация
          </DialogTitle>
          <DialogContent 
            ref={orderDetailsContentRef}
            onWheel={(e) => {
              // Разрешаем прокрутку только внутри DialogContent
              e.stopPropagation();
            }}
            sx={{ 
              p: 3,
              overflowY: 'auto',
              overflowX: 'hidden',
              height: '70vh',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}
            dividers
          >
            {selectedOrder && (
              <Box sx={{ mt: 1 }}>
                {/* Информация о заказе */}
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: 2,
                  border: '1px solid #dee2e6'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: '#1976d2',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📅 Информация о заказе
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Дата заказа:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Статус заказа:</Typography>
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1, 
                        backgroundColor: getStatusColor(selectedOrder.status) + '20',
                        color: getStatusColor(selectedOrder.status),
                        fontSize: '0.875rem',
                        fontWeight: 'medium'
                      }}>
                        {getStatusText(selectedOrder.status)}
                      </Box>
                    </Box>
                  </Box>
                </Box>
  
                {/* Информация о клиенте */}
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderRadius: 2,
                  border: '1px solid #90caf9'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: '#1565c0',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    👤 Информация о клиенте
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Имя клиента:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedOrder.user?.name || 'Не указано'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Email:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {selectedOrder.user?.email || 'Не указано'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Телефон:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedOrder.user?.phone || 'Не указано'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Адрес доставки:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedOrder.user?.address || 'Не указано'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
  
                {/* Товары в заказе */}
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  borderRadius: 2,
                  border: '1px solid #ce93d8'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    color: '#7b1fa2',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    🛍️ Товары в заказе ({selectedOrder.items?.length || 0} шт.)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedOrder.items?.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        gap: 2,
                        p: 2, 
                        background: 'rgba(255,255,255,0.7)', 
                        borderRadius: 2,
                        border: '1px solid #e1bee7',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.9)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }
                      }}>
                        {/* Картинка товара */}
                        <Box sx={{ 
                          width: 80, 
                          height: 80, 
                          flexShrink: 0,
                          borderRadius: 2,
                          border: '2px solid #e1bee7',
                          backgroundImage: item.product?.imageUrls && item.product.imageUrls.length > 0 
                            ? `url(${getImageUrl(item.product.imageUrls[0])})`
                            : 'url(/photography.jpg)',
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }} />
                        
                        {/* Информация о товаре */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 600,
                              color: '#333',
                              mb: 0.5,
                              fontSize: '0.95rem'
                            }}>
                              {item.product?.name || 'Товар не найден'}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#666',
                              mb: 0.5,
                              fontSize: '0.8rem'
                            }}>
                              {t('productCard.sku')}: {item.product?.article || '—'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Chip 
                                label={`Количество: ${item.quantity}`}
                                size="small"
                                sx={{ 
                                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                                Цена за шт.: {formatPrice(item.price)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Общая стоимость */}
                        <Box sx={{ 
                          textAlign: 'right', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center',
                          minWidth: 100
                        }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#1976d2',
                            fontSize: '1.1rem'
                          }}>
                            {formatPrice(item.price * item.quantity)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
  
                {/* Итоговая информация */}
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                  borderRadius: 2,
                  border: '1px solid #a5d6a7'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: '#2e7d32',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    💰 Итоговая информация
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: 2,
                    border: '1px solid #a5d6a7'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      Общая сумма заказа:
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      color: '#1976d2',
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {formatPrice(selectedOrder.total)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOrderDetailsOpen(false)}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                cursor: 'pointer',
              }}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
      </Box>
    );
  }

export default CMSOrders;