
module.exports = (sequelize, DataTypes) => {
    class Client extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Client.belongsTo(models.Company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            Client.hasMany(models.User, {
                foreignKey: 'clientId',
                as: 'users',
            });
        }
    }
    Client.init(
        {
            name: DataTypes.STRING,
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
            modelName: 'Client',
        },
    );
    return Client;
};
