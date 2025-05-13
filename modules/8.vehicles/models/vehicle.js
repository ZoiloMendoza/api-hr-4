'use strict';

module.exports = (sequelize, DataTypes) => {
    class Vehicle extends helpers.CRUDModel {
        static associate(models) {
            Vehicle.belongsTo(models.operator, {
                foreignKey: 'operatorId',
                as: 'operator',
            });

            Vehicle.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });
        }
    }

    Vehicle.init(
        {
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'available', // 'available', 'unavailable', 'maintenance'
            },
            licensePlate: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            mileage: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            operatorId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Operators',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            efficiencyKmPerLiter: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: null,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
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
            modelName: 'Vehicle',
        },
    );

    return Vehicle;
};
