'use strict';
module.exports = (sequelize, DataTypes) => {
    class PaymentType extends helpers.CRUDModel {
        static associate(models) {
            PaymentType.belongsTo(models.employeetype, {
                foreignKey: 'employeeTypeId',
                as: 'employeeType',
            });
            PaymentType.hasMany(models.employee, {
                foreignKey: 'paymentTypeId',
                as: 'employees',
            });
        }
    }

    PaymentType.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            employeeTypeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'EmployeeTypes',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'PaymentType',
        },
    );

    return PaymentType;
};
