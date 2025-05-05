// src/components/layout/Layout.js
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    AppBar, Box, Toolbar, Typography, Button, Container,
    IconButton, Menu, MenuItem, Drawer, List, ListItem,
    ListItemText, ListItemIcon, Divider, Avatar
} from '@mui/material';
import {
    Menu as MenuIcon, MusicNote, Favorite, Message,
    Dashboard, Login, Logout, PersonAdd, AccountCircle
} from '@mui/icons-material';

const Layout = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleUserMenuClose();
        navigate('/');
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Productions Musicales
            </Typography>
            <Divider />
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemIcon><MusicNote /></ListItemIcon>
                    <ListItemText primary="Accueil" />
                </ListItem>
                <ListItem button component={Link} to="/productions">
                    <ListItemIcon><MusicNote /></ListItemIcon>
                    <ListItemText primary="Productions" />
                </ListItem>
                {user && (
                    <ListItem button component={Link} to="/favorites">
                        <ListItemIcon><Favorite /></ListItemIcon>
                        <ListItemText primary="Favoris" />
                    </ListItem>
                )}
                <ListItem button component={Link} to="/contact">
                    <ListItemIcon><Message /></ListItemIcon>
                    <ListItemText primary="Contact" />
                </ListItem>
                {isAdmin() && (
                    <ListItem button component={Link} to="/admin">
                        <ListItemIcon><Dashboard /></ListItemIcon>
                        <ListItemText primary="Administration" />
                    </ListItem>
                )}
                {!user ? (
                    <>
                        <ListItem button component={Link} to="/login">
                            <ListItemIcon><Login /></ListItemIcon>
                            <ListItemText primary="Se connecter" />
                        </ListItem>
                        <ListItem button component={Link} to="/register">
                            <ListItemIcon><PersonAdd /></ListItemIcon>
                            <ListItemText primary="S'inscrire" />
                        </ListItem>
                    </>
                ) : (
                    <ListItem button onClick={handleLogout}>
                        <ListItemIcon><Logout /></ListItemIcon>
                        <ListItemText primary="Déconnexion" />
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <MusicNote sx={{ mr: 1 }} />
                        Productions Musicales
                    </Typography>

                    <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        <Button color="inherit" component={Link} to="/productions">
                            Productions
                        </Button>
                        {user && (
                            <Button color="inherit" component={Link} to="/favorites">
                                Favoris
                            </Button>
                        )}
                        <Button color="inherit" component={Link} to="/contact">
                            Contact
                        </Button>
                        {isAdmin() && (
                            <Button color="inherit" component={Link} to="/admin">
                                Administration
                            </Button>
                        )}
                    </Box>

                    {user ? (
                        <Box>
                            <IconButton
                                onClick={handleUserMenuOpen}
                                color="inherit"
                                aria-label="user menu"
                                aria-controls="user-menu"
                                aria-haspopup="true"
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    {user.username ? user.username.charAt(0).toUpperCase() : <AccountCircle />}
                                </Avatar>
                            </IconButton>
                            <Menu
                                id="user-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleUserMenuClose}
                            >
                                <MenuItem disabled>
                                    <Typography variant="body2">
                                        {user.username || user.email}
                                    </Typography>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Déconnexion</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Box>
                            <Button color="inherit" component={Link} to="/login">
                                Se connecter
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/register"
                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                            >
                                S'inscrire
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
                <Container>
                    <Outlet />
                </Container>
            </Box>

            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: (theme) => theme.palette.grey[200]
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} Productions Musicales - Tous droits réservés
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;