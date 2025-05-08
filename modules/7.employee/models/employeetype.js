'use strict';

module.exports = (sequelize, DataTypes) => {
    class EmployeeType extends helpers.CRUDModel {
        static associate(models) {
            EmployeeType.hasMany(models.employee, {
                foreignKey: 'employeeTypeId',
                as: 'employees',
            });

            EmployeeType.hasMany(models.paymenttype, {
                foreignKey: 'employeeTypeId',
                as: 'paymentTypes',
            });
        }
    }

    EmployeeType.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Companies',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            sequelize,
            modelName: 'EmployeeType',
        },
    );

    return EmployeeType;
};
