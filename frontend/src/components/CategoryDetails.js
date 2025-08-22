import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import { getCategoryClassName } from './ProductList';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Маппинг: подкатегория -> реальное имя файла в public
const subcategoryImageMap = {
  // Игрушки
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
  
  // Конструкторы
  'Lego для мальчиков': 'podkategorii/konstruktor/legomalchiki.webp',
  'Lego для девочек': 'podkategorii/konstruktor/legdevochki.webp',
  'Металлические конструкторы': 'podkategorii/konstruktor/metalkonstruktor.webp',
  'Lego крупные блоки': 'podkategorii/konstruktor/legoblokikrupnie.webp',
  
  // Пазлы
  'Пазлы для взрослых': 'podkategorii/puzzle/pazlyvzrosliy.webp',
  'Пазлы для детей': 'podkategorii/puzzle/pazlydeti.webp',
  'Магнитные пазлы': 'podkategorii/puzzle/magnotpazzle.webp',
  'Пазлы напольные': 'podkategorii/puzzle/napolnie.webp',
  'Пазлы для малышей': 'podkategorii/puzzle/babypazzle.webp',
  
  // Творчество
  'Рисование': 'podkategorii/tvorchestvo/risovanie.webp',
  'Раскраски': 'podkategorii/tvorchestvo/raskraski.webp',
  'Наклейки': 'podkategorii/tvorchestvo/nakleyki.webp',
  'Наборы для творчества': 'podkategorii/tvorchestvo/tvorchestvanabor.webp',
  'Кинетический песок': 'podkategorii/tvorchestvo/kineticheskiypesok.webp',
  'Наборы для лепки': 'podkategorii/tvorchestvo/lepka.webp',
  'Лизуны и слаймы': 'podkategorii/tvorchestvo/lizun.webp',
  
  // Канцтовары
  'Портфели для школы': 'podkategorii/kanstovary/portfel.webp',
  'Портфели для детских садов': 'podkategorii/kanstovary/portfelisadikj.webp',
  'Пеналы': 'podkategorii/kanstovary/penaly.webp',
  'Ручки и карандаши': 'podkategorii/kanstovary/ruchkikarandashi.webp',
  'Точилки': 'podkategorii/kanstovary/tochilki.webp',
  'Фломастеры и маркеры': 'podkategorii/kanstovary/flomastery.webp',
  'Краски': 'podkategorii/kanstovary/kraski.webp',
  'Кисточки и принадлежности': 'podkategorii/kanstovary/kistochki.webp',
  'Брелки': 'podkategorii/kanstovary/brelki.webp',
  
  // Транспорт
  'Детские самокаты': 'podkategorii/transport/samokat.webp',
  'Велосипеды': 'podkategorii/transport/velosiped.webp',
  'Ходунки': 'podkategorii/transport/hodunki.webp',
  'Беговелы': 'podkategorii/transport/begovely.webp',
  
  // Отдых на воде
  'Бассейны': 'podkategorii/otdyh_na_vode/basseiny.webp',
  'Матрасы и плотики': 'podkategorii/otdyh_na_vode/matrasyiplotiki.webp',
  'Круги надувные': 'podkategorii/otdyh_na_vode/kruginaduvnie.webp',
  'Нарукавники и жилеты': 'podkategorii/otdyh_na_vode/zhilety.webp',
  'Аксессуары для плавания': 'podkategorii/otdyh_na_vode/aksesuary.webp',
  'Ракетки': 'podkategorii/otdyh_na_vode/raketki.webp',
  'Пляжные мячи и игрушки для плавания': 'podkategorii/otdyh_na_vode/miachi.webp',
  'Насосы для матрасов': 'podkategorii/otdyh_na_vode/nasosy.webp',
};

function getSubcategoryImageFileName(subCategory) {
  // Проверяем, есть ли изображение в маппинге
  const mappedImage = subcategoryImageMap[subCategory];
  
  if (mappedImage) {
    return mappedImage;
  }
  
  // Если изображения нет в маппинге, возвращаем заглушку
  return 'toys.png';
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
      
      // Пазлы
      'Пазлы для взрослых': 'for_adults',
      'Пазлы для детей': 'for_children',
      'Магнитные пазлы': 'magnetic',
      'Пазлы напольные': 'floor',
      'Пазлы для малышей': 'for_babies',
      
      // Творчество
      'Рисование': 'drawing',
      'Раскраски': 'coloring',
      'Наклейки': 'stickers',
      'Наборы для творчества': 'creativity_sets',
      'Кинетический песок': 'kinetic_sand',
      'Наборы для лепки': 'modeling_sets',
      'Лизуны и слаймы': 'slimes',
      
      // Канцтовары
      'Портфели для школы': 'school_bags',
      'Портфели для детских садов': 'kindergarten_bags',
      'Пеналы': 'pencil_cases',
      'Ручки и карандаши': 'pens_pencils',
      'Точилки': 'sharpeners',
      'Фломастеры и маркеры': 'markers',
      'Краски': 'paints',
      'Кисточки и принадлежности': 'brushes_accessories',
      'Брелки': 'keychains',
      
      // Транспорт
      'Детские самокаты': 'scooters',
      'Велосипеды': 'bicycles',
      'Ходунки': 'walkers',
      'Беговелы': 'balance_bikes',
      
      // Отдых на воде
      'Бассейны': 'pools',
      'Матрасы и плотики': 'mattresses_floats',
      'Круги надувные': 'inflatable_circles',
      'Нарукавники и жилеты': 'armbands_vests',
      'Аксессуары для плавания': 'swimming_accessories',
      'Ракетки': 'rackets',
      'Пляжные мячи и игрушки для плавания': 'beach_balls',
      'Насосы для матрасов': 'pumps'
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
    <Box sx={{ p: 3, mt: -5 }}>
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