import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, getImageUrl } from '../config';
import Lenis from 'lenis';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Container
} from '@mui/material';
import { Close, Delete, CloudUpload, Toys, Add as AddIcon, DragIndicator, Star } from '@mui/icons-material';


function EditProductModal(props) {
  const { t } = useTranslation();
  const { open, product, onClose, onSave, onDelete, categories = [] } = props;

  const [formData, setFormData] = useState({
    name: '',
    nameHe: '',
    description: '',
    descriptionHe: '',
    price: '',
    category: '',
    subcategory: '',
    ageGroup: '',
    quantity: '',
    article: '',
    brand: '',
    country: '',
    length: '',
    width: '',
    height: '',
    gender: '',
    isHidden: false
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedExistingImages, setRemovedExistingImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedImageIdx, setDraggedImageIdx] = useState(null);
  const dropZoneRef = useRef(null);
  const modalRef = useRef(null);
  const dialogContentRef = useRef(null);
  const lenisRef = useRef(null);
  const [openSelects, setOpenSelects] = useState({
    category: false,
    subcategory: false,
    ageGroup: false,
    gender: false
  });
  

  // Блокировка прокрутки фона и установка z-index для Popover
  useEffect(() => {
    if (open) {
      // Блокируем прокрутку body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Устанавливаем глобальные стили для Popover компонентов
      const style = document.createElement('style');
      style.id = 'modal-popover-styles';
             style.textContent = `
         .MuiPopover-root {
           z-index: 99999 !important;
         }
         .MuiPaper-root {
           z-index: 99999 !important;
         }
         .MuiMenu-root {
           z-index: 99999 !important;
         }
       `;
      document.head.appendChild(style);
    } else {
      // Восстанавливаем прокрутку
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      // Удаляем добавленные стили
      const style = document.getElementById('modal-popover-styles');
      if (style) {
        style.remove();
      }
    }
    
    return () => {
      // Очистка при размонтировании
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      // Удаляем добавленные стили
      const style = document.getElementById('modal-popover-styles');
      if (style) {
        style.remove();
      }
    };
  }, [open]);

  // Инициализация Lenis для модального окна
  useEffect(() => {
    if (open) {
      // Добавляем небольшую задержку для гарантии готовности DOM
      const initLenis = () => {
        if (dialogContentRef.current) {
          // Уничтожаем предыдущий экземпляр Lenis
          if (lenisRef.current) {
            lenisRef.current.destroy();
            lenisRef.current = null;
          }

          // Инициализируем новый экземпляр Lenis для прокрутки внутри модального окна
          lenisRef.current = new Lenis({
            wrapper: dialogContentRef.current,
            duration: 1.2,
            smooth: true,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            syncTouch: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            // Добавляем обработчик для исключения выпадающих списков и области с изображениями
            wheel: (e) => {
              const target = e.target;
              const isInSelect = target.closest('.MuiPopover-root') || 
                                target.closest('.MuiMenu-root');
              const isInImageGallery = target.closest('.image-gallery-area');
              
              if (isInSelect || isInImageGallery) {
                // Полностью отключаем Lenis для этих областей
                e.preventDefault();
                e.stopPropagation();
                return false; // Не обрабатываем прокрутку в выпадающих списках и области с изображениями
              }
              return true; // Обрабатываем прокрутку в остальных местах
            },
            touch: (e) => {
              const target = e.target;
              const isInSelect = target.closest('.MuiPopover-root') || 
                                target.closest('.MuiMenu-root');
              const isInImageGallery = target.closest('.image-gallery-area');
              
              if (isInSelect || isInImageGallery) {
                return false; // Не обрабатываем touch в выпадающих списках и области с изображениями
              }
              return true; // Обрабатываем touch в остальных местах
            }
          });

          // Функция для анимации кадров
          function raf(time) {
            lenisRef.current?.raf(time);
            if (open) requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);

        } else {
          // Если элемент еще не готов, пробуем еще раз через 100мс
          setTimeout(initLenis, 100);
        }
      };

      initLenis();
    } else {
      // Уничтожаем Lenis при закрытии модального окна
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    }

    // Очистка при размонтировании
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [open]);








  const ageGroups = [
    '0-1 год',
    '1-3 года',
    '3-5 лет',
    '5-7 лет',
    '7-10 лет',
    '10-12 лет',
    '12-14 лет',
    '14-16 лет'
  ];

  // Функция для нормализации возрастных групп (иврит -> русский)
  const normalizeAgeGroup = (ageGroup) => {
    if (!ageGroup) return '';
    
    const ageGroupMap = {
      '0-1 שנה': '0-1 год',
      '1-3 שנים': '1-3 года',
      '3-5 שנים': '3-5 лет',
      '5-7 שנים': '5-7 лет',
      '7-10 שנים': '7-10 лет',
      '10-12 שנים': '10-12 лет',
      '12-14 שנים': '12-14 лет',
      '14-16 שנים': '14-16 лет'
    };
    
    return ageGroupMap[ageGroup] || ageGroup;
  };

  // Обработчики для управления Lenis в выпадающих списках
  const handleSelectOpen = (selectName) => {
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
    setOpenSelects(prev => ({ ...prev, [selectName]: true }));
  };

  const handleSelectClose = (selectName) => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
    setOpenSelects(prev => ({ ...prev, [selectName]: false }));
  };

  // Автоматически возобновляем Lenis при закрытии всех выпадающих списков
  useEffect(() => {
    const hasOpenSelects = Object.values(openSelects).some(isOpen => isOpen);
    
    if (!hasOpenSelects && lenisRef.current) {
      lenisRef.current.start();
    }
  }, [openSelects]);

  const handleMenuOpen = () => {
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
  };

  const handleMenuClose = () => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  // Добавляем обработчик для предотвращения прокрутки в выпадающих списках
  useEffect(() => {
    const handleWheel = (e) => {
      // Проверяем, находится ли событие в выпадающем списке или области с изображениями
      const target = e.target;
      const isInSelect = target.closest('.MuiPopover-root') || 
                        target.closest('.MuiMenu-root');
      const isInImageGallery = target.closest('.image-gallery-area');
      
      if (isInSelect || isInImageGallery) {
        // Полностью останавливаем Lenis и предотвращаем его обработку
        if (lenisRef.current) {
          lenisRef.current.stop();
        }
        // Предотвращаем всплытие события
        e.preventDefault();
        e.stopPropagation();
        return false;
      } else {
        // Если не в выпадающем списке или области с изображениями, возобновляем Lenis
        if (lenisRef.current) {
          lenisRef.current.start();
        }
      }
    };

    const handleTouchStart = (e) => {
      const target = e.target;
      const isInSelect = target.closest('.MuiPopover-root') || 
                        target.closest('.MuiMenu-root');
      const isInImageGallery = target.closest('.image-gallery-area');
      
      if (isInSelect || isInImageGallery) {
        if (lenisRef.current) {
          lenisRef.current.stop();
        }
      }
    };

    const handleTouchEnd = (e) => {
      const target = e.target;
      const isInSelect = target.closest('.MuiPopover-root') || 
                        target.closest('.MuiMenu-root');
      const isInImageGallery = target.closest('.image-gallery-area');
      
      if (!isInSelect && !isInImageGallery && lenisRef.current) {
        lenisRef.current.start();
      }
    };

    if (open) {
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [open]);

  // Обработчик клика вне выпадающих списков
  const handleClickOutside = useCallback((event) => {
    // Проверяем, что клик не внутри Select компонента
    const isSelectClick = event.target.closest('.MuiSelect-select') || 
                          event.target.closest('.MuiMenu-root') || 
                          event.target.closest('.MuiPopover-root');
    
    if (!isSelectClick) {
      // Закрываем все открытые выпадающие списки
      setOpenSelects({
        category: false,
        subcategory: false,
        ageGroup: false,
        gender: false
      });
    }
  }, []);

  // Добавляем обработчик клика вне списков
  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open, handleClickOutside]);





  useEffect(() => {
    if (product && open) {
      // Безопасная функция для извлечения строкового значения
      const safeString = (value) => {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null && value.name) return value.name;
        if (typeof value === 'number') return value.toString();
        return '';
      };

      // Универсально определяем ID категории
      let categoryId = '';
      if (product.category) {
        // Если product.category - это объект с id и name
        if (product.category.id) {
          categoryId = product.category.id;
        }
        // Если product.category - это число (ID)
        else if (typeof product.category === 'number' || !isNaN(parseInt(product.category))) {
          categoryId = parseInt(product.category);
        }
        // Если product.category - это строка (название)
        else if (typeof product.category === 'string') {
          const category = categories.find(c => c.name === product.category);
          categoryId = category ? category.id : '';
        }
      }
      
      // Если категория не определена, но есть подкатегория, определяем категорию по подкатегории
      if (!categoryId && product.subcategoryId) {
        const subcategory = categories.find(c => c.id === product.subcategoryId);
        if (subcategory && subcategory.parentId) {
          categoryId = subcategory.parentId;
        }
      }
      
      // Если категория все еще не определена, но есть subcategory объект
      if (!categoryId && product.subcategory && product.subcategory.id) {
        const subcategory = categories.find(c => c.id === product.subcategory.id);
        if (subcategory && subcategory.parentId) {
          categoryId = subcategory.parentId;
        }
      }

      // Определяем ID подкатегории
      let subcategoryId = '';
      if (product.subcategoryId) {
        // Приоритет отдаем subcategoryId из продукта
        subcategoryId = product.subcategoryId;
      } else if (product.subcategory) {
        // Если product.subcategory - это объект с id и name
        if (product.subcategory.id) {
          subcategoryId = product.subcategory.id;
        }
        // Если product.subcategory - это число (ID)
        else if (typeof product.subcategory === 'number' || !isNaN(parseInt(product.subcategory))) {
          subcategoryId = parseInt(product.subcategory);
        }
        // Если product.subcategory - это строка (название)
        else if (typeof product.subcategory === 'string') {
          // Ищем подкатегорию по названию и берем её ID
          const subcategoryByName = categories.find(c => c.name === product.subcategory);
          subcategoryId = subcategoryByName ? subcategoryByName.id : '';
        }
      }



      // Проверяем, существуют ли выбранные категории в списке доступных
      const categoryExists = categories.find(cat => cat.id === categoryId);
      const subcategoryExists = categories.find(cat => cat.id === subcategoryId);
      
      // Если категории не существуют, используем первые доступные
      if (!categoryExists && categories.length > 0) {
        const firstCategory = categories.find(cat => !cat.parentId); // Главная категория
        if (firstCategory) {
          categoryId = firstCategory.id;
  
        }
      }
      
      // Проверяем, есть ли подкатегории в выбранной категории
      const subcategoriesInCategory = categories.filter(cat => cat.parentId === categoryId);
      
      // Если подкатегория не найдена, но в категории есть подкатегории, используем первую
      if (!subcategoryExists && subcategoriesInCategory.length > 0) {
        const firstSubcategory = subcategoriesInCategory[0];
        subcategoryId = firstSubcategory.id;

      }
      // Если в категории нет подкатегорий, оставляем subcategoryId пустым
      else if (subcategoriesInCategory.length === 0) {
        subcategoryId = '';

      }

      setFormData({
        name: safeString(product.name) || '',
        nameHe: safeString(product.nameHe) || '',
        description: safeString(product.description) || '',
        descriptionHe: safeString(product.descriptionHe) || '',
        price: product.price || '',
        category: categoryId,
        subcategory: subcategoryId,
        ageGroup: safeString(product.ageGroup) || '',
        quantity: product.quantity || '',
        article: safeString(product.article) || '',
        brand: safeString(product.brand) || '',
        country: safeString(product.country) || '',
        length: product.length || '',
        width: product.width || '',
        height: product.height || '',
        gender: (() => {
          // Нормализуем значение gender
          const genderValue = safeString(product.gender);
          if (genderValue === 'универсальный') {
            return 'Универсальный';
          }
          return genderValue || '';
        })(),
        isHidden: product.isHidden || false
      });
      setExistingImages(product.imageUrls || []);
      setNewImages([]);
      setRemovedExistingImages([]); // Сбрасываем список удаленных изображений
      // Не сбрасываем главное изображение - оставляем как есть или устанавливаем 0 если изображений нет
      setMainImageIndex(product.imageUrls && product.imageUrls.length > 0 ? 0 : 0);
    }
  }, [product, categories, open]);

  // Сброс формы при закрытии модального окна
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        nameHe: '',
        description: '',
        descriptionHe: '',
        price: '',
        category: '',
        subcategory: '',
        ageGroup: '',
        quantity: '',
        article: '',
        brand: '',
        country: '',
        length: '',
        width: '',
        height: '',
        gender: '',
        isHidden: false
      });
      setNewImages([]);
      setExistingImages([]);
      setRemovedExistingImages([]);
      setMainImageIndex(0);
      setError('');
    }
  }, [open]);


  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    

    
    if (name === 'isHidden') {
      setFormData(prev => ({ ...prev, isHidden: checked }));
      return;
    }

    if (name === 'price' || name === 'length' || name === 'width' || name === 'height' || name === 'quantity') {
      const num = Number(value);
      if (num < 0) {
        setFormData(prev => ({ ...prev, [name]: '0' }));
        return;
      }
    }
    
    // Если изменяется категория, сбрасываем подкатегорию
    if (name === 'category') {
      setFormData(prev => ({ ...prev, [name]: value, subcategory: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Drag&Drop загрузка изображений
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, 7 - (existingImages.length + newImages.length));
    setNewImages(prev => [...prev, ...files]);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files).slice(0, 7 - (existingImages.length + newImages.length));
    setNewImages(prev => [...prev, ...files]);
  };

  // Drag&Drop сортировка изображений (только для новых)
  const handleDragStart = (idx) => setDraggedImageIdx(idx);
  const handleDragEnd = () => setDraggedImageIdx(null);
  const handleDropImage = (idx) => {
    if (draggedImageIdx === null || draggedImageIdx === idx) return;
    setNewImages(prev => {
      const arr = [...prev];
      const [removed] = arr.splice(draggedImageIdx, 1);
      arr.splice(idx, 0, removed);
      return arr;
    });
    setDraggedImageIdx(null);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index, type = 'existing') => {
    if (type === 'existing') {
      setMainImageIndex(index);
    } else {
      // Для новых изображений индекс смещается на количество существующих
      const newIndex = existingImages.length + index;
      setMainImageIndex(newIndex);
    }
  };

  const removeExistingImage = async (index) => {
    if (!product || !product.id) return;
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;
      
      if (!token) {
        setError('Необходима авторизация для удаления изображения');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/images/${index}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Добавляем удаленное изображение в список для отслеживания
        const removedImage = existingImages[index];
        setRemovedExistingImages(prev => [...prev, { url: removedImage, index }]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
      } else {
        const error = await response.json();
        setError(error.message || 'Ошибка удаления изображения');
      }
    } catch (error) {
      setError('Ошибка удаления изображения');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      
      
      // Определяем язык ввода на основе содержимого полей
      const detectInputLanguage = (text) => {
        if (!text) return 'ru';
        // Простая эвристика для определения языка
        const hebrewPattern = /[\u0590-\u05FF]/; // Диапазон символов иврита
        return hebrewPattern.test(text) ? 'he' : 'ru';
      };
      
      const nameLanguage = detectInputLanguage(formData.name);
      const descriptionLanguage = detectInputLanguage(formData.description);
      const inputLanguage = nameLanguage === 'he' || descriptionLanguage === 'he' ? 'he' : 'ru';
      
      
      
      const updatedProduct = {
        ...product,
        ...formData,
        newImages: newImages,
        removedExistingImages: removedExistingImages,
        currentExistingImages: existingImages, // Передаем текущее состояние существующих изображений
        mainImageIndex: mainImageIndex, // Передаем индекс главного изображения
        inputLanguage: inputLanguage // Передаем язык ввода для автоматического перевода
      };

      
      console.log('🚀 EditProductModal: вызываем onSave с данными:', updatedProduct);
      await onSave(updatedProduct);
    } catch (err) {
      setError('Ошибка сохранения товара');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (product && onDelete) {
      onDelete(product.id);
    }
  };

  // Категории и подкатегории
  const mainCategories = categories || [];
  const [subcategories, setSubcategories] = useState([]);
  
  // Загружаем подкатегории при изменении категории
  useEffect(() => {
    if (formData.category) {

      fetch(`${API_BASE_URL}/api/categories?parentId=${formData.category}`)
        .then(res => res.json())
        .then(data => {
          setSubcategories(data);
          // Проверяем, что текущий subcategory существует в новых подкатегориях
          // Только если есть подкатегории и текущая подкатегория не найдена
          if (data.length > 0 && formData.subcategory) {
            const subcategoryExists = data.find(sub => sub.id === formData.subcategory || sub.name === formData.subcategory);
            if (!subcategoryExists) {
              // Если subcategory не найден в новых подкатегориях, сбрасываем его
  
              setFormData(prev => ({ ...prev, subcategory: '' }));
            }
          }
          // Если подкатегорий нет, оставляем subcategory как есть (может быть пустым)
        })
        .catch(error => {
          console.error('Error loading subcategories:', error);
          setSubcategories([]);
          // Сбрасываем subcategory при ошибке загрузки
          setFormData(prev => ({ ...prev, subcategory: '' }));
        });
          } else {
        setSubcategories([]);
        // Сбрасываем subcategory когда категория не выбрана
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
  }, [formData.category]);

  // Инициализируем форму данными товара при каждом открытии модального окна
  useEffect(() => {
    if (product && open) {

      
      // Безопасная функция для извлечения строкового значения
      const safeString = (value) => {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null && value.name) return value.name;
        if (typeof value === 'number') return value.toString();
        return '';
      };

      // Определяем правильные ID для категории и подкатегории
      let categoryId = '';
      let subcategoryId = '';
      

      
      // Определяем ID категории
      if (product.category) {
        if (typeof product.category === 'object' && product.category.id) {
          categoryId = product.category.id;

        } else if (typeof product.category === 'number' || !isNaN(parseInt(product.category))) {
          categoryId = parseInt(product.category);

        } else if (typeof product.category === 'string') {
          const category = categories.find(c => c.name === product.category);
          categoryId = category ? category.id : '';

        }
      }
      
      // Если категория не определена, но есть categoryId
      if (!categoryId && product.categoryId) {
        categoryId = product.categoryId;

      }
      
      // Проверяем, является ли найденная категория подкатегорией
      // Если да, то находим её родительскую категорию
      if (categoryId) {
        const foundCategory = categories.find(c => c.id === categoryId);
        if (foundCategory && foundCategory.parentId) {
          // Это подкатегория, используем её родительскую категорию
          categoryId = foundCategory.parentId;

        }
      }
      
      // Определяем ID подкатегории
      if (product.subcategory) {
        if (typeof product.subcategory === 'object' && product.subcategory.id) {
          subcategoryId = product.subcategory.id;

        } else if (typeof product.subcategory === 'number' || !isNaN(parseInt(product.subcategory))) {
          subcategoryId = parseInt(product.subcategory);

        } else if (typeof product.subcategory === 'string') {
          // Ищем подкатегорию по названию среди всех категорий
          const subcategory = categories.find(c => c.name === product.subcategory);
          subcategoryId = subcategory ? subcategory.id : '';

        }
      }
      
      // Если подкатегория не определена, но есть subcategoryId
      if (!subcategoryId && product.subcategoryId) {
        subcategoryId = product.subcategoryId;

      }
      
      // Если подкатегория не определена, но product.category указывает на подкатегорию
      if (!subcategoryId && product.category) {
        let potentialSubcategoryId = '';
        if (typeof product.category === 'object' && product.category.id) {
          potentialSubcategoryId = product.category.id;
        } else if (typeof product.category === 'number' || !isNaN(parseInt(product.category))) {
          potentialSubcategoryId = parseInt(product.category);
        }
        
        if (potentialSubcategoryId) {
          const foundCategory = categories.find(c => c.id === potentialSubcategoryId);
          if (foundCategory && foundCategory.parentId) {
            // product.category указывает на подкатегорию
            subcategoryId = potentialSubcategoryId;

          }
        }
      }
      
      
      
      // Fallback: если категория не определена, используем первую доступную
      if (!categoryId && categories.length > 0) {
        const firstCategory = categories.find(c => !c.parentId); // Главная категория
        if (firstCategory) {
          categoryId = firstCategory.id;
        }
      }
      
      // Дополнительная проверка: если категория определена, но подкатегория нет,
      // попробуем найти подкатегорию по названию среди всех категорий
      if (categoryId && !subcategoryId) {
        const allSubcategories = categories.filter(c => c.parentId === categoryId);
        if (allSubcategories.length > 0) {
          // Используем первую доступную подкатегорию как fallback
          subcategoryId = allSubcategories[0].id;
  
        }
      }
      
      const initialFormData = {
        name: safeString(product.name) || '',
        nameHe: safeString(product.nameHe) || '',
        description: safeString(product.description) || '',
        descriptionHe: safeString(product.descriptionHe) || '',
        price: product.price || '',
        category: categoryId,
        subcategory: subcategoryId,
        ageGroup: normalizeAgeGroup(safeString(product.ageGroup)) || '',
        quantity: product.quantity || '',
        article: safeString(product.article) || '',
        brand: safeString(product.brand) || '',
        country: safeString(product.country) || '',
        length: product.length || '',
        width: product.width || '',
        height: product.height || '',
        gender: safeString(product.gender) || '',
        isHidden: product.isHidden || false
      };
      
        
        setFormData(initialFormData);

      // Загружаем подкатегории для выбранной категории
      if (categoryId) {
        fetch(`${API_BASE_URL}/api/categories?parentId=${categoryId}`)
          .then(res => res.json())
          .then(data => {
            setSubcategories(data);

          })
          .catch(error => {
            console.error('Error loading initial subcategories:', error);
            setSubcategories([]);
          });
      } else {
        setSubcategories([]);
      }

      // Загружаем существующие изображения
      if (product.imageUrls && product.imageUrls.length > 0) {

        setExistingImages(product.imageUrls);
      } else if (product.images && product.images.length > 0) {
        
        setExistingImages(product.images);
      } else {
        
        setExistingImages([]);
      }

      // Сбрасываем новые изображения и удаленные
      setNewImages([]);
      setRemovedExistingImages([]);
      setMainImageIndex(0);
    }
  }, [product, open]);

  // Загружаем подкатегории при инициализации формы с данными товара
  useEffect(() => {
    if (product && product.category) {

      // Сначала определяем ID категории
      let categoryId = '';
      if (product.category) {
        let category = categories.find(c => c.id === parseInt(product.category));
        if (!category) {
          category = categories.find(c => c.name === product.category);
        }
        categoryId = category ? category.id : '';
      }
      
      if (categoryId) {
        fetch(`${API_BASE_URL}/api/categories?parentId=${categoryId}`)
          .then(res => res.json())
          .then(data => {
            setSubcategories(data);
            // Проверяем, что subcategoryId существует в загруженных подкатегориях
            const subcategoryId = product.subcategoryId || (product.subcategory && product.subcategory.id) || (typeof product.subcategory === 'string' ? product.subcategory : '');

            
            // Только если есть подкатегории и subcategoryId не найден
            if (data.length > 0 && subcategoryId) {
              const subcategoryExists = data.find(sub => sub.id === subcategoryId || sub.name === subcategoryId);
              if (!subcategoryExists) {
                // Если subcategoryId не найден в подкатегориях, сбрасываем его

                setFormData(prev => ({ ...prev, subcategory: '' }));
              }
            }
            // Если подкатегорий нет, оставляем subcategory как есть
            if (data.length === 0) {

            }
          })
          .catch(error => {
            console.error('Error loading initial subcategories:', error);
            setSubcategories([]);
            // Сбрасываем subcategory при ошибке загрузки
            setFormData(prev => ({ ...prev, subcategory: '' }));
          });
      }
    }
  }, [product, categories]);

  // Отслеживаем изменения в existingImages для отладки
  useEffect(() => {

  }, [existingImages]);


  return (
    <Dialog 
      ref={modalRef}
      open={open} 
      onClose={onClose} 
            sx={{
        zIndex: 99999,
        '& .MuiDialog-paper': {
          zIndex: 99999,
          marginTop: 'calc(5vh + 15px)',
          marginBottom: '0',
          maxHeight: '95vh',
          height: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiDialogContent-root': {
            flex: 1,
            overflow: 'auto'
          }
        },
        '& .MuiPopover-root': {
          zIndex: 99999
        },
        '& .MuiMenu-root': {
          zIndex: 99999
        },
        '& .MuiPaper-root': {
          zIndex: 99999
        }
      }}
             PaperProps={{
         sx: {
           borderRadius: 3,
           boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
           minWidth: 700,
           maxWidth: 900,
           position: 'relative'
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
        mb: 2,
        position: 'relative'
      }}>
        Редактировать товар
        <IconButton 
          onClick={onClose} 
          sx={{ 
            position: 'absolute', 
            right: 16, 
            top: 16, 
            color: '#666',
            '&:hover': {
              color: '#333',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent
            ref={dialogContentRef}
            onWheel={(e) => {
              // Проверяем, находится ли событие в области с изображениями
              const target = e.target;
              const isInImageGallery = target.closest('.image-gallery-area');
              
              if (isInImageGallery) {
                // Если в области с изображениями, останавливаем Lenis
                if (lenisRef.current) {
                  lenisRef.current.stop();
                }
                // Разрешаем обычную прокрутку
                e.stopPropagation();
              }
            }}
            sx={{ 
              p: 3,
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              maxHeight: 'calc(90vh - 120px)', // Высота минус заголовок и отступы
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
              '& .MuiSelect-select': {
                zIndex: 1
              },
                             '& .MuiPopover-root': {
                 zIndex: 99999
               },
               '& .MuiMenu-root': {
                 zIndex: 99999
               },
               '& .MuiPaper-root': {
                 zIndex: 99999
               }
            }}
            dividers
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
                
                
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    label="Название (русский)" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    fullWidth 
                    required 
                    variant="outlined"
                    size="medium"
                  />
                  <TextField 
                    label="Название (иврит)" 
                    name="nameHe" 
                    value={formData.nameHe} 
                    onChange={handleInputChange} 
                    fullWidth 
                    variant="outlined"
                    size="medium"
                  />
                  <TextField 
                    label="Описание (русский)" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    fullWidth 
                    multiline 
                    minRows={2} 
                    variant="outlined"
                    size="medium"
                  />
                  <TextField 
                    label="Описание (иврит)" 
                    name="descriptionHe" 
                    value={formData.descriptionHe} 
                    onChange={handleInputChange} 
                    fullWidth 
                    multiline 
                    minRows={2} 
                    variant="outlined"
                    size="medium"
                  />
                  <TextField 
                    label="Цена" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    type="number" 
                    fullWidth 
                    required 
                    variant="outlined"
                    size="medium"
                  />
                  <FormControl fullWidth>
                    <InputLabel id="category-label">Категория</InputLabel>
                                         <Select 
                       labelId="category-label" 
                       label="Категория" 
                       name="category" 
                       value={formData.category} 
                       onChange={handleInputChange} 
                       open={openSelects.category}
                       onOpen={() => handleSelectOpen('category')}
                       onClose={() => handleSelectClose('category')}
                       renderValue={selected => selected ? (categories.find(c => c.id === selected)?.label || categories.find(c => c.id === selected)?.name || selected) : 'Выберите категорию'}
                       MenuProps={{
                         PaperProps: {
                           sx: { zIndex: 99999, maxHeight: 300 }
                         },
                         anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                         transformOrigin: { vertical: 'top', horizontal: 'left' }
                       }}
                     >
                      {categories.filter(c => !c.parentId).map(c => <MenuItem key={c.id} value={c.id}>{c.label || c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth disabled={!formData.category}>
                    <InputLabel id="subcategory-label">Подкатегория</InputLabel>
                                         <Select 
                       labelId="subcategory-label" 
                       label="Подкатегория" 
                       name="subcategory" 
                       value={formData.subcategory || ''}
                       onChange={handleInputChange} 
                       open={openSelects.subcategory}
                       onOpen={() => handleSelectOpen('subcategory')}
                       onClose={() => handleSelectClose('subcategory')}
                       renderValue={selected => {
                         if (!selected) return 'Выберите подкатегорию';
                         const subcategory = subcategories.find(sub => sub.id === selected);
                         return subcategory ? subcategory.name : selected;
                       }}
                       MenuProps={{
                         PaperProps: {
                           sx: { zIndex: 99999, maxHeight: 300 }
                         },
                         anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                         transformOrigin: { vertical: 'top', horizontal: 'left' }
                       }}
                     >
                      {subcategories.length > 0 ? (
                        subcategories.map(sub => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)
                      ) : (
                        <MenuItem disabled>Нет подкатегорий</MenuItem>
                      )}
                    </Select>
                  </FormControl>


                  <TextField 
                    label="Количество" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleInputChange} 
                    type="number" 
                    fullWidth 
                    required 
                    variant="outlined"
                    size="medium"
                  />
                                    <TextField 
                    label="Артикул"
                    name="article"
                    value={formData.article}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    size="medium"
                  />
                  <TextField 
                    label="Бренд" 
                    name="brand" 
                    value={formData.brand} 
                    onChange={handleInputChange} 
                    fullWidth 
                    variant="outlined"
                    size="medium"
                  />
                  <TextField 
                    label="Страна производства" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleInputChange} 
                    fullWidth 
                    variant="outlined"
                    size="medium"
                  />
                  <FormControl fullWidth>
                    <InputLabel id="age-group-label">Возрастная группа</InputLabel>
                                         <Select 
                       labelId="age-group-label" 
                                               label="Возрастная группа" 
                       name="ageGroup" 
                       value={formData.ageGroup} 
                       onChange={handleInputChange} 
                       open={openSelects.ageGroup}
                       onOpen={() => handleSelectOpen('ageGroup')}
                       onClose={() => handleSelectClose('ageGroup')}
                       renderValue={selected => selected || 'Выберите возрастную группу'}
                       MenuProps={{
                         PaperProps: {
                           sx: { zIndex: 99999, maxHeight: 300 }
                         },
                         anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                         transformOrigin: { vertical: 'top', horizontal: 'left' }
                       }}
                     >
                      {ageGroups.map(age => (
                        <MenuItem key={age} value={age}>{age}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="gender-label">Пол</InputLabel>
                                         <Select
                       labelId="gender-label"
                       label="Пол"
                       name="gender"
                       value={formData.gender || ''}
                       onChange={handleInputChange}
                       open={openSelects.gender}
                       onOpen={() => handleSelectOpen('gender')}
                       onClose={() => handleSelectClose('gender')}
                       renderValue={selected => selected || 'Выберите пол'}
                       MenuProps={{
                         PaperProps: {
                           sx: { zIndex: 99999, maxHeight: 300 }
                         },
                         anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                         transformOrigin: { vertical: 'top', horizontal: 'left' }
                       }}
                     >
                                      <MenuItem value="Для мальчиков">Для мальчиков</MenuItem>
                <MenuItem value="Для девочек">Для девочек</MenuItem>
                      <MenuItem value="Универсальный">Универсальный</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField 
                      label="Длина (см)" 
                      name="length" 
                      value={formData.length} 
                      onChange={handleInputChange} 
                      type="number" 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                    <TextField 
                      label="Ширина (см)" 
                      name="width" 
                      value={formData.width} 
                      onChange={handleInputChange} 
                      type="number" 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                    <TextField 
                      label="Высота (см)" 
                      name="height" 
                      value={formData.height} 
                      onChange={handleInputChange} 
                      type="number" 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Изображения товара
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        background: '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        '&:hover': {
                          borderColor: '#4FC3F7',
                          background: '#f0f8ff'
                        }
                      }}
                      onClick={() => document.getElementById('image-upload').click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#4FC3F7';
                        e.currentTarget.style.background = '#f0f8ff';
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#ccc';
                        e.currentTarget.style.background = '#fafafa';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#ccc';
                        e.currentTarget.style.background = '#fafafa';
                        
                        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                        if (files.length > 0) {
                          const currentImages = newImages || [];
                          // Фильтруем только новые файлы, исключая дубликаты
                          const newFiles = files.filter(newFile => 
                            !currentImages.some(existingFile => 
                              existingFile.name === newFile.name && 
                              existingFile.size === newFile.size &&
                              existingFile.lastModified === newFile.lastModified
                            )
                          );
                          if (newFiles.length > 0) {
                            setNewImages([...currentImages, ...newFiles]);
                          }
                        }
                      }}
                      onDragStart={(e) => {
                        // Предотвращаем перетаскивание самой зоны
                        e.preventDefault();
                        return false;
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography sx={{ color: '#666', mb: 1 }}>
                        Перетащите изображения сюда или нажмите для выбора
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999', mb: 1 }}>
                        Поддерживаются форматы: JPG, PNG, GIF, WEBP
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#FFB300', fontWeight: 'bold' }}>
                        💡 Кликните на изображение, чтобы сделать его главным
                      </Typography>
                      <input
                        id="image-upload"
                        type="file"
                        name="images"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleImageUpload}
                      />
                    </Box>
                    
                    {(newImages.length > 0 || existingImages.length > 0) && (
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ mb: 2, fontSize: 14, color: '#666', fontWeight: 'bold' }}>
                          Изображения: {newImages.length + existingImages.length}
                        </Typography>
                        <Typography sx={{ mb: 2, fontSize: 12, color: '#4CAF50', fontStyle: 'italic' }}>
                          💡 Кликните на изображение, чтобы сделать его главным (будет отображаться первым)
                        </Typography>
                        <Box 
                          className="image-gallery-area"
                          onWheel={(e) => {
                            // Предотвращаем всплытие события прокрутки
                            e.stopPropagation();
                            // Разрешаем обычную прокрутку в этой области
                            const container = e.currentTarget;
                            const scrollTop = container.scrollTop;
                            const scrollHeight = container.scrollHeight;
                            const clientHeight = container.clientHeight;
                            
                            // Если контент не помещается, прокручиваем контейнер
                            if (scrollHeight > clientHeight) {
                              container.scrollTop = scrollTop + e.deltaY;
                            } else {
                              // Если контент помещается, прокручиваем родительский элемент
                              const parent = container.closest('.MuiDialogContent-root');
                              if (parent) {
                                parent.scrollTop += e.deltaY;
                              }
                            }
                          }}
                          sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 2,
                            minHeight: 120,
                            border: '2px dashed #e0e0e0',
                            borderRadius: 2,
                            p: 2,
                            background: '#fafafa',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            overflowY: 'auto',
                            maxHeight: '400px'
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#4FC3F7';
                            e.currentTarget.style.background = '#f0f8ff';
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.background = '#fafafa';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.background = '#fafafa';
                            
                            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                            if (files.length > 0) {
                              const currentImages = newImages || [];
                              // Фильтруем только новые файлы, исключая дубликаты
                              const newFiles = files.filter(newFile => 
                                !currentImages.some(existingFile => 
                                  existingFile.name === newFile.name && 
                                  existingFile.size === newFile.size &&
                                  existingFile.lastModified === newFile.lastModified
                                )
                              );
                              if (newFiles.length > 0) {
                                setNewImages([...currentImages, ...newFiles]);
                              }
                            }
                          }}
                          onDragStart={(e) => {
                            // Предотвращаем перетаскивание контейнера
                            e.preventDefault();
                            return false;
                          }}
                        >
                          {/* Существующие изображения */}
                          {existingImages.map((imageUrl, index) => (
                            <Box 
                              key={`existing-${index}`} 
                              sx={{ 
                                position: 'relative',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none'
                              }}
                            >
                              <img
                                src={getImageUrl(imageUrl)}
                                alt={`Existing ${index + 1}`}
                                style={{
                                  width: 100,
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  border: mainImageIndex === index ? '3px solid #4CAF50' : '2px solid #e0e0e0',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  WebkitUserSelect: 'none',
                                  MozUserSelect: 'none',
                                  msUserSelect: 'none'
                                }}
                                onClick={() => setMainImage(index, 'existing')}
                                onError={(e) => {
                                  e.target.src = '/toys.png';
                                  e.target.onerror = null;
                                }}
                                draggable={false}
                              />
                              {/* Индикатор главного изображения */}
                              {mainImageIndex === index && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -5,
                                    left: -5,
                                    background: '#4CAF50',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    zIndex: 3,
                                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                                  }}
                                >
                                  ★
                                </Box>
                              )}
                              <IconButton
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  background: '#fff',
                                  borderRadius: '50%',
                                  p: 0.5,
                                  zIndex: 2,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                  '&:hover': { 
                                    background: '#ffeaea',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={() => removeExistingImage(index)}
                              >
                                <Close sx={{ fontSize: 16, color: '#e57373' }} />
                              </IconButton>
                              <Typography variant="caption" sx={{ 
                                display: 'block', 
                                textAlign: 'center', 
                                mt: 0.5, 
                                color: mainImageIndex === index ? '#4CAF50' : '#666',
                                fontSize: '0.7rem',
                                fontWeight: mainImageIndex === index ? 'bold' : 'normal'
                              }}>
                                {mainImageIndex === index ? 'Главное' : `Изображение ${index + 1}`}
                              </Typography>
                            </Box>
                          ))}
                          
                          {/* Новые изображения */}
                          {newImages.map((file, index) => {
                            const newImageIndex = existingImages.length + index;
                            return (
                              <Box 
                                key={`new-${index}`} 
                                sx={{ 
                                  position: 'relative',
                                  userSelect: 'none',
                                  WebkitUserSelect: 'none',
                                  MozUserSelect: 'none',
                                  msUserSelect: 'none'
                                }}
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    width: 100,
                                    height: 100,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    border: mainImageIndex === newImageIndex ? '3px solid #4CAF50' : '2px solid #e0e0e0',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    MozUserSelect: 'none',
                                    msUserSelect: 'none'
                                  }}
                                  onClick={() => setMainImage(index, 'new')}
                                  onError={(e) => {
                                    e.target.src = '/toys.png';
                                    e.target.onerror = null;
                                  }}
                                  draggable={false}
                                />
                                {/* Индикатор главного изображения */}
                                {mainImageIndex === newImageIndex && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: -5,
                                      left: -5,
                                      background: '#4CAF50',
                                      color: 'white',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      zIndex: 3,
                                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                                    }}
                                  >
                                    ★
                                  </Box>
                                )}
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    background: '#fff',
                                    borderRadius: '50%',
                                    p: 0.5,
                                    zIndex: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    '&:hover': { 
                                      background: '#ffeaea',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={() => removeNewImage(index)}
                                >
                                  <Close sx={{ fontSize: 16, color: '#e57373' }} />
                                </IconButton>
                                <Typography variant="caption" sx={{ 
                                  display: 'block', 
                                  textAlign: 'center', 
                                  mt: 0.5, 
                                  color: mainImageIndex === newImageIndex ? '#4CAF50' : '#666',
                                  fontSize: '0.7rem',
                                  fontWeight: mainImageIndex === newImageIndex ? 'bold' : 'normal'
                                }}>
                                  {mainImageIndex === newImageIndex ? 'Главное' : `Новое ${index + 1}`}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button 
                            variant="contained" 
                            onClick={() => document.getElementById('image-upload').click()}
                            startIcon={<AddIcon />}
                            sx={{
                              background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                              color: '#fff',
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize: 15,
                              px: 3,
                              py: 1.5,
                              height: 44,
                              boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
                              textTransform: 'none',
                              minWidth: 120,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #ff8533 0%, #ff6600 100%)',
                                boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Добавить еще изображения
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Кнопки управления */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="error" 
                      startIcon={<Delete />}
                      onClick={handleDelete}
                      disabled={loading}
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
                          color: '#666',
                          boxShadow: 'none',
                          transform: 'none'
                        }
                      }}
                    >
                      Удалить товар
                    </Button>
                    <Button 
                      onClick={onClose} 
                      variant="contained"
                      disabled={loading}
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
                          color: '#666',
                          boxShadow: 'none',
                          transform: 'none'
                        }
                      }}
                    >
                      Отмена
                    </Button>
                  </Box>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="medium"
                    disabled={loading}
                    sx={{ 
                      background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: 15,
                      px: 3,
                      py: 1.5,
                      height: 44,
                      textTransform: 'none',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      minWidth: 120,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: '#ccc',
                        color: '#666',
                        boxShadow: 'none',
                        transform: 'none'
                      }
                    }}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                </Box>
          </DialogContent>
        </form>
      </Dialog>
  );
}

export default EditProductModal; 