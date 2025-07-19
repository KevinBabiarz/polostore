// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Grid, Card,
    CardContent, Button, useTheme, useMediaQuery,
    Stack
} from '@mui/material';
import {
    ArrowForward, MusicNote, Email, CheckCircle,
    PlayArrow, ArrowForwardIos
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuth();
    const isUserLoggedIn = !!user;
    const { t } = useTranslation();

    const handleImageClick = () => {
        console.log(t('home:imageClicked')); // Namespace:clé
        window.open('https://distrokid.com/hyperfollow/polobeatsprod/121-bpm', '_blank');
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 8 } }}>
            {/* Suppression du texte animé et de l'animation */}
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
                        {t('home:welcomeTitle')}
                    </Typography>
                    <Typography
                        variant={isSmallMobile ? "body1" : "h5"}
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {t('home:welcomeSubtitle')}
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
                            {t('home:explore')}
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
                                {t('home:signUp')}
                            </Button>
                        )}
                    </Stack>
                </Box>
                <Box
                    sx={{
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
                        margin: '0 auto',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.08)',
                            boxShadow: 20,
                        }
                    }}
                    onClick={handleImageClick}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleImageClick();
                        }
                    }}
                >
                    <img
                        src="/images/COVER121BPM3000x3000.jpg"
                        alt={t('home:coverAlt')}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'brightness(0.85)',
                            transition: 'filter 0.3s',
                            zIndex: 0,
                        }}
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
                                {t('home:exclusiveProductions')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {t('home:exclusiveProductionsDescription')}
                            </Typography>
                            <Button variant="text" onClick={() => navigate('/productions')} endIcon={<PlayArrow />}>
                                {t('home:discover')}
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
                                {t('home:professionalQuality')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {t('home:professionalQualityDescription')}
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
                                    {t('home:joinCommunity')}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    {t('home:joinCommunityDescription')}
                                </Typography>
                                <Button variant="text" onClick={() => navigate('/register')} endIcon={<ArrowForward />}>
                                    {t('home:signUp')}
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
