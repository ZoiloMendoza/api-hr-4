const {CrudJsonType} = helpers;
const Joi = require('joi');

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

    Client.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rfc: {
                type: DataTypes.STRING,
            },
            addresses: {
                type: new CrudJsonType(models.address, true),
                validate: {
                    isValidAddressesArray(value) {
                        const validatorSchema = Joi.array().items(validators.address.schema);

                        const { error } = validatorSchema.validate(value, { abortEarly: false });
                        if (error) {
                          throw new Error(`Address validation failed: ${error.message}`);
                        }
                
                     }
                },
                defaultValue: []
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
