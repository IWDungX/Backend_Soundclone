'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('playlist_songs', {
      playlist_song_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('playlist_songs');
  },
};