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
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../ui/LanguageSelector';
import './AuthButtons.css';
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
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Layout = ({ themeToggle }) => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
    const location = useLocation();
    const { t } = useTranslation();

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
            slotProps={{
                paper: {
                    elevation: 3,
                    sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        minWidth: { xs: '90vw', sm: 250 },
                        maxWidth: '95vw',
                    }
                }
            }}
        >
            <MenuItem component={RouterLink} to="/" onClick={handleMobileMenuClose}>
                <IconButton size="small" color="inherit">
                    <HomeIcon />
                </IconButton>
                <Typography sx={{ ml: 1 }}>{t('navigation:home')}</Typography>
            </MenuItem>

            <MenuItem component={RouterLink} to="/productions" onClick={handleMobileMenuClose}>
                <IconButton size="small" color="inherit">
                    <LibraryMusicIcon />
                </IconButton>
                <Typography sx={{ ml: 1 }}>{t('navigation:productions')}</Typography>
            </MenuItem>

            {(!isAuthenticated() || !isAdmin()) && (
                <MenuItem component={RouterLink} to="/contact" onClick={handleMobileMenuClose}>
                    <IconButton size="small" color="inherit">
                        <EmailIcon />
                    </IconButton>
                    <Typography sx={{ ml: 1 }}>{t('navigation:contact')}</Typography>
                </MenuItem>
            )}

            {isAuthenticated() ? (
                <>
                    {isAdmin() && (
                        <>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'text.secondary' }}>
                                {t('admin:dashboard.title')}
                            </Typography>
                            <MenuItem component={RouterLink} to="/admin/dashboard" onClick={handleMobileMenuClose}>
                                <DashboardIcon fontSize="small" />
                                <Typography sx={{ ml: 1 }}>{t('admin:dashboard.title')}</Typography>
                            </MenuItem>
                            <MenuItem component={RouterLink} to="/admin/productions" onClick={handleMobileMenuClose}>
                                <LibraryMusicIcon fontSize="small" />
                                <Typography sx={{ ml: 1 }}>{t('admin:productionManagement.title')}</Typography>
                            </MenuItem>
                            <MenuItem component={RouterLink} to="/admin/productions/add" onClick={handleMobileMenuClose}>
                                <AddCircleIcon fontSize="small" />
                                <Typography sx={{ ml: 1 }}>{t('admin:dashboard.addProduction')}</Typography>
                            </MenuItem>
                            <MenuItem component={RouterLink} to="/admin/users" onClick={handleMobileMenuClose}>
                                <PersonAddIcon fontSize="small" />
                                <Typography sx={{ ml: 1 }}>{t('admin:userManagement.title')}</Typography>
                            </MenuItem>
                            <MenuItem component={RouterLink} to="/admin/messages" onClick={handleMobileMenuClose}>
                                <EmailIcon fontSize="small" />
                                <Typography sx={{ ml: 1 }}>{t('admin:messages.title')}</Typography>
                            </MenuItem>
                        </>
                    )}

                    <MenuItem component={RouterLink} to="/profile" onClick={handleMobileMenuClose}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: isAdmin() ? 'secondary.main' : 'primary.main' }}>
                            {username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ ml: 1 }}>{t('navigation:profile')}</Typography>
                    </MenuItem>

                    <Divider />

                    <MenuItem onClick={() => { handleMobileMenuClose(); handleLogout(); }}>
                        <IconButton size="small" color="inherit">
                            <ExitToAppIcon />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>{t('navigation:logout')}</Typography>
                    </MenuItem>
                </>
            ) : (
                <>
                    <MenuItem component={RouterLink} to="/login" onClick={handleMobileMenuClose}>
                        <IconButton size="small" color="inherit">
                            <LockOpenIcon />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>{t('navigation:login')}</Typography>
                    </MenuItem>

                    <MenuItem component={RouterLink} to="/register" onClick={handleMobileMenuClose}>
                        <IconButton size="small" color="inherit">
                            <PersonAddIcon />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>{t('navigation:register')}</Typography>
                    </MenuItem>
                </>
            )}
        </Menu>
    );

    // Menu admin pour les fonctions d'administration
    const renderAdminMenu = (
        <Menu
            anchorEl={adminMenuAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'right' : 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: isMobile ? 'right' : 'center' }}
            open={isAdminMenuOpen}
            onClose={handleAdminMenuClose}
            keepMounted
            slotProps={{
                paper: {
                    elevation: 3,
                    sx: {
                        borderRadius: 2,
                        width: { xs: '90vw', sm: 'auto' },
                        maxWidth: { xs: '95vw', sm: '400px' },
                        overflowX: 'hidden'
                    }
                }
            }}
            MenuListProps={{ dense: isMobile }}
        >
            <MenuItem component={RouterLink} to="/admin/dashboard" onClick={handleAdminMenuClose}>
                <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                {t('admin:dashboard.title')}
            </MenuItem>

            <MenuItem component={RouterLink} to="/admin/productions" onClick={handleAdminMenuClose}>
                <LibraryMusicIcon fontSize="small" sx={{ mr: 1 }} />
                {t('admin:productionManagement.title')}
            </MenuItem>

            <MenuItem component={RouterLink} to="/admin/productions/add" onClick={handleAdminMenuClose}>
                <AddCircleIcon fontSize="small" sx={{ mr: 1 }} />
                {t('admin:dashboard.addProduction')}
            </MenuItem>

            <MenuItem component={RouterLink} to="/admin/users" onClick={handleAdminMenuClose}>
                <Badge badgeContent="New" color="error" fontSize="small" sx={{ mr: 1 }}>
                    <PersonAddIcon fontSize="small" />
                </Badge>
                {t('admin:userManagement.title')}
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
                sx: {
                    borderRadius: 2,
                    width: { xs: '90vw', sm: 'auto' },
                    maxWidth: { xs: '95vw', sm: '300px' }
                }
            }}
        >
            <Box sx={{
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                textAlign: 'center'
            }}>
                <Avatar
                    sx={{
                        width: { xs: 45, sm: 60 },
                        height: { xs: 45, sm: 60 },
                        mx: 'auto',
                        mb: 1,
                        bgcolor: isAdmin() ? 'secondary.main' : 'primary.main'
                    }}
                >
                    {username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {username}
                </Typography>
                <Chip
                    label={isAdmin() ? t('admin:dashboard.title') : t('common:welcome')}
                    size="small"
                    color={isAdmin() ? 'secondary' : 'default'}
                    sx={{ mt: 0.5 }}
                />
            </Box>

            <Divider sx={{ my: 1 }} />

            <MenuItem component={RouterLink} to="/profile" onClick={handleProfileMenuClose}>
                {t('navigation:profile')}
            </MenuItem>

            <MenuItem component={RouterLink} to="/favorites" onClick={handleProfileMenuClose}>
                {t('navigation:favorites')}
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem onClick={handleLogout}>
                {t('navigation:logout')}
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
                    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
                        <Toolbar disableGutters sx={{
                            minHeight: { xs: '56px', sm: '64px', md: '70px' },
                            py: { xs: 0.5, sm: 0.75, md: 1 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'nowrap'
                        }}>
                            {/* Logo et titre */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: { xs: 1, sm: 0 },
                                mr: { xs: 1, sm: 2, md: 3 }
                            }}>
                                <Typography
                                    variant={isSmallScreen ? "h6" : isLarge ? "h4" : "h5"}
                                    component={RouterLink}
                                    to="/"
                                    sx={{
                                        fontWeight: 700,
                                        letterSpacing: { xs: '.05rem', sm: '.1rem', md: '.15rem' },
                                        color: '#e02323',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' }
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src="/images/PB-removebg-preview.png"
                                        alt="Logo POLOBEATSPROD"
                                        sx={{
                                            mr: { xs: 0.5, sm: 1, md: 1.5 },
                                            width: { xs: 24, sm: 28, md: 32, lg: 36 },
                                            height: { xs: 24, sm: 28, md: 32, lg: 36 },
                                            objectFit: 'contain',
                                            // Inverser les couleurs uniquement en mode clair pour rendre le logo visible
                                            filter: theme.palette.mode === 'dark' ? 'none' : 'invert(1)',
                                            transition: 'filter 0.3s ease'
                                        }}
                                    />
                                    POLO<Box component="span" sx={{
                                        color: 'text.primary',
                                        display: { xs: isExtraSmallScreen ? 'none' : 'inline', sm: 'inline' }
                                    }}>BEATSPROD</Box>
                                </Typography>
                            </Box>

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
                                            color: textColor,
                                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                            px: { xs: 0.75, sm: 1.5 },
                                            py: { xs: 0.5, sm: 0.75 },
                                            maxWidth: { xs: '110px', sm: '130px', md: '150px' },
                                            minWidth: { xs: '80px', sm: '100px' },
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
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
                                        startIcon={<HomeIcon fontSize="small" />}
                                    >
                                        {t('navigation:home')}
                                    </Button>

                                    <Button
                                        component={RouterLink}
                                        to="/productions"
                                        sx={{
                                            borderRadius: 2,
                                            mx: 0.5,
                                            position: 'relative',
                                            color: textColor,
                                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                            px: { xs: 0.75, sm: 1.5 },
                                            py: { xs: 0.5, sm: 0.75 },
                                            maxWidth: { xs: '110px', sm: '130px', md: '150px' },
                                            minWidth: { xs: '80px', sm: '100px' },
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
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
                                        startIcon={<LibraryMusicIcon fontSize="small" />}
                                    >
                                        {t('navigation:productions')}
                                    </Button>

                                    {(!isAuthenticated() || !isAdmin()) && (
                                        <Button
                                            component={RouterLink}
                                            to="/contact"
                                            sx={{
                                                borderRadius: 2,
                                                mx: 0.5,
                                                position: 'relative',
                                                color: textColor,
                                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                                px: { xs: 0.75, sm: 1.5 },
                                                py: { xs: 0.5, sm: 0.75 },
                                                maxWidth: { xs: '110px', sm: '130px', md: '150px' },
                                                minWidth: { xs: '80px', sm: '100px' },
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
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
                                            startIcon={<EmailIcon fontSize="small" />}
                                        >
                                            {t('navigation:contact')}
                                        </Button>
                                    )}
                                </Box>
                            )}

                            {/* Insérer le bouton de changement de thème ici */}
                            {themeToggle && (
                                <Box sx={{ mx: { xs: 0.5, sm: 1 }, display: { xs: 'none', md: 'block' } }}>
                                    {themeToggle}
                                </Box>
                            )}

                            {/* Sélecteur de langue */}
                            <Box sx={{ mx: { xs: 0.5, sm: 1 }, display: { xs: 'none', md: 'block' } }}>
                                <LanguageSelector size="small" />
                            </Box>

                            {/* Actions sur desktop - Version optimisée pour la responsivité */}
                            {!isMobile && (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: { xs: 0.5, sm: 0.75, md: 1 },
                                    ml: { xs: 0.5, sm: 1 }
                                }}>
                                    {isAuthenticated() ? (
                                        <>
                                            {isAdmin() && (
                                                <>
                                                    <Button
                                                        color="inherit"
                                                        onClick={handleAdminMenuOpen}
                                                        endIcon={isTablet ? null : <KeyboardArrowDownIcon />}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            bgcolor: isAdminMenuOpen ? 'action.selected' : 'transparent',
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                            px: { xs: 1, sm: 1.5 },
                                                        }}
                                                    >
                                                        {t('admin:dashboard.title')}
                                                    </Button>
                                                    {renderAdminMenu}
                                                </>
                                            )}

                                            <Button
                                                onClick={handleProfileMenuOpen}
                                                color="inherit"
                                                sx={{
                                                    ml: { xs: 0.5, sm: 1 },
                                                    borderRadius: 6,
                                                    px: { xs: 0.5, sm: 1 },
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
                                                        width: { xs: 24, sm: 32 },
                                                        height: { xs: 24, sm: 32 },
                                                        mr: { xs: 0.5, sm: 1 },
                                                        bgcolor: isAdmin() ? activeTabColor : hoverColor // Utilisation des nouvelles couleurs
                                                    }}
                                                >
                                                    {username ? username.charAt(0).toUpperCase() : 'U'}
                                                </Avatar>
                                                <Box sx={{
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    display: { xs: isTablet ? 'none' : 'flex', sm: 'flex' }
                                                }}>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 'bold',
                                                        lineHeight: 1.1,
                                                        fontSize: { xs: '0.7rem', sm: '0.875rem' }
                                                    }}>
                                                        {username || 'Utilisateur'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        lineHeight: 1,
                                                        fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                                    }}>
                                                        {isAdmin() ? 'Admin' : 'Utilisateur'}
                                                    </Typography>
                                                </Box>
                                            </Button>
                                            {renderProfileMenu}
                                        </>
                                    ) : (
                                        /* Boutons de connexion/inscription optimisés */
                                        <Box sx={{
                                            display: 'flex',
                                            gap: { xs: 0.5, sm: 0.75, md: 1 },
                                            alignItems: 'center'
                                        }}>
                                            <Button
                                                component={RouterLink}
                                                to="/login"
                                                color="inherit"
                                                variant="outlined"
                                                startIcon={<LockOpenIcon />}
                                                sx={{
                                                    borderRadius: 2,
                                                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                                                    px: { xs: 1, sm: 1.25, md: 1.5 },
                                                    py: { xs: 0.5, sm: 0.75 },
                                                    minWidth: { xs: '85px', sm: '100px', md: '120px' },
                                                    minHeight: { xs: 32, sm: 36, md: 40 },
                                                    borderColor: theme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.3)'
                                                        : 'rgba(224, 35, 35, 0.3)',
                                                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#e02323',
                                                    fontWeight: 500,
                                                    textTransform: 'none',
                                                    transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                        borderColor: theme.palette.mode === 'dark'
                                                            ? '#ffffff'
                                                            : '#e02323',
                                                        bgcolor: theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.05)'
                                                            : 'rgba(224, 35, 35, 0.05)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: theme.palette.mode === 'dark'
                                                            ? '0 4px 12px rgba(255, 255, 255, 0.1)'
                                                            : '0 4px 12px rgba(224, 35, 35, 0.2)'
                                                    }
                                                }}
                                            >
                                                {t('navigation:login')}
                                            </Button>

                                            <Button
                                                component={RouterLink}
                                                to="/register"
                                                variant="contained"
                                                startIcon={<PersonAddIcon />}
                                                sx={{
                                                    borderRadius: 2,
                                                    bgcolor: activeTabColor,
                                                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                                                    px: { xs: 1, sm: 1.25, md: 1.5 },
                                                    py: { xs: 0.5, sm: 0.75 },
                                                    minWidth: { xs: '85px', sm: '100px', md: '120px' },
                                                    minHeight: { xs: 32, sm: 36, md: 40 },
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    transition: 'all 0.2s ease-in-out',
                                                    boxShadow: theme.palette.mode === 'dark'
                                                        ? '0 2px 8px rgba(224, 35, 35, 0.3)'
                                                        : '0 2px 8px rgba(224, 35, 35, 0.2)',
                                                    '&:hover': {
                                                        bgcolor: hoverColor,
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: theme.palette.mode === 'dark'
                                                            ? '0 6px 16px rgba(224, 35, 35, 0.4)'
                                                            : '0 6px 16px rgba(224, 35, 35, 0.3)'
                                                    }
                                                }}
                                            >
                                                {t('navigation:register')}
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Menu hamburger pour mobile */}
                            {isMobile && (
                                <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center' }}>
                                    {themeToggle && (
                                        <Box sx={{ mr: 0.5, display: { xs: 'inline-flex', md: 'none' } }}>
                                            {themeToggle}
                                        </Box>
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
