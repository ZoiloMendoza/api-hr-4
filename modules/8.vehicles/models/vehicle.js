'use strict';
const { EntityNotFoundError } = require('../../../shared/helpers/entity-errors');
const { Op } = require('sequelize');
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

            Vehicle.hasMany(models.trip, {
                foreignKey: 'vehicleId',
                as: 'trips',
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
                unique: true,
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
            vehicleYear: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            vehicleDescription: {
                type: DataTypes.STRING,
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
            modelName: 'Vehicle'
        },
    );

    return Vehicle;
};
