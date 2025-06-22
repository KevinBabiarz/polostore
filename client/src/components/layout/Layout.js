// src/components/layout/Layout.js
import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    Avatar,
    Chip,
    Divider,
    useScrollTrigger,
    Fade,
    Slide,
    IconButton,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Badge
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import EmailIcon from '@mui/icons-material/Email';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Animation de dissimulation de la barre de navigation lors du défilement
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Layout = ({ themeToggle }) => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();

    // État pour suivre si l'utilisateur est admin (mis à jour à chaque rendu)
    const [userIsAdmin, setUserIsAdmin] = useState(false);

    // Mettre à jour l'état administrateur à chaque changement de l'objet user
    useEffect(() => {
        // Vérifier explicitement si l'utilisateur est admin en appelant la fonction isAdmin()
        const adminStatus = isAdmin();
        console.log('Statut admin dans Layout:', adminStatus, user);
        setUserIsAdmin(adminStatus);
    }, [user, isAdmin]);

    // États pour les menus déroulants
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
    const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
    const [adminMenuAnchorEl, setAdminMenuAnchorEl] = useState(null);

    const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
    const isProfileMenuOpen = Boolean(profileMenuAnchorEl);
    const isAdminMenuOpen = Boolean(adminMenuAnchorEl);

    // Effet pour fermer les menus lors des changements de route
    useEffect(() => {
        handleMobileMenuClose();
        handleProfileMenuClose();
        handleAdminMenuClose();
    }, [location.pathname]);

    // Gestionnaires pour les menus
    const handleMobileMenuOpen = (event) => {
        setMobileMenuAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchorEl(null);
    };

    const handleProfileMenuOpen = (event) => {
        setProfileMenuAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenuAnchorEl(null);
    };

    const handleAdminMenuOpen = (event) => {
        setAdminMenuAnchorEl(event.currentTarget);
    };

    const handleAdminMenuClose = () => {
        setAdminMenuAnchorEl(null);
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        logout();
        window.location.href = '/';
    };

    // Récupération des informations utilisateur
    const getUserInfo = () => {
        try {
            if (user && user.username) {
                return { username: user.username, isAdmin: userIsAdmin };
            }

            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const payload = token.split('.')[1];
                        if (payload) {
                            const decodedData = JSON.parse(atob(payload));
                            if (decodedData && (decodedData.username || decodedData.name)) {
                                return {
                                    username: decodedData.username || decodedData.name,
                                    isAdmin: decodedData.isAdmin || decodedData.is_admin || (decodedData.role === 'admin')
                                };
                            }
                        }
                    } catch (e) {
                        console.error('Erreur lors du décodage du token:', e);
                    }
                }
                return null;
            }
            const parsedInfo = JSON.parse(userInfoStr);
            return {
                ...parsedInfo,
                isAdmin: userIsAdmin // Utiliser la valeur de l'état isAdmin qui est mise à jour régulièrement
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des infos utilisateur:', error);
            return null;
        }
    };

    const userInfo = getUserInfo();

    const username = userInfo ?
        userInfo.username ||
        userInfo.name ||
        (user ? user.username || user.name || user.email : null) ||
        'Utilisateur'
        : 'Utilisateur';

    // Déterminer explicitement si l'utilisateur est admin
    const isUserAdmin = userIsAdmin;

    // Menu mobile pour les petits écrans
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMenuAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            PaperProps={{
                elevation: 3,
                sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 200
                }
            }}
        >
            <MenuItem component={RouterLink} to="/" onClick={handleMobileMenuClose}>
                <IconButton size="small" color="inherit">
                    <HomeIcon />
                </IconButton>
                <Typography sx={{ ml: 1 }}>Accueil</Typography>
            </MenuItem>

            <MenuItem component={RouterLink} to="/productions" onClick={handleMobileMenuClose}>
                <IconButton size="small" color="inherit">
                    <LibraryMusicIcon />
                </IconButton>
                <Typography sx={{ ml: 1 }}>Productions</Typography>
            </MenuItem>

            {(!isAuthenticated() || !isAdmin()) && (
                <MenuItem component={RouterLink} to="/contact" onClick={handleMobileMenuClose}>
                    <IconButton size="small" color="inherit">
                        <EmailIcon />
                    </IconButton>
                    <Typography sx={{ ml: 1 }}>Contact</Typography>
                </MenuItem>
            )}

            {isAuthenticated() ? (
                <>
                    {isAdmin() && (
                        <MenuItem component={RouterLink} to="/admin/dashboard" onClick={handleMobileMenuClose}>
                            <IconButton size="small" color="inherit">
                                <DashboardIcon />
                            </IconButton>
                            <Typography sx={{ ml: 1 }}>Dashboard Admin</Typography>
                        </MenuItem>
                    )}

                    <MenuItem component={RouterLink} to="/profile" onClick={handleMobileMenuClose}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: isAdmin() ? 'secondary.main' : 'primary.main' }}>
                            {username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ ml: 1 }}>Mon Profil</Typography>
                    </MenuItem>

                    <Divider />

                    <MenuItem onClick={() => { handleMobileMenuClose(); handleLogout(); }}>
                        <IconButton size="small" color="inherit">
                            <ExitToAppIcon />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>Déconnexion</Typography>
                    </MenuItem>
                </>
            ) : (
                <>
                    <MenuItem component={RouterLink} to="/login" onClick={handleMobileMenuClose}>
                        <IconButton size="small" color="inherit">
                            <LockOpenIcon />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>Connexion</Typography>
                    </MenuItem>

                    <MenuItem component={RouterLink} to="/register" onClick={handleMobileMenuClose}>
                        <IconButton size="small" color="inherit">
                            <PersonAddIcon />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>Inscription</Typography>
                    </MenuItem>
                </>
            )}
        </Menu>
    );

    // Menu admin pour les fonctions d'administration
    const renderAdminMenu = (
        <Menu
            anchorEl={adminMenuAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={isAdminMenuOpen}
            onClose={handleAdminMenuClose}
            PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2 }
            }}
        >
            <MenuItem component={RouterLink} to="/admin/dashboard" onClick={handleAdminMenuClose}>
                <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                Dashboard
            </MenuItem>

            <MenuItem component={RouterLink} to="/admin/productions" onClick={handleAdminMenuClose}>
                <LibraryMusicIcon fontSize="small" sx={{ mr: 1 }} />
                Gérer Productions
            </MenuItem>

            <MenuItem component={RouterLink} to="/admin/productions/add" onClick={handleAdminMenuClose}>
                <AddCircleIcon fontSize="small" sx={{ mr: 1 }} />
                Ajouter Production
            </MenuItem>

            <MenuItem component={RouterLink} to="/admin/users" onClick={handleAdminMenuClose}>
                <Badge badgeContent="New" color="error" fontSize="small" sx={{ mr: 1 }}>
                    <PersonAddIcon fontSize="small" />
                </Badge>
                Gérer Utilisateurs
            </MenuItem>
        </Menu>
    );

    // Menu profil pour les options de l'utilisateur
    const renderProfileMenu = (
        <Menu
            anchorEl={profileMenuAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={isProfileMenuOpen}
            onClose={handleProfileMenuClose}
            PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2 }
            }}
        >
            <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                <Avatar
                    sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 1,
                        bgcolor: isAdmin() ? 'secondary.main' : 'primary.main'
                    }}
                >
                    {username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                    {username}
                </Typography>
                <Chip
                    label={isAdmin() ? 'Admin' : 'Utilisateur'}
                    size="small"
                    color={isAdmin() ? 'secondary' : 'default'}
                    sx={{ mt: 0.5 }}
                />
            </Box>

            <Divider sx={{ my: 1 }} />

            <MenuItem component={RouterLink} to="/profile" onClick={handleProfileMenuClose}>
                Mon profil
            </MenuItem>

            <MenuItem component={RouterLink} to="/favorites" onClick={handleProfileMenuClose}>
                Mes favoris
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem onClick={handleLogout}>
                Déconnexion
            </MenuItem>
        </Menu>
    );

    // Couleurs personnalisées pour les onglets
    const activeTabColor = theme.palette.mode === 'dark' ? '#e02323' : '#e02323'; // Rouge en mode clair et sombre
    const textColor = theme.palette.mode === 'dark' ? '#ffffff' : '#333333'; // Texte blanc en mode sombre, gris foncé en mode clair
    const hoverColor = theme.palette.mode === 'dark' ? '#ff3333' : '#ff3333'; // Rouge plus vif en survol

    return (
        <>
            <HideOnScroll>
                <AppBar position="sticky"
                    sx={{
                        backdropFilter: 'blur(10px)',
                        bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(25, 25, 35, 0.95)'  // Fond foncé en mode sombre
                            : 'rgba(255, 255, 255, 0.95)', // Fond blanc en mode clair
                        boxShadow: 2,
                        color: textColor, // Couleur du texte adaptée au mode
                        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
                    }}
                >
                    <Container maxWidth="lg">
                        <Toolbar disableGutters>
                            {/* Logo et titre */}
                            <Typography
                                variant="h5"
                                component={RouterLink}
                                to="/"
                                sx={{
                                    mr: 2,
                                    fontWeight: 700,
                                    letterSpacing: '.1rem',
                                    color: '#e02323', // Toujours rouge
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <LibraryMusicIcon sx={{ mr: 1 }} />
                                POLO<Box component="span" sx={{ color: 'text.primary' }}>STORE</Box>
                            </Typography>

                            {/* Navigation sur desktop */}
                            {!isMobile && (
                                <Box sx={{ flexGrow: 1, display: 'flex', ml: 2 }}>
                                    <Button
                                        component={RouterLink}
                                        to="/"
                                        sx={{
                                            borderRadius: 2,
                                            mx: 0.5,
                                            position: 'relative',
                                            color: textColor, // Couleur du texte adaptée
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: 0,
                                                left: '50%',
                                                width: location.pathname === '/' ? '100%' : '0%',
                                                height: '3px',
                                                bgcolor: activeTabColor, // Rouge pour l'onglet actif
                                                transition: 'all 0.3s ease',
                                                transform: 'translateX(-50%)'
                                            },
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(224, 35, 35, 0.05)', // Fond légèrement rouge en survol
                                                color: theme.palette.mode === 'dark' ? '#ffffff' : '#e02323', // Texte blanc en mode sombre, rouge en mode clair
                                            },
                                            '&:hover::after': {
                                                width: '80%',
                                                bgcolor: hoverColor // Rouge vif en survol
                                            }
                                        }}
                                        startIcon={<HomeIcon />}
                                    >
                                        Accueil
                                    </Button>

                                    <Button
                                        component={RouterLink}
                                        to="/productions"
                                        sx={{
                                            borderRadius: 2,
                                            mx: 0.5,
                                            position: 'relative',
                                            color: textColor, // Couleur du texte adaptée
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: 0,
                                                left: '50%',
                                                width: location.pathname === '/productions' ? '100%' : '0%',
                                                height: '3px',
                                                bgcolor: activeTabColor, // Rouge pour l'onglet actif
                                                transition: 'all 0.3s ease',
                                                transform: 'translateX(-50%)'
                                            },
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(224, 35, 35, 0.05)', // Fond légèrement rouge en survol
                                                color: theme.palette.mode === 'dark' ? '#ffffff' : '#e02323', // Texte blanc en mode sombre, rouge en mode clair
                                            },
                                            '&:hover::after': {
                                                width: '80%',
                                                bgcolor: hoverColor // Rouge vif en survol
                                            }
                                        }}
                                        startIcon={<LibraryMusicIcon />}
                                    >
                                        Productions
                                    </Button>

                                    {(!isAuthenticated() || !isAdmin()) && (
                                        <Button
                                            component={RouterLink}
                                            to="/contact"
                                            sx={{
                                                borderRadius: 2,
                                                mx: 0.5,
                                                position: 'relative',
                                                color: textColor, // Couleur du texte adaptée
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: '50%',
                                                    width: location.pathname === '/contact' ? '100%' : '0%',
                                                    height: '3px',
                                                    bgcolor: activeTabColor, // Rouge pour l'onglet actif
                                                    transition: 'all 0.3s ease',
                                                    transform: 'translateX(-50%)'
                                                },
                                                '&:hover': {
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(224, 35, 35, 0.05)', // Fond légèrement rouge en survol
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#e02323', // Texte blanc en mode sombre, rouge en mode clair
                                                },
                                                '&:hover::after': {
                                                    width: '80%',
                                                    bgcolor: hoverColor // Rouge vif en survol
                                                }
                                            }}
                                            startIcon={<EmailIcon />}
                                        >
                                            Contact
                                        </Button>
                                    )}
                                </Box>
                            )}

                            {/* Insérer le bouton de changement de thème ici */}
                            {themeToggle && (
                                <Box sx={{ mx: 1 }}>
                                    {themeToggle}
                                </Box>
                            )}

                            {/* Actions sur desktop */}
                            {!isMobile && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {isAuthenticated() ? (
                                        <>
                                            {isAdmin() && (
                                                <>
                                                    <Button
                                                        color="inherit"
                                                        onClick={handleAdminMenuOpen}
                                                        endIcon={<KeyboardArrowDownIcon />}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            bgcolor: isAdminMenuOpen ? 'action.selected' : 'transparent'
                                                        }}
                                                    >
                                                        Admin
                                                    </Button>
                                                    {renderAdminMenu}
                                                </>
                                            )}

                                            <Button
                                                onClick={handleProfileMenuOpen}
                                                color="inherit"
                                                sx={{
                                                    ml: 1,
                                                    borderRadius: 6,
                                                    px: 1,
                                                    py: 0.5,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    bgcolor: isProfileMenuOpen ? 'action.selected' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                    }
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        mr: 1,
                                                        bgcolor: isAdmin() ? activeTabColor : hoverColor // Utilisation des nouvelles couleurs
                                                    }}
                                                >
                                                    {username ? username.charAt(0).toUpperCase() : 'U'}
                                                </Avatar>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.1 }}>
                                                        {username || 'Utilisateur'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ lineHeight: 1 }}>
                                                        {isAdmin() ? 'Admin' : 'Utilisateur'}
                                                    </Typography>
                                                </Box>
                                            </Button>
                                            {renderProfileMenu}
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                component={RouterLink}
                                                to="/login"
                                                color="inherit"
                                                variant="text"
                                                startIcon={<LockOpenIcon />}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Connexion
                                            </Button>

                                            <Button
                                                component={RouterLink}
                                                to="/register"
                                                variant="contained"
                                                sx={{
                                                    ml: 1,
                                                    borderRadius: 2,
                                                    bgcolor: activeTabColor,
                                                    '&:hover': {
                                                        bgcolor: hoverColor
                                                    }
                                                }}
                                                startIcon={<PersonAddIcon />}
                                            >
                                                Inscription
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            )}

                            {/* Menu hamburger pour mobile */}
                            {isMobile && (
                                <Box sx={{ display: 'flex', ml: 'auto' }}>
                                    {isAuthenticated() && isAdmin() && (
                                        <IconButton
                                            color="inherit"
                                            onClick={handleAdminMenuOpen}
                                            sx={{ mr: 1 }}
                                        >
                                            <Badge color="secondary" variant="dot">
                                                <DashboardIcon />
                                            </Badge>
                                        </IconButton>
                                    )}

                                    <IconButton
                                        size="large"
                                        color="inherit"
                                        onClick={handleMobileMenuOpen}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </Toolbar>
                    </Container>
                </AppBar>
            </HideOnScroll>

            {renderMobileMenu}
        </>
    );
};

export default Layout;
