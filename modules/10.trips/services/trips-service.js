const { trip, order, triplog } = models;
const { CRUDService, entityErrors } = helpers;

class TripsService extends CRUDService {
    constructor() {
        super(trip);
        this.statusOrder = ['documenting', 'emptyInTransit', 'loading', 'loadedInTransit', 'unloading', 'finished'];
    }

    async createTripWithOrders(tripData) {
        const { orders, ...tripDetails } = tripData;

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
            },
        });

        if (existingOrders.length !== orders.length) {
            throw new entityErrors.GenericError('Algunos pedidos no están disponibles, seleccione otros');
        }

        // Generar el tripCode único
        const lastTrip = await trip.findOne({
            order: [['id', 'DESC']],
        });

        const lastCode = lastTrip ? parseInt(lastTrip.tripCode.split('-')[1], 10) : 0;
        const newCode = lastCode + 1;
        const tripCode = `Her-${newCode.toString().padStart(3, '0')}`; // Formato Her-001

        const newTrip = await this.create({ ...tripDetails, tripCode });

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

        await models.triplog.create({
            tripId: newTrip.id,
            status: 'documenting',
        });

        return newTrip;
    }

    async changeTripStatus(tripId, newStatus) {
        // Validar que el nuevo status sea válido
        if (!this.statusOrder.includes(newStatus)) {
            throw new entityErrors.ValidationError(`El estado "${newStatus}" no es válido`);
        }

        // Obtener el registro actual del viaje
        const tripRecord = await trip.findByPk(tripId);
        if (!tripRecord || !tripRecord.active) {
            throw new entityErrors.EntityNotFoundError(`El viaje con ID ${tripId} no existe`);
        }

        // Validar que el cambio de estado sea permitido
        const currentStatus = tripRecord.status;
        const currentIndex = this.statusOrder.indexOf(currentStatus);
        const newIndex = this.statusOrder.indexOf(newStatus);

        if (newIndex !== currentIndex + 1) {
            throw new entityErrors.ValidationError(
                `No se puede cambiar el estado de "${currentStatus}" a "${newStatus}". Debe seguir el orden: ${this.statusOrder.join(
                    ' -> ',
                )}`,
            );
        }

        // Actualizar el estado del viaje
        tripRecord.status = newStatus;
        await tripRecord.save();

        // Actualizar o registrar el cambio en triplog
        const [logEntry] = await triplog.findOrCreate({
            where: {
                tripId: tripRecord.id,
                status: newStatus,
            },
            defaults: {
                active: true,
            },
        });

        // Actualizar la fecha de modificación si el registro ya existía
        if (!logEntry.isNewRecord) {
            logEntry.updatedAt = new Date();
            await logEntry.save();
        }

        return tripRecord.toJSON();
    }
}
module.exports = new TripsService();
