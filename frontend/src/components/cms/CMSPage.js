import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  List,
  ListItem
} from '@mui/material';
import { 
  Add as AddIcon,
  List as ListIcon,
  Category as CategoryIcon,
  ShoppingCart as OrdersIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown
} from '@mui/icons-material';
import CMSProducts from './CMSProducts';
import CMSCategories from './CMSCategories';
import CMSOrders from './CMSOrders';
import { API_BASE_URL } from '../../config';

function CMSPage({ loadCategoriesFromAPI, editModalOpen, setEditModalOpen, editingProduct, setEditingProduct, dbCategories }) {
    const [section, setSection] = React.useState('products');
    const [productsSubsection, setProductsSubsection] = React.useState('list'); // 'add' | 'list'
    const [productsMenuOpen, setProductsMenuOpen] = React.useState(false);
    const [reviewsSubsection, setReviewsSubsection] = React.useState('shop'); // 'shop' | 'product' | 'questions'
    const [reviewsMenuOpen, setReviewsMenuOpen] = React.useState(false);
    const sections = [
      { key: 'products', label: 'Товары' },
      { key: 'categories', label: 'Категории' },
      { key: 'orders', label: 'Заказы' },
      { key: 'users', label: 'Пользователи' },
      { key: 'reviews', label: 'Отзывы и вопросы' },
    ];
  
    // Сброс состояния подменю товаров при переключении на другие разделы
    React.useEffect(() => {
      if (section !== 'products') {
        setProductsMenuOpen(false);
        setProductsSubsection('list');
      }
      if (section !== 'reviews') {
        setReviewsMenuOpen(false);
        setReviewsSubsection('shop');
      }
    }, [section]);
  
    // Функция для создания красивого заголовка
    const createHeader = (title) => (
      <Typography variant="h5" sx={{ 
        fontWeight: 800, 
        mb: 3, 
        color: '#ff6600',
        fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        fontSize: '2.2rem',
        textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
        letterSpacing: '0.5px',
        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {title}
      </Typography>
    );
  
      return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f7f7f7', pt: 'calc(var(--appbar-height) - 92px)', boxSizing: 'border-box' }}>
        <Box sx={{ width: 220, background: '#fff', borderRight: '1px solid #eee', p: 0 }}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', color: '#1976d2' }}>CMS</Typography>
          <List>
            {/* Товары с выпадающим меню */}
            <ListItem onClick={() => {
              setSection('products');
              setProductsMenuOpen(o => !o);
            }} selected={section === 'products'} sx={{ cursor: 'pointer' }}>
              <ListItemText primary="Товары" />
              <KeyboardArrowDown
                sx={{
                  transition: 'transform 0.2s',
                  transform: productsMenuOpen && section === 'products' ? 'rotate(0deg)' : 'rotate(-90deg)',
                  color: productsMenuOpen && section === 'products' ? '#1976d2' : '#888',
                  ml: 1
                }}
              />
            </ListItem>
            {section === 'products' && productsMenuOpen && (
                            <Box sx={{ pl: 3 }}>
                  <List dense>
                  <ListItem selected={productsSubsection === 'add'} onClick={() => { 
                    setSection('products'); 
                    setProductsSubsection('add'); 
                    setProductsMenuOpen(true);
                  }} sx={{ cursor: 'pointer' }}>
                    <ListItemText primary="Добавить товар" />
                  </ListItem>
                    <ListItem selected={productsSubsection === 'list'} onClick={() => { 
                      setSection('products'); 
                      setProductsSubsection('list'); 
                      setProductsMenuOpen(true);
                    }} sx={{ cursor: 'pointer' }}>
                      <ListItemText primary="Список товаров" />
                    </ListItem>
                    <ListItem selected={productsSubsection === 'import'} onClick={() => { 
                      setSection('products'); 
                      setProductsSubsection('import'); 
                      setProductsMenuOpen(true);
                    }} sx={{ cursor: 'pointer' }}>
                      <ListItemText primary="Массовый импорт" />
                    </ListItem>
                </List>
              </Box>
            )}
            {/* Отзывы с выпадающим меню */}
            <ListItem onClick={() => {
              setSection('reviews');
              setReviewsMenuOpen(o => !o);
            }} selected={section === 'reviews'} sx={{ cursor: 'pointer' }}>
              <ListItemText primary="Отзывы и вопросы" />
              <KeyboardArrowDown
                sx={{
                  transition: 'transform 0.2s',
                  transform: reviewsMenuOpen && section === 'reviews' ? 'rotate(0deg)' : 'rotate(-90deg)',
                  color: reviewsMenuOpen && section === 'reviews' ? '#1976d2' : '#888',
                  ml: 1
                }}
              />
            </ListItem>
            {section === 'reviews' && reviewsMenuOpen && (
              <Box sx={{ pl: 3 }}>
                <List dense>
                  <ListItem selected={reviewsSubsection === 'shop'} onClick={() => { 
                                setSection('reviews'); 
              setReviewsSubsection('shop');
              setReviewsMenuOpen(true); 
                    setReviewsMenuOpen(true);
                  }} sx={{ cursor: 'pointer' }}>
                    <ListItemText primary="Отзывы о магазине" />
                  </ListItem>
                  <ListItem selected={reviewsSubsection === 'product'} onClick={() => { 
                    setSection('reviews'); 
                    setReviewsSubsection('product'); 
                    setReviewsMenuOpen(true);
                  }} sx={{ cursor: 'pointer' }}>
                    <ListItemText primary="Отзывы о товарах" />
                  </ListItem>
                  <ListItem selected={reviewsSubsection === 'questions'} onClick={() => { 
                    setSection('reviews'); 
                    setReviewsSubsection('questions'); 
                    setReviewsMenuOpen(true);
                  }} sx={{ cursor: 'pointer' }}>
                    <ListItemText primary="Вопросы и ответы" />
                  </ListItem>
                </List>
              </Box>
            )}
            {/* Остальные разделы */}
            {sections.filter(s => s.key !== 'products' && s.key !== 'reviews').map(s => (
              <ListItem key={s.key} selected={section===s.key} onClick={()=>{
                setSection(s.key); 
                setProductsMenuOpen(false);
                setProductsSubsection('list'); // Сбрасываем подраздел товаров
              }} sx={{ cursor: 'pointer' }}>
                <ListItemText primary={s.label} />
              </ListItem>
            ))}
          </List>
        </Box>
        {/* Убираем фиксированную высоту и overflow у правой части */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, p: 0 }}>
          {section === 'products' ? (
            productsSubsection === 'import' ? (
              <div>BulkImportProducts - компонент будет добавлен позже</div>
            ) : (
              <CMSProducts 
            mode={productsSubsection} 
            editModalOpen={editModalOpen}
            setEditModalOpen={setEditModalOpen}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            dbCategories={dbCategories}
              />
            )
          ) :
           section === 'categories' ? <CMSCategories loadCategoriesFromAPI={loadCategoriesFromAPI} /> :
           section === 'orders' ? <CMSOrders /> :
           section === 'users' ? <div>AdminUsers - компонент будет добавлен позже</div> :
           section === 'reviews' ? (
             reviewsSubsection === 'shop' ? <div>AdminShopReviews - компонент будет добавлен позже</div> :
             reviewsSubsection === 'product' ? <div>AdminProductReviews - компонент будет добавлен позже</div> :
             reviewsSubsection === 'questions' ? <div>AdminQuestions - компонент будет добавлен позже</div> :
             <div>AdminShopReviews - компонент будет добавлен позже</div>
           ) : (
            <Box sx={{ p: 4 }}>
              {createHeader(sections.find(s=>s.key===section)?.label)}
              <Typography sx={{ color: '#888' }}>Здесь будет управление: {sections.find(s=>s.key===section)?.label}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
  // Вынесем форму и таблицу в отдельные компоненты внутри CMSProducts
  
  
  // Глобальная функция getCategoryIcon
  const getCategoryIcon = (category) => {
    console.log('🎨 getCategoryIcon called with:', {
      category: category,
      name: category?.name,
      image: category?.image,
      icon: category?.icon,
      hasImage: !!category?.image,
      hasIcon: !!category?.icon,
      isUploadedImage: category?.image && /^175\d+/.test(category.image),
      timestamp: new Date().toISOString()
    });
    
    if (!category) {
      console.log('🎨 No category, returning default');
      return `${API_BASE_URL}/public/toys.png`;
    }
    
    // Если есть готовый путь к иконке (из handleEditSubmit), используем его
    if (category.icon) {
      console.log('🎨 Using pre-built icon path:', category.icon);
      return category.icon;
    }
    
    // Если есть загруженное изображение, используем его
    if (category.image && /^175\d+/.test(category.image)) {
      const url = `${API_BASE_URL}/uploads/${category.image}?t=${Date.now()}`;
      console.log('🎨 Using uploaded image:', url);
      return url;
    }
    
    // Если есть изображение, но это не загруженный файл, используем его
    if (category.image) {
      const url = `${API_BASE_URL}/public/${category.image}`;
      console.log('🎨 Using public image:', url);
      return url;
    }
    
    // Fallback иконки для разных категорий
    const fallbackIcons = {
      'Игрушки': '/toys.png',
      'Конструкторы': '/constructor.png',
      'Пазлы': '/puzzle.png',
      'Творчество': '/creativity.png',
      'Канцтовары': '/stationery.png',
      'Транспорт': '/bicycle.png',
      'Отдых на воде': '/voda.png',
      'Настольные игры': '/nastolka.png',
      'Развивающие игры': '/edu_game.png',
      'Акции': '/sale.png'
    };
    
    const fallbackIcon = fallbackIcons[category.name] || '/toys.png';
    const finalUrl = `${API_BASE_URL}/public${fallbackIcon}`;
    console.log('🎨 Using fallback icon:', finalUrl);
    return finalUrl;
  };

export default CMSPage;