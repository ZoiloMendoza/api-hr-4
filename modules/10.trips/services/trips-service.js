const { trip } = models;
const { CRUDService } = helpers;

class TripsService extends CRUDService {
    constructor() {
        super(trip);
    }
}
module.exports = new TripsService();
