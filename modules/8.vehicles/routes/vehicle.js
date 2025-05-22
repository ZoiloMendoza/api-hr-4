const { vehicle, operator } = models;
const { CRUDController } = helpers;

class VehiclesController extends CRUDController {
    constructor() {
        super(vehicle);
        this.addRelation(operator, ['id']);
    }
}

const myself = new VehiclesController();

module.exports = myself.getApp();
