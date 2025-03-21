'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GenreSong extends Model {
    static associate(models) {
      GenreSong.belongsTo(models.Genre, { foreignKey: 'genre_id' });
      GenreSong.belongsTo(models.Song, { foreignKey: 'song_id' });
    }
  }

  GenreSong.init(
    {
      genre_song_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      song_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      genre_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'GenreSong',
      tableName: 'genre_songs',
      timestamps: false,
    }
  );

  return GenreSong;
};