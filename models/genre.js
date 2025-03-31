'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      Genre.belongsToMany(models.Song, {
        through: 'genre_songs',
        foreignKey: 'genre_id',
        otherKey: 'song_id',
      });
    }
  }

  Genre.init(
    {
      genre_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      genre_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Genre',
      tableName: 'genres',
      timestamps: false,
    }
  );

  return Genre;
};