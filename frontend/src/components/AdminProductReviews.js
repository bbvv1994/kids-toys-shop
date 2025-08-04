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
import { Star, ShoppingBag, ThumbUp, ThumbDown, CheckCircle, Cancel, Visibility, VisibilityOff, Delete } from '@mui/icons-material';

const AdminProductReviews = () => {
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

      const response = await fetch(`${API_BASE_URL}/api/reviews/product`, {
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

      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/product/${reviewId}`, {
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
      
      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/product/${reviewId}`, {
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

      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/product/${reviewId}`, {
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
      case 'pending': return 'warning';
      case 'published': return 'success';
      case 'rejected': return 'error';
      case 'hidden': return 'default';
      default: return 'default';
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
    <Box sx={{ p: 4, width: 1250, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <ShoppingBag color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Модерация отзывов о товарах
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Управление отзывами клиентов о товарах
            </Typography>
          </Box>
        </Box>

        {/* Статистика */}
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Статистика отзывов о товарах
          </Typography>
          <Grid container spacing={2}>
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
          <Box sx={{ textAlign: 'center', py: 6, minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              Нет отзывов о товарах для модерации
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
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Товар: {review.product?.name || 'Неизвестный товар'}
                      </Typography>
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
                          color: review.status === 'hidden' ? '#999' : 'inherit'
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
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                    {/* Статус над кнопками */}
                    <Chip 
                      label={getStatusText(review.status)}
                      color={getStatusColor(review.status)}
                      icon={getStatusIcon(review.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    {/* Кнопки действий */}
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', mt: 1 }}>
                      {review.status === 'pending' && (
                        <>
                          <Button 
                            size="small" 
                            onClick={() => handleModerate(review.id, 'published')} 
                            sx={{
                              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: 12,
                              minWidth: 0,
                              height: 28,
                              borderRadius: 6,
                              px: 2,
                              lineHeight: '28px',
                              whiteSpace: 'nowrap',
                              textTransform: 'none',
                              boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                                boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                              },
                              cursor: 'pointer',
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
                              fontWeight: 600,
                              fontSize: 12,
                              minWidth: 0,
                              height: 28,
                              borderRadius: 6,
                              px: 2,
                              lineHeight: '28px',
                              whiteSpace: 'nowrap',
                              textTransform: 'none',
                              boxShadow: '0 2px 4px rgba(244, 67, 54, 0.2)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                                boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                              },
                              cursor: 'pointer',
                            }}
                            title="Отклонить"
                          >
                            Отклонить
                          </Button>
                        </>
                      )}
                      
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
          Модерация отзыва о товаре
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Автор:</strong> {selectedReview.user?.name || 'Анонимный пользователь'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Товар:</strong> {selectedReview.product?.name || 'Неизвестный товар'}
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
                <strong>Товар:</strong> {reviewToDelete.product?.name || 'Неизвестный товар'}
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

export default AdminProductReviews; 