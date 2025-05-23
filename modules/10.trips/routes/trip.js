const { trip, route } = models;
const { CRUDController, entityErrors } = helpers;

class TripsController extends CRUDController {
    constructor() {
        super(trip);
        this.addRelation(route, ['id']);
        this.addRoute('post', '/trip/full', async (req, res) => {
            logger.info('Creando un nuevo viaje');
            try {
                const tripData = req.input;
                const createdTrip = await this.service.createTripWithOrders(tripData);
                return res.status(201).json(createdTrip);
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(404).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new TripsController();

module.exports = myself.getApp();
