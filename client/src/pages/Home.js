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
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuth();
    const isUserLoggedIn = !!user;

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 8 } }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: { xs: 3, sm: 4, md: 6 },
                    mb: { xs: 4, sm: 6, md: 8 }
                }}
            >
                <Box sx={{
                    flex: 1,
                    textAlign: { xs: 'center', md: 'left' },
                    maxWidth: { xs: '100%', md: '50%' }
                }}>
                    <Typography
                        variant={isSmallMobile ? "h3" : "h2"}
                        fontWeight="bold"
                        gutterBottom
                        color="primary.main"
                        sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
                    >
                        Bienvenue sur PoloBeatsProd
                    </Typography>
                    <Typography
                        variant={isSmallMobile ? "body1" : "h5"}
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        La plateforme pour découvrir, écouter et acheter des productions musicales exclusives.
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent={{ xs: 'center', md: 'flex-start' }}
                        sx={{ width: '100%' }}
                    >
                        <Button
                            variant="contained"
                            size={isSmallMobile ? "medium" : "large"}
                            color="primary"
                            endIcon={<ArrowForwardIos />}
                            onClick={() => navigate('/productions')}
                            sx={{
                                borderRadius: 8,
                                px: { xs: 2, sm: 3, md: 4 },
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Explorer
                        </Button>
                        {!isUserLoggedIn && (
                            <Button
                                variant="outlined"
                                size={isSmallMobile ? "medium" : "large"}
                                color="primary"
                                onClick={() => navigate('/register')}
                                sx={{
                                    borderRadius: 8,
                                    px: { xs: 2, sm: 3, md: 4 },
                                    width: { xs: '100%', sm: 'auto' }
                                }}
                            >
                                S'inscrire
                            </Button>
                        )}
                    </Stack>
                </Box>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    border: '1px solid #eaeaea',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3,
                    height: { xs: 300, sm: 350, md: 400 },
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 500, md: 600 },
                    margin: '0 auto'
                }}>
                    <img
                        src="/images/COVER121BPM3000x3000.jpg"
                        alt="Promotion en cours"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </Box>
            </Box>

            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
                <Grid item xs={12} sm={10} md={8} lg={6}>
                    <Card elevation={3} sx={{
                        borderRadius: 4,
                        textAlign: 'center',
                        py: { xs: 2, md: 4 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        maxWidth: 500,
                        mx: 'auto',
                        mb: 3
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <MusicNote color="primary" sx={{ fontSize: { xs: 36, md: 48 } }} />
                        </Box>
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
                <Grid item xs={12} sm={10} md={8} lg={6}>
                    <Card elevation={3} sx={{
                        borderRadius: 4,
                        textAlign: 'center',
                        py: { xs: 2, md: 4 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        maxWidth: 500,
                        mx: 'auto',
                        mb: 3
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <CheckCircle color="success" sx={{ fontSize: { xs: 36, md: 48 } }} />
                        </Box>
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
                {!isUserLoggedIn && (
                    <Grid item xs={12} sm={10} md={8} lg={6}>
                        <Card elevation={3} sx={{
                            borderRadius: 4,
                            textAlign: 'center',
                            py: { xs: 2, md: 4 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            maxWidth: 500,
                            mx: 'auto',
                            mb: 3
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                <Email color="secondary" sx={{ fontSize: { xs: 36, md: 48 } }} />
                            </Box>
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
                )}
            </Grid>
        </Container>
    );
};

export default Home;
