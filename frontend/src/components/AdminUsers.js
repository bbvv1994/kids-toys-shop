import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  TextField,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  NotificationsActive,
  People,
  AdminPanelSettings,
  Person,
  Email,
  CalendarToday,
  Search
} from '@mui/icons-material';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [userToNotify, setUserToNotify] = useState(null);
  const [notifyText, setNotifyText] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState('');
  const [notifySuccess, setNotifySuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch('${API_BASE_URL}/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка загрузки пользователей');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (userId) => {
    setDeleteDialogOpen(false);
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка удаления пользователя');
      }
      setUsers(users.filter(u => u.id !== userId));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleOpenNotifyDialog = (user) => {
    setUserToNotify(user);
    setNotifyText('');
    setNotifyError('');
    setNotifySuccess('');
    setNotifyDialogOpen(true);
  };

  const handleCloseNotifyDialog = () => {
    setNotifyDialogOpen(false);
    setTimeout(() => {
      setUserToNotify(null);
      setNotifyText('');
      setNotifyError('');
      setNotifySuccess('');
    }, 300);
  };

  const handleSendNotification = async () => {
    if (!notifyText.trim()) {
      setNotifyError('Введите текст уведомления');
      return;
    }
    setNotifyLoading(true);
    setNotifyError('');
    setNotifySuccess('');
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userToNotify.id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: notifyText })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка отправки уведомления');
      }
      setNotifySuccess('Уведомление отправлено!');
      setTimeout(() => {
        setNotifyDialogOpen(false);
        setTimeout(() => {
          setUserToNotify(null);
          setNotifyText('');
          setNotifyError('');
          setNotifySuccess('');
        }, 300);
      }, 1200);
    } catch (e) {
      setNotifyError(e.message);
    }
    setNotifyLoading(false);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'user': return <Person />;
      default: return <Person />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, width: 1250, mx: 'auto', mt: 4, minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, minHeight: 'calc(100vh - 200px)' }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <People color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Управление пользователями
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Просмотр и управление пользователями системы
            </Typography>
          </Box>
        </Box>

        {/* Статистика */}
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Статистика пользователей
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Всего пользователей
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {users.filter(u => u.role === 'admin').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Администраторы
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {users.filter(u => u.role === 'user').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Обычные пользователи
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {users.filter(u => u.email).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  С email
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Поиск */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Поиск по имени или email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        {/* Таблица пользователей */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Пользователь</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Роль</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Дата регистрации</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                      {search ? 'Пользователи не найдены' : 'Нет пользователей'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="action" />
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {user.name || 'Без имени'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email color="action" />
                        <Typography variant="body2">
                          {user.email || 'Нет email'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday color="action" sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {user.createdAt ? formatDate(user.createdAt) : 'Неизвестно'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Редактировать">
                          <span>
                            <IconButton disabled size="small" sx={{
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#e3f2fd'
                              }
                            }}>
                              <Edit />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <span>
                            <IconButton 
                              onClick={() => handleOpenDeleteDialog(user)} 
                              disabled={user.role === 'admin'}
                              size="small"
                              sx={{
                                color: '#f44336',
                                '&:hover': {
                                  backgroundColor: '#ffebee'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Отправить уведомление">
                          <span>
                            <IconButton 
                              onClick={() => handleOpenNotifyDialog(user)}
                              size="small"
                              sx={{
                                color: '#ffd700',
                                '&:hover': {
                                  backgroundColor: '#fff8e1'
                                }
                              }}
                            >
                              <NotificationsActive />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог удаления пользователя */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Удалить пользователя?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя <b>{userToDelete?.name}</b> ({userToDelete?.email})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button color="error" onClick={() => handleDelete(userToDelete.id)} autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отправки уведомления */}
      <Dialog 
        open={notifyDialogOpen} 
        onClose={handleCloseNotifyDialog}
        TransitionProps={{
          timeout: 300
        }}
        keepMounted={false}
        disableEscapeKeyDown={notifyLoading}
      >
        <DialogTitle>Отправить уведомление</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Пользователь: <b>{userToNotify?.name}</b> ({userToNotify?.email})
          </Typography>
          <TextField
            label="Текст уведомления"
            value={notifyText}
            onChange={e => setNotifyText(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 2 }}
            disabled={notifyLoading}
          />
          {notifyError && <Alert severity="error" sx={{ mb: 1 }}>{notifyError}</Alert>}
          {notifySuccess && <Alert severity="success" sx={{ mb: 1 }}>{notifySuccess}</Alert>}
        </DialogContent>
        <DialogActions sx={{ gap: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            disabled={notifyLoading}
            variant="outlined"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSendNotification} 
            disabled={notifyLoading}
            variant="contained"
            color="primary"
          >
            {notifyLoading ? 'Отправка...' : 'Отправить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers; 