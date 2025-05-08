const { vehicle } = models;
const { CRUDController } = helpers;

class VehiclesController extends CRUDController {
    constructor() {
        super(vehicle);
    }
}

const myself = new VehiclesController();

module.exports = myself.getApp();
