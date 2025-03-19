"use strict";

module.exports = (sequelize, DataTypes) => {
  class Parameter extends helpers.CRUDModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Parameter.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
      });
    }
  }
  Parameter.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure the name field is unique
      },
      value:  {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Parameter",
    }
  );
  return Parameter;
};
