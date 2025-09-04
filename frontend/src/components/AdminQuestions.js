import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Container,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Check as CheckIcon, QuestionAnswer as QuestionAnswerIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const STATUS_LABELS = {
  pending: 'Ожидает ответа',
  published: 'Опубликован',
  rejected: 'Отклонен'
};

const STATUS_COLORS = {
  pending: 'warning',
  published: 'success',
  rejected: 'error'
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('pending');
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchQuestions();
  }, [filterStatus]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('AdminQuestions: Загружаем вопросы для модерации...');
      const url = filterStatus 
        ? `${API_BASE_URL}/api/admin/questions?status=${filterStatus}`
        : `${API_BASE_URL}/api/admin/questions`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('AdminQuestions: Статус ответа:', res.status);
      const data = await res.json();
      console.log('AdminQuestions: Полученные вопросы:', data);
      if (res.ok) {
        setQuestions(Array.isArray(data) ? data : []);
        console.log(`AdminQuestions: Загружено ${data.length} вопросов`);
        const pendingCount = data.filter(q => q.status === 'pending').length;
        console.log(`AdminQuestions: Вопросов на модерации: ${pendingCount}`);
      } else {
        console.error('AdminQuestions: Ошибка API:', data.error);
        setError(data.error || 'Ошибка загрузки вопросов');
      }
    } catch (e) {
      console.error('AdminQuestions: Ошибка загрузки вопросов:', e);
      setError('Ошибка загрузки вопросов');
    }
    setLoading(false);
  };

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    setAnswer(question.answer || '');
    setStatus(question.status || 'pending');
    setAnswerDialogOpen(true);
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Ответ обязателен');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      console.log('AdminQuestions: Отправляем ответ для вопроса:', selectedQuestion.id);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/questions/${selectedQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          answer: answer.trim(),
          status
        })
      });

      console.log('AdminQuestions: Статус ответа:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AdminQuestions: Ошибка ответа:', errorData);
        throw new Error(errorData.error || `Ошибка отправки ответа (${response.status})`);
      }

      const updatedQuestion = await response.json();
      console.log('AdminQuestions: Обновленный вопрос:', updatedQuestion);
      
      setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
      setAnswerDialogOpen(false);
      setSelectedQuestion(null);
      setAnswer('');
      setStatus('pending');
    } catch (err) {
      console.error('AdminQuestions: Ошибка отправки ответа:', err);
      setError(err.message || 'Ошибка отправки ответа');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setAnswerDialogOpen(false);
    setSelectedQuestion(null);
    setAnswer('');
    setStatus('pending');
    setError('');
  };

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'published': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  };

  // Получение текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает ответа';
      case 'published': return 'Опубликован';
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
        <Button onClick={fetchQuestions} variant="contained">Повторить</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 8, md: 10 } }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, minHeight: 'calc(100vh - 200px)' }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <QuestionAnswerIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Модерация вопросов и ответов
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Управление вопросами клиентов о товарах
            </Typography>
          </Box>
        </Box>
        
        {/* Статистика */}
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Статистика вопросов
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {questions.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Всего вопросов
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {questions.filter(q => q.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  На модерации
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {questions.filter(q => q.status === 'published').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Опубликовано
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {questions.filter(q => q.status === 'rejected').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Отклонено
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="default" sx={{ fontWeight: 'bold' }}>
                  {questions.filter(q => q.answer && q.status === 'published').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  С ответами
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={fetchQuestions}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
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
              '&:hover': {
                background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: '#ccc',
                boxShadow: 'none',
                transform: 'none'
              }
            }}
          >
            Обновить вопросы
          </Button>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Фильтр по статусу</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Фильтр по статусу"
            >
              <MenuItem value="">Все вопросы ({questions.length})</MenuItem>
              <MenuItem value="pending">Ожидают ответа</MenuItem>
              <MenuItem value="published">Опубликованные</MenuItem>
              <MenuItem value="rejected">Отклоненные</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {questions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              {filterStatus ? 'Нет вопросов с выбранным статусом' : 'Вопросов пока нет'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map(question => (
              <Card key={question.id} sx={{ 
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {question.product?.name || 'Товар не найден'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Вопрос от: {question.user?.name || 'Пользователь'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Статус вопроса */}
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1, 
                        backgroundColor: getStatusColor(question.status) + '20',
                        color: getStatusColor(question.status),
                        fontSize: '0.875rem',
                        fontWeight: 'medium'
                      }}>
                        {getStatusText(question.status)}
                      </Box>
                      {/* Картинка товара */}
                      {question.product?.imageUrls?.[0] && (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            backgroundImage: `url(${question.product.imageUrls[0].startsWith('http') ? question.product.imageUrls[0] : `${API_BASE_URL}${question.product.imageUrls[0]}`})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid #e0e0e0',
                            ml: 1
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {question.question}
                  </Typography>
                  {question.answer && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 1 }}>
                        Ответ:
                      </Typography>
                      <Typography variant="body2">
                        {question.answer}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(question.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {question.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAnswerQuestion(question)}
                            sx={{
                              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                              color: '#fff',
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize: 13,
                              px: 2,
                              py: 0.8,
                              height: 36,
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
                            Ответить
                          </Button>
                        </>
                      )}
                      {question.answer && question.status !== 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAnswerQuestion(question)}
                          sx={{
                            background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                            color: '#fff',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 13,
                            px: 2,
                            py: 0.8,
                            height: 36,
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                            textTransform: 'none',
                            minWidth: 100,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                          }}
                        >
                          Редактировать
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Диалог ответа на вопрос */}
        <Dialog open={answerDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedQuestion?.answer ? 'Редактировать ответ' : 'Ответить на вопрос'}
            {selectedQuestion && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Товар: {selectedQuestion.product?.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {selectedQuestion && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  Вопрос от {selectedQuestion.user?.name || 'Пользователя'}
                  {selectedQuestion.user?.email && ` (${selectedQuestion.user.email})`}:
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography>{selectedQuestion.question}</Typography>
                </Paper>
              </Box>
            )}
            
            <TextField
              label="Ваш ответ"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              sx={{ mb: 2 }}
              required
              placeholder="Введите ваш ответ на вопрос..."
            />

            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Статус"
              >
                <MenuItem value="pending">Ожидает ответа</MenuItem>
                <MenuItem value="published">Опубликовать (показывать на сайте)</MenuItem>
                <MenuItem value="rejected">Отклонить (скрыть с сайта)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog} 
              disabled={submitting}
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmitAnswer}
              variant="contained"
              disabled={submitting || !answer.trim()}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
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
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {submitting ? 'Отправка...' : (selectedQuestion?.answer ? 'Обновить ответ' : 'Отправить ответ')}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
} 