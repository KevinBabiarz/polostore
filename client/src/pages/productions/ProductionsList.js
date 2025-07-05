// src/pages/ProductionsList.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProductions } from '../../services/productionService';
import {
    Container, Typography, Box, Grid, Card, CardContent,
    Button, Pagination, FormControl, InputLabel, Select, MenuItem,
    TextField, CircularProgress, Alert, Chip, InputAdornment,
    IconButton, Divider, CardActions, Paper, useTheme, useMediaQuery,
    Stack, Fade, Grow, Zoom, Rating, Skeleton, CardMedia
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList as FilterListIcon,
    Sort as SortIcon,
    FavoriteBorder as FavoriteIcon,
    MusicNote as MusicNoteIcon,
    PlayArrow, Pause, Explore, ArrowForwardIos,
    CheckCircle, NewReleases, TrendingUp
} from '@mui/icons-material';
import config from '../../config/config';
import { useAuth } from '../../contexts/AuthContext';
import AudioPlayer from '../../components/productions/AudioPlayer';
import SimpleAudioPlayer from '../../components/productions/SimpleAudioPlayer';
import { getImageUrl, getAudioUrl } from '../../utils/fileUtils';

const ProductionsList = () => {
    // États
    const [productions, setProductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');
    const [genre, setGenre] = useState('');  // Valeur vide = "Tous"
    const [releaseDateRange, setReleaseDateRange] = useState('all');
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [playingAudioId, setPlayingAudioId] = useState(null);
    const { isAuthenticated } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Référence à l'élément audio actuel
    const audioRef = React.useRef(null);

    // Débounce pour la recherche
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchDebounce(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Charger les productions
    useEffect(() => {
        const loadProductions = async () => {
            try {
                setLoading(true);
                const options = {
                    page,
                    limit: 9,
                    search: searchDebounce,
                    genre: genre || undefined,
                    releaseDateRange
                };

                const result = await getProductions(page, options);
                setProductions(result.productions || result);
                setTotalPages(result.totalPages || Math.ceil(result.length / 9) || 1);
            } catch (err) {
                console.error('Erreur lors du chargement des productions:', err);
                setError('Impossible de charger les productions');
            } finally {
                setLoading(false);
            }
        };

        loadProductions();
    }, [page, searchDebounce, genre, releaseDateRange]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    const handleGenreChange = (e) => {
        setGenre(e.target.value);
        setPage(1);
    };

    const handleSearchClear = () => {
        setSearchTerm('');
    };

    const toggleFilters = () => {
        setFiltersExpanded(!filtersExpanded);
    };

    const handleProductionClick = (id) => {
        navigate(`/productions/${id}`);
    };

    const handlePlayPause = (id, audioUrl) => {
        if (playingAudioId === id) {
            // Si l'audio est déjà en cours de lecture, on le met en pause
            setPlayingAudioId(null);
            audioRef.current.pause();
        } else {
            // Sinon, on joue le nouvel audio
            setPlayingAudioId(id);
            audioRef.current.src = audioUrl;
            audioRef.current.play();
        }
    };

    // Fonction pour réinitialiser tous les filtres
    const handleResetFilters = useCallback(() => {
        setSearchTerm('');
        setGenre('');
        setReleaseDateRange('all');
        setPage(1);
    }, []);

    // Synchroniser l'état des filtres avec l'URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const initialPage = parseInt(params.get('page')) || 1;
        const initialSearch = params.get('search') || '';
        const initialGenre = params.get('genre') || '';
        const initialReleaseDateRange = params.get('release_date') || 'all';

        setPage(initialPage);
        setSearchTerm(initialSearch);
        setGenre(initialGenre);
        setReleaseDateRange(initialReleaseDateRange);
    }, [location.search]);

    // Mettre à jour l'URL lors du changement de page ou de filtres
    useEffect(() => {
        const params = new URLSearchParams();

        if (searchDebounce) params.set('search', searchDebounce);
        if (genre) params.set('genre', genre);
        if (releaseDateRange !== 'all') params.set('release_date', releaseDateRange);
        params.set('page', page);

        navigate({
            pathname: location.pathname,
            search: params.toString(),
        });
    }, [searchDebounce, genre, releaseDateRange, page, navigate, location.pathname]);

    // Fonction pour tronquer les textes trop longs
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Afficher un état de chargement avec des squelettes
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={30} />

                    <Box sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: 1
                    }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <Skeleton variant="rounded" height={56} width="100%" />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Skeleton variant="rounded" height={56} width="100%" />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Skeleton variant="rounded" height={56} width="100%" />
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {[...Array(9)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Skeleton
                                variant="rectangular"
                                sx={{
                                    height: 180,
                                    borderTopLeftRadius: 16,
                                    borderTopRightRadius: 16
                                }}
                                animation="wave"
                            />
                            <Box sx={{ pt: 2, px: 2 }}>
                                <Skeleton variant="text" width="70%" height={32} />
                                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="100%" height={60} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Skeleton variant="text" width="30%" height={40} />
                                    <Skeleton variant="rounded" width={100} height={36} />
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    // Afficher un message d'erreur
    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 5 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        maxWidth: 600,
                        mx: 'auto'
                    }}
                >
                    <MusicNoteIcon sx={{ fontSize: 60, color: 'error.main', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h5" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Nous ne pouvons pas charger les productions pour le moment. Veuillez réessayer plus tard.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.reload()}
                        sx={{ borderRadius: 10, px: 3, py: 1 }}
                    >
                        Réessayer
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
            <Fade in={true} timeout={800}>
                <Box>
                    {/* En-tête avec titre et description */}
                    <Box sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}
                        >
                            Nos Productions Musicales
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            sx={{ mt: 1, mb: 2, maxWidth: { md: '80%' } }}
                        >
                            Découvrez notre collection de productions musicales originales, créées par des artistes talentueux du monde entier.
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                mt: 3,
                                display: { xs: 'none', md: 'flex' },
                                justifyContent: { xs: 'center', md: 'flex-start' }
                            }}
                        >
                            <Chip
                                icon={<MusicNoteIcon fontSize="small" />}
                                label="Tous les genres"
                                color={!genre ? "primary" : "default"}
                                onClick={() => setGenre('')}
                                sx={{ fontWeight: 'medium', px: 1 }}
                            />
                        </Stack>
                    </Box>

                    {/* Barre de recherche et filtres */}
                    <Card
                        elevation={2}
                        sx={{
                            mb: 4,
                            p: { xs: 2, md: 3 },
                            borderRadius: 3,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Grid container spacing={2} alignItems="center">
                            {/* Barre de recherche */}
                            <Grid item xs={12} sm={filtersExpanded ? 12 : 9} md={filtersExpanded ? 12 : 9}>
                                <TextField
                                    fullWidth
                                    placeholder="Rechercher une production..."
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={handleSearchClear}>
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 10,
                                            px: 1
                                        }
                                    }}
                                    sx={{ bgcolor: 'background.default' }}
                                />
                            </Grid>

                            {/* Filtres de base toujours visibles */}
                            {!filtersExpanded && (
                                <>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <FormControl fullWidth size="small" sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                                            <Select
                                                value={genre}
                                                displayEmpty
                                                onChange={handleGenreChange}
                                                renderValue={(selected) => selected === '' ? 'Tous' : selected}
                                                sx={{ borderRadius: 10 }}
                                            >
                                                <MenuItem value="">Tous</MenuItem>
                                                <MenuItem value="Rock">Rock</MenuItem>
                                                <MenuItem value="Hip-Hop">Hip-Hop</MenuItem>
                                                <MenuItem value="Jazz">Jazz</MenuItem>
                                                <MenuItem value="Classique">Classique</MenuItem>
                                                <MenuItem value="Electronic">Electronic</MenuItem>
                                                <MenuItem value="Pop">Pop</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}

                            {/* Section expanded filters */}
                            {filtersExpanded && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth size="small" sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                                                    <Select
                                                        value={genre}
                                                        displayEmpty
                                                        onChange={handleGenreChange}
                                                        renderValue={(selected) => selected === '' ? 'Tous' : selected}
                                                        sx={{ borderRadius: 10 }}
                                                    >
                                                        <MenuItem value="">Tous</MenuItem>
                                                        <MenuItem value="Rock">Rock</MenuItem>
                                                        <MenuItem value="Hip-Hop">Hip-Hop</MenuItem>
                                                        <MenuItem value="Jazz">Jazz</MenuItem>
                                                        <MenuItem value="Classique">Classique</MenuItem>
                                                        <MenuItem value="Electronic">Electronic</MenuItem>
                                                        <MenuItem value="Pop">Pop</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth size="small" sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                                            <InputLabel>Date de sortie</InputLabel>
                                            <Select
                                                value={releaseDateRange}
                                                label="Date de sortie"
                                                onChange={(e) => setReleaseDateRange(e.target.value)}
                                                sx={{ borderRadius: 10 }}
                                            >
                                                <MenuItem value="all">Toutes dates</MenuItem>
                                                <MenuItem value="last_week">Cette semaine</MenuItem>
                                                <MenuItem value="last_month">Ce mois-ci</MenuItem>
                                                <MenuItem value="last_year">Cette année</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}

                            {/* Boutons de contrôle des filtres */}
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 1,
                                    borderTop: filtersExpanded ? 1 : 0,
                                    borderColor: 'divider',
                                    pt: filtersExpanded ? 2 : 0
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={toggleFilters}
                                        startIcon={<FilterListIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {filtersExpanded ? 'Moins de filtres' : 'Plus de filtres'}
                                    </Button>

                                    {(searchTerm || genre || releaseDateRange !== 'all') && (
                                        <Button
                                            color="error"
                                            size="small"
                                            variant="outlined"
                                            onClick={handleResetFilters}
                                            startIcon={<ClearIcon />}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: '0.875rem',
                                                borderRadius: 10
                                            }}
                                        >
                                            Effacer les filtres
                                        </Button>
                                    )}
                                </Stack>
                            </Grid>

                            {/* Affichage des filtres actifs */}
                            {(searchTerm || genre || releaseDateRange !== 'all') && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {searchTerm && (
                                            <Chip
                                                label={`Recherche: ${searchTerm}`}
                                                size="small"
                                                onDelete={() => setSearchTerm('')}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                        {genre && (
                                            <Chip
                                                label={`Genre: ${genre}`}
                                                size="small"
                                                onDelete={() => setGenre('')}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                        {releaseDateRange !== 'all' && (
                                            <Chip
                                                label={releaseDateRange === 'last_week' ? 'Date: Cette semaine' :
                                                       releaseDateRange === 'last_month' ? 'Date: Ce mois-ci' : 'Date: Cette année'}
                                                size="small"
                                                onDelete={() => setReleaseDateRange('all')}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Card>

                    {/* Liste des productions */}
                    {productions.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                py: 6,
                                px: 3,
                                textAlign: 'center',
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                border: '1px dashed',
                                borderColor: 'divider'
                            }}
                        >
                            <MusicNoteIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Aucune production trouvée
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                                Aucune production ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou consultez notre catalogue complet.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleResetFilters}
                                sx={{ borderRadius: 10, px: 3 }}
                            >
                                Réinitialiser les filtres
                            </Button>
                        </Paper>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <Grid container spacing={3} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {productions.map((production) => (
                                    <Grid item xs={12} sm={6} md={3} lg={3} key={production.id} sx={{ width: { xs: '100%', sm: '45%', md: '23%' }, flex: '0 0 auto', mb: 3 }}>
                                        <Grow in={true} timeout={500 + productions.indexOf(production) * 100}>
                                            <Card
                                                sx={{
                                                    height: '450px', // Hauteur fixe pour toutes les cartes
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: 3,
                                                    overflow: 'hidden',
                                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                                    width: '100%', // Assure une largeur égale
                                                    maxWidth: '100%', // Limite la largeur maximale
                                                    boxSizing: 'border-box', // Inclut le padding et la bordure dans la largeur
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: theme.shadows[6]
                                                    }
                                                }}
                                            >
                                                {/* Container pour l'image avec une hauteur fixe */}
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        height: '150px', // Hauteur réduite de 180px à 150px
                                                    }}
                                                >
                                                    {/* Image absolument positionnée pour maintenir le ratio */}
                                                    <CardMedia
                                                        component="img"
                                                        image={getImageUrl(production.image_url) || '/images/vinyl-record.svg'}
                                                        alt={production.title}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/vinyl-record.svg';
                                                        }}
                                                    />
                                                    {/* Overlay pour le genre */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            width: '100%',
                                                            height: '70px',
                                                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                                                            display: 'flex',
                                                            alignItems: 'flex-end',
                                                            p: 1
                                                        }}
                                                    >
                                                        <Chip
                                                            label={production.genre}
                                                            color="primary"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'rgba(33, 150, 243, 0.85)',
                                                                fontWeight: 'medium'
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>

                                                <CardContent sx={{
                                                    p: 2,
                                                    flexGrow: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    overflow: 'hidden', // Empêche tout débordement
                                                    boxSizing: 'border-box' // Inclut padding et border dans la largeur
                                                }}>
                                                    <Box sx={{
                                                        minHeight: 120,
                                                        flexGrow: 1,
                                                        maxHeight: '180px',
                                                        overflow: 'hidden',
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        boxSizing: 'border-box' // Inclut le padding et la bordure dans la largeur
                                                    }}>
                                                        <Typography
                                                            variant="h6"
                                                            component="h2"
                                                            gutterBottom
                                                            noWrap={false}
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                '&:hover': { color: 'primary.main' },
                                                                height: '60px',
                                                                mb: 1,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                width: '100%',
                                                                maxWidth: '100%',
                                                                wordBreak: 'break-word', // Force la césure de mots
                                                                wordWrap: 'break-word',
                                                                whiteSpace: 'normal',
                                                                boxSizing: 'border-box'
                                                            }}
                                                            onClick={() => handleProductionClick(production.id)}
                                                        >
                                                            {truncateText(production.title, 50)}
                                                        </Typography>

                                                        <Typography
                                                            variant="subtitle2"
                                                            color="text.secondary"
                                                            sx={{ mb: 1, height: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                        >
                                                            {production.artist || 'Artiste inconnu'}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: 'vertical',
                                                                height: '60px'
                                                            }}
                                                        >
                                                            {truncateText(production.description, 80)}
                                                        </Typography>
                                                    </Box>

                                                    {/* Lecteur audio avec hauteur fixe */}
                                                    <Box sx={{ height: 80, mt: 2 }}>
                                                        {production.audio_url ? (
                                                            <>
                                                                <Typography variant="subtitle2" color="primary.main" mb={1}>
                                                                    Écouter un extrait
                                                                </Typography>
                                                                <SimpleAudioPlayer
                                                                    src={production.audio_url}
                                                                />
                                                            </>
                                                        ) : (
                                                            <Box sx={{ height: '100%' }}> {/* Espace réservé quand pas d'audio */}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </CardContent>

                                                <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'center', height: '60px' }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        endIcon={<ArrowForwardIos />}
                                                        onClick={() => handleProductionClick(production.id)}
                                                        sx={{
                                                            borderRadius: 10,
                                                            px: 3,
                                                            py: 1,
                                                            boxShadow: 2,
                                                            minWidth: '140px'
                                                        }}
                                                    >
                                                        Détails
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grow>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size={isMobile ? "small" : "medium"}
                                siblingCount={isMobile ? 0 : 1}
                                showFirstButton={!isMobile}
                                showLastButton={!isMobile}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: '50%',
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Audio élément caché pour les prévisualisations */}
                    <audio ref={audioRef} style={{ display: 'none' }} />
                </Box>
            </Fade>
        </Container>
    );
};

export default ProductionsList;
