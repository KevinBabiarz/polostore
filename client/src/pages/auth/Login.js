// src/pages/auth/Login.js
import React, { useState } from 'react';
import {
    Container, Typography, TextField, Button, Box, Paper,
    Grid, Alert, CircularProgress, Divider, InputAdornment,
    IconButton, useTheme, Fade, Zoom
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Email, Lock, Visibility, VisibilityOff,
    LoginOutlined, ArrowForward
} from '@mui/icons-material';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

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
            setError('Tous les champs sont obligatoires');
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError('Veuillez entrer une adresse email valide');
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
                setError(result?.message || 'Identifiants incorrects. Veuillez réessayer.');
            }
        } catch (err) {
            setError('Une erreur est survenue lors de la connexion.');
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
                                    Connexion
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
                                    Connectez-vous pour accéder à votre espace personnel
                                </Typography>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2} justifyContent="center">
                                        <Grid item xs={12} md={8}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label="Email"
                                                name="email"
                                                type="email"
                                                placeholder="exemple@email.com"
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
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                label="Mot de passe"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Votre mot de passe"
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="current-password"
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
                                                {loading ? 'Connexion en cours...' : 'Se connecter'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>

                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Divider sx={{ mb: 3 }}>
                                        <Typography variant="body2" component="span" sx={{ px: 2, color: 'text.secondary' }}>
                                            Nouveau sur le site ?
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
                                        Créer un compte
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
