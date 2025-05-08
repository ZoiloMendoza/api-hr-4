const { vehicle } = models;
const { CRUDService } = helpers;

class VehiclesService extends CRUDService {
    constructor() {
        super(vehicle);
    }
}
module.exports = new VehiclesService();
