// src/pages/productions/ProductionDetail.js
import React, { useState, useEffect, useRef } from 'react';
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
    Stack, Snackbar, LinearProgress, Slider
} from '@mui/material';
import {
    Favorite, FavoriteBorder, Edit, Delete, ArrowBack,
    MusicNote, PlayArrow, Pause, ShoppingCart, Share, Download,
    AccessTime, CalendarToday, Person, Category, AttachMoney,
    NavigateNext
} from '@mui/icons-material';
import config from '../../config/config';
import { getImageUrl, getAudioUrl } from '../../utils/fileUtils';

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
            const newTime = (newValue / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
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
const TimeDisplay = ({ audioRef, isPlaying }) => {
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
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [production, setProduction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const audioRef = useRef(null);

    // Vérifier si l'utilisateur est admin en appelant la fonction
    const userIsAdmin = isAdmin();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getProductionById(id);
                setProduction(data);

                // Log complet des données pour débugger
                console.log('Production complète:', data);

                // Correction : utiliser getAudioUrl pour gérer l'URL audio
                if (data && data.audio_url) {
                    const audioSrc = getAudioUrl(data.audio_url);
                    setAudioUrl(audioSrc || '');
                } else {
                    setAudioUrl(''); // Pas d'audio
                }

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

    // Gestion simple de l'audio sans dépendance sur les références React
    const handlePlayPause = () => {
        // Vérifier d'abord si un audioUrl est défini
        if (!audioUrl) {
            console.log("Aucun fichier audio disponible pour cette production");
            setSnackbarMessage("Aucun fichier audio disponible pour cette production");
            setSnackbarOpen(true);
            return;
        }

        const audio = document.getElementById('production-audio');

        if (!audio) {
            console.error("Élément audio non trouvé dans le DOM");
            setSnackbarMessage("Erreur: Lecteur audio non disponible");
            setSnackbarOpen(true);
            return;
        }

        console.log("État actuel:", audio.paused ? "pausé" : "en lecture");

        if (audio.paused) {
            // Essayer de jouer l'audio
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log("Lecture audio démarrée avec succès");
                        setIsPlaying(true);
                    })
                    .catch(error => {
                        console.error("Erreur lors de la lecture audio:", error);
                        setSnackbarMessage("Erreur lors de la lecture: " + (error.message || "fichier audio non supporté"));
                        setSnackbarOpen(true);
                    });
            }
        } else {
            audio.pause();
            setIsPlaying(false);
            console.log("Audio mis en pause");
        }
    };

    const handleAudioEnd = () => {
        console.log("Lecture audio terminée");
        setIsPlaying(false);
    };

    // Gérer la fermeture du snackbar de notification
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Capturer les événements audio pour synchroniser l'état
    useEffect(() => {
        const audioElement = document.getElementById('production-audio');
        if (!audioElement) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        audioElement.addEventListener('play', onPlay);
        audioElement.addEventListener('pause', onPause);
        audioElement.addEventListener('ended', onEnded);

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('play', onPlay);
                audioElement.removeEventListener('pause', onPause);
                audioElement.removeEventListener('ended', onEnded);
            }
        };
    }, [audioUrl]);

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
            {/* Suppression du player audio qui était ici et qui sera déplacé */}

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
                                    {!production.image_url && audioUrl && (
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
                                        {/* Rating supprimé */}
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

                                    {/* Lecteur audio placé dans la partie droite */}
                                    {audioUrl && (
                                        <Box sx={{
                                            mt: 2,
                                            mb: 3,
                                            p: 2,
                                            borderRadius: 3,
                                            background: 'linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(240,242,245,0.9) 100%)',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden'
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 2
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <MusicNote fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                                                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                                        Écouter un extrait
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
                                                {/* Audio élément caché */}
                                                <audio
                                                    id="production-audio"
                                                    ref={audioRef}
                                                    src={audioUrl}
                                                    onEnded={handleAudioEnd}
                                                    style={{ display: 'none' }}
                                                />

                                                {/* Interface personnalisée */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    position: 'relative',
                                                    gap: 2
                                                }}>
                                                    {/* Bouton play/pause */}
                                                    <IconButton
                                                        onClick={handlePlayPause}
                                                        color="primary"
                                                        sx={{
                                                            bgcolor: theme.palette.primary.main,
                                                            color: 'white',
                                                            '&:hover': {
                                                                bgcolor: theme.palette.primary.dark
                                                            },
                                                            width: 40,
                                                            height: 40,
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                            transition: 'all 0.2s ease',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {isPlaying ? <Pause /> : <PlayArrow />}
                                                    </IconButton>

                                                    {/* Conteneur barre de progression et temps */}
                                                    <Box sx={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        width: '100%',
                                                        position: 'relative'
                                                    }}>
                                                        {/* Composant personnalisé pour la barre de progression */}
                                                        <ProgressBar audioRef={audioRef} isPlaying={isPlaying} />

                                                        {/* Affichage du temps */}
                                                        <TimeDisplay audioRef={audioRef} isPlaying={isPlaying} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    <Box sx={{ mt: 'auto' }}>
                                        {/* Typography affichant le prix supprimée */}

                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                startIcon={<ShoppingCart />}
                                                onClick={() => navigate('/contact')}
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
                                        {userIsAdmin && (
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
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
                    Confirmer la suppression
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Êtes-vous sûr de vouloir supprimer cette production ?
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        variant="outlined"
                        sx={{ borderRadius: 10 }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 10, ml: 2 }}
                        autoFocus
                    >
                        Supprimer
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
