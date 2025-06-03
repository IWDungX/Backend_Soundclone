'use strict';

const { DataTypes } = require('sequelize'); 

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('users', {
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
      },
      user_password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('users', ['user_google_uid']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};