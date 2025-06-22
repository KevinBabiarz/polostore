// models/Favorite.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import User from './User.js';
import Production from './Production.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  production_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Production,
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'favorites',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'production_id']
    }
  ]
});

// Associations
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Favorite.belongsTo(Production, { foreignKey: 'production_id', as: 'production' });

// Méthodes statiques
Favorite.getUserFavorites = async function(userId) {
  return await Favorite.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Production,
        as: 'production'
      }
    ]
  });
};

Favorite.checkFavorite = async function(userId, productionId) {
  const favorite = await Favorite.findOne({
    where: {
      user_id: userId,
      production_id: productionId
    }
  });
  return !!favorite;
};

export default Favorite;
