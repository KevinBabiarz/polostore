import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, Slider, LinearProgress, useTheme } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff, MusicNote } from '@mui/icons-material';

/**
 * Composant de lecteur audio compact pour les cartes de production
 */
const CompactAudioPlayer = ({ audioUrl, onPlayStateChange = () => {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef(null);
  const theme = useTheme();

  // Formatage de l'URL audio
  const getFormattedAudioUrl = () => {
    if (!audioUrl) return '';

    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }

    const fileName = audioUrl.split('/').pop();

    if (audioUrl.startsWith('/uploads/')) {
      return audioUrl;
    }

    if (audioUrl.startsWith('/api/uploads/')) {
      return audioUrl;
    }

    return `/uploads/${fileName}`;
  };

  // Format time in minutes and seconds
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Gérer le chargement de l'audio
  useEffect(() => {
    if (!audioUrl) {
      setError("Aucun fichier audio disponible");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (!audioElement.paused) {
      audioElement.pause();
    }

    const formattedUrl = getFormattedAudioUrl();

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
      setProgress((audioElement.currentTime / audioElement.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      onPlayStateChange(false);
    };

    const handleError = (e) => {
      let errorMessage = "Fichier audio indisponible";
      if (audioElement.error) {
        switch (audioElement.error.code) {
          case 2: errorMessage = "Erreur réseau"; break;
          case 3: errorMessage = "Format non supporté"; break;
          case 4: errorMessage = "Fichier introuvable"; break;
          default: errorMessage = "Erreur audio";
        }
      }
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
      onPlayStateChange(false);
    };

    audioElement.src = formattedUrl;
    audioElement.load();

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.pause();
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [audioUrl, onPlayStateChange]);

  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl || isLoading) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      onPlayStateChange(false);
    } else {
      // Réinitialiser la position si la lecture est terminée
      if (audioElement.ended) {
        audioElement.currentTime = 0;
      }

      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          onPlayStateChange(true);
        }).catch(err => {
          console.error('Erreur de lecture:', err);
          setError("Impossible de lire l'audio");
          setIsPlaying(false);
          onPlayStateChange(false);
        });
      } else {
        // Fallback pour les navigateurs plus anciens
        setIsPlaying(true);
        onPlayStateChange(true);
      }
    }
  };

  const toggleMute = () => {
    const audioElement = audioRef.current;
    if (!audioElement || isLoading) return;
    const newMuteState = !isMuted;
    audioElement.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  const handleProgressChange = (e, newValue) => {
    if (!audioRef.current || duration <= 0 || isLoading) return;
    const audioElement = audioRef.current;
    const newTime = (newValue / 100) * duration;
    audioElement.currentTime = newTime;
    setProgress(newValue);
    setCurrentTime(newTime);
  };

  if (error) {
    return (
      <Box sx={{
        p: 1.5,
        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5
      }}>
        <MusicNote sx={{
          fontSize: 20,
          color: theme.palette.mode === 'dark' ? 'grey.500' : 'grey.400',
          opacity: 0.7
        }} />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.mode === 'dark' ? 'grey.400' : 'grey.600',
            fontSize: '0.7rem',
            fontWeight: 'medium'
          }}
        >
          Pas d'audio disponible
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      bgcolor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 2,
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
      p: 1,
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.04)',
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-1px)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <audio ref={audioRef} preload="metadata" />

      {isLoading ? (
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            size="small"
            sx={{
              height: 3,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: theme.palette.primary.main
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 0.5,
              color: theme.palette.text.secondary,
              fontSize: '0.65rem'
            }}
          >
            Chargement...
          </Typography>
        </Box>
      ) : (
        <Slider
          value={progress}
          onChange={handleProgressChange}
          size="small"
          sx={{
            height: 4,
            mb: 1,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              opacity: isPlaying ? 1 : 0.7,
              bgcolor: theme.palette.primary.main,
              border: `2px solid ${theme.palette.background.paper}`,
              '&:hover, &.Mui-active': {
                width: 16,
                height: 16,
                boxShadow: `0 0 0 8px ${theme.palette.primary.main}20`
              }
            },
            '& .MuiSlider-track': {
              height: 4,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main
            },
            '& .MuiSlider-rail': {
              height: 4,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'
            },
          }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            onClick={togglePlay}
            size="small"
            disabled={!!error || isLoading}
            sx={{
              width: 28,
              height: 28,
              bgcolor: isPlaying ? theme.palette.primary.main : 'transparent',
              color: isPlaying ? 'white' : theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}`,
              '&:hover': {
                bgcolor: theme.palette.primary.main,
                color: 'white',
                transform: 'scale(1.1)'
              },
              '&:disabled': {
                bgcolor: 'transparent',
                color: theme.palette.text.disabled,
                borderColor: theme.palette.text.disabled
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
          </IconButton>

          <IconButton
            onClick={toggleMute}
            size="small"
            disabled={!!error || isLoading}
            sx={{
              width: 24,
              height: 24,
              color: isMuted ? theme.palette.error.main : theme.palette.text.secondary,
              '&:hover': {
                color: isMuted ? theme.palette.error.dark : theme.palette.text.primary,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
          </IconButton>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            color: theme.palette.text.secondary,
            fontFamily: 'monospace',
            minWidth: '50px',
            textAlign: 'right',
            fontWeight: 'medium'
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>
    </Box>
  );
};

export default CompactAudioPlayer;
