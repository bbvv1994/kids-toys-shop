import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import { getCategoryClassName } from './ProductList';

// Маппинг: подкатегория -> реальное имя файла в public
const subcategoryImageMap = {
  'Куклы': 'Kukly_11zon.webp',
  'Игрушки для самых маленьких': 'Igrushki-dlya-samyh-malenkih_11zon.webp',
  'Игрушки - антистресс и сквиши': 'antistress.webp',
  'Треки, паркинги и жд': 'treki11.webp',
  'Мягкие игрушки': 'Myagkie-igrushki_11zon.webp',
  'Тематические игровые наборы': 'Tematicheskie.webp',
  'Декоративная косметика и украшения': 'Dekorativnaya-kosmetika-i-ukrasheniya_11zon.webp',
  'Машинки и другой транспорт': 'Mashinki.webp',
  'Игровые фигурки': 'figurki.webp',
  'Игрушки для песочницы': 'pesochnicy.webp',
  'Оружие игрушечное': 'Oruzhie.webp',
  'Роботы и трансформеры': 'Roboty.webp',
  'Шарики': 'shariki.webp',
  'Активные игры': 'Aktivnye-igry_11zon.webp',
  'Игрушки на радиоуправлении': 'Igrushki-na-radioupravlenii_11zon.webp',
};

function getSubcategoryImageFileName(subCategory) {
  // Всегда используем только маппинг, если нет — возвращаем заглушку
  return subcategoryImageMap[subCategory] || 'toys.png';
}

function CategoryDetails({ category }) {
  if (!category) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        color: '#7f8c8d'
      }}>
        <CategoryIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Выберите категорию
        </Typography>
        <Typography variant="body2">
          Выберите категорию из списка слева для просмотра подробной информации
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
        {category.label}
      </Typography>
      {category.icon && (
        <Box sx={{ mb: 2 }}>
          <img
            src={category.icon}
            alt={category.label}
            style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8 }}
          />
        </Box>
      )}
      {category.sub && category.sub.length > 0 ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#34495e' }}>
            Подкатегории ({category.sub.length}):
          </Typography>
          <Grid container spacing={3} sx={{
            pl: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
            '@media (min-width: 1200px)': {
              pl: 9, // Отступ слева для больших экранов
            },
          }}>
            {category.sub.map((subCategory, index) => {
              const fileName = getSubcategoryImageFileName(subCategory);
              const src = `/${fileName}`;
              console.log('[SUBCAT TILE]', { subCategory, fileName, src });
              return (
                <Grid gridColumn="span 12" sm="span 6" md="span 4" key={index}>
                  <Card sx={{
                    borderRadius: 2,
                    background: 'rgba(103, 126, 234, 0.05)',
                    border: '1px solid rgba(103, 126, 234, 0.1)',
                    '&:hover': {
                      background: 'rgba(103, 126, 234, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <img
                        src={src}
                        alt={subCategory}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                        onError={e => {
                          console.error('[SUBCAT TILE][onError]', { subCategory, fileName, triedSrc: e.target.src });
                          if (e.target.src !== window.location.origin + '/toys.png') e.target.src = '/toys.png';
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {subCategory}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          В этой категории нет подкатегорий
        </Typography>
      )}
    </Box>
  );
}

export default CategoryDetails; 