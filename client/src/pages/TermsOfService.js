import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Divider,
    useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
    const { t } = useTranslation('cgu'); // Utiliser le namespace 'cgu'
    const theme = useTheme();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 3, md: 4 },
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                    borderRadius: 2
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    color="primary"
                    sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        mb: 3
                    }}
                >
                    {t('title')}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
                    {t('lastUpdated')}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Introduction */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                        {t('introduction.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('introduction.content')}
                    </Typography>
                </Box>

                {/* Services */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                        {t('services.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('services.content')}
                    </Typography>
                </Box>

                {/* Propriété intellectuelle */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                        {t('intellectualProperty.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('intellectualProperty.content')}
                    </Typography>
                </Box>

                {/* Utilisation acceptable */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                        {t('acceptableUse.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('acceptableUse.content')}
                    </Typography>
                </Box>

                {/* Achats et paiements */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                        {t('purchases.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('purchases.content')}
                    </Typography>
                </Box>

                {/* Limitation de responsabilité */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                        {t('liability.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('liability.content')}
                    </Typography>
                </Box>

                {/* Contact */}
                <Box>
                    <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                        {t('contact.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('contact.content')}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default TermsOfService;
