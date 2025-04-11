const { route } = models;
const { CRUDController } = helpers;

class RoutesController extends CRUDController {
    constructor() {
        super(route);
    }
}

const myself = new RoutesController();

module.exports = myself.getApp();
