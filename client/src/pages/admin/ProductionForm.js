// src/pages/admin/ProductionForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Container, Typography, Box, Paper, TextField,
    Button, Grid, FormControl, InputLabel, Select,
    MenuItem, FormHelperText, CircularProgress, Alert,
    IconButton
} from '@mui/material';
import { PhotoCamera, ArrowBack, Save } from '@mui/icons-material';
import { getProduction, createProduction, updateProduction } from '../../services/productionService';
import config from '../../config/config';
import { useTranslation } from 'react-i18next';

const ProductionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const isEditing = Boolean(id);
    const { t } = useTranslation();

    const validationSchema = Yup.object({
        title: Yup.string().required(t('admin.productionForm.validation.titleRequired')),
        artist: Yup.string().required(t('admin.productionForm.validation.artistRequired')),
        genre: Yup.string(),
        release_date: Yup.date().nullable(),
        description: Yup.string()
    });

    const formik = useFormik({
        initialValues: {
            title: '',
            artist: '',
            genre: '',
            release_date: '',
            description: '',
            cover_image: null
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (isEditing) {
                    await updateProduction(id, values);
                } else {
                    await createProduction(values);
                }
                navigate('/admin/productions');
            } catch (error) {
                console.error("Erreur lors de l'enregistrement:", error);
                setError(`Erreur lors de ${isEditing ? 'la modification' : 'la création'} de la production`);
            }
        }
    });

    useEffect(() => {
        if (isEditing) {
            const fetchProduction = async () => {
                try {
                    setLoading(true);
                    const data = await getProduction(id);

                    // Format de la date pour l'input date
                    let formattedDate = '';
                    if (data.release_date) {
                        const date = new Date(data.release_date);
                        formattedDate = date.toISOString().split('T')[0];
                    }

                    formik.setValues({
                        title: data.title || '',
                        artist: data.artist || '',
                        genre: data.genre || '',
                        release_date: formattedDate,
                        description: data.description || '',
                        cover_image: null
                    });

                    if (data.cover_image) {
                        setImagePreview(`${config.UPLOADS_URL}${data.cover_image}`);
                    }
                } catch (error) {
                    console.error("Erreur lors du chargement de la production:", error);
                    setError("Impossible de charger les données de la production");
                } finally {
                    setLoading(false);
                }
            };
            fetchProduction();
        }
    }, [id, isEditing]);

    const handleImageChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            formik.setFieldValue('cover_image', file);

            // Créer un aperçu de l'image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/admin/productions')}
                >
                    {t('common.backToList')}
                </Button>
            </Box>

            <Typography variant="h4" component="h1" gutterBottom>
                {isEditing ? t('admin.productionForm.editTitle') : t('admin.productionForm.newTitle')}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{t(error)}</Alert>}

            <Paper sx={{ p: 3 }}>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label={t('admin.productionForm.title')}
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="artist"
                                name="artist"
                                label={t('admin.productionForm.artist')}
                                value={formik.values.artist}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.artist && Boolean(formik.errors.artist)}
                                helperText={formik.touched.artist && formik.errors.artist}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="genre-label">{t('admin.productionForm.genre')}</InputLabel>
                                <Select
                                    labelId="genre-label"
                                    id="genre"
                                    name="genre"
                                    value={formik.values.genre}
                                    onChange={formik.handleChange}
                                    label="Genre"
                                >
                                    <MenuItem value="">{t('admin.productionForm.genreNotSpecified')}</MenuItem>
                                    <MenuItem value="Rock">{t('genres.rock')}</MenuItem>
                                    <MenuItem value="Pop">{t('genres.pop')}</MenuItem>
                                    <MenuItem value="Jazz">{t('genres.jazz')}</MenuItem>
                                    <MenuItem value="Hip-Hop">{t('genres.hiphop')}</MenuItem>
                                    <MenuItem value="Électronique">{t('genres.electronic')}</MenuItem>
                                    <MenuItem value="Classique">{t('genres.classical')}</MenuItem>
                                    <MenuItem value="R&B">{t('genres.rnb')}</MenuItem>
                                    <MenuItem value="Reggae">{t('genres.reggae')}</MenuItem>
                                    <MenuItem value="Autre">{t('genres.other')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="release_date"
                                name="release_date"
                                label={t('admin.productionForm.releaseDate')}
                                type="date"
                                value={formik.values.release_date}
                                onChange={formik.handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label={t('admin.productionForm.description')}
                                multiline
                                rows={4}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {t('admin.productionForm.coverImage')}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<PhotoCamera />}
                                    >
                                        {t('admin.productionForm.chooseImage')}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={handleImageChange}
                                        />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary">
                                        {formik.values.cover_image ? formik.values.cover_image.name : t('admin.productionForm.noFileSelected')}
                                    </Typography>
                                </Box>
                            </Box>
                            {imagePreview && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        width: '100%',
                                        maxWidth: 300,
                                        height: 200,
                                        backgroundImage: `url(${imagePreview})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        border: '1px solid #ddd',
                                        borderRadius: 1
                                    }}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/admin/productions')}
                                    sx={{ mr: 1 }}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Save />}
                                    disabled={formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? t('admin.productionForm.saving') : isEditing ? t('admin.productionForm.update') : t('admin.productionForm.create')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default ProductionForm;