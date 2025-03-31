'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      Song.belongsTo(models.Artist, { foreignKey: 'artist_id' });
      Song.belongsTo(models.Genre, { foreignKey: 'genre_id' });
      Song.belongsToMany(models.Playlist, {
        through: 'playlist_songs',
        foreignKey: 'song_id',
        otherKey: 'playlist_id',
      });
      Song.belongsToMany(models.User, {
        through: 'like_songs',
        foreignKey: 'song_id',
        otherKey: 'user_id',
      });
      Song.belongsToMany(models.User, {
        through: 'histories',
        foreignKey: 'song_id',
        otherKey: 'user_id',
      });
      Song.belongsToMany(models.Genre, {
        through: 'genre_songs',
        foreignKey: 'song_id',
        otherKey: 'genre_id',
      });
    }
  }

  Song.init(
    {
      song_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      song_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      artist_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      song_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      song_audio_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      genre_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      song_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      song_createAt:{
        type: DataTypes.DATE(),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Song',
      tableName: 'songs',
      timestamps: false,
    }
  );

  return Song;
};