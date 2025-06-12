const { trip, order, triplog } = models;
const { CRUDService, entityErrors } = helpers;

class TripsService extends CRUDService {
    constructor() {
        super(trip);
        this.statusOrder = [
            'documenting',
            'emptyInTransit',
            'loading',
            'loadedInTransit',
            'unloading',
            'returningEmpty',
            'finished',
        ];
        this.statusOrder_ = [
            'documentando',
            'vacío en tránsito',
            'cargando',
            'cargado en tránsito',
            'descargando',
            'regresando vacío',
            'finalizado',
        ];
    }

    async createTripWithOrders(tripData, user) {
        const { vehicleId, orders, ...tripDetails } = tripData;

        const loggedUser = user;
        if (!loggedUser) {
            throw new entityErrors.GenericError('Usuario no encontrado');
        }

        await this.validateVehicleAndOperator(vehicleId);

        if (!Array.isArray(orders) || orders.length === 0) {
            throw new entityErrors.GenericError('Debe tener al menos un pedido');
        }

        const duplicateOrderIds = orders.filter((id, index) => orders.indexOf(id) !== index);
        if (duplicateOrderIds.length > 0) {
            throw new entityErrors.GenericError(
                `El viaje no puede tener pedidos duplicados. IDs duplicados: ${[...new Set(duplicateOrderIds)].join(
                    ', ',
                )}`,
            );
        }

        const existingOrders = await order.findAll({
            where: {
                id: orders,
                status: 'pending',
                active: true,
                tripId: null,
            },
        });

        const invalidOrder = existingOrders.length !== orders.length;

        if (invalidOrder) {
            throw new entityErrors.GenericError('Algunos pedidos no están disponibles');
        }

        // Generar el tripCode único
        const lastTrip = await trip.findOne({
            order: [['id', 'DESC']],
        });

        const lastCode = lastTrip ? parseInt(lastTrip.tripCode.split('-')[1], 10) : 0;
        const newCode = lastCode + 1;
        const tripCode = `Her-${newCode.toString().padStart(3, '0')}`; // Formato Her-001

        const newTrip = await this.create({ ...tripDetails, tripCode, vehicleId });

        if (vehicleId) {
            const vehicle = await models.vehicle.findByPk(vehicleId, {
                where: { active: true },
            });
            if (vehicle) {
                const oldStatus = vehicle.status;
                await vehicle.update({ status: 'unavailable' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'vehicle',
                        entityId: vehicle.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'unavailable' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        await order.update(
            {
                tripId: newTrip.id, // Asignar el ID del viaje
                status: 'assigned', // Cambiar el estado a 'assigned'
            },
            {
                where: {
                    id: orders,
                },
            },
        );

        if (services.auditlogService) {
            for (const ord of existingOrders) {
                await services.auditlogService.createLog({
                    entityName: 'order',
                    entityId: ord.id,
                    action: 'update',
                    oldData: { status: ord.status, tripId: ord.tripId },
                    newData: { status: 'assigned', tripId: newTrip.id },
                    userId: loggedUser.id,
                    username: loggedUser.username,
                    companyId: loggedUser.company.id,
                });
            }
        }

        const tripLogs = this.statusOrder.map((status, index) => ({
            tripId: newTrip.id,
            status,
        }));

        await triplog.bulkCreate(tripLogs);

        return newTrip;
    }

    async changeTripStatus(tripId, newStatus, user) {
        // Validar que el nuevo status sea válido
        if (!this.statusOrder.includes(newStatus)) {
            throw new entityErrors.ValidationError(`El estado "${newStatus}" no es válido`);
        }

        // Obtener el registro actual del viaje
        const tripRecord = await trip.findByPk(tripId);
        if (!tripRecord || !tripRecord.active) {
            throw new entityErrors.EntityNotFoundError(`El viaje con ID ${tripId} no existe`);
        }

        const loggedUser = user;
        if (!loggedUser) {
            throw new entityErrors.GenericError('Usuario no encontrado');
        }

        // Verificar si los estados están registrados en `triplog`
        const existingLogs = await triplog.findAll({
            where: {
                tripId,
                active: true,
            },
        });

        const existingStatuses = existingLogs.map((log) => log.status);

        // Registrar los estados faltantes si no están en `triplog`
        const missingStatuses = this.statusOrder.filter((status) => !existingStatuses.includes(status));
        if (missingStatuses.length > 0) {
            const missingLogs = missingStatuses.map((status) => ({
                tripId,
                status,
            }));
            await triplog.bulkCreate(missingLogs);
        }

        // Validar que el cambio de estado sea permitido
        const currentStatus = tripRecord.status;
        const currentIndex = this.statusOrder.indexOf(currentStatus);
        const newIndex = this.statusOrder.indexOf(newStatus);

        if (newIndex !== currentIndex + 1) {
            // Obtener mensaje personalizado para el error de transición
            const customMessage = `No se puede cambiar el estado. Debe seguir el orden: ${this.statusOrder_.join(
                ' -> ',
            )}`;

            throw new entityErrors.GenericError(customMessage);
        }

        // Actualizar el estado del viaje
        const previousStatus = tripRecord.status;
        tripRecord.status = newStatus;
        await this.update(tripId, { status: newStatus });
        // Actualizar la fecha de modificación en `triplog` para el nuevo estado
        const logEntry = await triplog.findOne({
            where: {
                tripId: tripRecord.id,
                status: newStatus,
                active: true,
            },
        });

        if (!logEntry) {
            throw new entityErrors.GenericError(`No se encontró el registro para el estado "${newStatus}"`);
        }

        // Actualizar el campo `status` (y automáticamente `updatedAt`)
        await logEntry.update({ statusUpdatedAt: new Date() });

        return tripRecord.toJSON();
    }

    async validateVehicleAndOperator(vehicleId) {
        const vehicle = await models.vehicle.findOne({
            where: {
                id: vehicleId,
            },
            include: [
                {
                    model: models.operator,
                    as: 'operator',
                },
            ],
        });

        if (!vehicle || !vehicle.active) {
            throw new entityErrors.EntityNotFoundError(`El vehículo con ID ${vehicleId} no existe o no está activo`);
        }

        if (vehicle.status !== 'available') {
            throw new entityErrors.EntityNotFoundError(`El vehículo con ID ${vehicleId} no está disponible`);
        }

        if (!vehicle.operator || !vehicle.operator.active) {
            throw new entityErrors.EntityNotFoundError(
                `El vehículo con ID ${vehicleId} no tiene un operador asignado o el operador no está activo`,
            );
        }

        return vehicle;
    }

    async update(id, data) {
        const loggedUser = this.getLoggedUser();
        if (this.hasCompany) {
            data.companyId = loggedUser.company.id;
        }

        const tripRecord = await this._readById(id);

        if (data.vehicleId && data.vehicleId !== tripRecord.vehicleId) {
            await this.validateVehicleAndOperator(data.vehicleId);
        }

        const previousData = { ...tripRecord.dataValues };

        await tripRecord.update(data);

        if (services.auditlogService) {
            await services.auditlogService.createLog({
                entityName: 'trip',
                entityId: tripRecord.id,
                action: 'update',
                oldData: previousData,
                newData: tripRecord.dataValues,
                userId: loggedUser.id,
                username: loggedUser.username,
                companyId: loggedUser.company.id,
            });
        }

        // Vehicle status updates
        const prevVehicleId = previousData.vehicleId;
        const newVehicleId = tripRecord.vehicleId;

        if (prevVehicleId && prevVehicleId !== newVehicleId) {
            const prevVehicle = await models.vehicle.findByPk(prevVehicleId, {
                where: { active: true },
            });
            if (prevVehicle) {
                const oldStatus = prevVehicle.status;
                await prevVehicle.update({ status: 'available' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'vehicle',
                        entityId: prevVehicle.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'available' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        if (newVehicleId && newVehicleId !== prevVehicleId) {
            const newVehicle = await models.vehicle.findByPk(newVehicleId, {
                where: { active: true },
            });
            if (newVehicle) {
                const oldStatus = newVehicle.status;
                await newVehicle.update({ status: 'unavailable' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'vehicle',
                        entityId: newVehicle.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'unavailable' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        if (!newVehicleId && prevVehicleId) {
            const prevVehicle = await models.vehicle.findByPk(prevVehicleId, {
                where: { active: true },
            });
            if (prevVehicle) {
                const oldStatus = prevVehicle.status;
                await prevVehicle.update({ status: 'available' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'vehicle',
                        entityId: prevVehicle.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'available' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        if (previousData.active === true && tripRecord.active === false && previousData.vehicleId) {
            const vehicle = await models.vehicle.findByPk(previousData.vehicleId, {
                where: { active: true },
            });
            if (vehicle) {
                const oldStatus = vehicle.status;
                await vehicle.update({ status: 'available' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'vehicle',
                        entityId: vehicle.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'available' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        if (tripRecord.status === 'finished' && previousData.status !== 'finished') {
            if (tripRecord.vehicleId) {
                const vehicle = await models.vehicle.findByPk(tripRecord.vehicleId, {
                    where: { active: true },
                });
                if (vehicle) {
                    const oldStatus = vehicle.status;
                    await vehicle.update({ status: 'available' });
                    if (services.auditlogService) {
                        await services.auditlogService.createLog({
                            entityName: 'vehicle',
                            entityId: vehicle.id,
                            action: 'update',
                            oldData: { status: oldStatus },
                            newData: { status: 'available' },
                            userId: loggedUser.id,
                            username: loggedUser.username,
                            companyId: loggedUser.company.id,
                        });
                    }
                }
            }

            const ordersToUpdate = await order.findAll({
                where: { tripId: tripRecord.id, active: true },
            });

            for (const ord of ordersToUpdate) {
                const oldStatus = ord.status;
                await ord.update({ status: 'delivered' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'order',
                        entityId: ord.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'delivered' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        const updatedTrip = await this._readById(id);
        return this.toJson(updatedTrip);

    }
}
module.exports = new TripsService();
