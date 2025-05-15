'use strict';
module.exports = (sequelize, DataTypes) => {
    class Catalog extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Catalog.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            Catalog.hasMany(models.order, {
                foreignKey: 'serviceId',
                as: 'orders',
            });
            Catalog.hasMany(models.productorder, {
                foreignKey: 'productId',
                as: 'productsOrders',
            });
        }
    }
    Catalog.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            value: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            description: DataTypes.STRING,
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Catalog',
        },
    );
    return Catalog;
};
