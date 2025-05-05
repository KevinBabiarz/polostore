// src/pages/productions/ProductionDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProduction, deleteProduction } from '../../services/productionService';
import { addFavorite, removeFavorite, checkIsFavorite } from '../../services/favoriteService';
import {
    Container, Card, CardMedia, CardContent, Typography,
    Button, Box, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, CircularProgress, Alert
} from '@mui/material';
import {
    Favorite, FavoriteBorder, Edit, Delete, ArrowBack
} from '@mui/icons-material';
import config from '../../config/config';

const ProductionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [production, setProduction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getProduction(id);
                setProduction(data);

                if (user) {
                    const favoriteStatus = await checkIsFavorite(id);
                    setIsFavorite(favoriteStatus);
                }
            } catch (error) {
                console.error("Erreur lors du chargement de la production:", error);
                setError("Impossible de charger les détails de cette production");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    const handleToggleFavorite = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                await removeFavorite(id);
            } else {
                await addFavorite(id);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Erreur lors de la modification des favoris:", error);
        }
    };

    const handleEdit = () => {
        navigate(`/admin/productions/edit/${id}`);
    };

    const handleDelete = async () => {
        try {
            await deleteProduction(id);
            navigate('/productions');
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            setError("Impossible de supprimer cette production");
        }
        setOpenConfirmDialog(false);
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Box sx={{ mt: 2 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/productions')}
                    >
                        Retour aux productions
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!production) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="info">Production non trouvée</Alert>
                <Box sx={{ mt: 2 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/productions')}
                    >
                        Retour aux productions
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/productions')}
                sx={{ mb: 3 }}
            >
                Retour aux productions
            </Button>

            <Card>
                <CardMedia
                    component="img"
                    height="300"
                    image={production.cover_image
                        ? `${config.UPLOADS_URL}${production.cover_image}`
                        : '/placeholder.jpg'}
                    alt={production.title}
                />
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" component="h1">
                            {production.title}
                        </Typography>
                        {user && (
                            <Button
                                onClick={handleToggleFavorite}
                                startIcon={isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                            >
                                {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            </Button>
                        )}
                    </Box>

                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {production.artist}
                    </Typography>

                    <Box sx={{ my: 2 }}>
                        <Chip
                            label={`Sortie: ${production.release_date ? new Date(production.release_date).toLocaleDateString() : 'Non définie'}`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip
                            label={`Genre: ${production.genre || 'Non spécifié'}`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                    </Box>

                    <Typography variant="body1" paragraph>
                        {production.description || 'Aucune description disponible.'}
                    </Typography>

                    {isAdmin() && (
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Edit />}
                                onClick={handleEdit}
                            >
                                Modifier
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => setOpenConfirmDialog(true)}
                            >
                                Supprimer
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
            >
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    Êtes-vous sûr de vouloir supprimer cette production ? Cette action est irréversible.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)}>Annuler</Button>
                    <Button onClick={handleDelete} color="error">Supprimer</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProductionDetail;