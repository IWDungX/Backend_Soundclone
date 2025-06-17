'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FollowArtist extends Model {
    static associate(models) {
      FollowArtist.belongsTo(models.User, { foreignKey: 'user_id' });
      FollowArtist.belongsTo(models.Artist, { foreignKey: 'artist_id' });
    }
  }

  FollowArtist.init(
    {
      follow_artist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      artist_id: {
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
      modelName: 'FollowArtist',
      tableName: 'follow_artists',
      timestamps: false,
    }
  );

  return FollowArtist;
};