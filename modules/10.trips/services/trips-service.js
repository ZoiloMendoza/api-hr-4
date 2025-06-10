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
        await tripRecord.save();

        if (services.auditlogService) {
            const loggedUser = this.getLoggedUser();
            await services.auditlogService.createLog({
                entityName: 'trip',
                entityId: tripRecord.id,
                action: 'update',
                oldData: { status: previousStatus },
                newData: { status: newStatus },
                userId: loggedUser.id,
                username: loggedUser.username,
                companyId: loggedUser.company.id,
            });
        }

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
        const currentTrip = await this._readById(id);
        if (data.vehicleId && data.vehicleId !== currentTrip.vehicleId) {
            await this.validateVehicleAndOperator(data.vehicleId);
        }
        return super.update(id, data);
    }
}
module.exports = new TripsService();
