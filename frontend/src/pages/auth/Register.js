// src/pages/auth/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Container, Typography, Box, Paper, TextField, Button,
    Alert, Divider, Grid
} from '@mui/material';

const validationSchema = Yup.object({
    username: Yup.string()
        .required('Nom d\'utilisateur requis')
        .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
    email: Yup.string()
        .email('Email invalide')
        .required('Email requis'),
    password: Yup.string()
        .required('Mot de passe requis')
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
        .required('Confirmation du mot de passe requise')
});

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await register({
                username: values.username,
                email: values.email,
                password: values.password
            });

            setSuccess('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
            resetForm();
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            setError('Erreur lors de l\'inscription. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Créer un compte
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <Formik
                    initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, touched, errors }) => (
                        <Form>
                            <Field
                                as={TextField}
                                fullWidth
                                margin="normal"
                                name="username"
                                label="Nom d'utilisateur"
                                error={touched.username && Boolean(errors.username)}
                                helperText={touched.username && errors.username}
                            />

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

                            <Field
                                as={TextField}
                                fullWidth
                                margin="normal"
                                name="confirmPassword"
                                label="Confirmer le mot de passe"
                                type="password"
                                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                helperText={touched.confirmPassword && errors.confirmPassword}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isSubmitting}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
                            </Button>
                        </Form>
                    )}
                </Formik>

                <Divider sx={{ my: 3 }} />

                <Grid container justifyContent="center">
                    <Grid item>
                        <Typography variant="body2">
                            Déjà inscrit ?{' '}
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                Se connecter
                            </Link>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Register;