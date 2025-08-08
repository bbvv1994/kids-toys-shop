import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import { getCategoryClassName } from './ProductList';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
  const { t } = useTranslation();
  
  // Функция для перевода подкатегорий
  const translateSubcategory = (parentCategory, subcategoryName) => {
    const categoryMap = {
      'Игрушки': 'toys',
      'Конструкторы': 'constructors', 
      'Пазлы': 'puzzles',
      'Творчество': 'creativity',
      'Канцтовары': 'stationery',
      'Транспорт': 'transport',
      'Отдых на воде': 'water_recreation',
      'Настольные игры': 'board_games',
      'Развивающие игры': 'educational_games',
      'Акции': 'sales'
    };
    
    const subcategoryMap = {
      // Игрушки
      'Игрушки для самых маленьких': 'for_babies',
      'Куклы': 'dolls',
      'Оружие игрушечное': 'toy_weapons',
      'Треки, паркинги и жд': 'tracks_parking_railway',
      'Мягкие игрушки': 'soft_toys',
      'Игрушки - антистресс и сквиши': 'antistress_squishy',
      'Активные игры': 'active_games',
      'Тематические игровые наборы': 'thematic_sets',
      'Декоративная косметика и украшения': 'decorative_cosmetics',
      'Машинки и другой транспорт': 'cars_transport',
      'Роботы и трансформеры': 'robots_transformers',
      'Игровые фигурки': 'game_figures',
      'Игрушки для песочницы': 'sandbox_toys',
      'Шарики': 'balls',
      'Игрушки на радиоуправлении': 'radio_controlled',
      // Конструкторы
      'Lego для мальчиков': 'lego_boys',
      'Lego для девочек': 'lego_girls',
      'Металлические конструкторы': 'metal_constructors',
      'Lego крупные блоки': 'lego_large_blocks',
      // Другие категории могут быть добавлены по аналогии
    };
    
    const parentKey = categoryMap[parentCategory];
    const subcategoryKey = subcategoryMap[subcategoryName];
    
    if (parentKey && subcategoryKey) {
      return t(`categories.subcategories.${parentKey}.${subcategoryKey}`, subcategoryName);
    }
    
    return subcategoryName;
  };
  
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
          {t('category.selectCategory')}
        </Typography>
        <Typography variant="body2">
          {t('category.selectCategoryDescription')}
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
            {t('category.subcategoriesCount', { count: category.sub.length })}
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
                        {translateSubcategory(category.name, subCategory)}
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
          {t('category.noSubcategories')}
        </Typography>
      )}
    </Box>
  );
}

export default CategoryDetails; 