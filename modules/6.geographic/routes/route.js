const { route, segment } = models;
const { CRUDController } = helpers;

class RoutesController extends CRUDController {
    constructor() {
        super(route);
        this.addRelation(segment, ['id']);
    }
}

module.exports = new RoutesController();
