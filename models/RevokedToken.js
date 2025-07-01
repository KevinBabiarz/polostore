// models/RevokedToken.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const RevokedToken = sequelize.define('RevokedToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tokenId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'JTI (JWT ID) du token révoqué'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID de l\'utilisateur propriétaire du token'
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date d\'expiration originale du token'
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Raison de la révocation (logout, ban, suppression compte, etc.)'
    }
}, {
    tableName: 'revoked_tokens',
    timestamps: true,
    indexes: [
        {
            fields: ['tokenId']
        },
        {
            fields: ['userId']
        },
        {
            fields: ['expiresAt']
        }
    ]
});

export default RevokedToken;
