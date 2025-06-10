const { trip, route, triplog } = models;
const { CRUDController, entityErrors } = helpers;

class TripsController extends CRUDController {
    constructor() {
        super(trip);
        this.addRelation(route, ['id']);
        this.addRelation(triplog, ['id']);

        this.addRoute('post', '/trip/full', async (req, res) => {
            logger.info('Creando un nuevo viaje');
            try {
                const tripData = req.input;
                const createdTrip = await this.service.createTripWithOrders(tripData, req.user);
                return res.status(201).json(createdTrip);
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(400).json([error.message]);
                }
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });

        this.addRoute('put', '/trip/:id/status', async (req, res) => {
            logger.info(`Actualizando el estado del viaje con ID ${req.params.id}`);
            try {
                const tripId = req.params.id;
                const { status: newStatus } = req.input;

                const updatedTrip = await this.service.changeTripStatus(tripId, newStatus, req.user);
                return res.status(200).json(updatedTrip);
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(400).json([error.message]);
                }
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new TripsController();

module.exports = myself.getApp();
