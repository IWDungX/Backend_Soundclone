'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, { foreignKey: 'role_id' });
    }
  }

  RolePermission.init(
    {
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      permission_key: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'role_permissions',
      timestamps: false,
    }
  );

  return RolePermission;
};