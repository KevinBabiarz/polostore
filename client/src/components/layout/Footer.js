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
    const { t } = useTranslation('footer');
    const currentYear = new Date().getFullYear();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Fonction pour remonter en haut de la page
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fonction pour rediriger vers la page de contact
    const goToContact = () => {
        navigate('/contact');
    };

    // URLs des réseaux sociaux
    const socialLinks = {
        facebook: "https://www.facebook.com/PoloBeatsProd",
        twitter: "https://x.com/beats_polo",
        instagram: "https://www.instagram.com/polobeatsprod",
        youtube: "https://www.youtube.com/@polobeatsprod2710"
    };

    return (
        <Box component="footer" sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            pt: { xs: 4, sm: 5, md: 6 },
            pb: { xs: 3, sm: 3, md: 4 },
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
                    right: { xs: 16, sm: 20, md: 24 },
                    top: { xs: 8, sm: 12, md: 16 },
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'primary.dark' },
                    zIndex: 10,
                    width: { xs: 40, sm: 44, md: 48 },
                    height: { xs: 40, sm: 44, md: 48 }
                }}
                aria-label={t('backToTop')}
            >
                <ArrowUpwardIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
            </IconButton>

            <Container maxWidth="lg">
                <Grid container spacing={{ xs: 3, sm: 4, md: 4 }} justifyContent="center" alignItems="flex-start">

                    {/* Section Logo & Slogan */}
                    <Grid item xs={12} sm={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} mb={2}>
                            <MusicNoteIcon color="primary" sx={{ fontSize: { xs: 28, sm: 30, md: 32 }, mr: 1 }} />
                            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' } }}>
                                POLOBEATSPROD
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.875rem' },
                                mb: { xs: 2, md: 3 },
                                maxWidth: { xs: '100%', md: '280px' }
                            }}
                        >
                            {t('slogan')}
                        </Typography>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <LanguageSelector />
                        </Box>
                    </Grid>

                    {/* Section Navigation */}
                    <Grid item xs={12} sm={12} md={4} sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="subtitle1"
                            color="primary.main"
                            mb={{ xs: 2, sm: 2, md: 2 }}
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.125rem' } }}
                        >
                            {t('navigation')}
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1, sm: 1.5, md: 2 }}
                            justifyContent="center"
                            flexWrap="wrap"
                            sx={{ gap: { xs: 1, sm: 1 } }}
                        >
                            <Button
                                component={RouterLink}
                                to="/"
                                color="inherit"
                                sx={{
                                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.875rem' },
                                    textTransform: 'none',
                                    minWidth: { xs: 'auto', sm: 'auto' },
                                    px: { xs: 2, sm: 1.5 },
                                    py: { xs: 0.5, sm: 0.5 }
                                }}
                            >
                                {t('home')}
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/productions"
                                color="inherit"
                                sx={{
                                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.875rem' },
                                    textTransform: 'none',
                                    minWidth: { xs: 'auto', sm: 'auto' },
                                    px: { xs: 2, sm: 1.5 },
                                    py: { xs: 0.5, sm: 0.5 }
                                }}
                            >
                                {t('productions')}
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/contact"
                                color="inherit"
                                sx={{
                                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.875rem' },
                                    textTransform: 'none',
                                    minWidth: { xs: 'auto', sm: 'auto' },
                                    px: { xs: 2, sm: 1.5 },
                                    py: { xs: 0.5, sm: 0.5 }
                                }}
                            >
                                {t('contact')}
                            </Button>
                            {isAuthenticated && (
                                <Button
                                    component={RouterLink}
                                    to="/favorites"
                                    color="inherit"
                                    sx={{
                                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.875rem' },
                                        textTransform: 'none',
                                        minWidth: { xs: 'auto', sm: 'auto' },
                                        px: { xs: 2, sm: 1.5 },
                                        py: { xs: 0.5, sm: 0.5 }
                                    }}
                                >
                                    {t('favorites')}
                                </Button>
                            )}
                            <Button
                                component={RouterLink}
                                to="/cgu"
                                color="inherit"
                                sx={{
                                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.875rem' },
                                    textTransform: 'none',
                                    opacity: 0.8,
                                    minWidth: { xs: 'auto', sm: 'auto' },
                                    px: { xs: 2, sm: 1.5 },
                                    py: { xs: 0.5, sm: 0.5 }
                                }}
                                aria-label={t('termsOfServiceAria')}
                            >
                                {t('termsOfService')}
                            </Button>
                        </Stack>
                    </Grid>

                    {/* Section Réseaux Sociaux */}
                    <Grid item xs={12} sm={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                        <Typography
                            variant="subtitle1"
                            color="primary.main"
                            mb={{ xs: 2, sm: 2, md: 2 }}
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.125rem' } }}
                        >
                            {t('followUs')}
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={{ xs: 1.5, sm: 2, md: 1.5 }}
                            justifyContent={{ xs: 'center', md: 'flex-end' }}
                            mb={{ xs: 0, md: 2 }}
                        >
                            <IconButton
                                onClick={goToContact}
                                color="primary"
                                aria-label={t('contactAria')}
                                sx={{
                                    bgcolor: { xs: 'primary.light', md: 'transparent' },
                                    color: { xs: 'white', md: 'primary.main' },
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s',
                                    width: { xs: 44, sm: 48, md: 44 },
                                    height: { xs: 44, sm: 48, md: 44 }
                                }}
                            >
                                <EmailIcon sx={{ fontSize: { xs: 20, sm: 22, md: 20 } }} />
                            </IconButton>
                            <IconButton
                                component="a"
                                href={socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                                aria-label={t('facebookAria')}
                                sx={{
                                    bgcolor: { xs: 'primary.light', md: 'transparent' },
                                    color: { xs: 'white', md: 'primary.main' },
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s',
                                    width: { xs: 44, sm: 48, md: 44 },
                                    height: { xs: 44, sm: 48, md: 44 }
                                }}
                            >
                                <FacebookIcon sx={{ fontSize: { xs: 20, sm: 22, md: 20 } }} />
                            </IconButton>
                            <IconButton
                                component="a"
                                href={socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                                aria-label={t('twitterAria')}
                                sx={{
                                    bgcolor: { xs: 'primary.light', md: 'transparent' },
                                    color: { xs: 'white', md: 'primary.main' },
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s',
                                    width: { xs: 44, sm: 48, md: 44 },
                                    height: { xs: 44, sm: 48, md: 44 }
                                }}
                            >
                                <TwitterIcon sx={{ fontSize: { xs: 20, sm: 22, md: 20 } }} />
                            </IconButton>
                            <IconButton
                                component="a"
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                                aria-label={t('instagramAria')}
                                sx={{
                                    bgcolor: { xs: 'primary.light', md: 'transparent' },
                                    color: { xs: 'white', md: 'primary.main' },
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s',
                                    width: { xs: 44, sm: 48, md: 44 },
                                    height: { xs: 44, sm: 48, md: 44 }
                                }}
                            >
                                <InstagramIcon sx={{ fontSize: { xs: 20, sm: 22, md: 20 } }} />
                            </IconButton>
                            <IconButton
                                component="a"
                                href={socialLinks.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                                aria-label={t('youtubeAria')}
                                sx={{
                                    bgcolor: { xs: 'primary.light', md: 'transparent' },
                                    color: { xs: 'white', md: 'primary.main' },
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s',
                                    width: { xs: 44, sm: 48, md: 44 },
                                    height: { xs: 44, sm: 48, md: 44 }
                                }}
                            >
                                <YouTubeIcon sx={{ fontSize: { xs: 20, sm: 22, md: 20 } }} />
                            </IconButton>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Section Language Selector pour mobile/tablette et Copyright */}
                <Box sx={{ mt: { xs: 3, sm: 4, md: 4 } }}>
                    {/* Sélecteur de langue pour mobile/tablette */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="subtitle2"
                                color="primary.main"
                                mb={1}
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                            >
                                {t('language')}
                            </Typography>
                            <LanguageSelector />
                        </Box>
                    </Box>

                    {/* Divider */}
                    <Divider sx={{ mb: 2 }} />

                    {/* Copyright */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.8rem' },
                            textAlign: 'center',
                            opacity: 0.8
                        }}
                    >
                        © {currentYear} PoloBeatsProd. {t('allRightsReserved')}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
