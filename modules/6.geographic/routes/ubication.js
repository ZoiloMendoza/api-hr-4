const { ubication } = models;
const { CRUDController } = helpers;

class UbicationsController extends CRUDController {
    constructor() {
        super(ubication);
    }
}

const myself = new UbicationsController();

module.exports = myself.getApp();
