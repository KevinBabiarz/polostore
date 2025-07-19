// src/pages/auth/Register.js
import React, { useState } from 'react';
import {
    Container, Typography, TextField, Button, Box, Paper,
    Grid, Alert, CircularProgress, Divider, InputAdornment,
    IconButton, useTheme, Fade, Zoom, Grow, Stepper,
    Step, StepLabel, Checkbox, FormControlLabel
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Person, Email, Lock, Visibility, VisibilityOff,
    HowToReg, ArrowBack, Check, ArrowForward
} from '@mui/icons-material';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const { t } = useTranslation('auth'); // Spécifier le namespace auth

    // Modifié pour correspondre exactement aux champs attendus par le backend
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleTermsChange = (e) => {
        setAgreedToTerms(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation de base - s'assurer que tous les champs sont remplis
        // On utilise trim() comme le fait le backend
        if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
            setError(t('allFieldsRequired'));
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError(t('emailInvalid'));
            return;
        }

        // Vérification que les mots de passe correspondent
        if (formData.password !== formData.confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        // Vérification de la longueur minimale du mot de passe
        if (formData.password.length < 6) {
            setError(t('passwordMinLength'));
            return;
        }

        // Vérification de l'acceptation des conditions
        if (!agreedToTerms) {
            setError(t('termsRequired'));
            return;
        }

        setLoading(true);

        try {
            // Envoi des données exactement dans le format attendu par le backend
            const userData = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };

            console.log("Données envoyées pour inscription:", userData);

            const result = await register(userData);

            if (result && result.success) {
                setSuccess(true);
                // Rediriger vers la page d'accueil au lieu de la page de connexion
                // puisque l'utilisateur est déjà connecté après l'inscription
                setTimeout(() => {
                    navigate('/'); // Redirection vers la page d'accueil
                }, 1500);
            } else {
                // Afficher le message d'erreur spécifique du serveur
                setError(result?.message || t('registerError'));
            }
        } catch (err) {
            console.error('Erreur détaillée:', err);
            setError(t('registerError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 5, sm: 8 } }}>
            <Fade in={true} timeout={800}>
                <Paper
                    elevation={4}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
                    }}
                >
                    <Grid container>
                        {/* Bannière colorée en haut */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    bgcolor: 'primary.main',
                                    py: 3,
                                    px: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    position: 'relative'
                                }}
                            >
                                <Typography variant="h4" component="h1" align="center" fontWeight="bold">
                                    {t('registerTitle')}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Contenu du formulaire */}
                        <Grid item xs={12}>
                            <Box sx={{ p: { xs: 3, sm: 5 } }}>
                                {success ? (
                                    <Zoom in={true} timeout={500}>
                                        <Alert
                                            icon={<Check fontSize="inherit" />}
                                            severity="success"
                                            sx={{
                                                mb: 3,
                                                borderRadius: 1,
                                                '& .MuiAlert-icon': { alignItems: 'center' }
                                            }}
                                        >
                                            {t('registerSuccess')}
                                        </Alert>
                                    </Zoom>
                                ) : error ? (
                                    <Zoom in={true} timeout={500}>
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mb: 3,
                                                borderRadius: 1,
                                                '& .MuiAlert-icon': { alignItems: 'center' }
                                            }}
                                            variant="filled"
                                            onClose={() => setError('')}
                                        >
                                            {error}
                                        </Alert>
                                    </Zoom>
                                ) : null}

                                <Typography
                                    variant="body1"
                                    sx={{
                                        mb: 4,
                                        textAlign: 'center',
                                        color: 'text.secondary'
                                    }}
                                >
                                    {t('registerSubtitle')}
                                </Typography>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2} justifyContent="center">
                                        <Grid item xs={12} md={8}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label={t('username')}
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                variant="outlined"
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Person color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { borderRadius: 2 }
                                                }}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label={t('email')}
                                                name="email"
                                                type="email"
                                                placeholder={t('emailPlaceholder')}
                                                value={formData.email}
                                                onChange={handleChange}
                                                autoComplete="email"
                                                required
                                                variant="outlined"
                                                disabled={loading}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Email color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label={t('password')}
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={t('passwordPlaceholder')}
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                required
                                                variant="outlined"
                                                disabled={loading}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Lock color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={toggleShowPassword} edge="end">
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label={t('confirmPassword')}
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder={t('confirmPasswordPlaceholder')}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                required
                                                variant="outlined"
                                                disabled={loading}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Lock color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={toggleShowConfirmPassword} edge="end">
                                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', mt: 0 }}>
                                            <FormControlLabel
                                                control={<Checkbox checked={agreedToTerms} onChange={handleTermsChange} />}
                                                label={t('agreeToTerms')}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                disabled={loading}
                                                startIcon={<HowToReg />}
                                                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                                                sx={{
                                                    py: 1.2,
                                                    mt: 2,
                                                    borderRadius: 4,
                                                    fontWeight: 'bold',
                                                    boxShadow: 2,
                                                    '&:hover': {
                                                        boxShadow: 4,
                                                    }
                                                }}
                                            >
                                                {loading ? t('common.loading') : t('registerButton')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>

                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Divider sx={{ mb: 3 }}>
                                        <Typography variant="body2" component="span" sx={{ px: 2, color: 'text.secondary' }}>
                                            {t('alreadyAccount')}
                                        </Typography>
                                    </Divider>

                                    <Button
                                        component={RouterLink}
                                        to="/login"
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<ArrowBack />}
                                        sx={{
                                            borderRadius: 4,
                                            fontWeight: 'bold',
                                            px: 3
                                        }}
                                    >
                                        {t('backToLogin')}
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Fade>
        </Container>
    );
};

export default Register;
