'use strict';

module.exports = (sequelize, DataTypes) => {
    class Operator extends helpers.CRUDModel {
        static associate(models) {
            // Relación con Employee
            Operator.belongsTo(models.employee, {
                foreignKey: 'employeeId',
                as: 'employee',
            });
        }
    }

    Operator.init(
        {
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Employees',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'available', // 'available', 'unavailable', 'maintenance'
            },
            licenseNumber: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            licenseExpiry: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            debt: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Operator',
        },
    );

    return Operator;
};
