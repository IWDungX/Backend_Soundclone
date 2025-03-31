'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Playlist, { foreignKey: 'user_id' });
      User.belongsToMany(models.Artist, {
        through: 'follow_artists',
        foreignKey: 'user_id',
        otherKey: 'artist_id',
      });
      User.belongsToMany(models.Song, {
        through: 'histories',
        foreignKey: 'user_id',
        otherKey: 'song_id',
      });
      User.belongsToMany(models.Song, {
        through: 'like_songs',
        foreignKey: 'user_id',
        otherKey: 'song_id',
      });
      User.belongsToMany(models.Role, {
        through: 'user_roles',
        foreignKey: 'user_id',
        otherKey: 'role_id',
      });
    }
  }

  User.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_google_uid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      user_avatar_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verification_token: {
        type: DataTypes.STRING,
        allowNull: true, 
        field: 'verification_token',
     },
      user_password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
    }
  );

  return User;
};