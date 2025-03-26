"use strict";
module.exports = (sequelize, DataTypes) => {
  class Role extends helpers.CRUDModel {
    static associate(models) {
      Role.belongsToMany(models.user, {
        through: "UserRole", 
        foreignKey: "roleId",
        otherKey: "userId", 
        as: "users"
      });
    }
  }
  Role.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true  // Setting default value to true
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true  // Setting default value to true
      }  
    },
    {
      sequelize,
      modelName: "Role",
    }
  );
  return Role;
};
