module.exports = (sequelize, DataTypes) => {
    class Country extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Country.hasMany(models.company, {
                foreignKey: 'companyId',
                as: 'companies',
            });
            Country.hasMany(models.direction, {
                foreignKey: 'idCountry',
                as: 'directions',
            });
        }
    }

    Country.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING(10),
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
            modelName: 'Country',
        },
    );

    return Country;
};
