'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('songs', {
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('songs');
  },
};