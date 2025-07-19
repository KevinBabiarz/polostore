// src/pages/DiagnosticPage.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Divider } from '@mui/material';
import { getProductions } from '../services/productionService';
import { getImageUrl, getAudioUrl } from '../utils/fileUtils';
import { useTranslation } from 'react-i18next';

const DiagnosticPage = () => {
    const [productions, setProductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await getProductions(1, { limit: 3 });
                setProductions(result.productions || result);
            } catch (error) {
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const testAudio = (url) => {
        const audio = new Audio(url);
        audio.play().then(() => {
            console.log('✅ Audio joué avec succès:', url);
        }).catch(err => {
            console.error('❌ Erreur audio:', url, err);
        });
    };

    if (loading) return <div>{t('diagnostic.loading')}</div>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>{t('diagnostic.title')}</Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">{t('diagnostic.environment')}</Typography>
                <Typography>{t('diagnostic.nodeEnv')}: {process.env.NODE_ENV || 'development'}</Typography>
                <Typography>{t('diagnostic.baseUrl')}: {process.env.NODE_ENV === 'production' ? 'https://polostore-production.up.railway.app' : 'http://localhost:5050'}</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {productions.map((production) => {
                const originalImageUrl = production.image_url;
                const originalAudioUrl = production.audio_url;
                const processedImageUrl = getImageUrl(originalImageUrl);
                const processedAudioUrl = getAudioUrl(originalAudioUrl);

                return (
                    <Card key={production.id} sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6">🎵 {production.title}</Typography>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">📸 {t('diagnostic.imageUrls')}:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('diagnostic.original')}: {originalImageUrl || 'null'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('diagnostic.processed')}: {processedImageUrl || 'null'}
                                </Typography>

                                {processedImageUrl && (
                                    <Box sx={{ mt: 1 }}>
                                        <img
                                            src={processedImageUrl}
                                            alt="Test"
                                            style={{ maxWidth: '100px', height: 'auto' }}
                                            onLoad={() => console.log('✅ Image chargée:', processedImageUrl)}
                                            onError={(e) => console.error('❌ Erreur image:', processedImageUrl, e)}
                                        />
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">🎵 {t('diagnostic.audioUrls')}:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('diagnostic.original')}: {originalAudioUrl || 'null'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('diagnostic.processed')}: {processedAudioUrl || 'null'}
                                </Typography>

                                {processedAudioUrl && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => testAudio(processedAudioUrl)}
                                        sx={{ mt: 1 }}
                                    >
                                        🔊 {t('diagnostic.testAudio')}
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">🔗 {t('diagnostic.directTestUrls')}:</Typography>
                                {processedImageUrl && (
                                    <Typography variant="body2">
                                        <a href={processedImageUrl} target="_blank" rel="noopener noreferrer">
                                            {t('diagnostic.openImage')}
                                        </a>
                                    </Typography>
                                )}
                                {processedAudioUrl && (
                                    <Typography variant="body2">
                                        <a href={processedAudioUrl} target="_blank" rel="noopener noreferrer">
                                            {t('diagnostic.openAudio')}
                                        </a>
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Container>
    );
};

export default DiagnosticPage;
