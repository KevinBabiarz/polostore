// src/pages/productions/ProductionDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProductionById, deleteProduction } from '../../services/productionService';
import { addFavorite, removeFavorite, checkIsFavorite } from '../../services/favoriteService';
import {
    Container, Card, CardContent, Typography,
    Button, Box, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, CircularProgress, Alert, Grid, Paper,
    Divider, Rating, Avatar, IconButton, Tooltip, Skeleton,
    useTheme, useMediaQuery, Fade, Grow, Zoom, Breadcrumbs, Link,
    Stack, Tabs, Tab
} from '@mui/material';
import {
    Favorite, FavoriteBorder, Edit, Delete, ArrowBack,
    MusicNote, PlayArrow, ShoppingCart, Share, Download,
    AccessTime, CalendarToday, Person, Category, AttachMoney,
    NavigateNext, Description, Comment, ThumbUp, Album
} from '@mui/icons-material';
import config from '../../config/config';

const ProductionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [production, setProduction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getProductionById(id);
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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading || authLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Fade in={true} timeout={800}>
                    <Grid container spacing={3}>
                        {/* Skeleton pour l'image principale */}
                        <Grid item xs={12} md={6}>
                            <Skeleton
                                variant="rectangular"
                                sx={{
                                    height: { xs: 250, md: 400 },
                                    width: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'grey.100'
                                }}
                                animation="wave"
                            />
                        </Grid>

                        {/* Skeleton pour les informations */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ height: '100%' }}>
                                <Skeleton variant="text" width="40%" height={40} animation="wave" sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="70%" height={60} animation="wave" sx={{ mb: 2 }} />
                                <Skeleton variant="text" width="25%" height={30} animation="wave" sx={{ mb: 3 }} />
                                <Box sx={{ display: 'flex', my: 2, gap: 1 }}>
                                    <Skeleton variant="rounded" width={80} height={32} animation="wave" />
                                    <Skeleton variant="rounded" width={80} height={32} animation="wave" />
                                </Box>
                                <Skeleton variant="text" width="100%" height={80} animation="wave" sx={{ mb: 2 }} />
                                <Skeleton variant="text" width="100%" height={40} animation="wave" />
                                <Box sx={{ mt: 3 }}>
                                    <Skeleton variant="rounded" width="100%" height={50} animation="wave" sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
                                        <Skeleton variant="circular" width={50} height={50} animation="wave" />
                                        <Skeleton variant="circular" width={50} height={50} animation="wave" />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Fade>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 5 }}>
                <Zoom in={true} timeout={500}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: { xs: 3, md: 4 },
                            textAlign: 'center',
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            maxWidth: 600,
                            mx: 'auto'
                        }}
                    >
                        <MusicNote sx={{ fontSize: 60, color: 'error.main', mb: 2, opacity: 0.7 }} />
                        <Typography variant="h5" component="h1" gutterBottom color="error">
                            {error}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            La production demandée est introuvable ou une erreur s'est produite.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/productions')}
                            sx={{ borderRadius: 10, fontWeight: 'bold', px: 3, py: 1.2 }}
                        >
                            Retour aux productions
                        </Button>
                    </Paper>
                </Zoom>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
            <Fade in={true} timeout={800}>
                <Box>
                    {/* Fil d'Ariane */}
                    <Breadcrumbs
                        separator={<NavigateNext fontSize="small" />}
                        sx={{ mb: { xs: 2, md: 3 }, display: { xs: 'none', sm: 'flex' } }}
                    >
                        <Link
                            underline="hover"
                            color="inherit"
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            Accueil
                        </Link>
                        <Link
                            underline="hover"
                            color="inherit"
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => navigate('/productions')}
                        >
                            Productions
                        </Link>
                        <Typography color="text.primary" noWrap sx={{ maxWidth: { xs: 150, sm: 250 } }}>
                            {production?.title || 'Détails'}
                        </Typography>
                    </Breadcrumbs>

                    <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
                        {/* Partie gauche - Image/Bloc coloré */}
                        <Grid item xs={12} md={6}>
                            <Grow in={true} timeout={800}>
                                <Card
                                    elevation={4}
                                    sx={{
                                        height: { xs: 'auto', md: 450 },
                                        minHeight: 300,
                                        bgcolor: 'primary.main',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: production.image_url
                                            ? `url(${config.UPLOADS_URL}${production.image_url}) center/cover`
                                            : 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
                                        '&::before': production.image_url && {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(0,0,0,0.3)',
                                            zIndex: 1
                                        }
                                    }}
                                >
                                    {!production.image_url && (
                                        <MusicNote
                                            sx={{
                                                fontSize: { xs: 80, md: 120 },
                                                color: 'white',
                                                opacity: 0.8,
                                                position: 'relative',
                                                zIndex: 2
                                            }}
                                        />
                                    )}

                                    {/* Bouton de lecture superposé */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 20,
                                            right: 20,
                                            zIndex: 2
                                        }}
                                    >
                                        <Tooltip title="Écouter un extrait">
                                            <IconButton
                                                sx={{
                                                    bgcolor: 'white',
                                                    color: 'primary.main',
                                                    boxShadow: 3,
                                                    p: { xs: 1.5, md: 2 },
                                                    '&:hover': {
                                                        bgcolor: 'white',
                                                        transform: 'scale(1.1)',
                                                    },
                                                    transition: 'all 0.2s',
                                                    opacity: 0.9
                                                }}
                                            >
                                                <PlayArrow fontSize="large" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    {/* Badge du genre */}
                                    {production.genre && (
                                        <Chip
                                            label={production.genre}
                                            sx={{
                                                position: 'absolute',
                                                top: 16,
                                                left: 16,
                                                zIndex: 2,
                                                bgcolor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    )}
                                </Card>
                            </Grow>
                        </Grid>

                        {/* Partie droite - Informations */}
                        <Grid item xs={12} md={6}>
                            <Fade in={true} timeout={1000}>
                                <Card elevation={2} sx={{
                                    height: '100%',
                                    p: { xs: 2.5, sm: 3 },
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                        {production.releaseDate && (
                                            <Typography variant="caption" color="text.secondary" sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 1
                                            }}>
                                                <CalendarToday fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                                {new Date(production.releaseDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                        <Rating value={production.rating || 4.5} precision={0.5} readOnly />
                                    </Box>

                                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{
                                        lineHeight: 1.2,
                                        mb: 0.5,
                                        fontSize: { xs: '1.8rem', sm: '2.2rem' }
                                    }}>
                                        {production.title}
                                    </Typography>

                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                        par {production.artist}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        {production.genre && (
                                            <Grid item xs={6} sm={4}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Category fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                    <Typography variant="body2">
                                                        {production.genre}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {production.duration && (
                                            <Grid item xs={6} sm={4}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <AccessTime fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                    <Typography variant="body2">
                                                        {production.duration}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {production.price && (
                                            <Grid item xs={6} sm={4}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <AttachMoney fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                    <Typography variant="body2">
                                                        {production.price} €
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>

                                    {production.description && (
                                        <Typography variant="body2" sx={{
                                            mb: 3,
                                            color: 'text.secondary',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {production.description}
                                        </Typography>
                                    )}

                                    <Box sx={{ mt: 'auto' }}>
                                        <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
                                            {production.price ? `${production.price} €` : 'Gratuit'}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                startIcon={<ShoppingCart />}
                                                sx={{
                                                    flexGrow: 1,
                                                    borderRadius: 10,
                                                    py: 1.5,
                                                    fontWeight: 'bold',
                                                    boxShadow: 2,
                                                    textTransform: 'none'
                                                }}
                                            >
                                                Acheter maintenant
                                            </Button>

                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                                                    <IconButton
                                                        onClick={handleToggleFavorite}
                                                        color="primary"
                                                        sx={{
                                                            border: `1px solid ${theme.palette.primary.main}`,
                                                            borderRadius: 3,
                                                            p: 1.5,
                                                            boxShadow: 1
                                                        }}
                                                    >
                                                        {isFavorite ? <Favorite /> : <FavoriteBorder />}
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Partager">
                                                    <IconButton
                                                        color="primary"
                                                        sx={{
                                                            border: `1px solid ${theme.palette.primary.main}`,
                                                            borderRadius: 3,
                                                            p: 1.5,
                                                            boxShadow: 1
                                                        }}
                                                    >
                                                        <Share />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {/* Actions administrateur */}
                                        {isAdmin && (
                                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Edit />}
                                                    onClick={handleEdit}
                                                    sx={{
                                                        borderRadius: 10,
                                                        flex: 1,
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Modifier
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<Delete />}
                                                    onClick={() => setOpenConfirmDialog(true)}
                                                    sx={{
                                                        borderRadius: 10,
                                                        flex: 1,
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Supprimer
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </Card>
                            </Fade>
                        </Grid>

                        {/* Contenu additionnel */}
                        <Grid item xs={12}>
                            <Grow in={true} timeout={1200}>
                                <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mt: { xs: 0, md: 2 } }}>
                                    <Tabs
                                        value={tabValue}
                                        onChange={handleTabChange}
                                        variant={isMobile ? "scrollable" : "fullWidth"}
                                        scrollButtons={isMobile}
                                        allowScrollButtonsMobile
                                        sx={{
                                            bgcolor: 'background.paper',
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            '& .MuiTab-root': {
                                                fontWeight: 'bold',
                                                py: 2,
                                                textTransform: 'none',
                                                fontSize: { xs: '0.875rem', md: '1rem' }
                                            }
                                        }}
                                    >
                                        <Tab
                                            icon={<Description sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />}
                                            iconPosition="start"
                                            label="Description"
                                        />
                                        <Tab
                                            icon={<Album sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />}
                                            iconPosition="start"
                                            label="Titres"
                                        />
                                        <Tab
                                            icon={<Comment sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />}
                                            iconPosition="start"
                                            label="Commentaires"
                                        />
                                    </Tabs>

                                    {/* Contenu de l'onglet Description */}
                                    <Box sx={{
                                        p: { xs: 2.5, sm: 3 },
                                        display: tabValue === 0 ? 'block' : 'none',
                                        minHeight: 300
                                    }}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main">
                                            À propos de cette production
                                        </Typography>

                                        <Typography variant="body1" paragraph>
                                            {production.description ||
                                            "Cette production musicale unique offre une expérience sonore exceptionnelle, mélangeant harmonieusement différents styles et influences. L'artiste a créé une œuvre qui captive l'auditeur dès les premières notes, transportant dans un univers musical riche et évocateur."}
                                        </Typography>

                                        <Typography variant="body1" paragraph>
                                            Créée avec passion et expertise, cette production reflète le talent et la vision artistique unique de son créateur. Chaque élément a été soigneusement élaboré pour offrir une expérience d'écoute immersive et mémorable.
                                        </Typography>

                                        {production.additionalInfo && (
                                            <Box sx={{ mt: 3 }}>
                                                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main">
                                                    Informations complémentaires
                                                </Typography>
                                                <Typography variant="body1">
                                                    {production.additionalInfo}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Contenu de l'onglet Titres */}
                                    <Box sx={{ p: { xs: 2.5, sm: 3 }, display: tabValue === 1 ? 'block' : 'none' }}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main">
                                            Liste des titres
                                        </Typography>

                                        {(production.tracks || [1, 2, 3]).map((track, index) => (
                                            <Paper
                                                key={index}
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    borderRadius: 1,
                                                    bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                                                        {index + 1}.
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {track.title || `Titre ${index + 1}`}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                                        {track.duration || '3:45'}
                                                    </Typography>
                                                    <IconButton size="small">
                                                        <PlayArrow fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>

                                    {/* Contenu de l'onglet Commentaires */}
                                    <Box sx={{ p: { xs: 2.5, sm: 3 }, display: tabValue === 2 ? 'block' : 'none' }}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main">
                                            Commentaires
                                        </Typography>

                                        {(production.comments || []).length > 0 ? (
                                            (production.comments || []).map((comment, index) => (
                                                <Paper
                                                    key={index}
                                                    elevation={1}
                                                    sx={{ p: 2, mb: 2, borderRadius: 2 }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <Avatar sx={{ mr: 2 }}>
                                                            {comment.authorName?.charAt(0) || 'U'}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">
                                                                    {comment.authorName || 'Utilisateur'}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {comment.date || '01/01/2023'}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2">{comment.content}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            ))
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <Comment sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                                                <Typography variant="body1" color="text.secondary" gutterBottom>
                                                    Aucun commentaire pour le moment
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Soyez le premier à donner votre avis sur cette production !
                                                </Typography>
                                                {user ? (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        sx={{ mt: 2, borderRadius: 4 }}
                                                    >
                                                        Ajouter un commentaire
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => navigate('/login')}
                                                        sx={{ mt: 2, borderRadius: 4 }}
                                                    >
                                                        Se connecter pour commenter
                                                    </Button>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </Card>
                            </Grow>
                        </Grid>
                    </Grid>

                    {/* Bouton de retour */}
                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="text"
                            color="inherit"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/productions')}
                            sx={{
                                fontWeight: 'medium',
                                textTransform: 'none',
                                borderRadius: 10,
                                px: 2,
                                py: 1
                            }}
                        >
                            Retour aux productions
                        </Button>
                    </Box>

                    {/* Dialogue de confirmation de suppression */}
                    <Dialog
                        open={openConfirmDialog}
                        onClose={() => setOpenConfirmDialog(false)}
                        PaperProps={{
                            sx: { borderRadius: 2 }
                        }}
                    >
                        <DialogTitle>
                            Confirmer la suppression
                        </DialogTitle>
                        <DialogContent>
                            <Typography>
                                Êtes-vous sûr de vouloir supprimer <strong>{production.title}</strong> ? Cette action est irréversible.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button
                                onClick={() => setOpenConfirmDialog(false)}
                                variant="outlined"
                                sx={{ borderRadius: 4 }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleDelete}
                                color="error"
                                variant="contained"
                                sx={{ borderRadius: 4 }}
                            >
                                Supprimer
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Fade>
        </Container>
    );
};

export default ProductionDetail;
