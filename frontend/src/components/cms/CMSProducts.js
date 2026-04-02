import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  Checkbox, 
  CircularProgress,
  Pagination,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  CloudUpload,
  Star,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { API_BASE_URL, getImageUrl } from '../../config';
import { searchInProductNames } from '../../utils/translationUtils';
import CustomSelect from '../CustomSelect';
import categoriesData from '../../categoriesData';

function CMSProducts({ mode, editModalOpen, setEditModalOpen, editingProduct, setEditingProduct, dbCategories }) {
    const { t } = useTranslation();
    const categories = dbCategories || categoriesData;
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [cmsSubcategories, setCmsSubcategories] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedProducts, setSelectedProducts] = React.useState([]);
    const [selectAll, setSelectAll] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [productsPerPage] = React.useState(20);
    const [colorPalette, setColorPalette] = React.useState([]);
    const [productColors, setProductColors] = React.useState([]);
    
    // Ссылка на форму для прокрутки
    const formRef = useRef(null);
    
    // Функция для получения названия категории
    const getCategoryName = (categoryValue) => {
      if (!categoryValue) return '';
      
      // Если это объект с полем name (из include)
      if (typeof categoryValue === 'object' && categoryValue.name) {
        return categoryValue.name;
      }
      
      // Если это ID, ищем по ID
      if (!isNaN(categoryValue)) {
        const category = categories.find(c => c.id === parseInt(categoryValue));
        return category ? category.name : categoryValue;
      }
      
      // Если это уже название, возвращаем как есть
      return categoryValue;
    };
    
    // Фильтрация товаров по поисковому запросу
    const filteredProducts = products.filter(product => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        searchInProductNames(product, searchQuery) ||
        product.article?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.country?.toLowerCase().includes(query) ||
        getCategoryName(product.category)?.toLowerCase().includes(query)
      );
    });
  
    // Пагинация
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
    // Сброс страницы при изменении поискового запроса
    React.useEffect(() => {
      setCurrentPage(1);
      setSelectedProducts([]); // Также сбрасываем выбранные товары
      setSelectAll(false);
    }, [searchQuery]);
  
    // Сброс выбранных товаров при смене страницы
    React.useEffect(() => {
      setSelectedProducts([]);
      setSelectAll(false);
    }, [currentPage]);

    // Прокрутка в начало страницы при переключении страниц
    React.useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);
  
  
  
    // Обработчики пагинации
    const handlePageChange = (event, value) => {
      setCurrentPage(value);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const [form, setForm] = React.useState({ 
      name: '', 
      nameHe: '',
      description: '', 
      descriptionHe: '',
      price: '', 
      category: '', 
      subcategory: '', 
      quantity: '', 
      image: '', 
      article: '', 
      brand: '', 
      country: '', 
      length: '', 
      width: '', 
      height: '',
      ageGroup: '',
      gender: ''
    });
  
  
  
  
  
    // Делаем функцию fetchProducts доступной глобально для обновления из основного приложения
    React.useEffect(() => {
      window.cmsProductsSetter = setProducts;
      return () => {
        delete window.cmsProductsSetter;
      };
    }, []);
  
    // Массив возрастных групп (как в EditProductModal)
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
  
  
  
    React.useEffect(() => {
      fetchProducts();
    }, []);

    // Загружаем палитру цветов
    React.useEffect(() => {
      fetch(`${API_BASE_URL}/api/color-palette`)
        .then(res => res.json())
        .then(data => {
          setColorPalette(data);
        })
        .catch(error => {
          console.error('Ошибка загрузки палитры цветов:', error);
        });
    }, []);
  
    // Загружаем подкатегории при изменении категории
    React.useEffect(() => {
      if (form.category) {
        fetch(`${API_BASE_URL}/api/categories?parentId=${form.category}`)
          .then(res => res.json())
          .then(data => {
            setCmsSubcategories(data);
          })
          .catch(error => {
            console.error('Error loading subcategories:', error);
            setCmsSubcategories([]);
          });
      } else {
        setCmsSubcategories([]);
      }
    }, [form.category]);
  
    React.useEffect(() => {
      if (editingProduct) {
        setForm(editingProduct);
        setProductColors([]); // Сброс цветов (они будут загружены из editingProduct через EditProductModal)
      } else {
        setForm({ 
          name: '', 
          nameHe: '',
          description: '', 
          descriptionHe: '',
          price: '', 
          category: '', 
          subcategory: '', 
          quantity: '', 
          article: '', 
          brand: '', 
          country: '', 
          length: '', 
          width: '', 
          height: '', 
          ageGroup: '',
          gender: '',
          images: [], 
          mainImageIndex: undefined 
        });
        setProductColors([]); // Сброс цветов при создании нового товара
      }
    }, [editingProduct]);
  
    // Очистка URL объектов при размонтировании
    React.useEffect(() => {
      return () => {
        if (form.images) {
          Array.from(form.images).forEach(file => {
            URL.revokeObjectURL(URL.createObjectURL(file));
          });
        }
      };
    }, [form.images]);
  
  
  
    const handleOpenEdit = (product) => {
      // Добавляем callback функции к продукту
      const productWithCallbacks = {
        ...product,
        onSaveCallback: fetchProducts,
        onDeleteCallback: fetchProducts
      };
      setEditingProduct(productWithCallbacks);
      setEditModalOpen(true);
    };
  
    const handleCloseEdit = () => {
      setEditingProduct(null);
      setEditModalOpen(false);
    };
    
    // Простые обработчики как в форме категорий
    const handleChange = e => {
      const { name, value, files } = e.target;
      if (name === 'images') {
        const newFiles = Array.from(files);
        setForm(f => {
          const currentImages = f.images || [];
          // Фильтруем только новые файлы, исключая дубликаты
          const uniqueNewFiles = newFiles.filter(newFile => 
            !currentImages.some(existingFile => 
              existingFile.name === newFile.name && 
              existingFile.size === newFile.size &&
              existingFile.lastModified === newFile.lastModified
            )
          );
          return {
            ...f, 
            images: [...currentImages, ...uniqueNewFiles],
            // Если это первое изображение, делаем его главным
            mainImageIndex: f.mainImageIndex === undefined && currentImages.length === 0 ? 0 : f.mainImageIndex
          };
        });
      } else {
        setForm(f => ({ ...f, [name]: value }));
      }
    };
  
    const handleCategoryChange = e => {
      setForm(prev => ({ ...prev, category: e.target.value, subcategory: '' }));
    };

    // Функции для управления цветами
    const handleAddColor = (color) => {
      if (!productColors.some(c => c.colorId === color.id)) {
        setProductColors([...productColors, {
          colorId: color.id,
          imageIndex: null // Храним индекс, а не URL
        }]);
      }
    };

    const handleRemoveColor = (colorId) => {
      setProductColors(productColors.filter(c => c.colorId !== colorId));
    };

    const handleColorImageChange = (colorId, imageIndex) => {
      setProductColors(productColors.map(c => 
        c.colorId === colorId ? { ...c, imageIndex: imageIndex === '' ? null : parseInt(imageIndex) } : c
      ));
    };
  
    const handleSubmit = async e => {
      e.preventDefault();
      if (!form.name || !form.price) return;
  
      try {
        const formData = new FormData();
        
        // Добавляем все поля формы
        Object.keys(form).forEach(key => {
          if (form[key] !== '' && key !== 'images' && key !== 'mainImageIndex') {
            formData.append(key, form[key]);
          }
        });
        
        // Добавляем изображения
        if (form.images) {
          form.images.forEach((image, index) => {
            formData.append('images', image);
            // Если это главное изображение, добавляем специальный флаг
            if (index === form.mainImageIndex) {
              formData.append('mainImageIndex', index);
            }
          });
        }
  
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}` },
          body: formData
        });
  
        if (response.ok) {
          // Очищаем форму
          setForm({ 
            name: '', 
            nameHe: '',
            description: '', 
            descriptionHe: '',
            price: '', 
            category: '', 
            subcategory: '', 
            quantity: '', 
            article: '', 
            brand: '', 
            country: '', 
            length: '', 
            width: '', 
            height: '', 
            ageGroup: '',
            gender: '',
            images: [], 
            mainImageIndex: undefined 
          });
          setProductColors([]); // Очищаем выбранные цвета
          // Перезагружаем товары с сервера
          fetchProducts();
      } else {
          console.error('Ошибка сохранения товара');
        }
      } catch (error) {
        console.error('Ошибка сохранения товара:', error);
      }
    };
  
    // Функция загрузки товаров с сервера
    const fetchProducts = async () => {
      console.log('📦 CMS: fetchProducts called', { timestamp: new Date().toISOString() });
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('📦 CMS: User for fetchProducts', {
          userExists: !!user,
          hasToken: !!user?.token,
          userRole: user?.role
        });
        
        const response = await fetch(`${API_BASE_URL}/api/products?admin=true&_t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        console.log('📦 CMS: fetchProducts response', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.ok) {
          const data = await response.json();
          // Фильтруем undefined/null продукты
          const validProducts = Array.isArray(data) ? data.filter(product => product && product.id) : [];
          console.log('📦 CMS: Products loaded', {
            count: validProducts.length,
            products: validProducts.map(p => ({ id: p.id, name: p.name, isHidden: p.isHidden }))
          });
          setProducts(validProducts);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ CMS: Error loading products:', errorData);
        }
      } catch (error) {
        console.error('❌ CMS: Exception loading products:', error);
      } finally {
        setLoading(false);
        console.log('📦 CMS: fetchProducts completed');
      }
    };
  
    const handleDelete = async (id) => {
      console.log('🗑️ CMS: handleDelete called', { productId: id, timestamp: new Date().toISOString() });
      
      // Проверяем, есть ли токен
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('🗑️ CMS: User check', { 
        userExists: !!user, 
        hasToken: !!user?.token,
        userRole: user?.role,
        userEmail: user?.email
      });
      
      if (!user || !user.token) {
        console.log('❌ CMS: No user or token found');
        alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
        return;
      }
  
      // Убираем подтверждение - делаем в один клик
      console.log('🗑️ CMS: Starting deletion without confirmation');
  
      try {
        console.log('🗑️ CMS: Starting product existence check');
        // Сначала проверим, существует ли товар (включая скрытые для админа)
        const checkResponse = await fetch(`${API_BASE_URL}/api/products/${id}?admin=true`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🗑️ CMS: Product check response', {
          status: checkResponse.status,
          statusText: checkResponse.statusText,
          ok: checkResponse.ok
        });
        
        if (!checkResponse.ok) {
          console.log('❌ CMS: Product not found or no access rights');
          // Убираем alert - ошибки только в консоли
          return;
        }
        
        console.log('🗑️ CMS: Product exists, proceeding with deletion');
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
  
        console.log('🗑️ CMS: Delete response', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
  
        if (response.ok) {
          console.log('✅ CMS: Product deleted successfully');
          console.log('🗑️ CMS: Refreshing products list');
          fetchProducts();
          // Обновляем все состояния товаров в приложении
          if (window.refreshAllProducts) {
            console.log('🗑️ CMS: Calling global refresh function');
            window.refreshAllProducts();
          }
        } else {
          let errorMessage = 'Неизвестная ошибка';
          try {
            const errorData = await response.json();
            console.error('❌ CMS: Server error response:', errorData);
            errorMessage = errorData.error || errorData.message || 'Неизвестная ошибка';
          } catch (parseError) {
            console.error('❌ CMS: Error parsing server response:', parseError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          console.log('❌ CMS: Error occurred:', errorMessage);
          // Убираем alert - ошибки только в консоли
        }
      } catch (error) {
        console.error('❌ CMS: Exception during deletion:', error);
        // Убираем alert - ошибки только в консоли
      }
    };
  
    const handleToggleHidden = async (product) => {
      console.log('👁️ CMS: handleToggleHidden called', { 
        productId: product.id, 
        productName: product.name,
        currentHidden: product.isHidden,
        timestamp: new Date().toISOString()
      });
      
      try {
        const newHiddenValue = !product.isHidden;
        const action = newHiddenValue ? 'скрыть' : 'показать';
        
        console.log('👁️ CMS: Toggle details', {
          currentValue: product.isHidden,
          newValue: newHiddenValue,
          action: action
        });
        
        // Убираем подтверждение - делаем в один клик
        console.log('👁️ CMS: Changing visibility without confirmation');
        
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('👁️ CMS: User token check', {
          userExists: !!user,
          hasToken: !!user?.token,
          userRole: user?.role
        });
        
        const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/hidden`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ isHidden: newHiddenValue })
        });
        
        console.log('👁️ CMS: Toggle response', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.ok) {
          console.log('✅ CMS: Product visibility changed successfully');
          console.log('👁️ CMS: Refreshing products list');
          
          // Принудительно обновляем состояние товара в локальном списке
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === product.id 
                ? { ...p, isHidden: newHiddenValue }
                : p
            )
          );
          
          // Также обновляем список с сервера
          fetchProducts();
          
          // Обновляем все состояния товаров в приложении
          if (window.refreshAllProducts) {
            console.log('👁️ CMS: Calling global refresh function');
            window.refreshAllProducts();
          }
        } else {
          let errorMessage = 'Неизвестная ошибка';
          try {
            const errorData = await response.json();
            console.error('❌ CMS: Server error response:', errorData);
            errorMessage = errorData.error || errorData.message || 'Неизвестная ошибка';
          } catch (parseError) {
            console.error('❌ CMS: Error parsing server response:', parseError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          console.log('❌ CMS: Error occurred:', errorMessage);
          // Убираем alert - ошибки только в консоли
        }
      } catch (error) {
        console.error('❌ CMS: Exception during visibility toggle:', error);
        // Убираем alert - ошибки только в консоли
      }
    };
  
    const handleSave = async () => {
      if (!form.name || !form.price) return;
  
      try {
        const formData = new FormData();
        
        // Добавляем все поля формы
        Object.keys(form).forEach(key => {
          if (form[key] !== '' && key !== 'images' && key !== 'mainImageIndex') {
            formData.append(key, form[key]);
          }
        });
        
        // Определяем язык ввода на основе содержимого полей
        const detectInputLanguage = (text) => {
          if (!text) return 'ru';
          // Простая эвристика для определения языка
          const hebrewPattern = /[\u0590-\u05FF]/; // Диапазон символов иврита
          return hebrewPattern.test(text) ? 'he' : 'ru';
        };
        
        const nameLanguage = detectInputLanguage(form.name);
        const descriptionLanguage = detectInputLanguage(form.description);
        const inputLanguage = nameLanguage === 'he' || descriptionLanguage === 'he' ? 'he' : 'ru';
        
        // Добавляем язык ввода для автоматического перевода
        formData.append('inputLanguage', inputLanguage);

        // Добавляем цветовые варианты
        if (productColors && productColors.length > 0) {
          formData.append('availableColors', JSON.stringify(productColors));
        }
        
        // Добавляем изображения
        if (form.images) {
          form.images.forEach((image, index) => {
            formData.append('images', image);
            // Если это главное изображение, добавляем специальный флаг
            if (index === form.mainImageIndex) {
              formData.append('mainImageIndex', index);
            }
          });
        }
  
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}` },
          body: formData
        });
  
        if (response.ok) {
          // Очищаем форму
          setForm({ 
            name: '', 
            nameHe: '',
            description: '', 
            descriptionHe: '',
            price: '', 
            category: '', 
            subcategory: '', 
            quantity: '', 
            article: '', 
            brand: '', 
            country: '', 
            length: '', 
            width: '', 
            height: '', 
            ageGroup: '',
            gender: '',
            images: [], 
            mainImageIndex: undefined 
          });
          setProductColors([]); // Очищаем выбранные цвета
          
          // Прокручиваем в начало формы
          if (formRef.current) {
            formRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
          
          // Перезагружаем товары с сервера
          fetchProducts();
          // Обновляем все состояния товаров в приложении
          if (window.refreshAllProducts) {
            window.refreshAllProducts();
          }
        } else {
          console.error('Ошибка сохранения товара');
        }
      } catch (error) {
        console.error('Ошибка сохранения товара:', error);
      }
    };
  
    const handleClear = () => {
      // Очищаем URL объекты перед очисткой формы
      if (form.images) {
        Array.from(form.images).forEach(file => {
          URL.revokeObjectURL(URL.createObjectURL(file));
        });
      }
      setForm({ name: '', nameHe: '', description: '', descriptionHe: '', price: '', category: '', subcategory: '', quantity: '', article: '', brand: '', country: '', length: '', width: '', height: '', images: [], mainImageIndex: undefined });
      
      // Прокручиваем в начало формы
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    };
  
    // Функции для мультивыбора
    const handleSelectProduct = (productId) => {
      setSelectedProducts(prev => {
        if (prev.includes(productId)) {
          return prev.filter(id => id !== productId);
        } else {
          return [...prev, productId];
        }
      });
    };
  
    const handleSelectAll = () => {
      if (selectAll) {
        setSelectedProducts([]);
        setSelectAll(false);
      } else {
        setSelectedProducts(currentProducts.map(p => p.id));
        setSelectAll(true);
      }
    };
  
    // Обновляем состояние selectAll при изменении выбранных товаров
    React.useEffect(() => {
      if (currentProducts.length > 0) {
        const allSelected = currentProducts.every(p => selectedProducts.includes(p.id));
        const someSelected = currentProducts.some(p => selectedProducts.includes(p.id));
        
        if (allSelected) {
          setSelectAll(true);
        } else if (someSelected) {
          setSelectAll(false);
        } else {
          setSelectAll(false);
        }
      } else {
        setSelectAll(false);
      }
    }, [selectedProducts, currentProducts]);
  
    const handleBulkDelete = async () => {
      if (selectedProducts.length === 0) return;
      
      if (!window.confirm(`Вы уверены, что хотите удалить ${selectedProducts.length} товаров? Это действие нельзя отменить.`)) {
        return;
      }
  
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
        return;
      }
  
      try {
        const deletePromises = selectedProducts.map(productId =>
          fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          })
        );
  
        const results = await Promise.allSettled(deletePromises);
        const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
        const failed = results.length - successful;
  
        if (failed > 0) {
          alert(`Удалено ${successful} товаров. Не удалось удалить ${failed} товаров.`);
        } else {
          alert(`Успешно удалено ${successful} товаров.`);
        }
  
        setSelectedProducts([]);
        setSelectAll(false);
        fetchProducts();
        // Обновляем все состояния товаров в приложении
        if (window.refreshAllProducts) {
          window.refreshAllProducts();
        }
      } catch (error) {
        console.error('Ошибка массового удаления:', error);
        alert('Ошибка при массовом удалении товаров.');
      }
    };
  
    const handleBulkToggleHidden = async (hide) => {
      if (selectedProducts.length === 0) return;
      
      const action = hide ? 'скрыть' : 'показать';
      if (!window.confirm(`Вы уверены, что хотите ${action} ${selectedProducts.length} товаров?`)) {
        return;
      }
  
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
        return;
      }
  
      try {
        const togglePromises = selectedProducts.map(productId =>
          fetch(`${API_BASE_URL}/api/products/${productId}/hidden`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ isHidden: hide })
          })
        );
  
        const results = await Promise.allSettled(togglePromises);
        const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
        const failed = results.length - successful;
  
        if (failed > 0) {
          alert(`${action.charAt(0).toUpperCase() + action.slice(1)} ${successful} товаров. Не удалось ${action} ${failed} товаров.`);
        } else {
          alert(`Успешно ${action} ${successful} товаров.`);
        }
  
        setSelectedProducts([]);
        setSelectAll(false);
        fetchProducts();
        // Обновляем все состояния товаров в приложении
        if (window.refreshAllProducts) {
          window.refreshAllProducts();
        }
      } catch (error) {
        console.error(`Ошибка массового ${action} товаров:`, error);
        alert(`Ошибка при массовом ${action} товаров.`);
      }
    };
  
  
  
    // Очищаем выбранные товары при изменении поискового запроса
    React.useEffect(() => {
      setSelectedProducts([]);
      setSelectAll(false);
    }, [searchQuery]);
  
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }
  
  
  
    // Компонент таблицы
    const ProductList = () => {
      const [imageErrors, setImageErrors] = useState({});
  
      const handleImageError = (productId) => {
        setImageErrors(prev => ({ ...prev, [productId]: true }));
      };
  
      return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, border: '1px solid #eee', width: '50px', textAlign: 'center' }} title="Выбрать все">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAll}
                      size="small"
                      sx={{ padding: 0 }}
                    />
                    {selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length && (
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                        {selectedProducts.length}
                      </Typography>
                    )}
                  </Box>
                </th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Картинка</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '200px' }}>Название</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Цена</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '120px' }}>Категория</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '120px' }}>Подкатегория</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Кол-во</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '100px' }}>Артикул</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '80px' }}>Статус</th>
                <th style={{ padding: 8, border: '1px solid #eee', width: '120px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                    <Checkbox
                      checked={selectedProducts.includes(p.id)}
                      onChange={() => handleSelectProduct(p.id)}
                      size="small"
                      sx={{ padding: 0 }}
                    />
                  </td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                    {p.imageUrls && p.imageUrls.length > 0 && !imageErrors[p.id] ? (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          backgroundImage: `url(${getImageUrl(p.imageUrls[0])})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: '#f0f0f0',
                          margin: '0 auto'
                        }}
                        onError={(e) => {
                          e.target.style.backgroundImage = 'url(/photography.jpg)';
                          handleImageError(p.id);
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          backgroundImage: 'url(/photography.jpg)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: '#f0f0f0',
                          margin: '0 auto'
                        }}
                      />
                    )}
                  </td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word', wordBreak: 'break-word', maxWidth: '200px' }}>{p.nameHe || p.name}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>₪{p.price}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{getCategoryName(p.category)}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{p.subcategory?.name || p.subcategory || ''}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{p.quantity}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>{p.article}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                    {p.isHidden ? (
                      <span style={{ color: '#f57c00', fontWeight: 'bold' }}>Скрыт</span>
                    ) : (
                      <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Видим</span>
                    )}
                  </td>
                  <td style={{ padding: 8, border: '1px solid #eee', whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenEdit(p)} 
                          sx={{ 
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#e3f2fd'
                            }
                          }}
                          title="Редактировать"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            handleDelete(p.id);
                          }}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: '#ffebee'
                            }
                          }}
                          title="Удалить"
                        >
                          <Delete />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleHidden(p)}
                          sx={{ 
                            color: p.isHidden ? '#4caf50' : '#ff9800',
                            '&:hover': {
                              backgroundColor: p.isHidden ? '#e8f5e8' : '#fff3e0'
                            }
                          }}
                          title={p.isHidden ? 'Показать' : 'Скрыть'}
                        >
                          {p.isHidden ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    minWidth: 40,
                    height: 40,
                    margin: '0 2px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  },
                  '& .MuiPaginationItem-page': {
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    color: '#333',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  '& .Mui-selected': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important',
                    color: '#fff !important',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%) !important',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    },
                  },
                  '& .MuiPaginationItem-previousNext': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    },
                    '&.Mui-disabled': {
                      background: '#e0e0e0',
                      color: '#999',
                      boxShadow: 'none',
                    },
                  },
                  '& .MuiPaginationItem-firstLast': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    },
                    '&.Mui-disabled': {
                      background: '#e0e0e0',
                      color: '#999',
                      boxShadow: 'none',
                    },
                  },
                }}
              />
            </Box>
          )}
          
          {/* Информация о страницах */}
          <Box sx={{ textAlign: 'center', mt: 2, mb: 2, color: 'text.secondary' }}>
            <Typography variant="body2">
              Показано {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} из {filteredProducts.length} товаров
            </Typography>
          </Box>
        </Box>
      );
    };
    // Выбор отображения
    if (mode === 'add') {
      return (
        <Box sx={{ width: '100%', maxWidth: 840, background: '#fff', p: 3, borderRadius: 3, boxShadow: 2, mb: 4, mt: 4, mx: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Добавить товар
          </Typography>
          
  
          
          <Box component="form" ref={formRef} onSubmit={async (e) => { e.preventDefault(); await handleSave(); }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Название (русский)" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              fullWidth 
              required 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Название (иврит)" 
              name="nameHe" 
              value={form.nameHe} 
              onChange={handleChange} 
              fullWidth 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Описание (русский)" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              fullWidth 
              multiline 
              minRows={2} 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Описание (иврит)" 
              name="descriptionHe" 
              value={form.descriptionHe} 
              onChange={handleChange} 
              fullWidth 
              multiline 
              minRows={2} 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Цена" 
              name="price" 
              value={form.price} 
              onChange={handleChange} 
              type="number" 
              fullWidth 
              required 
              variant="outlined"
              size="medium"
            />
            <CustomSelect
              label="Категория"
              value={form.category || ''}
              onChange={(value) => handleCategoryChange({ target: { name: 'category', value } })}
              options={[
                ...categories.filter(c => !c.parentId).map(c => ({ value: c.id, label: c.name }))
              ]}
              width="100%"
              sx={{ width: '100%' }}
            />
            <CustomSelect
              label="Подкатегория"
              value={form.subcategory || ''}
              onChange={(value) => handleChange({ target: { name: 'subcategory', value } })}
              options={[
                ...cmsSubcategories.map(sub => ({ value: sub.id, label: sub.name }))
              ]}
              width="100%"
              sx={{ 
                width: '100%',
                opacity: !form.category ? 0.38 : 1
              }}
              disabled={!form.category}
            />
            {/* Добавлено: возрастная группа и пол */}
            <CustomSelect
              label="Возрастная группа"
              value={form.ageGroup || ''}
              onChange={(value) => handleChange({ target: { name: 'ageGroup', value } })}
              options={[
                ...ageGroups.map(age => ({ value: age, label: age }))
              ]}
              width="100%"
              sx={{ width: '100%' }}
            />
            <CustomSelect
              label="Пол"
              value={form.gender || ''}
              onChange={(value) => handleChange({ target: { name: 'gender', value } })}
              options={[
                { value: 'Для мальчиков', label: 'Для мальчиков' },
                { value: 'Для девочек', label: 'Для девочек' },
                { value: 'Универсальный', label: 'Универсальный' }
              ]}
              width="100%"
              sx={{ width: '100%' }}
            />
            <TextField 
              label="Количество" 
              name="quantity" 
              value={form.quantity} 
              onChange={handleChange} 
              type="number" 
              fullWidth 
              required 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Артикул" 
              name="article" 
              value={form.article} 
              onChange={handleChange} 
              fullWidth 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Бренд" 
              name="brand" 
              value={form.brand} 
              onChange={handleChange} 
              fullWidth 
              variant="outlined"
              size="medium"
            />
            <TextField 
              label="Страна" 
              name="country" 
              value={form.country} 
              onChange={handleChange} 
              fullWidth 
              variant="outlined"
              size="medium"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Длина (см)" 
                name="length" 
                value={form.length} 
                onChange={handleChange} 
                type="number" 
                fullWidth 
                variant="outlined"
                size="medium"
              />
              <TextField 
                label="Ширина (см)" 
                name="width" 
                value={form.width} 
                onChange={handleChange} 
                type="number" 
                fullWidth 
                variant="outlined"
                size="medium"
              />
              <TextField 
                label="Высота (см)" 
                name="height" 
                value={form.height} 
                onChange={handleChange} 
                type="number" 
                fullWidth 
                variant="outlined"
                size="medium"
              />
            </Box>
            
            {/* Секция цветовых вариантов */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                🎨 Цветовые варианты товара
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                  Выберите доступные цвета:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {colorPalette.map((color) => {
                    const isSelected = productColors.some(c => c.colorId === color.id);
                    return (
                      <Box
                        key={color.id}
                        onClick={() => isSelected ? handleRemoveColor(color.id) : handleAddColor(color)}
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                          padding: 1,
                          borderRadius: 2,
                          border: isSelected ? '2px solid #4ECDC4' : '2px solid #e0e0e0',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#4ECDC4',
                            boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            background: color.hex === 'multicolor' 
                              ? 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)'
                              : color.hex,
                            border: '1px solid #ddd'
                          }}
                        />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', textAlign: 'center' }}>
                          {color.nameRu}
                        </Typography>
                        {isSelected && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              background: '#4ECDC4',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            ✓
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {productColors.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    Привяжите изображения к цветам (опционально):
                  </Typography>
                  {productColors.map((productColor) => {
                    const paletteColor = colorPalette.find(c => c.id === productColor.colorId);
                    if (!paletteColor) return null;

                    // Получаем список доступных изображений из формы
                    const availableImages = form.images ? form.images.map((img, idx) => ({
                      value: idx.toString(), // Используем индекс как значение
                      label: `Изображение ${idx + 1}`,
                      preview: URL.createObjectURL(img) // URL только для preview
                    })) : [];

                    return (
                      <Box key={productColor.colorId} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            background: paletteColor.hex === 'multicolor' 
                              ? 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)'
                              : paletteColor.hex,
                            border: '1px solid #ddd'
                          }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                          {paletteColor.nameRu}:
                        </Typography>
                        {availableImages.length > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CustomSelect
                              label="Изображение"
                              value={productColor.imageIndex !== null ? productColor.imageIndex.toString() : ''}
                              onChange={(value) => handleColorImageChange(productColor.colorId, value)}
                              options={[
                                { value: '', label: 'Не выбрано' },
                                ...availableImages
                              ]}
                              width="200px"
                            />
                            {productColor.imageIndex !== null && availableImages[productColor.imageIndex] && (
                              <Box
                                component="img"
                                src={availableImages[productColor.imageIndex].preview}
                                sx={{
                                  width: 50,
                                  height: 50,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: '1px solid #ddd'
                                }}
                                alt="Preview"
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                            Добавьте изображения товара ниже
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
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
                    const currentImages = form.images || [];
                    // Фильтруем только новые файлы, исключая дубликаты
                    const newFiles = files.filter(newFile => 
                      !currentImages.some(existingFile => 
                        existingFile.name === newFile.name && 
                        existingFile.size === newFile.size &&
                        existingFile.lastModified === newFile.lastModified
                      )
                    );
                    if (newFiles.length > 0) {
                      const newImages = [...currentImages, ...newFiles];
                      setForm(prev => ({ 
                        ...prev, 
                        images: newImages,
                        // Если это первое изображение, делаем его главным
                        mainImageIndex: prev.mainImageIndex === undefined ? 0 : prev.mainImageIndex
                      }));
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
                  onChange={handleChange}
                />
          </Box>
              
              {form.images && form.images.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ mb: 2, fontSize: 14, color: '#666', fontWeight: 'bold' }}>
                    Выбрано изображений: {form.images.length}
                    {form.mainImageIndex !== undefined && (
                      <span style={{ color: '#FFB300', marginLeft: 8 }}>
                        • Главное изображение: {form.mainImageIndex + 1}
                      </span>
                    )}
                  </Typography>
                  <Box 
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
                      msUserSelect: 'none'
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
                        const currentImages = form.images || [];
                        // Фильтруем только новые файлы, исключая дубликаты
                        const newFiles = files.filter(newFile => 
                          !currentImages.some(existingFile => 
                            existingFile.name === newFile.name && 
                            existingFile.size === newFile.size &&
                            existingFile.lastModified === newFile.lastModified
                          )
                        );
                        if (newFiles.length > 0) {
                          const newImages = [...currentImages, ...newFiles];
                          setForm(prev => ({ 
                            ...prev, 
                            images: newImages,
                            // Если это первое изображение, делаем его главным
                            mainImageIndex: prev.mainImageIndex === undefined ? 0 : prev.mainImageIndex
                          }));
                        }
                      }
                    }}
                    onDragStart={(e) => {
                      // Предотвращаем перетаскивание контейнера
                      e.preventDefault();
                      return false;
                    }}
                  >
                    {Array.from(form.images).map((file, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                        onDragStart={(e) => {
                          // Предотвращаем перетаскивание контейнера изображения
                          e.preventDefault();
                          return false;
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
                            border: form.mainImageIndex === index ? '3px solid #FFB300' : '2px solid #e0e0e0',
                            cursor: 'pointer',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onError={(e) => {
                            e.target.src = '/toys.png';
                            e.target.onerror = null;
                          }}
                          onClick={() => {
                            // При клике на изображение делаем его главным
                            setForm(prev => ({ ...prev, mainImageIndex: index }));
                          }}
                          onDragStart={(e) => {
                            // Предотвращаем перетаскивание изображений
                            e.preventDefault();
                            return false;
                          }}
                          draggable={false}
                        />
                        {/* Звездочка для главного изображения */}
                        {form.mainImageIndex === index && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              left: -8,
                              background: '#FFB300',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 3,
                              boxShadow: '0 2px 8px rgba(255,179,0,0.3)',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' }
                              }
                            }}
                            title="Главное изображение"
                          >
                            <Star sx={{ fontSize: 14, color: '#fff' }} />
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
                          onClick={() => {
                            const newImages = Array.from(form.images).filter((_, i) => i !== index);
                            setForm(prev => ({ 
                              ...prev, 
                              images: newImages,
                              // Если удаляем главное изображение, сбрасываем индекс
                              mainImageIndex: prev.mainImageIndex === index ? undefined : 
                                             prev.mainImageIndex > index ? prev.mainImageIndex - 1 : prev.mainImageIndex
                            }));
                          }}
                        >
                          <CloseIcon fontSize="small" sx={{ color: '#e57373' }} />
                        </IconButton>
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 0.5, 
                          color: form.mainImageIndex === index ? '#FFB300' : '#666',
                          fontSize: '0.7rem',
                          fontWeight: form.mainImageIndex === index ? 'bold' : 'normal'
                        }}>
                          {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => document.getElementById('image-upload').click()}
                      startIcon={<AddIcon />}
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
                      Добавить еще изображения
                    </Button>
                    {form.mainImageIndex !== undefined && (
                      <Button 
                        variant="outlined" 
                        onClick={() => setForm(prev => ({ ...prev, mainImageIndex: undefined }))}
                        startIcon={<Star />}
                        sx={{
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 15,
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          border: '1px solid #ff9800',
                          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                          minWidth: 120,
                          height: 44,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            background: '#ccc',
                            color: '#666',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        Сбросить главное
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={handleClear} 
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  border: '1px solid #e53e3e',
                  boxShadow: '0 2px 8px rgba(229, 62, 62, 0.3)',
                  minWidth: 120,
                  height: 44,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c53030 0%, #a52a2a 100%)',
                    boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666',
                    boxShadow: 'none'
                  }
                }}
              >
                Очистить форму
              </Button>
            </Box>
            <Button 
              type="submit" 
              variant="contained" 
              size="medium"
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
              Сохранить товар
            </Button>
          </Box>
          </Box>
        </Box>
    );
    }
    if (mode === 'list') {
      return (
        <Box sx={{ width: '100%' }}>
          {/* Поисковая строка */}
          <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}>
            <TextField
              fullWidth
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />
            {searchQuery && (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Найдено товаров: {filteredProducts.length} из {products.length}
              </Typography>
            )}
          </Box>
  
          {/* Статистика товаров */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e9ecef' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#495057' }}>
              Статистика товаров (Всего: {products.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                  {products.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Всего товаров
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                  {products.filter(product => product.quantity > 0).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  В наличии
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffc107' }}>
                  {products.filter(product => product.quantity === 0).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Нет в наличии
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc3545' }}>
                  {products.filter(product => product.isHidden).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Скрытые
                </Typography>
              </Box>
  
            </Box>
          </Box>
  
          {/* Панель массовых действий */}
          {selectedProducts.length > 0 && (
            <Box sx={{ mb: 2, p: 2, background: '#e3f2fd', borderRadius: 2, border: '1px solid #1976d2' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Выбрано товаров: {selectedProducts.length}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleBulkToggleHidden(false)}
                  startIcon={<Visibility />}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 14,
                    px: 2,
                    py: 1,
                    height: 36,
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    textTransform: 'none',
                    minWidth: 120,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  Показать все
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleBulkToggleHidden(true)}
                  startIcon={<VisibilityOff />}
                  sx={{
                    background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 14,
                    px: 2,
                    py: 1,
                    height: 36,
                    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                    textTransform: 'none',
                    minWidth: 120,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  Скрыть все
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBulkDelete}
                  startIcon={<Delete />}
                  sx={{
                    background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 14,
                    px: 2,
                    py: 1,
                    height: 36,
                    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                    textTransform: 'none',
                    minWidth: 120,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ef5350 0%, #f44336 100%)',
                      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  Удалить все
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setSelectedProducts([]);
                    setSelectAll(false);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 14,
                    px: 2,
                    py: 1,
                    height: 36,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textTransform: 'none',
                    minWidth: 120,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Отменить выбор
                </Button>
              </Box>
            </Box>
          )}
          
          <ProductList />
        </Box>
      );
    }
    return null;
}

export default CMSProducts;