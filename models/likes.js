'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {
        targetKey: 'userId',
        foreignKey: 'userId',
        onDelete: 'CASCAED',
        onUpdate: 'CASCAED',
      });
      this.belongsTo(models.Posts, {
        targetKey: 'postId',
        foreignKey: 'postId',
        onDelete: 'CASCAED',
        onUpdate: 'CASCAED',
      });
    }
  }
  Likes.init(
    {
      tableId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      postId: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'Likes',
      timestamps: false,
    }
  );
  return Likes;
};
