import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config';
import * as XLSX from 'xlsx';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  CloudUpload,
  FileDownload,
  CheckCircle,
  Error,
  Warning,
  Download
} from '@mui/icons-material';

const BulkImportProducts = ({ categories = [] }) => {
  const fileInputRef = useRef(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, errors: 0, skipped: 0 });
  const [currentProduct, setCurrentProduct] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);
  const [skippedDetails, setSkippedDetails] = useState([]);
  
  // Настройки маппинга полей
  const [fieldMapping, setFieldMapping] = useState({
    nameHe: '',
    name: '',
    article: '',
    quantity: '',
    price: ''
  });

  const steps = [
    'Загрузка файла',
    'Настройка полей',
    'Предварительный просмотр',
    'Импорт товаров'
  ];

  // Обработка загрузки файла
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let jsonData;
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Обработка CSV файла
          const csvText = e.target.result;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          jsonData = [headers];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              jsonData.push(values);
            }
          }
        } else {
          // Обработка Excel файла
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        if (jsonData.length < 2) {
          setError('Файл должен содержать заголовки и хотя бы одну строку данных');
          return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

        const parsed = rows.map((row, index) => {
          const obj = {};
          headers.forEach((header, colIndex) => {
            obj[header] = row[colIndex] || '';
          });
          obj._rowIndex = index + 2; // +2 потому что начинаем с 1 и пропускаем заголовок
          return obj;
        });

        setParsedData(parsed);
        
        // Автоматическое определение маппинга полей
        const autoMapping = {};
        headers.forEach(header => {
          const headerLower = header.toLowerCase();
          if (headerLower.includes('название') || headerLower.includes('name')) {
            if (headerLower.includes('иврит') || headerLower.includes('hebrew') || headerLower.includes('he')) {
              autoMapping.nameHe = header;
            } else if (headerLower.includes('русский') || headerLower.includes('russian') || headerLower.includes('ru')) {
              autoMapping.name = header;
            }
          } else if (headerLower.includes('баркод') || headerLower.includes('артикул') || headerLower.includes('barcode') || headerLower.includes('article')) {
            autoMapping.article = header;
          } else if (headerLower.includes('количество') || headerLower.includes('quantity')) {
            autoMapping.quantity = header;
          } else if (headerLower.includes('цена') || headerLower.includes('price')) {
            autoMapping.price = header;
          }
        });
        
        setFieldMapping(autoMapping);
        setActiveStep(1);
      } catch (err) {
        setError('Ошибка при чтении файла: ' + err.message);
      }
    };
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Обработка изменения маппинга полей
  const handleFieldMappingChange = (field, value) => {
    setFieldMapping(prev => ({ ...prev, [field]: value }));
  };

  // Предварительный просмотр данных
  const handlePreview = () => {
    if (!fieldMapping.nameHe || !fieldMapping.name || !fieldMapping.price) {
      setError('Необходимо указать маппинг для названий (иврит и русский) и цены');
      return;
    }

    const mapped = parsedData.map(row => ({
      name: row[fieldMapping.name] || '',
      nameHe: row[fieldMapping.nameHe] || '',
      article: row[fieldMapping.article] || '',
      quantity: parseInt(row[fieldMapping.quantity]) || 0,
      price: parseFloat(row[fieldMapping.price]) || 0,
      _rowIndex: row._rowIndex,
      _originalRow: row
    }));

    setMappedData(mapped);
    setActiveStep(2);
  };

  // Импорт товаров
  const handleImport = async () => {
    console.log('🚀 Начинаем импорт товаров...');
    console.log('📊 Данные для импорта:', mappedData);
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
    
    setLoading(true);
    setError('');
    setSuccess('');
         setImportProgress(0);
     setImportResults({ success: 0, errors: 0, skipped: 0 });
     setErrorDetails([]);
     setSkippedDetails([]);
     setActiveStep(3); // Сразу переходим к экрану результатов
     setSuccess('Импорт начался...'); // Уведомляем о начале импорта

    const user = JSON.parse(localStorage.getItem('user'));
    console.log('👤 Пользователь:', user ? 'Авторизован' : 'Не авторизован');
    console.log('👤 Роль пользователя:', user?.role);
    
    if (!user || !user.token) {
      setError('Ошибка авторизации');
      setLoading(false);
      return;
    }
    
    if (user.role !== 'admin') {
      setError('Доступ запрещен: только для администратора');
      setLoading(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    console.log(`🔄 Начинаем импорт ${mappedData.length} товаров...`);
    
    if (mappedData.length === 0) {
      console.log('❌ Нет данных для импорта');
      setError('Нет данных для импорта');
      setLoading(false);
      return;
    }
    
    for (let i = 0; i < mappedData.length; i++) {
             const product = mappedData[i];
       console.log(`📦 Обрабатываем товар ${i + 1}/${mappedData.length}:`, product);
       setCurrentProduct(`${i + 1}/${mappedData.length}: ${product.name}`);
      
      try {
                 // Проверяем обязательные поля
         if (!product.nameHe || !product.name || !product.price) {
           const errorReason = !product.nameHe && !product.name && !product.price ? 'Отсутствуют названия и цена' :
                              !product.nameHe && !product.name ? 'Отсутствуют названия' : 
                              !product.nameHe ? 'Отсутствует ивритское название' :
                              !product.name ? 'Отсутствует русское название' : 'Отсутствует цена';
           console.log(`❌ Товар ${i + 1} пропущен: ${errorReason}`);
           setErrorDetails(prev => [...prev, {
             row: product._rowIndex,
             name: product.name || 'Без названия',
             article: product.article || 'Без артикула',
             reason: errorReason
           }]);
           errorCount++;
           continue;
         }

        // Создаем товар
        console.log(`📝 Создаем товар: ${product.name}`);
        
        // Используем данные как есть, без автоматического перевода
        const originalName = product.name;
        const hebrewName = product.nameHe || product.name; // Если нет ивритского названия, используем русское
        
        const formData = new FormData();
        formData.append('name', originalName);
        formData.append('nameHe', hebrewName);
        formData.append('price', product.price);
        formData.append('quantity', product.quantity);
        formData.append('article', product.article);

        console.log(`🌐 Отправляем запрос на ${API_BASE_URL}/api/products`);
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: formData
        });

        console.log(`📡 Ответ сервера:`, response.status, response.statusText);
        
        if (response.ok) {
          console.log(`✅ Товар ${i + 1} успешно создан`);
          successCount++;
                 } else {
           const errorText = await response.text();
           console.log(`❌ Ошибка создания товара ${i + 1}:`, errorText);
           setErrorDetails(prev => [...prev, {
             row: product._rowIndex,
             name: product.name,
             article: product.article,
             reason: `Ошибка сервера: ${errorText}`
           }]);
           errorCount++;
         }

        // Обновляем прогресс и результаты после каждого товара
        const progress = ((i + 1) / mappedData.length) * 100;
        setImportProgress(progress);
        setImportResults({ success: successCount, errors: errorCount, skipped: skippedCount });
        
        // Добавляем небольшую задержку для лучшего UX
        await new Promise(resolve => setTimeout(resolve, 100));

             } catch (err) {
         console.log(`💥 Ошибка при обработке товара ${i + 1}:`, err);
         setErrorDetails(prev => [...prev, {
           row: product._rowIndex,
           name: product.name,
           article: product.article,
           reason: `Системная ошибка: ${err.message}`
         }]);
         errorCount++;
         setImportResults({ success: successCount, errors: errorCount, skipped: skippedCount });
       }
    }

    console.log(`🏁 Импорт завершен. Результаты:`, { successCount, errorCount, skippedCount });
    
    setLoading(false);
    setCurrentProduct(''); // Сбрасываем текущий товар
    setActiveStep(3);
    
    if (successCount > 0) {
      setSuccess(`✅ Импорт завершен! Успешно импортировано ${successCount} товаров`);
    } else {
      setSuccess('✅ Импорт завершен');
    }
    
    if (errorCount > 0) {
      setError(`⚠️ Ошибки при импорте: ${errorCount} товаров`);
    }
  };

  // Сброс состояния
  const handleReset = () => {
    setActiveStep(0);
    setUploadedFile(null);
    setParsedData([]);
    setMappedData([]);
    setError('');
    setSuccess('');
         setImportProgress(0);
     setImportResults({ success: 0, errors: 0, skipped: 0 });
     setErrorDetails([]);
     setSkippedDetails([]);
     setCurrentProduct('');
    setFieldMapping({ nameHe: '', name: '', article: '', quantity: '', price: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Экспорт деталей в CSV
  const exportDetailsToCSV = (data, filename) => {
    if (data.length === 0) return;
    
    const headers = ['Строка', 'Название', 'Артикул', 'Причина'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.row,
        `"${item.name}"`,
        `"${item.article}"`,
        `"${item.reason}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Заголовок страницы */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <CloudUpload color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            Массовый импорт товаров
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Импорт товаров из Excel файла
          </Typography>
        </Box>
      </Box>

      {/* Шаги */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {index === 0 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Загрузите Excel файл
                      </Typography>
                                             <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        Файл должен содержать следующие колонки: <strong>Название (иврит)</strong>, <strong>Название (русский)</strong>, <strong>Баркод</strong>, <strong>Количество</strong>, <strong>Цена</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        ⚠️ <strong>Важно:</strong> Названия товаров должны быть введены вручную на соответствующих языках. Автоматический перевод не используется.
                      </Typography>
                       <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                         Поддерживаемые форматы: Excel (.xlsx, .xls) и CSV (.csv)
                       </Typography>
                                               <Box sx={{ mb: 2 }}>
                          <Button
                            startIcon={<FileDownload />}
                            href="/template_products_example.csv"
                            download
                            sx={{
                              background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: 13,
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              textTransform: 'none',
                              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                              minWidth: 100,
                              height: 36,
                              mb: 1,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Скачать пример файла
                          </Button>
                          <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                            Скачайте пример файла и используйте его как шаблон
                          </Typography>
                        </Box>
                      
                      <Box
                        sx={{
                          border: '2px dashed #ccc',
                          borderRadius: 2,
                          p: 3,
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { borderColor: '#1976d2' }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography>
                          {uploadedFile ? uploadedFile.name : 'Нажмите для выбора файла'}
                        </Typography>
                                                 <input
                           ref={fileInputRef}
                           type="file"
                           accept=".xlsx,.xls,.csv"
                           onChange={handleFileUpload}
                           style={{ display: 'none' }}
                         />
                      </Box>
                      
                      {uploadedFile && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            onClick={() => setActiveStep(1)}
                            disabled={parsedData.length === 0}
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
                                boxShadow: 'none',
                                transform: 'none'
                              }
                            }}
                          >
                            Продолжить
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}

                {index === 1 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Настройка маппинга полей
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="nameHe-label">Название товара (иврит)</InputLabel>
                            <Select
                              labelId="nameHe-label"
                              value={fieldMapping.nameHe}
                              onChange={(e) => handleFieldMappingChange('nameHe', e.target.value)}
                              label="Название товара (иврит)"
                            >
                              {parsedData[0] && Object.keys(parsedData[0]).filter(key => key !== '_rowIndex').map(key => (
                                <MenuItem key={key} value={key}>{key}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="name-label">Название товара (русский)</InputLabel>
                            <Select
                              labelId="name-label"
                              value={fieldMapping.name}
                              onChange={(e) => handleFieldMappingChange('name', e.target.value)}
                              label="Название товара (русский)"
                            >
                              {parsedData[0] && Object.keys(parsedData[0]).filter(key => key !== '_rowIndex').map(key => (
                                <MenuItem key={key} value={key}>{key}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="article-label">Артикул (баркод)</InputLabel>
                            <Select
                              labelId="article-label"
                              value={fieldMapping.article}
                              onChange={(e) => handleFieldMappingChange('article', e.target.value)}
                              label="Артикул (баркод)"
                            >
                              <MenuItem value="">Не выбрано</MenuItem>
                              {parsedData[0] && Object.keys(parsedData[0]).filter(key => key !== '_rowIndex').map(key => (
                                <MenuItem key={key} value={key}>{key}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="quantity-label">Количество</InputLabel>
                            <Select
                              labelId="quantity-label"
                              value={fieldMapping.quantity}
                              onChange={(e) => handleFieldMappingChange('quantity', e.target.value)}
                              label="Количество"
                            >
                              <MenuItem value="">Не выбрано</MenuItem>
                              {parsedData[0] && Object.keys(parsedData[0]).filter(key => key !== '_rowIndex').map(key => (
                                <MenuItem key={key} value={key}>{key}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="price-label">Цена</InputLabel>
                            <Select
                              labelId="price-label"
                              value={fieldMapping.price}
                              onChange={(e) => handleFieldMappingChange('price', e.target.value)}
                              label="Цена"
                            >
                              {parsedData[0] && Object.keys(parsedData[0]).filter(key => key !== '_rowIndex').map(key => (
                                <MenuItem key={key} value={key}>{key}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Как работает импорт:</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          • Укажите отдельные колонки для названий на русском и иврите
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          • Если ивритское название не указано, будет использовано русское
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                          Результат: В русском режиме показывается русский текст, в ивритском режиме - ивритский текст
                        </Typography>
                      </Box>
                      
                                             <Box sx={{ mt: 3 }}>
                         <Button
                           onClick={handlePreview}
                           disabled={!fieldMapping.name || !fieldMapping.price}
                           sx={{
                             background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                             color: '#fff',
                             fontWeight: 600,
                             fontSize: 15,
                             borderRadius: 2,
                             px: 3,
                             py: 1.5,
                             textTransform: 'none',
                             boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                             minWidth: 120,
                             height: 44,
                             '&:hover': {
                               background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                               boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
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
                           Предварительный просмотр
                         </Button>
                       </Box>
                    </CardContent>
                  </Card>
                )}

                {index === 2 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Предварительный просмотр ({mappedData.length} товаров)
                      </Typography>
                      
                      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Название (иврит)</TableCell>
                              <TableCell>Название (рус)</TableCell>
                              <TableCell>Баркод</TableCell>
                              <TableCell>Количество</TableCell>
                              <TableCell>Цена</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mappedData.slice(0, 10).map((product, index) => (
                              <TableRow key={index}>
                                <TableCell>{product.nameHe || '-'}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.article || '-'}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>₪{product.price}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      {mappedData.length > 10 && (
                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                          Показано 10 из {mappedData.length} товаров
                        </Typography>
                      )}
                      
                                             <Box sx={{ mt: 3 }}>
                         <Button
                           onClick={() => {
                             console.log('🔘 Кнопка "Начать импорт" нажата');
                             console.log('📊 mappedData.length:', mappedData.length);
                             handleImport();
                           }}
                           disabled={mappedData.length === 0 || !fieldMapping.nameHe || !fieldMapping.name || !fieldMapping.price}
                           sx={{
                             background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                             color: '#fff',
                             fontWeight: 600,
                             fontSize: 15,
                             borderRadius: 2,
                             px: 3,
                             py: 1.5,
                             textTransform: 'none',
                             boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                             minWidth: 120,
                             height: 44,
                             '&:hover': {
                               background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
                               boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
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
                           Начать импорт
                         </Button>
                       </Box>
                    </CardContent>
                  </Card>
                )}

                                 {index === 3 && (
                   <Card>
                     <CardContent>
                       <Typography variant="h6" sx={{ mb: 2 }}>
                         Результаты импорта
                       </Typography>
                       
                       {loading && (
                         <Box sx={{ mb: 3 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                             <CircularProgress size={20} sx={{ mr: 1 }} />
                             <Typography variant="h6">
                               Импорт в процессе... {Math.round(importProgress)}%
                             </Typography>
                           </Box>
                           {currentProduct && (
                             <Typography variant="body2" sx={{ mb: 2, color: '#666', fontStyle: 'italic' }}>
                               Обрабатывается: {currentProduct}
                             </Typography>
                           )}
                           <Box sx={{ width: '100%', bgcolor: '#f0f0f0', borderRadius: 1, overflow: 'hidden' }}>
                             <Box 
                               sx={{ 
                                 width: `${importProgress}%`, 
                                 height: 20, 
                                 bgcolor: '#4caf50',
                                 transition: 'width 0.3s ease',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center'
                               }}
                             >
                               <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                                 {Math.round(importProgress)}%
                               </Typography>
                             </Box>
                           </Box>
                         </Box>
                       )}
                       
                       <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                         <Chip
                           icon={<CheckCircle />}
                           label={`Успешно: ${importResults.success}`}
                           color="success"
                           size="large"
                         />
                         <Chip
                           icon={<Error />}
                           label={`Ошибки: ${importResults.errors}`}
                           color="error"
                           size="large"
                         />
                         <Chip
                           icon={<Warning />}
                           label={`Пропущено: ${importResults.skipped}`}
                           color="warning"
                           size="large"
                         />
                       </Box>
                       
                                               {!loading && (
                          <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                            Импорт завершен. Обработано товаров: {importResults.success + importResults.errors + importResults.skipped}
                          </Typography>
                        )}

                        {/* Детали ошибок */}
                        {errorDetails.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" sx={{ color: '#d32f2f' }}>
                                Детали ошибок ({errorDetails.length})
                              </Typography>
                              <Button
                                startIcon={<Download />}
                                onClick={() => exportDetailsToCSV(errorDetails, 'import_errors.csv')}
                                sx={{
                                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: 13,
                                  borderRadius: 2,
                                  px: 2,
                                  py: 1,
                                  textTransform: 'none',
                                  boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
                                  minWidth: 100,
                                  height: 36,
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
                                    transform: 'translateY(-1px)'
                                  }
                                }}
                              >
                                Экспорт CSV
                              </Button>
                            </Box>
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Строка</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>Артикул</TableCell>
                                    <TableCell>Причина ошибки</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {errorDetails.map((error, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{error.row}</TableCell>
                                      <TableCell>{error.name}</TableCell>
                                      <TableCell>{error.article}</TableCell>
                                      <TableCell sx={{ color: '#d32f2f', fontSize: '0.875rem' }}>
                                        {error.reason}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )}

                        {/* Детали пропущенных товаров */}
                        {skippedDetails.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" sx={{ color: '#ed6c02' }}>
                                Пропущенные товары ({skippedDetails.length})
                              </Typography>
                              <Button
                                startIcon={<Download />}
                                onClick={() => exportDetailsToCSV(skippedDetails, 'import_skipped.csv')}
                                sx={{
                                  background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: 13,
                                  borderRadius: 2,
                                  px: 2,
                                  py: 1,
                                  textTransform: 'none',
                                  boxShadow: '0 2px 8px rgba(237, 108, 2, 0.3)',
                                  minWidth: 100,
                                  height: 36,
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)',
                                    boxShadow: '0 4px 12px rgba(237, 108, 2, 0.4)',
                                    transform: 'translateY(-1px)'
                                  }
                                }}
                              >
                                Экспорт CSV
                              </Button>
                            </Box>
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Строка</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>Артикул</TableCell>
                                    <TableCell>Причина пропуска</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {skippedDetails.map((skipped, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{skipped.row}</TableCell>
                                      <TableCell>{skipped.name}</TableCell>
                                      <TableCell>{skipped.article}</TableCell>
                                      <TableCell sx={{ color: '#ed6c02', fontSize: '0.875rem' }}>
                                        {skipped.reason}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )}
                      
                                                                       <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                           <Button
                             onClick={handleReset}
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
                               }
                             }}
                           >
                             Начать заново
                           </Button>
                                                     {!loading && (
                             <Button
                               onClick={() => {
                                 // Перезагружаем страницу для обновления списка товаров
                                 window.location.reload();
                               }}
                               sx={{
                                 background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                                 color: '#fff',
                                 fontWeight: 600,
                                 fontSize: 15,
                                 borderRadius: 2,
                                 px: 3,
                                 py: 1.5,
                                 textTransform: 'none',
                                 boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                                 minWidth: 120,
                                 height: 44,
                                 '&:hover': {
                                   background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                                   boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                                   transform: 'translateY(-1px)'
                                 }
                               }}
                             >
                               Обновить список товаров
                             </Button>
                           )}
                        </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Уведомления */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

                           {/* Кнопки управления */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            onClick={handleReset}
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
              }
            }}
          >
            Сбросить
          </Button>
         
         {activeStep > 0 && activeStep < 3 && (
           <Button
             onClick={() => setActiveStep(activeStep - 1)}
             sx={{
               background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
               color: '#fff',
               fontWeight: 600,
               fontSize: 15,
               borderRadius: 2,
               px: 3,
               py: 1.5,
               textTransform: 'none',
               boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
               minWidth: 120,
               height: 44,
               '&:hover': {
                 background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                 boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                 transform: 'translateY(-1px)'
               }
             }}
           >
             Назад
           </Button>
         )}
       </Box>
    </Box>
  );
};

export default BulkImportProducts;
