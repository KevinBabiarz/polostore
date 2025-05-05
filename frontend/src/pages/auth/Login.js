// src/pages/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Container, Typography, Box, Paper, TextField, Button,
    Alert, Divider, Grid
} from '@mui/material';

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

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await login(values.email, values.password);
            navigate(from);
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setError('Identifiants invalides. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Connexion
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, touched, errors }) => (
                        <Form>
                            <Field
                                as={TextField}
                                fullWidth
                                margin="normal"
                                name="email"
                                label="Email"
                                type="email"
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                            />

                            <Field
                                as={TextField}
                                fullWidth
                                margin="normal"
                                name="password"
                                label="Mot de passe"
                                type="password"
                                error={touched.password && Boolean(errors.password)}
                                helperText={touched.password && errors.password}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isSubmitting}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                            </Button>
                        </Form>
                    )}
                </Formik>

                <Divider sx={{ my: 3 }} />

                <Grid container justifyContent="center">
                    <Grid item>
                        <Typography variant="body2">
                            Pas encore inscrit ?{' '}
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                Créer un compte
                            </Link>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Login;