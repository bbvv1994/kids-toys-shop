import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Menu, MenuItem, Switch, CircularProgress, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addImage, setAddImage] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    // Получение категорий с backend
    fetch('${API_BASE_URL}/api/categories', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleToggleActive = (category) => {
    // API-запрос на включение/отключение категории
    fetch(`${API_BASE_URL}/api/categories/${category.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(updated => {
        setCategories(cats => cats.map(cat => cat.id === updated.id ? updated : cat));
      });
    handleMenuClose();
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setEditName(category.name);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setEditImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview('');
    }
  };

  const handleEditSave = async () => {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      // Сначала обновляем имя
      const res = await fetch(`${API_BASE_URL}/api/categories/${editCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editName })
      });
      let updated = await res.json();
      // Затем, если выбрано новое изображение, отправляем его
      if (editImage) {
        const formData = new FormData();
        formData.append('image', editImage);
        const imgRes = await fetch(`${API_BASE_URL}/api/categories/${editCategory.id}/image`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        updated = await imgRes.json();
        // Обновляем превью и editCategory.image
        setEditImagePreview('');
        setEditImage(null);
      }
      setCategories(cats => cats.map(cat => cat.id === updated.id ? updated : cat));
      setEditDialogOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (category) => {
    // API-запрос на удаление категории
    if (window.confirm('Удалить категорию?')) {
      fetch(`${API_BASE_URL}/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(() => setCategories(cats => cats.filter(cat => cat.id !== category.id)));
    }
    handleMenuClose();
  };

  const handleCreate = async () => {
    if (!newCategory.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('${API_BASE_URL}/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newCategory })
      });
      const cat = await res.json();
      setCategories(cats => [...cats, cat]);
      setNewCategory('');
    } finally {
      setCreating(false);
    }
  };

  const handleAddOpen = () => {
    setAddName('');
    setAddImage(null);
    setAddImagePreview('');
    setAddDialogOpen(true);
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    setAddImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAddImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setAddImagePreview('');
    }
  };

  const handleAddSave = async () => {
    if (!addName.trim()) return;
    setAddLoading(true);
    try {
      // Сначала создаём категорию
      const res = await fetch('${API_BASE_URL}/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: addName })
      });
      let created = await res.json();
      // Если выбрано изображение, отправляем его
      if (addImage) {
        const formData = new FormData();
        formData.append('image', addImage);
        const imgRes = await fetch(`${API_BASE_URL}/api/categories/${created.id}/image`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        created = await imgRes.json();
      }
      setCategories(cats => [...cats, created]);
      setAddDialogOpen(false);
      setAddName('');
      setAddImage(null);
      setAddImagePreview('');
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Категории товаров</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" onClick={handleAddOpen} sx={{ fontWeight: 'bold' }}>
          Добавить категорию
        </Button>
      </Box>
      <List>
        {categories.map(category => (
          <ListItem key={category.id} secondaryAction={
            <>
              <IconButton edge="end" onClick={e => handleMenuOpen(e, category)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedCategory?.id === category.id}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleEdit(category)}>Редактировать</MenuItem>
                <MenuItem onClick={() => handleDelete(category)}>Удалить</MenuItem>
              </Menu>
            </>
          }>
            <ListItemText primary={category.name} secondary={category.active ? 'Включена' : 'Отключена'} />
            <Switch checked={category.active} onChange={() => handleToggleActive(category)} />
          </ListItem>
        ))}
      </List>
      {/* Модалка для редактирования категории */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Редактировать категорию</DialogTitle>
        <DialogContent>
          <TextField
            label="Новое имя категории"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            fullWidth
            autoFocus
            disabled={editLoading}
            sx={{ mt: 1 }}
          />
          <Card elevation={8} sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)', border: '1px solid rgba(255, 107, 107, 0.1)', mt: 3, mb: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#FF6B6B', fontWeight: 'bold' }}>
                📸 Изображение категории
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #FF6B6B',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.05)',
                  },
                }}
                onClick={() => document.getElementById('edit-category-image-input').click()}
              >
                {editImagePreview ? (
                  <Box component="img" src={editImagePreview} alt="Новое" sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mb: 1, border: '2px solid #4ECDC4' }} />
                ) : editCategory?.image ? (
                  <Box component="img"
                    src={editCategory?.image ? `${API_BASE_URL}/uploads/${editCategory.image}` : '/default-category-image.jpg'}
                    alt="Текущее"
                    sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mb: 1, border: '2px solid #FF6B6B' }}
                  />
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#FF6B6B', mb: 2 }} />
                    <Typography variant="body2" color="textSecondary">
                      Нажмите для загрузки изображения
                    </Typography>
                  </Box>
                )}
              </Box>
              <input
                id="edit-category-image-input"
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                style={{ display: 'none' }}
              />
              {editImage && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#4ECDC4' }}>
                  Файл выбран
                </Typography>
              )}
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editLoading}>Отмена</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editLoading || !editName.trim()}>Сохранить</Button>
        </DialogActions>
      </Dialog>
      {/* Модалка для добавления категории */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Добавить категорию</DialogTitle>
        <DialogContent>
          <TextField
            label="Название категории"
            value={addName}
            onChange={e => setAddName(e.target.value)}
            fullWidth
            autoFocus
            disabled={addLoading}
            sx={{ mt: 1 }}
          />
          <Card elevation={8} sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)', border: '1px solid rgba(255, 107, 107, 0.1)', mt: 3, mb: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#FF6B6B', fontWeight: 'bold' }}>
                📸 Изображение категории
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #FF6B6B',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.05)',
                  },
                }}
                onClick={() => document.getElementById('add-category-image-input').click()}
              >
                {addImagePreview ? (
                  <Box component="img" src={addImagePreview} alt="Новое" sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mb: 1, border: '2px solid #4ECDC4' }} />
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#FF6B6B', mb: 2 }} />
                    <Typography variant="body2" color="textSecondary">
                      Нажмите для загрузки изображения
                    </Typography>
                  </Box>
                )}
              </Box>
              <input
                id="add-category-image-input"
                type="file"
                accept="image/*"
                onChange={handleAddImageChange}
                style={{ display: 'none' }}
              />
              {addImage && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#4ECDC4' }}>
                  Файл выбран
                </Typography>
              )}
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={addLoading}>Отмена</Button>
          <Button onClick={handleAddSave} variant="contained" disabled={addLoading || !addName.trim()}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategories; 