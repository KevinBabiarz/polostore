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
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToContact = () => {
        navigate('/contact');
    };

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
            pb: { xs: 3, md: 4 },
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
                aria-label={t('backToTop')}
            >
                <ArrowUpwardIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>

            <Container maxWidth="lg">
                {/* Layout unifié pour tous les écrans */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: { xs: 3, md: 4 }
                }}>

                    {/* Section Logo & Slogan - Toujours centré */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: '100%'
                    }}>
                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                            <MusicNoteIcon color="primary" sx={{ fontSize: { xs: 28, md: 32 }, mr: 1 }} />
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary.main"
                                sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                            >
                                POLOBEATSPROD
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.85rem', md: '0.875rem' },
                                maxWidth: { xs: '280px', md: '320px' }
                            }}
                        >
                            {t('slogan')}
                        </Typography>
                    </Box>

                    {/* Section Navigation - Toujours centrée */}
                    <Box sx={{ width: '100%', maxWidth: '600px' }}>
                        <Typography
                            variant="subtitle1"
                            color="primary.main"
                            mb={2}
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}
                        >
                            {t('navigation')}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: { xs: 1, md: 2 },
                            alignItems: 'center'
                        }}>
                            <Button
                                component={RouterLink}
                                to="/"
                                color="inherit"
                                sx={{
                                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                                    minWidth: 'auto',
                                    px: { xs: 1.5, md: 2 },
                                    py: 0.5
                                }}
                            >
                                {t('home')}
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/productions"
                                color="inherit"
                                sx={{
                                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                                    minWidth: 'auto',
                                    px: { xs: 1.5, md: 2 },
                                    py: 0.5
                                }}
                            >
                                {t('productions')}
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/contact"
                                color="inherit"
                                sx={{
                                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                                    minWidth: 'auto',
                                    px: { xs: 1.5, md: 2 },
                                    py: 0.5
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
                                        fontSize: { xs: '0.85rem', md: '0.875rem' },
                                        minWidth: 'auto',
                                        px: { xs: 1.5, md: 2 },
                                        py: 0.5
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
                                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                                    opacity: 0.8,
                                    minWidth: 'auto',
                                    px: { xs: 1.5, md: 2 },
                                    py: 0.5
                                }}
                            >
                                {t('termsOfService')}
                            </Button>
                        </Box>
                    </Box>

                    {/* Section Réseaux Sociaux - Toujours centrée */}
                    <Box>
                        <Typography
                            variant="subtitle1"
                            color="primary.main"
                            mb={2}
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}
                        >
                            {t('followUs')}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: { xs: 1.5, md: 2 },
                            flexWrap: 'wrap'
                        }}>
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
                                    width: { xs: 44, md: 48 },
                                    height: { xs: 44, md: 48 }
                                }}
                            >
                                <EmailIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
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
                                    width: { xs: 44, md: 48 },
                                    height: { xs: 44, md: 48 }
                                }}
                            >
                                <FacebookIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
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
                                    width: { xs: 44, md: 48 },
                                    height: { xs: 44, md: 48 }
                                }}
                            >
                                <TwitterIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
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
                                    width: { xs: 44, md: 48 },
                                    height: { xs: 44, md: 48 }
                                }}
                            >
                                <InstagramIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
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
                                    width: { xs: 44, md: 48 },
                                    height: { xs: 44, md: 48 }
                                }}
                            >
                                <YouTubeIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Section Sélecteur de langue - Centrée */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="primary.main"
                            mb={1}
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        >
                            {t('language')}
                        </Typography>
                        <LanguageSelector />
                    </Box>

                    {/* Divider */}
                    <Divider sx={{ width: '100%', maxWidth: '400px' }} />

                    {/* Copyright - Centré */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: '0.75rem', md: '0.8rem' },
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
