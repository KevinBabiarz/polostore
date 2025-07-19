// src/pages/auth/Login.js
import React, { useState } from 'react';
import {
    Container, Typography, TextField, Button, Box, Paper,
    Grid, Alert, CircularProgress, Divider, InputAdornment,
    IconButton, useTheme, Fade, Zoom
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Email, Lock, Visibility, VisibilityOff,
    LoginOutlined, ArrowForward
} from '@mui/icons-material';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { t } = useTranslation('auth'); // Spécifier le namespace auth

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation de base
        if (!formData.email.trim() || !formData.password) {
            setError(t('allFieldsRequired'));
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError(t('emailInvalid'));
            return;
        }

        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result && result.success) {
                // Redirection en cas de succès
                navigate(from);
            } else {
                // Affichage du message d'erreur retourné par le backend
                setError(result?.message || t('loginError'));
            }
        } catch (err) {
            setError(t('loginError'));
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
                                    {t('loginTitle')}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Contenu du formulaire */}
                        <Grid item xs={12}>
                            <Box sx={{ p: { xs: 3, sm: 5 } }}>
                                {error && (
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
                                    )}

                                <Typography
                                    variant="body1"
                                    sx={{
                                        mb: 4,
                                        textAlign: 'center',
                                        color: 'text.secondary'
                                    }}
                                >
                                    {t('loginSubtitle', { defaultValue: 'Connectez-vous pour accéder à votre espace personnel' })}
                                </Typography>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2} justifyContent="center">
                                        <Grid item xs={12} md={8}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label={t('email')}
                                                name="email"
                                                type="email"
                                                placeholder={t('emailPlaceholder', { defaultValue: 'exemple@email.com' })}
                                                value={formData.email}
                                                onChange={handleChange}
                                                autoComplete="email"
                                                required
                                                variant="outlined"
                                                disabled={loading}
                                                sx={{
                                                    '& .MuiInputBase-input': {
                                                        color: theme.palette.mode === 'dark' ? 'white' : 'black !important',
                                                        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : 'white !important',
                                                        '&:-webkit-autofill': {
                                                            WebkitBoxShadow: theme.palette.mode === 'dark'
                                                                ? '0 0 0 1000px #424242 inset'
                                                                : '0 0 0 1000px white inset !important',
                                                            WebkitTextFillColor: theme.palette.mode === 'dark' ? 'white !important' : 'black !important',
                                                            transition: 'background-color 5000s ease-in-out 0s',
                                                        },
                                                        '&:-webkit-autofill:hover': {
                                                            WebkitBoxShadow: theme.palette.mode === 'dark'
                                                                ? '0 0 0 1000px #424242 inset'
                                                                : '0 0 0 1000px white inset !important',
                                                            WebkitTextFillColor: theme.palette.mode === 'dark' ? 'white !important' : 'black !important',
                                                        },
                                                        '&:-webkit-autofill:focus': {
                                                            WebkitBoxShadow: theme.palette.mode === 'dark'
                                                                ? '0 0 0 1000px #424242 inset'
                                                                : '0 0 0 1000px white inset !important',
                                                            WebkitTextFillColor: theme.palette.mode === 'dark' ? 'white !important' : 'black !important',
                                                        },
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : 'white !important',
                                                        '& fieldset': {
                                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                                    },
                                                }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Email sx={{ color: theme.palette.mode === 'dark' ? 'primary.main' : 'rgba(0, 0, 0, 0.54)' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label={t('password')}
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={t('passwordPlaceholder', { defaultValue: 'Votre mot de passe' })}
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="current-password"
                                                required
                                                variant="outlined"
                                                disabled={loading}
                                                sx={{
                                                    '& .MuiInputBase-input': {
                                                        color: theme.palette.mode === 'dark' ? 'white' : 'black !important',
                                                        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : 'white !important',
                                                        '&:-webkit-autofill': {
                                                            WebkitBoxShadow: theme.palette.mode === 'dark'
                                                                ? '0 0 0 1000px #424242 inset'
                                                                : '0 0 0 1000px white inset !important',
                                                            WebkitTextFillColor: theme.palette.mode === 'dark' ? 'white !important' : 'black !important',
                                                            transition: 'background-color 5000s ease-in-out 0s',
                                                        },
                                                        '&:-webkit-autofill:hover': {
                                                            WebkitBoxShadow: theme.palette.mode === 'dark'
                                                                ? '0 0 0 1000px #424242 inset'
                                                                : '0 0 0 1000px white inset !important',
                                                            WebkitTextFillColor: theme.palette.mode === 'dark' ? 'white !important' : 'black !important',
                                                        },
                                                        '&:-webkit-autofill:focus': {
                                                            WebkitBoxShadow: theme.palette.mode === 'dark'
                                                                ? '0 0 0 1000px #424242 inset'
                                                                : '0 0 0 1000px white inset !important',
                                                            WebkitTextFillColor: theme.palette.mode === 'dark' ? 'white !important' : 'black !important',
                                                        },
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                                    },
                                                }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Lock sx={{ color: theme.palette.mode === 'dark' ? 'primary.main' : 'rgba(0, 0, 0, 0.54)' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={toggleShowPassword} edge="end">
                                                                {showPassword ?
                                                                    <VisibilityOff sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)' }} /> :
                                                                    <Visibility sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)' }} />
                                                                }
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={8}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                disabled={loading}
                                                startIcon={<LoginOutlined />}
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
                                                {loading ? t('common.loading') : t('loginButton')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>

                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Divider sx={{ mb: 3 }}>
                                        <Typography variant="body2" component="span" sx={{ px: 2, color: 'text.secondary' }}>
                                            {t('noAccount')}
                                        </Typography>
                                    </Divider>

                                    <Button
                                        component={RouterLink}
                                        to="/register"
                                        variant="outlined"
                                        color="primary"
                                        endIcon={<ArrowForward />}
                                        sx={{
                                            borderRadius: 4,
                                            fontWeight: 'bold',
                                            px: 3
                                        }}
                                    >
                                        {t('registerButton')}
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

export default Login;
