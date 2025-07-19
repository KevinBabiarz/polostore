// src/components/layout/Footer.js
import React from 'react';
import {
    Box,
    Container,
    Typography,
    Link,
    Grid,
    IconButton,
    Divider,
    useTheme,
    useMediaQuery,
    Button
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
            pt: 6,
            pb: 3,
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
                    right: 24,
                    top: 16,
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'primary.dark' },
                    zIndex: 10
                }}
                size="large"
                aria-label={t('backToTop')}
            >
                <ArrowUpwardIcon />
            </IconButton>
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between" alignItems="flex-start">
                    {/* Logo & Slogan */}
                    <Grid item xs={12} md={3.5} sx={{ mb: { xs: 3, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
                        <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} mb={1}>
                            <MusicNoteIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                POLOBEATSPROD
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {t('slogan')}
                        </Typography>
                    </Grid>
                    {/* Navigation */}
                    <Grid item xs={12} md={5} sx={{
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: { md: '120px' } // Hauteur minimale pour éviter les décalages
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row', md: 'column' },
                            flexWrap: 'wrap',
                            gap: { xs: 0.5, sm: 1 },
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 1,
                            maxWidth: '100%'
                        }}>
                            <Button
                                component={RouterLink}
                                to="/"
                                color="inherit"
                                size="small"
                                sx={{
                                    minWidth: 'auto',
                                    px: { xs: 0.5, sm: 1 },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
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
                                    minWidth: 'auto',
                                    px: { xs: 0.5, sm: 1 },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
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
                                    minWidth: 'auto',
                                    px: { xs: 0.5, sm: 1 },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {t('contact')}
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/cgu"
                                color="inherit"
                                size="small"
                                sx={{
                                    minWidth: 'auto',
                                    px: { xs: 0.5, sm: 1 },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {t('cgu')}
                            </Button>
                            {isAuthenticated && (
                                <Button
                                    component={RouterLink}
                                    to="/favorites"
                                    color="inherit"
                                    size="small"
                                    sx={{
                                        minWidth: 'auto',
                                        px: { xs: 0.5, sm: 1 },
                                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {t('favorites')}
                                </Button>
                            )}
                        </Box>
                        <Divider sx={{ my: 1, display: { xs: 'block', md: 'none' }, width: '100%' }} />
                    </Grid>
                    {/* Contact & Réseaux */}
                    <Grid item xs={12} md={3.5} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                        <Box mb={1} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, flexWrap: 'wrap', gap: 0.5 }}>
                            <IconButton
                                onClick={goToContact}
                                color="primary"
                                aria-label={t('contactAria')}
                                sx={{
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.1)' }
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
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.1)' }
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
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.1)' }
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
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.1)' }
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
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.1)' }
                                }}
                            >
                                <YouTubeIcon />
                            </IconButton>
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                lineHeight: 1.4,
                                maxWidth: '100%',
                                wordBreak: 'break-word',
                                hyphens: 'auto'
                            }}
                        >
                            {t('copyright', { year: currentYear })} - {t('allRightsReserved')}
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;