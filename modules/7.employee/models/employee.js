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
            Employee.belongsTo(models.employeetype, {
                foreignKey: 'employeeTypeId',
                as: 'employeeType',
            });
            Employee.belongsTo(models.paymenttype, {
                foreignKey: 'paymentTypeId',
                as: 'paymentType',
            });
            Employee.hasOne(models.operator, {
                foreignKey: 'employeeId',
                as: 'operator',
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
                        const validatorSchema = Joi.array().items(validators.address.schema);

                        const { error } = validatorSchema.validate(value, {
                            abortEarly: false,
                        });
                        if (error) {
                            throw new Error(`Address validation failed: ${error.message}`);
                        }
                    },
                },
                defaultValue: [],
            },
            // type: {
            //     //SE VA A ELIMINAR
            //     type: DataTypes.STRING,
            //     allowNull: false,
            //     validate: {
            //         isIn: {
            //             args: [['operator', 'operations']],
            //             msg: 'Type must be either "operator" or "operations"',
            //         },
            //     },
            // },
            employeeTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'EmployeeTypes',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            paymentTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'PaymentTypes',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            salary: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
            },
            commission: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
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
