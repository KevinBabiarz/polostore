// src/components/layout/Footer.js
import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    IconButton,
    Divider,
    useTheme,
    useMediaQuery,
    Button,
    Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EmailIcon from '@mui/icons-material/Email';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../ui/LanguageSelector';

const Footer = () => {
    const { t } = useTranslation('footer'); // Spécifier le namespace footer
    const currentYear = new Date().getFullYear();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Fonction pour remonter en haut de la page
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fonction pour rediriger vers la page de contact
    const goToContact = () => {
        navigate('/contact');
    };

    // URLs des réseaux sociaux - à remplacer par vos vrais liens
    const socialLinks = {
        facebook: "https://www.facebook.com/PoloBeatsProd",
        twitter: "https://x.com/beats_polo",
        instagram: "https://www.instagram.com/polobeatsprod",
        youtube: "https://www.youtube.com/@polobeatsprod2710"
    };

    return (
        <Box component="footer" sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            pt: { xs: 4, md: 6 },
            pb: { xs: 2, md: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 'auto',
            position: 'relative',
        }}>
            {/* Bouton retour en haut */}
            <IconButton
                onClick={scrollToTop}
                sx={{
                    position: 'absolute',
                    right: { xs: 16, md: 24 },
                    top: { xs: 8, md: 16 },
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'primary.dark' },
                    zIndex: 10,
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 }
                }}
                size={isMobile ? "medium" : "large"}
                aria-label={t('backToTop')}
            >
                <ArrowUpwardIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>

            <Container maxWidth="lg">
                {/* Version Mobile */}
                {isMobile ? (
                    <Stack spacing={3} alignItems="center">
                        {/* Logo & Slogan */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                <MusicNoteIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    POLOBEATSPROD
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {t('slogan')}
                            </Typography>
                        </Box>

                        <Divider sx={{ width: '80%' }} />

                        {/* Navigation Mobile */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="primary.main" mb={1} fontWeight="bold">
                                {t('navigation')}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" gap={1}>
                                <Button
                                    component={RouterLink}
                                    to="/"
                                    color="inherit"
                                    size="small"
                                    sx={{
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2
                                    }}
                                >
                                    {t('home')}
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/productions"
                                    color="inherit"
                                    size="small"
                                    sx={{
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2
                                    }}
                                >
                                    {t('productions')}
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/contact"
                                    color="inherit"
                                    size="small"
                                    sx={{
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2
                                    }}
                                >
                                    {t('contact')}
                                </Button>
                                {isAuthenticated && (
                                    <Button
                                        component={RouterLink}
                                        to="/favorites"
                                        color="inherit"
                                        size="small"
                                        sx={{
                                            fontSize: '0.75rem',
                                            minWidth: 'auto',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        {t('favorites')}
                                    </Button>
                                )}
                            </Stack>
                        </Box>

                        <Divider sx={{ width: '80%' }} />

                        {/* Réseaux sociaux Mobile */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="primary.main" mb={1} fontWeight="bold">
                                {t('followUs')}
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="center">
                                <IconButton
                                    onClick={goToContact}
                                    color="primary"
                                    aria-label={t('contactAria')}
                                    sx={{
                                        bgcolor: 'primary.light',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <EmailIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('facebookAria')}
                                    sx={{
                                        bgcolor: 'primary.light',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FacebookIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('twitterAria')}
                                    sx={{
                                        bgcolor: 'primary.light',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <TwitterIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('instagramAria')}
                                    sx={{
                                        bgcolor: 'primary.light',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <InstagramIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('youtubeAria')}
                                    sx={{
                                        bgcolor: 'primary.light',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <YouTubeIcon />
                                </IconButton>
                            </Stack>
                        </Box>

                        {/* Sélecteur de langue Mobile */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="primary.main" mb={1} fontWeight="bold">
                                {t('language')}
                            </Typography>
                            <LanguageSelector />
                        </Box>

                        <Divider sx={{ width: '60%' }} />

                        {/* CGU et Copyright Mobile */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: '0.7rem',
                                    textAlign: 'center',
                                    opacity: 0.8,
                                    mb: 1
                                }}
                            >
                                © {currentYear} PoloBeatsProd. {t('allRightsReserved')}
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/cgu"
                                color="inherit"
                                size="small"
                                sx={{
                                    fontSize: '0.65rem',
                                    minWidth: 'auto',
                                    px: 1,
                                    py: 0.25,
                                    opacity: 0.7,
                                    textDecoration: 'underline',
                                    '&:hover': {
                                        opacity: 1,
                                        bgcolor: 'transparent',
                                        textDecoration: 'underline'
                                    }
                                }}
                                aria-label={t('termsOfServiceAria')}
                            >
                                {t('termsOfService')}
                            </Button>
                        </Box>
                    </Stack>
                ) : (
                    /* Version Desktop - Code existant */
                    <Grid container spacing={4} justifyContent="space-between" alignItems="flex-start">
                        {/* Logo & Slogan */}
                        <Grid item xs={12} md={3.5} sx={{ textAlign: 'left' }}>
                            <Box display="flex" alignItems="center" mb={1}>
                                <MusicNoteIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    POLOBEATSPROD
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                {t('slogan')}
                            </Typography>
                            <LanguageSelector />
                        </Grid>

                        {/* Navigation Desktop */}
                        <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle1" color="primary.main" mb={2} fontWeight="bold">
                                {t('navigation')}
                            </Typography>
                            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                                <Button component={RouterLink} to="/" color="inherit">
                                    {t('home')}
                                </Button>
                                <Button component={RouterLink} to="/productions" color="inherit">
                                    {t('productions')}
                                </Button>
                                <Button component={RouterLink} to="/contact" color="inherit">
                                    {t('contact')}
                                </Button>
                                {isAuthenticated && (
                                    <Button component={RouterLink} to="/favorites" color="inherit">
                                        {t('favorites')}
                                    </Button>
                                )}
                            </Stack>
                        </Grid>

                        {/* Contact & Réseaux Desktop */}
                        <Grid item xs={12} md={3.5} sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle1" color="primary.main" mb={2} fontWeight="bold">
                                {t('followUs')}
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="flex-end" mb={2}>
                                <IconButton
                                    onClick={goToContact}
                                    color="primary"
                                    aria-label={t('contactAria')}
                                    sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                                >
                                    <EmailIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('facebookAria')}
                                    sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                                >
                                    <FacebookIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('twitterAria')}
                                    sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                                >
                                    <TwitterIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('instagramAria')}
                                    sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                                >
                                    <InstagramIcon />
                                </IconButton>
                                <IconButton
                                    component="a"
                                    href={socialLinks.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    aria-label={t('youtubeAria')}
                                    sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                                >
                                    <YouTubeIcon />
                                </IconButton>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                © {currentYear} PoloBeatsProd. {t('allRightsReserved')} • {' '}
                                <Button
                                    component={RouterLink}
                                    to="/cgu"
                                    color="inherit"
                                    size="small"
                                    sx={{
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        p: 0,
                                        textDecoration: 'underline',
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: 'transparent',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                    aria-label={t('termsOfServiceAria')}
                                >
                                    {t('termsOfService')}
                                </Button>
                            </Typography>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Footer;