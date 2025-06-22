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
  timestamps: false, // car nous utilisons created_at manuellement
  underscored: true
});

// Méthodes statiques
Production.findByGenre = async function(genre) {
  return await Production.findAll({ where: { genre } });
};

Production.findLatest = async function(limit = 10) {
  return await Production.findAll({
    order: [['created_at', 'DESC']],
    limit
  });
};

export default Production;
