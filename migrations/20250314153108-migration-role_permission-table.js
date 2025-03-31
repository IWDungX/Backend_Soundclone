'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('role_permissions', {
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      permission_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id', 'permission_key'],
      type: 'primary key',
      name: 'pk_role_permission',
    });

    await queryInterface.addIndex('role_permissions', ['role_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('role_permissions');
  },
};