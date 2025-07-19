// src/pages/contact/Contact.js
import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { sendContactMessage } from '../../services/contactService';
import { useTranslation } from 'react-i18next';
import {
    Container, Typography, Paper, TextField, Button,
    Snackbar, Alert, Box
} from '@mui/material';

const Contact = () => {
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const { t } = useTranslation('contact'); // Spécifier le namespace contact

    // Schéma de validation avec traductions
    const validationSchema = Yup.object({
        name: Yup.string()
            .required(t('nameRequired')),
        email: Yup.string()
            .email(t('emailInvalid'))
            .required(t('emailRequired')),
        subject: Yup.string()
            .required(t('subjectRequired')),
        message: Yup.string()
            .required(t('messageRequired'))
            .min(10, t('messageMinLength'))
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await sendContactMessage(values);
            setAlertMessage(t('messageSuccess'));
            setAlertSeverity('success');
            setOpenAlert(true);
            resetForm();
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            setAlertMessage(t('messageError'));
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
                    {t('title')}
                </Typography>

                <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
                    {t('subtitle')}
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
                                    label={t('name')}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                />

                                <Field
                                    as={TextField}
                                    fullWidth
                                    name="email"
                                    label={t('email')}
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
                                label={t('subject')}
                                error={touched.subject && Boolean(errors.subject)}
                                helperText={touched.subject && errors.subject}
                            />

                            <Field
                                as={TextField}
                                fullWidth
                                margin="normal"
                                name="message"
                                label={t('message')}
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
                                    {isSubmitting ? t('sending') : t('sendMessage')}
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