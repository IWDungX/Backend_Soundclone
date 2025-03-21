'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Artist extends Model {
    static associate(models) {
      Artist.belongsToMany(models.User, {
        through: 'follow_artists',
        foreignKey: 'artist_id',
        otherKey: 'user_id',
      });
      Artist.hasMany(models.Song, { foreignKey: 'artist_id' });
    }
  }

  Artist.init(
    {
      artist_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Artist',
      tableName: 'artists',
      timestamps: false,
    }
  );

  return Artist;
};