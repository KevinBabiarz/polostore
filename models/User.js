// models/User.js
import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/sequelize.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'user',
    field: 'role'
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_admin' // S'assurer que Sequelize utilise exactement ce nom de colonne
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active' // S'assurer que Sequelize utilise exactement ce nom de colonne
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  // Optimisation des requêtes Sequelize
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] }
  ]
});

// Méthodes d'instance optimisées
User.prototype.validatePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Erreur lors de la validation du mot de passe");
    return false;
  }
};

// Méthodes statiques optimisées
User.findByEmail = async function(email) {
  if (!email) return null;
  try {
    return await User.findOne({
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'is_admin', 'created_at'] // Sélectionnez uniquement les colonnes nécessaires
    });
  } catch (error) {
    console.error("Erreur lors de la recherche par email");
    return null;
  }
};

User.findByUsername = async function(username) {
  if (!username) return null;
  try {
    return await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'email', 'password', 'is_admin', 'created_at']
    });
  } catch (error) {
    console.error("Erreur lors de la recherche par nom d'utilisateur");
    return null;
  }
};

export default User;
