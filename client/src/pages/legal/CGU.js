import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Divider,
    useTheme,
    Breadcrumbs,
    Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';

const CGU = () => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{ mb: 3 }}
                separator="›"
            >
                <Link
                    component={RouterLink}
                    to="/"
                    color="inherit"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                    }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    {t('navigation:home')}
                </Link>
                <Typography
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <GavelIcon sx={{ mr: 0.5 }} fontSize="small" />
                    {t('cgu:title')}
                </Typography>
            </Breadcrumbs>

            <Paper
                elevation={2}
                sx={{
                    p: { xs: 3, md: 5 },
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper'
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            fontSize: { xs: '2rem', md: '3rem' }
                        }}
                    >
                        {t('cgu:title')}
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        POLOBEATSPROD
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('cgu:lastUpdate', { date: new Date().toLocaleDateString() })}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Section 1 - Objet */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section1.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section1.content1')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section1.content2')}
                    </Typography>
                </Box>

                {/* Section 2 - Acceptation */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section2.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section2.content1')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section2.content2')}
                    </Typography>
                </Box>

                {/* Section 3 - Accès au site */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section3.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section3.content1')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section3.content2')}
                    </Typography>
                </Box>

                {/* Section 4 - Propriété intellectuelle */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section4.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section4.content1')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section4.content2')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section4.content3')}
                    </Typography>
                </Box>

                {/* Section 5 - Utilisation du site */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section5.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section5.content1')}
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                        <Typography component="li" variant="body1" paragraph>
                            {t('cgu:section5.restriction1')}
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            {t('cgu:section5.restriction2')}
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            {t('cgu:section5.restriction3')}
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            {t('cgu:section5.restriction4')}
                        </Typography>
                    </Box>
                </Box>

                {/* Section 6 - Données personnelles */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section6.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section6.content1')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section6.content2')}
                    </Typography>
                </Box>

                {/* Section 7 - Responsabilité */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section7.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section7.content1')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section7.content2')}
                    </Typography>
                </Box>

                {/* Section 8 - Droit applicable */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section8.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section8.content1')}
                    </Typography>
                </Box>

                {/* Section 9 - Contact */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom color="primary.main">
                        {t('cgu:section9.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('cgu:section9.content1')}
                        <Link
                            component={RouterLink}
                            to="/contact"
                            sx={{ mx: 0.5, color: 'primary.main' }}
                        >
                            {t('cgu:section9.contactLink')}
                        </Link>
                        {t('cgu:section9.content2')}
                    </Typography>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('cgu:footer.copyright', { year: new Date().getFullYear() })}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default CGU;
