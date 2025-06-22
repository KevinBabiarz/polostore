// src/pages/ProductionsList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    PlayArrow, Explore, ArrowForwardIos,
    CheckCircle, NewReleases, TrendingUp
} from '@mui/icons-material';
import config from '../../config/config';
import { useAuth } from '../../contexts/AuthContext';

const ProductionsList = () => {
    // États
    const [productions, setProductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');
    const [genre, setGenre] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [priceRange, setPriceRange] = useState('all');
    const [releaseDateRange, setReleaseDateRange] = useState('all');
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const { isAuthenticated } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                    sortBy,
                    priceRange,
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
    }, [page, searchDebounce, genre, sortBy, priceRange, releaseDateRange]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    const handleGenreChange = (e) => {
        setGenre(e.target.value);
        setPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
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
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
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
                                icon={<NewReleases fontSize="small" />}
                                label="Nouveautés"
                                color={sortBy === 'latest' ? "primary" : "default"}
                                onClick={() => setSortBy('latest')}
                                sx={{ fontWeight: 'medium', px: 1 }}
                            />
                            <Chip
                                icon={<TrendingUp fontSize="small" />}
                                label="Populaires"
                                color={sortBy === 'popular' ? "primary" : "default"}
                                onClick={() => setSortBy('popular')}
                                sx={{ fontWeight: 'medium', px: 1 }}
                            />
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
                            p: 2,
                            borderRadius: 3,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Grid container spacing={2} alignItems="center">
                            {/* Barre de recherche */}
                            <Grid item xs={12} sm={filtersExpanded ? 12 : 6} md={filtersExpanded ? 6 : 6}>
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
                                    <Grid item xs={6} sm={3} md={3}>
                                        <FormControl fullWidth size="small" sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                                            <InputLabel>Genre</InputLabel>
                                            <Select
                                                value={genre}
                                                label="Genre"
                                                onChange={handleGenreChange}
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

                                    <Grid item xs={6} sm={3} md={3}>
                                        <FormControl fullWidth size="small" sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                                            <InputLabel>Trier par</InputLabel>
                                            <Select
                                                value={sortBy}
                                                label="Trier par"
                                                onChange={handleSortChange}
                                                sx={{ borderRadius: 10 }}
                                            >
                                                <MenuItem value="latest">Plus récents</MenuItem>
                                                <MenuItem value="popular">Plus populaires</MenuItem>
                                                <MenuItem value="price_asc">Prix croissant</MenuItem>
                                                <MenuItem value="price_desc">Prix décroissant</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}

                            {/* Bouton pour afficher plus de filtres */}
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: filtersExpanded ? 1 : 0
                                }}
                            >
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
                            </Grid>

                            {/* Filtres supplémentaires */}
                            {filtersExpanded && (
                                <>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth size="small" sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                                            <InputLabel>Prix</InputLabel>
                                            <Select
                                                value={priceRange}
                                                label="Prix"
                                                onChange={(e) => setPriceRange(e.target.value)}
                                                sx={{ borderRadius: 10 }}
                                            >
                                                <MenuItem value="all">Tous les prix</MenuItem>
                                                <MenuItem value="free">Gratuits</MenuItem>
                                                <MenuItem value="under10">Moins de 10€</MenuItem>
                                                <MenuItem value="10to50">10€ - 50€</MenuItem>
                                                <MenuItem value="over50">Plus de 50€</MenuItem>
                                            </Select>
                                        </FormControl>
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
                                                <MenuItem value="all">Toutes les dates</MenuItem>
                                                <MenuItem value="thisWeek">Cette semaine</MenuItem>
                                                <MenuItem value="thisMonth">Ce mois-ci</MenuItem>
                                                <MenuItem value="thisYear">Cette année</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Card>

                    {/* Résultats de recherche */}
                    {productions.length > 0 ? (
                        <>
                            <Zoom in={true} timeout={600}>
                                <Grid container spacing={3}>
                                    {productions.map((production) => (
                                        <Grid item xs={12} sm={6} md={4} key={production.id}>
                                            <Card
                                                elevation={2}
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    borderRadius: 3,
                                                    overflow: 'hidden',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: 6
                                                    },
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleProductionClick(production.id)}
                                            >
                                                <Box sx={{ position: 'relative' }}>
                                                    {/* Image ou bloc coloré */}
                                                    <Box
                                                        sx={{
                                                            height: 180,
                                                            bgcolor: 'primary.main',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative',
                                                            background: production.image_url
                                                                ? `url(${config.UPLOADS_URL}${production.image_url}) center/cover`
                                                                : 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)'
                                                        }}
                                                    >
                                                        {!production.image_url && (
                                                            <MusicNoteIcon sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
                                                        )}

                                                        {/* Badge de genre */}
                                                        {production.genre && (
                                                            <Chip
                                                                label={production.genre}
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 12,
                                                                    left: 12,
                                                                    bgcolor: 'rgba(0,0,0,0.6)',
                                                                    color: 'white',
                                                                    fontWeight: 'medium',
                                                                    zIndex: 1
                                                                }}
                                                            />
                                                        )}

                                                        {/* Bouton de lecture */}
                                                        <IconButton
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 10,
                                                                right: 10,
                                                                bgcolor: 'white',
                                                                color: 'primary.main',
                                                                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                                                                zIndex: 1,
                                                                boxShadow: 2
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Code pour lire l'audio
                                                            }}
                                                        >
                                                            <PlayArrow />
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                                        {production.title}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        par {production.artist || 'Artiste inconnu'}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 1.5,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}
                                                    >
                                                        {production.description || "Aucune description disponible pour cette production."}
                                                    </Typography>
                                                </CardContent>

                                                <CardActions
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        px: 2.5,
                                                        pb: 2.5
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight="bold"
                                                        color="primary.main"
                                                    >
                                                        {production.price ? `${production.price} €` : 'Gratuit'}
                                                    </Typography>

                                                    <Button
                                                        variant="outlined"
                                                        endIcon={<ArrowForwardIos sx={{ fontSize: '0.8rem' }} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleProductionClick(production.id);
                                                        }}
                                                        sx={{
                                                            borderRadius: 10,
                                                            textTransform: 'none',
                                                            fontWeight: 'medium'
                                                        }}
                                                    >
                                                        Détails
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Zoom>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size={isMobile ? "medium" : "large"}
                                        showFirstButton
                                        showLastButton
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                borderRadius: 2
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </>
                    ) : (
                        <Paper
                            elevation={1}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                borderRadius: 3,
                                backgroundColor: 'background.paper',
                                mt: 3
                            }}
                        >
                            <MusicNoteIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Aucune production trouvée
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Essayez de modifier vos critères de recherche ou de filtrage.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setGenre('');
                                    setSortBy('latest');
                                    setPriceRange('all');
                                    setReleaseDateRange('all');
                                }}
                                sx={{
                                    mt: 1,
                                    borderRadius: 10,
                                    textTransform: 'none'
                                }}
                            >
                                Réinitialiser les filtres
                            </Button>
                        </Paper>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default ProductionsList;
