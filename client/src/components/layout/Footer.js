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

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAuthenticated, isAdmin } = useAuth();

    // Fonction pour remonter en haut de la page
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <Grid container spacing={4} justifyContent="space-between" alignItems="flex-start">
                    {/* Logo & Slogan */}
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 3, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
                        <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} mb={1}>
                            <MusicNoteIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                PoloStore
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Productions musicales exclusives & qualité pro.
                        </Typography>
                    </Grid>
                    {/* Navigation */}
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Box mb={1}>
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
                        <Box mb={1}>
                            <IconButton component="a" href="mailto:contact@polostore.com" color="primary" aria-label="Email">
                                <EmailIcon />
                            </IconButton>
                            <IconButton component="a" href="#" color="primary" aria-label="Facebook">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton component="a" href="#" color="primary" aria-label="Twitter">
                                <TwitterIcon />
                            </IconButton>
                            <IconButton component="a" href="#" color="primary" aria-label="Instagram">
                                <InstagramIcon />
                            </IconButton>
                            <IconButton component="a" href="#" color="primary" aria-label="YouTube">
                                <YouTubeIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            &copy; {currentYear} PoloStore. Tous droits réservés.
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;