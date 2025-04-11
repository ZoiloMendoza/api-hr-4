const { route } = models;
const { CRUDService } = helpers;

class RoutesService extends CRUDService {
    constructor() {
        super(route);
    }
}

module.exports = new RoutesService();
