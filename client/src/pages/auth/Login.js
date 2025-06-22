// src/pages/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Container, Typography, Box, Paper, TextField, Button,
    Alert, Divider, Grid, CircularProgress, IconButton,
    InputAdornment, useTheme, Fade, Zoom, Grow,
    Card, CardContent
} from '@mui/material';
import {
    Email, Lock, Visibility, VisibilityOff,
    LoginOutlined, ArrowForward, MusicNote
} from '@mui/icons-material';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Email invalide')
        .required('Email requis'),
    password: Yup.string()
        .required('Mot de passe requis')
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const theme = useTheme();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (values, { setSubmitting }) => {
        setError('');
        setIsSubmitting(true);

        try {
            // Appel à la fonction login du contexte d'authentification
            const result = await login(values.email, values.password);

            if (result && result.success) {
                // Redirection uniquement en cas de succès
                navigate(from);
            } else {
                // Affichage du message d'erreur retourné par le backend
                setError(result?.message || 'Identifiants incorrects. Veuillez réessayer.');
            }
        } catch (err) {
            setError('Erreur lors de la connexion.');
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
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
                                <Zoom in={true} timeout={1000}>
                                    <MusicNote sx={{ fontSize: 40, position: 'absolute', left: 20, opacity: 0.7 }} />
                                </Zoom>
                                <Typography variant="h4" component="h1" align="center" fontWeight="bold">
                                    Connexion
                                </Typography>
                            </Box>
                        </Grid>
                        {/* Contenu du formulaire */}
                        <Grid item xs={12}>
                            <Box sx={{ p: { xs: 3, sm: 5 } }}>
                                {error && (
                                    <Zoom in={true}>
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mb: 3,
                                                borderRadius: 2,
                                                '& .MuiAlert-message': {
                                                    fontWeight: 'medium'
                                                }
                                            }}
                                        >
                                            {error}
                                        </Alert>
                                    </Zoom>
                                )}
                                <Formik
                                    initialValues={{ email: '', password: '' }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ errors, touched, isSubmitting, values, handleChange }) => (
                                        <Form>
                                            <Grid container spacing={2} justifyContent="center">
                                                <Grid item xs={12} md={8}>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        label="Email"
                                                        name="email"
                                                        type="email"
                                                        placeholder="exemple@email.com"
                                                        value={values.email}
                                                        onChange={handleChange}
                                                        autoComplete="email"
                                                        required
                                                        variant="outlined"
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Email color="primary" />
                                                                </InputAdornment>
                                                            ),
                                                            sx: { borderRadius: 2 }
                                                        }}
                                                        error={touched.email && Boolean(errors.email)}
                                                        helperText={touched.email && errors.email}
                                                        disabled={isSubmitting}
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
                                                        value={values.password}
                                                        onChange={handleChange}
                                                        autoComplete="current-password"
                                                        required
                                                        variant="outlined"
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Lock color="primary" />
                                                                </InputAdornment>
                                                            ),
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                            sx: { borderRadius: 2 }
                                                        }}
                                                        error={touched.password && Boolean(errors.password)}
                                                        helperText={touched.password && errors.password}
                                                        disabled={isSubmitting}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <Button
                                                        type="submit"
                                                        fullWidth
                                                        variant="contained"
                                                        color="primary"
                                                        size="large"
                                                        disabled={isSubmitting}
                                                        startIcon={isSubmitting ? null : <LoginOutlined />}
                                                        sx={{
                                                            py: 1.5,
                                                            borderRadius: 10,
                                                            textTransform: 'none',
                                                            fontWeight: 'bold',
                                                            fontSize: '1rem'
                                                        }}
                                                    >
                                                        {isSubmitting ? (
                                                            <CircularProgress size={24} color="inherit" />
                                                        ) : (
                                                            'Se connecter'
                                                        )}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Form>
                                    )}
                                </Formik>
                                <Divider sx={{ my: 4 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ px: 2 }}
                                    >
                                        Nouveau sur PoloStore ?
                                    </Typography>
                                </Divider>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="primary"
                                    component={Link}
                                    to="/register"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 10,
                                        textTransform: 'none',
                                        fontWeight: 'medium',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Créer un compte
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Fade>
        </Container>
    );
};

export default Login;
