'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('genre_songs', {
      genre_song_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      song_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      genre_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('genre_songs');
  },
};