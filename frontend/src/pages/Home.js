// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductions } from '../services/productionService';
import {
    Container, Typography, Box, Grid, Card, CardMedia,
    CardContent, Button, Divider, CircularProgress
} from '@mui/material';
import { MusicNote, Email, Album } from '@mui/icons-material';
import config from '../config/config';

const Home = () => {
    const [latestProductions, setLatestProductions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestProductions = async () => {
            try {
                setLoading(true);
                const data = await getProductions(1, { limit: 3 });
                setLatestProductions(data.productions);
            } catch (error) {
                console.error("Erreur lors du chargement des productions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestProductions();
    }, []);

    return (
        <Container maxWidth="lg">
            {/* Section héro */}
            <Box sx={{
                py: 8,
                textAlign: 'center',
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(/hero-background.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                borderRadius: 2,
                mb: 6,
                p: 6
            }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Productions Musicales
                </Typography>
                <Typography variant="h5" color="inherit" paragraph>
                    Découvrez notre catalogue de productions musicales exceptionnelles
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/productions"
                    sx={{ mt: 2 }}
                >
                    Explorer le catalogue
                </Button>
            </Box>

            {/* Section fonctionnalités */}
            <Box sx={{ py: 6 }}>
                <Typography variant="h4" component="h2" align="center" gutterBottom>
                    Notre plateforme
                </Typography>
                <Divider sx={{ mb: 6 }} />

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                            <Album fontSize="large" color="primary" sx={{ mb: 2, fontSize: 60 }} />
                            <Typography variant="h5" component="h3" gutterBottom align="center">
                                Catalogue Riche
                            </Typography>
                            <Typography align="center">
                                Explorez notre vaste collection de productions musicales dans divers genres.
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                            <MusicNote fontSize="large" color="primary" sx={{ mb: 2, fontSize: 60 }} />
                            <Typography variant="h5" component="h3" gutterBottom align="center">
                                Favoris Personnalisés
                            </Typography>
                            <Typography align="center">
                                Créez votre liste de favoris pour retrouver facilement vos productions préférées.
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                            <Email fontSize="large" color="primary" sx={{ mb: 2, fontSize: 60 }} />
                            <Typography variant="h5" component="h3" gutterBottom align="center">
                                Support Réactif
                            </Typography>
                            <Typography align="center">
                                Contactez-nous pour toute question, notre équipe vous répondra rapidement.
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Section dernières productions */}
            <Box sx={{ py: 6 }}>
                <Typography variant="h4" component="h2" align="center" gutterBottom>
                    Dernières Productions
                </Typography>
                <Divider sx={{ mb: 6 }} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {latestProductions.map(production => (
                            <Grid item key={production.id} xs={12} sm={6} md={4}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={production.cover_image
                                            ? `${config.UPLOADS_URL}${production.cover_image}`
                                            : '/placeholder.jpg'}
                                        alt={production.title}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {production.title}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {production.artist}
                                        </Typography>
                                        <Button
                                            component={Link}
                                            to={`/productions/${production.id}`}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        >
                                            Voir détails
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        to="/productions"
                        size="large"
                    >
                        Voir toutes les productions
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Home;