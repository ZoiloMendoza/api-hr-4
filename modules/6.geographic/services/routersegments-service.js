const { routesegment } = models;
const { CRUDService } = helpers;

class RoutesegmentsService extends CRUDService {
    constructor() {
        super(routesegment);
    }
}

module.exports = new RoutesegmentsService();
