// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductions } from '../../services/productionService';
import { getContactMessages } from '../../services/contactService';
import {
    Container, Grid, Paper, Typography, Box, Button,
    Card, CardContent, CircularProgress, Divider, List,
    ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Album, Message, Dashboard as DashboardIcon,
    Add, MusicNote, Email, Settings, People
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalProductions: 0,
        totalMessages: 0,
        unreadMessages: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Récupérer les données de différentes APIs
                const [productionsData, messagesData] = await Promise.all([
                    getProductions(1),
                    getContactMessages()
                ]);

                // Calculer les statistiques
                const unreadMessages = messagesData.filter(msg => !msg.read).length;

                setStats({
                    totalProductions: productionsData.total || productionsData.productions.length,
                    totalMessages: messagesData.length,
                    unreadMessages: unreadMessages,
                    totalUsers: 0 // À implémenter si nécessaire
                });
            } catch (error) {
                console.error(t('admin:dashboard.errors.loadData'), error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [t]);

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>{t('admin:common.loading')}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <DashboardIcon fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h4" component="h1">
                    {t('admin:dashboard.title')}
                </Typography>
            </Box>

            {/* Message de bienvenue */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h5">
                    {t('admin:dashboard.welcome', { username: user?.username || 'Admin' })}
                </Typography>
            </Paper>

            {/* Section statistiques */}
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                {t('admin:dashboard.statistics')}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Carte Productions */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Album color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">{t('admin:dashboard.totalProductions')}</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ my: 2, textAlign: 'center', color: 'primary.main' }}>
                                {stats.totalProductions}
                            </Typography>
                            <Button
                                variant="outlined"
                                component={Link}
                                to="/admin/productions"
                                fullWidth
                                startIcon={<Album />}
                            >
                                {t('admin:dashboard.manageProductions')}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Carte Messages */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Message color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">{t('admin:dashboard.totalMessages')}</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ my: 2, textAlign: 'center', color: 'primary.main' }}>
                                {stats.totalMessages}
                            </Typography>
                            {stats.unreadMessages > 0 && (
                                <Typography variant="body2" color="error" sx={{ textAlign: 'center', mb: 2 }}>
                                    {t('admin:dashboard.unreadMessages', { count: stats.unreadMessages })}
                                </Typography>
                            )}
                            <Button
                                variant="outlined"
                                component={Link}
                                to="/admin/messages"
                                fullWidth
                                startIcon={<Email />}
                            >
                                {t('admin:dashboard.viewMessages')}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Carte Utilisateurs */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <People color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">{t('admin:dashboard.totalUsers')}</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ my: 2, textAlign: 'center', color: 'primary.main' }}>
                                {stats.totalUsers || '-'}
                            </Typography>
                            <Button
                                variant="outlined"
                                component={Link}
                                to="/admin/users"
                                fullWidth
                                startIcon={<People />}
                            >
                                {t('admin:dashboard.manageUsers')}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Actions rapides */}
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                {t('admin:dashboard.quickActions')}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {t('admin:dashboard.quickActions')}
                        </Typography>
                        <List>
                            <ListItem
                                button
                                component={Link}
                                to="/admin/productions/add"
                                sx={{ borderRadius: 1, mb: 1 }}
                            >
                                <ListItemIcon>
                                    <Add color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={t('admin:dashboard.addProduction')} />
                            </ListItem>
                            <ListItem
                                button
                                component={Link}
                                to="/admin/users"
                                sx={{ borderRadius: 1, mb: 1 }}
                            >
                                <ListItemIcon>
                                    <People color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={t('admin:dashboard.manageUsers')} />
                            </ListItem>
                            <ListItem
                                button
                                component={Link}
                                to="/admin/messages"
                                sx={{ borderRadius: 1 }}
                            >
                                <ListItemIcon>
                                    <Message color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={t('admin:dashboard.viewMessages')} />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {t('admin:dashboard.recentActivity')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('admin:dashboard.noRecentActivity')}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;