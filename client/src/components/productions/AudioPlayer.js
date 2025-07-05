import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, Slider } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff } from '@mui/icons-material';

/**
 * Composant de lecteur audio amélioré
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.audioUrl - L'URL du fichier audio à lire
 * @param {function} props.onPlayStateChange - Callback appelé lors du changement d'état de lecture
 */
const AudioPlayer = ({ audioUrl, onPlayStateChange = () => {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef(null);

  // Formatage de l'URL audio pour garantir qu'elle fonctionne
  const getFormattedAudioUrl = () => {
    if (!audioUrl) return '';

    // Si URL complète avec http, utiliser telle quelle
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }

    // Pour les chemins locaux, utiliser /uploads/ avec le nom de fichier complet
    // Ne jamais supprimer le timestamp du nom du fichier
    const fileName = audioUrl.split('/').pop();

    // Si le chemin commence déjà par /uploads/, l'utiliser tel quel
    if (audioUrl.startsWith('/uploads/')) {
      return audioUrl;
    }

    // Corriger: ne plus supporter /api/uploads/ car le serveur sert sur /uploads/
    if (audioUrl.startsWith('/api/uploads/')) {
      return audioUrl.replace('/api/uploads/', '/uploads/');
    }

    // Sinon, construire le chemin complet
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
    console.log("AudioPlayer: URL reçue:", audioUrl);
    if (!audioUrl) {
      console.warn("AudioPlayer: Aucune URL audio fournie");
      setError("Aucun fichier audio disponible");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    const audioElement = audioRef.current;
    if (!audioElement) return;

    // S'assurer que l'audio est arrêté avant de changer la source
    if (!audioElement.paused) {
      audioElement.pause();
    }

    const formattedUrl = getFormattedAudioUrl();
    console.log("AudioPlayer: URL formatée:", formattedUrl);

    // Préparer les gestionnaires d'événements
    const handleLoadedMetadata = () => {
      console.log("AudioPlayer: Métadonnées chargées, durée:", audioElement.duration);
      setDuration(audioElement.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleCanPlayThrough = () => {
      console.log("AudioPlayer: Prêt à jouer");
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
      setProgress((audioElement.currentTime / audioElement.duration) * 100);
    };

    const handleEnded = () => {
      console.log("AudioPlayer: Lecture terminée");
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      onPlayStateChange(false);
    };

    const handleError = (e) => {
      console.error('AudioPlayer: Erreur de lecture audio:', e, audioElement.error);
      let errorMessage = "Erreur lors du chargement de l'audio";

      if (audioElement.error) {
        switch (audioElement.error.code) {
          case 1: errorMessage = "Lecture interrompue"; break;
          case 2: errorMessage = "Erreur réseau"; break;
          case 3: errorMessage = "Format de fichier non supporté"; break;
          case 4: errorMessage = "Fichier audio corrompu ou non trouvé"; break;
          default: errorMessage = `Erreur: ${audioElement.error.message || 'inconnue'}`;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
      onPlayStateChange(false);
    };

    // Configuration initiale de l'audio
    audioElement.src = formattedUrl;
    audioElement.load();

    // Ajouter les écouteurs d'événements
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    // Fonction de nettoyage
    return () => {
      console.log("AudioPlayer: Nettoyage des écouteurs d'événements");
      audioElement.pause();
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [audioUrl, onPlayStateChange]);

  // Gérer la lecture/pause
  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (!audioUrl) {
      console.warn("AudioPlayer: Tentative de lecture sans URL audio");
      return;
    }

    if (isPlaying) {
      console.log("AudioPlayer: Pause");
      audioElement.pause();
      setIsPlaying(false);
      onPlayStateChange(false);
    } else {
      console.log("AudioPlayer: Lecture");

      const playPromise = audioElement.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          onPlayStateChange(true);
        }).catch(err => {
          console.error('AudioPlayer: Erreur de lecture:', err);
          setError("Impossible de lire l'audio. Vérifiez votre connexion ou réessayez.");
          setIsPlaying(false);
          onPlayStateChange(false);
        });
      }
    }
  };

  // Gérer le mute/unmute
  const toggleMute = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newMuteState = !isMuted;
    audioElement.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  // Mettre à jour la position de lecture
  const handleProgressChange = (e, newValue) => {
    if (!audioRef.current || duration <= 0) return;

    const audioElement = audioRef.current;
    const newTime = (newValue / 100) * duration;

    audioElement.currentTime = newTime;
    setProgress(newValue);
    setCurrentTime(newTime);
  };

  return (
    <Box sx={{ width: '100%', my: 1, bgcolor: 'background.paper', p: 1.5, borderRadius: 2 }}>
      {error && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}

      {isLoading && !error && (
        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
          Chargement de l'audio...
        </Typography>
      )}

      <audio ref={audioRef} preload="metadata" />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={togglePlay}
            size="small"
            color={isPlaying ? "primary" : "default"}
            disabled={!audioUrl || !!error || isLoading}
            sx={{ mr: 1 }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <IconButton
            onClick={toggleMute}
            size="small"
            disabled={!audioUrl || !!error || isLoading}
            sx={{ mr: 1 }}
          >
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
        </Box>

        <Typography variant="caption" sx={{ minWidth: 80, textAlign: 'right' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>

      <Slider
        value={progress}
        onChange={handleProgressChange}
        disabled={!audioUrl || !!error || duration <= 0 || isLoading}
        aria-labelledby="audio-progress-slider"
        size="small"
        sx={{
          height: 4,
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            '&:hover, &.Mui-focusVisible, &.Mui-active': {
              boxShadow: '0px 0px 0px 8px rgba(33, 150, 243, 0.16)',
            },
          },
        }}
      />

      {audioUrl && !error && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
          Fichier: {audioUrl.split('/').pop()}
        </Typography>
      )}
    </Box>
  );
};

export default AudioPlayer;
