const {CrudJsonType} = helpers;

module.exports = (sequelize, DataTypes) => {
    class Client extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Client.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            Client.hasMany(models.user, {
                foreignKey: 'clientId',
                as: 'users',
            });
        }
    }
    const Address = require('./address')(sequelize, DataTypes);

    Client.init(
        {
            name: DataTypes.STRING,
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            addresses: {
                type: new CrudJsonType(Address, true),
                validate: {
                    isValidAddressesArray(value) {
                        const validator = Address.getValidator();
                        const { error } = validator.schema.validate(value, { abortEarly: false });
                        if (error) {
                          throw new Error(`Address validation failed: ${error.message}`);
                        }
                
                     }
                }
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
