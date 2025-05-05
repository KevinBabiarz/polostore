// src/pages/contact/Contact.js
import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { sendContactMessage } from '../../services/contactService';
import {
    Container, Typography, Paper, TextField, Button,
    Snackbar, Alert, Box
} from '@mui/material';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Nom requis'),
    email: Yup.string()
        .email('Email invalide')
        .required('Email requis'),
    subject: Yup.string()
        .required('Sujet requis'),
    message: Yup.string()
        .required('Message requis')
        .min(10, 'Le message doit contenir au moins 10 caractères')
});

const Contact = () => {
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await sendContactMessage(values);
            setAlertMessage('Votre message a été envoyé avec succès. Nous vous répondrons prochainement.');
            setAlertSeverity('success');
            setOpenAlert(true);
            resetForm();
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            setAlertMessage('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
            setAlertSeverity('error');
            setOpenAlert(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Contactez-nous
                </Typography>

                <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
                    Une question, une suggestion ou un problème ? N'hésitez pas à nous écrire !
                </Typography>

                <Formik
                    initialValues={{ name: '', email: '', subject: '', message: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, touched, errors }) => (
                        <Form>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                                <Field
                                    as={TextField}
                                    fullWidth
                                    name="name"
                                    label="Nom"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                />

                                <Field
                                    as={TextField}
                                    fullWidth
                                    name="email"
                                    label="Email"
                                    type="email"
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                />
                            </Box>

                            <Field
                                as={TextField}
                                fullWidth
                                margin="normal"
                                name="subject"
                                label="Sujet"
                                error={touched.subject && Boolean(errors.subject)}
                                helperText={touched.subject && errors.subject}
                            />

                            <Field
                                as={TextField}
                                fullWidth
                                margin="normal"
                                name="message"
                                label="Message"
                                multiline
                                rows={6}
                                error={touched.message && Boolean(errors.message)}
                                helperText={touched.message && errors.message}
                            />

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Paper>

            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={() => setOpenAlert(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setOpenAlert(false)}
                    severity={alertSeverity}
                    variant="filled"
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Contact;