const { trip } = models;
const { CRUDController } = helpers;

class TripsController extends CRUDController {
    constructor() {
        super(trip);
    }
}

const myself = new TripsController();

module.exports = myself.getApp();
