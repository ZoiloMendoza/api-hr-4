'use strict';
module.exports = (sequelize, DataTypes) => {
  class UserRole extends helpers.CRUDModel {
    static associate(models) {
      
    }
  }
  UserRole.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserRole',
  });
  return UserRole;
};