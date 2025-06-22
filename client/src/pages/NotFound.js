// src/pages/NotFound.js
import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: 'primary.main' }}>
                    404
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom>
                    Page non trouvée
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                    >
                        Retour à l'accueil
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Page précédente
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default NotFound;