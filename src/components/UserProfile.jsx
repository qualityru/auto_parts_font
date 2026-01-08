import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  CircularProgress,
  Chip,
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material';

import {
  ArrowBack,
  Logout,
  ShoppingCart,
  Paid,
  Edit,
  Save,
  Cancel,
  Visibility,
  Replay,
  Person,
  ReceiptLong,
  LocalShipping,
  Stars,
} from '@mui/icons-material';

function UserProfile() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  const [orderHistory, setOrderHistory] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', city: '',
  });

  useEffect(() => {
    setTimeout(() => {
      const mockUserData = {
        id: 1,
        name: 'Иван Петров',
        email: 'ivan.petrov@example.com',
        phone: '+7 (999) 123-45-67',
        company: 'АвтоСервис "Мотор"',
        city: 'Москва',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        stats: { totalOrders: 24, totalSpent: 156800, activeOrders: 3, bonusPoints: 1250 },
      };

      const mockOrderHistory = [
        { id: 'ORD-2026-001', date: '12 Янв 2026', status: 'delivered', total: 12450, items: 3 },
        { id: 'ORD-2026-002', date: '05 Янв 2026', status: 'processing', total: 8450, items: 2 },
        { id: 'ORD-2025-045', date: '20 Дек 2025', status: 'cancelled', total: 25600, items: 5 },
      ];

      setUserData(mockUserData);
      setFormData(mockUserData);
      setOrderHistory(mockOrderHistory);
      setIsLoading(false);
    }, 800);
  }, []);

  const getStatusStyles = (status) => {
    const styles = {
      delivered: { color: theme.palette.success.main, label: 'Доставлен' },
      processing: { color: theme.palette.warning.main, label: 'В обработке' },
      cancelled: { color: theme.palette.error.main, label: 'Отменен' },
    };
    return styles[status] || { color: theme.palette.text.secondary, label: status };
  };

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh">
        <CircularProgress thickness={5} size={60} sx={{ color: 'primary.main' }} />
        <Typography sx={{ mt: 3, fontWeight: 500, color: 'text.secondary' }}>Загрузка профиля...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Top Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <IconButton 
          onClick={() => navigate('/')} 
          sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' }, boxShadow: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<Logout />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Выйти
        </Button>
      </Stack>

      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={4} lg={3}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <Avatar 
                src={userData.avatar} 
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: '4px solid white', boxShadow: 3 }} 
              />
              <Typography variant="h6" fontWeight="700">{userData.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{userData.company}</Typography>
              <Chip label="Premium Client" size="small" color="primary" sx={{ mt: 1, fontWeight: 600 }} />
            </Paper>

            <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <List sx={{ p: 1 }}>
                {[
                  { label: 'Мой профиль', icon: <Person />, index: 0 },
                  { label: 'История заказов', icon: <ReceiptLong />, index: 1 },
                  { label: 'Адреса доставки', icon: <LocalShipping />, index: 2 },
                ].map((item) => (
                  <ListItemButton 
                    key={item.index}
                    selected={activeTab === item.index}
                    onClick={() => setActiveTab(item.index)}
                    sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                  >
                    <ListItemIcon sx={{ color: activeTab === item.index ? 'primary.main' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeTab === item.index ? 600 : 400 }} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8} lg={9}>
          {/* Stats Row */}
          <Grid container spacing={2} mb={4}>
            {[
              { label: 'Всего заказов', value: userData.stats.totalOrders, icon: <ShoppingCart />, color: '#6366f1' },
              { label: 'Потрачено', value: `${userData.stats.totalSpent.toLocaleString()}₽`, icon: <Paid />, color: '#22c55e' },
              { label: 'Бонусы', value: userData.stats.bonusPoints, icon: <Stars />, color: '#eab308' },
            ].map((stat, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(stat.color, 0.1), color: stat.color, display: 'flex' }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">{stat.label}</Typography>
                      <Typography variant="h6" fontWeight="700">{stat.value}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Dynamic Content */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e0e0e0', minHeight: 400 }}>
            {activeTab === 0 && (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight="700">Личные данные</Typography>
                  {!editingProfile ? (
                    <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditingProfile(true)} sx={{ borderRadius: 2 }}>
                      Редактировать
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" startIcon={<Save />} onClick={() => setEditingProfile(false)} sx={{ borderRadius: 2 }}>
                        Сохранить
                      </Button>
                      <Button color="inherit" onClick={() => setEditingProfile(false)}>Отмена</Button>
                    </Stack>
                  )}
                </Stack>
                
                <Grid container spacing={3}>
                  {Object.entries({ name: 'ФИО', email: 'Email', phone: 'Телефон', company: 'Компания', city: 'Город' }).map(([key, label]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <TextField
                        fullWidth
                        label={label}
                        value={formData[key]}
                        disabled={!editingProfile}
                        variant="filled"
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        sx={{ '& .MuiFilledInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" fontWeight="700" mb={3}>История заказов</Typography>
                <Stack spacing={2}>
                  {orderHistory.map((order) => (
                    <Card key={order.id} variant="outlined" sx={{ borderRadius: 3, '&:hover': { boxShadow: 2, borderColor: 'primary.main' }, transition: '0.3s' }}>
                      <CardContent>
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography fontWeight="700">{order.id}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.date}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Chip 
                              label={getStatusStyles(order.status).label} 
                              size="small" 
                              sx={{ 
                                bgcolor: alpha(getStatusStyles(order.status).color, 0.1), 
                                color: getStatusStyles(order.status).color,
                                fontWeight: 700
                              }} 
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <Typography fontWeight="700">{order.total.toLocaleString()} ₽</Typography>
                            <Typography variant="caption" display="block">{order.items} тов.</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                            <IconButton color="primary"><Visibility /></IconButton>
                            <IconButton><Replay /></IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserProfile;