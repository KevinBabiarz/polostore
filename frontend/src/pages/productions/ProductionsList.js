// src/pages/productions/ProductionsList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductions } from '../../services/productionService';
import {
    Container, Grid, Card, CardMedia, CardContent,
    Typography, Pagination, TextField, Button, Box
} from '@mui/material';
import config from '../../config/config';

const ProductionsList = () => {
    const [productions, setProductions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchProductions = async (currentPage, search) => {
        try {
            setLoading(true);
            const filters = search ? { search } : {};
            const data = await getProductions(currentPage, filters);
            setProductions(data.productions);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Erreur lors du chargement des productions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductions(page, searchTerm);
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchProductions(1, searchTerm);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Productions Musicales
            </Typography>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <TextField
                    label="Rechercher"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ mr: 2, flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                >
                    Rechercher
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>Chargement...</Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {productions.map(production => (
                            <Grid item xs={12} sm={6} md={4} key={production.id}>
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
                                        <Typography variant="body2" color="text.secondary">
                                            {production.artist}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {production.release_date && new Date(production.release_date).toLocaleDateString()}
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                component={Link}
                                                to={`/productions/${production.id}`}
                                                size="small"
                                                color="primary"
                                            >
                                                Voir détails
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {productions.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography>Aucune production trouvée</Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </>
            )}
        </Container>
    );
};

export default ProductionsList;