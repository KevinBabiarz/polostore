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

const Footer = () => {
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
                aria-label="Remonter en haut"
            >
                <ArrowUpwardIcon />
            </IconButton>
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
                    {/* Logo & Slogan */}
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 3, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
                        <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} mb={1}>
                            <MusicNoteIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                POLOBEATSPROD
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Productions musicales exclusives & qualité pro.
                        </Typography>
                    </Grid>
                    {/* Navigation */}
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center', display: { xs: 'flex', md: 'block' }, flexDirection: { xs: 'column', md: 'unset' }, alignItems: { xs: 'center', md: 'unset' }, justifyContent: { xs: 'center', md: 'unset' } }}>
                        <Box mb={1} sx={{ width: '100%', display: { xs: 'flex', md: 'block' }, flexDirection: { xs: 'column', md: 'unset' }, alignItems: { xs: 'center', md: 'unset' }, justifyContent: { xs: 'center', md: 'unset' } }}>
                            <Button component={RouterLink} to="/" color="inherit" sx={{ mx: 1 }} size="small">Accueil</Button>
                            <Button component={RouterLink} to="/productions" color="inherit" sx={{ mx: 1 }} size="small">Productions</Button>
                            <Button component={RouterLink} to="/contact" color="inherit" sx={{ mx: 1 }} size="small">Contact</Button>
                            {isAuthenticated && (
                                <Button component={RouterLink} to="/favorites" color="inherit" sx={{ mx: 1 }} size="small">Favoris</Button>
                            )}
                        </Box>
                        <Divider sx={{ my: 1, display: { xs: 'block', md: 'none' } }} />
                    </Grid>
                    {/* Contact & Réseaux */}
                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                        <Box mb={1} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                            <IconButton
                                onClick={goToContact}
                                color="primary"
                                aria-label="Contact"
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
                                aria-label="Facebook"
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
                                aria-label="Twitter"
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
                                aria-label="Instagram"
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
                                aria-label="YouTube"
                                sx={{
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.1)' }
                                }}
                            >
                                <YouTubeIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            &copy; {currentYear} POLOBEATSPROD. Tous droits réservés.
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;