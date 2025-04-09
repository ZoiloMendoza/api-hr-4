const { location } = models;
const { CRUDService } = helpers;

class LocationsService extends CRUDService {
    constructor() {
        super(location);
    }
}

module.exports = new LocationsService();
