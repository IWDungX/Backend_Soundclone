'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    static associate(models) {
      History.belongsTo(models.User, { foreignKey: 'user_id' });
      History.belongsTo(models.Song, { foreignKey: 'song_id' });
    }
  }

  History.init(
    {
      history_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      song_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      played_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'History',
      tableName: 'histories',
      timestamps: false,
    }
  );

  return History;
};