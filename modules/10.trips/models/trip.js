'use strict';
module.exports = (sequelize, DataTypes) => {
    class Trip extends helpers.CRUDModel {
        static associate(models) {
            // Relación con Route
            Trip.belongsTo(models.route, {
                foreignKey: 'routeId',
                as: 'route',
            });

            // Relación con Vehicle
            Trip.belongsTo(models.vehicle, {
                foreignKey: 'vehicleId',
                as: 'vehicle',
            });

            // Relación con Company
            Trip.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });

            Trip.hasMany(models.order, {
                foreignKey: 'tripId',
                as: 'orders',
            });

            Trip.hasMany(models.evidence, {
                foreignKey: 'tripId',
                as: 'evidences',
            });

            Trip.hasMany(models.triplog, {
                foreignKey: 'tripId',
                as: 'statusHistory',
            });
        }
    }

    Trip.init(
        {
            tripCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, // El folio debe ser único
            },
            routeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Routes', // Nombre de la tabla de rutas
                    key: 'id', // Columna referenciada
                },
                onUpdate: 'CASCADE', // Actualiza automáticamente si cambia el ID en la tabla referenciada
                onDelete: 'RESTRICT',
            },
            vehicleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Vehicles', // Nombre de la tabla de vehículos
                    key: 'id', // Columna referenciada
                },
                onUpdate: 'CASCADE', // Actualiza automáticamente si cambia el ID en la tabla referenciada
                onDelete: 'RESTRICT',
            },
            teleVia: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            totalKm: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            mealsAmount: {
                // Monto por comida
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            tollBoothsAmount: {
                // Monto por casetas
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            lodgingAmount: {
                // Monto por hospedaje
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            transitAmount: {
                // Monto por tránsito
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            handlingAmount: {
                // Monto por maniobras
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            fuelAmount: {
                // Monto por combustible
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            pendingExpenses: {
                // Gastos pendientes
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'documenting',
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
            creationDate: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'Trip',
            hooks: {
                async afterCreate(trip, options) {
                    if (trip.vehicleId) {
                        const vehicle = await models.vehicle.findByPk(trip.vehicleId, {
                            where: { active: true },
                        });
                        if (vehicle) {
                            await vehicle.update({ status: 'unavailable' });
                        }
                    }
                },
                async afterUpdate(trip, options) {
                    // Si el vehículo se ha cambiado, actualiza el estado del vehículo anterior
                    if (trip.vehicleId && trip.vehicleId !== trip._previousDataValues.vehicleId) {
                        if (trip._previousDataValues.vehicleId) {
                            const prevVehicle = await models.vehicle.findByPk(trip._previousDataValues.vehicleId, {
                                where: { active: true },
                            });
                            if (prevVehicle) {
                                await prevVehicle.update({ status: 'available' });
                            }
                        }

                        const newVehicle = await models.vehicle.findByPk(trip.vehicleId, {
                            where: { active: true },
                        });
                        if (newVehicle) {
                            await newVehicle.update({ status: 'unavailable' });
                        }
                    }

                    // If vehicle removed
                    if (!trip.vehicleId && trip._previousDataValues.vehicleId) {
                        const prevVehicle = await models.vehicle.findByPk(trip._previousDataValues.vehicleId, {
                            where: { active: true },
                        });
                        if (prevVehicle) {
                            await prevVehicle.update({ status: 'available' });
                        }
                    }

                    // If trip deactivated
                    if (
                        trip.active === false &&
                        trip._previousDataValues.active === true &&
                        trip._previousDataValues.vehicleId
                    ) {
                        const vehicle = await models.vehicle.findByPk(trip._previousDataValues.vehicleId, {
                            where: { active: true },
                        });
                        if (vehicle) {
                            await vehicle.update({ status: 'available' });
                        }
                    }
                },
            },
        },
    );
    return Trip;
};
