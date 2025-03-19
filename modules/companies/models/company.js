'use strict';
module.exports = (sequelize, DataTypes) => {
    class Company extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Company.hasMany(models.User, {
                foreignKey: 'companyId',
                as: 'users',
            });
            Company.hasMany(models.Catalog, {
                foreignKey: 'companyId',
                as: 'catalogs',
            });
            Company.hasMany(models.Parameter, {
                foreignKey: 'companyId',
                as: 'parameters',
            });
        }
    }
    Company.init(
        {
            name: DataTypes.STRING,
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
