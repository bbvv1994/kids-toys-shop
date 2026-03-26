import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { API_BASE_URL } from '../config';
import { FRONTEND_URL } from '../config';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Chip, 
  Divider,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next';

export default function PublicQuestions() {
  const { i18n } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const runtimeBaseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : '';
  const siteUrl = (FRONTEND_URL || runtimeBaseUrl || 'https://simba-tzatzuim.co.il').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/questions`;
  const isHebrew = i18n.language === 'he';
  const seoTitle = isHebrew
    ? 'שאלות ותשובות | סימבה מלך הצעצועים בקריית ים ובקריות'
    : 'Вопросы и ответы | Симба - Король игрушек в Кирьят-Яме и Крайот';
  const seoDescription = isHebrew
    ? 'שאלות ותשובות על סימבה מלך הצעצועים. מידע על צעצועים ושירות בקריית ים והקריות.'
    : 'Вопросы и ответы о Симба - Король игрушек. Информация о товарах и сервисе в Кирьят-Яме и Крайот.';

  useEffect(() => {
    document.title = seoTitle;
    let canonicalEl = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      canonicalEl.setAttribute('data-manual-canonical', 'true');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);
  }, [canonicalUrl, seoTitle]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('PublicQuestions: Ошибка загрузки вопросов:', err);
      setError(err.message || 'Ошибка загрузки вопросов');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={isHebrew ? 'he_IL' : 'ru_RU'} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
        ❓ Вопросы и ответы ({questions.length})
      </Typography>

      {questions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            📝 Пока нет вопросов
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Будьте первым, кто задаст вопрос о товаре!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {questions.map((question) => (
            <Card key={question.id} sx={{ 
              boxShadow: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShoppingBagIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                      {question.product?.name || 'Товар не найден'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                      {question.user?.name || 'Пользователь'} 
                      <ScheduleIcon sx={{ fontSize: 16, color: '#666', ml: 1 }} />
                      {formatDate(question.createdAt)}
                    </Typography>
                  </Box>
                  <Chip 
                    label={question.status === 'published' ? '✅ Опубликован' : '⏳ Ожидает ответа'} 
                    color={question.status === 'published' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#333', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <HelpOutlineIcon sx={{ color: '#2196F3', fontSize: 20, mt: 0.2 }} />
                    {question.question}
                  </Typography>
                </Box>

                {question.answer && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: 2, 
                    borderLeft: '4px solid #2196F3' 
                  }}>
                    <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 500 }}>
                      💬 <strong>Ответ:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1976d2', mt: 1 }}>
                      {question.answer}
                    </Typography>
                    {question.updatedAt && question.updatedAt !== question.createdAt && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        Ответ дан: {formatDate(question.updatedAt)}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
    </>
  );
} 