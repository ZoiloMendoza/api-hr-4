const { trip, order } = models;
const { CRUDService, entityErrors } = helpers;

class TripsService extends CRUDService {
    constructor() {
        super(trip);
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

        return newTrip;
    }
}
module.exports = new TripsService();
