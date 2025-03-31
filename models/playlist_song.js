'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaylistSong extends Model {
    static associate(models) {
      PlaylistSong.belongsTo(models.Playlist, { foreignKey: 'playlist_id' });
      PlaylistSong.belongsTo(models.Song, { foreignKey: 'song_id' });
    }
  }

  PlaylistSong.init(
    {
      playlist_song_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      playlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      song_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'PlaylistSong',
      tableName: 'playlist_songs',
      timestamps: false,
    }
  );

  return PlaylistSong;
};