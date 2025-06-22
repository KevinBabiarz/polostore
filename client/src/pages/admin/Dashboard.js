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
    Add, MusicNote, Email, Settings
} from '@mui/icons-material';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalProductions: 0,
        totalMessages: 0,
        unreadMessages: 0
    });
    const [loading, setLoading] = useState(true);

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
                    unreadMessages: unreadMessages
                });
            } catch (error) {
                console.error("Erreur lors du chargement des données du tableau de bord:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <DashboardIcon fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h4" component="h1">
                    Tableau de bord administrateur
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Cartes statistiques */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Album color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Productions</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ my: 2, textAlign: 'center' }}>
                            {stats.totalProductions}
                        </Typography>
                        <Button
                            variant="outlined"
                            component={Link}
                            to="/admin/productions"
                            sx={{ mt: 'auto' }}
                        >
                            Gérer les productions
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Message color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Messages</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ my: 2, textAlign: 'center' }}>
                            {stats.totalMessages}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {stats.unreadMessages} message(s) non lu(s)
                        </Typography>
                        <Button
                            variant="outlined"
                            component={Link}
                            to="/admin/messages"
                            sx={{ mt: 'auto' }}
                        >
                            Voir les messages
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <DashboardIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Actions rapides</Typography>
                        </Box>
                        <List>
                            <ListItem button component={Link} to="/admin/productions/new">
                                <ListItemIcon>
                                    <Add />
                                </ListItemIcon>
                                <ListItemText primary="Ajouter une production" />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem button component={Link} to="/productions">
                                <ListItemIcon>
                                    <MusicNote />
                                </ListItemIcon>
                                <ListItemText primary="Voir les productions publiées" />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem button component={Link} to="/admin/messages">
                                <ListItemIcon>
                                    <Email />
                                </ListItemIcon>
                                <ListItemText primary="Consulter les messages" />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Section récente */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Activité récente
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {stats.totalProductions === 0 && stats.totalMessages === 0 ? (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                                Aucune activité récente à afficher
                            </Typography>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Vous avez {stats.totalProductions} production(s) et {stats.totalMessages} message(s)
                                dont {stats.unreadMessages} non lu(s).
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;