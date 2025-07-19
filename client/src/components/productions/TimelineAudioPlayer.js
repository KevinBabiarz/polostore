import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    IconButton,
    Typography,
    Slider,
    useTheme
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    VolumeUp
} from '@mui/icons-material';

// Variable globale pour gérer quel lecteur est en cours de lecture
let currentPlayingAudio = null;

const TimelineAudioPlayer = ({ src, onTimeUpdate }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const audioRef = useRef(null);
    const theme = useTheme();

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !src) {
            setIsLoading(false);
            setHasError(false);
            return;
        }

        // Réinitialiser les états
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setIsLoading(true);
        setHasError(false);

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
            setIsLoading(false);
            setHasError(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (onTimeUpdate) {
                onTimeUpdate(audio.currentTime, audio.duration);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (currentPlayingAudio === audio) {
                currentPlayingAudio = null;
            }
        };

        const handleError = () => {
            setIsLoading(false);
            setHasError(true);
            setIsPlaying(false);
            console.error('Erreur lors du chargement audio:', src);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
            setHasError(false);
        };

        // Ajouter les event listeners
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('canplay', handleCanPlay);

        // Forcer le chargement
        audio.load();

        return () => {
            if (audio) {
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('ended', handleEnded);
                audio.removeEventListener('error', handleError);
                audio.removeEventListener('canplay', handleCanPlay);
            }
        };
    }, [src, onTimeUpdate]);

    const togglePlayPause = async () => {
        const audio = audioRef.current;
        if (!audio || isLoading || hasError || !src) return;

        try {
            if (isPlaying) {
                // Pause l'audio actuel
                audio.pause();
                setIsPlaying(false);
                if (currentPlayingAudio === audio) {
                    currentPlayingAudio = null;
                }
            } else {
                // Arrêter l'audio précédent s'il y en a un
                if (currentPlayingAudio && currentPlayingAudio !== audio) {
                    currentPlayingAudio.pause();
                }

                // Jouer le nouvel audio
                currentPlayingAudio = audio;
                await audio.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Erreur lors de la lecture:', error);
            setIsPlaying(false);
            setHasError(true);
            if (currentPlayingAudio === audio) {
                currentPlayingAudio = null;
            }
        }
    };

    // Surveiller si un autre lecteur commence à jouer
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const checkIfStillPlaying = () => {
            if (currentPlayingAudio !== audio && isPlaying) {
                setIsPlaying(false);
            }
        };

        const interval = setInterval(checkIfStillPlaying, 500);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleTimelineClick = (event, newValue) => {
        const audio = audioRef.current;
        if (!audio || !duration || isLoading || hasError) return;

        const newTime = (newValue / 100) * duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (event, newValue) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newVolume = newValue / 100;
        audio.volume = newVolume;
        setVolume(newVolume);
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Si pas de source audio
    if (!src) {
        return (
            <Box sx={{ width: '100%', p: 1, pb: 0, opacity: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    Aucun fichier audio
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 0.5, pb: 0 }}>
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
            />

            {/* Contrôles principaux avec timeline - version compacte */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 0.3
            }}>
                <IconButton
                    onClick={togglePlayPause}
                    disabled={isLoading || hasError || !src}
                    size="small"
                    sx={{
                        bgcolor: hasError ? theme.palette.error.main : theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                            bgcolor: hasError ? theme.palette.error.dark : theme.palette.primary.dark,
                        },
                        '&:disabled': {
                            bgcolor: theme.palette.grey[300],
                        },
                        width: 28,
                        height: 28
                    }}
                >
                    {isLoading ? (
                        <Box
                            sx={{
                                width: 14,
                                height: 14,
                                border: `2px solid white`,
                                borderTop: `2px solid transparent`,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' }
                                }
                            }}
                        />
                    ) : isPlaying ? (
                        <Pause fontSize="small" />
                    ) : (
                        <PlayArrow fontSize="small" />
                    )}
                </IconButton>

                <Typography variant="caption" color="text.secondary" sx={{ minWidth: '30px', fontSize: '0.65rem' }}>
                    {formatTime(currentTime)}
                </Typography>

                <Box sx={{ flexGrow: 1, mx: 0.5 }}>
                    <Slider
                        value={progressPercentage}
                        onChange={handleTimelineClick}
                        sx={{
                            color: hasError ? theme.palette.error.main : theme.palette.primary.main,
                            height: 3,
                            '& .MuiSlider-thumb': {
                                width: 10,
                                height: 10,
                                '&:hover, &.Mui-focusVisible': {
                                    boxShadow: `0px 0px 0px 6px ${hasError ? theme.palette.error.main : theme.palette.primary.main}20`,
                                },
                            },
                            '& .MuiSlider-rail': {
                                color: theme.palette.grey[300],
                                opacity: 1,
                            },
                        }}
                        disabled={!duration || isLoading || hasError}
                    />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ minWidth: '30px', fontSize: '0.65rem' }}>
                    {formatTime(duration)}
                </Typography>

                {/* Contrôle du volume intégré dans la ligne principale */}
                <VolumeUp sx={{ fontSize: 12, color: 'text.secondary', ml: 0.5 }} />
                <Slider
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    sx={{
                        width: 35,
                        height: 2,
                        color: theme.palette.grey[400],
                        '& .MuiSlider-thumb': {
                            width: 6,
                            height: 6,
                        },
                        '& .MuiSlider-rail': {
                            color: theme.palette.grey[200],
                        },
                    }}
                    disabled={hasError || !src}
                />
            </Box>

            {/* Message d'erreur compact si nécessaire */}
            {hasError && (
                <Box sx={{ color: 'error.main', mt: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                    Erreur de lecture audio
                </Box>
            )}
        </Box>
    );
};

export default TimelineAudioPlayer;
