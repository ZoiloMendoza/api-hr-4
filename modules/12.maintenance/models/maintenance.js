const { CrudJsonType } = helpers;
const Joi = require('joi');

module.exports = (sequelize, DataTypes) => {
  class Maintenance extends helpers.CRUDModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Maintenance.belongsTo(models.company, {
            foreignKey: 'companyId',
            as: 'company',
        });
    }
  }
  Maintenance.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    services: {
      type: new CrudJsonType(models.service, true),
      validate: {
        isValidActionsArray(value) {
            const validatorSchema = Joi.array().items(validators.service.schema);

            const { error } = validatorSchema.validate(value, {
                abortEarly: false,
            });
            if (error) {
                throw new Error(`${error.message}`);
            }
        },
      },
      defaultValue: [],
    },
    description: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  }, {
    sequelize,
    modelName: 'Maintenance',
    tableName: 'Maintenances', 
  });
  return Maintenance;
};