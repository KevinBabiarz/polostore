// models/Production.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Production = sequelize.define('Production', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  artist: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  audio_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'productions',
  timestamps: false,
  underscored: true,
  // Optimisation des requêtes Sequelize avec tous les index
  indexes: [
    { fields: ['title'] },
    { fields: ['artist'] },
    { fields: ['genre'] },
    { fields: ['created_at'] }
  ]
});

// Méthodes statiques optimisées comme dans le modèle User
Production.findByGenre = async function(genre) {
  try {
    return await Production.findAll({
      where: { genre },
      order: [['created_at', 'DESC']]
    });
  } catch (error) {
    console.error("[PRODUCTION MODEL] Erreur lors de la recherche par genre:", error);
    return [];
  }
};

Production.findLatest = async function(limit = 10) {
  try {
    return await Production.findAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("[PRODUCTION MODEL] Erreur lors de la récupération des productions récentes:", error);
    return [];
  }
};

Production.findByArtist = async function(artist) {
  try {
    return await Production.findAll({
      where: { artist },
      order: [['created_at', 'DESC']]
    });
  } catch (error) {
    console.error("[PRODUCTION MODEL] Erreur lors de la recherche par artiste:", error);
    return [];
  }
};

export default Production;
