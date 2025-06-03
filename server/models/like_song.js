'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LikeSong extends Model {
    static associate(models) {
      LikeSong.belongsTo(models.User, { foreignKey: 'user_id' });
      LikeSong.belongsTo(models.Song, { foreignKey: 'song_id' });
    }
  }

  LikeSong.init(
    {
      like_song_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      song_id: {
        type: DataTypes.UUID,
        allowNull: false,

      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'LikeSong',
      tableName: 'like_songs',
      timestamps: false,
    }
  );

  return LikeSong;
};