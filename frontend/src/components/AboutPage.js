import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Star, 
  Security, 
  Toys, 
  LocalOffer,
  EmojiEvents,
  Favorite
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  const advantages = [
    {
      icon: <LocalOffer sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: t('about.advantages.prices.title'),
      description: t('about.advantages.prices.description'),
      color: '#4CAF50'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: t('about.advantages.safety.title'),
      description: t('about.advantages.safety.description'),
      color: '#2196F3'
    },
    {
      icon: <Toys sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: t('about.advantages.variety.title'),
      description: t('about.advantages.variety.description'),
      color: '#FF9800'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 0, md: 0 }, 
      mt: { xs: 0, md: -1 }, 
      minHeight: '80vh' 
    }}>
      {/* Логотип */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: { xs: 0, md: 1 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img 
          src="/lion-logo.png..png" 
          alt="Симба - Король игрушек" 
          style={{
            width: 'auto',
            height: '29px',
            maxWidth: '100%',
            filter: 'drop-shadow(0 4px 8px rgba(255, 102, 0, 0.3))',
            marginBottom: '10px'
          }}
        />
      </Box>

      {/* Главный заголовок */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 4 } }}>
        <Typography 
          variant="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 2, md: 3 },
            fontWeight: 800, 
            color: '#ff6600',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            fontSize: { xs: '2rem', md: '3.5rem' },
            textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('about.title')}
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            color: '#666', 
            mb: { xs: 2, md: 3 },
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.subtitle')}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center',
            color: '#888', 
            maxWidth: 800, 
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.intro')}
        </Typography>
      </Box>

      {/* Приветственный блок */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: 4,
        p: { xs: 3, md: 6 },
        mb: { xs: 4, md: 8 },
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3,
            fontWeight: 700,
            color: '#333',
            fontSize: { xs: '1.3rem', md: '1.8rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.welcome.title')}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: { xs: '1rem', md: '1.1rem' },
            lineHeight: 1.8,
            color: '#555',
            maxWidth: 900,
            mx: 'auto',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.welcome.description')}
        </Typography>
      </Box>

      {/* История Михаэля */}
      <Box sx={{ mb: { xs: 4, md: 8 } }}>
        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center',
            mb: { xs: 3, md: 5 },
            fontWeight: 700,
            color: '#333',
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.story.title')}
        </Typography>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            {/* Фото магазина */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img 
                src="/shop-photo.webp" 
                alt="Магазин Симба - Король игрушек" 
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  borderRadius: '16px',
                  boxShadow: '0 6px 24px rgba(255, 102, 0, 0.2)',
                  marginBottom: '24px',
                  border: '3px solid rgba(255, 102, 0, 0.1)'
                }}
              />
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.8,
                color: '#555',
                fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
              }}
            >
              {t('about.story.part1')}
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.8,
                color: '#555',
                mt: 2,
                fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
              }}
            >
              {t('about.story.part2')}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Наши преимущества */}
      <Box sx={{ mb: { xs: 4, md: 8 } }}>
        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center',
            mb: { xs: 3, md: 5 },
            fontWeight: 700,
            color: '#333',
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.advantages.title')}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'stretch'
        }}>
          {advantages.map((advantage, index) => (
            <Box key={index} sx={{ 
              flex: { xs: 'none', md: 1 },
              width: { xs: '100%', md: 'auto' }
            }}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ 
                  p: { xs: 3, md: 4 },
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ mb: 3 }}>
                    {advantage.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 700,
                      color: advantage.color,
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
                    }}
                  >
                    {advantage.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      lineHeight: 1.6,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
                    }}
                  >
                    {advantage.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Призыв к действию */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
        borderRadius: 4,
        p: { xs: 4, md: 6 },
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 8px 32px rgba(255, 102, 0, 0.3)'
      }}>
        <EmojiEvents sx={{ fontSize: 60, mb: 2 }} />
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.cta.title')}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            opacity: 0.9,
            fontSize: { xs: '1rem', md: '1.2rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('about.cta.description')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Favorite />} 
            label={t('about.cta.quality')} 
            sx={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontSize: '1rem'
            }} 
          />
          <Chip 
            icon={<Star />} 
            label={t('about.cta.fairPrices')} 
            sx={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontSize: '1rem'
            }} 
          />
          <Chip 
            icon={<Security />} 
            label={t('about.cta.guaranteedSafety')} 
            sx={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontSize: '1rem'
            }} 
          />
        </Box>
      </Box>
    </Container>
  );
} 