const { location } = models;
const { CRUDController } = helpers;

class LocationsController extends CRUDController {
    constructor() {
        super(location);
    }
}

const myself = new LocationsController();

module.exports = myself.getApp();
