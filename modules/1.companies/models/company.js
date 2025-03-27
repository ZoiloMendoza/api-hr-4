'use strict';
module.exports = (sequelize, DataTypes) => {
    class Company extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Company.hasMany(models.user, {
                foreignKey: 'companyId',
                as: 'users',
            });
            Company.hasMany(models.catalog, {
                foreignKey: 'companyId',
                as: 'catalogs',
            });
            Company.hasMany(models.parameter, {
                foreignKey: 'companyId',
                as: 'parameters',
            });
        }
    }
    Company.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            urlBase: {
                type: DataTypes.STRING(255),
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Company',
        },
    );
    return Company;
};
