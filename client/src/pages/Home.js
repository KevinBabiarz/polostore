// src/pages/Home.js
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Grid, Card,
    CardContent, Button, CircularProgress, Alert,
    Paper, Chip, IconButton, useTheme, useMediaQuery,
    Stack, Fade
} from '@mui/material';
import {
    ArrowForward, MusicNote, Email, CheckCircle,
    PlayArrow, ArrowForwardIos
} from '@mui/icons-material';
import { isAuthenticated } from '../services/authService';
import config from '../config/config';

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 6,
                    mb: 8
                }}
            >
                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h2" fontWeight="bold" gutterBottom color="primary.main">
                        Bienvenue sur PoloStore
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
                        La plateforme pour découvrir, écouter et acheter des productions musicales exclusives.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                        <Button
                            variant="contained"
                            size="large"
                            color="primary"
                            endIcon={<ArrowForwardIos />}
                            onClick={() => navigate('/productions')}
                            sx={{ borderRadius: 8, px: 4 }}
                        >
                            Explorer
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            color="primary"
                            onClick={() => navigate('/register')}
                            sx={{ borderRadius: 8, px: 4 }}
                        >
                            S'inscrire
                        </Button>
                    </Stack>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <img
                        src="/images/vinyl-record.svg"
                        alt="Vinyle PoloStore"
                        style={{ maxWidth: 320, width: '100%', height: 'auto', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.12))' }}
                    />
                </Box>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderRadius: 4, textAlign: 'center', py: 4 }}>
                        <MusicNote color="primary" sx={{ fontSize: 48, mb: 2 }} />
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Productions exclusives
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                Accédez à un catalogue unique de beats et musiques pour tous vos projets.
                            </Typography>
                            <Button variant="text" onClick={() => navigate('/productions')} endIcon={<PlayArrow />}>
                                Découvrir
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderRadius: 4, textAlign: 'center', py: 4 }}>
                        <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Qualité professionnelle
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                Toutes nos productions sont réalisées par des artistes et beatmakers expérimentés.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderRadius: 4, textAlign: 'center', py: 4 }}>
                        <Email color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Rejoignez la communauté
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                Inscrivez-vous pour sauvegarder vos favoris et recevoir nos nouveautés.
                            </Typography>
                            <Button variant="text" onClick={() => navigate('/register')} endIcon={<ArrowForward />}>
                                S'inscrire
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
