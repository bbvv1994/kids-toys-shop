import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Switch,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload,
  DragIndicator,
  ExpandMore,
  ChevronRight,
  Category,
  Delete,
  Edit
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config';
import CustomSelect from '../CustomSelect';
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getCategoryIcon } from '../../utils/categoryIcon';

function CMSCategories({ loadCategoriesFromAPI }) {
    // Функция для получения иконки по названию категории
    const getCategoryIconForAPI = (categoryName) => {
      const iconMap = {
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
      return iconMap[categoryName] || '/toys.png';
    };
  
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [expanded, setExpanded] = React.useState([]); // id категорий с раскрытыми подкатегориями
    const [form, setForm] = React.useState({ type: 'category', parent: '', name: '', icon: null });
    const [editForm, setEditForm] = React.useState({ id: null, name: '', parent: '', icon: null });
    const [isEditing, setIsEditing] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [deleteDialog, setDeleteDialog] = React.useState({ open: false, id: null, name: '' });
    const fileInputRef = React.useRef();
    const editFileInputRef = React.useRef();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  
    // Drag & Drop сенсоры
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
  
    // Загрузка категорий с сервера (используем admin endpoint для получения полной информации)
    const fetchCategories = async () => {
      setLoading(true);
      try {
        console.log('🔄 CMSCategories: Loading categories from admin endpoint...');
        const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        console.log('🔄 CMSCategories: Categories loaded:', data.length, 'categories');
        console.log('🔄 CMSCategories: Sample category:', data[0]);
        
        // Убеждаемся, что поле active правильно обработано
        const processedData = data.map(cat => ({
          ...cat,
          active: cat.active !== null ? cat.active : true // По умолчанию true, если null
        }));
        
        console.log('🔄 CMSCategories: Processed categories with active field:', processedData[0]);
        setCategories(processedData);
      } catch (e) {
        console.error('CMSCategories fetchCategories - error:', e);
        setCategories([]);
      }
      setLoading(false);
    };
    React.useEffect(() => { fetchCategories(); }, []);
  
    // Обработчик завершения drag & drop
    const handleDragEnd = async (event) => {
      const { active, over } = event;
      
      if (active.id !== over.id) {
        const activeCategory = categories.find(cat => cat.id === active.id);
        const overCategory = categories.find(cat => cat.id === over.id);
        
        if (!activeCategory || !overCategory) return;
        
        // Проверяем, что перетаскиваемые категории находятся на одном уровне
        if (activeCategory.parentId !== overCategory.parentId) {
          return;
        }
        
        // Получаем категории того же уровня
        const sameLevelCategories = categories.filter(cat => cat.parentId === activeCategory.parentId);
        
        // Находим индексы в массиве категорий того же уровня
        const oldIndex = sameLevelCategories.findIndex(cat => cat.id === active.id);
        const newIndex = sameLevelCategories.findIndex(cat => cat.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          // Переупорядочиваем категории того же уровня
          const reorderedSameLevel = arrayMove(sameLevelCategories, oldIndex, newIndex);
          
          // Обновляем общий массив категорий
          const newCategories = categories.map(cat => {
            const reorderedCat = reorderedSameLevel.find(rc => rc.id === cat.id);
            return reorderedCat || cat;
          });
          
          // Сначала обновляем состояние локально для мгновенного отклика
          setCategories(newCategories);
          
          try {
            // Отправляем категории того же уровня в API
            const sameLevelCategoryIds = reorderedSameLevel.map(cat => cat.id);
            
            const response = await fetch(`${API_BASE_URL}/api/categories/reorder`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              },
              body: JSON.stringify({
                categoryIds: sameLevelCategoryIds
              })
            });
            
            if (response.ok) {
              // Принудительно обновляем категории с сервера
              await fetchCategories();
              // Обновляем только боковое меню, если нужно
              if (loadCategoriesFromAPI) {
                await loadCategoriesFromAPI();
              }
            } else {
              console.error('Reorder failed:', response.status);
              // В случае ошибки возвращаем исходный порядок
              fetchCategories();
            }
          } catch (error) {
            console.error('Error during reorder:', error);
            // В случае ошибки возвращаем исходный порядок
            fetchCategories();
          }
        }
      }
    };
  
    // Построить дерево категорий
    const buildTree = (cats) => {
      // Фильтруем категории без id
      const validCats = cats.filter(cat => cat && cat.id);
      
      const map = {};
      validCats.forEach(cat => { map[cat.id] = { ...cat, sub: [] }; });
      const tree = [];
      validCats.forEach(cat => {
        if (cat.parentId) {
          if (map[cat.parentId]) map[cat.parentId].sub.push(map[cat.id]);
        } else {
          tree.push(map[cat.id]);
        }
      });
      // Сортируем корневые категории по полю order
      tree.sort((a, b) => (a.order || 0) - (b.order || 0));
  
      return tree;
    };
    const tree = buildTree(categories);
  
    // Раскрытие/сворачивание
    const handleExpand = id => {
      setExpanded(exp => exp.includes(id) ? exp.filter(e => e !== id) : [...exp, id]);
    };
  
    // Отключение категории
    const handleToggleActive = async (cat) => {
      try {
        console.log('🔄 CMSCategories: Toggling category active state', {
          categoryId: cat.id,
          categoryName: cat.name,
          currentActive: cat.active,
          timestamp: new Date().toISOString()
        });
        
        const response = await fetch(`${API_BASE_URL}/api/categories/${cat.id}/toggle`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (response.ok) {
          const updatedCategory = await response.json();
          console.log('🔄 CMSCategories: Toggle response from server:', {
            categoryId: updatedCategory.id,
            newActive: updatedCategory.active,
            serverResponse: updatedCategory
          });
          
          // Обновляем состояние локально используя данные с сервера
          setCategories(prevCategories => 
            prevCategories.map(category => 
              category.id === cat.id 
                ? { ...category, active: updatedCategory.active }
                : category
            )
          );
          
          console.log('🔄 CMSCategories: Local state updated');
          
          // Обновляем только боковое меню, если нужно
          if (loadCategoriesFromAPI) {
            console.log('🔄 CMSCategories: Refreshing sidebar categories...');
            await loadCategoriesFromAPI();
          }
        } else {
          console.error('Failed to toggle category:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error toggling category:', error);
      }
    };
    // Показать диалог подтверждения удаления
    const handleDelete = (id) => {
      const category = categories.find(cat => cat.id === id);
      if (category) {
        setDeleteDialog({ open: true, id: id, name: category.name });
      }
    };
  
    // Подтверждение удаления категории
    const handleConfirmDelete = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories/${deleteDialog.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (response.ok) {
          // Обновляем состояние локально
          setCategories(prevCategories => 
            prevCategories.filter(category => category.id !== deleteDialog.id)
          );
          
          // Обновляем только боковое меню, если нужно
          if (loadCategoriesFromAPI) {
            await loadCategoriesFromAPI();
          }
        } else {
          console.error('Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        setDeleteDialog({ open: false, id: null, name: '' });
      }
    };
    // Редактирование категории
    const handleEdit = id => {
      const category = categories.find(cat => cat.id === id);
      if (category) {
        setEditForm({
          id: category.id,
          name: category.name,
          parent: category.parentId || '',
          icon: null
        });
        setIsEditing(true);
        setEditDialogOpen(true);
      }
    };
  
    // Обработка изменений в форме редактирования
    const handleEditFormChange = e => {
      const { name, value, files } = e.target;
      if (name === 'icon') {
        setEditForm(f => ({ ...f, icon: files[0] }));
      } else {
        setEditForm(f => ({ ...f, [name]: value }));
      }
    };
  
    // Сохранение изменений категории
    const handleEditSubmit = async e => {
      e.preventDefault();
      if (!editForm.name) return;
  
      // Сохраняем данные формы до сброса
      const formDataToSend = new FormData();
      formDataToSend.append('name', editForm.name);
      if (editForm.icon) {
        formDataToSend.append('image', editForm.icon);
      }
      if (editForm.parent !== '') {
        formDataToSend.append('parentId', editForm.parent);
      }
  
      // Сохраняем ID категории до сброса формы
      const categoryId = editForm.id;
  
      // Сразу закрываем диалог и сбрасываем форму
      setEditForm({ id: null, name: '', parent: '', icon: null });
      setIsEditing(false);
      setEditDialogOpen(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
  
      try {
        // Отправляем запрос на обновление
        const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: formDataToSend
        });
  
        if (!response.ok) {
          throw new Error('Ошибка обновления категории');
        }
  
        const updatedCategory = await response.json();
        
        console.log('✅ Категория обновлена:', updatedCategory);
        
        // Принудительно обновляем категории на главной странице
        if (window.loadCategoriesFromAPI) {
          console.log('🔄 Принудительно обновляем категории на главной странице...');
          window.loadCategoriesFromAPI(true);
        }
        
        // Также обновляем категории в ProductsContext
        if (window.refreshProductsContextCategories) {
          console.log('🔄 Принудительно обновляем категории в ProductsContext...');
          window.refreshProductsContextCategories();
        }
        
        // Обновляем состояние локально используя данные с сервера
        setCategories(prevCategories => {
          const updatedCategories = prevCategories.map(category => {
            if (category.id === categoryId) {
              // Создаем новую иконку с временной меткой для обхода кэширования
              let newIconPath;
              const imagePath = updatedCategory.icon || updatedCategory.image;
              if (imagePath) {
                // Если изображение содержит временную метку (175... или 176...), это загруженный файл
                if (imagePath.match(/^(175|176)\d+/)) {
                  newIconPath = `${API_BASE_URL}/uploads/${imagePath}?t=${Date.now()}`;
                } else {
                  // Если это старый файл из public папки
                  newIconPath = `${API_BASE_URL}/${imagePath}?t=${Date.now()}`;
                }
              } else {
                // Если нет изображения, используем fallback
                newIconPath = `${API_BASE_URL}${getCategoryIconForAPI(updatedCategory.name)}?t=${Date.now()}`;
              }
              
              console.log('🔄 Обновляем иконку категории:', {
                id: categoryId,
                oldImage: category.image,
                newImage: updatedCategory.image,
                newIconPath: newIconPath,
                updatedCategory: updatedCategory,
                timestamp: new Date().toISOString()
              });
              
              return { 
                ...category, 
                name: updatedCategory.name, 
                parentId: updatedCategory.parentId,
                image: updatedCategory.image,
                icon: newIconPath, // Обновляем иконку с новой временной меткой
                active: updatedCategory.active,
                _forceUpdate: Date.now() // Принудительное обновление для React
              };
            }
            return category;
          });
          
          console.log('🔄 Обновленное состояние категорий:', {
            allCategories: updatedCategories.length,
            timestamp: new Date().toISOString()
          });
          return updatedCategories;
        });
        
        // Принудительно обновляем состояние для немедленного отображения изменений
        setTimeout(() => {
          console.log('🔄 Принудительное обновление состояния категорий');
          setCategories(prevCategories => {
            const forceUpdate = prevCategories.map(category => ({
              ...category,
              _forceUpdate: Date.now() // Добавляем временную метку для принудительного обновления
            }));
            console.log('🔄 Force update applied:', {
              categoriesCount: forceUpdate.length,
              timestamp: new Date().toISOString()
            });
            return forceUpdate;
          });
        }, 100);
        
        // НЕ обновляем боковое меню, чтобы не потерять поле icon
        // loadCategoriesFromAPI перезаписывает локальное состояние и теряет поле icon
        console.log('🔄 Пропускаем обновление бокового меню, чтобы сохранить поле icon');
        
      } catch (error) {
        console.error('Ошибка обновления категории:', error);
        alert('Ошибка при обновлении категории');
      }
    };
  
    // Отмена редактирования
    const handleCancelEdit = () => {
      setEditForm({ id: null, name: '', parent: '', icon: null });
      setIsEditing(false);
      setEditDialogOpen(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    };
    // Форма добавления
    const handleFormChange = e => {
      const { name, value, files } = e.target;
      if (name === 'icon') setForm(f => ({ ...f, icon: files[0] }));
      else setForm(f => ({ ...f, [name]: value }));
    };
    const handleFormSubmit = async e => {
      e.preventDefault();
      if (!form.name) return;
      
      try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.icon) formData.append('image', form.icon);
      if (form.type === 'subcategory' && form.parent) {
        formData.append('parentId', form.parent);
      }
        
        const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      });
        
        if (response.ok) {
      setForm({ type: 'category', parent: '', name: '', icon: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Получаем новую категорию из ответа сервера
      const newCategory = await response.json();
      
      // Добавляем новую категорию в состояние локально
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      // Обновляем только боковое меню, если нужно
      if (loadCategoriesFromAPI) {
        await loadCategoriesFromAPI();
      }
        } else {
          console.error('Failed to create category');
        }
      } catch (error) {
        console.error('Error creating category:', error);
      }
    };
  
    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Box>;
  
    // Компонент для drag & drop категории
    const SortableCategoryItem = ({ cat, isRoot = false }) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({ id: cat.id });
  
      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };
  
      return (
        <Box
          ref={setNodeRef}
          style={style}
          sx={{
            border: '1px solid #eee',
            borderRadius: 3,
            mb: 2,
            background: '#fff',
            p: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
          }}
        >
          {/* DragIndicator для всех элементов */}
          <span {...attributes} {...listeners} style={{ display: 'flex' }}>
            <DragIndicator
              sx={{
                color: '#ccc',
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
              }}
            />
          </span>
          {cat.sub && cat.sub.length > 0 && (
            <IconButton onClick={e => { e.stopPropagation(); handleExpand(cat.id); }} data-no-drag>
              {expanded.includes(cat.id) ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
          )}
          {cat.parentId == null && (() => {
            // Используем локальную логику для получения иконки
            let iconUrl;
            const imagePath = cat.image || cat.icon;
            
            console.log('🔍 CMS Icon Debug:', {
              categoryId: cat.id,
              categoryName: cat.name,
              catImage: cat.image,
              catIcon: cat.icon,
              imagePath: imagePath,
              isUploadedFile: imagePath && imagePath.match(/^(175|176)\d+/),
              timestamp: new Date().toISOString()
            });
            
            if (imagePath) {
              // Все файлы идут в uploads, так как они загружены через CMS
              iconUrl = `${API_BASE_URL}/uploads/${imagePath}?t=${Date.now()}`;
              console.log('✅ Using uploads path:', iconUrl);
            } else {
              // Если нет изображения, используем fallback
              iconUrl = `${API_BASE_URL}${getCategoryIconForAPI(cat.name)}?t=${Date.now()}`;
              console.log('✅ Using fallback path:', iconUrl);
            }
            
            console.log('🖼️ CMS Icon render:', {
              categoryId: cat.id,
              categoryName: cat.name,
              categoryImage: cat.image,
              categoryIcon: cat.icon,
              iconUrl: iconUrl,
              forceUpdate: cat._forceUpdate,
              timestamp: new Date().toISOString()
            });
            return (
              <img 
                key={`${cat.id}-${cat.image}-${cat._forceUpdate || ''}`}
                src={iconUrl} 
                alt={`Иконка категории ${cat.name}`}
                style={{ width: 32, height: 32, marginLeft: '4px', marginRight: 12, borderRadius: 0, objectFit: 'cover' }} 
                onLoad={() => console.log('✅ Image loaded successfully:', iconUrl)}
                onError={(e) => console.log('❌ Image failed to load:', iconUrl, e)}
              />
            );
          })()}
          <Typography sx={{ fontWeight: 500, flex: 1 }}>{cat.name}</Typography>
          <Switch
            checked={cat.active === true}
            onClick={e => { e.stopPropagation(); }}
            onChange={() => handleToggleActive(cat)}
            color="success"
            inputProps={{ 'aria-label': 'Включена/Отключена' }}
            sx={{ mr: 2 }}
            data-no-drag
          />
          <IconButton 
            size="small" 
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleEdit(cat.id);
            }}
            sx={{ 
              color: '#1976d2',
              '&:hover': {
                backgroundColor: '#e3f2fd'
              }
            }}
            title="Редактировать"
            data-no-drag
          >
            <Edit />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(cat.id);
            }}
            sx={{ 
              color: '#f44336',
              '&:hover': {
                backgroundColor: '#ffebee'
              }
            }}
            title="Удалить"
            data-no-drag
          >
            <Delete />
          </IconButton>
        </Box>
      );
    };
  
    // Рекурсивный рендер дерева категорий
    const renderCategory = cat => {
      // Проверяем, что у категории есть id
      if (!cat || !cat.id) {
        console.warn('Category without id:', cat);
        return null;
      }
      
      return (
        <React.Fragment key={cat.id}>
          <SortableCategoryItem cat={cat} isRoot={!cat.parentId} />
          {/* Подкатегории */}
          {cat.sub && cat.sub.length > 0 && expanded.includes(cat.id) && (
            <Box sx={{ ml: 6, mb: 2 }}>
              {cat.sub.map(renderCategory)}
            </Box>
          )}
        </React.Fragment>
      );
    };
  
    // Функция для получения всех категорий в плоском виде для drag & drop
    const getAllCategories = (cats) => {
      let result = [];
      cats.forEach(cat => {
        if (cat && cat.id) {
          result.push(cat);
          if (cat.sub && cat.sub.length > 0) {
            result = result.concat(getAllCategories(cat.sub));
          }
        }
      });
      return result;
    };
    return (
      <Box sx={{ mt: 0, minHeight: 400, py: 4, px: { xs: 0, md: 0 } }}>
        <Box sx={{
          background: '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          p: { xs: 2, md: 4 },
          maxWidth: 1100,
          minWidth: 1100,
          minHeight: 320,
          margin: '0 auto',
          mt: 0,
        }}>
          {/* Красивая шапка */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Category color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 1 }}>
                Управление категориями
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Создание и редактирование структуры категорий магазина
              </Typography>
            </Box>
          </Box>
  
          {/* Статистика категорий */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e9ecef' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#495057' }}>
              Статистика категорий
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                  {categories.filter(cat => !cat.parentId).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Основных категорий
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                  {categories.filter(cat => cat.parentId).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Подкатегорий
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffc107' }}>
                  {categories.filter(cat => cat.active).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Активных категорий
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc3545' }}>
                  {categories.filter(cat => !cat.active).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Неактивных
                </Typography>
              </Box>
            </Box>
          </Box>
  
          {/* Разделитель */}
          <Box sx={{ mb: 4, height: 1, background: 'linear-gradient(90deg, transparent, #e0e0e0, transparent)' }} />
  
          <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#495057' }}>Структура категорий</Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={getAllCategories(tree).map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ mb: 4 }}>
              {tree.map(renderCategory)}
            </Box>
          </SortableContext>
        </DndContext>
  
        {/* Форма добавления */}
        <Box component="form" onSubmit={handleFormSubmit} sx={{ 
          background: '#f8f9fa', 
          p: 4, 
          borderRadius: 3, 
          border: '1px solid #e9ecef',
          mt: 4
        }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#495057' }}>Добавить категорию / подкатегорию</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="type-label">Тип</InputLabel>
            <Select labelId="type-label" name="type" value={form.type} label="Тип" onChange={handleFormChange}>
              <MenuItem value="category">Категория</MenuItem>
              <MenuItem value="subcategory">Подкатегория</MenuItem>
                  </Select>
                </FormControl>
          {form.type === 'subcategory' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="parent-label">Родительская категория</InputLabel>
              <Select labelId="parent-label" name="parent" value={form.parent} label="Родительская категория" onChange={handleFormChange}>
                {categories.filter(cat => !cat.parentId).map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                  </Select>
                </FormControl>
          )}
          <TextField label="Название" name="name" value={form.name} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} required />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Button 
              variant="outlined" 
              component="label"
              sx={{
                background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                border: '1px solid #ff6600',
                boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff8533 0%, #ff6600 100%)',
                  boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  color: '#666',
                  boxShadow: 'none'
                }
              }}
            >
              Загрузить иконку
              <input ref={fileInputRef} type="file" name="icon" accept="image/*" hidden onChange={handleFormChange} />
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  color: '#666',
                  boxShadow: 'none'
                }
              }}
            >
              Сохранить
            </Button>
          </Box>
          {form.icon && <Typography sx={{ mb: 2, fontSize: 14, color: '#888' }}>{form.icon.name}</Typography>}
                </Box>
  
        {/* Диалог редактирования */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleCancelEdit} 
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 500,
              maxWidth: 600
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#333',
            borderBottom: '2px solid #f0f0f0',
            mb: 2
          }}>
            Редактировать категорию
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
            <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="edit-parent-label">Родительская категория</InputLabel>
                <Select 
                  labelId="edit-parent-label" 
                  name="parent" 
                  value={editForm.parent} 
                  label="Родительская категория" 
                  onChange={handleEditFormChange}
                >
                  <MenuItem value="">Без родительской категории</MenuItem>
                  {categories.filter(cat => !cat.parentId && cat.id !== editForm.id).map(cat => 
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField 
                label="Название" 
                name="name" 
                value={editForm.name} 
                onChange={handleEditFormChange} 
                fullWidth 
                sx={{ mb: 2 }} 
                required 
              />
              <Button 
                variant="outlined" 
                component="label" 
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  border: '1px solid #ff6600',
                  boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
                  minWidth: 120,
                  height: 44,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8533 0%, #ff6600 100%)',
                    boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666',
                    boxShadow: 'none'
                  }
                }}
              >
                Загрузить новую иконку
                <input ref={editFileInputRef} type="file" name="icon" accept="image/*" hidden onChange={handleEditFormChange} />
              </Button>
              {editForm.icon && <Typography sx={{ mb: 2, fontSize: 14, color: '#888' }}>{editForm.icon.name}</Typography>}
  
              </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
            <Button 
              onClick={handleCancelEdit} 
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-1px)'
                },
                cursor: 'pointer',
              }}
              variant="contained"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                minWidth: 120,
                height: 44,
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                cursor: 'pointer',
              }}
              variant="contained"
            >
              Сохранить изменения
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Диалог подтверждения удаления */}
        <Dialog 
          open={deleteDialog.open} 
          onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 400,
              maxWidth: 500
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#d32f2f',
            borderBottom: '2px solid #ffebee',
            mb: 2
          }}>
            Удалить категорию "{deleteDialog.name}"?
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Внимание! Это действие нельзя отменить.
              </Typography>
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2, color: '#666', lineHeight: 1.5 }}>
              Вы действительно хотите удалить категорию "{deleteDialog.name}"?
            </Typography>
            
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                При удалении категории также будут удалены все её подкатегории и связанные товары.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
            <Button 
              onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                minWidth: 0,
                height: 32,
                borderRadius: 6,
                px: 2,
                lineHeight: '32px',
                whiteSpace: 'nowrap',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(244, 67, 54, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                },
                cursor: 'pointer',
              }}
              variant="contained"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                minWidth: 0,
                height: 32,
                borderRadius: 6,
                px: 2,
                lineHeight: '32px',
                whiteSpace: 'nowrap',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(244, 67, 54, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                },
                cursor: 'pointer',
              }}
              variant="contained"
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
          </Box>
        </Box>
      </Box>
    );
  }

export default CMSCategories;