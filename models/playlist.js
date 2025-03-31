'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, { foreignKey: 'user_id' });
      Playlist.belongsToMany(models.Song, {
        through: 'playlist_songs',
        foreignKey: 'playlist_id',
        otherKey: 'song_id',
      });
    }
  }

  Playlist.init(
    {
      playlist_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      playlist_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Playlist',
      tableName: 'playlists',
      timestamps: false,
    }
  );

  return Playlist;
};