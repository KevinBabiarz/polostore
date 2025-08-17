// src/pages/admin/AddProduction.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, TextField, Button, Box, Paper, Grid,
    FormControl, InputLabel, Select, MenuItem, CircularProgress,
    Alert, Chip
} from '@mui/material';
import { CloudUpload, ArrowBack, Delete } from '@mui/icons-material';
import { createProduction, getProductionById, updateProduction } from '../../services/productionService';
import { useTranslation } from 'react-i18next';
import config from '../../config/config';

const AddProduction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { t } = useTranslation('admin');

    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        description: '',
        genre: '',
        release_date: '',
        cover_image: null,
        audio_files: []
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingData, setLoadingData] = useState(isEditMode);

    // Charger les données existantes en mode édition
    useEffect(() => {
        if (isEditMode) {
            const fetchProductionData = async () => {
                try {
                    const data = await getProductionById(id);
                    setFormData({
                        title: data.title || '',
                        artist: data.artist || '',
                        description: data.description || '',
                        genre: data.genre || '',
                        release_date: data.release_date ? data.release_date.split('T')[0] : '',
                        cover_image: null,
                        audio_files: []
                    });

                    // Aperçu de l'image existante via image_url
                    if (data.image_url) {
                        const base = config.UPLOADS_URL || '';
                        setPreview(data.image_url.startsWith('http') ? data.image_url : `${base}${data.image_url}`);
                    }
                } catch (error) {
                    console.error('Erreur lors du chargement de la production:', error);
                    setError('Impossible de charger les données de cette production');
                } finally {
                    setLoadingData(false);
                }
            };

            fetchProductionData();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, cover_image: file });

            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAudioFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, audio_files: [...formData.audio_files, ...files] });
    };

    const removeAudioFile = (index) => {
        const newFiles = [...formData.audio_files];
        newFiles.splice(index, 1);
        setFormData({ ...formData, audio_files: newFiles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validation minimale
            if (!formData.title.trim() || !formData.artist.trim()) {
                setError('addProduction.requiredFields');
                setLoading(false);
                return;
            }

            // Construire un payload simple (le service fera la conversion en FormData)
            const payload = {
                title: formData.title,
                artist: formData.artist,
                description: formData.description,
                genre: formData.genre,
                release_date: formData.release_date,
                cover_image: formData.cover_image || undefined,
                audio_files: formData.audio_files || []
            };

            if (isEditMode) {
                await updateProduction(id, payload);
                setSuccess('addProduction.updated');
            } else {
                await createProduction(payload);
                setSuccess('addProduction.added');
            }

            setTimeout(() => navigate('/productions'), 1500);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement:", error);
            setError(error.message || 'addProduction.error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                {t('common:back')}
            </Button>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditMode ? t('addProduction.editTitle') : t('addProduction.addTitle')}
                </Typography>

                {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{t(error)}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{t(success)}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="title"
                                label={t('addProduction.title')}
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="artist"
                                label={t('addProduction.artist')}
                                value={formData.artist}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>{t('addProduction.genre')}</InputLabel>
                                <Select
                                    name="genre"
                                    value={formData.genre}
                                    label="Genre"
                                    onChange={handleChange}
                                    variant="outlined"
                                >
                                    <MenuItem value="Rock">{t('common:genres.rock')}</MenuItem>
                                    <MenuItem value="Hip-Hop">{t('common:genres.hiphop')}</MenuItem>
                                    <MenuItem value="Jazz">{t('common:genres.jazz')}</MenuItem>
                                    <MenuItem value="Classique">{t('common:genres.classical')}</MenuItem>
                                    <MenuItem value="Electronic">{t('common:genres.electronic')}</MenuItem>
                                    <MenuItem value="Pop">{t('common:genres.pop')}</MenuItem>
                                    <MenuItem value="R&B">{t('common:genres.rnb')}</MenuItem>
                                    <MenuItem value="Autre">{t('common:genres.other')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="release_date"
                                label={t('addProduction.releaseDate')}
                                type="date"
                                value={formData.release_date}
                                onChange={handleChange}
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label={t('addProduction.description')}
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={4}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUpload />}
                                color="primary"
                                sx={{ mt: 2 }}
                            >
                                {preview ? t('addProduction.changeImage') : t('addProduction.addCoverImage')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Button>

                            {preview && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <img
                                        src={preview}
                                        alt={t('addProduction.previewAlt')}
                                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                                    />
                                </Box>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUpload />}
                                color="secondary"
                                sx={{ mt: 2 }}
                            >
                                {t('addProduction.addAudioFiles')}
                                <input
                                    type="file"
                                    hidden
                                    accept="audio/*"
                                    multiple
                                    onChange={handleAudioFilesChange}
                                />
                            </Button>

                            {formData.audio_files.length > 0 && (
                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {formData.audio_files.map((file, index) => (
                                        <Chip
                                            key={index}
                                            label={file.name}
                                            onDelete={() => removeAudioFile(index)}
                                            deleteIcon={<Delete />}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    sx={{ minWidth: 150 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : isEditMode ? t('addProduction.update') : t('addProduction.add')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default AddProduction;
