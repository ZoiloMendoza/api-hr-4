const { routesegment } = models;
const { CRUDController } = helpers;

class RoutesegmentsController extends CRUDController {
    constructor() {
        super(routesegment);
    }
}

const myself = new RoutesegmentsController();

module.exports = myself.getApp();
