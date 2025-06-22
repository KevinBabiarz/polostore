// src/pages/admin/AddProduction.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, TextField, Button, Box, Paper, Grid,
    FormControl, InputLabel, Select, MenuItem, CircularProgress,
    Alert, Chip, IconButton
} from '@mui/material';
import { CloudUpload, ArrowBack, Delete } from '@mui/icons-material';
import { createProduction, getProductionById } from '../../services/productionService';

const AddProduction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

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
                        cover_image: null, // L'image existante est affichée mais pas chargée dans le state
                        audio_files: [] // Les fichiers existants sont affichés mais pas chargés dans le state
                    });

                    // Si une image existe, la prévisualiser
                    if (data.cover_image) {
                        setPreview(`${process.env.REACT_APP_API_URL}/uploads/${data.cover_image}`);
                    }
                } catch (error) {
                    console.error("Erreur lors du chargement de la production:", error);
                    setError("Impossible de charger les données de cette production");
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

            // Créer une URL pour prévisualiser l'image
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result);
            };
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
            // Valider les données avant envoi
            if (!formData.title.trim() || !formData.artist.trim()) {
                throw new Error("Le titre et l'artiste sont requis.");
            }

            // Préparer les données pour l'envoi
            const productionData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'cover_image') {
                    if (formData[key]) {
                        productionData.append(key, formData[key]);
                    }
                } else if (key === 'audio_files') {
                    // Les fichiers audio sont gérés séparément
                } else {
                    productionData.append(key, formData[key]);
                }
            });

            // Ajouter les fichiers audio
            formData.audio_files.forEach(file => {
                productionData.append('audio_files', file);
            });

            // ID pour le mode édition
            if (isEditMode) {
                productionData.append('id', id);
            }

            // Envoi des données à l'API
            await createProduction(productionData, isEditMode ? 'put' : 'post');

            setSuccess(isEditMode ?
                'Production mise à jour avec succès!' :
                'Production ajoutée avec succès!'
            );

            // Redirection après un court délai
            setTimeout(() => {
                navigate('/productions');
            }, 2000);

        } catch (error) {
            console.error("Erreur lors de l'enregistrement:", error);
            setError(error.message || "Une erreur est survenue lors de l'enregistrement");
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
                Retour
            </Button>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditMode ? 'Modifier la production' : 'Ajouter une nouvelle production'}
                </Typography>

                {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="title"
                                label="Titre"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="artist"
                                label="Artiste"
                                value={formData.artist}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Genre</InputLabel>
                                <Select
                                    name="genre"
                                    value={formData.genre}
                                    label="Genre"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Rock">Rock</MenuItem>
                                    <MenuItem value="Hip-Hop">Hip-Hop</MenuItem>
                                    <MenuItem value="Jazz">Jazz</MenuItem>
                                    <MenuItem value="Classique">Classique</MenuItem>
                                    <MenuItem value="Electronic">Electronic</MenuItem>
                                    <MenuItem value="Pop">Pop</MenuItem>
                                    <MenuItem value="R&B">R&B</MenuItem>
                                    <MenuItem value="Autre">Autre</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="release_date"
                                label="Date de sortie"
                                type="date"
                                value={formData.release_date}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
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
                                {preview ? "Changer l'image" : "Ajouter une image de couverture"}
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
                                        alt="Prévisualisation"
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
                                Ajouter des fichiers audio
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
                                    {loading ? <CircularProgress size={24} /> : isEditMode ? 'Mettre à jour' : 'Ajouter'}
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