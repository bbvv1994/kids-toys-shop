import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Rating,
  Container,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { getTranslatedName } from '../utils/translationUtils';

const STATUS_LABELS = {
  pending: 'На модерации',
  approved: 'Одобрен',
  rejected: 'Отклонен'
};

const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('AdminReviews: Загружаем отзывы для модерации...');
      const res = await fetch(`${API_BASE_URL}/api/admin/reviews/product`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('AdminReviews: Статус ответа:', res.status);
      const data = await res.json();
      console.log('AdminReviews: Полученные отзывы:', data);
      if (res.ok) {
        setReviews(data);
        console.log(`AdminReviews: Загружено ${data.length} отзывов`);
        const pendingCount = data.filter(r => r.status === 'pending').length;
        console.log(`AdminReviews: Отзывов на модерации: ${pendingCount}`);
      } else {
        console.error('AdminReviews: Ошибка API:', data.error);
        setError(data.error || 'Ошибка загрузки отзывов');
      }
    } catch (e) {
      console.error('AdminReviews: Ошибка загрузки отзывов:', e);
      setError('Ошибка загрузки отзывов');
    }
    setLoading(false);
  };

  const handleModerate = async (id, status) => {
    console.log(`AdminReviews: Модерируем отзыв ${id} со статусом ${status}`);
    setActionLoading(id + status);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reviews/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
      console.log('AdminReviews: Статус модерации:', res.status);
      if (res.ok) {
        console.log('AdminReviews: Модерация успешна, обновляем список');
        fetchReviews();
      } else {
        const errorData = await res.json();
        console.error('AdminReviews: Ошибка модерации:', errorData);
        alert('Ошибка модерации отзыва');
      }
    } catch (e) {
      console.error('AdminReviews: Ошибка модерации:', e);
      alert('Ошибка модерации отзыва');
    }
    setActionLoading(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'На модерации';
      case 'approved': return 'Одобрен';
      case 'rejected': return 'Отклонен';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={fetchReviews} variant="contained">Повторить</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
      <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
        Управление отзывами
      </Typography>
      
      {reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#666' }}>
            Отзывов пока нет
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reviews.map(review => (
            <Grid gridColumn="span 12" md="span 6" key={review.id}>
              <Card sx={{ 
                mb: 2, 
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {getTranslatedName(review.product)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Отзыв от: {review.user.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          sx={{ 
                            color: i < review.rating ? '#FFD700' : '#e0e0e0',
                            fontSize: 20
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {review.text}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                      {review.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleModerate(review.id, 'approved')}
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
                          >
                            Одобрить
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
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
                          >
                            Отклонить
                          </Button>
                        </>
                      )}
                      {review.status === 'approved' && (
                        <Box sx={{ 
                          display: 'inline-block', 
                          px: 2, 
                          py: 0.5, 
                          borderRadius: 1, 
                          backgroundColor: getStatusColor(review.status) + '20',
                          color: getStatusColor(review.status),
                          fontSize: '0.875rem',
                          fontWeight: 'medium',
                          mt: 1
                        }}>
                          {getStatusText(review.status)}
                        </Box>
                      )}
                      {review.status === 'rejected' && (
                        <Box sx={{ 
                          display: 'inline-block', 
                          px: 2, 
                          py: 0.5, 
                          borderRadius: 1, 
                          backgroundColor: getStatusColor(review.status) + '20',
                          color: getStatusColor(review.status),
                          fontSize: '0.875rem',
                          fontWeight: 'medium',
                          mt: 1
                        }}>
                          {getStatusText(review.status)}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 