const { CrudJsonType } = helpers;
const Joi = require('joi');

module.exports = (sequelize, DataTypes) => {
    class Employee extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Employee.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            Employee.belongsTo(models.user, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }

    Employee.init(
        {
            rfc: {
                type: DataTypes.STRING,
                unique: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phoneMobile: {
                type: DataTypes.STRING,
            },
            phoneOffice: {
                type: DataTypes.STRING,
            },
            addresses: {
                type: new CrudJsonType(models.address, true),
                validate: {
                    isValidAddressesArray(value) {
                        const validatorSchema = Joi.array().items(
                            validators.address.schema,
                        );

                        const { error } = validatorSchema.validate(value, {
                            abortEarly: false,
                        });
                        if (error) {
                            throw new Error(
                                `Address validation failed: ${error.message}`,
                            );
                        }
                    },
                },
                defaultValue: [],
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isIn: {
                        args: [['operator', 'operations']],
                        msg: 'Type must be either "operator" or "operations"',
                    },
                },
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Employee',
        },
    );

    return Employee;
};
