// src/pages/productions/ProductionDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProductionById, deleteProduction } from '../../services/productionService';
import { addFavorite, removeFavorite, checkIsFavorite } from '../../services/favoriteService';
import {
    Container, Card, Typography,
    Button, Box, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, Paper,
    Divider, IconButton, Tooltip, Skeleton,
    useTheme, Fade, Grow, Breadcrumbs, Link,
    Snackbar, Slider
} from '@mui/material';
import {
    Favorite, FavoriteBorder, Edit, Delete, ArrowBack,
    MusicNote, PlayArrow, Pause, ShoppingCart, Share,
    AccessTime, CalendarToday, Category, AttachMoney,
    NavigateNext
} from '@mui/icons-material';
import { getImageUrl, getAudioUrl } from '../../utils/fileUtils';
import { useTranslation } from 'react-i18next';

// Composant pour afficher la barre de progression
const ProgressBar = ({ audioRef, isPlaying }) => {
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        // Mettre à jour la progression pendant la lecture
        const updateProgress = () => {
            if (!isDragging && audioElement.duration) {
                const percentage = (audioElement.currentTime / audioElement.duration) * 100;
                setProgress(percentage);
            }
        };

        const interval = setInterval(updateProgress, 500);
        audioElement.addEventListener('timeupdate', updateProgress);

        return () => {
            clearInterval(interval);
            audioElement.removeEventListener('timeupdate', updateProgress);
        };
    }, [audioRef, isDragging]);

    const handleProgressChange = (event, newValue) => {
        setProgress(newValue);
        setIsDragging(true);
    };

    const handleProgressChangeCommitted = (event, newValue) => {
        if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = (newValue / 100) * audioRef.current.duration;
        }
        setIsDragging(false);
    };

    return (
        <Slider
            value={progress}
            onChange={handleProgressChange}
            onChangeCommitted={handleProgressChangeCommitted}
            sx={{
                height: 8,
                padding: '8px 0',
                borderRadius: 4,
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                    transition: 'width 0.2s, height 0.2s',
                    '&:hover, &.Mui-active': {
                        width: 20,
                        height: 20,
                    },
                    backgroundColor: '#fff',
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    opacity: isPlaying ? 1 : 0,
                    '&:hover': {
                        opacity: 1,
                        boxShadow: '0 0 0 8px rgba(63, 81, 181, 0.16)'
                    }
                },
                '& .MuiSlider-track': {
                    border: 'none',
                    height: 8,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                },
                '& .MuiSlider-rail': {
                    opacity: 0.5,
                    backgroundColor: theme.palette.grey[300],
                    height: 8,
                    borderRadius: 4,
                },
            }}
        />
    );
};

// Composant pour afficher le temps
const TimeDisplay = ({ audioRef }) => {
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        const updateTime = () => {
            // Formatter le temps actuel
            const currentMinutes = Math.floor(audioElement.currentTime / 60);
            const currentSeconds = Math.floor(audioElement.currentTime % 60).toString().padStart(2, '0');
            setCurrentTime(`${currentMinutes}:${currentSeconds}`);

            // Formatter la durée totale
            if (audioElement.duration && !isNaN(audioElement.duration)) {
                const durationMinutes = Math.floor(audioElement.duration / 60);
                const durationSeconds = Math.floor(audioElement.duration % 60).toString().padStart(2, '0');
                setDuration(`${durationMinutes}:${durationSeconds}`);
            }
        };

        // Mise à jour initiale
        updateTime();

        // Configurer les écouteurs d'événements
        audioElement.addEventListener('timeupdate', updateTime);
        audioElement.addEventListener('loadedmetadata', updateTime);

        return () => {
            audioElement.removeEventListener('timeupdate', updateTime);
            audioElement.removeEventListener('loadedmetadata', updateTime);
        };
    }, [audioRef]);

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 0.5,
            px: 0.5,
            fontSize: '0.7rem',
            color: 'text.secondary',
            fontWeight: 'medium'
        }}>
            <Typography variant="caption" fontFamily="monospace">
                {currentTime}
            </Typography>
            <Typography variant="caption" fontFamily="monospace">
                {duration}
            </Typography>
        </Box>
    );
};

const ProductionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin } = useAuth();
    const { t } = useTranslation('productions'); // Spécifier le namespace productions
    const theme = useTheme();
    // const isMobile = useMediaQuery(theme.breakpoints.down('md')); // non utilisé
    const audioRef = useRef(null);

    const [production, setProduction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Vérifier si l'utilisateur est admin en appelant la fonction
    const userIsAdmin = isAdmin();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getProductionById(id);
                setProduction(data);

                if (data && data.audio_url) {
                    const audioSrc = getAudioUrl(data.audio_url);
                    setAudioUrl(audioSrc || '');
                } else {
                    setAudioUrl('');
                }

                if (user) {
                    const favoriteStatus = await checkIsFavorite(id);
                    setIsFavorite(favoriteStatus);
                }
            } catch (error) {
                console.error(t('loadError'), error);
                setError(t('loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    // Fonction pour gérer les favoris
    const handleFavoriteToggle = async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                await removeFavorite(id);
                setIsFavorite(false);
                setSnackbarMessage(t('removedFromFavorites'));
            } else {
                await addFavorite(id);
                setIsFavorite(true);
                setSnackbarMessage(t('addedToFavorites'));
            }
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Erreur lors de la gestion des favoris:', error);
            setSnackbarMessage(isFavorite ? t('errorRemovingFavorite') : t('errorAddingFavorite'));
            setSnackbarOpen(true);
        }
    };

    // Fonction pour supprimer la production
    const handleDelete = async () => {
        try {
            await deleteProduction(id);
            navigate('/productions');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setSnackbarMessage(t('deleteError', { defaultValue: 'Erreur lors de la suppression' }));
            setSnackbarOpen(true);
        }
    };

    // Fonction pour gérer la lecture/pause de l'audio
    const handlePlayPause = () => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
            setIsPlaying(false);
        } else {
            audioElement.play().catch(error => {
                console.error('Erreur lors de la lecture audio:', error);
                setSnackbarMessage(t('audioPlayError', { defaultValue: 'Erreur lors de la lecture audio' }));
                setSnackbarOpen(true);
            });
            setIsPlaying(true);
        }
    };

    // Fonction appelée quand l'audio se termine
    const handleAudioEnd = () => {
        setIsPlaying(false);
    };

    // Fonction pour gérer les favoris (alias pour handleFavoriteToggle)
    const handleToggleFavorite = handleFavoriteToggle;

    // Fonction pour modifier la production
    const handleEdit = () => {
        navigate(`/admin/productions/edit/${id}`);
    };

    // Fonction pour fermer le snackbar
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // États de chargement
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="text" width="80%" height={50} sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />
                        <Skeleton variant="text" width="100%" height={100} sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Skeleton variant="rounded" width={120} height={40} />
                            <Skeleton variant="rounded" width={120} height={40} />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    // Gestion des erreurs
    if (error || !production) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <MusicNote sx={{ fontSize: 60, color: 'error.main', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h5" color="error" gutterBottom>
                        {t('productionNotFound')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {t('productionNotFoundMessage', { defaultValue: 'La production demandée est introuvable.' })}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/productions')}
                        sx={{ borderRadius: 10, px: 4 }}
                        startIcon={<ArrowBack />}
                    >
                        {t('backToProductions')}
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 4, md: 5 } }}>
            {/* Suppression du player audio qui était ici et qui sera déplacé */}

            <Fade in={true} timeout={800}>
                <Box>
                    {/* Fil d'Ariane */}
                    <Breadcrumbs
                        separator={<NavigateNext fontSize="small" />}
                        sx={{ mb: { xs: 1.5, md: 2.5 }, display: { xs: 'none', sm: 'flex' } }}
                    >
                        <Link
                            underline="hover"
                            color="inherit"
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            {t('navigation:home')}
                        </Link>
                        <Link
                            underline="hover"
                            color="inherit"
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => navigate('/productions')}
                        >
                            {t('navigation:productions')}
                        </Link>
                        <Typography color="text.primary" noWrap sx={{ maxWidth: { xs: 150, sm: 250 } }}>
                            {production?.title || t('productionDetails')}
                        </Typography>
                    </Breadcrumbs>

                    <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="stretch">
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
                                        background: getImageUrl(production.image_url)
                                            ? `url(${getImageUrl(production.image_url)}) center/cover`
                                            : 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
                                        '&::before': getImageUrl(production.image_url) && {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(0,0,0,0.3)',
                                            zIndex: 1
                                        }
                                    }}
                                >
                                    {/* Affiche l'icône MusicNote SEULEMENT si pas d'image ET il y a un audio */}
                                    {!getImageUrl(production.image_url) && audioUrl && (
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
                                    {/* En-tête et titre */}
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
                                    </Box>

                                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{
                                        lineHeight: 1.2,
                                        mb: 0.5,
                                        fontSize: { xs: '1.8rem', sm: '2.2rem' }
                                    }}>
                                        {production.title}
                                    </Typography>

                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1.5 }}>
                                        {t('by', { defaultValue: 'par' })} {production.artist}
                                    </Typography>

                                    {/* Lecteur audio déplacé ici pour apparaître plus haut */}
                                    {audioUrl && (
                                        <Box sx={{
                                            mt: 1,
                                            mb: 2,
                                            p: 2,
                                            borderRadius: 3,
                                            background: theme.palette.mode === 'dark'
                                                ? 'linear-gradient(145deg, rgba(45,45,45,0.8) 0%, rgba(30,30,30,0.9) 100%)'
                                                : 'linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(240,242,245,0.9) 100%)',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxShadow: theme.palette.mode === 'dark'
                                                ? '0 4px 12px rgba(0,0,0,0.3)'
                                                : '0 4px 12px rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <MusicNote fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                                                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                                        {t('listenPreview')}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Lecteur audio personnalisé sans les contrôles HTML par défaut */}
                                            <Box sx={{
                                                position: 'relative',
                                                width: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}>
                                                <audio
                                                    id="production-audio"
                                                    ref={audioRef}
                                                    src={audioUrl}
                                                    onEnded={handleAudioEnd}
                                                    style={{ display: 'none' }}
                                                />

                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    position: 'relative',
                                                    gap: 2
                                                }}>
                                                    <IconButton
                                                        onClick={handlePlayPause}
                                                        color="primary"
                                                        sx={{
                                                            bgcolor: theme.palette.primary.main,
                                                            color: 'white',
                                                            '&:hover': { bgcolor: theme.palette.primary.dark },
                                                            width: 40,
                                                            height: 40,
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                            transition: 'all 0.2s ease',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {isPlaying ? <Pause /> : <PlayArrow />}
                                                    </IconButton>

                                                    <Box sx={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        width: '100%',
                                                        position: 'relative'
                                                    }}>
                                                        <ProgressBar audioRef={audioRef} isPlaying={isPlaying} />
                                                        <TimeDisplay audioRef={audioRef} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    <Divider sx={{ my: 2 }} />

                                    {/* Métadonnées */}
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
                                            mb: 2.5,
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
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                startIcon={<ShoppingCart />}
                                                onClick={() => navigate('/contact')}
                                                sx={{ flexGrow: 1, borderRadius: 10, py: 1.5, fontWeight: 'bold', boxShadow: 2, textTransform: 'none' }}
                                            >
                                                {t('buyNow', { defaultValue: 'Acheter maintenant' })}
                                            </Button>

                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}>
                                                    <IconButton
                                                        onClick={handleToggleFavorite}
                                                        color="primary"
                                                        sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: 3, p: 1.5, boxShadow: 1 }}
                                                    >
                                                        {isFavorite ? <Favorite /> : <FavoriteBorder />}
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={t('share')}>
                                                    <IconButton
                                                        color="primary"
                                                        sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: 3, p: 1.5, boxShadow: 1 }}
                                                    >
                                                        <Share />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {userIsAdmin && (
                                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Edit />}
                                                    onClick={handleEdit}
                                                    sx={{ borderRadius: 10, flex: 1, textTransform: 'none' }}
                                                >
                                                    {t('common:edit')}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<Delete />}
                                                    onClick={() => setOpenConfirmDialog(true)}
                                                    sx={{ borderRadius: 10, flex: 1, textTransform: 'none' }}
                                                >
                                                    {t('common:delete')}
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </Card>
                            </Fade>
                        </Grid>

                        {/* Suppression ici de la Grid item xs={12} qui contenait les onglets */}

                    </Grid>
                </Box>
            </Fade>

            {/* Dialogue de confirmation suppression */}
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{ '& .MuiPaper-root': { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
                    {t('deleteConfirmationTitle', { defaultValue: 'Confirmer la suppression' })}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        {t('deleteConfirmationText', { defaultValue: 'Êtes-vous sûr de vouloir supprimer cette production ? Cette action est irréversible.' })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenConfirmDialog(false)} variant="outlined" sx={{ borderRadius: 10 }}>
                        {t('common:cancel')}
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 10, ml: 2 }} autoFocus>
                        {t('common:delete')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar pour les notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default ProductionDetail;
