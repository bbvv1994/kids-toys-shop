import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { Star, Store, ThumbUp, ThumbDown, CheckCircle, Cancel, Visibility, VisibilityOff, Delete } from '@mui/icons-material';

const AdminShopReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/reviews/shop`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        setError('Ошибка загрузки отзывов');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, status) => {
    setModerating(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/shop/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Обновляем список отзывов
        await loadReviews();
        setModerationDialog(false);
        setSelectedReview(null);
      } else {
        const errorData = await response.json();
        console.error('Moderation error:', errorData);
        setError(errorData.error || 'Ошибка модерации отзыва');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setModerating(false);
    }
  };



  const handleToggleVisibility = async (reviewId, isHidden) => {
    setModerating(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const requestBody = { status: isHidden ? 'hidden' : 'published' };
      console.log('Sending toggle visibility request:', { reviewId, isHidden, requestBody });
      
      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/shop/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await loadReviews();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка изменения видимости отзыва');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setModerating(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setModerating(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/shop/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadReviews();
        setDeleteDialog(false);
        setReviewToDelete(null);
      } else {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        setError(errorData.error || 'Ошибка удаления отзыва');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setModerating(false);
    }
  };

  const openDeleteDialog = (review) => {
    setReviewToDelete(review);
    setDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(false);
    setReviewToDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'published': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'hidden': return '#666';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'На модерации';
      case 'published': return 'Опубликован';
      case 'rejected': return 'Отклонен';
      case 'hidden': return 'Скрыт';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <CircularProgress size={16} />;
      case 'published': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'hidden': return <VisibilityOff />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, width: 1250, mx: 'auto', mt: 4, minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, minHeight: 'calc(100vh - 200px)' }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Store color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Модерация отзывов о магазине
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Управление отзывами клиентов о магазине
            </Typography>
          </Box>
        </Box>

        {/* Статистика */}
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Статистика отзывов
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {reviews.filter(r => r.status !== 'archived').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Всего отзывов
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {reviews.filter(r => r.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  На модерации
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {reviews.filter(r => r.status === 'published').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Опубликовано
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {reviews.filter(r => r.status === 'rejected').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Отклонено
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="default" sx={{ fontWeight: 'bold' }}>
                  {reviews.filter(r => r.status === 'hidden').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Скрыто
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {reviews.filter(r => r.status !== 'archived').length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              Нет отзывов для модерации
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Все отзывы обработаны
            </Typography>
          </Box>
        ) : (
          <List>
            {reviews.filter(r => r.status !== 'archived').map((review) => (
              <ListItem 
                key={review.id}
                sx={{ 
                  mb: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2,
                  backgroundColor: review.status === 'hidden' ? '#f5f5f5' : 'white',
                  borderColor: review.status === 'hidden' ? '#ccc' : '#e0e0e0',
                  opacity: review.status === 'hidden' ? 0.6 : 1
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ 
                        color: review.status === 'hidden' ? '#999' : 'inherit'
                      }}>
                        {review.user?.name || 'Анонимный пользователь'}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ maxWidth: 'calc(100% - 150px)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={review.rating}
                          readOnly
                          icon={<Star fontSize="inherit" sx={{ color: '#FFD700' }} />}
                          emptyIcon={<Star fontSize="inherit" sx={{ color: '#ccc' }} />}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ 
                          color: review.status === 'hidden' ? '#999' : 'inherit'
                        }}>
                          {review.rating}/5
                        </Typography>
                      </Box>
                      {review.text && (
                        <Typography variant="body1" sx={{ 
                          mb: 1, 
                          lineHeight: 1.6,
                          color: review.status === 'hidden' ? '#999' : 'inherit',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}>
                          "{review.text}"
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ 
                        color: review.status === 'hidden' ? '#bbb' : 'textSecondary'
                      }}>
                        {formatDate(review.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', height: '100%', justifyContent: 'space-between' }}>
                    {/* Статус вверху справа */}
                    <Box sx={{ 
                      display: 'inline-block', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 1, 
                      backgroundColor: getStatusColor(review.status) + '20',
                      color: getStatusColor(review.status),
                      fontSize: '0.875rem',
                      fontWeight: 'medium'
                    }}>
                      {getStatusText(review.status)}
                    </Box>
                    
                    {/* Кнопки модерации в середине справа */}
                    {review.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleModerate(review.id, 'published')} 
                          sx={{
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: '#fff',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 13,
                            px: 2,
                            py: 0.8,
                            height: 32,
                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                            textTransform: 'none',
                            minWidth: 80,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                          }}
                          title="Одобрить"
                        >
                          Одобрить
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => handleModerate(review.id, 'rejected')}
                          sx={{
                            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                            color: '#fff',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 13,
                            px: 2,
                            py: 0.8,
                            height: 32,
                            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                            textTransform: 'none',
                            minWidth: 80,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                          }}
                          title="Отклонить"
                        >
                          Отклонить
                        </Button>
                      </Box>
                    )}
                    
                    {/* Кнопки действий внизу справа */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                      {/* Кнопка Скрыть/Показать над кнопкой удаления */}
                      {review.status === 'published' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleVisibility(review.id, true)}
                          sx={{ 
                            color: '#ff9800',
                            '&:hover': {
                              backgroundColor: '#fff3e0'
                            }
                          }}
                          title="Скрыть"
                        >
                          <VisibilityOff />
                        </IconButton>
                      )}
                      
                      {review.status === 'hidden' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleVisibility(review.id, false)}
                          sx={{ 
                            color: '#4caf50',
                            '&:hover': {
                              backgroundColor: '#e8f5e8'
                            }
                          }}
                          title="Показать"
                        >
                          <Visibility />
                        </IconButton>
                      )}
                      
                      {/* Кнопка удаления в правом нижнем углу */}
                      <IconButton 
                        size="small" 
                        onClick={() => openDeleteDialog(review)}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: '#ffebee'
                          }
                        }}
                        title="Удалить"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Диалог модерации */}
      <Dialog open={moderationDialog} onClose={() => setModerationDialog(false)}>
        <DialogTitle>
          Модерация отзыва
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Автор:</strong> {selectedReview.user?.name || 'Анонимный пользователь'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Оценка:</strong> {selectedReview.rating}/5
              </Typography>
              {selectedReview.text && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Текст:</strong> "{selectedReview.text}"
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                <strong>Дата:</strong> {formatDate(selectedReview.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setModerationDialog(false)}
            disabled={moderating}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleModerate(selectedReview.id, 'published')}
            disabled={moderating}
            startIcon={<ThumbUp />}
          >
            {moderating ? 'Одобрение...' : 'Одобрить'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleModerate(selectedReview.id, 'rejected')}
            disabled={moderating}
            startIcon={<ThumbDown />}
          >
            {moderating ? 'Отклонение...' : 'Отклонить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          {reviewToDelete && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Вы действительно хотите удалить отзыв от <strong>{reviewToDelete.user?.name || 'Анонимного пользователя'}</strong>?
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Оценка:</strong> {reviewToDelete.rating}/5
              </Typography>
              {reviewToDelete.text && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Текст:</strong> "{reviewToDelete.text}"
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                <strong>Дата:</strong> {formatDate(reviewToDelete.createdAt)}
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                Это действие нельзя отменить. Отзыв будет удален навсегда.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeDeleteDialog}
            disabled={moderating}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(reviewToDelete?.id)}
            disabled={moderating}
            startIcon={<Delete />}
          >
            {moderating ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminShopReviews; 