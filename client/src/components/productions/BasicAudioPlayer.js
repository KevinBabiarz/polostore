import React from 'react';

/**
 * Lecteur audio HTML5 natif ultra-basique
 */
const BasicAudioPlayer = ({ audioFile }) => {
  // Assurez-vous que le chemin est correctement formaté
  const getAudioPath = () => {
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (audioFile && audioFile.startsWith('http')) {
      return audioFile;
    }

    // Si commence par /api, utiliser tel quel
    if (audioFile && audioFile.startsWith('/api')) {
      return audioFile;
    }

    // Sinon, construire l'URL avec le nom du fichier
    if (audioFile) {
      const fileName = audioFile.split('/').pop();
      return `/api/uploads/${fileName}`;
    }

    return '';
  };

  return (
    <>
      {audioFile ? (
        <audio
          controls
          style={{ width: '100%' }}
          preload="metadata"
          controlsList="nodownload"
        >
          <source src={getAudioPath()} type="audio/wav" />
          <source src={getAudioPath()} type="audio/mpeg" />
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      ) : (
        <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
          Aucun fichier audio disponible
        </div>
      )}
    </>
  );
};

export default BasicAudioPlayer;
