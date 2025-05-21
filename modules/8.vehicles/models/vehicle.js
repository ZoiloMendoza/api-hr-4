'use strict';
const { EntityNotFoundError } = require('../../../shared/helpers/entity-errors');
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

            Vehicle.associate = (models) => {
                Vehicle.hasMany(models.trip, {
                    foreignKey: 'vehicleId',
                    as: 'trips',
                });
            };
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
            modelName: 'Vehicle',
            hooks: {
                // Hook para validar antes de asignar un operador a un vehículo
                async beforeCreate(vehicle, options) {
                    if (vehicle.operatorId) {
                        const existingVehicle = await models.vehicle.findOne({
                            where: { operatorId: vehicle.operatorId, active: true },
                        });
                        if (existingVehicle) {
                            throw new EntityNotFoundError(i18n.__('El operador ya está asignado a otro vehículo.'));
                        }
                    }
                },
                async beforeUpdate(vehicle, options) {
                    if (vehicle.operatorId && vehicle.operatorId !== vehicle._previousDataValues.operatorId) {
                        const existingVehicle = await models.vehicle.findOne({
                            where: { operatorId: vehicle.operatorId, active: true },
                        });
                        if (existingVehicle) {
                            throw new EntityNotFoundError(i18n.__('El operador ya está asignado a otro vehículo.'));
                        }
                    }
                },
                // Hook para actualizar el estado del operador después de asignarlo a un vehículo
                async afterCreate(vehicle, options) {
                    if (vehicle.operatorId) {
                        const operator = await models.operator.findByPk(vehicle.operatorId, {
                            where: { active: true },
                        });
                        if (operator) {
                            await operator.update({ status: 'unavailable' });
                        }
                    }
                },
                // Hook para manejar actualizaciones en el vehículo
                async afterUpdate(vehicle, options) {
                    // Si cambia el operador, actualizar el estado del operador anterior a 'available'
                    if (vehicle.operatorId && vehicle.operatorId !== vehicle._previousDataValues.operatorId) {
                        const previousOperator = await models.operator.findByPk(
                            vehicle._previousDataValues.operatorId,
                            {
                                where: { active: true },
                            },
                        );
                        if (previousOperator) {
                            await previousOperator.update({ status: 'available' });
                        }
                    }

                    // Si se asigna un operador, actualizar su estado a 'unavailable'
                    if (vehicle.operatorId) {
                        const operator = await models.operator.findByPk(vehicle.operatorId, {
                            where: { active: true },
                        });
                        if (operator) {
                            await operator.update({ status: 'unavailable' });
                        }
                    }

                    // Si se desasigna un operador (operatorId es null), actualizar el estado del operador anterior a 'available'
                    if (!vehicle.operatorId && vehicle._previousDataValues.operatorId) {
                        const previousOperator = await models.operator.findByPk(
                            vehicle._previousDataValues.operatorId,
                            {
                                where: { active: true },
                            },
                        );
                        if (previousOperator) {
                            await previousOperator.update({ status: 'available' });
                        }
                    }
                },
            },
        },
    );

    return Vehicle;
};
