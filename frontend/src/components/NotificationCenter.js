import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ShoppingCart as OrderIcon,
  RateReview as ReviewIcon,
  Warning as LowStockIcon,
  Person as UserIcon,
  Close as CloseIcon,
  CheckCircle as ReadIcon,
  DoneAll as ReadAllIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import ReviewModal from './ReviewModal';

const NotificationCenter = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState(null);

  const fetchNotifications = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    setError('');
    try {
      const endpoint = user.role === 'admin' 
        ? `${API_BASE_URL}/api/admin/notifications`
        : `${API_BASE_URL}/api/profile/notifications`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    if (!user?.token) return;
    
    try {
      const endpoint = user.role === 'admin'
        ? `${API_BASE_URL}/api/admin/notifications/unread-count`
        : `${API_BASE_URL}/api/profile/notifications/unread-count`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!user?.token) return;
    
    try {
      const endpoint = user.role === 'admin'
        ? `${API_BASE_URL}/api/admin/notifications/${notificationId}/read`
        : `${API_BASE_URL}/api/profile/notifications/${notificationId}/read`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.token) return;
    
    try {
      const endpoint = user.role === 'admin'
        ? `${API_BASE_URL}/api/admin/notifications/read-all`
        : `${API_BASE_URL}/api/profile/notifications/read-all`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Обновляем каждые 30 секунд
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <OrderIcon color="primary" />;
      case 'review':
        return <ReviewIcon color="secondary" />;
      case 'low_stock':
        return <LowStockIcon color="warning" />;
      case 'user_registration':
        return <UserIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#1976d2';
      case 'review':
        return '#9c27b0';
      case 'low_stock':
        return '#ed6c02';
      case 'user_registration':
        return '#0288d1';
      default:
        return '#666';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <>
      <Tooltip title="Уведомления">
        <IconButton 
          color="inherit" 
          onClick={() => setDrawerOpen(true)}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={unreadCount} color="error" invisible={!unreadCount}>
            <NotificationsIcon sx={{ color: 'white' }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 400, maxWidth: '90vw' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            🔔 Уведомления
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<ReadAllIcon />}
                onClick={markAllAsRead}
                sx={{ mr: 1 }}
              >
                Прочитать все
              </Button>
            )}
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography color="textSecondary">
                Нет уведомлений
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <Paper 
                  key={notification.id} 
                  sx={{ 
                    mb: 2, 
                    p: 2,
                    backgroundColor: notification.isRead ? '#fafafa' : '#fff',
                    border: notification.isRead ? '1px solid #e0e0e0' : '2px solid #1976d2',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 2,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: notification.isRead ? '#666' : getNotificationColor(notification.type)
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Chip 
                            label="Новое" 
                            size="small" 
                            color="primary" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 1,
                          color: notification.isRead ? '#666' : '#333',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {notification.message}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon sx={{ fontSize: 16, color: '#999' }} />
                          <Typography variant="caption" color="textSecondary">
                            {formatTime(notification.createdAt)}
                          </Typography>
                        </Box>
                        
                        {!notification.isRead && (
                          <Button
                            size="small"
                            startIcon={<ReadIcon />}
                            onClick={() => markAsRead(notification.id)}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                          >
                            Прочитано
                          </Button>
                        )}
                        {notification.type === 'review_request' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => { 
                              console.log('Opening review modal for orderId:', notification.orderId);
                              setReviewOrderId(notification.orderId); 
                              setReviewModalOpen(true); 
                            }}
                            sx={{ ml: 1 }}
                          >
                            Оставить отзыв
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
      {/* Модальное окно отзывов */}
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        orderId={reviewOrderId}
        user={user}
      />
    </>
  );
};

export default NotificationCenter; 