// models/ContactMessage.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import Production from './Production.js';

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  production_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Production,
      key: 'id'
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'read'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'contact_messages',
  timestamps: false,
  underscored: true
});

// Association avec Production
ContactMessage.belongsTo(Production, { foreignKey: 'production_id', as: 'production' });

// Méthodes statiques
ContactMessage.findUnread = async function() {
  return await ContactMessage.findAll({
    where: { read: false },
    order: [['created_at', 'DESC']]
  });
};

ContactMessage.markAsRead = async function(id) {
  const message = await ContactMessage.findByPk(id);
  if (message) {
    message.read = true;
    await message.save();
    return true;
  }
  return false;
};

export default ContactMessage;
