const { CrudJsonType } = helpers;
const Joi = require('joi');
const { DATE } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ServiceOrder extends helpers.CRUDModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ServiceOrder.belongsTo(models.maintenance, {
        foreignKey: 'maintenanceId',
        as: 'maintenance',
      });
      ServiceOrder.belongsTo(models.vehicle, {
        foreignKey: 'vehicleId',
        as: 'vehicle',
      });
      ServiceOrder.belongsTo(models.company, {
        foreignKey: 'companyId',
        as: 'company',
      });
    }
  }
  ServiceOrder.init({
    folio: {
      type: DataTypes.STRING,
      unique: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    vehicleMileage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      comment: 'Kilometraje del vehiculo al momento de abrir la orden de servicio',
    },
    spareParts: {
      type: new CrudJsonType(models.sparepart, true),
      defaultValue: [],
      comment: 'Lista de refacciones y/o productos comprados',
    },
    serviceRefId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplier: {
      type: DataTypes.STRING,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('open', 'released', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
  }, {
    sequelize,
    modelName: 'ServiceOrder',
    tableName: 'ServiceOrders', 
  });
  return ServiceOrder;
};