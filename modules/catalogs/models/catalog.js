'use strict';
module.exports = (sequelize, DataTypes) => {
    class Catalog extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Catalog.belongsTo(models.Company, {
                foreignKey: 'companyId',
                as: 'company',
            });
        }
    }
    Catalog.init(
        {
            name: DataTypes.STRING,
            value: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            description: DataTypes.STRING,
            type: DataTypes.STRING,
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
